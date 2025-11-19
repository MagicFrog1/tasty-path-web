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

interface TermsScreenProps {
  navigation: any;
}

const TermsScreen: React.FC<TermsScreenProps> = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Términos de Servicio</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introducción atractiva */}
        <View style={styles.introCard}>
          <Ionicons name="document-text" size={32} color={Colors.purple.main} />
          <Text style={styles.introTitle}>Términos de Servicio</Text>
          <Text style={styles.introText}>
            Estos términos definen las reglas para el uso de TastyPath. Al usar nuestra aplicación, aceptas estos términos.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>1. Aceptación de los Términos</Text>
          </View>
          <Text style={styles.text}>
            Al acceder y utilizar la aplicación TastyPath, aceptas estar sujeto a estos términos y condiciones de servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar la aplicación.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>2. Descripción del Servicio</Text>
          </View>
          <Text style={styles.text}>
            TastyPath es una aplicación móvil que proporciona servicios de planificación nutricional, generación de planes de comidas, recetas y seguimiento de la dieta. La aplicación está diseñada para ayudar a los usuarios a mantener un estilo de vida saludable.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Uso Aceptable</Text>
          <Text style={styles.text}>
            Te comprometes a utilizar la aplicación únicamente para fines legales y de acuerdo con estos términos. No debes:
          </Text>
          <Text style={styles.bulletPoint}>• Usar la aplicación para actividades ilegales</Text>
          <Text style={styles.bulletPoint}>• Intentar acceder a cuentas de otros usuarios</Text>
          <Text style={styles.bulletPoint}>• Interferir con el funcionamiento de la aplicación</Text>
          <Text style={styles.bulletPoint}>• Distribuir malware o código dañino</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Cuenta de Usuario</Text>
          <Text style={styles.text}>
            Para acceder a ciertas funcionalidades, debes crear una cuenta. Eres responsable de mantener la confidencialidad de tu información de inicio de sesión y de todas las actividades que ocurran bajo tu cuenta.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Privacidad</Text>
          <Text style={styles.text}>
            Tu privacidad es importante para nosotros. El uso de la aplicación está sujeto a nuestra Política de Privacidad, que se incorpora a estos términos por referencia.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={Colors.purple.main} />
            <Text style={styles.sectionTitle}>6. Suscripciones Auto-Renovables</Text>
          </View>
          <Text style={styles.text}>
            TastyPath ofrece tres planes de suscripción premium con renovación automática:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Plan Semanal:</Text> €4,99 por 1 semana</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Plan Mensual:</Text> €7,99 por 1 mes</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Plan Anual:</Text> €79,99 por 1 año</Text>
          
          <Text style={styles.text}>
            <Text style={styles.bold}>Renovación Automática:</Text> Las suscripciones se renuevan automáticamente al final de cada período de facturación a menos que se cancelen al menos 24 horas antes del vencimiento.
          </Text>
          
          <Text style={styles.text}>
            <Text style={styles.bold}>Gestión de Suscripción:</Text> Puedes ver, cambiar o cancelar tu suscripción en cualquier momento accediendo a la configuración de tu cuenta de Apple ID en tu dispositivo.
          </Text>
          
          <Text style={styles.text}>
            <Text style={styles.bold}>Política de Reembolso:</Text> Los pagos se cargan a tu cuenta de Apple ID tras la confirmación de compra. No se ofrecen reembolsos para el período de suscripción actual.
          </Text>
          
          <Text style={styles.text}>
            <Text style={styles.bold}>Cambios de Precio:</Text> Los precios pueden variar según la región y están sujetos a cambios. Te notificaremos cualquier cambio de precio con al menos 30 días de antelación.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Limitación de Responsabilidad</Text>
          <Text style={styles.text}>
            TastyPath se proporciona "tal como está" sin garantías de ningún tipo. No somos responsables de los resultados de salud derivados del uso de la aplicación. Siempre consulta con profesionales de la salud para asesoramiento médico.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Modificaciones</Text>
          <Text style={styles.text}>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la aplicación. El uso continuado constituye aceptación de los nuevos términos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contacto</Text>
          <Text style={styles.text}>
            Si tienes preguntas sobre estos términos, contáctanos en: tastypathhelp@gmail.com
          </Text>
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
  bulletPoint: {
    ...Typography.body,
    color: Colors.medical.textSecondary,
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: 15,
    lineHeight: 22,
  },
  
  bold: {
    fontWeight: '700',
    color: Colors.purple.main,
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

export default TermsScreen;
