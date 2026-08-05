# eSmile — Parental Notice and Consent Specification

Owner: Jamil Obeid  
Privacy contact: jamilworkinfo@gmail.com  
Draft date: 29 July 2026  
Status: Engineering/legal specification; consent method requires legal approval before production

> This specification is not legal advice. It translates the current data inventory, Privacy Policy draft, and retention policy into a registration safeguard. Qualified counsel must confirm the final verifiable-parental-consent method for Lebanon and every launch country.

## 1. Non-negotiable launch rule

eSmile must not upload a child username, age, profile, progress, activity, or leaderboard information until:

1. A parent-only Firebase account exists.
2. The parent email is verified.
3. The parent receives the direct notice below.
4. The approved verifiable-parental-consent process is completed.
5. A versioned consent record is written by trusted backend code.

A checkbox, parental math gate, or ordinary Firebase email-verification link alone must not be described as verifiable parental consent.

## 2. Recommended free launch design

Subject to legal approval, the recommended initial design is:

- Use a verified-parent-email **email-plus** consent flow only for information used internally to provide eSmile.
- Keep the leaderboard disabled by default for every child.
- Do not publicly disclose a child username or avatar under the initial internal-use consent.
- Treat leaderboard participation as a separate parent-controlled opt-in that remains unavailable until counsel approves an appropriate disclosure-consent method.
- Do not use advertising, behavioral analytics, location, camera, microphone recording, or social/chat features.

This approach keeps the first release within the narrowest data practice and avoids pretending that public leaderboard disclosure is covered by an internal-use email-plus consent.

## 3. Registration state machine

| State | Information allowed in cloud storage | Child access |
|---|---|---|
| `parent_account_created` | Parent email, Firebase UID, timestamps, notice/consent status | Blocked |
| `parent_email_verified` | Same parent-only information | Blocked |
| `notice_presented` | Parent-only information plus notice version/time | Blocked |
| `consent_pending_confirmation` | Minimal consent challenge/reference and expiry | Blocked |
| `consent_granted` | Minimal consent evidence | Child profile may now be created |
| `consent_denied` | Minimal denial timestamp until cleanup | Blocked; delete registration |
| `consent_withdrawn` | Minimal withdrawal evidence | Block immediately; start deletion |
| `consent_expired` | Minimal expiry status until cleanup | Blocked; delete registration |

The child username and age may be entered locally before consent for user experience, but they must remain only in volatile application memory and must not be written to Firebase, logs, analytics, crash reports, or notification payloads until consent is granted.

## 4. Direct notice to the parent

### Parent action required before creating a child profile

eSmile is designed for children ages 4–12. We need a parent or legal guardian’s verified consent before collecting or using information for a child profile.

**Operator**  
Jamil Obeid  
Beirut, Lebanon  
+961 81 343 191  
jamilworkinfo@gmail.com

**Information we plan to collect after consent**

- The child’s chosen username, age, avatar, theme, and tooth buddy.
- Brushing completions, times, streaks, weekly/lifetime totals, and reminder-following.
- Game activity, rewards, badges, points, levels, challenges, and application usage.
- Firebase account identifiers, security information, and timestamps needed to operate and protect the service.
- The parent email for authentication, verification, password recovery, notices, and privacy requests.

**How we use it**

We use the information to provide the child account, brushing activities, games, rewards, personalization, reminders, parent dashboard, account security, support, and deletion. We do not sell the information or use it for targeted advertising.

**Service providers**

Google Firebase processes authentication and application database information. Netlify hosts the secure deletion function and public deletion instructions. Expo and the device operating system support application builds and local reminders. These providers may process information outside Lebanon as explained in the Privacy Policy.

**Public disclosure**

The leaderboard is disabled under the initial internal-use consent. A child username or avatar will not be placed on a leaderboard unless the parent separately opts in through a legally approved disclosure-consent process.

**Retention**

Accounts are deleted after two years of inactivity following advance notices. Verified deletion requests are completed from active systems within 30 days. Detailed activity is retained for no more than two years, identifiable operational logs for no more than 30 days, and encrypted backups for a rolling maximum of 30 days. See the Privacy Policy for the full schedule.

**Your choices and rights**

You may review or correct the child’s information, refuse further collection or use, withdraw consent, request leaderboard removal, or request deletion. Use the protected Parent Zone or contact jamilworkinfo@gmail.com. We verify control of the parent email before disclosing or changing account information.

**Consent is required**

eSmile will not create the child profile or collect the child information described above if you do not complete the approved consent process. If consent is not completed within 30 days, the parent-only registration information will be deleted.

Privacy Policy: **[INSERT APPROVED PUBLIC PRIVACY POLICY URL BEFORE LAUNCH]**

## 5. Consent choices

The parent interface must present separate choices; none may be preselected:

1. **Required internal processing** — consent to creating and operating the child profile using the data described in the direct notice.
2. **Optional leaderboard disclosure** — disabled and unavailable at initial launch; later requires separate notice and approved consent.
3. **Optional notifications** — requested separately through the operating system and independently switchable in Parent Zone.

Refusing optional leaderboard or notification processing must not prevent use of core brushing features.

## 6. Consent record

Trusted backend code should write `parentalConsents/{uid}` with only:

- `uid`: one-way/internal account reference.
- `status`: `pending`, `granted`, `denied`, `withdrawn`, or `expired`.
- `method`: legally approved method identifier.
- `noticeVersion`: version of the direct notice.
- `privacyPolicyVersion`: version of the public Privacy Policy.
- `dataCategoriesVersion`: version of the approved data inventory.
- `internalUseGranted`: boolean.
- `leaderboardDisclosureGranted`: boolean; false for initial launch.
- `parentEmailVerifiedAt`: trusted server timestamp.
- `noticePresentedAt`: trusted server timestamp.
- `consentGrantedAt`: trusted server timestamp when applicable.
- `consentWithdrawnAt`: trusted server timestamp when applicable.
- `expiresAt`: pending-consent expiry.
- `verificationEvidenceRef`: one-way reference to minimal verification evidence, never a password or raw identity document.
- `createdAt` and `updatedAt`: trusted server timestamps.

The mobile client must not be allowed to set `status: granted` directly. Only a trusted backend may grant consent after completing the approved verification process.

## 7. Firestore authorization requirements

- Deny all client reads/writes to `parentalConsents` except a narrowly scoped parent read of non-sensitive status if required by the UI.
- Require a trusted `consentStatus == granted` record before creating a child profile.
- Require active granted consent before reading/updating child data or creating activity records.
- Prevent child/profile writes when consent is withdrawn, denied, expired, or pending.
- Keep administrator access to consent evidence separate from ordinary child analytics access.
- Record all consent-status changes in an append-only, minimal audit record.

These rules must not be deployed until the corresponding backend and migration handling for existing test accounts are ready.

## 8. Email-plus confirmation requirements

If counsel approves email-plus for the internal-use flow, implementation must include:

1. Send the complete direct notice to the verified parent; a link alone is insufficient.
2. Include the Privacy Policy link and an unambiguous consent action.
3. Use a single-use, short-lived, cryptographically random token stored only as a hash.
4. After the first email response, perform the legally required additional confirmatory step (for example a delayed confirmation, letter, or telephone confirmation as approved by counsel).
5. Grant consent only after both steps succeed.
6. Notify the parent that consent was recorded and explain how to withdraw it.
7. Expire and delete incomplete registrations within 30 days.

## 9. Existing-account migration

Before production:

- Delete disposable development/test child accounts or classify them explicitly as fictional test data.
- Do not mark existing accounts as consented automatically.
- Require a verified parent to complete the approved consent process before an existing account can resume child-data collection.
- Keep administrator accounts outside the child-consent flow.

## 10. Acceptance tests

- No child document exists before consent is granted.
- Closing/reopening during pending consent does not unlock child features.
- An unverified email cannot access the notice-confirmation step.
- A client cannot forge `consentStatus: granted` through Firestore.
- Expired and reused tokens are rejected.
- Declining consent deletes the parent-only registration within the approved window.
- Withdrawing consent immediately blocks child writes and starts deletion.
- Leaderboard remains disabled when its separate consent is false.
- Notice, policy, and inventory versions appear in the consent record.
- Admin accounts continue to work without being treated as child accounts.

## 11. Decisions required before backend implementation

1. Counsel approval of email-plus for the exact internal-use data flow and launch countries.
2. The required second confirmation step.
3. Whether to omit the leaderboard entirely from the first release (recommended) or implement stronger separate consent.
4. Final public Privacy Policy URL.
5. Consent evidence retention approval (currently proposed: three years after deletion/withdrawal).
6. Email delivery provider and sender domain for direct notices.

## 12. Authoritative references

- FTC COPPA FAQs: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- FTC COPPA six-step compliance plan: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Families Policy Requirements: https://support.google.com/googleplay/android-developer/answer/17122218

