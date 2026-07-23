/**
 * Plain fetch — deliberately NOT the dashboard's axios instance, which carries
 * a staff bearer token and redirects to /login on 401. The widget authenticates
 * with the business's widget key and lives on someone else's website.
 */
export function createApi(baseUrl, widgetKey) {
  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Widget-Key': widgetKey,
        ...(options.headers ?? {}),
      },
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      const error = new Error(body?.message ?? 'Request failed')
      error.status = response.status
      throw error
    }

    return body?.data
  }

  return {
    bootstrap: () => request('/widget/bootstrap'),
    chat: (message, conversationToken) =>
      request('/widget/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          conversation_token: conversationToken || undefined,
        }),
      }),
  }
}
