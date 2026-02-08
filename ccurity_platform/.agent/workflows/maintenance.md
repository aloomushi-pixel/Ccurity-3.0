---
description: Automated maintenance loop to detect and verify fixes for the application.
---

This workflow defines the steps to systematically verify the health of the application. Run this whenever you modify code to ensure stability.

1. **Verify Code Quality (Linting)**
   Run the linter to catch syntax errors, unused variables, and potential bugs.
   ```bash
   npm run lint
   ```

2. **Verify Build Integrity**
   Ensure the application builds successfully for production. This catches type errors and build-time issues.
   ```bash
   npm run build
   ```

3. **Verify Functionality (E2E Tests)**
   Run end-to-end tests using Playwright to verify user flows (login, navigation, dashboard).
   If tests fail, inspect the report.
   ```bash
   npx playwright test
   ```
   > **Note:** If runs for the first time or after an update, you might need to run `npx playwright install`.

4. **Iterate**
   If any step fails:
   - Analyze the error output.
   - Apply a fix.
   - Re-run this workflow from step 1.
