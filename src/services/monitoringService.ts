import { cryptoApiService } from './cryptoApiService';
import ZKSyncService from './zkSyncService';
import { priceService } from './priceService';
import { config } from '../config';
import { 
  WalletState, 
  MonitoringEvent, 
  BlockchainService,
  Token
} from '../types/crypto';

type EventCallback = (event: MonitoringEvent) => void;

class MonitoringService {
  private intervalId: NodeJS.Timeout | null = null;
  private walletState: WalletState | null = null;
  private eventCallbacks: EventCallback[] = [];
  private isRunning = false;
  private currentBlockchain: string = 'ethereum';
  private service: BlockchainService;

  constructor() {
    this.currentBlockchain = config.blockchain;
    this.service = this.getServiceForBlockchain(this.currentBlockchain);
  }
  /**
   * Obtiene el servicio apropiado para el blockchain especificado
   */
  private getServiceForBlockchain(blockchain: string): BlockchainService {
    switch (blockchain) {
      case 'zksync':
      case 'zksync-sepolia':
        return new ZKSyncService(blockchain);
      case 'ethereum':
      default:
        return cryptoApiService;
    }
  }

  /**
   * Cambia el blockchain que se está monitoreando
   */
  setBlockchain(blockchain: string): void {
    if (this.isRunning) {
      this.stopMonitoring();
    }
    this.currentBlockchain = blockchain;
    this.service = this.getServiceForBlockchain(blockchain);
  }

  /**
   * Obtiene el blockchain actual
   */
  getCurrentBlockchain(): string {
    return this.currentBlockchain;
  }

  /**
   * Inicia el monitoreo de una dirección de wallet
   */
  async startMonitoring(address: string): Promise<void> {
    if (this.isRunning) {
      this.stopMonitoring();
    }

    this.isRunning = true;
    
    // Inicializar el estado de la wallet
    await this.initializeWalletState(address);
    
    // Emitir evento de inicio
    this.emitEvent({
      type: 'status',
      timestamp: new Date(),
      data: { address, status: 'started' },
      message: `Monitoreo iniciado para la dirección: ${address}`
    });

    // Configurar intervalo de polling
    this.intervalId = setInterval(async () => {
      await this.checkForChanges();
    }, config.pollingInterval);

    // Primera verificación inmediata
    await this.checkForChanges();
  }

  /**
   * Detiene el monitoreo
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    
    this.emitEvent({
      type: 'status',
      timestamp: new Date(),
      data: { status: 'stopped' },
      message: 'Monitoreo detenido'
    });
  }

  /**
   * Registra un callback para escuchar eventos
   */
  onEvent(callback: EventCallback): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Elimina un callback de eventos
   */
  removeEventListener(callback: EventCallback): void {
    this.eventCallbacks = this.eventCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Obtiene el estado actual de la wallet
   */
  getCurrentState(): WalletState | null {
    return this.walletState;
  }

  /**
   * Verifica si el servicio está ejecutándose
   */
  isMonitoring(): boolean {
    return this.isRunning;
  }  /**
   * Inicializa el estado de la wallet
   */
  private async initializeWalletState(address: string): Promise<void> {
    try {
      const walletInfo = await this.service.getWalletInfo(address);
      const transactions = await this.service.getTransactions(address, 1, 1);

      // Enriquecer tokens con precios USD
      const enrichedTokens = walletInfo.tokens ? await this.enrichTokensWithPrices(walletInfo.tokens) : undefined;
      
      // Enriquecer balance ETH con precio USD
      const balanceUSD = await this.enrichETHWithPrice(walletInfo.balance);

      this.walletState = {
        address,
        balance: walletInfo.balance,
        balanceUSD: balanceUSD,
        tokens: enrichedTokens,
        lastTransactionHash: transactions[0]?.hash,
        lastChecked: new Date(),
        transactionCount: walletInfo.transactionCount,
        blockchain: this.currentBlockchain,
        network: walletInfo.network
      };

      this.emitEvent({
        type: 'status',
        timestamp: new Date(),
        data: { ...this.walletState },
        message: `Estado inicial cargado. Balance: ${walletInfo.balance} ETH`
      });

    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        data: { error },
        message: 'Error inicializando el estado de la wallet'
      });
    }
  }
  /**
   * Verifica cambios en el balance y transacciones
   */
  private async checkForChanges(): Promise<void> {
    if (!this.walletState) return;

    try {
      const [walletInfo, currentTransactions] = await Promise.all([
        this.service.getWalletInfo(this.walletState.address),
        this.service.getTransactions(this.walletState.address, 1, 5)
      ]);      // Actualizar información de la wallet (balance, USD, tokens)
      const balanceChanged = walletInfo.balance !== this.walletState.balance;
      if (balanceChanged) {
        const previousBalance = this.walletState.balance;
        this.walletState.balance = walletInfo.balance;
        
        this.emitEvent({
          type: 'balance_change',
          timestamp: new Date(),
          data: {
            previousBalance,
            currentBalance: walletInfo.balance,
            difference: (walletInfo.balance - previousBalance).toFixed(6)
          },
          message: `Balance actualizado: ${previousBalance} → ${walletInfo.balance} ETH`
        });
      }
        // Siempre actualizar USD y tokens con precios actualizados (pueden cambiar independientemente)
      this.walletState.balanceUSD = await this.enrichETHWithPrice(walletInfo.balance);
      this.walletState.tokens = walletInfo.tokens ? await this.enrichTokensWithPrices(walletInfo.tokens) : undefined;// Verificar nuevas transacciones
      if (currentTransactions.length > 0) {
        const latestTransaction = currentTransactions[0];
          if (latestTransaction.hash && latestTransaction.hash !== this.walletState.lastTransactionHash) {
          this.walletState.lastTransactionHash = latestTransaction.hash;
            // Verificar si es una transacción entrante
          const isIncoming = latestTransaction.to?.toLowerCase() === this.walletState.address?.toLowerCase();

          this.emitEvent({
            type: 'new_transaction',
            timestamp: new Date(),
            data: {
              transaction: latestTransaction,
              isIncoming,
              amount: latestTransaction.value
            },            message: isIncoming 
              ? `Nueva transacción entrante: +${latestTransaction.value} ETH (${latestTransaction.hash?.substring(0, 10) || 'N/A'}...)`
              : `Nueva transacción saliente: -${latestTransaction.value} ETH (${latestTransaction.hash?.substring(0, 10) || 'N/A'}...)`
          });
        }
      }

      this.walletState.lastChecked = new Date();

    } catch (error) {
      this.emitEvent({
        type: 'error',
        timestamp: new Date(),
        data: { error },
        message: 'Error verificando cambios en la wallet'
      });
    }
  }

  /**
   * Enriquece los tokens con precios en USD
   */
  private async enrichTokensWithPrices(tokens: Token[]): Promise<Token[]> {
    if (!tokens || tokens.length === 0) return tokens;

    try {
      const enrichedTokens = await Promise.all(
        tokens.map(async (token) => {
          try {
            const priceUSD = await priceService.getPrice(token.symbol);
            return {
              ...token,
              priceUSD,
              valueUSD: priceUSD * token.balance
            };
          } catch (error) {
            console.warn(`Failed to get price for ${token.symbol}:`, error);
            return token;
          }
        })
      );
      
      return enrichedTokens;
    } catch (error) {
      console.error('Error enriching tokens with prices:', error);
      return tokens;
    }
  }  /**
   * Enriquece el balance ETH con precio en USD
   */
  private async enrichETHWithPrice(balance: number): Promise<number | undefined> {
    try {
      const ethPriceUSD = await priceService.getPrice('ETH');
      const valueUSD = ethPriceUSD * balance;
      return valueUSD;
    } catch (error) {
      console.warn('Failed to get ETH price:', error);
      return undefined;
    }
  }

  /**
   * Emite un evento a todos los listeners
   */
  private emitEvent(event: MonitoringEvent): void {
    console.log(`[${event.timestamp.toLocaleTimeString()}] ${event.message}`);
    
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error en callback de evento:', error);
      }
    });
  }

  /**
   * Obtiene el servicio de blockchain actual
   */
  getCurrentService(): BlockchainService {
    return this.service;
  }
}

export const monitoringService = new MonitoringService();
