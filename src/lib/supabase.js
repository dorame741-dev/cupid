import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadPhoto(file, folder = 'photos') {
  const ext = file.name?.split('.').pop() || 'jpg'
  const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage.from('site-photos').upload(name, file)
  if (error) throw error
  const { data: urlData } = supabase.storage.from('site-photos').getPublicUrl(data.path)
  return urlData.publicUrl
}

// Convert a blob: or data: URL to a public Supabase Storage URL
export async function uploadFromPreview(preview, folder = 'photos') {
  if (!preview) return null
  if (preview.startsWith('http')) return preview
  const res = await fetch(preview)
  const blob = await res.blob()
  const ext = blob.type.split('/')[1] || 'jpg'
  const file = new File([blob], `photo.${ext}`, { type: blob.type })
  return uploadPhoto(file, folder)
}

// Upsert site data — always with paid: false initially
export async function saveSite(phone, quizData) {
  const { data, error } = await supabase
    .from('sites')
    .upsert({ phone, quiz_data: quizData, paid: false }, { onConflict: 'phone' })
    .select()
    .single()
  if (error) throw error
  return data
}

// Mark a site as paid
export async function markPaid(phone) {
  const { error } = await supabase
    .from('sites')
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq('phone', phone)
  if (error) throw error
}

// Get a single site by phone
export async function getSite(phone) {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()
  if (error) throw error
  return data
}

// Get all sites (admin only)
export async function getAllSites() {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
