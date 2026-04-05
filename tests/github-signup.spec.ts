import { test, expect } from '@playwright/test';

test.use({ 
  browserName: 'chromium',
  headless: false 
});

test.describe('GitHub Tests', () => {
  test('should navigate to GitHub and click Sign up link', async ({ page }) => {
    // Step 1: Go to test-playground page
    await page.goto('http://localhost:3000/test-playground');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Step 2: Click on the Sign up link using the CSS selector
    const cssSelector = 'a[data-attr="\\{\"category\"\\:\"Sign\\ up\"\\,\"action\"\\:\"click\\ to\\ sign\\ up\\ for\\ account\"\\,\"label\"\\:\"ref_page\\:\\/\\ \\-\\_ref_cta\\:Sign\\ up\\;ref_loc\\:header\\ logged\\ out\"\\}"]';
    await page.locator(cssSelector).waitFor({ state: 'visible' });
    await page.locator(cssSelector).click();
    
    // Wait a bit for the click to register
    await page.waitForTimeout(500);
    
    // Step 3: Click on the href element
    const hrefSelector = 'a[href="/github-copilot/pro"]';
    await page.locator(hrefSelector).waitFor({ state: 'visible' });
    await page.locator(hrefSelector).click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
  });
});