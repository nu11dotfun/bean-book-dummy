// Single source of truth for all contract addresses (Base mainnet)

export const BEAN_ADDRESS = '0x5c72992b83E74c4D5200A8E8920fB946214a5A5D' as const

export const BEAN_ABI = [{
  name: 'balanceOf', type: 'function', stateMutability: 'view',
  inputs: [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
}] as const

// Named export for compatibility with beans-finance-latest patterns
export const CONTRACTS = {
  Bean: {
    address: BEAN_ADDRESS,
    abi: BEAN_ABI,
  },
} as const
