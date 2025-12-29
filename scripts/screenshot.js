/**
 * Automated Screenshot Capture with Selenium
 * CommonJS version for easier execution
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

// Import chromedriver to ensure it's available
require('chromedriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = join(__dirname, '../docs/screenshots');

// Ensure screenshots directory exists
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const screenshots = [
  {
    name: 'landing-page',
    path: '/',
  },
  {
    name: 'login',
    path: '/login',
    waitFor: 'form',
  },
  {
    name: 'executive-dashboard',
    path: '/app/dashboard',
    login: {
      email: 'executive@acme.com',
      password: 'exec123',
    },
    waitFor: 'body',
  },
  {
    name: 'risk-register',
    path: '/app/risks',
    login: {
      email: 'riskmanager@acme.com',
      password: 'manager123',
    },
    waitFor: 'table, [class*="table"]',
  },
  {
    name: 'risk-heatmap',
    path: '/app/heatmap',
    login: {
      email: 'riskmanager@acme.com',
      password: 'manager123',
    },
    waitFor: 'body',
  },
  {
    name: 'document-upload',
    path: '/app/documents/upload',
    login: {
      email: 'riskmanager@acme.com',
      password: 'manager123',
    },
    waitFor: 'input[type="file"], body',
  },
  {
    name: 'review-queue',
    path: '/app/documents/review',
    login: {
      email: 'riskmanager@acme.com',
      password: 'manager123',
    },
    waitFor: 'body',
  },
  {
    name: 'board-report',
    path: '/app/board-report',
    login: {
      email: 'executive@acme.com',
      password: 'exec123',
    },
    waitFor: 'body',
  },
  {
    name: 'risk-appetite',
    path: '/app/appetite',
    login: {
      email: 'riskmanager@acme.com',
      password: 'manager123',
    },
    waitFor: 'body',
  },
  {
    name: 'enterprise-risks',
    path: '/app/enterprise-risks',
    login: {
      email: 'executive@acme.com',
      password: 'exec123',
    },
    waitFor: 'body',
  },
];

async function takeScreenshot(driver, config) {
  try {
    console.log(`📸 Taking screenshot: ${config.name}...`);

    // Navigate to page
    await driver.get(`${BASE_URL}${config.path}`);
    await driver.sleep(2000); // Wait for page load

    // Login if required
    if (config.login) {
      try {
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('/login')) {
          const emailInput = await driver.findElement(By.css('input[type="email"]'));
          const passwordInput = await driver.findElement(By.css('input[type="password"]'));
          const submitButton = await driver.findElement(By.css('button[type="submit"]'));

          await emailInput.clear();
          await emailInput.sendKeys(config.login.email);
          await passwordInput.clear();
          await passwordInput.sendKeys(config.login.password);
          await submitButton.click();

          await driver.sleep(3000); // Wait for redirect and page load
        }
      } catch (error) {
        console.warn(`⚠️  Login handling: ${error.message}`);
      }
    }

    // Wait for specific element if specified
    if (config.waitFor) {
      try {
        await driver.wait(until.elementLocated(By.css(config.waitFor)), 15000);
        await driver.sleep(2000); // Additional wait for rendering
      } catch (error) {
        console.warn(`⚠️  Element ${config.waitFor} not found, continuing...`);
        await driver.sleep(2000);
      }
    }

    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    const filePath = join(SCREENSHOTS_DIR, `${config.name}.png`);
    writeFileSync(filePath, screenshot, 'base64');
    console.log(`✅ Saved: ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed to capture ${config.name}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting automated screenshot capture...\n');
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOTS_DIR}\n`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  // Setup Chrome options
  const options = new chrome.Options();
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--start-maximized');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-blink-features=AutomationControlled');

  // Create driver
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // Take screenshots
    for (const config of screenshots) {
      await takeScreenshot(driver, config);
      await driver.sleep(1000); // Small delay between screenshots
    }

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Location: ${SCREENSHOTS_DIR}`);
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await driver.quit();
  }
}

// Run
main().catch(console.error);
