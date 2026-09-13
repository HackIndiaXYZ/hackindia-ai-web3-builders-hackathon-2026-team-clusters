const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('c:\\Users\\tiwar\\Desktop\\echomesh\\node_modules\\ws');

const OUT_DIR = 'C:\\Users\\tiwar\\.gemini\\antigravity-ide\\brain\\e3563e87-32a2-40cf-9a61-3def75af039d';

async function run() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9260',
    '--window-size=1440,1100',
    '--user-data-dir=C:\\Users\\tiwar\\AppData\\Local\\Temp\\chrome_cdp_landing_rescue',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const targets = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9260/json', res => {
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
    await send('DOM.enable');

    // 1. Navigate to landing page (English default)
    console.log('Navigating to http://localhost:4000 ...');
    await send('Page.navigate', { url: 'http://localhost:4000' });
    await new Promise(r => setTimeout(r, 3000));

    // Scroll to top
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, 0);`
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture Hero with Rescue Team Photo
    const heroShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'hero_with_rescue_photo.png'), Buffer.from(heroShot.data, 'base64'));
    console.log('Saved hero_with_rescue_photo.png');

    // 2. Switch to Hindi
    await send('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const hiBtn = btns.find(b => b.innerText.includes('हिंदी'));
        if (hiBtn) hiBtn.click();
        window.scrollTo(0, 0);
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const hiHeroShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'hero_rescue_photo_hindi.png'), Buffer.from(hiHeroShot.data, 'base64'));
    console.log('Saved hero_rescue_photo_hindi.png');

    // 3. Click "REQUEST A DEMO" CTA button to test smooth scroll to dedicated early access form
    await send('Runtime.evaluate', {
      expression: `
        const links = Array.from(document.querySelectorAll('a'));
        const demoLink = links.find(a => a.getAttribute('href') === '#early-access');
        if (demoLink) demoLink.click();
      `
    });
    await new Promise(r => setTimeout(r, 1200));

    const formShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'dedicated_early_access_form.png'), Buffer.from(formShot.data, 'base64'));
    console.log('Saved dedicated_early_access_form.png');

    ws.close();
    chrome.kill();
    console.log('Finished successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
