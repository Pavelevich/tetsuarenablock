# TETSUO Block Explorer & Wallet API

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-tetsuarenablock-blue.svg)](https://github.com/Pavelevich/tetsuarenablock)

**Backend for TETSUO Block Explorer & Wallet API**

Complete Node.js/Express backend powering [tetsuoarena.com](https://tetsuoarena.com) - the live block explorer for the TETSUO blockchain.

Provides wallet APIs for balance queries, UTXO management, and transaction broadcasting. Includes a responsive web frontend for blockchain exploration.

## Quick Start

### Requirements
- Node.js 18+
- TETSUO blockchain node with RPC enabled
- nginx (for production)

### Installation

```bash
git clone https://github.com/Pavelevich/tetsuarenablock.git
cd tetsuarenablock
npm install
```

### Configuration

Set environment variables in `.env`:

```bash
TETSUO_RPC_URL=http://localhost:8332
TETSUO_RPC_USER=rpcuser
TETSUO_RPC_PASSWORD=rpcpassword
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tetsuoarena.com
```

### Run

```bash
npm start
```

Server runs on `http://localhost:3000`

## Features

- Real-time blockchain data (updates every 5 seconds)
- Transaction lookup by TXID
- Address balance and transaction history
- UTXO management for wallet integration
- Transaction broadcasting
- Mobile-responsive web interface
- Input validation and injection prevention
- SQLite transaction indexing

## API Endpoints

### Wallet API

**Get Balance**
```
GET /api/wallet/balance/{address}
```

**Get UTXOs**
```
GET /api/wallet/utxos/{address}
```

**Get Transaction History**
```
GET /api/wallet/transactions/{address}
```

**Broadcast Transaction**
```
POST /api/wallet/broadcast
Content-Type: application/json
{ "txHex": "..." }
```

### Explorer API

**Get Block**
```
GET /api/block/{blockHeight|blockHash}
```

**Get Transaction**
```
GET /api/tx/{txid}
```

**Get Network Info**
```
GET /api/network/info
```

## Architecture

- **Backend**: Node.js + Express.js
- **Database**: SQLite (transaction indexing)
- **RPC**: Direct connection to TETSUO node
- **Proxy**: nginx (reverse proxy + SSL)
- **Frontend**: HTML5, CSS3, JavaScript

## Deployment

### Production Setup

1. **SSL Certificate** (Let's Encrypt)
```bash
certbot certonly --standalone -d tetsuoarena.com
```

2. **nginx Reverse Proxy**
```nginx
server {
  listen 443 ssl http2;
  server_name tetsuoarena.com;

  ssl_certificate /etc/letsencrypt/live/tetsuoarena.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/tetsuoarena.com/privkey.pem;

  location /api {
    proxy_pass http://localhost:3000;
  }

  location / {
    root /var/www/tetsuarenablock/public;
    try_files $uri $uri/ /index.html;
  }
}
```

3. **Process Manager** (PM2)
```bash
npm install -g pm2
pm2 start server.js --name "tetsuo-explorer"
pm2 startup
pm2 save
```

## Security

- Input validation on all API endpoints
- SQL injection prevention
- Rate limiting (100 req/min per IP)
- CORS restrictions
- HTTPS enforced
- XSS prevention

## Documentation

- API Reference: `BLOCK_EXPLORER_DOCUMENTATION.md`
- Changelog: `CHANGELOG.md`

## Related Projects

- **TETSUO Node**: [github.com/Pavelevich/tetsuonode](https://github.com/Pavelevich/tetsuonode)
- **Wallet SDK**: [github.com/Pavelevich/tetsuonpmwallet](https://github.com/Pavelevich/tetsuonpmwallet)

## License

MIT License - see LICENSE file

## Support

- Issues: [GitHub Issues](https://github.com/Pavelevich/tetsuarenablock/issues)
- Live Explorer: [tetsuoarena.com](https://tetsuoarena.com)
