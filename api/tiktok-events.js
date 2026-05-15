export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let body
  try { body = await req.json() } catch { return new Response('Invalid JSON', { status: 400 }) }

  const { pixel_code, access_token, events } = body
  if (!pixel_code || !access_token || !events?.length) {
    return new Response(JSON.stringify({ error: 'Missing pixel_code, access_token or events' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const batch = events.map(ev => ({
    event:      ev.event_name,
    event_time: ev.event_time ?? Math.floor(Date.now() / 1000),
    event_id:   ev.event_id,
    user: {
      ip:         ev.user_data?.client_ip_address ?? '0.0.0.0',
      user_agent: ev.user_data?.client_user_agent ?? '',
    },
    properties: {
      currency:     ev.custom_data?.currency ?? 'BRL',
      value:        String(ev.custom_data?.value ?? 0),
      content_type: 'product',
    },
    page: { url: ev.event_source_url ?? '' },
  }))

  const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token':  access_token,
    },
    body: JSON.stringify({ pixel_code, batch }),
  })

  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
