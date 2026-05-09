import { PublicKey } from '@solana/web3.js'

export const PROGRAM_ID = new PublicKey('F4jZpgbtTb6RWNWq6v35fUeiAsRJMrDczVPv9U23yXjB')

// This will be populated with the actual IDL
export const IDL = {
  "version": "0.1.0",
  "name": "vault",
  "instructions": [
    {
      "name": "deposit",
      "accounts": [
        { "name": "signer", "isMut": true, "isSigner": true },
        { "name": "vault", "isMut": true, "isSigner": false, "pda": { "seeds": [{ "kind": "const", "value": [118, 97, 117, 108, 116] }, { "kind": "account", "path": "signer" }] } },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [{ "name": "amount", "type": "u64" }]
    },
    {
      "name": "withdraw",
      "accounts": [
        { "name": "signer", "isMut": true, "isSigner": true },
        { "name": "vault", "isMut": true, "isSigner": false, "pda": { "seeds": [{ "kind": "const", "value": [118, 97, 117, 108, 116] }, { "kind": "account", "path": "signer" }] } },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    }
  ],
  "errors": [
    { "code": 6000, "name": "VaultAlreadyExists", "msg": "Vault already exists" },
    { "code": 6001, "name": "InvalidAmount", "msg": "Invalid amount" }
  ]
}

