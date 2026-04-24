// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import os from 'os';

// PRoot/Termux: os.networkInterfaces() can throw — return empty object instead
const _ni = os.networkInterfaces.bind(os);
os.networkInterfaces = () => { try { return _ni(); } catch { return {}; } };

export default defineConfig({
  integrations: [tailwind(), preact()],
  server: { host: '0.0.0.0' },
});
