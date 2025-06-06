import { PriceService, PriceData } from '../types/crypto';

class CoinGeckoPriceService implements PriceService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private priceCache = new Map<string, { price: number; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minuto

  // Mapeo de símbolos a IDs de CoinGecko
  private symbolToId: { [key: string]: string } = {
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'DAI': 'dai',
    'WETH': 'weth',
    'UNI': 'uniswap',
    'LINK': 'chainlink',
    'MATIC': 'matic-network',
    'AAVE': 'aave',
    'COMP': 'compound-governance-token',
    'MKR': 'maker',
    'SNX': 'havven',
    'CRV': 'curve-dao-token',
    'YFI': 'yearn-finance',
    'SUSHI': 'sushi',
    'BAL': 'balancer',
    '1INCH': '1inch',
    'ENS': 'ethereum-name-service'
  };

  async getPrice(symbol: string): Promise<number> {
    const upperSymbol = symbol.toUpperCase();
    
    // Verificar caché
    const cached = this.priceCache.get(upperSymbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.price;
    }

    try {
      const coinId = this.symbolToId[upperSymbol];
      if (!coinId) {
        console.warn(`No CoinGecko ID found for symbol: ${symbol}`);
        return 0;
      }

      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error(`Price API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const price = data[coinId]?.usd || 0;

      // Guardar en caché
      this.priceCache.set(upperSymbol, {
        price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      
      // Precios de fallback para stablecoins
      if (['USDT', 'USDC', 'DAI'].includes(upperSymbol)) {
        return 1;
      }
      
      return 0;
    }
  }

  async getPrices(symbols: string[]): Promise<PriceData[]> {
    const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
    const coinIds = uniqueSymbols
      .map(symbol => this.symbolToId[symbol])
      .filter(Boolean);

    if (coinIds.length === 0) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`Price API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const now = new Date();

      return uniqueSymbols.map(symbol => {
        const coinId = this.symbolToId[symbol];
        const coinData = data[coinId];
        
        const priceData: PriceData = {
          symbol,
          priceUSD: coinData?.usd || 0,
          change24h: coinData?.usd_24h_change,
          lastUpdated: now
        };

        // Guardar en caché
        this.priceCache.set(symbol, {
          price: priceData.priceUSD,
          timestamp: now.getTime()
        });

        return priceData;
      });
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      
      // Retornar precios de fallback
      return uniqueSymbols.map(symbol => ({
        symbol,
        priceUSD: ['USDT', 'USDC', 'DAI'].includes(symbol) ? 1 : 0,
        lastUpdated: new Date()
      }));
    }
  }

  // Método para limpiar caché antiguo
  clearOldCache(): void {
    const now = Date.now();
    for (const [symbol, cached] of this.priceCache.entries()) {
      if (now - cached.timestamp > this.cacheTimeout * 5) { // 5 minutos
        this.priceCache.delete(symbol);
      }
    }
  }
}

// Instancia singleton
export const priceService = new CoinGeckoPriceService();

// Limpiar caché cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    priceService.clearOldCache();
  }, 5 * 60 * 1000);
}
