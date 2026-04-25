const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const BASE_URL = 'http://127.0.0.1:4173/index.html';
const ARTIFACT_DIR = path.join(process.cwd(), 'test-artifacts', 'screenshots', 'mobile');

const scenarios = [
  { name: 'iphone-13-portrait', device: 'iPhone 13' },
  {
    name: 'iphone-13-landscape',
    device: 'iPhone 13 landscape',
  },
  { name: 'pixel-7-portrait', device: 'Pixel 7' },
  {
    name: 'pixel-7-landscape',
    device: 'Pixel 7 landscape',
  },
  { name: 'galaxy-s9-plus-portrait', device: 'Galaxy S9+' },
  {
    name: 'galaxy-s9-plus-landscape',
    device: 'Galaxy S9+ landscape',
  },
  { name: 'ipad-mini-portrait', device: 'iPad Mini' },
  {
    name: 'ipad-mini-landscape',
    device: 'iPad Mini landscape',
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function collectMetrics(page) {
  return page.evaluate(() => {
    const app = document.getElementById('app');
    const canvas = document.getElementById('gameCanvas');
    const hud = document.getElementById('hud');
    const mobileControls = document.getElementById('mobileControls');
    const joystick = document.getElementById('joystick');
    const dashBtn = document.getElementById('dashBtn');
    const shootBtn = document.getElementById('shootBtn');
    const rocketBtn = document.getElementById('rocketBtn');
    const result = document.getElementById('result');

    const rect = canvas.getBoundingClientRect();
    const hudRect = hud.getBoundingClientRect();
    const joystickRect = joystick.getBoundingClientRect();
    const dashRect = dashBtn.getBoundingClientRect();
    const shootRect = shootBtn.getBoundingClientRect();
    const rocketRect = rocketBtn.getBoundingClientRect();
    const appRect = app.getBoundingClientRect();

    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      dpr: window.devicePixelRatio,
      canvasCssWidth: rect.width,
      canvasCssHeight: rect.height,
      canvasPixelWidth: canvas.width,
      canvasPixelHeight: canvas.height,
      appWidth: appRect.width,
      appHeight: appRect.height,
      hudVisible: !hud.classList.contains('hidden'),
      resultVisible: result.classList.contains('visible'),
      mobileControlsActive: mobileControls.classList.contains('active'),
      joystickVisible: joystickRect.width > 0 && joystickRect.height > 0,
      dashVisible: dashRect.width > 0 && dashRect.height > 0,
      shootVisible: shootRect.width > 0 && shootRect.height > 0,
      rocketVisible: rocketRect.width > 0 && rocketRect.height > 0,
      hudBottom: hudRect.bottom,
      joystickTop: joystickRect.top,
      controlsOverlapHud: joystickRect.top < hudRect.bottom,
      canvasRatioDelta: Math.abs(rect.width / rect.height - canvas.width / canvas.height),
    };
  });
}

function assertMetrics(metrics) {
  const issues = [];

  if (!metrics.mobileControlsActive) issues.push('mobile controls are not active');
  if (!metrics.joystickVisible) issues.push('joystick is not visible');
  if (!metrics.dashVisible || !metrics.shootVisible || !metrics.rocketVisible) issues.push('one or more action buttons are hidden');
  if (metrics.controlsOverlapHud) issues.push('mobile controls overlap the HUD');
  if (metrics.canvasPixelWidth !== Math.round(metrics.canvasCssWidth)) issues.push('canvas pixel width does not match CSS width');
  if (metrics.canvasPixelHeight !== Math.round(metrics.canvasCssHeight)) issues.push('canvas pixel height does not match CSS height');
  if (metrics.canvasRatioDelta > 0.02) issues.push(`canvas aspect ratio drift is too high (${metrics.canvasRatioDelta.toFixed(4)})`);

  return issues;
}

async function runScenario(browser, scenario) {
  const context = await browser.newContext({
    ...devices[scenario.device],
  });
  const page = await context.newPage();
  const scenarioDir = path.join(ARTIFACT_DIR, scenario.name);
  ensureDir(scenarioDir);

  const result = {
    scenario: scenario.name,
    device: scenario.device,
    issues: [],
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(scenarioDir, 'menu.png') });

    await page.getByRole('button', { name: 'Play' }).tap();
    await page.waitForTimeout(1200);

    const before = await collectMetrics(page);
    await page.touchscreen.tap(before.innerWidth - 90, before.innerHeight - 130);
    await page.waitForTimeout(300);
    await page.touchscreen.tap(before.innerWidth - 90, before.innerHeight - 55);
    await page.waitForTimeout(300);

    await page.locator('#joystick').dispatchEvent('pointerdown', {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      clientX: 75,
      clientY: before.innerHeight - 90,
      button: 0,
      buttons: 1,
    });
    await page.locator('#joystick').dispatchEvent('pointermove', {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      clientX: 110,
      clientY: before.innerHeight - 120,
      button: 0,
      buttons: 1,
    });
    await page.waitForTimeout(500);
    await page.locator('#joystick').dispatchEvent('pointerup', {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      clientX: 110,
      clientY: before.innerHeight - 120,
      button: 0,
      buttons: 0,
    });

    const after = await collectMetrics(page);
    await page.screenshot({ path: path.join(scenarioDir, 'gameplay.png') });

    result.before = before;
    result.after = after;
    result.issues.push(...assertMetrics(after));
  } catch (error) {
    result.issues.push(error.message);
  } finally {
    await context.close();
  }

  return result;
}

async function runCpuThrottleProbe(browser) {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const summary = { scenario: 'iphone-13-cpu-throttle', issues: [] };

  try {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Play' }).tap();
    await page.waitForTimeout(1500);
    summary.metrics = await collectMetrics(page);
    summary.issues.push(...assertMetrics(summary.metrics));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'iphone-13-cpu-throttle.png') });
  } catch (error) {
    summary.issues.push(error.message);
  } finally {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }).catch(() => {});
    await context.close();
  }

  return summary;
}

async function main() {
  ensureDir(ARTIFACT_DIR);
  const browser = await chromium.launch({ headless: true });

  try {
    const results = [];
    for (const scenario of scenarios) {
      results.push(await runScenario(browser, scenario));
    }
    results.push(await runCpuThrottleProbe(browser));

    const reportPath = path.join(ARTIFACT_DIR, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    const failures = results.filter((item) => item.issues.length > 0);
    console.log(JSON.stringify({ reportPath, failures, results }, null, 2));
    if (failures.length > 0) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
