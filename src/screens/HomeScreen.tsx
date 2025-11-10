import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows, Effects } from '../constants';
import { getRandomTips, getTipOfTheDay, NutritionTip } from '../constants/nutritionTips';


const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Estado para los consejos de nutrición
  const [nutritionTips, setNutritionTips] = React.useState<NutritionTip[]>([]);
  const [tipOfTheDay, setTipOfTheDay] = React.useState<NutritionTip | null>(null);

  // Cargar consejos de nutrición
  React.useEffect(() => {
    // Cargar consejos de nutrición aleatorios
    setNutritionTips(getRandomTips(4));
    setTipOfTheDay(getTipOfTheDay());
  }, []);

  const quickActions = [
    {
      id: '1',
      title: 'Crear Plan Semanal',
      description: 'Planifica tus comidas para toda la semana',
      icon: 'calendar',
      gradient: Colors.premiumGradient,
      route: 'PlanGenerator',
      color: Colors.primary,
      badge: 'Nuevo',
    },
    {
      id: '2',
      title: 'Gestionar Planes',
      description: 'Ver y gestionar tus planes semanales',
      icon: 'list',
      gradient: Colors.secondaryGradient,
      route: 'PlanManagement',
      color: Colors.secondary,
      badge: '5 Activos',
    },
    {
      id: '3',
      title: 'Lista de Compras',
      description: 'Organiza tu compra semanal',
      icon: 'cart',
      gradient: Colors.accentGradient,
      route: 'ShoppingList',
      color: Colors.accent,
      badge: '12 Items',
    },
    {
      id: '4',
      title: 'Mi Perfil',
      description: 'Gestiona tus preferencias',
      icon: 'person',
      gradient: ['#8B5CF6', '#6366F1', '#3B82F6'] as const,
      route: 'Profile',
      color: Colors.blue.sky,
      badge: 'Premium',
    },

  ];

  const handleActionPress = (action: typeof quickActions[0]) => {
    navigation.navigate(action.route);
  };

  const renderQuickAction = (action: typeof quickActions[0]) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionCard}
      activeOpacity={0.9}
      onPress={() => handleActionPress(action)}
    >
      <LinearGradient
        colors={action.gradient}
        style={styles.actionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.actionContent}>
          <View style={styles.actionLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name={action.icon as any} size={28} color="#ffffff" />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>
          </View>
          
          <View style={styles.actionRight}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{action.badge}</Text>
            </View>
            <View style={styles.actionArrow}>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );



  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <LinearGradient
        colors={Colors.premiumGradient}
        style={styles.welcomeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeIconContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.welcomeIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="restaurant" size={32} color="#ffffff" />
              </LinearGradient>
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>¡Bienvenido a TastyPath!</Text>
              <Text style={styles.welcomeSubtitle}>
                Tu compañero perfecto para una nutrición saludable y equilibrada
              </Text>
            </View>
          </View>
          
          <View style={styles.welcomeFeatures}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              </View>
              <Text style={styles.featureText}>Planes personalizados</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              </View>
              <Text style={styles.featureText}>Recetas nutritivas</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              </View>
              <Text style={styles.featureText}>Lista de compras inteligente</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderNutritionTips = () => (
    <View style={styles.tipsSection}>
      <View style={styles.tipsHeader}>
        <Ionicons name="bulb" size={24} color={Colors.primary} />
        <Text style={styles.tipsTitle}>Consejos de Nutrición</Text>
      </View>
      
      <View style={styles.tipsGrid}>
        {nutritionTips.map((tip, index) => (
          <View key={tip.id} style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: tip.color + '20' }]}>
              <Ionicons name={tip.icon as any} size={20} color={tip.color} />
            </View>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header premium con gradiente */}
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('PlanGenerator')}>
            <Ionicons name="restaurant" size={32} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TastyPath</Text>
          <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de bienvenida premium */}
        {renderWelcomeSection()}



        {/* Funciones principales */}
        <View style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Funciones Principales</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Accede a todas las herramientas de TastyPath
          </Text>
          
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Consejos de nutrición */}
        {renderNutritionTips()}

        {/* Información adicional premium */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['rgba(46, 139, 87, 0.1)', 'rgba(74, 144, 226, 0.1)']}
              style={styles.infoGradient}
            >
              <View style={styles.infoHeader}>
                <Ionicons name="star" size={24} color={Colors.primary} />
                <Text style={styles.infoTitle}>Consejo del Día</Text>
              </View>
              <Text style={styles.infoText}>
                {tipOfTheDay ? `"${tipOfTheDay.text}"` : "Cargando consejo del día..."}
              </Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.premiumButton} onPress={() => navigation.navigate('Subscription')}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.premiumGradient}>
          <Ionicons name="star" size={28} color="#ffffff" />
          <Text style={styles.premiumText}>¡Hazte Premium!</Text>
          <Ionicons name="restaurant" size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    ...Shadows.large,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    fontSize: 26,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl + 40,
  },
  welcomeSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.large,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  welcomeGradient: {
    padding: Spacing.xl,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  welcomeIcon: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    textAlign: 'left',
    fontSize: 24,
  },
  welcomeSubtitle: {
    ...Typography.bodySmall,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 22,
    textAlign: 'left',
    fontSize: 15,
  },
  welcomeFeatures: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    marginRight: Spacing.md,
  },
  featureText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 15,
  },












  actionsSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginLeft: Spacing.sm,
    fontSize: 22,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
    fontSize: 15,
  },
  actionsGrid: {
    gap: Spacing.md,
  },
  actionCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  actionGradient: {
    padding: Spacing.lg,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionRight: {
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    fontSize: 18,
  },
  actionDescription: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 20,
    fontSize: 13,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  actionArrow: {
    opacity: 0.8,
  },
  tipsSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginLeft: Spacing.sm,
    fontSize: 20,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  tipCard: {
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.glass,
    minHeight: 80,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  tipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
    fontSize: 12,
  },
  
  infoSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  infoGradient: {
    padding: Spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginLeft: Spacing.sm,
    fontSize: 18,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '500',
    fontSize: 15,
  },
  premiumButton: {
    position: 'absolute',
    bottom: 20,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.large,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  premiumText: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  headerIcon: {
    position: 'absolute',
    left: Spacing.md,
    top: Spacing.md,
  },
  profileIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
  },
});

export default HomeScreen;
