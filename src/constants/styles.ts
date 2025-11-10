import { Colors } from './colors';

// Estilos y tipografía moderna y premium para TastyPath
// Diseño contemporáneo con tipografía elegante y efectos visuales avanzados

export const Typography = {
  // Tipografía moderna y elegante
  h1: {
    fontSize: 36,
    fontWeight: '800' as const,
    lineHeight: 44,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 26,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: Colors.textSecondary,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 18,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  display: {
    fontSize: 48,
    fontWeight: '900' as const,
    lineHeight: 56,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
  pill: 100,
} as const;

export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  glass: {
    shadowColor: Colors.glassDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  premium: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

export const Layout = {
  screenPadding: Spacing.md,
  cardPadding: Spacing.lg,
  buttonHeight: 56,
  inputHeight: 56,
  iconSize: 24,
  avatarSize: 48,
  cardSpacing: Spacing.md,
} as const;

// Estilos comunes reutilizables modernos
export const CommonStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Layout.cardPadding,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  // Estilos mejorados para botones con mejor legibilidad
  button: {
    primary: {
      backgroundColor: Colors.primary,
      borderWidth: 0,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      ...Shadows.medium,
      minHeight: Layout.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondary: {
      backgroundColor: Colors.white,
      borderWidth: 2,
      borderColor: Colors.primary,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      ...Shadows.small,
      minHeight: Layout.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    success: {
      backgroundColor: Colors.success,
      borderWidth: 0,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      ...Shadows.medium,
      minHeight: Layout.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    warning: {
      backgroundColor: Colors.warning,
      borderWidth: 0,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      ...Shadows.medium,
      minHeight: Layout.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    error: {
      backgroundColor: Colors.error,
      borderWidth: 0,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      ...Shadows.medium,
      minHeight: Layout.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.gray,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      minHeight: Layout.buttonHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  buttonText: {
    primary: {
      ...Typography.button,
      color: Colors.white,
      fontWeight: '700',
      textAlign: 'center',
    },
    secondary: {
      ...Typography.button,
      color: Colors.primary,
      fontWeight: '700',
      textAlign: 'center',
    },
    success: {
      ...Typography.button,
      color: Colors.white,
      fontWeight: '700',
      textAlign: 'center',
    },
    warning: {
      ...Typography.button,
      color: Colors.white,
      fontWeight: '700',
      textAlign: 'center',
    },
    error: {
      ...Typography.button,
      color: Colors.white,
      fontWeight: '700',
      textAlign: 'center',
    },
    outline: {
      ...Typography.button,
      color: Colors.textPrimary,
      fontWeight: '600',
      textAlign: 'center',
    },
  },
} as const;

// Efectos visuales modernos
export const Effects = {
  glassmorphism: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass,
    ...Shadows.glass,
  },
  neumorphism: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  gradient: {
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  floating: {
    ...Shadows.large,
    borderRadius: BorderRadius.xl,
  },
} as const;
