// Proximous Official Mobile Design System Tokens
export const colors = {
  // Primary colors (Luxury Violet)
  primary: '#7C3AED',
  primaryLight: '#A855F7',
  primaryDark: '#5B21B6',
  primarySoft: '#F5EEFF',
  
  // Secondary / Accent colors (Proximous Gold & Warm Amber)
  secondary: '#D97706',
  secondaryLight: '#FBBF24',
  secondaryDark: '#B45309',
  secondarySoft: '#FEF3C7',
  
  gold: '#D97706',
  goldLight: '#FBBF24',
  goldGlow: 'rgba(217, 119, 6, 0.25)',
  
  // Neutrals (Luxury Warm Palette)
  white: '#FFFFFF',
  black: '#090712',
  gray: {
    50: '#FBF9F6',
    100: '#F3EDE4',
    200: '#E8E1D5',
    300: '#D5CDC0',
    400: '#A098AE',
    500: '#716880',
    600: '#524A61',
    700: '#383246',
    800: '#221D2E',
    900: '#181324',
  },
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',
  danger: '#EF4444',
  
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',
  
  // Social interactions
  heart: '#EC4899', // Pinkish-Red for Likes
  star: '#F59E0B',  // Gold for Super-Likes
  message: '#7C3AED', // Violet for Messages
  
  // Backgrounds & Surfaces
  background: '#FBF9F6',
  backgroundSecondary: '#F3EDE4',
  backgroundTertiary: '#E8E1D5',
  
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  
  // Text colors
  textPrimary: '#181324',
  textSecondary: '#716880',
  textTertiary: '#A098AE',
  textMuted: '#A098AE',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E8E1D5',
  borderLight: '#F3EDE4',
  borderDark: '#D5CDC0',
  
  // Shadows & Overlays
  shadow: 'rgba(24, 19, 36, 0.06)',
  shadowDark: 'rgba(24, 19, 36, 0.15)',
  overlay: 'rgba(9, 7, 18, 0.65)',
  overlayLight: 'rgba(9, 7, 18, 0.3)',
  
  // Gradients
  gradientPrimary: ['#7C3AED', '#A855F7'],
  gradientSocial: ['#7C3AED', '#EC4899', '#F59E0B'],
  gradientGold: ['#B45309', '#FBBF24', '#D97706'],
  gradientDark: ['#130F24', '#090712'],
};

export const theme = {
  colors,
  
  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius scale
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Font sizes
  fontSize: {
    caption: 11,
    xs: 12,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    display: 28,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.65,
  },
  
  // Premium Elevation Shadows
  shadow: {
    sm: {
      shadowColor: '#181324',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#181324',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    lg: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export default theme;
