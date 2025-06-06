'use client';

import React from 'react';
import { MonitoringEvent, BalanceChangeEventData, NewTransactionEventData } from '../types/crypto';

interface EventsLogProps {
  events: MonitoringEvent[];
}

export default function EventsLog({ events }: EventsLogProps) {  // Type guard functions
  const isBalanceChangeEventData = (data: unknown): data is BalanceChangeEventData => {
    return data !== null && typeof data === 'object' && 
           'previousBalance' in data && 'currentBalance' in data &&
           typeof (data as BalanceChangeEventData).previousBalance === 'number' && 
           typeof (data as BalanceChangeEventData).currentBalance === 'number';
  };

  const isNewTransactionEventData = (data: unknown): data is NewTransactionEventData => {
    return data !== null && typeof data === 'object' && 
           'transaction' in data && 'isIncoming' in data && 'amount' in data &&
           typeof (data as NewTransactionEventData).isIncoming === 'boolean' && 
           typeof (data as NewTransactionEventData).amount === 'number';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'balance_change': return '💰';
      case 'new_transaction': return '📈';
      case 'error': return '❌';
      case 'status': return 'ℹ️';
      default: return '📝';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'balance_change': return 'border-l-yellow-500 bg-yellow-50';
      case 'new_transaction': return 'border-l-green-500 bg-green-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'status': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };
  const formatEventData = (event: MonitoringEvent) => {
    switch (event.type) {
      case 'balance_change':
        if (isBalanceChangeEventData(event.data)) {
          return (
            <div className="text-xs text-gray-600 mt-1">
              <span>Anterior: {event.data.previousBalance || 'N/A'} ETH</span>
              <span className="mx-2">→</span>
              <span>Actual: {event.data.currentBalance || 'N/A'} ETH</span>
              <span className={`ml-2 font-semibold ${
                event.data.difference > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ({event.data.difference > 0 ? '+' : ''}{event.data.difference || '0'} ETH)
              </span>
            </div>
          );
        }
        return null;

      case 'new_transaction':
        if (isNewTransactionEventData(event.data)) {
          return (
            <div className="text-xs text-gray-600 mt-1">
              <div>Cantidad: {event.data.isIncoming ? '+' : '-'}{event.data.amount} ETH</div>
              <div>TX: {event.data.transaction?.hash?.substring(0, 20) || 'N/A'}...</div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        📋 Log de Eventos
        {events.length > 0 && (
          <span className="ml-2 text-sm text-gray-500">({events.length})</span>
        )}
      </h2>
      
      <div className="max-h-96 overflow-y-auto space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay eventos registrados</p>
            <p className="text-sm mt-2">Los eventos aparecerán aquí cuando inicies el monitoreo</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className={`border-l-4 p-3 rounded-r ${getEventColor(event.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800 font-medium">
                      {event.message}
                    </div>
                    {formatEventData(event)}
                  </div>
                </div>
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {events.length > 10 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Mostrando los últimos {events.length} eventos
        </div>
      )}
    </div>
  );
}
