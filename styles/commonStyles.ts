
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Clinical color scheme
  background: '#F5F5F5',      // Light Gray
  text: '#212121',            // Dark Gray
  textSecondary: '#757575',   // Medium Gray
  primary: '#26A69A',         // Teal
  secondary: '#A7FFEB',       // Mint Green
  accent: '#80CBC4',          // Light Teal
  card: '#FFFFFF',            // White
  highlight: '#B2DFDB',       // Pale Green
  
  // Status colors
  success: '#4CAF50',         // Green for free chairs
  occupied: '#2196F3',        // Blue for occupied chairs
  error: '#F44336',           // Red for errors
  warning: '#FF9800',         // Orange for warnings
  
  // Additional colors
  border: '#E0E0E0',          // Light border
  shadow: 'rgba(0, 0, 0, 0.1)', // Shadow color
};

export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    ...typography.button,
    color: colors.card,
  },
  buttonTextSecondary: {
    ...typography.button,
    color: colors.text,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  successText: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xs,
  },
});

export const chairStyles = StyleSheet.create({
  chairCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    margin: spacing.sm,
    minHeight: 120,
    flex: 1,
    maxWidth: '48%',
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 3,
  },
  chairCardFree: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  chairCardOccupied: {
    borderLeftWidth: 4,
    borderLeftColor: colors.occupied,
  },
  chairStatus: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chairStatusFree: {
    color: colors.success,
  },
  chairStatusOccupied: {
    color: colors.occupied,
  },
  chairId: {
    ...typography.h3,
    marginVertical: spacing.xs,
  },
  timerText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.occupied,
  },
});
