import { supabase } from '../../../../lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('test_connection')
    .select('*');

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}
