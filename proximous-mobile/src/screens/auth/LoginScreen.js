import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/helpers';
import { theme } from '../../styles/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const result = await login(formData);
      
      if (!result.success) {
        Alert.alert('Erro no login', result.error);
      }
      // Navigation will be handled by AuthContext
    } catch (error) {
      Alert.alert('Erro', 'Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.accent]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={theme.colors.gradientPrimary}
                  style={styles.logoGradient}
                >
                  <Ionicons name="heart" size={32} color={theme.colors.white} />
                </LinearGradient>
              </View>
              <Text style={styles.logoText}>Proximous</Text>
              <Text style={styles.tagline}>
                Conecte-se com pessoas próximas de forma segura
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Entrar</Text>
              <Text style={styles.formSubtitle}>
                Entre com sua conta para continuar
              </Text>

              <Input
                label="Email"
                placeholder="seu@email.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                }
              />

              <Input
                label="Senha"
                placeholder="Sua senha"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={errors.password}
                secureTextEntry
                leftIcon={
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                }
              />

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>

              <Button
                title="Entrar"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <Button
                title="Continuar com Google"
                variant="outline"
                onPress={() => {
                  // Implement Google login
                  Alert.alert('Em breve', 'Login com Google será implementado em breve');
                }}
                style={styles.socialButton}
                icon={
                  <Ionicons 
                    name="logo-google" 
                    size={20} 
                    color={theme.colors.primary}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                }
              />

              <Button
                title="Continuar com Apple"
                variant="outline"
                onPress={() => {
                  // Implement Apple login
                  Alert.alert('Em breve', 'Login com Apple será implementado em breve');
                }}
                style={styles.socialButton}
                icon={
                  <Ionicons 
                    name="logo-apple" 
                    size={20} 
                    color={theme.colors.primary}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                }
              />
            </View>

            {/* Register Section */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>
                Não tem uma conta?{' '}
                <Text style={styles.registerLink} onPress={handleRegister}>
                  Criar conta
                </Text>
              </Text>
            </View>

            {/* Terms Section */}
            <View style={styles.termsSection}>
              <Text style={styles.termsText}>
                Ao entrar, você concorda com nossos{' '}
                <Text style={styles.termsLink}>Termos de Uso</Text>
                {' '}e{' '}
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  gradient: {
    flex: 1,
  },
  
  keyboardView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
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
    marginBottom: theme.spacing.sm,
  },
  
  tagline: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.lineHeight.relaxed,
  },
  
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  
  formTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  formSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  
  forgotPasswordText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  
  loginButton: {
    marginBottom: theme.spacing.lg,
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  
  dividerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  
  socialButton: {
    marginBottom: theme.spacing.md,
  },
  
  registerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  registerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  
  registerLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  
  termsSection: {
    alignItems: 'center',
  },
  
  termsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: theme.lineHeight.relaxed,
  },
  
  termsLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default LoginScreen;

