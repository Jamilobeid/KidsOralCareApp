export type LegalDocumentId = 'privacy' | 'terms' | 'parentalConsent' | 'deletion';

export type LegalSection = { heading: string; body: string };

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  summary: string;
  version: string;
  publicPath: string;
  sections: LegalSection[];
};

export const legalDocuments: LegalDocument[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    summary: 'How parent and child information is collected, used, protected, and deleted.',
    version: 'Version 1.0',
    publicPath: '/privacy-policy.html',
    sections: [
      { heading: 'Who we are', body: 'eSmile is operated by Jamil Obeid in Beirut, Lebanon. Privacy and deletion questions may be sent to jamilworkinfo@gmail.com or +961 81 343 191.' },
      { heading: 'Information we collect', body: 'We may collect the parent email and verification status; the child’s chosen username, age, avatar and settings; brushing progress; game activity; rewards; reminder preferences and follow-up; account consent records; and limited technical information required to operate and secure the service.' },
      { heading: 'Why we use it', body: 'We use this information to create and secure the family account, provide age-appropriate features, save progress, show the parent dashboard, deliver requested reminders, operate an optional parent-approved leaderboard, provide support, prevent misuse, and meet legal obligations.' },
      { heading: 'Leaderboard', body: 'Leaderboard participation is optional and requires separate parent approval. It is designed to show only the child’s chosen username, non-identifying avatar, points or stars, level, and rank—not the parent email, password, full name, exact age, or contact details.' },
      { heading: 'Service providers', body: 'Firebase and Google Cloud provide authentication and data storage, Netlify supports secure backend functions, and Expo and the device platform support application and notification functions. We do not sell child information or use targeted advertising.' },
      { heading: 'Retention and deletion', body: 'A verified deletion request is normally completed within 30 days, subject to limited lawful retention. Accounts inactive for two years may be deleted after advance notice to the parent.' },
      { heading: 'Parent rights', body: 'A parent may request access, correction, consent withdrawal, leaderboard withdrawal, or deletion by using the Parent Zone where available or contacting jamilworkinfo@gmail.com.' },
      { heading: 'Publication information', body: 'Version 1.0. The effective date and public policy URL will be added when these documents are published.' }
    ]
  },
  {
    id: 'terms',
    title: 'Terms of Use',
    summary: 'The rules for parent-controlled accounts and safe use of eSmile.',
    version: 'Version 1.0',
    publicPath: '/terms-of-use.html',
    sections: [
      { heading: 'Parent acceptance', body: 'The app is designed for children approximately 4–12, but a child may use it only through an account created, verified, consented to, and supervised by a parent or legal guardian. The parent accepts the Terms for themselves and the child.' },
      { heading: 'Account responsibilities', body: 'Parents must provide accurate information, protect the password, supervise use, and select a username that does not reveal the child’s full name, school, address, contact details, or other identifying information.' },
      { heading: 'Educational—not medical—use', body: 'The app supports oral-care education and habits. It is not a medical device, does not diagnose or treat conditions, and does not replace a qualified dentist or doctor. Progress and reminders do not guarantee correct brushing or any health result.' },
      { heading: 'Acceptable use', body: 'Users must not access other accounts or admin features, bypass parental or security controls, interfere with the service, submit unsafe or offensive usernames, manipulate rewards or rankings, or use the app unlawfully.' },
      { heading: 'License and content', body: 'Parents receive a limited, personal, non-commercial, non-transferable license to use the app on supported devices. The app and its content remain owned by or licensed to the operator and applicable third parties.' },
      { heading: 'Availability', body: 'Features may be updated and notifications may be delayed or unavailable because of device or platform settings. Mandatory consumer rights are not excluded.' },
      { heading: 'Ending an account', body: 'Parents may request deletion. We may restrict access when reasonably necessary for child safety, security, legal compliance, or a serious breach of the Terms.' },
      { heading: 'Law and contact', body: 'These Terms use Lebanese law and the competent courts of Beirut while preserving mandatory rights in a user’s country. Contact Jamil Obeid at jamilworkinfo@gmail.com.' },
      { heading: 'Publication information', body: 'Version 1.0. The effective date and public Terms URL will be added when these documents are published.' }
    ]
  },
  {
    id: 'parentalConsent',
    title: 'Parental Consent Information',
    summary: 'What a parent approves before a child profile is created.',
    version: 'Version 1.0',
    publicPath: '/parental-consent.html',
    sections: [
      { heading: 'Account consent', body: 'After the parent email is verified, the parent reviews the data notice and provides their legal name and consent before the child profile is created.' },
      { heading: 'What is covered', body: 'The consent covers the child profile and the information needed for brushing, games, rewards, reminders, progress, parental controls, security, and support as described in the Privacy Policy.' },
      { heading: 'Leaderboard choice', body: 'Leaderboard participation is a separate optional choice. Refusing it does not prevent use of the rest of the app.' },
      { heading: 'Withdrawal', body: 'The parent may withdraw consent or request deletion. If we no longer have permission to process information required for the child account, the account may need to be disabled or deleted.' },
      { heading: 'Contact', body: 'Questions or requests may be sent to Jamil Obeid at jamilworkinfo@gmail.com, Beirut, Lebanon, telephone +961 81 343 191.' }
    ]
  },
  {
    id: 'deletion',
    title: 'Account & Data Deletion',
    summary: 'How a parent requests permanent deletion and what happens next.',
    version: 'Version 1.0',
    publicPath: '/delete-account.html',
    sections: [
      { heading: 'In the app', body: 'Open Settings, unlock the Parent Zone, choose the account deletion option, enter the parent password, type DELETE exactly, and confirm permanent deletion.' },
      { heading: 'By email', body: 'If in-app deletion is unavailable, email jamilworkinfo@gmail.com from the parent email associated with the account. Do not send the password. We may request limited information to verify the request.' },
      { heading: 'What is deleted', body: 'Deletion is intended to remove the authentication account, child profile, progress, brushing and game records, rewards, preferences, active consent data when no longer legally required, and leaderboard entry.' },
      { heading: 'Timing', body: 'A verified request is normally completed within 30 days. Limited records may be retained only when required for security, dispute handling, or a legal obligation, then removed when no longer required.' },
      { heading: 'Important service notice', body: 'The corrected production deletion backend must be deployed and tested end to end before public release. Until then, contact support for assistance.' }
    ]
  }
];

export const getLegalDocument = (id: LegalDocumentId) => legalDocuments.find((document) => document.id === id)!;
