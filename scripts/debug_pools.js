const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qswiggdjiobuasbpocts.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzd2lnZ2RqaW9idWFzYnBvY3RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzOTc4MCwiZXhwIjoyMDg2OTE1NzgwfQ.GUcHboWPtGMtvhlrJ_QK7_TD0fVzC8O3qRqoQeTH5TQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data, error } = await supabase
        .from('pools')
        .select('*');

    if (error) {
        console.error(error);
        return;
    }

    console.log("Pools in Supabase:");
    data.forEach(p => {
        console.log(`- ${p.slug}: TVL=${p.tvl}, APY=${p.apy}, ChainId=${p.chain_id}, LiveAddr=${p.contract_address}`);
    });
}

checkData();
