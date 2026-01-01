const express = require('express');
const http = require('http');
const app = express();
const fs = require('fs');

const RPC_PORT = 8336;
const COOKIE_PATH = '/root/.tetsuo/.cookie';

async function rpc(method, params = []) {
  const cookie = fs.readFileSync(COOKIE_PATH, 'utf8').trim();
  const [user, pass] = cookie.split(':');

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ jsonrpc: '1.0', method, params });
    const options = {
      hostname: '127.0.0.1',
      port: RPC_PORT,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(user + ':' + pass).toString('base64')
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) reject(json.error);
          else resolve(json.result);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const matrixCSS = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'VT323', 'Share Tech Mono', monospace;
    background: #000;
    color: #00ff00;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Matrix Rain Canvas */
  #matrix-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.15;
  }

  /* Scanlines */
  body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    z-index: 1000;
  }

  /* CRT Flicker */
  @keyframes flicker {
    0% { opacity: 0.97; }
    50% { opacity: 1; }
    100% { opacity: 0.98; }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    animation: flicker 0.15s infinite;
  }

  /* Terminal Header */
  .header {
    border: 2px solid #00ff00;
    padding: 20px;
    margin-bottom: 20px;
    background: rgba(0, 20, 0, 0.8);
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1);
  }

  .header-title {
    font-size: 2.5em;
    text-align: center;
    text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
    letter-spacing: 5px;
  }

  .ascii-art {
    font-size: 0.6em;
    line-height: 1.1;
    text-align: center;
    color: #00cc00;
    margin-bottom: 10px;
    white-space: pre;
  }

  .terminal-prompt {
    color: #00ff00;
    font-size: 1.2em;
    margin-top: 15px;
    text-align: center;
  }

  .terminal-prompt::before {
    content: "root@tetsuo:~# ";
    color: #00cc00;
  }

  /* Search Box */
  .search-container {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }

  .search-box {
    display: flex;
    border: 2px solid #00ff00;
    background: #000;
    width: 100%;
    max-width: 600px;
  }

  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 15px;
    color: #00ff00;
    font-family: 'VT323', monospace;
    font-size: 1.2em;
    outline: none;
  }

  .search-box input::placeholder {
    color: #006600;
  }

  .search-box button {
    background: #00ff00;
    border: none;
    padding: 15px 25px;
    color: #000;
    font-family: 'VT323', monospace;
    font-size: 1.2em;
    cursor: pointer;
    font-weight: bold;
  }

  .search-box button:hover {
    background: #00cc00;
    box-shadow: 0 0 20px #00ff00;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
  }

  .stat-box {
    border: 1px solid #00ff00;
    padding: 20px;
    background: rgba(0, 20, 0, 0.6);
    text-align: center;
  }

  .stat-box::before {
    content: ">";
    color: #00cc00;
    margin-right: 5px;
  }

  .stat-label {
    color: #00cc00;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .stat-value {
    font-size: 2em;
    text-shadow: 0 0 10px #00ff00;
    margin-top: 5px;
  }

  /* Blocks Table */
  .blocks-section {
    border: 2px solid #00ff00;
    background: rgba(0, 20, 0, 0.6);
    padding: 20px;
  }

  .section-title {
    font-size: 1.5em;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #00ff00;
  }

  .section-title::before {
    content: "[ ";
    color: #00cc00;
  }

  .section-title::after {
    content: " ]";
    color: #00cc00;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid #00ff00;
    color: #00cc00;
    text-transform: uppercase;
    font-size: 0.9em;
    letter-spacing: 1px;
  }

  td {
    padding: 12px 10px;
    border-bottom: 1px solid #003300;
  }

  tr:hover {
    background: rgba(0, 255, 0, 0.1);
    cursor: pointer;
  }

  a {
    color: #00ff00;
    text-decoration: none;
  }

  a:hover {
    text-shadow: 0 0 10px #00ff00;
  }

  .hash {
    font-size: 0.85em;
    color: #00cc00;
  }

  /* Block Detail */
  .block-detail {
    border: 2px solid #00ff00;
    background: rgba(0, 20, 0, 0.6);
    padding: 20px;
    margin-bottom: 20px;
  }

  .detail-row {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid #003300;
  }

  .detail-label {
    width: 180px;
    color: #00cc00;
  }

  .detail-label::before {
    content: "> ";
  }

  .detail-value {
    flex: 1;
    word-break: break-all;
  }

  /* Navigation */
  .nav-buttons {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .nav-btn {
    border: 1px solid #00ff00;
    background: transparent;
    color: #00ff00;
    padding: 10px 20px;
    font-family: 'VT323', monospace;
    font-size: 1.1em;
    cursor: pointer;
    text-decoration: none;
  }

  .nav-btn:hover {
    background: #00ff00;
    color: #000;
  }

  /* Not Found */
  .not-found {
    text-align: center;
    padding: 60px 20px;
  }

  .not-found h1 {
    font-size: 4em;
    color: #ff0000;
    text-shadow: 0 0 20px #ff0000;
    margin-bottom: 20px;
  }

  .not-found p {
    font-size: 1.3em;
    color: #00cc00;
    margin-bottom: 30px;
  }

  .glitch {
    animation: glitch 0.3s infinite;
  }

  @keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }

  /* Footer */
  .footer {
    text-align: center;
    padding: 20px;
    color: #006600;
    font-size: 0.9em;
    margin-top: 30px;
    border-top: 1px solid #003300;
  }

  /* Typing animation */
  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }

  .typing {
    overflow: hidden;
    white-space: nowrap;
    animation: typing 2s steps(40);
  }

  /* ✅ MOBILE RESPONSIVE DESIGN */
  @media (max-width: 768px) {
    .container {
      padding: 10px;
    }

    .header {
      padding: 15px;
      margin-bottom: 15px;
    }

    .header-title {
      font-size: 1.8em;
      letter-spacing: 2px;
    }

    .terminal-prompt {
      font-size: 0.9em;
    }

    .terminal-prompt::before {
      content: "root@tetsuo:~# ";
      font-size: 0.8em;
    }

    .search-container {
      margin: 15px 0;
    }

    .search-box {
      flex-direction: column;
    }

    .search-box input {
      padding: 12px;
      font-size: 1em;
      border-bottom: 2px solid #00ff00;
    }

    .search-box button {
      padding: 12px;
      font-size: 1em;
    }

    /* Stack stats vertically on small screens */
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }

    .stat-box {
      padding: 15px;
    }

    .stat-label {
      font-size: 0.8em;
    }

    .stat-value {
      font-size: 1.5em;
    }

    /* Block detail responsive */
    .block-detail {
      padding: 15px;
      margin-bottom: 15px;
    }

    .detail-row {
      flex-direction: column;
      padding: 8px 0;
    }

    .detail-label {
      width: 100%;
      margin-bottom: 5px;
      font-size: 0.9em;
    }

    .detail-value {
      word-break: break-all;
      font-size: 0.9em;
    }

    /* Scrollable table on mobile */
    .blocks-section {
      overflow-x: auto;
      padding: 15px;
    }

    table {
      font-size: 0.85em;
      min-width: 500px;
    }

    th, td {
      padding: 8px 5px;
    }

    .hash {
      font-size: 0.75em;
    }

    .section-title {
      font-size: 1.1em;
      margin-bottom: 10px;
    }
  }

  @media (max-width: 480px) {
    .header-title {
      font-size: 1.4em;
      letter-spacing: 1px;
    }

    .search-box input {
      font-size: 0.95em;
    }

    .search-box button {
      font-size: 0.9em;
      padding: 10px;
    }

    .stat-value {
      font-size: 1.2em;
    }

    .terminal-prompt {
      font-size: 0.8em;
    }

    .detail-label::before {
      content: "";
    }

    table {
      min-width: 100%;
    }
  }
</style>
`;

const matrixScript = `
<script>
// Matrix Rain Effect
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'TETSUO01アイウエオカキクケコサシスセソタチツテト';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00ff00';
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(drawMatrix, 50);

// ✅ AUTO-REFRESH STATS EVERY 5 SECONDS
setInterval(() => {
  fetch('/api/info')
    .then(r => r.json())
    .then(d => {
      const boxes = document.querySelectorAll('.stat-box');
      if(boxes.length >= 4) {
        boxes[0].querySelector('.stat-value').textContent = d.blocks.toLocaleString();
        boxes[1].querySelector('.stat-value').textContent = d.difficulty.toFixed(8);
        boxes[2].querySelector('.stat-value').textContent = (d.connections || 0);
        boxes[3].querySelector('.stat-value').textContent = d.chain.toUpperCase();
      }
    })
    .catch(e => console.log('Stats update failed:', e));
}, 5000);

// ✅ AUTO-REFRESH RECENT BLOCKS EVERY 5 SECONDS
setInterval(() => {
  fetch('/api/blocks/10')
    .then(r => r.json())
    .then(blocks => {
      const tableBody = document.querySelector('.blocks-section table');
      if (!tableBody) return;

      // Preserve the header row (first tr)
      const headerRow = tableBody.querySelector('tr');
      let blocksHtml = '';

      for (const b of blocks) {
        const timeStr = new Date(b.time * 1000).toLocaleString();
        blocksHtml += \`<tr onclick="window.location='/block/\${b.hash}'">
          <td><a href="/block/\${b.hash}">#\${b.height}</a></td>
          <td class="hash">\${b.hash.substring(0,20)}...</td>
          <td>\${timeStr}</td>
          <td>\${b.nTx}</td>
        </tr>\`;
      }

      // Replace all rows except header
      const allRows = tableBody.querySelectorAll('tr');
      allRows.forEach((row, idx) => {
        if (idx > 0) row.remove();
      });

      // Insert new block rows
      tableBody.innerHTML += blocksHtml;
    })
    .catch(e => console.log('Blocks update failed:', e));
}, 5000);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
</script>
`;

const asciiLogo = `
████████╗███████╗████████╗███████╗██╗   ██╗ ██████╗
╚══██╔══╝██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔═══██╗
   ██║   █████╗     ██║   ███████╗██║   ██║██║   ██║
   ██║   ██╔══╝     ██║   ╚════██║██║   ██║██║   ██║
   ██║   ███████╗   ██║   ███████║╚██████╔╝╚██████╔╝
   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝ `;

function notFoundPage(query) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>ACCESS DENIED - TETSUO</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${matrixCSS}
</head>
<body>
  <canvas id="matrix-bg"></canvas>
  <div class="container">
    <div class="not-found">
      <div class="glitch">
        <h1>ERROR 404</h1>
      </div>
      <p>>> ACCESS DENIED: TARGET NOT FOUND IN BLOCKCHAIN</p>
      <div style="border: 1px solid #ff0000; padding: 20px; display: inline-block; margin-bottom: 30px;">
        <span style="color: #ff0000;">QUERY:</span> ${query}
      </div>
      <br>
      <a href="/" class="nav-btn">&lt; RETURN TO MAINFRAME</a>
    </div>
  </div>
  ${matrixScript}
</body>
</html>`;
}

function mainPage(info, blocks) {
  let blocksHtml = '';
  for (const b of blocks) {
    const timeStr = new Date(b.time * 1000).toLocaleString();
    blocksHtml += `<tr onclick="window.location='/block/${b.hash}'">
      <td><a href="/block/${b.hash}">#${b.height}</a></td>
      <td class="hash">${b.hash.substring(0,20)}...</td>
      <td>${timeStr}</td>
      <td>${b.nTx}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <title>TETSUO BLOCKCHAIN // MAINFRAME</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${matrixCSS}
</head>
<body>
  <canvas id="matrix-bg"></canvas>
  <div class="container">
    <div class="header">
      <pre class="ascii-art">${asciiLogo}</pre>
      <div class="header-title">BLOCK EXPLORER</div>
      <div class="terminal-prompt typing">initializing_blockchain_interface...</div>
    </div>

    <form class="search-container" onsubmit="event.preventDefault(); const q=document.getElementById('q').value.trim(); if(!q){ alert('>> ENTER BLOCK HEIGHT OR HASH'); document.getElementById('q').focus(); return; } window.location='/search/'+encodeURIComponent(q);">
      <div class="search-box">
        <input type="text" id="q" placeholder=">> ENTER BLOCK HEIGHT OR HASH..." maxlength="128" />
        <button type="submit" id="searchBtn" disabled>SEARCH</button>
      </div>
    </form>

    <script>
      document.getElementById('q').addEventListener('input', function() {
        document.getElementById('searchBtn').disabled = !this.value.trim();
      });
    </script>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">BLOCK HEIGHT</div>
        <div class="stat-value">${info.blocks.toLocaleString()}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">DIFFICULTY</div>
        <div class="stat-value">${info.difficulty.toFixed(8)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">CONNECTIONS</div>
        <div class="stat-value">${info.connections || 0}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">NETWORK</div>
        <div class="stat-value">${info.chain.toUpperCase()}</div>
      </div>
    </div>

    <div class="blocks-section">
      <div class="section-title">RECENT BLOCKS</div>
      <table>
        <tr>
          <th>HEIGHT</th>
          <th>HASH</th>
          <th>TIMESTAMP</th>
          <th>TXS</th>
        </tr>
        ${blocksHtml}
      </table>
    </div>

    <div class="footer">
      >> TETSUO CHAIN v1.0 // THE SINGULARITY BEGINS WITH A SINGLE BLOCK <<
    </div>
  </div>
  ${matrixScript}
</body>
</html>`;
}

function blockPage(block) {
  let txsHtml = '';
  for (const txid of block.tx) {
    txsHtml += `<tr><td class="hash">${txid}</td></tr>`;
  }

  const timeStr = new Date(block.time * 1000).toLocaleString();

  return `<!DOCTYPE html>
<html>
<head>
  <title>BLOCK #${block.height} // TETSUO</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${matrixCSS}
</head>
<body>
  <canvas id="matrix-bg"></canvas>
  <div class="container">
    <div class="header">
      <div class="header-title">BLOCK #${block.height}</div>
      <div class="terminal-prompt">accessing_block_data...</div>
    </div>

    <div class="nav-buttons">
      <a href="/" class="nav-btn">&lt; MAINFRAME</a>
      ${block.previousblockhash ? `<a href="/block/${block.previousblockhash}" class="nav-btn">&lt;&lt; PREV BLOCK</a>` : ''}
      ${block.nextblockhash ? `<a href="/block/${block.nextblockhash}" class="nav-btn">NEXT BLOCK &gt;&gt;</a>` : ''}
    </div>

    <div class="block-detail">
      <div class="section-title">BLOCK DATA</div>
      <div class="detail-row"><div class="detail-label">HASH</div><div class="detail-value">${block.hash}</div></div>
      <div class="detail-row"><div class="detail-label">HEIGHT</div><div class="detail-value">${block.height}</div></div>
      <div class="detail-row"><div class="detail-label">TIMESTAMP</div><div class="detail-value">${timeStr}</div></div>
      <div class="detail-row"><div class="detail-label">DIFFICULTY</div><div class="detail-value">${block.difficulty}</div></div>
      <div class="detail-row"><div class="detail-label">NONCE</div><div class="detail-value">${block.nonce}</div></div>
      <div class="detail-row"><div class="detail-label">VERSION</div><div class="detail-value">0x${block.versionHex}</div></div>
      <div class="detail-row"><div class="detail-label">MERKLE ROOT</div><div class="detail-value">${block.merkleroot}</div></div>
      <div class="detail-row"><div class="detail-label">TRANSACTIONS</div><div class="detail-value">${block.nTx}</div></div>
      <div class="detail-row"><div class="detail-label">SIZE</div><div class="detail-value">${block.size.toLocaleString()} bytes</div></div>
      <div class="detail-row"><div class="detail-label">WEIGHT</div><div class="detail-value">${block.weight.toLocaleString()}</div></div>
    </div>

    <div class="blocks-section">
      <div class="section-title">TRANSACTIONS</div>
      <table>
        <tr><th>TXID</th></tr>
        ${txsHtml}
      </table>
    </div>

    <div class="footer">
      >> TETSUO CHAIN v1.0 // THE SINGULARITY BEGINS WITH A SINGLE BLOCK <<
    </div>
  </div>
  ${matrixScript}
</body>
</html>`;
}

// API
app.get('/api/info', async (req, res) => {
  try {
    const info = await rpc('getblockchaininfo');
    const netinfo = await rpc('getnetworkinfo');
    info.connections = netinfo.connections;
    res.json(info);
  } catch(e) {
    res.status(500).json({error: e.message || e});
  }
});

app.get('/api/blocks/:n', async (req, res) => {
  try {
    const info = await rpc('getblockchaininfo');
    const blocks = [];
    const n = Math.min(parseInt(req.params.n) || 10, 100);
    for (let i = info.blocks; i >= Math.max(0, info.blocks - n + 1); i--) {
      const hash = await rpc('getblockhash', [i]);
      const block = await rpc('getblock', [hash]);
      blocks.push(block);
    }
    res.json(blocks);
  } catch(e) {
    res.status(500).json({error: e.message || e});
  }
});

app.get('/api/block/:hash', async (req, res) => {
  try {
    const block = await rpc('getblock', [req.params.hash]);
    res.json(block);
  } catch(e) {
    res.status(500).json({error: e.message || e});
  }
});

// Search
app.get('/search/:query', async (req, res) => {
  const query = req.params.query.trim();

  // ✅ BLOCK EMPTY SEARCHES
  if (!query) {
    return res.status(400).send(notFoundPage('EMPTY SEARCH - PLEASE ENTER BLOCK HEIGHT OR HASH'));
  }

  // ✅ LIMIT QUERY LENGTH
  if (query.length > 128) {
    return res.status(400).send(notFoundPage('QUERY TOO LONG (MAX 128 CHARS)'));
  }

  try {
    if (/^\d+$/.test(query)) {
      const height = parseInt(query);
      try {
        const hash = await rpc('getblockhash', [height]);
        return res.redirect('/block/' + hash);
      } catch(e) {}
    }
    if (/^[a-fA-F0-9]{64}$/.test(query)) {
      try {
        const block = await rpc('getblock', [query]);
        if (block) return res.redirect('/block/' + query);
      } catch(e) {
        try {
          const tx = await rpc('getrawtransaction', [query, true]);
          if (tx && tx.blockhash) return res.redirect('/block/' + tx.blockhash);
        } catch(e2) {}
      }
    }
  } catch(e) {}
  res.status(404).send(notFoundPage(query + ' (NOT FOUND)'));
});

// Block page
app.get('/block/:hash', async (req, res) => {
  try {
    const block = await rpc('getblock', [req.params.hash]);
    res.send(blockPage(block));
  } catch(e) {
    res.status(404).send(notFoundPage(req.params.hash));
  }
});

// Main
app.get('/', async (req, res) => {
  try {
    const info = await rpc('getblockchaininfo');
    const netinfo = await rpc('getnetworkinfo');
    info.connections = netinfo.connections;
    const blocks = [];
    for (let i = info.blocks; i >= Math.max(0, info.blocks - 9); i--) {
      const hash = await rpc('getblockhash', [i]);
      const block = await rpc('getblock', [hash]);
      blocks.push(block);
    }
    res.send(mainPage(info, blocks));
  } catch(e) {
    res.status(500).send('SYSTEM ERROR: ' + (e.message || e));
  }
});

app.listen(3000, '127.0.0.1', () => {
  console.log('TETSUO Matrix Explorer running on port 3000');
});

// WALLET API ENDPOINTS
app.get("/api/wallet/balance/:address", async (req, res) => {
  try {
    const address = req.params.address;
    // Use scantxoutset for address balance
    const result = await rpc("scantxoutset", ["start", [`addr(${address})`]]);
    res.json({ balance: result.total_amount || 0 });
  } catch(e) {
    res.json({ balance: 0, error: e.message });
  }
});

app.get("/api/wallet/utxos/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const result = await rpc("scantxoutset", ["start", [`addr(${address})`]]);
    res.json({ utxos: result.unspents || [] });
  } catch(e) {
    res.json({ utxos: [], error: e.message });
  }
});

app.post("/api/wallet/broadcast", express.json(), async (req, res) => {
  try {
    const { hex } = req.body;
    const txid = await rpc("sendrawtransaction", [hex]);
    res.json({ txid });
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});
