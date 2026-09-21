import os from 'os';

export function getLanAddresses(): string[] {
  const nets = os.networkInterfaces();
  const result: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        result.push(net.address);
      }
    }
  }
  return result;
}
