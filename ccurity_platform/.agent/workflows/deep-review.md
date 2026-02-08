---
description: Deep autonomous browser review of the entire app — generates reports for issues, improvement opportunities, and successful features.
---

# Deep App Review Workflow

This workflow performs an autonomous, comprehensive browser-based review of the Ccurity platform. It navigates every page, inspects UI/UX, design, responsiveness, accessibility, and functionality, and produces three artifact reports.

**Prerequisites**: The dev server must be running on `http://localhost:3000`. If not, run `npm run dev` first.

> **Note**: Protected routes (admin, supervisor, colaborador, portal) require Supabase authentication. The review covers all publicly accessible pages in full depth, and documents the auth redirect behavior for protected routes. If you have test credentials, the agent will attempt to log in and review protected pages too.

---

## Step 1: Start the dev server (if not running)

```bash
cmd /c "npm run dev"
```
Wait for the server to be available at `http://localhost:3000` before proceeding.

---

## Step 2: Review Public Pages (Homepage, Login, Signup)

Use the `browser_subagent` tool to navigate and review the following pages. For each page, evaluate:

- **Visual Design**: Layout, colors, gradients, glassmorphism, typography, spacing
- **Responsiveness**: Does it look good at different viewport sizes?
- **Interactivity**: Hover effects, animations, transitions, focus states
- **Accessibility**: Alt text, contrast, keyboard navigation, semantic HTML, form labels
- **Functionality**: Links working, forms submitting, error states displayed
- **Performance**: Page load speed, rendering issues, layout shifts
- **SEO**: Title tags, meta descriptions, heading hierarchy, semantic elements
- **Console Errors**: Any JavaScript errors or warnings in the browser console

### Pages to review:
1. `http://localhost:3000/` — Landing page with 4 pillar cards (Admin, Supervisor, Colaborador, Portal Cliente)
2. `http://localhost:3000/login` — Login form with email/password, error/success banners
3. `http://localhost:3000/signup` — Registration form with role selector (4 roles), name/email/password fields

For each page, take a screenshot and document findings.

---

## Step 3: Review Auth Redirect Behavior

Navigate to each protected route WITHOUT being logged in. Verify that:
- The redirect to `/login` happens correctly
- No error pages or crashes occur
- The URL preserves any relevant context

### Protected routes to test:
- `/admin`
- `/admin/servicios`
- `/admin/clientes`
- `/admin/cotizaciones`
- `/admin/finanzas`
- `/admin/usuarios`
- `/admin/reportes`
- `/admin/audit`
- `/admin/chat`
- `/admin/config`
- `/admin/calendario`
- `/admin/disputas`
- `/admin/notificaciones`
- `/admin/cpu`
- `/admin/ayuda`
- `/supervisor`
- `/supervisor/servicios`
- `/supervisor/chat`
- `/colaborador`
- `/colaborador/servicios`
- `/colaborador/precios`
- `/portal`
- `/contrato/test-token`
- `/cotizacion/test-token`

---

## Step 4: Attempt Authenticated Review (if test credentials are available)

If the `.env.local` contains test user credentials, or if the agent can sign up a test user:
1. Attempt login with test credentials
2. If successful, navigate through each section's pages
3. For admin section: review dashboard, sidebar navigation, all sub-pages
4. Evaluate: data display, charts, tables, forms, modals, search/filter, CRUD operations
5. Check responsive behavior of dashboard layouts

---

## Step 5: Generate Reports

Create three artifact reports in the project's artifacts directory:

### Report 1: `issues_report.md`
Document all bugs, broken functionality, visual glitches, console errors, and accessibility violations found during the review. Each issue should include:
- **Severity** (Critical / High / Medium / Low)
- **Page/Route** affected
- **Description** of the issue
- **Screenshot** (if captured)
- **Suggested Fix** (brief)

### Report 2: `improvement_opportunities.md`
Document UI/UX enhancements, performance optimizations, design polish ideas, missing features, and accessibility improvements. Each item should include:
- **Priority** (High / Medium / Low)
- **Category** (Design, UX, Performance, Accessibility, SEO, Feature)
- **Page/Route** affected
- **Description** of the opportunity
- **Expected Impact**

### Report 3: `successful_features.md`
Document everything that works well — features, design decisions, and UX patterns that are well-implemented. Each item should include:
- **Category** (Design, UX, Functionality, Performance)
- **Page/Route**
- **What works well** and why it's good
- **Screenshot** (if captured)

---

## Evaluation Criteria Checklist

Use this as a guide for what to evaluate on each page:

### Design & UI
- [ ] Color palette consistency and harmony
- [ ] Typography hierarchy and readability
- [ ] Spacing and alignment
- [ ] Glassmorphism / glass-card effects
- [ ] Gradient usage and quality
- [ ] Dark mode appearance
- [ ] Icon usage and consistency
- [ ] Micro-animations and transitions
- [ ] Loading states and skeleton screens

### UX & Functionality
- [ ] Navigation clarity and flow
- [ ] Form validation and error handling
- [ ] Button states (hover, active, disabled, loading)
- [ ] Empty states (no data scenarios)
- [ ] Toast/notification feedback
- [ ] Search and filter functionality
- [ ] Pagination behavior
- [ ] Modal dialogs and overlays

### Technical Quality
- [ ] Console errors and warnings
- [ ] Network request failures
- [ ] Layout shifts (CLS)
- [ ] Image optimization
- [ ] Font loading
- [ ] PWA service worker registration

### Mobile & Responsiveness
- [ ] Layout at mobile breakpoints
- [ ] Touch targets (>44px)
- [ ] Horizontal scrolling issues
- [ ] Navigation on mobile (hamburger, sidebar)

### Accessibility
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] Screen reader compatibility
- [ ] Form labels and ARIA attributes
- [ ] Keyboard navigation
