import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { supabase } from '../services/supabase';
import { DatabaseService } from '../services/databaseService';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';

interface LoginScreenProps {
  navigation: any;
  onLogin: (userData: UserData) => void;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
  isNewUser?: boolean;
  hasSelectedPlan?: boolean;
  hasUsedFreePlan?: boolean;
}

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const logoScale = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (isLoading) return;

    // Validaciones básicas
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login con Supabase
        console.log('Intentando iniciar sesión con email:', email.toLowerCase());
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });
        if (error || !data.user) {
          console.error('Error en signIn:', error);
          throw error || new Error('No se pudo iniciar sesión');
        }

        console.log('Login exitoso, obteniendo perfil...');
        // Obtener/crear perfil
        const profile = await DatabaseService.getUserProfile(email.toLowerCase());
        console.log('Perfil obtenido:', profile);
        const resolvedName = profile?.name || name.trim() || data.user.email?.split('@')[0] || 'Usuario';

        const userData: UserData = {
          id: data.user.id,
          email: email.toLowerCase(),
          name: resolvedName,
          isLoggedIn: true,
          isNewUser: false,
          hasSelectedPlan: !!profile, // si ya hay perfil asumimos que seleccionó plan alguna vez
          hasUsedFreePlan: false,
        };
        onLogin(userData);
        Alert.alert('¡Éxito!', 'Has iniciado sesión correctamente', [{ text: 'Continuar' }]);
      } else {
        // Registro con Supabase
        console.log('Intentando crear cuenta con email:', email.toLowerCase());
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: { emailRedirectTo: undefined },
        });
        if (error || !data.user) {
          console.error('Error en signUp:', error);
          throw error || new Error('No se pudo crear la cuenta');
        }

        console.log('Usuario creado exitosamente, creando perfil...');
        // Crear perfil básico
        const profileResult = await DatabaseService.createUserProfile({
          id: data.user.id,
          email: email.toLowerCase(),
          name: name.trim() || data.user.email?.split('@')[0] || 'Usuario',
          avatar: '',
          weight: 70,
          height: 170,
          age: 30,
          gender: 'male',
          activity_level: 'moderate',
        });
        
        if (!profileResult) {
          console.error('Error: No se pudo crear el perfil en la base de datos');
          throw new Error('No se pudo crear el perfil de usuario');
        }
        console.log('Perfil creado exitosamente:', profileResult);

        const userData: UserData = {
          id: data.user.id,
          email: email.toLowerCase(),
          name: name.trim() || 'Usuario',
          isLoggedIn: true,
          isNewUser: true,
          hasSelectedPlan: false,
          hasUsedFreePlan: false,
        };
        onLogin(userData);
        Alert.alert('¡Éxito!', 'Tu cuenta ha sido creada exitosamente', [{ text: 'Continuar' }]);
      }
    } catch (error) {
      console.error('Error detallado en login/registro:', error);
      const errorMessage = (error as any)?.message || (error as any)?.toString() || 'Error desconocido';
      Alert.alert('Error', `Ha ocurrido un error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Elementos decorativos de fondo */}
        <View style={styles.backgroundElements}>
          <View style={[styles.floatingCircle, styles.circle1]} />
          <View style={[styles.floatingCircle, styles.circle2]} />
          <View style={[styles.floatingCircle, styles.circle3]} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={{ zIndex: 5 }}
        >
          {/* Header con logo animado */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: logoScale }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.logoGradient}
              >
                <Ionicons name="restaurant" size={50} color="#667eea" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>TastyPath</Text>
            <Text style={styles.appTagline}>
              Tu planificador de comidas inteligente
            </Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>✨ Nutrición Inteligente</Text>
            </View>
          </Animated.View>

          {/* Formulario */}
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {isLogin ? '¡Bienvenido de vuelta!' : '¡Únete a TastyPath!'}
              </Text>
              <Text style={styles.formSubtitle}>
                {isLogin 
                  ? 'Accede a tu cuenta para continuar tu viaje nutricional' 
                  : 'Comienza tu transformación nutricional hoy mismo'
                }
              </Text>
            </View>

            {/* Campo de nombre (solo para registro) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="person" size={22} color="#667eea" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tu nombre completo"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Campo de email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="mail" size={22} color="#667eea" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Correo electrónico"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Campo de contraseña */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed" size={22} color="#667eea" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={isLogin ? "Contraseña" : "Contraseña (mínimo 6 caracteres)"}
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={22} 
                  color="#9ca3af" 
                />
              </TouchableOpacity>
            </View>
            {!isLogin && password.length > 0 && password.length < 6 && (
              <Text style={styles.passwordHint}>
                ⚠️ La contraseña debe tener al menos 6 caracteres
              </Text>
            )}

            {/* Campo de confirmar contraseña (solo para registro) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="lock-closed" size={22} color="#667eea" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={22} 
                    color="#9ca3af" 
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Botón de envío */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.submitButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.spinner, { transform: [{ rotate: '360deg' }] }]}>
                      <Ionicons name="reload" size={20} color="#ffffff" />
                    </Animated.View>
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Iniciando...' : 'Creando...'}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Ionicons 
                      name={isLogin ? "log-in" : "person-add"} 
                      size={22} 
                      color="#ffffff" 
                    />
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Cambiar modo */}
            <TouchableOpacity style={styles.toggleModeButton} onPress={toggleMode}>
              <Text style={styles.toggleModeText}>
                {isLogin 
                  ? '¿No tienes cuenta? Regístrate aquí' 
                  : '¿Ya tienes cuenta? Inicia sesión aquí'
                }
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Información adicional */}
          <Animated.View 
            style={[
              styles.infoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.infoTitle}>¿Por qué registrarte?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
                <Text style={styles.benefitText}>Guarda tus planes semanales</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
                <Text style={styles.benefitText}>Lista de compras personalizada</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
                <Text style={styles.benefitText}>Sincronización entre dispositivos</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
                <Text style={styles.benefitText}>Recomendaciones personalizadas</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.05,
    zIndex: 0,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    top: '5%',
    right: '-15%',
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#ffffff',
    top: '70%',
    left: '-10%',
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#ffffff',
    top: '85%',
    right: '15%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
    zIndex: 5,
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
    ...Shadows.large,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
    elevation: 10,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 15,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: Spacing.md,
    fontWeight: '500',
  },
  passwordToggle: {
    padding: Spacing.xs,
  },
  passwordHint: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spinner: {
    transform: [{ rotate: '360deg' }],
  },
  submitButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  toggleModeButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  toggleModeText: {
    fontSize: 16,
    color: '#667eea',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  infoContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: '#ffffff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoTitle: {
    fontSize: 20,
    color: '#1f2937',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  benefitsList: {
    gap: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontWeight: '500',
  },
});

export default LoginScreen;
