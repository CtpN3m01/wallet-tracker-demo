'use client';

import React from 'react';
import { config } from '../config';

interface ControlPanelProps {
  walletAddress: string;
  onAddressChange: (address: string) => void;
  isMonitoring: boolean;
  loading: boolean;
  currentBlockchain: string;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  onClearEvents: () => void;
  onRefreshTransactions: () => void;
  onSwitchBlockchain: (blockchain: string) => void;
}

export default function ControlPanel({
  walletAddress,
  onAddressChange,
  isMonitoring,
  loading,
  currentBlockchain,
  onStartMonitoring,
  onStopMonitoring,
  onClearEvents,
  onRefreshTransactions,
  onSwitchBlockchain
}: ControlPanelProps) {
  const blockchains = Object.keys(config.blockchains);
  
  // Función para abrir el explorer específico de cada blockchain
  const openBlockchainExplorer = (address: string) => {
    const explorerUrl = config.blockchains[currentBlockchain as keyof typeof config.blockchains]?.explorerUrl;
    if (explorerUrl && address.trim()) {
      window.open(`${explorerUrl}/address/${address}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🎛️ Panel de Control
      </h2>

      <div className="space-y-4">
        {/* Selector de Blockchain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blockchain
          </label>
          <select
            value={currentBlockchain}
            onChange={(e) => onSwitchBlockchain(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isMonitoring}
          >
            {blockchains.map(blockchain => (
              <option key={blockchain} value={blockchain}>
                {config.blockchains[blockchain as keyof typeof config.blockchains].name}
              </option>
            ))}
          </select>
          {isMonitoring && (
            <p className="text-xs text-gray-500 mt-1">
              Detén el monitoreo para cambiar de blockchain
            </p>
          )}
        </div>        
        {/* Input de dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección de Wallet ({config.blockchains[currentBlockchain as keyof typeof config.blockchains].name})
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="Ingresa una dirección de wallet (0x...)"
              className="flex-1 px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              disabled={isMonitoring}
            />
          </div>
          {/* Validación de dirección */}
          {walletAddress.trim() && walletAddress.length !== 42 && (
            <p className="text-red-500 text-xs mt-1">
              ⚠️ La dirección debe tener exactamente 42 caracteres (incluyendo 0x)
            </p>
          )}
          {walletAddress.trim() && walletAddress.length === 42 && !walletAddress.startsWith('0x') && (
            <p className="text-red-500 text-xs mt-1">
              ⚠️ La dirección debe empezar con 0x
            </p>
          )}
        </div>        {/* Botones de control */}
        <div className="flex flex-wrap gap-3">
          {!isMonitoring ? (
            <button
              onClick={onStartMonitoring}
              disabled={loading || !walletAddress.trim() || walletAddress.length !== 42 || !walletAddress.startsWith('0x')}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" strokeWidth="4" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando...</span>
                </>
              ) : (
                <>
                  <span>▶️</span>
                  <span>Iniciar Monitoreo</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onStopMonitoring}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
            >
              <span>⏹️</span>
              <span>Detener Monitoreo</span>
            </button>
          )}

          <button
            onClick={onRefreshTransactions}
            disabled={!walletAddress.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Actualizar Transacciones</span>
          </button>          <button
            onClick={onClearEvents}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            <span>🗑️</span>
            <span>Limpiar Eventos</span>
          </button>

          <button
            onClick={() => openBlockchainExplorer(walletAddress)}
            disabled={!walletAddress.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
            title={`Ver en ${config.blockchains[currentBlockchain as keyof typeof config.blockchains]?.name} Explorer`}
          >
            <span>🔍</span>
            <span>Ver en Explorer</span>
          </button>
        </div>

        {/* Información de estado */}
        <div className="bg-gray-50 rounded-md p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Estado del monitoreo:</span>
            <span className={`font-semibold ${isMonitoring ? 'text-green-600' : 'text-gray-500'}`}>
              {isMonitoring ? '🟢 Activo' : '🔴 Inactivo'}
            </span>
          </div>
          {isMonitoring && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Intervalo de consulta:</span>
              <span className="text-gray-800">15 segundos</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
