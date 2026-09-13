import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function testConnectedDevices() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // Set Hindi language by default in localStorage
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('echomesh_lang', 'hi');
    localStorage.removeItem('echomesh_theme');
    localStorage.setItem('echomesh_theme_mode', 'light');
  });

  console.log('Navigating to http://localhost:4000...');
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle0', timeout: 15000 });

  // Take screenshot of Home page with the active button
  const artifactDir = 'C:\\Users\\tiwar\\.gemini\\antigravity-ide\\brain\\e3563e87-32a2-40cf-9a61-3def75af039d';
  
  await page.screenshot({
    path: path.join(artifactDir, 'home_with_connected_button.png'),
    fullPage: false
  });
  console.log('Saved home_with_connected_button.png');

  // Find and click the "📡 9/9 उपकरण जुड़े हैं" button
  console.log('Clicking connected devices button...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('उपकरण जुड़े हैं') || b.innerText.includes('Nodes Linked'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  console.log('Button clicked:', clicked);
  await new Promise(r => setTimeout(r, 800));

  // Take screenshot of the Connected Network Modal
  await page.screenshot({
    path: path.join(artifactDir, 'connected_network_modal_hi.png'),
    fullPage: false
  });
  console.log('Saved connected_network_modal_hi.png');

  // Also switch to English to verify bilingual excellence
  await page.evaluate(() => {
    const enBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'EN');
    if (enBtn) enBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // If modal closed on language switch, click the button again
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('Nodes Linked') || b.innerText.includes('उपकरण जुड़े हैं'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(artifactDir, 'connected_network_modal_en.png'),
    fullPage: false
  });
  console.log('Saved connected_network_modal_en.png');

  // Close modal and click Mesh Network tab to test Tab 3
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Close') || b.innerText.includes('बंद करें') || b.innerText.trim() === '✕');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Mesh Network tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const meshTab = tabs.find(b => b.innerText.includes('Mesh Network') || b.innerText.includes('मेश नेटवर्क'));
    if (meshTab) meshTab.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(artifactDir, 'mesh_tab_with_full_devices.png'),
    fullPage: false
  });
  console.log('Saved mesh_tab_with_full_devices.png');

  await browser.close();
  console.log('All tests and captures completed!');
}

testConnectedDevices().catch(err => {
  console.error('Error in test script:', err);
  process.exit(1);
});
