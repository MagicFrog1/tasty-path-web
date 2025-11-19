import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';

interface LegalInfoScreenProps {
  navigation: any;
}

const LegalInfoScreen: React.FC<LegalInfoScreenProps> = ({ navigation }) => {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error al abrir el enlace:', err));
  };

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
        <Text style={styles.headerTitle}>Información Legal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introducción atractiva */}
        <View style={styles.introCard}>
          <Ionicons name="business" size={32} color={Colors.purple.main} />
          <Text style={styles.introTitle}>Información Legal</Text>
          <Text style={styles.introText}>
            Información legal completa sobre TastyPath, cumplimiento normativo y derechos de propiedad intelectual.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>Información de la Empresa</Text>
          </View>
          <Text style={styles.text}>
            TastyPath es una aplicación desarrollada y operada por TastyPath Technologies S.L., una empresa registrada en España.
          </Text>
          <Text style={styles.subtitle}>Datos de la empresa:</Text>
          <Text style={styles.bulletPoint}>• Razón social: TastyPath Technologies S.L.</Text>
          <Text style={styles.bulletPoint}>• NIF/CIF: B12345678</Text>
          <Text style={styles.bulletPoint}>• Domicilio: Calle Principal 123, 28001 Madrid, España</Text>
          <Text style={styles.bulletPoint}>• Registro Mercantil: Madrid, Tomo 12345, Folio 123</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulaciones Aplicables</Text>
          <Text style={styles.text}>
            Nuestra aplicación cumple con las siguientes regulaciones y estándares:
          </Text>
          <Text style={styles.bulletPoint}>• Reglamento General de Protección de Datos (RGPD)</Text>
          <Text style={styles.bulletPoint}>• Ley Orgánica de Protección de Datos Personales (LOPD)</Text>
          <Text style={styles.bulletPoint}>• Directiva de Servicios Digitales (DSA)</Text>
          <Text style={styles.bulletPoint}>• Estándares de seguridad ISO 27001</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propiedad Intelectual</Text>
          <Text style={styles.text}>
            Todos los derechos de propiedad intelectual relacionados con TastyPath, incluyendo pero no limitado a:
          </Text>
          <Text style={styles.bulletPoint}>• Código fuente de la aplicación</Text>
          <Text style={styles.bulletPoint}>• Diseño de la interfaz de usuario</Text>
          <Text style={styles.bulletPoint}>• Logotipos y marcas comerciales</Text>
          <Text style={styles.bulletPoint}>• Contenido y recetas</Text>
          <Text style={styles.text}>
            Son propiedad exclusiva de TastyPath Technologies S.L. o de nuestros licenciantes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Licencia de Uso</Text>
          <Text style={styles.text}>
            Te otorgamos una licencia limitada, no exclusiva, no transferible y revocable para usar la aplicación TastyPath en dispositivos móviles personales, sujeto a estos términos y condiciones.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitaciones de Responsabilidad</Text>
          <Text style={styles.text}>
            En ningún caso TastyPath Technologies S.L. será responsable por:
          </Text>
          <Text style={styles.bulletPoint}>• Daños indirectos, incidentales o consecuentes</Text>
          <Text style={styles.bulletPoint}>• Pérdida de datos o información</Text>
          <Text style={styles.bulletPoint}>• Interrupciones del servicio</Text>
          <Text style={styles.bulletPoint}>• Resultados de salud derivados del uso de la app</Text>
          <Text style={styles.text}>
            La responsabilidad total está limitada al monto pagado por el usuario en los últimos 12 meses.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolución de Disputas</Text>
          <Text style={styles.text}>
            Cualquier disputa relacionada con estos términos o el uso de la aplicación se resolverá mediante:
          </Text>
          <Text style={styles.bulletPoint}>• Negociación directa entre las partes</Text>
          <Text style={styles.bulletPoint}>• Mediación obligatoria</Text>
          <Text style={styles.bulletPoint}>• Arbitraje en Madrid, España</Text>
          <Text style={styles.text}>
            Las leyes españolas serán aplicables a cualquier disputa.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cumplimiento Legal</Text>
          <Text style={styles.text}>
            Nos comprometemos a cumplir con todas las leyes y regulaciones aplicables, incluyendo:
          </Text>
          <Text style={styles.bulletPoint}>• Leyes de protección al consumidor</Text>
          <Text style={styles.bulletPoint}>• Regulaciones de salud y nutrición</Text>
          <Text style={styles.bulletPoint}>• Leyes de comercio electrónico</Text>
          <Text style={styles.bulletPoint}>• Estándares de accesibilidad</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <Text style={styles.text}>
            Para cualquier consulta (legal, privacidad o soporte), contáctanos en:
          </Text>
          <Text style={styles.contactInfo}>Email: tastypathhelp@gmail.com</Text>
          <Text style={styles.contactInfo}>Dirección: Calle Principal 123, 28001 Madrid</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enlaces Útiles</Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => openLink('https://www.aepd.es')}
          >
            <Ionicons name="link" size={20} color={Colors.purple.main} />
            <Text style={styles.linkText}>Agencia Española de Protección de Datos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => openLink('https://www.consumo.gob.es')}
          >
            <Ionicons name="link" size={20} color={Colors.purple.main} />
            <Text style={styles.linkText}>Ministerio de Consumo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => openLink('https://www.boe.es')}
          >
            <Ionicons name="link" size={20} color={Colors.purple.main} />
            <Text style={styles.linkText}>Boletín Oficial del Estado</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última actualización: Diciembre 2024
          </Text>
          <Text style={styles.footerText}>
            Versión legal: v2.1
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
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.purple.light,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.purple.soft,
  },
  linkText: {
    ...Typography.body,
    color: Colors.purple.main,
    marginLeft: Spacing.sm,
    textDecorationLine: 'underline',
    fontWeight: '600',
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
    marginBottom: Spacing.xs,
  },
});

export default LegalInfoScreen;
