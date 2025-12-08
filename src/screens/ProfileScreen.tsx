// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants';
import { useUserProfile } from '../context/UserProfileContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useSubscriptionRestrictions } from '../hooks/useSubscriptionRestrictions';
import { Typography, Spacing, BorderRadius, Shadows, Effects } from '../constants';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  memberSince: string;
  lastLogin: string;
}

interface ProfileScreenProps {
  navigation: {
    navigate: (route: string) => void;
    goBack: () => void;
  };
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { profile, updateProfile } = useUserProfile();
  const { user, logout } = useAuth();
  const { currentPlan, availablePlans } = useSubscription();
  
  // Debug log
  console.log('ProfileScreen - currentPlan:', currentPlan);
  console.log('ProfileScreen - availablePlans:', availablePlans?.length);
  
  

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(profile.name);

  

  const handleEditName = () => {
    setIsEditingName(true);
    setEditingName(profile.name);
  };

  const handleSaveName = async () => {
    if (editingName.trim() && editingName.trim() !== profile.name) {
      try {
        await updateProfile({ name: editingName.trim() });
        setIsEditingName(false);
        Alert.alert('Éxito', 'Nombre actualizado correctamente');
      } catch (error) {
        Alert.alert('Error', 'No se pudo actualizar el nombre');
      }
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditingName(profile.name);
  };

  const navigateToSubscription = () => {
    navigation.navigate('Subscription');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se perderán todos tus datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mostrar confirmación adicional
              Alert.alert(
                'Confirmar Eliminación',
                'Esta acción es irreversible. ¿Estás completamente seguro?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'SÍ, ELIMINAR',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Limpiar todos los datos del usuario de AsyncStorage
                        const keys = await AsyncStorage.getAllKeys();
                        const userKeys = keys.filter((key: string) =>
                          key.startsWith('@tastypath_')
                        );
                        await AsyncStorage.multiRemove(userKeys);
                        
                        // Cerrar sesión en RevenueCat si está disponible
                        try {
                          const { revenueCatService } = await import('../services/RevenueCatService');
                          await revenueCatService.logOut();
                        } catch (error) {
                          console.log('RevenueCat logout error:', error);
                        }
                        
                        // Cerrar sesión y limpiar estado de la app
                        await logout();
                        
                        Alert.alert(
                          'Cuenta Eliminada',
                          'Tu cuenta ha sido eliminada exitosamente. Gracias por usar TastyPath.'
                        );
                        // La navegación a 'Login' se gestionará automáticamente por el estado de autenticación
                      } catch (error) {
                        console.error('Error eliminando cuenta:', error);
                        Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta de nuevo.');
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error en confirmación de eliminación:', error);
              Alert.alert('Error', 'Ocurrió un error. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderInfoRow = (
    icon: string,
    label: string,
    value?: string,
    onPress?: () => void,
    isEditable: boolean = false
  ) => (
    <TouchableOpacity 
      style={styles.infoRow} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={20} color="#8B5CF6" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={styles.infoRight}>
        {value && <Text style={styles.infoValue}>{value}</Text>}
        {isEditable && (
          <Ionicons name="chevron-forward" size={20} color={Colors.darkGray} />
        )}
      </View>
    </TouchableOpacity>
  );

  



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={["#8B5CF6", "#A855F7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
          {currentPlan && (
            <View style={styles.premiumBadge}>
              <Ionicons 
                name={currentPlan.plan === 'free' ? 'time-outline' : 'star'} 
                size={16} 
                color="#8B5CF6" 
              />
              <Text style={styles.premiumText}>
                {currentPlan.plan === 'free' 
                  ? `Plan Gratuito (${trialDaysLeft} días restantes)`
                  : availablePlans.find(p => p.id === currentPlan.plan)?.name
                }
              </Text>
            </View>
          )}
          {/* Se eliminan "Miembro desde" y "Último acceso" para un header más limpio */}
        </View>
        </View>
      </LinearGradient>

      {/* Información Personal */}
      {renderSection('Información Personal', (
        <View style={styles.infoCard}>
          {isEditingName ? (
            <View style={styles.editNameContainer}>
              <View style={styles.infoLeft}>
                <Ionicons name="person-outline" size={20} color="#8B5CF6" />
                <Text style={styles.infoLabel}>Nombre completo</Text>
              </View>
              <View style={styles.editNameInputContainer}>
                <TextInput
                  style={styles.editNameInput}
                  value={editingName}
                  onChangeText={setEditingName}
                  placeholder="Ingresa tu nombre"
                  autoFocus={true}
                />
                <View style={styles.editNameButtons}>
                  <TouchableOpacity 
                    style={styles.saveNameButton} 
                    onPress={handleSaveName}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelNameButton} 
                    onPress={handleCancelEditName}
                  >
                    <Ionicons name="close" size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            renderInfoRow(
              'person-outline',
              'Nombre completo',
              profile.name,
              handleEditName,
              true
            )
          )}
          {renderInfoRow(
            'mail-outline',
            'Correo electrónico',
            profile.email,
            undefined,
            false
          )}
        </View>
      ))}

      


      {/* Suscripción */}
      {renderSection('Suscripción', (
        <View style={styles.infoCard}>
          {currentPlan ? (
            <View style={styles.subscriptionStatusCard}>
              {/* Estado del plan actual */}
              <View style={styles.currentPlanHeader}>
                <View style={styles.planStatusIcon}>
                  <Ionicons 
                    name={currentPlan.plan === 'free' ? 'gift-outline' : 'diamond-outline'} 
                    size={24} 
                    color={currentPlan.plan === 'free' ? '#F59E0B' : '#8B5CF6'} 
                  />
                </View>
                <View style={styles.planStatusText}>
                  <Text style={styles.currentPlanName}>
                    {availablePlans.find(p => p.id === currentPlan.plan)?.name || 'Plan Gratuito'}
                  </Text>
                  <Text style={styles.planStatusDescription}>
                    {currentPlan.plan === 'free' 
                      ? 'Plan básico gratuito'
                      : `€${currentPlan.price}/${availablePlans.find(p => p.id === currentPlan.plan)?.period || 'mes'}`
                    }
                  </Text>
                </View>
                <View style={[styles.planStatusBadge, { backgroundColor: currentPlan.plan === 'free' ? '#FEF3C7' : '#F3E8FF' }]}>
                  <Text style={[styles.planStatusBadgeText, { color: currentPlan.plan === 'free' ? '#D97706' : '#8B5CF6' }]}>
                    {currentPlan.plan === 'free' ? 'GRATUITO' : 'PREMIUM'}
                  </Text>
                </View>
              </View>

              {/* Información adicional */}
              <View style={styles.subscriptionDetails}>
                {currentPlan.plan === 'free' ? (
                  <View style={styles.freeTrialInfo}>
                    <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                    <Text style={styles.freeTrialText}>
                      Acceso limitado a funciones básicas
                    </Text>
                  </View>
                ) : (
                  <View style={styles.premiumInfo}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.premiumInfoText}>
                      Acceso completo a todas las funciones premium
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <Text style={styles.loadingText}>Cargando información de suscripción...</Text>
          )}
          
          <TouchableOpacity onPress={navigateToSubscription} style={styles.manageSubscriptionButton}>
            <LinearGradient colors={["#8B5CF6", "#A855F7"]} style={styles.manageSubscriptionButtonGradient}>
              <Ionicons name="sparkles-outline" size={18} color={Colors.white} />
              <Text style={styles.manageSubscriptionButtonText}>
                {currentPlan?.plan === 'free' ? 'Ver Planes Premium' : 'Gestionar Suscripción'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ))}



      {/* Legal */}
      {renderSection('Legal', (
        <View style={styles.infoCard}>
          {renderInfoRow(
            'document-outline',
            'Términos de Servicio',
            undefined,
            () => navigation.navigate('Terms'),
            true
          )}
          {renderInfoRow(
            'shield-outline',
            'Política de Privacidad',
            undefined,
            () => navigation.navigate('Privacy'),
            true
          )}
          {renderInfoRow(
            'lock-closed-outline',
            'Política de Seguridad',
            undefined,
            () => navigation.navigate('Security'),
            true
          )}
          {renderInfoRow(
            'information-circle-outline',
            'Información Legal',
            undefined,
            () => navigation.navigate('LegalInfo'),
            true
          )}
          {renderInfoRow(
            'medical-outline',
            'Fuentes Médicas',
            undefined,
            () => navigation.navigate('MedicalSources'),
            true
          )}
        </View>
      ))}

      {/* Cuenta */}
      {renderSection('Cuenta', (
        <View style={styles.infoCard}>

          {renderInfoRow(
            'trash-outline',
            'Eliminar Cuenta',
            undefined,
            handleDeleteAccount,
            true
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Versión de la app */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>TastyPath v1.0.0</Text>
        <Text style={styles.versionText}>© 2024 TastyPath Team</Text>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: Spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: Spacing.sm,
    zIndex: 1,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.sm,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  userName: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.bodySmall,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  premiumBadge: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  premiumText: {
    ...Typography.caption,
    color: "#8B5CF6",
    fontWeight: 'bold',
    marginLeft: Spacing.xs,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.08)',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    ...Typography.body,
    marginLeft: Spacing.md,
    flex: 1,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.1)',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    ...Typography.body,
    marginLeft: Spacing.md,
  },
  premiumCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  premiumContent: {
    alignItems: 'center',
  },
  premiumTitle: {
    ...Typography.h3,
    color: Colors.secondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  premiumDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  premiumFeatures: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  featureText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  upgradeButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  upgradeButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderRadius: BorderRadius.md,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.error,
    marginLeft: Spacing.sm,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  versionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  manageSubscriptionButton: {
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  manageSubscriptionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  manageSubscriptionButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: 'bold',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  // Estilos para edición de nombre
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  editNameInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  editNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.body.fontSize,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    marginRight: Spacing.sm,
  },
  editNameButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  saveNameButton: {
    backgroundColor: Colors.success,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelNameButton: {
    backgroundColor: Colors.error,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Nuevos estilos para la sección de suscripción mejorada
  subscriptionStatusCard: {
    padding: Spacing.lg,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  planStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  planStatusText: {
    flex: 1,
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  planStatusDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  planStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planStatusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subscriptionDetails: {
    marginTop: Spacing.sm,
  },
  freeTrialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  freeTrialText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: Spacing.sm,
    flex: 1,
  },
  premiumInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#F0FDF4',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  premiumInfoText: {
    fontSize: 13,
    color: '#065F46',
    marginLeft: Spacing.sm,
    flex: 1,
  },
});

export default ProfileScreen;
