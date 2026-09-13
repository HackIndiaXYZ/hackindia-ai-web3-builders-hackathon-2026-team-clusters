const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ name, ip: iface.address });
      }
    }
  }
  return addresses;
}

const localIPs = getLocalIPs();

console.log('═══════════════════════════════════════════════════════════');
console.log('          🌐 ECHOMESH UNIFIED NETWORK LAUNCHER             ');
console.log('═══════════════════════════════════════════════════════════');
console.log(' Access URLs:');
console.log(`  🏠 Localhost : http://localhost:4000`);
localIPs.forEach(net => {
  console.log(`  📱 Network (${net.name}) : http://${net.ip}:4000`);
});
console.log('───────────────────────────────────────────────────────────\n');

const processes = [];

function startProcess(scriptPath, args, name) {
  const p = spawn(process.execPath, [scriptPath, ...args], { stdio: 'inherit' });
  p.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`[${name}] process exited with code ${code}`);
    }
  });
  processes.push(p);
  return p;
}


// 1. Start Device A (Medical on 4001)
console.log('Starting Device A (Medical)...');
startProcess(path.join(__dirname, 'device.js'), ['4001', 'knowledge_medical.json', 'DeviceA'], 'DeviceA');

// 2. Start Device B (Shelter on 4002)
console.log('Starting Device B (Shelter)...');
startProcess(path.join(__dirname, 'device.js'), ['4002', 'knowledge_shelter.json', 'DeviceB'], 'DeviceB');

// 3. Start Device C (Maps on 4003)
console.log('Starting Device C (Maps)...');
startProcess(path.join(__dirname, 'device.js'), ['4003', 'knowledge_maps.json', 'DeviceC'], 'DeviceC');

// 4. Start Router (4000)
console.log('Starting Mesh Router & Unified Server on port 4000...');
startProcess(path.join(__dirname, 'router.js'), [], 'Router');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping all EchoMesh nodes...');
  processes.forEach(p => p.kill('SIGINT'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTerminating EchoMesh nodes...');
  processes.forEach(p => p.kill('SIGTERM'));
  process.exit(0);
});
