import { Colors } from './colors';
import { Typography, Spacing, BorderRadius, Shadows, Effects } from './index';

// Estilos modernos y premium adicionales para TastyPath
// Efectos visuales avanzados y componentes de alta calidad

export const ModernStyles = {
  // Efectos de glassmorphism modernos
  glassCard: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.glass,
    ...Shadows.glass,
    padding: Spacing.lg,
  },

  // Efectos de neumorphism
  neumorphicCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    padding: Spacing.lg,
  },

  // Botones premium con gradientes
  premiumButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 56,
    ...Shadows.premium,
  },

  // Tarjetas flotantes con sombras profundas
  floatingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    ...Shadows.large,
    borderWidth: 1,
    borderColor: Colors.glass,
  },

  // Headers modernos con gradientes
  modernHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xxl,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },

  // Iconos con efectos modernos
  modernIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glass,
  },

  // Inputs modernos con efectos
  modernInput: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
    fontSize: Typography.body.fontSize,
    color: Colors.textPrimary,
    ...Shadows.small,
  },

  // Chips modernos con gradientes
  modernChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.glass,
    ...Shadows.small,
  },

  // Badges premium
  premiumBadge: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    ...Shadows.premium,
  },

  // Indicadores de progreso modernos
  progressBar: {
    height: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.gray,
    overflow: 'hidden' as const,
  },

  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.pill,
  },

  // Listas modernas
  modernListItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.glass,
  },

  // Modales modernos
  modernModal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    margin: Spacing.md,
    ...Shadows.large,
    borderWidth: 1,
    borderColor: Colors.glass,
  },

  // Navegación moderna
  modernTabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.glass,
    ...Shadows.medium,
  },

  // Animaciones y transiciones
  smoothTransition: {
    transition: 'all 0.3s ease-in-out',
  },

  // Efectos de hover (para web)
  hoverEffect: {
    transform: [{ scale: 1.02 }],
    ...Shadows.medium,
  },

  // Efectos de presión (para móvil)
  pressEffect: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
} as const;

// Componentes reutilizables modernos
export const ModernComponents = {
  // Tarjeta de estadísticas moderna
  statsCard: {
    container: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xxl,
      padding: Spacing.lg,
      ...Shadows.medium,
      borderWidth: 1,
      borderColor: Colors.glass,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.round,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: Spacing.md,
    },
    number: {
      ...Typography.h2,
      color: Colors.primary,
      marginBottom: Spacing.xs,
    },
    label: {
      ...Typography.caption,
      color: Colors.textSecondary,
      textAlign: 'center' as const,
    },
  },

  // Botón de acción moderna
  actionButton: {
    container: {
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 56,
      ...Shadows.medium,
    },
    text: {
      ...Typography.button,
      textAlign: 'center' as const,
    },
  },

  // Input moderno
  input: {
    container: {
      marginBottom: Spacing.md,
    },
    input: {
      backgroundColor: Colors.white,
      borderWidth: 2,
      borderColor: Colors.gray,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.md,
      minHeight: 56,
      fontSize: Typography.body.fontSize,
      color: Colors.textPrimary,
      ...Shadows.small,
    },
    label: {
      ...Typography.bodySmall,
      color: Colors.textSecondary,
      marginBottom: Spacing.xs,
    },
  },
} as const;

export type ModernStyleKey = keyof typeof ModernStyles;
export type ModernComponentKey = keyof typeof ModernComponents;
