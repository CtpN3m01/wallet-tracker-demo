# 🔍 Wallet Tracker Demo

Una aplicación web avanzada que implementa **monitoreo en tiempo real** de direcciones de wallet en múltiples blockchains incluyendo **Ethereum**, **ZKSync Era** y **ZKSync Sepolia**, con soporte completo para detección de cambios de balance, transacciones y tokens.

## 🎯 Objetivo

Desarrollar un sistema de monitoreo integral que detecte automáticamente:
- ✅ **Cambios de balance** en tiempo real
- ✅ **Nuevas transacciones** entrantes y salientes  
- ✅ **Balances de tokens ERC-20**
- ✅ **Precios en USD** actualizados
- ✅ **Eventos del sistema** con logging detallado

## ✨ Características Principales

### 🌐 **Multi-Blockchain**
- **Ethereum Mainnet** - Integración con Crypto APIs
- **ZKSync Era** - Soporte nativo con ZKSync provider
- **ZKSync Sepolia** - Testnet para desarrollo y pruebas
- **Cambio dinámico** entre blockchains sin reiniciar

### 🔄 **Monitoreo Inteligente**
- **Polling automático** cada 15 segundos
- **Detección de cambios** de balance con precisión de 6 decimales
- **Notificaciones instantáneas** de nuevas transacciones
- **Seguimiento de tokens** ERC-20 con precios USD
- **Log de eventos** en tiempo real con timestamps

### 💻 **Interfaz Moderna**
- **Diseño responsive** optimizado para móvil y desktop
- **Dashboard intuitivo** con métricas clave
- **Panel de control** con direcciones de ejemplo
- **Historial de transacciones** con enlaces a explorers
- **Tema moderno** con TailwindCSS

### 🛡️ **Arquitectura Robusta**
- **TypeScript completo** con tipado estricto
- **Manejo de errores** con fallbacks inteligentes
- **Arquitectura modular** fácilmente extensible

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** con App Router para SSR optimizado
- **React 19** con hooks personalizados
- **TypeScript 5** para máxima type safety
- **TailwindCSS 4** para diseño moderno

### Backend/APIs
- **Crypto APIs** para datos de Ethereum mainnet
- **ZKSync provider** (zksync-ethers) para interacción directa
- **Block Explorer APIs** para transacciones de ZKSync
- **CoinGecko API** para precios de criptomonedas

### Herramientas
- **Axios** para peticiones HTTP optimizadas
- **ESLint** configurado para código limpio
- **dotenv** para manejo seguro de variables

## 🚀 Inicio Rápido

### 📋 Prerrequisitos
- **Node.js 18+** (recomendado: 20+)
- **npm**, **yarn** o **pnpm**

### ⚡ Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/wallet-tracker-demo.git
cd wallet-tracker-demo

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env.local

# 4. Ejecutar en modo desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:3000
```

### 🔧 Configuración Avanzada

#### Variables de Entorno (.env.local)
```bash
# API de Crypto APIs (opcional - para datos reales de Ethereum)
NEXT_PUBLIC_CRYPTO_API_KEY=tu_api_key_aqui

# Blockchain por defecto
NEXT_PUBLIC_BLOCKCHAIN=zksync

# Intervalo de polling (ms)
NEXT_PUBLIC_POLLING_INTERVAL=15000
```

#### Obtener API Key de Crypto APIs
1. Registrarse en [Crypto APIs](https://developers.cryptoapis.io/)
2. Plan gratuito: **100 requests/día**
3. Obtener API key del dashboard
4. Añadir al archivo `.env.local`

> **💡 Nota**: La aplicación funciona completamente **sin API keys** usando datos de demostración realistas.

## 🎮 Guía de Uso

### 1. **Selección de Blockchain**
```
🔹 Ethereum → Datos reales (con API key)
🔹 ZKSync Era → Datos en tiempo real del mainnet
🔹 ZKSync Sepolia → Datos en tiempo real del testnet
```

### 2. **Monitoreo de Wallets**
- **Introducir dirección** manualmente o usar ejemplos
- **Iniciar monitoreo** con el botón verde
- **Observar eventos** en tiempo real en el log
- **Ver transacciones** recientes con detalles completos

### 3. **Funcionalidades Avanzadas**
- **Detección automática** de cambios de balance
- **Alertas** de transacciones entrantes/salientes
- **Visualización** de tokens ERC-20 con valores USD
- **Enlaces directos** a block explorers
- **Historial persistente** durante la sesión

## 📁 Arquitectura del Proyecto

```
src/
├── 📱 app/                     # Next.js App Router
│   ├── page.tsx               # Página principal
│   ├── layout.tsx             # Layout base
│   └── globals.css            # Estilos globales
│
├── 🧩 components/             # Componentes React
│   ├── WalletMonitorDashboard.tsx  # Dashboard principal
│   ├── ControlPanel.tsx            # Panel de control
│   ├── WalletInfo.tsx              # Información de wallet
│   ├── EventsLog.tsx               # Log de eventos
│   ├── TransactionsList.tsx        # Lista de transacciones
│   └── index.ts                    # Exportaciones
│
├── 🔧 services/               # Servicios backend
│   ├── monitoringService.ts   # Orquestador principal
│   ├── cryptoApiService.ts    # Servicio Ethereum
│   ├── zkSyncService.ts       # Servicio ZKSync
│   └── priceService.ts        # Servicio de precios
│
├── 🎣 hooks/                  # Hooks personalizados
│   └── useWalletMonitoring.ts # Hook principal de estado
│
├── 🏗️ types/                  # Definiciones TypeScript
│   └── crypto.ts              # Interfaces y tipos
│
└── ⚙️ config/                 # Configuración
    └── index.ts               # Config multi-blockchain
```

## 🔄 Flujo de Datos

### Arquitectura de Servicios
```
🎯 MonitoringService (Orquestador)
    ↓
🔌 BlockchainService Interface
    ├── 🟦 CryptoApiService (Ethereum)
    └── 🔷 ZKSyncService (ZKSync Era/Sepolia)
```

### Proceso de Monitoreo
1. **Inicialización** → Cargar estado inicial de wallet
2. **Polling** → Verificar cambios cada 15 segundos
3. **Comparación** → Detectar diferencias en balance/transacciones
4. **Eventos** → Emitir notificaciones tipadas
5. **UI Update** → Actualizar interfaz reactivamente

## 🔍 Tipos y Interfaces

### Eventos de Monitoreo
```typescript
interface MonitoringEvent {
  type: 'balance_change' | 'new_transaction' | 'error' | 'status';
  timestamp: Date;
  data: BalanceChangeEventData | NewTransactionEventData | StatusEventData | ErrorEventData;
  message: string;
}
```

### Información de Wallet
```typescript
interface WalletInfo {
  address: string;
  balance: number;
  balanceUSD?: number;
  transactionCount: number;
  currency: string;
  network: string;
  tokens?: Token[];
  lastUpdated: Date;
}
```

## 🌐 APIs y Endpoints

### Ethereum (Crypto APIs)
- **Balance**: `/blockchain-data/ethereum/mainnet/addresses/{address}/balance`
- **Transacciones**: `/blockchain-data/ethereum/mainnet/addresses/{address}/transactions`

### ZKSync Era/Sepolia
- **Provider RPC**: Interacción directa con zksync-ethers
- **Block Explorer**: APIs de `block-explorer-api.mainnet.zksync.io`

### Precios
- **CoinGecko**: Precios en tiempo real de ETH y tokens

## 🧪 Modo Demo

### Datos Mock Incluidos
- **Balances simulados** con variaciones realistas
- **Transacciones ficticias** con hashes válidos
- **Eventos aleatorios** para demostrar funcionalidad
- **Precios USD** simulados pero consistentes

### Uso Sin API Keys
```bash
# La aplicación funciona completamente sin configuración
npm run dev
# ✅ Todos los features disponibles con datos de prueba
```

## 🔒 Seguridad y Buenas Prácticas

- ✅ **Variables de entorno** para API keys sensibles
- ✅ **Validación de direcciones** Ethereum/ZKSync
- ✅ **Manejo de errores** con fallbacks graceful
- ✅ **Rate limiting** respetado en todas las APIs
- ✅ **Sanitización** de inputs del usuario
- ✅ **HTTPS** obligatorio para todas las peticiones

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor desarrollo con hot reload
npm run dev --turbo  # Desarrollo con Turbopack (más rápido)

# Producción
npm run build        # Build optimizado para producción
npm run start        # Servidor de producción

# Calidad de código
npm run lint         # ESLint para calidad de código
npm run type-check   # Verificación de tipos TypeScript
```

## 📚 Referencias y Documentación

### APIs Utilizadas
- [Crypto APIs Docs](https://developers.cryptoapis.io/) - Ethereum data
- [ZKSync Docs](https://docs.zksync.io/) - ZKSync integration  
- [zksync-ethers](https://docs.zksync.io/sdk/js/ethers) - ZKSync provider
- [CoinGecko API](https://www.coingecko.com/en/api) - Price data

### Tecnologías
- [Next.js 15](https://nextjs.org/docs) - React framework
- [TailwindCSS 4](https://tailwindcss.com/docs) - Utility-first CSS
- [TypeScript 5](https://www.typescriptlang.org/docs/) - Type safety

### Block Explorers
- [Etherscan](https://etherscan.io/) - Ethereum transactions
- [ZKSync Explorer](https://explorer.zksync.io/) - ZKSync Era
- [ZKSync Sepolia](https://sepolia.explorer.zksync.io/) - Testnet

## 🤝 Contribución

### Proceso de Desarrollo
1. **Fork** el repositorio
2. **Crear rama** feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. **Push** rama (`git push origin feature/nueva-funcionalidad`)
5. **Abrir Pull Request** con descripción detallada

### Estándares de Código
- ✅ **ESLint** configurado y sin errores
- ✅ **TypeScript** estricto sin `any` types
- ✅ **Commits semánticos** (feat:, fix:, docs:)
- ✅ **Tests** para nuevas funcionalidades
- ✅ **Documentación** actualizada

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

## ⚠️ Disclaimer

### Importante
- **Solo para fines educativos y demostrativos**
- **No usar para decisiones financieras**
- **Las APIs tienen límites de rate** - respetar términos de uso
- **Los datos pueden tener latencia** según la red blockchain
- **Verificar transacciones** en explorers oficiales

---

<div align="center">

**🔍 Wallet Tracker Demo** - Monitoreo inteligente de wallets multi-blockchain

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![ZKSync](https://img.shields.io/badge/ZKSync-Era-8C8DFC)](https://zksync.io/)

</div>
