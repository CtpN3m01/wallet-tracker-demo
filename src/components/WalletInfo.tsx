'use client';

import React from 'react';
import { WalletState } from '../types/crypto';

interface WalletInfoProps {
  walletState: WalletState | null;
  isMonitoring: boolean;
}

export default function WalletInfo({ walletState, isMonitoring }: WalletInfoProps) {
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };  // Calcular el valor total de todos los assets
  const calculateTotalValue = () => {
    let totalUSD = 0;
    
    // Sumar el valor ETH (balance principal)
    if (walletState?.balanceUSD && typeof walletState.balanceUSD === 'number') {
      totalUSD += walletState.balanceUSD;
    }
    
    // Sumar el valor de todos los tokens (excepto ETH para evitar duplicación)
    if (walletState?.tokens && Array.isArray(walletState.tokens)) {
      walletState.tokens.forEach(token => {
        if (token.valueUSD && 
            typeof token.valueUSD === 'number' && 
            token.balance > 0 && 
            token.symbol.toUpperCase() !== 'ETH') {
          totalUSD += token.valueUSD;
        }
      });
    }
    
    return totalUSD;
  };  // Crear lista de todos los assets (ETH + tokens)
  const getAllAssets = () => {
    const assets = [];
    
    // Agregar ETH como primer asset (siempre presente, incluso con balance 0)
    if (walletState) {
      const ethBalance = walletState.balance || 0;
      const ethValueUSD = walletState.balanceUSD || 0;
      
      assets.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalance,
        valueUSD: ethValueUSD,
        decimals: 6,
        isMainCurrency: true
      });
    }
    
    // Agregar tokens (solo si tienen balance > 0 y no son ETH para evitar duplicados)
    if (walletState?.tokens && walletState.tokens.length > 0) {
      const tokensWithBalance = walletState.tokens.filter(token => 
        token.balance && 
        token.balance > 0 && 
        token.symbol.toUpperCase() !== 'ETH' && 
        token.symbol.toUpperCase() !== 'WETH' // También filtrar WETH por si acaso
      );
      
      assets.push(...tokensWithBalance.map(token => ({
        ...token,
        isMainCurrency: false
      })));
    }
    
    return assets;
  };

  if (!walletState) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          💼 Información de Wallet
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>No hay información de wallet disponible</p>
          <p className="text-sm mt-2">Inicia el monitoreo para ver los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        💼 Información de Wallet
        {isMonitoring && (
          <span className="ml-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        )}      </h2>
      
      <div className="space-y-4">
        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Dirección
          </label>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm text-black bg-gray-100 px-2 py-1 rounded">
              {formatAddress(walletState.address)}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(walletState.address)}
              className="text-blue-500 hover:text-blue-700 text-xs"
              title="Copiar dirección completa"
            >
              📋
            </button>
          </div>
        </div>        {/* Valor Total de Assets */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            💰 Total de Assets de la Cuenta
          </label>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-green-600 mb-1">
              ${calculateTotalValue().toFixed(2)} USD
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Red: {walletState.network || walletState.blockchain}</span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                En tiempo real
              </span>
            </div>
          </div>
        </div>{/* Desglose de Assets */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Desglose de Assets ({getAllAssets().length} activos)
          </label>
          <div className="space-y-3">
            {getAllAssets().map((asset, index) => (
              <div key={`${asset.symbol}-${index}`} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {asset.symbol.substring(0, 2).toUpperCase()}
                    </span>
                  </div><div>
                    <div className="font-semibold text-gray-800">
                      {asset.symbol}
                    </div>
                    {asset.name !== asset.symbol && (
                      <div className="text-xs text-gray-500">{asset.name}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">
                    {(asset.balance || 0).toFixed(asset.decimals > 6 ? 6 : (asset.decimals || 6))} {asset.symbol}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${(asset.valueUSD || 0).toFixed(2)} USD
                  </div>
                </div>
              </div>
            ))}            {getAllAssets().length === 1 && calculateTotalValue() === 0 && (
              <div className="text-center py-4 text-amber-600 text-sm bg-amber-50 rounded-lg border border-amber-200">
                ⚠️ Esta dirección no tiene ETH en {walletState.network || walletState.blockchain}.
                <br />
                <span className="text-xs text-amber-500 mt-1 block">
                  Prueba con una dirección que tenga balance o cambia de red.
                </span>
              </div>
            )}
            {getAllAssets().length === 1 && calculateTotalValue() > 0 && (
              <div className="text-center py-2 text-gray-500 text-sm">
                Solo ETH detectado. Los tokens aparecerán aquí cuando se encuentren.
              </div>
            )}
          </div>
        </div>

        {/* Última transacción */}
        {walletState.lastTransactionHash && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Última Transacción
            </label>
            <span className="font-mono text-xs text-black bg-gray-100 px-2 py-1 rounded block">
              {formatAddress(walletState.lastTransactionHash)}
            </span>
          </div>
        )}

        {/* Última verificación */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Última Verificación
          </label>
          <span className="text-sm text-gray-700">
            {formatDate(walletState.lastChecked)}
          </span>
        </div>

        {/* Estado del monitoreo */}
        <div className="mt-6 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Estado:</span>
            <span className={`text-sm font-semibold ${
              isMonitoring ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isMonitoring ? '🟢 Monitoreando' : '🔴 Detenido'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
