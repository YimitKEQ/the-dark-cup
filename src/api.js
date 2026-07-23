async function req (method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).error || '' } catch { /* body not json */ }
    throw new Error(detail || `${method} ${url} failed (${res.status})`)
  }
  return res.json()
}

export const api = {
  data: () => req('GET', '/api/data'),
  create: (col, item) => req('POST', `/api/${col}`, item),
  update: (col, id, item) => req('PUT', `/api/${col}/${id}`, item),
  remove: (col, id) => req('DELETE', `/api/${col}/${id}`),
  importAll: (doc) => req('POST', '/api/import', doc)
}
