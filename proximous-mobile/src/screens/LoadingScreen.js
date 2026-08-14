import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/colors';

const LoadingScreen = () => {
  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.accent]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={theme.colors.gradientPrimary}
            style={styles.logoGradient}
          >
            <Ionicons name="heart" size={32} color={theme.colors.white} />
          </LinearGradient>
        </View>
        
        <Text style={styles.logoText}>Proximous</Text>
        
        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    alignItems: 'center',
  },
  
  logoContainer: {
    marginBottom: theme.spacing.md,
  },
  
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.lg,
  },
  
  logoText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xxl,
  },
  
  loadingContainer: {
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

export default LoadingScreen;

