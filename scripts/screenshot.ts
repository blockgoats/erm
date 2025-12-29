/**
 * Automated Screenshot Capture with Selenium
 * 
 * Takes screenshots of all major pages for GitHub documentation
 */

import { Builder, WebDriver, By, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = join(process.cwd(), 'docs/screenshots');

// Ensure screenshots directory exists
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

interface ScreenshotConfig {
  name: string;
  path: string;
  waitFor?: string; // CSS selector to wait for
  login?: {
    email: string;
    password: string;
  };
  actions?: Array<{
    type: 'click' | 'type' | 'wait';
    selector?: string;
    value?: string;
    timeout?: number;
  }>;
}

const screenshots: ScreenshotConfig[] = [
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
    waitFor: '[data-testid="dashboard"]',
  },
  {
    name: 'risk-register',
    path: '/app/risks',
    login: {
      email: 'riskmanager@acme.com',
      password: 'manager123',
    },
    waitFor: 'table',
  },
  {
    name: 'risk-heatmap',
    path: '/app/heatmap',
    login: {
      email: 'riskmanager@acme.com',
      password: 'manager123',
    },
    waitFor: '[data-testid="heatmap"]',
  },
  {
    name: 'document-upload',
    path: '/app/documents/upload',
    login: {
      email: 'riskmanager@acme.com',
      password: 'manager123',
    },
    waitFor: 'input[type="file"]',
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

async function takeScreenshot(driver: WebDriver, config: ScreenshotConfig): Promise<void> {
  try {
    console.log(`📸 Taking screenshot: ${config.name}...`);

    // Navigate to page
    await driver.get(`${BASE_URL}${config.path}`);
    await driver.sleep(1000); // Wait for page load

    // Login if required
    if (config.login) {
      try {
        // Check if already logged in
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/login')) {
          // Try to find login form
          const loginForm = await driver.findElements(By.css('form'));
          if (loginForm.length > 0) {
            const emailInput = await driver.findElement(By.css('input[type="email"]'));
            const passwordInput = await driver.findElement(By.css('input[type="password"]'));
            const submitButton = await driver.findElement(By.css('button[type="submit"]'));

            await emailInput.clear();
            await emailInput.sendKeys(config.login.email);
            await passwordInput.clear();
            await passwordInput.sendKeys(config.login.password);
            await submitButton.click();

            // Wait for redirect
            await driver.sleep(2000);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Login may have failed or already logged in: ${error}`);
      }
    }

    // Wait for specific element if specified
    if (config.waitFor) {
      try {
        await driver.wait(until.elementLocated(By.css(config.waitFor)), 10000);
        await driver.sleep(1000); // Additional wait for rendering
      } catch (error) {
        console.warn(`⚠️  Element ${config.waitFor} not found, continuing anyway...`);
      }
    }

    // Execute actions if specified
    if (config.actions) {
      for (const action of config.actions) {
        if (action.type === 'click' && action.selector) {
          const element = await driver.findElement(By.css(action.selector));
          await element.click();
          await driver.sleep(500);
        } else if (action.type === 'type' && action.selector && action.value) {
          const element = await driver.findElement(By.css(action.selector));
          await element.clear();
          await element.sendKeys(action.value);
          await driver.sleep(500);
        } else if (action.type === 'wait') {
          await driver.sleep(action.timeout || 1000);
        }
      }
    }

    // Take screenshot
    const screenshot = await driver.takeScreenshot();
    const filePath = join(SCREENSHOTS_DIR, `${config.name}.png`);
    writeFileSync(filePath, screenshot, 'base64');
    console.log(`✅ Saved: ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed to capture ${config.name}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting automated screenshot capture...\n');
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOTS_DIR}\n`);

  // Setup Chrome options
  const options = new chrome.Options();
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--start-maximized');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-gpu');

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

// Run if executed directly
main().catch(console.error);

