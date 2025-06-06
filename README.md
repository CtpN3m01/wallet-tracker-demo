# 🔍 Wallet Tracker Demo

Una aplicación web de demostración que implementa monitoreo en tiempo real de direcciones de wallet en múltiples blockchains incluyendo Ethereum, ZKSync Era y ZKSync Sepolia.

## 🎯 Objetivo

Implementar un servicio que monitoree en tiempo real direcciones de wallet en múltiples blockchains utilizando diferentes APIs. El servicio detecta cambios en el balance de las direcciones y notifica inmediatamente cuando se reciben nuevas transacciones.

## ✨ Características

- 🔄 **Monitoreo en tiempo real** de direcciones de wallet
- 🌐 **Soporte multi-blockchain** (Ethereum, ZKSync Era, ZKSync Sepolia)
- 💰 **Detección de cambios de balance** automática
- 📈 **Notificaciones de nuevas transacciones** entrantes y salientes
- 📊 **Visualización de transacciones recientes**
- 🎛️ **Panel de control intuitivo** con direcciones de ejemplo por blockchain
- 📋 **Log de eventos** en tiempo real
- 🔄 **Cambio dinámico** entre blockchains
- 🎨 **Interfaz moderna** con TailwindCSS
- 🔒 **Manejo de errores** robusto
- 🧪 **Datos mock** para demo sin API keys

## 🛠️ Tecnologías

- **Next.js 15** con App Router
- **TypeScript** para tipado estático
- **TailwindCSS** para estilos
- **Axios** para peticiones HTTP
- **React Hooks** para gestión de estado
- **Crypto APIs** para datos de Ethereum
- **zksync-ethers** para soporte de ZKSync Era
- **ethers.js** para interacción con blockchain

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone <repo-url>
   cd wallet-tracker-demo
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno** (opcional)
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` y añade tu API key de Crypto APIs:
   ```
   NEXT_PUBLIC_CRYPTO_API_KEY=tu_api_key_aqui
   ```

4. **Ejecuta la aplicación**
   ```bash
   npm run dev
   ```

5. **Abre el navegador**
   ```
   http://localhost:3000
   ```

## 🔑 Configuración de API

### Obtener API Key de Crypto APIs

1. Regístrate en [Crypto APIs](https://developers.cryptoapis.io/)
2. Obtén tu API key del dashboard
3. Añade la key al archivo `.env.local`

### Modo Demo (Sin API Key)

La aplicación funciona sin API key usando datos mock simulados para demostración.

## 🎮 Uso

### Selección de Blockchain

1. **Elige el blockchain** desde el selector:
   - **Ethereum** (Mainnet) - Usa Crypto APIs
   - **ZKSync Era** (Mainnet) - Usa ZKSync provider y block explorer
   - **ZKSync Sepolia** (Testnet) - Usa ZKSync provider y block explorer de testnet
2. Las direcciones de ejemplo se actualizarán automáticamente

### Panel de Control

1. **Introduce una dirección** de wallet válida para el blockchain seleccionado
2. **Usa direcciones de ejemplo** del dropdown (Vitalik, Ethereum Foundation, etc.)
3. **Inicia el monitoreo** con el botón verde
4. **Observa los eventos** en tiempo real

### Funcionalidades

- **Monitoreo automático** cada 15 segundos
- **Detección de nuevas transacciones** entrantes
- **Alertas de cambios de balance**
- **Visualización de transacciones** recientes
- **Enlaces a Etherscan** para explorar transacciones

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── page.tsx           # Página principal
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── WalletMonitorDashboard.tsx
│   ├── WalletInfo.tsx
│   ├── EventsLog.tsx
│   ├── TransactionsList.tsx
│   └── ControlPanel.tsx
├── services/              # Servicios de backend
│   ├── cryptoApiService.ts
│   └── monitoringService.ts
├── hooks/                 # Hooks personalizados
│   └── useWalletMonitoring.ts
├── types/                 # Tipos TypeScript
│   └── crypto.ts
└── config/                # Configuración
    └── index.ts
```

## 🔄 Flujo de Funcionamiento

1. **Inicialización**: Se carga el estado inicial de la wallet
2. **Polling**: Cada 30 segundos se consulta la API
3. **Comparación**: Se compara el estado actual con el anterior
4. **Detección**: Se identifican cambios en balance y nuevas transacciones
5. **Notificación**: Se emiten eventos y se actualiza la UI

## 🧪 Características de Demo

- **Datos mock** realistas cuando no hay API key
- **Simulación de transacciones** aleatorias
- **Addresses de ejemplo** de wallets conocidas
- **Interfaz responsive** para móvil y desktop

## 📚 Referencias

- [Documentación de Crypto APIs](https://developers.cryptoapis.io/)
- [Endpoint Get Address Balance](https://developers.cryptoapis.io/api/blockchain-data/get-address-balance)
- [Endpoint List Confirmed Transactions](https://developers.cryptoapis.io/api/blockchain-data/list-confirmed-transactions-by-address)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## ⚠️ Disclaimer

Esta aplicación es solo para fines demostrativos y educativos. No debe usarse para decisiones financieras importantes.
