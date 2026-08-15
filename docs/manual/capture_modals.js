import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://admin.rosantibikemotorent.com';
const USERNAME = 'admin';
const PASSWORD = 'admin123';
const OUTPUT_DIR = path.resolve('./docs/images');

async function captureModals() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.type('#username', USERNAME);
  await page.type('#password', PASSWORD);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 6000));

  // 1. Modal Tambah Transaksi
  console.log('Capture Modal Tambah Transaksi...');
  await page.goto(`${BASE_URL}/transaksi`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('Buat Transaksi') || text.includes('Tambah Transaksi'))) {
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, '05_modal_tambah_transaksi.png') });
      console.log('✓ 05_modal_tambah_transaksi.png');
      break;
    }
  }

  // 2. Modal Tambah Motor
  console.log('Capture Modal Tambah Motor...');
  await page.goto(`${BASE_URL}/motor`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  const motorBtns = await page.$$('button');
  for (const b of motorBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Tambah Motor')) {
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, '07b_modal_tambah_motor.png') });
      console.log('✓ 07b_modal_tambah_motor.png');
      break;
    }
  }

  // 3. Modal Tambah Admin
  console.log('Capture Modal Tambah Admin...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  const adminBtns = await page.$$('button');
  for (const b of adminBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Tambah Admin')) {
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, '15b_modal_tambah_admin.png') });
      console.log('✓ 15b_modal_tambah_admin.png');
      break;
    }
  }

  // 4. Modal Tambah Knowledge
  console.log('Capture Modal Tambah Knowledge...');
  await page.goto(`${BASE_URL}/ai`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  const aiBtns = await page.$$('button');
  for (const b of aiBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Tambah Knowledge')) {
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, '13b_modal_tambah_knowledge.png') });
      console.log('✓ 13b_modal_tambah_knowledge.png');
      break;
    }
  }

  await browser.close();
  console.log('Modals capture complete!');
}

captureModals().catch(e => console.error(e));
