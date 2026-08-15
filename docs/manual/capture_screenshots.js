import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://admin.rosantibikemotorent.com';
const USERNAME = 'admin';
const PASSWORD = 'admin123';
const OUTPUT_DIR = path.resolve('./docs/images');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser with realistic viewport...');
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // 1. Halaman Login Kosong
  console.log('1. Login kosong...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_login_page.png') });

  // 2. Form Login Terisi
  console.log('2. Form Login terisi...');
  await page.type('#username', USERNAME);
  await page.type('#password', PASSWORD);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_login_filled.png') });

  // Eksekusi Login
  console.log('Logging in...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 6000));

  // 3. Dashboard
  console.log('3. Dashboard...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_dashboard.png') });

  // 4. Transaksi
  console.log('4. Transaksi...');
  await page.goto(`${BASE_URL}/transaksi`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_transaksi_list.png') });

  // 5. Ketersediaan (Availability Matrix)
  console.log('5. Availability...');
  await page.goto(`${BASE_URL}/availability`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_availability_matrix.png') });

  // 6. Jenis Motor
  console.log('6. Jenis Motor...');
  await page.goto(`${BASE_URL}/motor`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_motor_jenis.png') });

  // 7. Unit Motor
  console.log('7. Unit Motor...');
  await page.goto(`${BASE_URL}/motor/unit`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08_motor_unit.png') });

  // 8. Blog
  console.log('8. Blog...');
  await page.goto(`${BASE_URL}/blog`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09_blog_list.png') });

  // 9. WhatsApp - Tab Koneksi
  console.log('9. WhatsApp Koneksi...');
  await page.goto(`${BASE_URL}/whatsapp`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_whatsapp_status.png') });

  // 10. WhatsApp - Tab Templates
  console.log('10. WhatsApp Templates...');
  try {
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('Templates')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUTPUT_DIR, '11_whatsapp_templates.png') });
        break;
      }
    }
  } catch (e) {}

  // 11. WhatsApp - Tab Workflows
  console.log('11. WhatsApp Workflows...');
  try {
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('Workflows')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUTPUT_DIR, '11b_whatsapp_workflows.png') });
        break;
      }
    }
  } catch (e) {}

  // 12. AI - Playground
  console.log('12. AI Playground...');
  await page.goto(`${BASE_URL}/ai`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '12_ai_playground.png') });

  // 13. AI - Knowledge Base
  console.log('13. AI Knowledge Base...');
  try {
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (text && text.includes('Knowledge Base')) {
        await tab.click();
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUTPUT_DIR, '13_ai_knowledge.png') });
        break;
      }
    }
  } catch (e) {}

  // 14. Queue Monitor
  console.log('14. Queue Monitor...');
  await page.goto(`${BASE_URL}/queue`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '14_queue_monitor.png') });

  // 15. Daftar Admin
  console.log('15. Daftar Admin...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '15_admin_list.png') });

  // 16. Pengaturan
  console.log('16. Pengaturan...');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '16_settings_page.png') });

  // 17. Floating Chat Widget
  console.log('17. Floating Chat Widget...');
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    // Click floating chat widget button
    const chatBtn = await page.$('button:has(svg.lucide-message-square), div.fixed button, button[aria-label="chat"]');
    if (!chatBtn) {
      const allButtons = await page.$$('button');
      for (const btn of allButtons) {
        const box = await btn.boundingBox();
        if (box && box.x > 1200 && box.y > 700) {
          await btn.click();
          break;
        }
      }
    } else {
      await chatBtn.click();
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '17_floating_chat_widget.png') });
  } catch (e) {
    console.log('Chat widget error:', e.message);
  }

  await browser.close();
  console.log('All comprehensive screenshots captured!');
}

capture().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
