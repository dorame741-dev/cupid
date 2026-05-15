export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)
  const target = 'https://api.pushinpay.com.br' + url.pathname.replace('/api/pushinpay', '') + url.search

  const headers = new Headers(req.headers)
  headers.delete('host')

  const res = await fetch(target, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    duplex: 'half',
  })

  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  })
}
