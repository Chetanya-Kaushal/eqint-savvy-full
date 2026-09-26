// Capture REAL, clean screenshots of the Savvy app surfaces.
// v2: clears chat history first, focuses the composer properly.
import { createRequire } from 'module';
import os from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const CACHE = join(os.tmpdir(), 'agentbuff-presentation-export-tools');
const { _electron, chromium } = createRequire(join(CACHE, 'package.json'))('playwright');

const OUT = dirname(fileURLToPath(import.meta.url)) + '/';
const appPathResolved = join(dirname(fileURLToPath(import.meta.url)), '..', 'eqint-savvy-desktop');

async function main() {
  // ── 1. Electron overlay (the real chat UI) ──
  console.log('Launching Electron overlay…');
  const dist = join(appPathResolved, 'node_modules', 'electron', 'dist');
  const electronExe = existsSync(join(dist, 'Electron.app', 'Contents', 'MacOS', 'Electron'))
    ? join(dist, 'Electron.app', 'Contents', 'MacOS', 'Electron')
    : join(dist, 'electron');
  const app = await _electron.launch({ args: ['.'], cwd: appPathResolved, executablePath: electronExe });
  const overlay = await app.firstWindow();
  await overlay.waitForTimeout(3500);

  // clear previous chat history → fresh greeting
  await overlay.click('#clearChatBtn').catch(e => console.log('clear skip:', e.message.split('\n')[0]));
  await overlay.waitForTimeout(1200);

  // focus composer, type a professional business question
  await overlay.click('#chatInput');
  await overlay.waitForTimeout(400);
  await overlay.keyboard.type('How many employees joined last month?');
  await overlay.waitForTimeout(800);
  await overlay.screenshot({ path: OUT + 'shot-chat-typed.png' });
  console.log('shot-chat-typed');

  // send → capture the gooey thinking indicator
  await overlay.keyboard.press('Enter');
  await overlay.waitForTimeout(1600);
  await overlay.screenshot({ path: OUT + 'shot-thinking.png' });
  console.log('shot-thinking');

  // poll for the bot reply (up to 150s — covers cold model load) —
  // typing row must be gone and a real answer present (excluding
  // the 'Chat cleared' system message)
  let replied = false;
  for (let i = 0; i < 150; i++) {
    await overlay.waitForTimeout(1000);
    const state = await overlay.evaluate(() => ({
      typing: document.querySelectorAll('.typing-row').length,
      answers: document.querySelectorAll('.msg.bot:not(.typing-row)').length,
    })).catch(() => ({ typing: 1, answers: 0 }));
    if (state.typing === 0 && state.answers >= 2) { replied = true; break; }
  }
  await overlay.waitForTimeout(600);
  await overlay.screenshot({ path: OUT + 'shot-reply.png' });
  console.log('shot-reply', replied ? '(got answer)' : '(no answer — showing state anyway)');

  await app.close().catch(() => {});

  // ── 2. Web UIs via plain Chromium (retina 2x) ──
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  for (const [url, name] of [
    ['http://localhost:3001', 'shot-dashboard.png'],
    ['http://localhost:3000', 'shot-bip.png'],
  ]) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: OUT + name });
      console.log('captured', name);
    } catch (e) {
      console.error('skip', url, e.message.split('\n')[0]);
    }
  }
  await browser.close();
  console.log('DONE');
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1); });
