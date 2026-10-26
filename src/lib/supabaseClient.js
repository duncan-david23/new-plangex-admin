import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yjspgiriedmhwsfjloin.supabase.co';
const supabaseAnonKey = 'sb_publishable_91TKebW0bmz4ViHNHEc5MQ_qlNFw3CO';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);