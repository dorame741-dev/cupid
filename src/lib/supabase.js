import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null

export async function uploadPhoto(file, folder = 'photos') {
  if (!supabase) throw new Error('Supabase não configurado')
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
  if (!supabase) throw new Error('Supabase não configurado')
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
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase
    .from('sites')
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq('phone', phone)
  if (error) throw error
}

// Get a single site by phone
export async function getSite(phone) {
  if (!supabase) throw new Error('Supabase não configurado')
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
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// App config (pixel ID etc.) — requires table: create table app_config (key text primary key, value text);
export async function getAppConfig(key) {
  if (!supabase) return null
  try {
    const { data } = await supabase.from('app_config').select('value').eq('key', key).maybeSingle()
    return data?.value || null
  } catch { return null }
}

export async function setAppConfig(key, value) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.from('app_config').upsert({ key, value }, { onConflict: 'key' })
  if (error) throw error
}

// Track quiz step visits for funnel analytics
// Requires: create table funnel_events (id bigint generated always as identity primary key, step text not null, created_at timestamptz default now());
export async function trackStep(step) {
  if (!supabase) return
  try { await supabase.from('funnel_events').insert({ step }) } catch {}
}

export async function getFunnelEvents(from, to) {
  if (!supabase) return []
  try {
    const { data } = await supabase.from('funnel_events').select('step, created_at')
      .gte('created_at', from.toISOString()).lte('created_at', to.toISOString())
    return data || []
  } catch { return [] }
}

// Create a free (already paid) site link for a phone number
export async function createFreeLink(phone) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.from('sites').upsert(
    { phone, quiz_data: { freeLink: true }, paid: true, paid_at: new Date().toISOString() },
    { onConflict: 'phone' }
  )
  if (error) throw error
}
