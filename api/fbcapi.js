export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let body
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }

  const { pixel_id, access_token, events } = body
  if (!pixel_id || !access_token || !events?.length) {
    return new Response(JSON.stringify({ error: 'Missing pixel_id, access_token or events' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = { data: events }
  if (body.test_event_code) payload.test_event_code = body.test_event_code

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${encodeURIComponent(access_token)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
  )

  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
