'use client';

import React from 'react';
import { useWalletMonitoring } from '../hooks/useWalletMonitoring';
import { config } from '../config';
import { WalletInfo } from './index';
import { EventsLog } from './index';
import { TransactionsList } from './index';
import { ControlPanel } from './index';

export default function WalletMonitorDashboard() {
  const {
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
  } = useWalletMonitoring();  const handleSwitchBlockchain = (blockchain: string) => {
    switchBlockchain(blockchain);
    // Limpiar la dirección al cambiar blockchain
    handleAddressChange('');
  };

  const handleStartMonitoring = async () => {
    if (walletAddress.trim()) {
      await startMonitoring();
    }
  };

  const handleRefreshTransactions = () => {
    if (walletAddress.trim()) {
      refreshTransactions();
    }
  };

  const blockchainName = config.blockchains[currentBlockchain as keyof typeof config.blockchains]?.name || 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔍 Wallet Tracker Demo
          </h1>
          <p className="text-black">
            Monitoreo en tiempo real de direcciones {blockchainName}
          </p>
        </div>

        {/* Control Panel */}        <ControlPanel
          walletAddress={walletAddress}
          onAddressChange={handleAddressChange}
          isMonitoring={isMonitoring}
          loading={loading}
          currentBlockchain={currentBlockchain}
          onStartMonitoring={handleStartMonitoring}
          onStopMonitoring={stopMonitoring}
          onClearEvents={clearEvents}
          onRefreshTransactions={handleRefreshTransactions}
          onSwitchBlockchain={handleSwitchBlockchain}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Wallet Information */}
          <div className="lg:col-span-1">
            <WalletInfo 
              walletState={walletState}
              isMonitoring={isMonitoring}
            />
          </div>

          {/* Events Log */}
          <div className="lg:col-span-2">
            <EventsLog events={events} />
          </div>
        </div>        {/* Transactions List */}
        <TransactionsList 
          transactions={recentTransactions}
          walletAddress={walletAddress}
          currentBlockchain={currentBlockchain}
        />
      </div>
    </div>
  );
}
