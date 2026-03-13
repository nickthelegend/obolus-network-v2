import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data: pools, error } = await supabase
            .from('pools')
            .select('*')
            .order('pool_type', { ascending: false })

        if (error) throw error

        // Map database fields to the expected UI format if necessary
        // In this case, we'll just return the database records directly.
        // We add an 'is_live' flag based on the existence of a contract address 
        // to maintain UI compatibility.
        const result = (pools || []).map(pool => ({
            ...pool,
            is_live: !!pool.contract_address && !pool.contract_address.startsWith('0x0000')
        }));

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
