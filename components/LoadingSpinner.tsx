
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors, commonStyles, typography, spacing } from '@/styles/commonStyles';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({ message = 'Cargando...', size = 'large' }: LoadingSpinnerProps) {
  return (
    <View style={[commonStyles.center, { flex: 1, gap: spacing.md }]}>
      <ActivityIndicator size={size} color={colors.primary} />
      <Text style={[typography.bodySecondary, { textAlign: 'center' }]}>
        {message}
      </Text>
    </View>
  );
}
