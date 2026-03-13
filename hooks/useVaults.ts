import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Vault {
    id: string
    chain_id: number
    address: string
    asset_address: string
    asset_symbol: string
    total_assets: number
    created_at: string
}

export function useVaults() {
    const [vaults, setVaults] = useState<Vault[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        async function fetchVaults() {
            try {
                const { data, error } = await supabase
                    .from('vaults')
                    .select('*')

                if (error) throw error
                setVaults(data || [])
            } catch (e) {
                setError(e)
            } finally {
                setLoading(false)
            }
        }

        fetchVaults()
    }, [])

    return { vaults, loading, error }
}
