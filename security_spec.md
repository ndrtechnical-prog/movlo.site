# Security Specification — MOVLO.site Firestore Rules

## 1. Data Invariants
1. **Article Editorial Integrity**: Only verified Admins can create, update, or delete articles. Unauthenticated or non-admin users can ONLY `get` or `list` articles whose `status == 'published'`. Draft, scheduled, and archived articles are strictly inaccessible to non-admins.
2. **Author & Timestamp Immutability**: `authorUid` and `createdAt` on articles are immutable after creation; `createdAt` must equal `request.time` on creation and `updatedAt` must equal `request.time` on both create and update.
3. **Contact Message PII Isolation**: Any visitor can submit a contact form entry (`status == 'unread'`, `createdAt == request.time`, bounded text lengths), but NO non-admin user can `get`, `list`, `update`, or `delete` contact messages.
4. **Trending Topics & Automation Reports**: Strictly restricted to verified admins (`ownerUid == request.auth.uid` or bootstrapped admin).
5. **View Counter Isolation (`articleMetrics`)**: Readers can increment `views` by `+1` on an existing published article's metric document without gaining write access to the `articles` collection.
6. **Admin Directory Protection**: Non-admins cannot read, list, or write `/admins/{uid}` to prevent privilege escalation.

## 2. Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthorized Draft Read**: Unauthenticated `get` on `/articles/draft-article-1` where `status == 'draft'`.
2. **Unauthorized List of Drafts**: Unauthenticated `list` on `/articles` without `status == 'published'` constraint.
3. **Shadow Field Injection on Article Create**: Authenticated non-admin or spoofed admin sending `{ ..., isVerifiedAdmin: true }`.
4. **Email Spoofing Attack**: Request with `auth.token.email == 'ndrtechnical@gmail.com'` and `auth.token.email_verified == false`.
5. **Self-Admin Escalation**: Authenticated user attempting `create` on `/admins/{myUid}` with `{ role: 'admin' }`.
6. **ID Poisoning**: Creating `/articles/` with a 300-character document ID containing spaces or `$` symbols.
7. **Timestamp Forgery**: Admin creating an article with a backdated `createdAt` not matching `request.time`.
8. **Article Overwrite by Non-Admin**: Non-admin user attempting `update` on `/articles/pub-1` changing `title` or `status`.
9. **Contact PII Scraping**: Authenticated non-admin calling `list` or `get` on `/contactMessages`.
10. **Contact Form Shadow Field**: Public user submitting contact form with `{ status: 'reviewed' }` or extra `adminNote` field.
11. **Metric Inflation Attack**: Public user setting `articleMetrics/pub-1.views` to `9999999` instead of `existing().views + 1`.
12. **Unbounded Array Exhaustion**: Sending 100 items in `secondaryKeywords` or `faqs` exceeding array cap.
