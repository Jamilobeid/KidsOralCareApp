import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLegalDocument, LegalDocumentId } from '../data/legalDocuments';
import { useApp } from '../context/AppContext';
import { bodyFont, headingFont } from '../utils/kidStyle';

type Props = { documentId: LegalDocumentId | null; onClose: () => void };

const publicEnvironment = process.env as Record<string, string | undefined>;

export const LegalDocumentModal = ({ documentId, onClose }: Props) => {
  const { t } = useApp();
  const document = documentId ? getLegalDocument(documentId) : null;
  const publicBaseUrl = publicEnvironment.EXPO_PUBLIC_LEGAL_BASE_URL?.trim().replace(/\/$/, '');
  return (
    <Modal visible={document !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {document ? (
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[headingFont, styles.title]}>{t(`legalTitle_${document.id}`)}</Text>
              <Text style={[bodyFont, styles.version]}>{document.version} · Effective date pending publication</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('closeLegalDocument')} onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={25} color="#41438F" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.publicationBanner}>
              <Ionicons name="calendar-outline" size={22} color="#25645E" />
              <Text style={[bodyFont, styles.publicationText]}>{t('publicationDateNotice')}</Text>
            </View>
            {document.sections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={[headingFont, styles.sectionTitle]}>{section.heading}</Text>
                <Text style={[bodyFont, styles.body]}>{section.body}</Text>
              </View>
            ))}
            <Text style={[bodyFont, styles.updated]}>{t('contact')}: jamilworkinfo@gmail.com</Text>
            {publicBaseUrl ? (
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`${publicBaseUrl}${document.publicPath}`)} style={styles.publicLink}>
                <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                <Text style={[headingFont, styles.publicLinkText]}>{t('viewPublicWebVersion')}</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5FFFD' },
  header: { alignItems: 'center', borderBottomColor: '#D7ECE8', borderBottomWidth: 1, flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16 },
  headerCopy: { flex: 1 },
  title: { color: '#41438F', fontSize: 25, lineHeight: 31 },
  version: { color: '#6E8582', fontSize: 12, lineHeight: 18, marginTop: 2 },
  closeButton: { alignItems: 'center', backgroundColor: '#E9F4FF', borderRadius: 18, height: 42, justifyContent: 'center', width: 42 },
  content: { gap: 16, padding: 20, paddingBottom: 40 },
  publicationBanner: { alignItems: 'center', backgroundColor: '#E9FFF4', borderColor: '#A7E8D2', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 14 },
  publicationText: { color: '#25645E', flex: 1, fontSize: 13, lineHeight: 19 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 18, elevation: 1, gap: 7, padding: 17, shadowColor: '#17324D', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 7 },
  sectionTitle: { color: '#173D3B', fontSize: 18, lineHeight: 24 },
  body: { color: '#455A68', fontSize: 14, lineHeight: 22 },
  updated: { color: '#6E8582', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  publicLink: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#41438F', borderRadius: 999, flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 12 },
  publicLinkText: { color: '#FFFFFF', fontSize: 14 }
});
