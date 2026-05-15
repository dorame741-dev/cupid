export const config = { runtime: 'edge' }

export default async function handler(req) {
  const url = new URL(req.url)

  // path passed as ?path=/api/pix/cashIn or derived from URL
  const pathParam = url.searchParams.get('path')
  const pathFromUrl = url.pathname.replace('/api/pushinpay', '')
  const apiPath = pathParam || pathFromUrl || ''

  // rebuild target, forwarding any query params except 'path'
  url.searchParams.delete('path')
  const qs = url.search
  const target = 'https://api.pushinpay.com.br' + apiPath + qs

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
