import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oqwdweprxbbrcnyrsbpq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_wcGMJZie73uffyOZpIcfoQ_ZrsAceR-'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)