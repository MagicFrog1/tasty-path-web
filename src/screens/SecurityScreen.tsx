// @ts-nocheck
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

interface SecurityScreenProps {
  navigation: {
    goBack: () => void;
  };
}

const SecurityScreen: React.FC<SecurityScreenProps> = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Política de Seguridad</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introducción atractiva */}
        <View style={styles.introCard}>
          <Ionicons name="lock-closed" size={32} color={Colors.purple.main} />
          <Text style={styles.introTitle}>Política de Seguridad</Text>
          <Text style={styles.introText}>
            La seguridad de tus datos es fundamental para nosotros. Aquí detallamos las medidas que implementamos para proteger tu información.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>1. Medidas de Seguridad Técnicas</Text>
          </View>
          <Text style={styles.text}>
            Implementamos múltiples capas de seguridad para proteger tu información:
          </Text>
          <Text style={styles.bulletPoint}>• Encriptación de datos en tránsito (TLS/SSL)</Text>
          <Text style={styles.bulletPoint}>• Encriptación de datos en reposo</Text>
          <Text style={styles.bulletPoint}>• Autenticación segura con tokens</Text>
          <Text style={styles.bulletPoint}>• Protección contra ataques de fuerza bruta</Text>
          <Text style={styles.bulletPoint}>• Firewalls y sistemas de detección de intrusiones</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>2. Seguridad de Infraestructura</Text>
          </View>
          <Text style={styles.text}>
            Nuestra infraestructura está diseñada con seguridad en mente:
          </Text>
          <Text style={styles.bulletPoint}>• Servidores ubicados en la Unión Europea</Text>
          <Text style={styles.bulletPoint}>• Cumplimiento con GDPR y normativas europeas</Text>
          <Text style={styles.bulletPoint}>• Copias de seguridad regulares y automatizadas</Text>
          <Text style={styles.bulletPoint}>• Monitoreo continuo de seguridad 24/7</Text>
          <Text style={styles.bulletPoint}>• Actualizaciones de seguridad regulares</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>3. Protección de Contraseñas</Text>
          </View>
          <Text style={styles.text}>
            Tus credenciales están protegidas mediante:
          </Text>
          <Text style={styles.bulletPoint}>• Almacenamiento seguro con hash bcrypt</Text>
          <Text style={styles.bulletPoint}>• Requisitos de contraseña segura</Text>
          <Text style={styles.bulletPoint}>• Protección contra ataques de diccionario</Text>
          <Text style={styles.bulletPoint}>• Opción de autenticación de dos factores (2FA)</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>4. Control de Acceso</Text>
          </View>
          <Text style={styles.text}>
            Implementamos controles estrictos de acceso:
          </Text>
          <Text style={styles.bulletPoint}>• Principio de menor privilegio</Text>
          <Text style={styles.bulletPoint}>• Acceso basado en roles</Text>
          <Text style={styles.bulletPoint}>• Registro de auditoría de accesos</Text>
          <Text style={styles.bulletPoint}>• Sesiones con expiración automática</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>5. Protección de Datos Personales</Text>
          </View>
          <Text style={styles.text}>
            Especialmente protegemos tu información sensible:
          </Text>
          <Text style={styles.bulletPoint}>• Datos de salud encriptados de forma adicional</Text>
          <Text style={styles.bulletPoint}>• Separación lógica de datos por usuario</Text>
          <Text style={styles.bulletPoint}>• Anonimización de datos para análisis</Text>
          <Text style={styles.bulletPoint}>• Derecho al olvido implementado</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bug" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>6. Gestión de Vulnerabilidades</Text>
          </View>
          <Text style={styles.text}>
            Mantenemos un programa activo de seguridad:
          </Text>
          <Text style={styles.bulletPoint}>• Escaneo regular de vulnerabilidades</Text>
          <Text style={styles.bulletPoint}>• Programa de recompensas por bugs</Text>
          <Text style={styles.bulletPoint}>• Parches de seguridad inmediatos</Text>
          <Text style={styles.bulletPoint}>• Pruebas de penetración periódicas</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>7. Notificaciones de Seguridad</Text>
          </View>
          <Text style={styles.text}>
            Te mantendremos informado sobre:
          </Text>
          <Text style={styles.bulletPoint}>• Inicios de sesión desde nuevos dispositivos</Text>
          <Text style={styles.bulletPoint}>• Cambios en tu cuenta o configuración</Text>
          <Text style={styles.bulletPoint}>• Actividad sospechosa detectada</Text>
          <Text style={styles.bulletPoint}>• Actualizaciones importantes de seguridad</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hand-left" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>8. Tu Responsabilidad</Text>
          </View>
          <Text style={styles.text}>
            También puedes ayudar a mantener tu cuenta segura:
          </Text>
          <Text style={styles.bulletPoint}>• Usa contraseñas únicas y seguras</Text>
          <Text style={styles.bulletPoint}>• No compartas tus credenciales</Text>
          <Text style={styles.bulletPoint}>• Cierra sesión en dispositivos compartidos</Text>
          <Text style={styles.bulletPoint}>• Reporta actividad sospechosa inmediatamente</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Incidentes de Seguridad</Text>
          <Text style={styles.text}>
            En caso de detectar una brecha de seguridad, te notificaremos de inmediato y tomaremos todas las medidas necesarias para mitigar el impacto y prevenir futuros incidentes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contacto</Text>
          <Text style={styles.text}>
            Si tienes preguntas sobre seguridad o detectas algún problema, contáctanos en:
          </Text>
          <Text style={styles.contactInfo}>Email: tastypathhelp@gmail.com</Text>
          <Text style={styles.contactInfo}>Asunto: [SEGURIDAD] - Descripción del problema</Text>
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

export default SecurityScreen;



