export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()

  const res = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  const data = await res.text()

  return new Response(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
