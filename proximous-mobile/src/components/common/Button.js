import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/colors';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];
    
    if (variant === 'secondary') {
      return [...baseStyle, styles.buttonSecondary];
    } else if (variant === 'gold') {
      return [...baseStyle, styles.buttonGold];
    } else if (variant === 'outline') {
      return [...baseStyle, styles.buttonOutline];
    } else if (variant === 'ghost') {
      return [...baseStyle, styles.buttonGhost];
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];
    
    if (variant === 'primary' || variant === 'gold') {
      return [...baseStyle, styles.textWhite];
    } else if (variant === 'secondary') {
      return [...baseStyle, styles.textSecondary];
    } else if (variant === 'outline' || variant === 'ghost') {
      return [...baseStyle, styles.textPrimary];
    }
    
    return baseStyle;
  };

  const renderContent = () => (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'gold' ? theme.colors.white : theme.colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if ((variant === 'primary' || variant === 'gold') && !disabled) {
    const gradientColors = variant === 'gold' 
      ? theme.colors.gradientGold 
      : theme.colors.gradientPrimary;

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.wrapper, style]}
        {...props}
      >
        <LinearGradient
          colors={gradientColors}
          style={[getButtonStyle(), disabled && styles.buttonDisabled]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[getButtonStyle(), disabled && styles.buttonDisabled, style]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    ...theme.shadow.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  
  // Sizes
  button_sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    minHeight: 38,
  },
  button_md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 4,
    minHeight: 50,
  },
  button_lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    minHeight: 56,
  },
  
  // Variants
  buttonSecondary: {
    backgroundColor: theme.colors.primarySoft,
  },
  buttonGold: {
    backgroundColor: theme.colors.gold,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: theme.fontSize.sm,
  },
  text_md: {
    fontSize: theme.fontSize.md,
  },
  text_lg: {
    fontSize: theme.fontSize.lg,
  },
  
  // Text colors
  textWhite: {
    color: theme.colors.white,
  },
  textPrimary: {
    color: theme.colors.primary,
  },
  textSecondary: {
    color: theme.colors.primaryDark,
  },
});

export default Button;
