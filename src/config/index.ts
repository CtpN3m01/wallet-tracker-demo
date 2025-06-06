export const config = {
  // Configuración de la API de Crypto APIs
  cryptoApiBaseUrl: 'https://rest.cryptoapis.io/blockchain-data',
  apiKey: process.env.NEXT_PUBLIC_CRYPTO_API_KEY || '',
  
  // Configuración del monitoreo
  pollingInterval: 30000, // 30 segundos
  blockchain: process.env.NEXT_PUBLIC_BLOCKCHAIN || 'zksync',
  network: process.env.NEXT_PUBLIC_NETWORK || 'mainnet',
    // Configuración específica por blockchain
  blockchains: {    ethereum: {
      name: 'Ethereum',
      network: 'mainnet',
      currency: 'ETH',
      explorerUrl: 'https://etherscan.io',
      rpcUrl: 'https://eth.llamarpc.com',
      defaultAddress: '', // No default address
    },
    zksync: {
      name: 'ZKSync Era',
      network: 'mainnet',
      currency: 'ETH',
      explorerUrl: 'https://explorer.zksync.io',
      rpcUrl: 'https://mainnet.era.zksync.io',
      apiUrl: 'https://block-explorer-api.mainnet.zksync.io',
      defaultAddress: '', // No default address
    },
    'zksync-sepolia': {
      name: 'ZKSync Sepolia',
      network: 'sepolia',
      currency: 'ETH',
      explorerUrl: 'https://sepolia.explorer.zksync.io',
      rpcUrl: 'https://sepolia.era.zksync.dev',
      apiUrl: 'https://block-explorer-api.sepolia.zksync.dev',
      defaultAddress: '', // No default address
    }
  },
    // Dirección de wallet por defecto - ahora vacía, el usuario debe ingresar una
  get defaultWalletAddress() {
    return this.blockchains[this.blockchain as keyof typeof this.blockchains]?.defaultAddress || '';
  },
  
  // Configuración de la UI
  maxEventsToShow: 50,
  maxTransactionsToShow: 10,
};

export const endpoints = {
  balance: (blockchain: string, network: string, address: string) => 
    `/${blockchain}/${network}/addresses/${address}/balance`,
  transactions: (blockchain: string, network: string, address: string) => 
    `/${blockchain}/${network}/addresses/${address}/transactions`,
  
  // Endpoints específicos para ZKSync Era
  zksync: {
    balance: (address: string) => `/ethereum-classic/mainnet/addresses/${address}/balance`,
    transactions: (address: string) => `/ethereum-classic/mainnet/addresses/${address}/transactions`,
  }
};
