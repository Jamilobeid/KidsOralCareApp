import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

admin.initializeApp();
const db = admin.firestore();

export const aggregateBrushingSession = onDocumentCreated('brushingSessions/{sessionId}', async (event) => {
  const data = event.data?.data();
  if (!data?.childId) return;

  const statsRef = db.doc('analytics/daily');
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(statsRef);
    const sessions = (current.data()?.brushingSessions ?? 0) + 1;
    transaction.set(statsRef, {
      brushingSessions: sessions,
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
});

export const aggregateGameSession = onDocumentCreated('gameSessions/{sessionId}', async (event) => {
  const data = event.data?.data();
  if (!data?.gameId) return;

  const statsRef = db.doc('analytics/games');
  await statsRef.set({
    [`usage.${data.gameId}`]: admin.firestore.FieldValue.increment(1),
    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
});
