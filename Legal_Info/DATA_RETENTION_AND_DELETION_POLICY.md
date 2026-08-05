# eSmile — Data Retention and Deletion Policy

Document owner: Jamil Obeid  
Privacy contact: jamilworkinfo@gmail.com  
Status: Product-owner approved; implementation and legal review in progress  
Version: 1.0  
Date: 29 July 2026  
Primary market: Lebanon; additional international markets to be finalized

> This document defines the engineering and operational rules for retaining and deleting data. It is not the public Privacy Policy and is not legal advice. It must be reviewed against Lebanese Law No. 81/2018 and the laws of every additional launch country before production release.

## 1. Policy principles

eSmile will:

1. Collect only data needed to provide the child’s account, progress, safety, recovery, and reminders.
2. Document a specific purpose and retention period for every personal-data category.
3. Never retain children’s personal information indefinitely.
4. Delete or de-identify data when its purpose ends, consent is withdrawn, an account is deleted, or the retention period expires.
5. Give a verified parent or guardian control over review, correction, consent withdrawal, and deletion.
6. Remove account-linked data from active systems within 30 days of a verified request.
7. Keep only the minimum non-identifying evidence required for security, fraud prevention, dispute handling, or legal compliance.
8. Prevent deleted data from being restored from backup without reapplying the deletion record.

## 2. Definitions

- **Active account:** An account with a successful authenticated login or meaningful authenticated application activity during the previous two years.
- **Meaningful activity:** Login, brushing completion, game completion, profile/reward update, reminder completion, or parent settings change. Merely receiving a notification does not count.
- **Last activity timestamp:** The latest trusted server timestamp across Firebase Authentication’s last sign-in and the Firestore `lastActiveAt` field.
- **Inactivity:** No successful login or meaningful activity for two continuous years.
- **Account-linked data:** Any record that contains or can reasonably be linked to the Firebase UID, parent email, child username, username reservation, or child profile.
- **Deletion:** Removal from active systems so the information is no longer available in the ordinary course of business, followed by expiry from backups according to this policy.
- **De-identification:** Irreversible removal of identifiers and linkable values so a record cannot reasonably be connected to a parent or child.
- **Verified request:** A request confirmed through recent account authentication or control of the verified parent email.

## 3. Retention schedule

| Data category | Retention while active | Trigger for deletion | Deletion deadline | Permitted exception |
|---|---|---|---|---|
| Firebase Authentication account, UID, parent email, and credentials | While account is active | Verified deletion request, verified consent withdrawal requiring deletion, or two years of inactivity after notices | Active account removed within 30 days | Minimal deletion evidence only; never retain credentials |
| Parent Firestore profile | While account is active | Same as account | Within 30 days | None unless legally required |
| Child Firestore profile, age, username, personalization, and progress | While account is active | Same as account | Within 30 days | None; child profile data must not be retained for analytics after deletion |
| Username reservation | While corresponding account exists | Account deletion | Same transaction/job as child profile | None; username may become available after deletion finishes |
| Brushing and game session records | While account is active, but no longer than two years from each event unless needed for the currently displayed lifetime total | Account deletion or event age limit | Within 30 days of trigger | Only irreversibly aggregated, non-identifying counts may remain |
| Usage, login, activity, reward, and reminder metrics linked to the child | While account is active; detailed timestamps no longer than two years | Account deletion or metric age limit | Within 30 days | Irreversibly aggregated counts only |
| Leaderboard entry containing child username | While account is active and leaderboard participation remains enabled | Account deletion, parent opt-out, username change, or consent withdrawal | Remove promptly; no later than 30 days | None |
| Legacy locally remembered parent email | No current retention; current versions never store it | First startup after update | Deleted immediately by a one-way migration without reading the value | AsyncStorage dependency may be removed after the migration window is complete |
| Local notification schedules and payloads | Until reminders are disabled, replaced, or account is deleted | User action or deletion | Immediately on device when action completes | Already delivered notifications may remain in device notification history until cleared by the app/user/OS |
| Unverified registration | Up to 30 days after account creation | Email remains unverified for 30 days | Delete within 7 days after expiry | Parent may restart registration |
| Verification token | Maximum 24 hours | Token used or expires | Immediately after successful use; expired tokens removed within 24 hours | Store only a cryptographic hash, never the raw token |
| Password-reset token | Provider-defined short validity period | Used or expires | Firebase-controlled expiry | No application database copy |
| Transactional email queue/message content | Up to 30 days after successful delivery or final failure | Delivery/failure | Delete by day 30 | Minimal delivery status may be retained in de-identified operational logs |
| Identifiable application/security logs | Maximum 30 days | Log age | Automatically expire | Longer retention only for a documented active security incident and with restricted access |
| Aggregate analytics with no UID, email, username, device ID, or linkable identifier | Up to 24 months | Aggregate age | Automatically expire or regenerate | May be retained longer only after documented proof it is irreversibly non-identifying and needed for a specific purpose |
| Parental-consent evidence | While account is active; proposed three years after account deletion/withdrawal | End of evidence period | Delete at end of period | Retain only policy/notice versions, method, timestamps, consent status, and a one-way internal reference; no child username, age, activity, or parent email unless counsel confirms necessity |
| Deletion-request/completion evidence | Proposed three years after completion | End of evidence period | Delete at end of period | Retain only request/completion timestamps, method, result, and a one-way internal reference |
| Encrypted backups | Rolling maximum of 30 days | Active-system deletion | Expire no later than 30 days after active deletion | Backups are access-restricted and not used operationally; any disaster restore must reapply the deletion ledger before service resumes |

The proposed three-year period for consent and deletion evidence requires legal approval before launch. It is not approval to retain ordinary child account data.

## 4. Inactivity lifecycle

1. Every meaningful authenticated activity updates `children/{uid}.lastActiveAt` using a Firebase server timestamp.
2. A scheduled backend job compares the trusted last activity timestamp with the current server time.
3. At 60 days before the two-year inactivity date, send the first notice to the verified parent email.
4. At 30 days before deletion, send a second notice.
5. At 7 days before deletion, send the final notice.
6. Each notice states the scheduled deletion date, affected account, consequences, and how to keep or delete the account.
7. A successful authenticated login or meaningful activity cancels inactivity deletion and records the cancellation.
8. If the parent chooses deletion from the notice, process it as a verified deletion request without waiting for the inactivity date.
9. If no activity occurs, create a deletion job at the two-year threshold.
10. Complete deletion from active systems within 30 days and send confirmation to the parent.

The client now writes trusted `lastActiveAt` server timestamps for meaningful activity. The legacy display value `lastActive: "Now"` remains temporarily for the current admin UI and must never determine deletion eligibility.

## 5. Parent-requested deletion

### In-app path

`Settings → Parent Zone → Account and Privacy → Delete Account and Data`

The deletion flow must:

1. Remain behind the protected parent area.
2. Explain all data categories that will be deleted and any minimal evidence that may be retained.
3. Require recent Firebase reauthentication.
4. Require an explicit confirmation phrase such as `DELETE`.
5. Offer a separate **Cancel** action before submission.
6. Submit a deletion job to a trusted Firebase backend; never expose Admin SDK credentials to the mobile app.
7. Immediately prevent new child activity writes once deletion processing begins.
8. Display/email a request receipt and expected completion deadline.

### External path

A public webpage must allow deletion requests when the application is unavailable or uninstalled. It must identify eSmile and Jamil Obeid, provide a request form or `jamilworkinfo@gmail.com`, and verify control of the parent email before disclosure or deletion.

### Request authentication

- Signed-in requests: recent password reauthentication plus verified parent email.
- External requests: send a single-use, short-lived link to the verified parent email.
- Never ask for the child’s password by email.
- Do not reveal whether an account exists until the requester proves control of the relevant parent email.
- Administrator initiation is allowed only for documented support, legal, or security reasons and must use the same audit process.

## 6. Deletion job scope and order

The backend deletion job must be idempotent: repeating it must be safe and must not recreate data.

1. Create a deletion request record containing only necessary audit metadata and status.
2. Disable application writes for the account or mark it `deletionPending` in a server-protected record.
3. Locate all records using the Firebase UID, child ID, username key, and any current/legacy identifiers.
4. Delete leaderboard entries associated with the child.
5. Delete brushing-session and game-session records associated with the child.
6. Delete the active child document and any subcollections.
7. Delete the username reservation.
8. Delete the parent document.
9. Delete applicable recovery profile and queued email records.
10. Delete or de-identify any remaining account-linked operational records.
11. Delete the Firebase Authentication account last, after database cleanup authorization has succeeded.
12. Mark the deletion audit record complete using only the minimal one-way reference and timestamps.
13. Send completion confirmation to the verified privacy contact path without recreating a permanent email profile.
14. On the device, cancel reminders, clear AsyncStorage/account caches, sign out, and return to the welcome screen.

Collections currently in scope:

- `parents`
- `children`
- `usernames`
- `leaderboard`
- `brushingSessions`
- `gameSessions`
- `recoveryProfiles` if retained
- `users` if legacy login is activated
- account-linked `mail` documents if retained
- Firebase Authentication
- any future consent, deletion, notification, or activity-event collections

## 7. Consent withdrawal

1. A verified parent can withdraw consent from the Parent Zone or by contacting `jamilworkinfo@gmail.com`.
2. Stop new non-essential processing immediately after verification.
3. Explain whether withdrawal makes the child account unusable.
4. If the service cannot operate without the withdrawn processing, begin full account deletion.
5. Complete active-system deletion within 30 days.
6. Retain only minimal consent-withdrawal evidence for the legally approved evidence period.

## 8. Correction and partial deletion

- Parents may correct an inaccurate child username/profile field where product rules permit.
- A username change must atomically remove the old leaderboard entry/reservation and create the new reservation.
- Parents may request deletion of optional leaderboard participation without deleting the full account.
- Core progress deletion should be supported as a separate request only if the remaining account can function accurately and safely.
- Partial deletion must not leave orphaned identifiers or misleading admin metrics.

## 9. Backup and restoration controls

1. Confirm whether Firestore scheduled backups, point-in-time recovery, Authentication exports, device backups, and build/test databases are enabled.
2. Configure retained server backups for a rolling maximum of 30 days.
3. Encrypt backups and restrict access to specifically authorized administrators.
4. Maintain a deletion ledger with non-reversible account references for the duration of the backup window.
5. After any restore, re-run completed deletion jobs before making the restored service available.
6. Never restore data merely to answer an ordinary access request.
7. Document provider-controlled retention that cannot be configured and confirm its legal acceptability before launch.

## 10. Test and development data

- Do not use real children’s information in development, screenshots, demos, automated tests, or support reproduction.
- Use clearly fictional accounts and parent emails controlled by the development team.
- Delete test accounts before production launch and after each external test cycle.
- Production data must not be copied into local development databases.
- Service-account keys and deletion exports must never be committed to source control.

## 11. Administrative access

- Only authorized administrators with an active operational need may access identifiable child information.
- Administrator access must use individual accounts, not shared credentials.
- Grant the least privilege necessary and revoke access immediately when no longer required.
- Record administrator access to deletion tools and changes to consent/deletion status.
- Review administrator access at least every three months.
- Do not export child data to personal email, spreadsheets, or unmanaged devices.

## 12. Exceptions

An exception is permitted only when:

1. A specific legal, security, fraud-prevention, or dispute requirement is documented.
2. The retained fields are limited to what is strictly necessary.
3. Access is restricted.
4. A deletion date is assigned.
5. The parent is informed where legally permitted and required.
6. The exception is approved by the privacy owner and, where appropriate, legal counsel.

Product analytics, convenience, possible future use, machine learning, or indefinite backups are not valid exceptions.

## 13. Implementation acceptance criteria

- Retention periods are enforced by backend jobs, not manual memory.
- `lastActiveAt` uses server time and is updated consistently.
- Notices are sent at 60, 30, and 7 days before inactivity deletion.
- Parent-requested and inactivity deletion remove every account-linked collection.
- Deletion is safe to retry and produces an auditable result.
- Authentication deletion cannot leave accessible Firestore records behind.
- The legacy remembered-email key is removed on first startup after update; cached account state and scheduled reminders are cleared on deletion.
- Leaderboard username disappears after opt-out or deletion.
- Backup retention is no more than 30 days and restored deletions are reapplied.
- The parent receives request and completion confirmation.
- Admin dashboards stop displaying the deleted child.
- Automated emulator tests cover successful, partial-failure, retry, and unauthorized deletion attempts.

## 14. Review and approval

Before production launch, obtain:

- Product-owner approval of notice timing and account consequences.
- Technical verification of Firebase/backup configuration.
- Legal review for Lebanon and each additional market.
- Legal approval of the proposed three-year minimal consent/deletion evidence period.
- Confirmation that the public Privacy Policy and store disclosures match this operational policy.

## 15. Authoritative references

- FTC COPPA compliance plan: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- Google Play account-deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111
- Apple in-app account-deletion guidance: https://developer.apple.com/support/offering-account-deletion-in-your-app
- Lebanon Law No. 81/2018 must be reviewed with qualified Lebanese counsel before publication.
