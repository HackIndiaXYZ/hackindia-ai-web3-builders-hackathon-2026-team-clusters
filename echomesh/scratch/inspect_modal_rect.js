const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('c:\\Users\\tiwar\\Desktop\\echomesh\\node_modules\\ws');

const OUT_DIR = 'C:\\Users\\tiwar\\.gemini\\antigravity-ide\\brain\\e3563e87-32a2-40cf-9a61-3def75af039d';

async function run() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--window-size=1280,1050',
    '--user-data-dir=C:\\Users\\tiwar\\AppData\\Local\\Temp\\chrome_cdp_inspect',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9226/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let msgId = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (data) => {
        const msg = JSON.parse(data);
        if (msg.id === id) {
          ws.off('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:4000' });
  await new Promise(r => setTimeout(r, 2500));

  // Set Hindi and click button
  await send('Runtime.evaluate', {
    expression: `
      const dismissBtn = document.querySelector('button[title="Dismiss Alert"]') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('अलर्ट हटाएं') || b.innerText.includes('Dismiss'));
      if (dismissBtn) dismissBtn.click();

      const hiBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'हिं');
      if (hiBtn) hiBtn.click();

      setTimeout(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('उपकरण जुड़े हैं') || b.innerText.includes('Nodes Linked'));
        if (btn) btn.click();
      }, 500);
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Inspect DOM rects
  const rectInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.querySelector('div.bg-white.rounded-3xl.max-w-2xl');
        if (!modal) return { found: false };
        const rect = modal.getBoundingClientRect();
        return {
          found: true,
          window: { innerW: window.innerWidth, innerH: window.innerHeight },
          modal: { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
          children: Array.from(modal.children).map(c => ({
            tag: c.tagName,
            cls: c.className,
            h: c.getBoundingClientRect().height
          }))
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Rect info:', JSON.stringify(rectInfo.result.value, null, 2));

  // Capture screenshot of the modal node specifically!
  const nodeResult = await send('DOM.getDocument');
  const searchResult = await send('DOM.performSearch', { query: 'div.bg-white.rounded-3xl.max-w-2xl' });
  const nodeIds = await send('DOM.getSearchResults', {
    searchId: searchResult.searchId,
    fromIndex: 0,
    toIndex: 1
  });

  if (nodeIds.nodeIds && nodeIds.nodeIds.length > 0) {
    const box = await send('DOM.getBoxModel', { nodeId: nodeIds.nodeIds[0] });
    console.log('Box model:', box.model.border);
  }

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT_DIR, 'inspected_modal.png'), Buffer.from(ss.data, 'base64'));

  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
