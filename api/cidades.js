export const config = { runtime: 'edge' }

let cached = null

export default async function handler(req) {
  if (cached) {
    return new Response(cached, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
    })
  }

  const res = await fetch(
    'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome',
    { headers: { 'Accept': 'application/json' } }
  )

  if (!res.ok) return new Response('Erro', { status: 500 })

  const data = await res.json()

  const cities = data.map(c => ({
    label: `${c.nome} - ${c.microrregiao.mesorregiao.UF.sigla}`,
    name: c.nome,
    uf: c.microrregiao.mesorregiao.UF.sigla,
  }))

  cached = JSON.stringify(cities)

  return new Response(cached, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
  })
}
