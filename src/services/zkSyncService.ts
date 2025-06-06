import { Provider } from 'zksync-ethers';
import { WalletInfo, Transaction, BlockchainService, BlockchainConfig, TokenBalanceResponse } from '../types/crypto';
import { config } from '../config';

interface ZKSyncApiResponse<T> {
  status: string;
  message: string;
  result: T;
}

interface ZKSyncTransactionResponse {
  hash: string;
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  fee: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

interface ZKSyncBalanceResponse {
  status: string;
  message: string;
  result: string;
}

interface ZKSyncTokenBalanceResponse {
  status: string;
  message: string;
  result: string;
}

interface ZKSyncTokenInfo {
  contractAddress: string;
  tokenName: string;
  symbol: string;
  divisor: string;
  tokenType: string;
  totalSupply: string;
  blueCheckmark: string;
  description: string;
  website: string;
  email: string;
  blog: string;
  reddit: string;
  slack: string;
  facebook: string;
  twitter: string;
  bitcointalk: string;
  github: string;
  telegram: string;
  wechat: string;
  linkedin: string;
  discord: string;
  whitepaper: string;
  tokenPriceUSD: string;
  balance?: string; // Some APIs include balance in the token info
}

interface ZKSyncTokenBalanceInfo {
  TokenAddress: string;
  TokenName: string;
  TokenSymbol: string;
  TokenQuantity: string;
  TokenDivisor: string;
  TokenType: string;
  TokenPriceUSD?: string;
}

interface ZKSyncAddressTokenBalanceResponse {
  status: string;
  message: string;
  result: (ZKSyncTokenInfo | ZKSyncTokenBalanceInfo)[];
}

export class ZKSyncService implements BlockchainService {
  private provider: Provider;
  private apiUrl: string;
  private network: string;
  constructor(blockchain: string = 'zksync') {
    const zkSyncConfig = config.blockchains[blockchain as keyof typeof config.blockchains];
    if (!zkSyncConfig) {
      throw new Error(`Blockchain configuration not found for: ${blockchain}`);
    }
    this.provider = new Provider(zkSyncConfig.rpcUrl);
    this.apiUrl = (zkSyncConfig as BlockchainConfig).apiUrl || '';
    this.network = zkSyncConfig.network;
  }  /**
   * Obtiene la información de la wallet incluyendo balance
   */
  async getWalletInfo(address: string): Promise<WalletInfo> {
    try {
      // Obtener balance ETH usando la API del Block Explorer o provider como fallback
      const balanceStr = await this.getBalance(address);
      const balance = parseFloat(balanceStr);

      // Obtener información adicional
      const transactionCount = await this.provider.getTransactionCount(address);      // Obtener balances de tokens
      const tokenInfos = await this.getAddressTokenBalances(address);      const tokens = tokenInfos.map((tokenInfo: TokenBalanceResponse) => {
        // Handle different API response formats
        const symbol = tokenInfo.symbol || tokenInfo.TokenSymbol || 'UNKNOWN';
        const name = tokenInfo.tokenName || tokenInfo.TokenName || symbol;
        const balanceStr = tokenInfo.balance || tokenInfo.TokenQuantity || '0';
        const divisor = tokenInfo.divisor || tokenInfo.TokenDivisor || '18';
        const contractAddress = tokenInfo.contractAddress || tokenInfo.TokenAddress || '';
        const priceUSD = tokenInfo.tokenPriceUSD || tokenInfo.TokenPriceUSD;
        
        const decimals = parseInt(divisor);
        const balance = parseFloat(balanceStr) / Math.pow(10, decimals);
          return {
          name,
          symbol,
          balance,
          decimals,
          contractAddress,
          valueUSD: priceUSD ? (typeof priceUSD === 'number' ? priceUSD : parseFloat(priceUSD)) * balance : undefined
        };
      }).filter(token => 
        token.balance > 0 && 
        token.symbol.toUpperCase() !== 'ETH' && 
        token.symbol.toUpperCase() !== 'WETH'
      ); // Solo mostrar tokens con balance > 0 y que no sean ETH

      return {
        address,
        balance,
        transactionCount,
        currency: 'ETH',
        network: `zksync-${this.network}`,
        lastUpdated: new Date(),
        tokens: tokens.length > 0 ? tokens : undefined
      };
    } catch (error) {
      console.error('Error fetching ZKSync wallet info:', error);
      throw new Error(`Failed to fetch wallet info for ${address}`);
    }
  }
  /**
   * Obtiene las transacciones de una dirección usando el Block Explorer API
   */
  async getTransactions(address: string, page = 1, offset = 10): Promise<Transaction[]> {
    try {
      if (!this.apiUrl) {
        console.warn('ZKSync API URL not configured. Cannot fetch transactions.');
        return [];
      }

      // Usar la API del Block Explorer de ZKSync
      const apiUrl = `${this.apiUrl}/api`;
      const response = await fetch(
        `${apiUrl}?module=account&action=txlist&address=${address}&page=${page}&offset=${offset}&sort=desc&apikey=YourApiKeyToken`
      );

      if (!response.ok) {
        console.warn('ZKSync Block Explorer API request failed:', response.status, response.statusText);
        return [];
      }

      const data: ZKSyncApiResponse<ZKSyncTransactionResponse[]> = await response.json();

      if (data.status !== '1') {
        console.warn('ZKSync API returned error:', data.message);
        return [];
      }      if (!Array.isArray(data.result)) {
        console.warn('ZKSync API returned invalid data format');
        return [];
      }

      return data.result.map(tx => this.transformTransaction(tx));
    } catch (error) {
      console.error('Error fetching ZKSync transactions:', error);
      return [];
    }
  }

  /**
   * Transforma una transacción de la API de ZKSync al formato interno
   */  private transformTransaction(tx: ZKSyncTransactionResponse): Transaction {
    const value = parseFloat(tx.value || '0') / Math.pow(10, 18); // Convertir de wei a ETH
    const fee = parseFloat(tx.fee || '0') / Math.pow(10, 18);

    return {
      hash: tx.hash || '',
      blockNumber: parseInt(tx.blockNumber || '0'),
      timestamp: new Date(parseInt(tx.timeStamp || '0') * 1000),
      from: tx.from || null,
      to: tx.to || null,
      value,
      fee,
      gasUsed: parseInt(tx.gasUsed || '0'),
      gasPrice: parseFloat(tx.gasPrice || '0') / Math.pow(10, 9), // Convertir a Gwei
      status: tx.isError === '0' ? 'success' : 'failed',
      type: this.determineTransactionType(tx)
    };
  }

  /**
   * Determina el tipo de transacción basado en los datos
   */  private determineTransactionType(tx: ZKSyncTransactionResponse): 'transfer' | 'contract' | 'mint' | 'other' {
    if (tx.contractAddress && tx.contractAddress !== '') {
      return 'contract';
    }
    if (!tx.to || tx.to === '' || tx.to === null) {
      return 'contract'; // Contract creation
    }
    if (parseFloat(tx.value || '0') > 0) {
      return 'transfer';
    }
    return 'other';
  }/**
   * Verifica si una dirección es válida para ZKSync Era
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Obtiene información del bloque actual
   */
  async getCurrentBlock(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting current block:', error);
      return 0;
    }
  }

  /**
   * Obtiene el precio del gas actual
   */
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getGasPrice();
      const gasPriceGwei = parseFloat(gasPrice.toString()) / Math.pow(10, 9);
      return gasPriceGwei.toFixed(2);
    } catch (error) {
      console.error('Error getting gas price:', error);
      return '0';
    }
  }
  /**
   * Obtiene el balance de ETH usando la API del Block Explorer
   */
  async getBalance(address: string): Promise<string> {
    try {
      console.log('Obteniendo balance para:', address, 'Red:', this.network); // Debug
      
      if (!this.apiUrl) {
        console.warn('ZKSync API URL not configured. Using provider fallback.');
        const balanceWei = await this.provider.getBalance(address);
        const balanceETH = (parseFloat(balanceWei.toString()) / Math.pow(10, 18)).toString();
        console.log('Balance via provider (fallback):', balanceETH, 'ETH'); // Debug
        return balanceETH;
      }

      const apiUrl = `${this.apiUrl}/api`;
      const requestUrl = `${apiUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=YourApiKeyToken`;
      console.log('Solicitando balance a:', requestUrl); // Debug
      
      const response = await fetch(requestUrl);

      if (!response.ok) {
        console.warn('ZKSync balance API request failed, using provider fallback');
        const balanceWei = await this.provider.getBalance(address);
        const balanceETH = (parseFloat(balanceWei.toString()) / Math.pow(10, 18)).toString();
        console.log('Balance via provider (API falló):', balanceETH, 'ETH'); // Debug
        return balanceETH;
      }

      const data: ZKSyncBalanceResponse = await response.json();
      console.log('Respuesta de API balance:', data); // Debug

      if (data.status !== '1') {
        console.warn('ZKSync balance API returned error:', data.message);
        const balanceWei = await this.provider.getBalance(address);
        const balanceETH = (parseFloat(balanceWei.toString()) / Math.pow(10, 18)).toString();
        console.log('Balance via provider (API error):', balanceETH, 'ETH'); // Debug
        return balanceETH;
      }

      const balanceETH = (parseFloat(data.result) / Math.pow(10, 18)).toString();
      console.log('Balance via API:', balanceETH, 'ETH'); // Debug
      return balanceETH;
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Fallback to provider
      const balanceWei = await this.provider.getBalance(address);
      const balanceETH = (parseFloat(balanceWei.toString()) / Math.pow(10, 18)).toString();
      console.log('Balance via provider (excepción):', balanceETH, 'ETH'); // Debug
      return balanceETH;
    }
  }

  /**
   * Obtiene el balance de un token específico
   */
  async getTokenBalance(address: string, contractaddress: string): Promise<string> {
    try {
      if (!this.apiUrl) {
        return '0';
      }

      const apiUrl = `${this.apiUrl}/api`;
      const response = await fetch(
        `${apiUrl}?module=account&action=tokenbalance&contractaddress=${contractaddress}&address=${address}&tag=latest&apikey=YourApiKeyToken`
      );

      if (!response.ok) {
        console.warn('ZKSync token balance API request failed');
        return '0';
      }

      const data: ZKSyncTokenBalanceResponse = await response.json();

      if (data.status !== '1') {
        console.warn('ZKSync token balance API returned error:', data.message);
        return '0';
      }

      return data.result;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  }
  /**
   * Obtiene todos los balances de tokens ERC-20 para una dirección
   */
  async getAddressTokenBalances(address: string): Promise<TokenBalanceResponse[]> {
    try {
      if (!this.apiUrl) {
        return [];
      }

      const apiUrl = `${this.apiUrl}/api`;
      const response = await fetch(
        `${apiUrl}?module=account&action=addresstokenbalance&address=${address}&apikey=YourApiKeyToken`
      );

      if (!response.ok) {
        console.warn('ZKSync address token balance API request failed');
        return [];
      }

      const data: ZKSyncAddressTokenBalanceResponse = await response.json();

      if (data.status !== '1') {
        console.warn('ZKSync address token balance API returned error:', data.message);
        return [];
      }

      return Array.isArray(data.result) ? data.result : [];
    } catch (error) {
      console.error('Error fetching address token balances:', error);
      return [];
    }
  }

  /**
   * Obtiene transferencias de tokens para una dirección
   */
  async getTokenTransfers(address: string, contractaddress?: string, page = 1, offset = 10): Promise<Transaction[]> {
    try {
      if (!this.apiUrl) {
        return [];
      }

      const apiUrl = `${this.apiUrl}/api`;
      let url = `${apiUrl}?module=account&action=tokentx&address=${address}&page=${page}&offset=${offset}&sort=desc&apikey=YourApiKeyToken`;
      
      if (contractaddress) {
        url += `&contractaddress=${contractaddress}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        console.warn('ZKSync token transfers API request failed');
        return [];
      }

      const data: ZKSyncApiResponse<ZKSyncTransactionResponse[]> = await response.json();      if (data.status !== '1') {
        console.warn('ZKSync token transfers API returned error:', data.message);
        return [];
      }

      if (!Array.isArray(data.result)) {
        return [];
      }

      return data.result.map(tx => this.transformTransaction(tx));
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      return [];
    }
  }

  /**
   * Obtiene transferencias de NFTs para una dirección
   */
  async getNFTTransfers(address: string, contractaddress?: string, page = 1, offset = 10): Promise<Transaction[]> {
    try {
      if (!this.apiUrl) {
        return [];
      }

      const apiUrl = `${this.apiUrl}/api`;
      let url = `${apiUrl}?module=account&action=tokennfttx&address=${address}&page=${page}&offset=${offset}&sort=desc&apikey=YourApiKeyToken`;
      
      if (contractaddress) {
        url += `&contractaddress=${contractaddress}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        console.warn('ZKSync NFT transfers API request failed');
        return [];
      }

      const data: ZKSyncApiResponse<ZKSyncTransactionResponse[]> = await response.json();      if (data.status !== '1') {
        console.warn('ZKSync NFT transfers API returned error:', data.message);
        return [];
      }

      if (!Array.isArray(data.result)) {
        return [];
      }

      return data.result.map(tx => this.transformTransaction(tx));
    } catch (error) {
      console.error('Error fetching NFT transfers:', error);
      return [];
    }
  }
}

export default ZKSyncService;
