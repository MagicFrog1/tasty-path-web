import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';

interface UpgradePromptProps {
  title: string;
  message: string;
  onUpgrade: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  message,
  onUpgrade,
  onDismiss,
  showDismiss = true,
}) => {
  const handleUpgrade = () => {
    Alert.alert(
      'Actualizar a Premium',
      '¿Te gustaría ver los planes premium disponibles?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ver Planes',
          onPress: onUpgrade,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="star" size={24} color={Colors.white} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>Actualizar</Text>
            </TouchableOpacity>
            
            {showDismiss && onDismiss && (
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={onDismiss}
              >
                <Text style={styles.dismissButtonText}>Cerrar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  gradient: {
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  upgradeButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  upgradeButtonText: {
    ...Typography.button,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dismissButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '500',
  },
});

export default UpgradePrompt;
