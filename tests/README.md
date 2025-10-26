# End-to-End Testing Suite

This directory contains comprehensive end-to-end tests for the NNH Local GMB Management Platform using Playwright.

## Test Structure

```
tests/
├── e2e/                          # E2E test files
│   ├── auth.spec.ts              # Authentication flow tests
│   ├── dashboard.spec.ts         # Dashboard and analytics tests
│   ├── gmb-studio.spec.ts        # GMB Studio features tests
│   ├── accounts-locations.spec.ts # Accounts and locations management tests
│   ├── posts-reviews.spec.ts     # Posts and reviews management tests
│   ├── ai-features.spec.ts       # AI-powered features tests
│   └── error-handling.spec.ts    # Error handling and edge cases tests
├── fixtures/                     # Test fixtures and utilities
│   ├── auth.ts                   # Authentication fixtures
│   ├── data.ts                   # Test data generators
│   └── helpers.ts                # Helper functions
└── README.md                     # This file
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Coverage

### Authentication Flow Tests
- User registration with validation
- User login with valid/invalid credentials
- Magic link authentication
- Phone OTP authentication
- Password reset functionality
- Session persistence and management
- Protected route access control
- Concurrent session handling

### Dashboard and Analytics Tests
- Dashboard loading and display
- Stat cards rendering
- Insights charts visualization
- Quick action navigation
- Location selector functionality
- Loading and error states
- Responsive design on mobile

### GMB Studio Features Tests
- Tab navigation across all sections
- Location filtering
- Posts, Reviews, Citations, Rankings, Media, Autopilot tabs
- Settings configuration
- Empty state handling
- Responsive design

### Accounts and Locations Management Tests
- Google account connection
- Account list display
- Location creation and management
- Location details viewing
- Search and filter functionality
- Integration between accounts and locations

### Posts and Reviews Management Tests
- Post creation with images
- Post editing and deletion
- Review listing and filtering
- AI-powered review responses
- Post scheduling
- Review sentiment analysis

### AI-Powered Features Tests
- AI settings configuration
- AI provider selection
- Brand voice settings
- AI review response generation
- AI post content generation
- Autopilot configuration
- Activity logging

### Error Handling and Edge Cases Tests
- Network failure scenarios
- Form validation
- XSS prevention
- Route protection
- Empty data states
- Long text handling
- Browser compatibility
- Session management
- Performance under load
- Accessibility (keyboard navigation, ARIA labels)

## Test Configuration

The test suite is configured in `playwright.config.ts` with the following settings:

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retry**: 2 retries in CI, 0 locally
- **Timeout**: 30s per test
- **Reporters**: HTML, JSON, List
- **Screenshots**: On failure
- **Videos**: Retained on failure
- **Traces**: On first retry

## Environment Variables

Create a `.env.test` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_NAME=Test User
PLAYWRIGHT_TEST_BASE_URL=http://localhost:5173
```

## Best Practices

1. **Test Isolation**: Each test is isolated and doesn't depend on others
2. **Cleanup**: Test data is cleaned up after each test run
3. **Unique Data**: Tests use unique emails and IDs to avoid conflicts
4. **Wait Strategies**: Tests use proper waiting mechanisms for async operations
5. **Selectors**: Tests use semantic selectors (role, text) over CSS selectors
6. **Assertions**: Tests use meaningful assertions with timeout handling
7. **Error Handling**: Tests handle various error scenarios gracefully

## Debugging Tests

### Debug a specific test
```bash
npx playwright test tests/e2e/auth.spec.ts --debug
```

### Run with headed mode to see what's happening
```bash
npx playwright test --headed --project=chromium
```

### Use the Playwright Inspector
```bash
npx playwright test --debug
```

### View traces after failure
```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## CI/CD Integration

The test suite is designed to run in CI/CD pipelines with:
- Automatic retry on failure
- Parallel execution
- Screenshot and video capture on failure
- JSON reports for integration with CI tools

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use fixtures and helpers for common operations
3. Add meaningful test descriptions
4. Ensure tests are independent and can run in any order
5. Clean up test data after execution
6. Add tests for both happy paths and error scenarios

## Troubleshooting

### Browser not found
Run: `npx playwright install`

### Port already in use
Change the port in `playwright.config.ts` webServer configuration

### Tests failing locally
Ensure the dev server is not already running: `npm run dev`

### Authentication issues
Check that Supabase credentials are correct in `.env.test`

## Support

For issues or questions about the test suite, please refer to:
- [Playwright Documentation](https://playwright.dev)
- Project README.md
- Team documentation
