import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

let cachedCities = null

function normalize(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

async function loadCities() {
  if (cachedCities) return cachedCities
  const res = await fetch('/cidades.json')
  if (!res.ok) throw new Error('Falha ao carregar')
  cachedCities = await res.json()
  return cachedCities
}

export default function CitySearch({ value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [cities, setCities] = useState([])
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | error | ready
  const wrapperRef = useRef(null)

  useEffect(() => {
    setStatus('loading')
    loadCities()
      .then(c => { setCities(c); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    if (!query.trim() || status !== 'ready') { setResults([]); return }
    const q = normalize(query)
    const filtered = cities.filter(c => normalize(c.label).includes(q)).slice(0, 10)
    setResults(filtered)
  }, [query, cities, status])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (city) => {
    setQuery(city.label)
    onChange(city.label)
    setOpen(false)
  }

  const showDropdown = open && query.trim().length > 0

  return (
    <div ref={wrapperRef} className="relative">
      <label className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 border-2 border-transparent focus-within:border-purple-300 transition-colors cursor-text">
        <MapPin
          size={20}
          style={{
            color: query.trim() ? '#7C3AED' : '#6B7280',
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          placeholder="Busque sua cidade..."
          className="flex-1 outline-none text-[15px] text-gray-800 placeholder-gray-400 bg-transparent"
          value={query}
          autoComplete="off"
          onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        {status === 'loading' && (
          <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin shrink-0" />
        )}
      </label>

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
          {status === 'error' && (
            <p className="text-[13px] text-red-400 text-center px-4 py-3">Erro ao carregar cidades. Verifique sua conexão.</p>
          )}
          {status === 'ready' && results.length === 0 && (
            <p className="text-[13px] text-gray-400 text-center px-4 py-3">Nenhuma cidade encontrada</p>
          )}
          {results.map((city, i) => (
            <button
              key={i}
              onMouseDown={() => select(city)}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-purple-50 border-b border-gray-50 last:border-0 transition-colors active:bg-purple-100"
            >
              <MapPin size={13} className="text-purple-400 shrink-0" />
              <span className="text-[14px] font-semibold text-gray-800">{city.name}</span>
              <span className="text-[12px] text-gray-400 ml-auto font-medium">{city.uf}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
