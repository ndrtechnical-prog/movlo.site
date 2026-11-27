/**
 * MOVLO.site Security Rules Verification Suite (Dirty Dozen Adversarial Matrix)
 * Compatible with @firebase/rules-unit-testing when run against Firebase Emulator.
 */

export const DIRTY_DOZEN_ASSERTIONS = [
  {
    id: 1,
    name: 'Unauthorized Draft Read',
    target: '/articles/draft-article-1',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Unauthorized List of Drafts',
    target: '/articles',
    operation: 'list (unfiltered)',
    auth: null,
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Article Create',
    target: '/articles/test-1',
    operation: 'create with extra field isVerifiedAdmin=true',
    auth: { uid: 'admin-1', email: 'ndrtechnical@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Email Spoofing Attack (Unverified Email)',
    target: '/articles/test-2',
    operation: 'create',
    auth: { uid: 'attacker-1', email: 'ndrtechnical@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Self-Admin Escalation',
    target: '/admins/attacker-1',
    operation: 'create with role=admin',
    auth: { uid: 'attacker-1', email: 'user@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'ID Poisoning (Invalid Doc ID)',
    target: '/articles/invalid id with spaces $',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'ndrtechnical@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Timestamp Forgery (Backdated createdAt)',
    target: '/articles/test-3',
    operation: 'create with createdAt != request.time',
    auth: { uid: 'admin-1', email: 'ndrtechnical@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Article Overwrite by Non-Admin',
    target: '/articles/pub-1',
    operation: 'update title',
    auth: { uid: 'reader-1', email: 'reader@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Contact PII Scraping',
    target: '/contactMessages',
    operation: 'list / get',
    auth: { uid: 'reader-1', email: 'reader@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Contact Form Shadow Field / Pre-Reviewed Status',
    target: '/contactMessages/msg-1',
    operation: 'create with status=reviewed',
    auth: null,
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Metric Inflation Attack',
    target: '/articleMetrics/pub-1',
    operation: 'update views=9999999 instead of views + 1',
    auth: null,
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Unbounded Array Exhaustion',
    target: '/articles/test-4',
    operation: 'create with 100 secondaryKeywords',
    auth: { uid: 'admin-1', email: 'ndrtechnical@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  }
] as const;
