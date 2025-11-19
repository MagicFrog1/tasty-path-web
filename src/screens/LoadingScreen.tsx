import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { getRandomTips } from '../constants/nutritionTips';
import { getRandomPromotionalPhrase } from '../constants/promotionalPhrases';

const { width } = Dimensions.get('window');

interface LoadingScreenProps {
  onFinish: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [promotionalPhrase] = useState(getRandomPromotionalPhrase());
  const [tips] = useState(getRandomTips(3));

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const pulseAnim = useState(new Animated.Value(1))[0]; // Cambio de rotateAnim a pulseAnim
  const slideAnim = useState(new Animated.Value(50))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  const tipFadeAnim = useState(new Animated.Value(1))[0];
  const floatingAnim = useState(new Animated.Value(0))[0]; // Nueva animación para elementos flotantes

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de pulso suave en lugar de rotación
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación flotante para elementos decorativos
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: false,
    }).start();

    const tipInterval = setInterval(() => {
      Animated.timing(tipFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        Animated.timing(tipFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    const finishTimeout = setTimeout(() => {
      onFinish();
    }, 8000);

    return () => {
      clearInterval(tipInterval);
      clearTimeout(finishTimeout);
    };
  }, [onFinish, tips.length]);

  const floatingInterpolate = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const currentTip = tips[currentTipIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Animated.View 
          style={[
            styles.floatingCircle, 
            styles.circle1,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: floatingInterpolate }
              ]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.floatingCircle, 
            styles.circle2,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: floatingInterpolate.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8]
                }) }
              ]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.floatingCircle, 
            styles.circle3,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: floatingInterpolate.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 6]
                }) }
              ]
            }
          ]} 
        />

        <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#ffffff', '#f8fafc', '#e2e8f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <View style={styles.logoInner}>
              <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoIconBackground}
              >
                <Ionicons name="restaurant" size={35} color="#ffffff" />
                <View style={styles.logoGlow} />
              </LinearGradient>
            </View>
          </LinearGradient>
        </Animated.View>

          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.appName}>TastyPath</Text>
            <Text style={styles.appTagline}>Preparando tu experiencia nutricional</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.promotionalContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promotionalCard}
            >
              <View style={styles.promotionalContent}>
                <View style={[styles.promotionalIcon, { backgroundColor: promotionalPhrase.colors[0] }]}>
                  <Ionicons name={promotionalPhrase.icon as any} size={24} color="#ffffff" />
                </View>
                <Text style={styles.promotionalText}>{promotionalPhrase.phrase}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.tipContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.tipCard,
                {
                  opacity: tipFadeAnim,
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipCardGradient}
              >
                <View style={styles.tipHeader}>
                  <View style={[styles.tipIcon, { backgroundColor: currentTip.color }]}>
                    <Ionicons name={currentTip.icon as any} size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.tipTitle}>Consejo de Nutrición</Text>
                </View>
                <Text style={styles.tipText}>{currentTip.text}</Text>
              </LinearGradient>
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={[
              styles.progressContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { width: progressWidth }
                  ]} 
                />
              </View>
              <View style={styles.progressDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotActive]} />
              </View>
            </View>
            <Text style={styles.progressText}>Preparando tu experiencia nutricional...</Text>
          </Animated.View>

        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.12,
  },
  circle1: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: '5%',
    right: '-10%',
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    top: '50%',
    left: '-5%',
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: '70%',
    right: '10%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoInner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoIconBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    zIndex: -1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  appTagline: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
  },
  promotionalContainer: {
    width: '100%',
    marginBottom: 30,
  },
  promotionalCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  promotionalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promotionalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  promotionalText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  tipContainer: {
    width: '100%',
    marginBottom: 40,
  },
  tipCard: {
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  tipCardGradient: {
    padding: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '600',
  },
});

export default LoadingScreen;
