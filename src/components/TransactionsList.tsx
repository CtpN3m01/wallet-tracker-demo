'use client';

import React from 'react';
import { Transaction } from '../types/crypto';
import { config } from '../config';

interface TransactionsListProps {
  transactions: Transaction[];
  walletAddress: string | undefined;
  currentBlockchain?: string;
}

export default function TransactionsList({ transactions, walletAddress, currentBlockchain = 'ethereum' }: TransactionsListProps) {
  const formatAddress = (address: string | null | undefined) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  const formatAge = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} min ago`;
    } else {
      return `${seconds} sec ago`;
    }
  };  const formatAmount = (amount: number, valueUSD?: number, tokenSymbol: string = 'ETH') => {
    const formattedAmount = amount.toFixed(6);
    const usdValue = valueUSD ? ` ($${valueUSD.toFixed(2)})` : '';
    return `${formattedAmount} ${tokenSymbol}${usdValue}`;
  };

  const formatFee = (fee: number, feeUSD?: number) => {
    const formattedFee = fee.toFixed(6);
    const usdValue = feeUSD ? ` ($${feeUSD.toFixed(2)})` : '';
    return `${formattedFee} ETH${usdValue}`;
  };
  const openExplorer = (txHash: string | null) => {
    if (!txHash) return;
    const explorerUrl = config.blockchains[currentBlockchain as keyof typeof config.blockchains]?.explorerUrl || 'https://etherscan.io';
    window.open(`${explorerUrl}/tx/${txHash}`, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        📊 Transacciones Recientes
        {transactions.length > 0 && (
          <span className="ml-2 text-sm text-gray-500">({transactions.length})</span>
        )}
      </h2>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay transacciones disponibles</p>
          <p className="text-sm mt-2">Las transacciones aparecerán aquí cuando se carguen</p>
        </div>
      ) : (        <div className="overflow-x-auto">          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Tipo</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Hash</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Cantidad</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Fee</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Desde/Hacia</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Age</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Estado</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => {
                const isIncoming = walletAddress && transaction.to?.toLowerCase() === walletAddress.toLowerCase();
                const otherAddress = isIncoming ? transaction.from : transaction.to;

                return (
                  <tr key={transaction.hash || `tx-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isIncoming 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isIncoming ? '📈 Entrada' : '📉 Salida'}
                      </span>                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-black text-xs">
                        {formatAddress(transaction.hash)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className={`font-semibold ${
                        isIncoming ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <div className="text-sm">
                          {isIncoming ? '+' : '-'}{formatAmount(
                            transaction.value, 
                            transaction.valueUSD, 
                            transaction.token?.symbol || 'ETH'
                          )}
                        </div>
                        {transaction.token && transaction.token.symbol !== 'ETH' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {transaction.token.name}
                          </div>                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-gray-600 text-sm">
                        {formatFee(transaction.fee, transaction.feeUSD)}
                      </span>                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-black text-xs">
                        {formatAddress(otherAddress)}
                      </span>
                    </td>
                    <td className="py-3 px-2  text-gray-600">
                      {formatAge(transaction.timestamp)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'success'
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'success' ? '✅ Confirmada' : 
                         transaction.status === 'failed' ? '❌ Fallida' : '⏳ Pendiente'}                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => openExplorer(transaction.hash)}
                        disabled={!transaction.hash}
                        className={`text-xs font-medium ${
                          transaction.hash 
                            ? 'text-blue-500 hover:text-blue-700' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={transaction.hash ? "Ver en Block Explorer" : "Hash no disponible"}
                      >
                        🔍 Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Mostrando las últimas {transactions.length} transacciones
        </div>
      )}
    </div>
  );
}
