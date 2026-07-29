import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LegalDocumentModal } from '../components/LegalDocumentModal';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { legalDocuments, LegalDocumentId } from '../data/legalDocuments';
import { bodyFont, headingFont } from '../utils/kidStyle';

const icons: Record<LegalDocumentId, keyof typeof Ionicons.glyphMap> = {
  privacy: 'shield-checkmark-outline', terms: 'document-text-outline', parentalConsent: 'people-outline', deletion: 'trash-bin-outline'
};

export const LegalInformationScreen = () => {
  const { setScreen } = useApp();
  const [selected, setSelected] = useState<LegalDocumentId | null>(null);
  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to settings" onPress={() => setScreen('settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#41438F" />
        </Pressable>
        <Text style={[headingFont, styles.title]}>Legal Information</Text>
      </View>
      <Text style={[bodyFont, styles.intro]}>Parents can review these documents at any time. Each document is currently marked as a draft until final legal review.</Text>
      {legalDocuments.map((document) => (
        <Pressable key={document.id} accessibilityRole="button" onPress={() => setSelected(document.id)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.iconWrap}><Ionicons name={icons[document.id]} size={30} color="#41438F" /></View>
          <View style={styles.copy}>
            <Text style={[headingFont, styles.cardTitle]}>{document.title}</Text>
            <Text style={[bodyFont, styles.summary]}>{document.summary}</Text>
            <Text style={[bodyFont, styles.version]}>{document.version} · Review pending</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#7A9995" />
        </Pressable>
      ))}
      <View style={styles.contactCard}>
        <Text style={[headingFont, styles.contactTitle]}>Questions or requests</Text>
        <Text style={[bodyFont, styles.contactText]}>Jamil Obeid · Beirut, Lebanon</Text>
        <Text style={[bodyFont, styles.contactText]}>jamilworkinfo@gmail.com · +961 81 343 191</Text>
      </View>
      <LegalDocumentModal documentId={selected} onClose={() => setSelected(null)} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 15, paddingBottom: 28 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  backButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 19, height: 44, justifyContent: 'center', width: 44 },
  title: { color: '#41438F', flex: 1, fontSize: 29, lineHeight: 35 },
  intro: { color: '#455A68', fontSize: 14, lineHeight: 21, marginBottom: 2 },
  card: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, elevation: 3, flexDirection: 'row', gap: 13, minHeight: 112, padding: 16, shadowColor: '#17324D', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 10 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  iconWrap: { alignItems: 'center', backgroundColor: '#EAF7FF', borderRadius: 20, height: 58, justifyContent: 'center', width: 58 },
  copy: { flex: 1, gap: 3 },
  cardTitle: { color: '#173D3B', fontSize: 19, lineHeight: 24 },
  summary: { color: '#526A68', fontSize: 12, lineHeight: 17 },
  version: { color: '#8A6A1D', fontSize: 11, lineHeight: 16 },
  contactCard: { backgroundColor: '#E9FFF4', borderRadius: 20, gap: 3, marginTop: 3, padding: 17 },
  contactTitle: { color: '#173D3B', fontSize: 17, lineHeight: 22 },
  contactText: { color: '#526A68', fontSize: 12, lineHeight: 18 }
});
