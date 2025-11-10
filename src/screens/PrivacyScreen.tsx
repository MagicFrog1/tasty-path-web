import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';

interface PrivacyScreenProps {
  navigation: any;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidad</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introducción atractiva */}
        <View style={styles.introCard}>
          <Ionicons name="shield-checkmark" size={32} color={Colors.purple.main} />
          <Text style={styles.introTitle}>Política de Privacidad</Text>
          <Text style={styles.introText}>
            Tu privacidad es nuestra prioridad. Aquí explicamos cómo recopilamos, usamos y protegemos tu información personal.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
          </View>
          <Text style={styles.text}>
            Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta, completas tu perfil nutricional, o nos contactas para soporte.
          </Text>
          <Text style={styles.subtitle}>Información personal:</Text>
          <Text style={styles.bulletPoint}>• Nombre y apellidos</Text>
          <Text style={styles.bulletPoint}>• Dirección de correo electrónico</Text>
          <Text style={styles.bulletPoint}>• Información nutricional y de salud</Text>
          <Text style={styles.bulletPoint}>• Preferencias alimentarias</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>2. Cómo Utilizamos tu Información</Text>
          </View>
          <Text style={styles.text}>
            Utilizamos la información recopilada para:
          </Text>
          <Text style={styles.bulletPoint}>• Proporcionar y mejorar nuestros servicios</Text>
          <Text style={styles.bulletPoint}>• Generar planes de comidas personalizados</Text>
          <Text style={styles.bulletPoint}>• Enviar notificaciones relevantes</Text>
          <Text style={styles.bulletPoint}>• Responder a tus consultas y solicitudes</Text>
          <Text style={styles.bulletPoint}>• Analizar el uso de la aplicación</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Compartir Información</Text>
          <Text style={styles.text}>
            No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes circunstancias:
          </Text>
          <Text style={styles.bulletPoint}>• Con tu consentimiento explícito</Text>
          <Text style={styles.bulletPoint}>• Para cumplir con obligaciones legales</Text>
          <Text style={styles.bulletPoint}>• Con proveedores de servicios que nos ayudan a operar la aplicación</Text>
          <Text style={styles.bulletPoint}>• Para proteger nuestros derechos y seguridad</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>4. Seguridad de Datos</Text>
          </View>
          <Text style={styles.text}>
            Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Almacenamiento de Datos</Text>
          <Text style={styles.text}>
            Tu información se almacena en servidores seguros ubicados en la Unión Europea. Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Tus Derechos</Text>
          <Text style={styles.text}>
            Tienes derecho a:
          </Text>
          <Text style={styles.bulletPoint}>• Acceder a tu información personal</Text>
          <Text style={styles.bulletPoint}>• Corregir información inexacta</Text>
          <Text style={styles.bulletPoint}>• Solicitar la eliminación de tus datos</Text>
          <Text style={styles.bulletPoint}>• Oponerte al procesamiento de tus datos</Text>
          <Text style={styles.bulletPoint}>• Portabilidad de tus datos</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Cookies y Tecnologías Similares</Text>
          <Text style={styles.text}>
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia en la aplicación, recordar tus preferencias y analizar el tráfico del sitio.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Menores de Edad</Text>
          <Text style={styles.text}>
            Nuestros servicios no están dirigidos a menores de 16 años. Si eres menor de 16 años, no debes proporcionarnos información personal sin el consentimiento de tus padres o tutores.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Cambios en la Política</Text>
          <Text style={styles.text}>
            Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos cualquier cambio significativo a través de la aplicación o por correo electrónico.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contacto</Text>
          <Text style={styles.text}>
            Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información, contáctanos en:
          </Text>
          <Text style={styles.contactInfo}>Email: tastypathhelp@gmail.com</Text>
          <Text style={styles.contactInfo}>Dirección: Calle Principal 123, Madrid, España</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última actualización: Diciembre 2024
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.medical.background,
  },
  header: {
    backgroundColor: Colors.purple.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...Shadows.medium,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  
  introCard: {
    backgroundColor: Colors.medical.cardBg,
    padding: Spacing.lg,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.purple.light,
    ...Shadows.small,
  },
  
  introTitle: {
    ...Typography.h3,
    color: Colors.purple.dark,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  
  introText: {
    ...Typography.body,
    color: Colors.medical.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  section: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.medical.cardBg,
    padding: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.purple.light,
    ...Shadows.small,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.purple.dark,
    marginLeft: Spacing.sm,
    flex: 1,
    fontWeight: '700',
    fontSize: 18,
  },
  text: {
    ...Typography.body,
    color: Colors.medical.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.purple.main,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    fontSize: 16,
  },
  bulletPoint: {
    ...Typography.body,
    color: Colors.medical.textSecondary,
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: 15,
    lineHeight: 22,
  },
  contactInfo: {
    ...Typography.body,
    color: Colors.purple.main,
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.purple.light,
    borderRadius: 15,
    marginHorizontal: Spacing.xs,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.purple.royal,
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PrivacyScreen;
