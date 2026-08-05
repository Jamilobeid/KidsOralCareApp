import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { AdminUserSummary } from '../types/app';
import { bodyFont, buttonFont, headingFont, rewardFont } from '../utils/kidStyle';

const formatUsageDuration = (totalSeconds: number) => {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0
    ? `${hours}h ${minutes}m`
    : `${hours}h`;
};

const UserActivityCard = ({ user, t }: { user: AdminUserSummary; t: (key: string) => string }) => (
  <Card style={styles.userCard}>
    <View style={styles.userHeader}>
      <View>
        <Text style={[buttonFont, styles.userName]}>{user.nickname}</Text>
        <Text style={[bodyFont, styles.userMeta]}>{t('age')} {user.age} - {t('lastActive')}: {user.lastActive}</Text>
      </View>
      <View style={styles.engagementBadge}>
        <Text style={[rewardFont, styles.engagementValue]}>{user.engagementScore}%</Text>
      </View>
    </View>

    <View style={styles.metricGrid}>
      <Metric label={t('today')} value={`${user.todayBrushes} ${t('brushes')}`} />
      <Metric label={t('thisWeek')} value={`${user.weeklyBrushes} ${t('brushes')}`} />
      <Metric label={t('totalBrushingSessions')} value={`${user.totalBrushes}`} />
      <Metric label={t('totalApplicationUse')} value={formatUsageDuration(user.totalUsageSeconds)} />
      <Metric label={t('totalFollowedReminders')} value={`${user.remindersFollowed}`} />
      <Metric label={t('totalLogins')} value={`${user.loginCount}`} />
      <Metric label={t('completedActivities')} value={`${user.activitiesCompleted}`} />
      <Metric label={t('rewards')} value={`${user.rewardsEarned} ${t('earned')}`} />
    </View>
  </Card>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metric}>
    <Text style={[bodyFont, styles.metricLabel]}>{label}</Text>
    <Text style={[rewardFont, styles.metricValue]}>{value}</Text>
  </View>
);

const SummaryCard = ({ label, value, background, color }: { label: string; value: string | number; background: string; color: string }) => (
  <View style={[styles.summaryCard, { backgroundColor: background }]}>
    <Text style={[buttonFont, styles.summaryLabel]}>{label}</Text>
    <Text style={[rewardFont, styles.summaryValue, { color }]}>{value}</Text>
  </View>
);

export const AdminDashboardScreen = () => {
  const { adminUsers, isAdmin, refreshAdminUsers, t } = useApp();

  const totals = useMemo(() => {
    const remindersFollowed = adminUsers.reduce((total, user) => total + user.remindersFollowed, 0);
    const activitiesCompleted = adminUsers.reduce((total, user) => total + user.activitiesCompleted, 0);
    const brushes = adminUsers.reduce((total, user) => total + user.totalBrushes, 0);
    const totalUsageSeconds = adminUsers.reduce( (total, user) => total + user.totalUsageSeconds, 0);
    const engagement = adminUsers.length ? Math.round(adminUsers.reduce((total, user) => total + user.engagementScore, 0) / adminUsers.length) : 0;

    return { remindersFollowed, activitiesCompleted, brushes, totalUsageSeconds, engagement };
  }, [adminUsers]);

  React.useEffect(() => {
    if (isAdmin) void refreshAdminUsers();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
        <Text style={[headingFont, styles.pageTitle]}>{t('adminDashboard')}</Text>
        <Card style={styles.userCard}>
          <Text style={[headingFont, styles.sectionTitle]}>{t('adminOnly')}</Text>
          <Text style={[bodyFont, styles.subtitle]}>{t('adminOnlyMessage')}</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screen} gradientBackground showDecorations={false}>
      <View style={styles.titleRow}>
        <Text style={[headingFont, styles.pageTitle]}>{t('adminDashboard')}</Text>
        <Pressable onPress={refreshAdminUsers} style={({ pressed }) => [styles.refreshButton, pressed && styles.refreshButtonPressed]}>
          <Text style={[buttonFont, styles.refreshText]}>{t('refresh')}</Text>
        </Pressable>
      </View>
      <Text style={[bodyFont, styles.subtitle]}>{t('adminOverview')}</Text>

      <View style={styles.stats}>
        <SummaryCard label={t('remindersFollowed')} value={totals.remindersFollowed} background="#E9FFF4" color="#168954" />
        <SummaryCard label={t('activitiesCompleted')} value={totals.activitiesCompleted} background="#F0ECFF" color="#7B61FF" />
        <SummaryCard label={t('users')} value={adminUsers.length} background="#E8F7FF" color="#1D9BF0" />
        <SummaryCard label={t('totalBrushes')} value={totals.brushes} background="#FFF5D6" color="#FF9F0A" />
        <SummaryCard label={t('appTime')} value={formatUsageDuration(totals.totalUsageSeconds)} background="#FFEAF3" color="#FF4F86" />
        <SummaryCard label={t('engagement')} value={`${totals.engagement}%`} background="#E6FFF8" color="#168F84" />
      </View>

      <Text style={[headingFont, styles.sectionTitle]}>{t('users')}</Text>

      {adminUsers.map((user) => (
        <UserActivityCard key={user.id} user={user} t={t} />
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: 18, paddingBottom: 30 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  pageTitle: { color: '#41438F', flex: 1, fontSize: 35, lineHeight: 42 },
  subtitle: { color: '#454F59', fontSize: 16, lineHeight: 23 },
  refreshButton: { borderRadius: 18, backgroundColor: '#6155F6', paddingHorizontal: 16, paddingVertical: 10, shadowColor: '#1C2754', shadowOpacity: 0.14, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  refreshButtonPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  refreshText: { color: '#FFFFFF', fontSize: 15 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  summaryCard: { alignItems: 'center', borderRadius: 22, justifyContent: 'center', minHeight: 112, paddingHorizontal: 8, paddingVertical: 12, width: '31%', shadowColor: '#17324D', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  summaryLabel: { color: '#454F59', fontSize: 12, lineHeight: 15, textAlign: 'center' },
  summaryValue: { fontSize: 26, lineHeight: 32, marginTop: 8, textAlign: 'center' },
  sectionTitle: { color: '#41438F', fontSize: 27, lineHeight: 34 },
  userCard: { backgroundColor: '#FFFFFF', borderWidth: 0, borderRadius: 28, gap: 16, shadowColor: '#17324D', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  userName: { color: '#41438F', fontSize: 22 },
  userMeta: { color: '#54708A', fontSize: 13, lineHeight: 18 },
  engagementBadge: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#E6FFF8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  engagementValue: { color: '#159B8F', fontSize: 19 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  metric: {
    width: '47%',
    minHeight: 70,
    borderRadius: 18,
    backgroundColor: '#F7FBFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 4
  },
  metricLabel: { color: '#54708A', fontSize: 12 },
  metricValue: { color: '#16324F', fontSize: 16 }
});
