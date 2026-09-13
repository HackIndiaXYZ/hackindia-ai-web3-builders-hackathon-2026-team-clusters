const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const WebSocket = require('c:\\Users\\tiwar\\Desktop\\echomesh\\node_modules\\ws');

async function run() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9270',
    '--window-size=1440,1100',
    '--user-data-dir=C:\\Users\\tiwar\\AppData\\Local\\Temp\\chrome_cdp_feat_btn',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const targets = await new Promise((res, rej) => http.get('http://127.0.0.1:9270/json', r => {
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

  // 1. Switch to Hindi and scroll to the core feature buttons
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const hiBtn = btns.find(b => b.innerText.trim() === 'हिं');
      if (hiBtn) hiBtn.click();
      const el = document.getElementById('core-feat-sos');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Capture strip showing working buttons
  const stripShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\tiwar\\.gemini\\antigravity-ide\\brain\\e3563e87-32a2-40cf-9a61-3def75af039d\\feature_buttons_strip.png', Buffer.from(stripShot.data, 'base64'));
  console.log('Saved feature_buttons_strip.png');

  // 2. Click SOS button
  await send('Runtime.evaluate', {
    expression: `
      document.getElementById('core-feat-sos').click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Simulate SOS in modal
  await send('Runtime.evaluate', {
    expression: `
      const b = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText.includes('SOS प्रसारित'));
      if (b) b.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const sosModalShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\tiwar\\.gemini\\antigravity-ide\\brain\\e3563e87-32a2-40cf-9a61-3def75af039d\\feature_modal_sos.png', Buffer.from(sosModalShot.data, 'base64'));
  console.log('Saved feature_modal_sos.png');

  // 3. Close modal and click AI Assistant
  await send('Runtime.evaluate', {
    expression: `
      const closeBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText.trim() === '✕');
      if (closeBtn) closeBtn.click();
      setTimeout(() => {
        document.getElementById('core-feat-ai').click();
      }, 300);
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Click quick question
  await send('Runtime.evaluate', {
    expression: `
      const qBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText.includes('पानी शुद्ध'));
      if (qBtn) qBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const aiModalShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\tiwar\\.gemini\\antigravity-ide\\brain\\e3563e87-32a2-40cf-9a61-3def75af039d\\feature_modal_ai.png', Buffer.from(aiModalShot.data, 'base64'));
  console.log('Saved feature_modal_ai.png');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
