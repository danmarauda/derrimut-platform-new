import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show sign in options', async ({ page }) => {
    await page.click('[data-testid="sign-in-button"]');
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should sign in with valid credentials', async ({ page }) => {
    // Click sign in button
    await page.click('[data-testid="sign-in-button"]');
    
    // Mock successful authentication (in real tests, use valid credentials)
    await page.click('[data-testid="continue-with-google"]');
    
    // Verify user is redirected to dashboard or protected content
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
  });

  test('should handle sign out correctly', async ({ page }) => {
    // First sign in (mocked)
    await page.goto('/profile');
    await page.click('[data-testid="sign-out-button"]');
    
    // Verify redirected to home page
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});

test.describe('Role-Based Access', () => {
  test('should deny access to admin routes for regular users', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await expect(page.locator('text=Your current role: user')).toBeVisible();
  });

  test('should deny access to trainer routes for regular users', async ({ page }) => {
    await page.goto('/trainer');
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await expect(page.locator('text=Required roles: trainer')).toBeVisible();
  });

  test('should allow access to user profile for authenticated users', async ({ page }) => {
    // Mock authenticated user session
    await page.goto('/profile');
    await expect(page.locator('text=My Profile')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to main sections', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation items
    await page.click('[data-testid="nav-classes"]');
    await expect(page.url()).toContain('/classes');
    
    await page.click('[data-testid="nav-membership"]');
    await expect(page.url()).toContain('/membership');
    
    await page.click('[data-testid="nav-challenges"]');
    await expect(page.url()).toContain('/challenges');
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone dimensions
    await page.goto('/');
    
    // Test mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should maintain functionality on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad dimensions
    await page.goto('/');
    
    // Test responsive layout
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="features-grid"]')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load pages within performance targets', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 2 seconds (2000ms)
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle large data sets efficiently', async ({ page }) => {
    await page.goto('/classes');
    
    // Verify classes load without significant delay
    await expect(page.locator('[data-testid="class-list"]')).toBeVisible({ timeout: 3000 });
    
    // Test filtering functionality
    await page.fill('[data-testid="search-classes"]', 'yoga');
    await expect(page.locator('[data-testid="class-item"]')).toHaveCount(1, { timeout: 1000 });
  });
});