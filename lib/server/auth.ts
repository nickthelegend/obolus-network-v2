import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PrivyClient } from '@privy-io/node';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

export const privy = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);

/**
 * Solana message signature verification.
 */
export async function verifySolanaSignature({
  message,
  signature,
  publicKey,
}: {
  message: string;
  signature: string;
  publicKey: string;
}): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (err) {
    console.error('[AUTH:VERIFY_SOLANA]', err);
    return false;
  }
}

/**
 * EIP-712 signature verification (Legacy / EVM fallback)
 */
import { verifyTypedData } from 'viem';
import { OBOLUS_DOMAIN, EIP712_TYPES, type EIP712TypeName } from '@/lib/eip712';

interface VerifyParams {
  primaryType: EIP712TypeName;
  message: Record<string, unknown>;
  signature: string;
  expectedSigner: string;
}

export async function verifyEIP712Signature({
  primaryType,
  message,
  signature,
  expectedSigner,
}: VerifyParams): Promise<boolean> {
  try {
    const valid = await verifyTypedData({
      address: expectedSigner as `0x${string}`,
      domain: OBOLUS_DOMAIN,
      types: { [primaryType]: EIP712_TYPES[primaryType] },
      primaryType,
      message,
      signature: signature as `0x${string}`,
    });
    return valid;
  } catch (err) {
    console.error('[AUTH:VERIFY_EVM]', err);
    return false;
  }
}
