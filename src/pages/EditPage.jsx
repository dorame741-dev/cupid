import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getSite } from '../lib/supabase'

export default function EditPage() {
  const { phone } = useParams()

  useEffect(() => {
    getSite(phone)
      .then(site => {
        const base = site?.quiz_data || {}
        sessionStorage.setItem('editData', JSON.stringify({ ...base, __editPhone: phone }))
        window.location.href = '/'
      })
      .catch(() => { window.location.href = '/' })
  }, [phone])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0208',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid #2d1b4e',
        borderTop: '3px solid #a855f7',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#9ca3af', fontSize: 15, margin: 0 }}>Carregando seu presente...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
