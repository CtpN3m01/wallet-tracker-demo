import axios, { AxiosResponse } from 'axios';
import { config, endpoints } from '../config';
import { 
  AddressBalance, 
  Transaction, 
  LegacyTransaction,
  ApiResponse, 
  TransactionListResponse,
  WalletInfo,
  BlockchainService,
  Token
} from '../types/crypto';

class CryptoApiService implements BlockchainService {
  private apiKey: string;
  private baseUrl: string;
  constructor() {
    this.apiKey = config.apiKey;
    this.baseUrl = config.cryptoApiBaseUrl;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };
  }
  /**
   * Implementación de la interfaz BlockchainService
   */
  async getWalletInfo(address: string): Promise<WalletInfo> {
    try {
      const balance = await this.getAddressBalance(address);
      
      return {
        address,
        balance: parseFloat(balance.confirmedBalance.amount),
        transactionCount: 0, // Crypto APIs no proporciona esto directamente
        currency: 'ETH',
        network: 'ethereum-mainnet',
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw error;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTransactions(address: string, _page = 1, offset = 10): Promise<Transaction[]> {
    try {
      const legacyTransactions = await this.getConfirmedTransactions(address, offset);
      return legacyTransactions.map(tx => this.transformLegacyTransaction(tx));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Transforma una transacción legacy al formato unificado
   */  private transformLegacyTransaction(tx: LegacyTransaction): Transaction {
    const recipient = tx.recipients[0];
    const sender = tx.senders[0];
    
    return {
      hash: tx.transactionId || '',
      blockNumber: tx.blockHeight || 0,
      timestamp: new Date(tx.timestamp * 1000),
      from: sender?.address || null,
      to: recipient?.address || null,
      value: parseFloat(tx.value.amount),
      fee: parseFloat(tx.fee.amount),
      gasUsed: 0, // No disponible en Crypto APIs
      gasPrice: 0, // No disponible en Crypto APIs
      status: tx.isConfirmed ? 'success' : 'pending',
      type: 'transfer'
    };
  }
  /**
   * Obtiene el balance actual de una dirección
   */
  async getAddressBalance(address: string): Promise<AddressBalance> {
    try {
      if (!this.apiKey) {
        throw new Error('API Key not configured. Please set NEXT_PUBLIC_CRYPTO_API_KEY in your .env.local file.');
      }

      const url = `${this.baseUrl}${endpoints.balance('ethereum', 'mainnet', address)}`;
      const response: AxiosResponse<ApiResponse<AddressBalance>> = await axios.get(
        url,
        { headers: this.getHeaders() }
      );

      return response.data.data.item;
    } catch (error) {
      console.error('Error obteniendo balance:', error);
      throw error;
    }
  }
  /**
   * Obtiene las transacciones confirmadas de una dirección
   */
  async getConfirmedTransactions(
    address: string, 
    limit: number = 10
  ): Promise<LegacyTransaction[]> {
    try {
      if (!this.apiKey) {
        throw new Error('API Key not configured. Please set NEXT_PUBLIC_CRYPTO_API_KEY in your .env.local file.');
      }

      const url = `${this.baseUrl}${endpoints.transactions('ethereum', 'mainnet', address)}`;
      const response: AxiosResponse<TransactionListResponse> = await axios.get(
        url,
        { 
          headers: this.getHeaders(),
          params: { limit, offset: 0 }
        }
      );

      return response.data.data.items;
    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
      throw error;
    }
  }
  /**
   * Obtiene balances de tokens ERC-20 (placeholder para Ethereum)
   * Por ahora retorna un array vacío hasta implementar soporte completo
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTokenBalances(_address: string): Promise<Token[]> {
    // TODO: Implementar obtención de balances de tokens ERC-20 usando Crypto APIs
    // Por ahora retornamos array vacío para evitar errores
    return [];
  }
}

export const cryptoApiService = new CryptoApiService();
