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
- **Network Statistics** (updated every 5 seconds):
  - Block height
  - Difficulty
  - Active connections
  - Network chain status
- **Recent Blocks Table** (updated every 5 seconds):
  - Height, Hash, Timestamp, Transaction count
  - Click to view block details
- **Matrix Rain Background**: Animated ASCII art effect
- **Search Bar**: Input validation with real-time feedback

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

## 5b. Real-Time Updates (Client-Side)

### Stats Refresh
```javascript
// Updates every 5 seconds
setInterval(() => {
  fetch('/api/info')
    .then(r => r.json())
    .then(d => {
      // Updates 4 stat boxes:
      // - BLOCK HEIGHT
      // - DIFFICULTY
      // - CONNECTIONS
      // - NETWORK
    })
}, 5000);
```

### Recent Blocks Refresh
```javascript
// Updates table every 5 seconds
setInterval(() => {
  fetch('/api/blocks/10')
    .then(r => r.json())
    .then(blocks => {
      // Regenerates recent blocks table with latest data
      // Preserves header row and click handlers
    })
}, 5000);
```

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
3. **Input Validation**:
   - All search queries validated on server and client
   - Maximum 128 character limit prevents buffer overflow
   - Empty searches blocked with validation message
   - Regex validation for block heights (0-999999999) and hashes (64 hex chars)
4. **CORS**: Configure appropriate CORS headers for wallet API
5. **SSL**: Always use HTTPS in production
6. **Search Form Security**:
   - Client-side: Button disabled until input filled
   - Server-side: Empty queries rejected immediately
   - Input sanitization prevents injection attacks
   - Graceful error messages for invalid queries

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

## 9. Responsive Design

### Media Query Breakpoints
- **Desktop**: Full layout with optimal spacing
- **Tablet (768px)**: Single-column stats, adjusted font sizes
- **Mobile (480px)**: Minimal spacing, touch-optimized buttons

### CSS Features
```css
/* Tablet devices (max-width: 768px) */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr; /* Stack vertically */
  }
  .header-title {
    font-size: 1.8em;
  }
  .search-box {
    flex-direction: column;
  }
}

/* Phone devices (max-width: 480px) */
@media (max-width: 480px) {
  .header-title {
    font-size: 1.4em;
  }
  .stat-value {
    font-size: 1.2em;
  }
  /* Tables become horizontally scrollable */
}
```

### Mobile Optimizations
- **Stat boxes**: Stack vertically on mobile
- **Search bar**: Button below input on mobile
- **Tables**: Horizontally scrollable with proper padding
- **Typography**: Scaled font sizes for readability
- **Buttons**: Touch-friendly padding (12px minimum)

---

## 10. Running the Explorer

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

## 11. Recent Updates (January 2026)

### Real-Time Features
- ✅ Network statistics update every 5 seconds
- ✅ Recent blocks table updates every 5 seconds
- ✅ No manual refresh required

### Mobile & UI
- ✅ Responsive CSS for tablets (768px) and mobile (480px)
- ✅ Touch-friendly interface
- ✅ Horizontally scrollable tables on mobile

### Security
- ✅ Search input validation (server + client)
- ✅ Maximum 128 character limit
- ✅ Injection prevention
- ✅ Graceful error messages

---

*Last Updated: January 2026*
