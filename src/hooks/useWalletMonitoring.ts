'use client';

import { useState, useEffect, useCallback } from 'react';
import { monitoringService } from '../services/monitoringService';
import { priceService } from '../services/priceService';
import { MonitoringEvent, WalletState, Transaction } from '../types/crypto';

export function useWalletMonitoring() {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentBlockchain, setCurrentBlockchain] = useState(monitoringService.getCurrentBlockchain());
  const [walletAddress, setWalletAddress] = useState('');
  // Función para enriquecer transacciones con precios USD
  const enrichTransactionsWithPrices = useCallback(async (transactions: Transaction[]): Promise<Transaction[]> => {
    try {
      // Obtener precios de ETH
      const ethPrice = await priceService.getPrice('ETH');
      
      return transactions.map(tx => ({
        ...tx,
        valueUSD: tx.value * ethPrice,
        feeUSD: tx.fee * ethPrice
      }));
    } catch (error) {
      console.error('Error obteniendo precios:', error);
      return transactions;
    }
  }, []);

  // Función para enriquecer wallet state con precios USD
  const enrichWalletStateWithPrices = useCallback(async (state: WalletState): Promise<WalletState> => {
    try {
      const ethPrice = await priceService.getPrice('ETH');
      
      return {
        ...state,
        balanceUSD: state.balance * ethPrice
      };
    } catch (error) {
      console.error('Error obteniendo precio ETH:', error);
      return state;
    }
  }, []);

  // Callback para manejar eventos del servicio de monitoreo
  const handleEvent = useCallback(async (event: MonitoringEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 49)]); // Mantener solo los últimos 50 eventos
    
    // Actualizar el estado de la wallet
    const currentState = monitoringService.getCurrentState();
    if (currentState) {
      const enrichedState = await enrichWalletStateWithPrices(currentState);
      setWalletState(enrichedState);
    }  }, [enrichWalletStateWithPrices]);

  // Función para detener el monitoreo
  const stopMonitoring = useCallback(() => {
    monitoringService.stopMonitoring();
    monitoringService.removeEventListener(handleEvent);
    setIsMonitoring(false);
  }, [handleEvent]);

  // Función para cambiar de blockchain
  const switchBlockchain = useCallback((blockchain: string) => {
    if (isMonitoring) {
      stopMonitoring();
    }
    monitoringService.setBlockchain(blockchain);
    setCurrentBlockchain(blockchain);
    setEvents([]);
    setWalletState(null);
    setRecentTransactions([]);
  }, [isMonitoring, stopMonitoring]);
  // Función para iniciar el monitoreo
  const startMonitoring = useCallback(async () => {
    try {
      if (!walletAddress.trim()) {
        throw new Error('Wallet address is required');
      }
      
      setLoading(true);
      
      // Registrar el listener de eventos
      monitoringService.onEvent(handleEvent);
        // Iniciar el monitoreo
      await monitoringService.startMonitoring(walletAddress);
      setIsMonitoring(true);      // Cargar transacciones recientes usando el servicio actual
      const service = monitoringService.getCurrentService();
      const transactions = await service.getTransactions(walletAddress, 1, 10);
      const enrichedTransactions = await enrichTransactionsWithPrices(transactions);setRecentTransactions(enrichedTransactions);
      
    } catch (error) {
      console.error('Error iniciando monitoreo:', error);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, handleEvent, enrichTransactionsWithPrices]);

  // Función para limpiar eventos
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);  // Función para actualizar transacciones manualmente
  const refreshTransactions = useCallback(async () => {
    if (!walletAddress) return;
      try {
      const service = monitoringService.getCurrentService();
      const transactions = await service.getTransactions(walletAddress, 1, 10);
      const enrichedTransactions = await enrichTransactionsWithPrices(transactions);
      setRecentTransactions(enrichedTransactions);
    } catch (error) {
      console.error('Error actualizando transacciones:', error);
    }
  }, [walletAddress, enrichTransactionsWithPrices]);

  // Función para cambiar la dirección de la wallet
  const handleAddressChange = useCallback((address: string) => {
    setWalletAddress(address);
  }, []);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [isMonitoring, stopMonitoring]);
  return {
    events,
    walletState,
    isMonitoring,
    recentTransactions,
    loading,
    currentBlockchain,
    walletAddress,
    handleAddressChange,
    startMonitoring,
    stopMonitoring,
    clearEvents,
    refreshTransactions,
    switchBlockchain
  };
}
