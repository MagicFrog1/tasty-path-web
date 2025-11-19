import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/styles';

export const theme = {
  colors: Colors,
  spacing: Spacing,
  radius: BorderRadius,
  layout: {
    headerHeight: 72,
    sidebarWidth: 280,
    maxContentWidth: 1280,
  },
  shadows: {
    sm: '0 6px 16px rgba(46, 139, 87, 0.08)',
    md: '0 12px 28px rgba(46, 139, 87, 0.12)',
    lg: '0 18px 36px rgba(46, 139, 87, 0.16)',
    soft: '0 10px 30px rgba(105, 117, 134, 0.15)',
    glow: '0 0 24px rgba(99, 102, 241, 0.3)',
  },
  fonts: {
    heading: "'Poppins', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

export type AppTheme = typeof theme;





