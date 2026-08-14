import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, matchingAPI } from '../../config/api';
import { theme } from '../../styles/colors';
import Button from '../../components/common/Button';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, matchesRes, achievementsRes] = await Promise.all([
        usersAPI.getStats(),
        matchingAPI.getMatches({ limit: 3 }),
        usersAPI.getAchievements()
      ]);

      setStats(statsRes.data.stats);
      setRecentMatches(matchesRes.data.matches || []);
      setAchievements(achievementsRes.data.achievements?.filter(a => a.is_unlocked) || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const StatCard = ({ icon, title, value, color = theme.colors.primary, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value || 0}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ icon, title, subtitle, onPress, gradient = false }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      {gradient ? (
        <LinearGradient
          colors={theme.colors.gradientPrimary}
          style={styles.quickActionGradient}
        >
          <Ionicons name={icon} size={24} color={theme.colors.white} />
        </LinearGradient>
      ) : (
        <View style={styles.quickActionIcon}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
      )}
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Vamos descobrir pessoas incríveis próximas a você
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Suas estatísticas</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="heart"
              title="Curtidas"
              value={stats?.likes_sent}
              color={theme.colors.error}
              onPress={() => navigation.navigate('Matches')}
            />
            <StatCard
              icon="people"
              title="Matches"
              value={stats?.total_matches}
              color={theme.colors.success}
              onPress={() => navigation.navigate('Matches')}
            />
            <StatCard
              icon="chatbubbles"
              title="Mensagens"
              value={stats?.messages_sent}
              color={theme.colors.info}
              onPress={() => navigation.navigate('Messages')}
            />
            <StatCard
              icon="trophy"
              title="Conquistas"
              value={achievements.length}
              color={theme.colors.warning}
            />
          </View>
        </View>

        {/* Premium Banner */}
        {!user?.is_premium && (
          <TouchableOpacity style={styles.premiumBanner}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryLight]}
              style={styles.premiumGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.premiumContent}>
                <Ionicons name="star" size={32} color={theme.colors.white} />
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Upgrade para Premium</Text>
                  <Text style={styles.premiumSubtitle}>
                    Curtidas ilimitadas, super likes e muito mais!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          
          <QuickActionCard
            icon="search"
            title="Descobrir pessoas"
            subtitle="Encontre pessoas próximas a você"
            onPress={() => navigation.navigate('Discover')}
            gradient={true}
          />
          
          <QuickActionCard
            icon="heart"
            title="Ver matches"
            subtitle={`${stats?.total_matches || 0} matches disponíveis`}
            onPress={() => navigation.navigate('Matches')}
          />
          
          <QuickActionCard
            icon="chatbubbles"
            title="Mensagens"
            subtitle="Continue suas conversas"
            onPress={() => navigation.navigate('Messages')}
          />
          
          <QuickActionCard
            icon="person"
            title="Editar perfil"
            subtitle="Complete seu perfil para mais matches"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Conquistas recentes</Text>
            {achievements.slice(0, 3).map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="trophy" size={20} color={theme.colors.warning} />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.name}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  <Text style={styles.achievementPoints}>
                    +{achievement.points} pontos
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={theme.colors.warning} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Dica do dia</Text>
              <Text style={styles.tipText}>
                Complete seu perfil com fotos e uma bio interessante para receber mais curtidas!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  
  welcomeSection: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  welcomeSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.lineHeight.relaxed,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  
  statsSection: {
    marginBottom: theme.spacing.xl,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
  },
  
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  
  statTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  premiumBanner: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadow.md,
  },
  
  premiumGradient: {
    padding: theme.spacing.lg,
  },
  
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  premiumText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  
  premiumTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  
  premiumSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
  },
  
  quickActionsSection: {
    marginBottom: theme.spacing.xl,
  },
  
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  
  quickActionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  
  quickActionContent: {
    flex: 1,
  },
  
  quickActionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  
  quickActionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  achievementsSection: {
    marginBottom: theme.spacing.xl,
  },
  
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  
  achievementContent: {
    flex: 1,
  },
  
  achievementTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  
  achievementDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  achievementPoints: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    fontWeight: theme.fontWeight.medium,
  },
  
  tipsSection: {
    marginBottom: theme.spacing.lg,
  },
  
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.sm,
  },
  
  tipContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  
  tipTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  
  tipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.lineHeight.relaxed,
  },
});

export default HomeScreen;

