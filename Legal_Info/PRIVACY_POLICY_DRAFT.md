# Kids Oral Care — Privacy Policy (Draft)

Draft owner: Jamil Obeid  
Draft date: 29 July 2026  
Primary market: Lebanon; additional countries to be confirmed before release  
Intended audience: children ages 4–12 and their parents or legal guardians  
Privacy contact: jamilworkinfo@gmail.com

> **Not approved for publication.** This draft is based on the application’s current technical data inventory and approved retention rules. It requires legal review, completion of the operator contact details below, implementation of verifiable parental consent, confirmation of hosting/backup locations, and a final technical audit before release.

## Publication blockers

- Confirm with qualified counsel whether **Beirut, Lebanon** is sufficiently complete as a public postal address or whether a street/building and postal-delivery detail is required.
- Exact launch countries outside Lebanon: **[REQUIRED BEFORE EACH MARKET LAUNCH]**
- Firebase database region and enabled backup/PITR settings: **[REQUIRED]**
- Final verifiable parental-consent method and consent-record retention approval: **[REQUIRED]**
- Final effective date and policy version: **[REQUIRED]**
- End-to-end account deletion test: **BLOCKED UNTIL NETLIFY DEPLOYMENT CREDITS RESET**
- Qualified legal review for Lebanon and every launch country: **[REQUIRED]**

---

## Privacy Policy

### 1. Who operates Kids Oral Care

Kids Oral Care is operated by **Jamil Obeid** (“Kids Oral Care,” “we,” “us,” or “our”). This policy explains how Kids Oral Care collects, uses, discloses, retains, and deletes information when a parent or guardian creates and manages an account for a child using the Kids Oral Care mobile application and related services.

Contact details:

- Email: **jamilworkinfo@gmail.com**
- Postal address: **Beirut, Lebanon**
- Telephone: **+961 81 343 191**

The application is designed for children ages 4–12. A parent or legal guardian must create and control the account, receive notices, provide any required consent, and manage the child’s information.

### 2. Information we collect

We collect only information reasonably necessary to provide the account, oral-care activities, progress features, safety controls, recovery, and reminders.

#### Parent or guardian information

- Parent email address.
- Firebase account identifier and authentication/security metadata.
- Account creation, verification, sign-in, and update timestamps.
- Password-reset and email-verification status.
- Parental-consent status, method, notice version, and timestamps after the consent system is implemented.

Passwords are processed by Firebase Authentication. Kids Oral Care does not store readable passwords in its application database.

#### Child account and profile information

- Child-selected username or nickname.
- Age.
- Selected avatar, theme, and tooth buddy.
- Account level, points, badges, rewards, and challenges.

Parents should help children choose a username that does not contain the child’s real name, email address, school, location, telephone number, or other identifying information.

#### Child activity and progress information

- Brushing completions, times, streaks, weekly and lifetime totals.
- Game activity and daily play counts.
- Rewards, completed activities, and engagement metrics.
- Application usage duration, login count, and last activity time.
- Whether a scheduled brushing reminder was followed.
- Synchronization and update timestamps.

#### Leaderboard information

If the leaderboard is enabled, it may display only the child’s chosen username, avatar, points, and level. It will not display the parent email, child age, detailed activity, or real name. A parent may request removal from the leaderboard without deleting the entire account.

#### Device and local information

- Notification permission status and locally scheduled morning/evening reminder content.
- Device language or locale used to present the application in the selected language.
- A remembered parent email stored locally if “Remember me” is enabled.
- Firebase authentication state and cache needed to maintain a signed-in session.

The current application does **not** collect precise location, contacts, photographs, camera data, microphone recordings, advertising identifiers, or information for targeted advertising. We do not use third-party advertising or behavioral advertising SDKs.

### 3. How information is collected

Information is collected:

- Directly from the parent when the account is created, verified, recovered, or managed.
- From the child’s use of brushing, game, reward, personalization, and reminder features.
- Automatically when Firebase creates account identifiers, authentication records, security metadata, and server timestamps necessary to operate and protect the service.
- Locally from the device when notification reminders or language preferences are configured.

We will not knowingly collect a child’s personal information before providing the parent with required notice and obtaining verifiable parental consent, except where a limited legal exception permits information to be used only to contact the parent and obtain consent. If consent is not completed within the permitted registration period, the unverified registration information will be deleted according to Section 8.

### 4. Why we use information

We use information to:

- Create, authenticate, secure, and recover the parent-controlled account.
- Provide the child’s brushing timer, progress, reminders, games, rewards, personalization, and optional leaderboard.
- Show parents the child’s brushing progress, usage limits, and reminder settings.
- Provide authorized administrators with necessary account, progress, and operational information.
- Prevent duplicate usernames and protect account security.
- Send transactional email verification, password-reset, consent, inactivity, and deletion notices.
- Diagnose failures, protect the service, prevent abuse, and meet legal obligations.
- Produce aggregate statistics only after identifiers have been irreversibly removed.

We do not sell personal information. We do not use children’s information for targeted advertising, profiling for advertising, data brokerage, or training general-purpose artificial-intelligence models.

### 5. When information is disclosed

We disclose information only as necessary to operate and protect Kids Oral Care:

- **Google Firebase** provides authentication, email verification, password reset, database, and related security infrastructure.
- **Netlify** hosts the secure account-and-data deletion function and the public deletion-information page. The function processes an authenticated deletion request only to remove the account and linked Firebase data.
- **Expo and the Android/iOS operating system** support local notification scheduling and application builds. The current reminder implementation does not register an Expo push token or send reminder content to an advertising network.
- **Authorized administrators and service personnel** may access the minimum information required for support, safety, security, deletion, and service operation, subject to access controls.
- **Authorities or other recipients required by law** may receive information when disclosure is legally required, necessary to protect a child or another person, or necessary to establish or defend legal rights.

We require service providers that process personal information for Kids Oral Care to use it only for authorized purposes and provide protections appropriate to children’s information. We do not permit providers to use child account data for their own advertising.

### 6. International processing

Kids Oral Care is operated primarily from Lebanon. Firebase, Netlify, Expo, Apple, Google, and their subprocessors may process information on infrastructure located outside Lebanon or the parent’s country. Before release, we will confirm the Firebase database region, relevant provider locations, and any transfer safeguards required for each launch country.

### 7. Notifications and device permissions

The application may request permission to send morning and evening brushing reminders. These reminders are scheduled locally on the device. Parents can disable reminders in the application settings or the device settings.

Kids Oral Care does not require camera, precise-location, contacts, or microphone-recording permission. If a future feature changes these practices, we will update this policy, provide any required notice, and obtain any required parental consent before collecting the new information.

### 8. How long we retain information

- Active account, parent, child, profile, and progress information is retained while the account remains active.
- Accounts are scheduled for deletion after **two years of inactivity**, following notices to the verified parent email approximately 60, 30, and 7 days before deletion.
- Unverified registrations are retained for no more than **30 days** and then deleted within 7 days after expiry.
- Detailed brushing, game, usage, login, reward, activity, and reminder timestamps are retained for no more than **two years**, unless a shorter period applies.
- Identifiable operational/security logs are retained for no more than **30 days**, unless they are required for a documented active security incident.
- Transactional email queue content is retained for no more than **30 days** after successful delivery or final failure.
- Irreversibly non-identifying aggregate statistics are retained for up to **24 months**.
- Encrypted backups are limited to a rolling maximum of **30 days**. Completed deletions must be reapplied after any restoration.
- Minimal non-identifying consent and deletion evidence is proposed to be retained for **three years** after account deletion or consent withdrawal, subject to final legal approval. This evidence will not include ordinary child profile or activity data.

We delete or irreversibly de-identify information earlier when it is no longer necessary, consent is withdrawn and no other legal basis permits retention, or a verified deletion request is completed.

### 9. Parent and guardian choices and rights

A verified parent or legal guardian may:

- Ask what personal information is held about the parent or child.
- Review the child’s personal information.
- Correct inaccurate account or profile information.
- Request removal from the leaderboard.
- Refuse further collection or use of the child’s information.
- Withdraw parental consent.
- Request deletion of the account and linked personal information.

Requests may be submitted through the protected Parent Zone in the application or by emailing **jamilworkinfo@gmail.com**. We will verify the requester’s authority through recent account authentication or control of the verified parent email before disclosing, correcting, or deleting information.

We aim to remove account-linked information from active systems within **30 days** of a verified deletion request. Provider-controlled backups may retain encrypted copies for up to an additional 30 days before automatic expiry. Already delivered notifications may remain in device notification history until removed by the user or operating system.

If consent is withdrawn and Kids Oral Care cannot operate without the affected processing, we will stop new non-essential processing and begin account deletion.

### 10. Account deletion

Parents can request deletion through:

- **In the application:** Settings → Parent Zone → Delete Account and Data.
- **Outside the application:** the Kids Oral Care public deletion page or **jamilworkinfo@gmail.com**.

Deletion includes the Firebase Authentication account, parent and child profiles, username reservation, leaderboard entry, brushing/game records, progress and activity information, recovery records, and locally scheduled reminders under the application’s control. We may retain only minimal non-identifying evidence of the request and completion where legally permitted or required.

### 11. Security

We use measures designed to protect personal information, including Firebase Authentication, verified parent emails, role-based Firestore rules, protected administrator claims, recent password reauthentication for deletion, restricted service-account credentials, encrypted network connections, and access limitations.

No method of storage or transmission is completely secure. Parents should use a strong, unique password and protect access to the verified parent email and device.

### 12. Children’s privacy and parental consent

Kids Oral Care is child-directed. The parent—not the child—must create and control the account. Before collecting child personal information, we will provide direct notice to the parent and obtain verifiable parental consent using the consent process presented during registration, except where law permits limited collection solely to obtain consent.

A parental gate used to protect settings or external links is not by itself verifiable parental consent. The consent process and its evidence will be implemented and tested before public launch.

### 13. Changes to this policy

We may update this policy when the application, providers, legal requirements, or data practices change. We will update the effective date and provide direct notice to the verified parent when a material change affects practices for which consent was previously provided. Where required, we will obtain new verifiable parental consent before the changed practice begins.

### 14. Contact us

For privacy questions or requests concerning access, correction, consent withdrawal, or deletion, contact:

**Jamil Obeid**  
Email: **jamilworkinfo@gmail.com**  
Postal address: **Beirut, Lebanon**  
Telephone: **+961 81 343 191**

We may request reasonable verification before acting on a request, but we will not ask a parent to send the child’s password by email.

---

## Drafting references

- [FTC COPPA FAQs](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [FTC COPPA six-step compliance plan](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Families Policy Requirements](https://support.google.com/googleplay/android-developer/answer/17122218)
- [Google Play Data Safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469)
- Lebanon Electronic Transactions and Personal Data Protection Law No. 81/2018 — review with qualified Lebanese counsel before publication.
