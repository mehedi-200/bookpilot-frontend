import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plug, CheckCircle2, AlertCircle, Wrench } from 'lucide-react'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { Input, Select } from '@/components/Field'
import Switch from '@/components/Switch'
import Spinner from '@/components/Spinner'
import { useToast } from '@/components/Toast'
import { integrationService } from '@/services/integrationService'
import { friendlyDateTime } from '@/utils/dates'

export default function Integrations() {
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: integration, isLoading } = useQuery({
    queryKey: ['integration', 'garageflow'],
    queryFn: integrationService.get,
  })

  const [baseUrl, setBaseUrl] = useState('')
  const [token, setToken] = useState('')
  const [mechanicId, setMechanicId] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    if (!integration) return
    setBaseUrl(integration.base_url ?? '')
    setMechanicId(integration.default_mechanic_id ?? '')
    setEnabled(integration.enabled)
  }, [integration])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['integration', 'garageflow'] })

  const saveMutation = useMutation({
    mutationFn: (overrides = {}) => {
      const mechanics = queryClient.getQueryData(['gf-mechanics']) ?? []
      const chosen = mechanics.find((m) => String(m.id) === String(mechanicId))
      return integrationService.update({
        base_url: baseUrl,
        api_token: token || '',
        default_mechanic_id: mechanicId || null,
        default_mechanic_name: chosen?.name ?? integration?.default_mechanic_name ?? null,
        enabled,
        ...overrides,
      })
    },
    onSuccess: () => {
      setToken('')
      invalidate()
      toast.success('Integration saved')
    },
    onError: (err) =>
      toast.error(err.response?.data?.errors?.base_url?.[0] ?? 'Could not save the integration'),
  })

  const testMutation = useMutation({
    // Save first — you can't test credentials the server hasn't been given.
    mutationFn: async () => {
      await saveMutation.mutateAsync({})
      return integrationService.test()
    },
    onSuccess: (result) => {
      setTestResult({ ok: true, message: result.message })
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['gf-mechanics'] })
    },
    onError: (err) =>
      setTestResult({
        ok: false,
        message: err.response?.data?.message ?? 'Could not reach GarageFlow',
      }),
  })

  const { data: mechanics } = useQuery({
    queryKey: ['gf-mechanics'],
    queryFn: integrationService.mechanics,
    enabled: !!integration?.has_token && !!integration?.base_url,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={24} />
      </div>
    )
  }

  const connected = integration?.last_ok_at && !integration?.last_error

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Wrench size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">GarageFlow</p>
            <p className="text-sm text-ink-muted">
              Confirmed bookings are created as service jobs in your GarageFlow.
            </p>
            <StatusLine integration={integration} connected={connected} />
          </div>
        </div>
      </Card>

      <Card title="Connection">
        <div className="space-y-4">
          <Input
            label="GarageFlow URL"
            placeholder="https://garage.example.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            hint="The address you use to open GarageFlow, without /api."
          />
          <Input
            label="API token"
            type="password"
            placeholder={integration?.has_token ? integration.masked_token : 'Paste a GarageFlow API token'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            hint={
              integration?.has_token
                ? 'A token is saved. Leave blank to keep it.'
                : 'Log in to GarageFlow as an admin and create an API token.'
            }
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              loading={testMutation.isPending}
              disabled={!baseUrl}
              onClick={() => {
                setTestResult(null)
                testMutation.mutate()
              }}
            >
              <Plug size={15} /> Test connection
            </Button>

            {testResult && (
              <span
                className={`flex items-center gap-1.5 text-sm ${
                  testResult.ok ? 'text-ok' : 'text-danger'
                }`}
              >
                {testResult.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                {testResult.message}
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card title="Job defaults">
        <Select
          label="Assign new jobs to"
          value={mechanicId}
          onChange={(e) => setMechanicId(e.target.value)}
          hint="GarageFlow requires a mechanic on every service job."
          disabled={!mechanics}
        >
          <option value="">
            {mechanics ? 'Choose a mechanic…' : 'Test the connection to load mechanics'}
          </option>
          {(mechanics ?? []).map((mechanic) => (
            <option key={mechanic.id} value={mechanic.id}>
              {mechanic.name}
              {mechanic.role ? ` · ${mechanic.role}` : ''}
            </option>
          ))}
        </Select>
      </Card>

      <Card title="Sync">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">
              {enabled ? 'Syncing confirmed bookings' : 'Sync is off'}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {enabled
                ? 'Each booking you confirm is sent to GarageFlow as a service job.'
                : 'Turn this on once the connection test passes and a mechanic is chosen.'}
            </p>
          </div>
          <Switch
            checked={enabled}
            label="Enable GarageFlow sync"
            disabled={!connected || !mechanicId}
            onChange={setEnabled}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          Save changes
        </Button>
      </div>
    </div>
  )
}

function StatusLine({ integration, connected }) {
  if (!integration?.base_url) {
    return <p className="mt-2 text-sm text-ink-muted">Not configured yet.</p>
  }

  if (integration.last_error) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm text-danger">
        <AlertCircle size={15} /> {integration.last_error}
      </p>
    )
  }

  if (connected) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm text-ok">
        <CheckCircle2 size={15} />
        Connected — last successful call {friendlyDateTime(integration.last_ok_at)}
      </p>
    )
  }

  return <p className="mt-2 text-sm text-ink-muted">Not tested yet.</p>
}
