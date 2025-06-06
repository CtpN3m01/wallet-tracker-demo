// Tipos para la API de Crypto APIs y servicios de blockchain

export interface AddressBalance {
  confirmedBalance: {
    amount: string;
    unit: string;
  };
  totalBalance: {
    amount: string;
    unit: string;
  };
}

// Tipos para tokens y precios
export interface Token {
  symbol: string;
  name: string;
  address?: string; // Contract address para tokens ERC-20
  decimals: number;
  balance: number;
  valueUSD?: number;
  priceUSD?: number;
}

export interface PriceData {
  symbol: string;
  priceUSD: number;
  change24h?: number;
  lastUpdated: Date;
}

// Tipos unificados para transacciones (compatibles con múltiples blockchains)
export interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: Date;
  from: string | null;
  to: string | null;
  value: number; // En ETH o token principal
  valueUSD?: number; // Valor en USD
  fee: number; // En ETH
  feeUSD?: number; // Fee en USD
  gasUsed: number;
  gasPrice: number; // En Gwei
  status: 'success' | 'failed' | 'pending';
  type: 'transfer' | 'contract' | 'mint' | 'other';
  token?: Token; // Información del token si no es ETH
}

// Tipos legacy para compatibilidad con Crypto APIs
export interface LegacyTransaction {
  transactionId: string;
  blockHeight: number;
  blockHash: string;
  timestamp: number;
  fee: {
    amount: string;
    unit: string;
  };
  isConfirmed: boolean;
  recipients: Array<{
    address: string;
    amount: string;
  }>;
  senders: Array<{
    address: string;
    amount: string;
  }>;
  transactionStatus: string;
  value: {
    amount: string;
    unit: string;
  };
}

// Información unificada de wallet
export interface WalletInfo {
  address: string;
  balance: number; // En ETH
  balanceUSD?: number; // Valor en USD
  tokens?: Token[]; // Lista de tokens en la wallet
  transactionCount: number;
  currency: string;
  network: string;
  lastUpdated: Date;
}

export interface ApiResponse<T> {
  apiVersion: string;
  requestId: string;
  context: string;
  data: {
    item: T;
  };
}

export interface TransactionListResponse {
  apiVersion: string;
  requestId: string;
  context: string;
  data: {
    limit: number;
    offset: number;
    total: number;
    items: LegacyTransaction[];
  };
}

export interface WalletState {
  address: string;
  balance: number; // Cambiado a number para consistencia
  balanceUSD?: number; // Valor en USD
  tokens?: Token[]; // Lista de tokens
  lastTransactionHash?: string;
  lastChecked: Date;
  transactionCount: number;
  blockchain: string;
  network: string;
}

// Event data interfaces
export interface BalanceChangeEventData {
  previousBalance: number;
  currentBalance: number;
  difference: number;
  address: string;
}

export interface NewTransactionEventData {
  transaction: Transaction;
  isIncoming: boolean;
  amount: number;
}

export interface StatusEventData {
  address?: string;
  status?: string;
}

export interface ErrorEventData {
  error: Error;
  address?: string;
}

export interface MonitoringEvent {
  type: 'balance_change' | 'new_transaction' | 'error' | 'status';
  timestamp: Date;
  data: BalanceChangeEventData | NewTransactionEventData | StatusEventData | ErrorEventData | WalletState | Transaction | Record<string, unknown>;
  message: string;
}

// Interfaz para servicios de blockchain
export interface BlockchainService {
  getWalletInfo(address: string): Promise<WalletInfo>;
  getTransactions(address: string, page?: number, offset?: number): Promise<Transaction[]>;
  getTokenBalances?(address: string): Promise<Token[]>;
  isValidAddress(address: string): boolean;
}

// Interfaz para servicios de precios
export interface PriceService {
  getPrice(symbol: string): Promise<number>;
  getPrices(symbols: string[]): Promise<PriceData[]>;
}

// Interfaz para configuración de blockchain
export interface BlockchainConfig {
  name: string;
  network: string;
  currency: string;
  explorerUrl: string;
  rpcUrl: string;
  apiUrl?: string;
  defaultAddress: string;
}

// Interfaces for API responses that might have different formats
export interface TokenBalanceResponse {
  symbol?: string;
  TokenSymbol?: string;
  tokenName?: string;
  TokenName?: string;
  balance?: string;
  TokenQuantity?: string;
  divisor?: string;
  TokenDivisor?: string;
  contractAddress?: string;
  TokenAddress?: string;
  tokenPriceUSD?: number | string;
  TokenPriceUSD?: number | string;
}
