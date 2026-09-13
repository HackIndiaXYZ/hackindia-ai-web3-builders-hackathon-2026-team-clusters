const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const WebSocket = require('c:\\Users\\tiwar\\Desktop\\echomesh\\node_modules\\ws');

async function run() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9265',
    '--window-size=1440,1100',
    '--user-data-dir=C:\\Users\\tiwar\\AppData\\Local\\Temp\\chrome_cdp_hindi_quote',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const targets = await new Promise((res, rej) => http.get('http://127.0.0.1:9265/json', r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
  }).on('error', rej));
  const page = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  let id = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const msgId = id++;
    const h = (d) => {
      const m = JSON.parse(d);
      if (m.id === msgId) { ws.off('message', h); if (m.error) rej(m.error); else res(m.result); }
    };
    ws.on('message', h);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:4000' });
  await new Promise(r => setTimeout(r, 2500));

  // Click Hindi toggle button
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const hiBtn = btns.find(b => b.innerText.trim() === 'हिं');
      if (hiBtn) hiBtn.click();
      window.scrollTo(0, 0);
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\tiwar\\.gemini\\antigravity-ide\\brain\\e3563e87-32a2-40cf-9a61-3def75af039d\\hero_new_hindi_quote.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved hero_new_hindi_quote.png successfully');
  ws.close();
  chrome.kill();
  process.exit(0);
}
run();
