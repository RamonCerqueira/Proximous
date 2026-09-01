import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/colors';

const Badge = ({
  label,
  variant = 'primary', // primary, secondary, gold, success, warning, outline
  size = 'md', // sm, md
  icon,
  style,
  textStyle,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'gold':
        return { backgroundColor: theme.colors.secondarySoft, borderColor: theme.colors.gold };
      case 'success':
        return { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success };
      case 'warning':
        return { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: theme.colors.border, borderWidth: 1 };
      case 'secondary':
        return { backgroundColor: theme.colors.gray[100], borderColor: 'transparent' };
      case 'primary':
      default:
        return { backgroundColor: theme.colors.primarySoft, borderColor: 'transparent' };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'gold':
        return theme.colors.secondaryDark;
      case 'success':
        return theme.colors.successDark;
      case 'warning':
        return theme.colors.warningDark;
      case 'outline':
        return theme.colors.textSecondary;
      case 'secondary':
        return theme.colors.textSecondary;
      case 'primary':
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={[
      styles.badge,
      styles[`badge_${size}`],
      getBadgeStyle(),
      style,
    ]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[
        styles.text,
        styles[`text_${size}`],
        { color: getTextColor() },
        textStyle,
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  badge_sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  badge_md: {
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: theme.fontWeight.semibold,
  },
  text_sm: {
    fontSize: theme.fontSize.caption,
  },
  text_md: {
    fontSize: theme.fontSize.xs,
  },
});

export default Badge;
