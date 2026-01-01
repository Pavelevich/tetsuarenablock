# TETSUO Block Explorer & Wallet API

Block explorer and wallet API backend for the TETSUO blockchain, powering tetsuoarena.com.

## Features

- Block explorer with transaction history
- Address lookup and balance checking
- UTXO management API for wallet integration
- Transaction broadcasting
- Real-time blockchain statistics (updates every 5 seconds)
- Real-time recent blocks display (updates every 5 seconds)
- Mobile responsive design (optimized for all devices)
- Search security with input validation and injection prevention

## API Endpoints

### Wallet API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wallet/utxos/{address}` | GET | Get unspent outputs for address |
| `/api/wallet/balance/{address}` | GET | Get address balance |
| `/api/wallet/broadcast` | POST | Broadcast signed transaction |
| `/api/wallet/transactions/{address}` | GET | Get transaction history |

### Explorer API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/info` | GET | Network statistics (blocks, difficulty, connections, chain) |
| `/api/blocks/:n` | GET | Get last N blocks (max 100) |
| `/api/block/:hash` | GET | Get block by hash |
| `/api/wallet/utxos/:address` | GET | Get UTXOs for address |
| `/api/wallet/broadcast` | POST | Broadcast signed transaction |

## API Response Examples

### Get UTXOs
```json
GET /api/wallet/utxos/T1abc123...

{
  "utxos": [
    {
      "txid": "abc123...",
      "vout": 0,
      "amount": 10000.0,
      "scriptPubKey": "76a914...88ac",
      "height": 1234
    }
  ],
  "error": null
}
```

### Get Balance
```json
GET /api/wallet/balance/T1abc123...

{
  "balance": 50000.0,
  "confirmed": 50000.0,
  "unconfirmed": 0.0
}
```

### Broadcast Transaction
```json
POST /api/wallet/broadcast
Content-Type: application/json

{
  "txHex": "0100000001..."
}

Response:
{
  "txid": "def456...",
  "success": true
}
```

## Network Configuration

| Parameter | Value |
|-----------|-------|
| Blockchain RPC | localhost:9332 |
| P2P Port | 9333 |
| Explorer URL | https://tetsuoarena.com |

## RPC Connection

The API connects to the TETSUO node via RPC:

```javascript
const rpc = {
  host: 'localhost',
  port: 9332,
  user: 'tetsuorpc',
  pass: 'your_password'
};
```

## UI Features

### Real-Time Updates
- **Network Stats**: Block height, difficulty, connections, and chain status update every 5 seconds
- **Recent Blocks**: Latest 10 blocks display updates automatically without page refresh
- **Live Fetching**: Uses `/api/info` and `/api/blocks/10` endpoints for real-time data

### Security & Validation
- **Search Input Validation**:
  - Client-side: Disabled submit button until text entered
  - Server-side: Blocks empty searches, max 128 character limit
  - Prevents injection attacks with proper input sanitization
- **Error Handling**: Graceful error messages for invalid queries

### Responsive Design
- **Mobile Optimized**: CSS media queries for tablets (768px) and phones (480px)
- **Touch-Friendly**: Properly sized buttons and inputs for mobile
- **Adaptive Layout**: Single-column layout on mobile, multi-column on desktop
- **Scrollable Tables**: Horizontal scroll for wide content on mobile

## Deployment

### Requirements
- Node.js 18+
- TETSUO node running with RPC enabled
- nginx (reverse proxy)
- SSL certificate

### Environment Variables
```
RPC_HOST=localhost
RPC_PORT=9332
RPC_USER=tetsuorpc
RPC_PASS=your_password
PORT=3000
```

## Tech Stack

- Backend: Node.js / Express
- Database: SQLite (tx indexing)
- Frontend: HTML/CSS/JS
- Proxy: nginx

## License

MIT
