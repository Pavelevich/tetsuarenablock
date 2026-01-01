# TETSUO Block Explorer - Technical Documentation

## Overview

The TETSUO Block Explorer provides a web interface and REST API for exploring the TETSUO blockchain. It connects to a local TETSUO node via JSON-RPC and exposes data through a user-friendly interface.

---

## 1. Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web Browser   │────▶│   nginx (SSL)    │────▶│  Node.js API    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  TETSUO Node    │
                                                 │  (tetsuod RPC)  │
                                                 └─────────────────┘
```

---

## 2. RPC Methods Used

The explorer uses these TETSUO node RPC methods:

### Blockchain Info
```bash
tetsuo-cli getblockchaininfo
tetsuo-cli getblockcount
tetsuo-cli getblockhash <height>
tetsuo-cli getblock <hash> [verbosity]
```

### Transaction Info
```bash
tetsuo-cli getrawtransaction <txid> true
tetsuo-cli decoderawtransaction <hex>
```

### Address/UTXO Info
```bash
tetsuo-cli scantxoutset start '["addr(<address>)"]'
tetsuo-cli listunspent 0 9999999 '["<address>"]'
```

### Broadcasting
```bash
tetsuo-cli sendrawtransaction <hex>
```

---

## 3. Database Schema

### Transactions Index
```sql
CREATE TABLE transactions (
    txid TEXT PRIMARY KEY,
    block_hash TEXT,
    block_height INTEGER,
    timestamp INTEGER,
    raw_tx TEXT
);

CREATE INDEX idx_block_height ON transactions(block_height);
```

### Address Index
```sql
CREATE TABLE address_txs (
    address TEXT,
    txid TEXT,
    is_input BOOLEAN,
    amount REAL,
    block_height INTEGER,
    PRIMARY KEY (address, txid)
);

CREATE INDEX idx_address ON address_txs(address);
```

---

## 4. API Implementation

### UTXO Endpoint
```javascript
app.get('/api/wallet/utxos/:address', async (req, res) => {
    const { address } = req.params;

    // Validate TETSUO address (starts with 'T')
    if (!address.startsWith('T')) {
        return res.json({ utxos: [], error: 'Invalid address' });
    }

    try {
        // Use scantxoutset for UTXO lookup
        const result = await rpc.call('scantxoutset', [
            'start',
            [`addr(${address})`]
        ]);

        const utxos = result.unspents.map(u => ({
            txid: u.txid,
            vout: u.vout,
            amount: u.amount,
            scriptPubKey: u.scriptPubKey,
            height: u.height
        }));

        res.json({ utxos, error: null });
    } catch (err) {
        res.json({ utxos: [], error: err.message });
    }
});
```

### Balance Endpoint
```javascript
app.get('/api/wallet/balance/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const result = await rpc.call('scantxoutset', [
            'start',
            [`addr(${address})`]
        ]);

        res.json({
            balance: result.total_amount,
            confirmed: result.total_amount,
            unconfirmed: 0
        });
    } catch (err) {
        res.json({ balance: 0, error: err.message });
    }
});
```

### Broadcast Endpoint
```javascript
app.post('/api/wallet/broadcast', async (req, res) => {
    const { txHex } = req.body;

    if (!txHex) {
        return res.json({ success: false, error: 'Missing txHex' });
    }

    try {
        const txid = await rpc.call('sendrawtransaction', [txHex]);
        res.json({ txid, success: true });
    } catch (err) {
        res.json({
            success: false,
            error: err.message
        });
    }
});
```

---

## 5. Frontend Pages

### Home Page (`/`)
- Network statistics (height, hashrate, difficulty)
- Latest blocks list
- Latest transactions list

### Block Page (`/block/:hash`)
- Block header info
- Transaction list
- Previous/Next navigation

### Transaction Page (`/tx/:txid`)
- Input/Output details
- Confirmations count
- Fee calculation

### Address Page (`/address/:addr`)
- Balance display
- Transaction history
- UTXO list

---

## 6. nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name tetsuoarena.com;

    ssl_certificate /etc/letsencrypt/live/tetsuoarena.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tetsuoarena.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 7. Security Considerations

1. **RPC Access**: Only allow localhost connections to RPC
2. **Rate Limiting**: Implement request rate limiting
3. **Input Validation**: Validate all addresses and transaction hex
4. **CORS**: Configure appropriate CORS headers for wallet API
5. **SSL**: Always use HTTPS in production

---

## 8. Monitoring

### Health Check
```javascript
app.get('/api/health', async (req, res) => {
    try {
        const info = await rpc.call('getblockchaininfo');
        res.json({
            status: 'ok',
            height: info.blocks,
            chain: info.chain
        });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});
```

---

## 9. Running the Explorer

```bash
# Install dependencies
npm install

# Set environment
export RPC_USER=tetsuorpc
export RPC_PASS=your_password

# Start server
node server.js

# Or with PM2
pm2 start server.js --name tetsuo-explorer
```

---

*Last Updated: January 2026*
