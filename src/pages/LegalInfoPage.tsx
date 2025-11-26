import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const PageWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h1`
  margin-top: 0;
  color: ${theme.colors.textPrimary};
  font-size: 2.5rem;
  margin-bottom: 24px;
`;

const IntroCard = styled.div`
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1), rgba(99, 102, 241, 0.1));
  padding: 32px;
  border-radius: 20px;
  margin-bottom: 32px;
  border: 1px solid rgba(46, 139, 87, 0.2);
  text-align: center;
`;

const IntroTitle = styled.h2`
  color: ${theme.colors.primary};
  margin-bottom: 16px;
  font-size: 1.8rem;
`;

const IntroText = styled.p`
  color: ${theme.colors.textSecondary};
  line-height: 1.7;
  font-size: 16px;
`;

const Section = styled.div`
  background: ${theme.colors.white};
  padding: 28px;
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(46, 139, 87, 0.15);
  box-shadow: ${theme.shadows.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  color: ${theme.colors.textPrimary};
  font-size: 1.4rem;
  margin: 0;
  font-weight: 700;
`;

const Text = styled.p`
  color: ${theme.colors.textSecondary};
  line-height: 1.8;
  margin-bottom: 12px;
  font-size: 16px;
`;

const BulletPoint = styled.li`
  color: ${theme.colors.textSecondary};
  margin-left: 24px;
  margin-bottom: 8px;
  line-height: 1.7;
  font-size: 15px;
`;

const BulletList = styled.ul`
  margin: 12px 0;
  padding-left: 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.primary};
  font-weight: 700;
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 16px;
`;

const ContactInfo = styled.p`
  color: ${theme.colors.primary};
  margin-left: 24px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 15px;
`;

const Footer = styled.div`
  background: rgba(46, 139, 87, 0.1);
  padding: 24px;
  border-radius: 15px;
  margin-top: 32px;
  text-align: center;
`;

const FooterText = styled.p`
  color: ${theme.colors.primary};
  font-style: italic;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

const TermsPage: React.FC = () => {
  return (
    <PageWrapper>
      <Title>Términos y Condiciones de Uso</Title>
      <IntroCard>
        <IntroTitle>Términos y Condiciones</IntroTitle>
        <IntroText>
          Estos términos y condiciones regulan el uso de la plataforma TastyPath. Al acceder y utilizar nuestros servicios, aceptas estar sujeto a estos términos.
        </IntroText>
      </IntroCard>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>1. Aceptación de los Términos</SectionTitle>
        </SectionHeader>
        <Text>
          Al acceder y utilizar TastyPath, aceptas cumplir con estos Términos y Condiciones de Uso. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
        </Text>
        <Text>
          Estos términos constituyen un acuerdo legalmente vinculante entre tú y TastyPath. Te recomendamos leerlos cuidadosamente antes de utilizar la plataforma.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>2. Definiciones y Descripción del Servicio</SectionTitle>
        </SectionHeader>
        <Subtitle>2.1. Definiciones</Subtitle>
        <BulletList>
          <BulletPoint><strong>"TastyPath"</strong> se refiere a la plataforma digital de nutrición personalizada operada por nosotros.</BulletPoint>
          <BulletPoint><strong>"Usuario"</strong> es cualquier persona que accede o utiliza nuestros servicios.</BulletPoint>
          <BulletPoint><strong>"Servicios"</strong> incluyen todas las funcionalidades ofrecidas a través de la plataforma TastyPath.</BulletPoint>
          <BulletPoint><strong>"Contenido"</strong> se refiere a toda la información, datos, textos, gráficos, imágenes y otros materiales disponibles en la plataforma.</BulletPoint>
        </BulletList>
        <Subtitle>2.2. Descripción del Servicio</Subtitle>
        <Text>
          TastyPath es una plataforma digital que utiliza inteligencia artificial para generar planes de alimentación personalizados, listas de compras y recomendaciones nutricionales basadas en tus preferencias, objetivos de salud y restricciones alimentarias.
        </Text>
        <Text>
          Nuestros servicios incluyen, pero no se limitan a: generación de planes de comidas semanales, creación de listas de compras, almacenamiento de planes guardados, y acceso a información nutricional y médica validada.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>3. Registro y Cuenta de Usuario</SectionTitle>
        </SectionHeader>
        <Subtitle>3.1. Requisitos de Registro</Subtitle>
        <Text>
          Para utilizar ciertas funcionalidades de TastyPath, debes crear una cuenta proporcionando información precisa, actual y completa. Debes ser mayor de 16 años o contar con el consentimiento de tus padres o tutores legales.
        </Text>
        <Subtitle>3.2. Responsabilidad de la Cuenta</Subtitle>
        <BulletList>
          <BulletPoint>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</BulletPoint>
          <BulletPoint>Eres responsable de todas las actividades que ocurran bajo tu cuenta.</BulletPoint>
          <BulletPoint>Debes notificarnos inmediatamente de cualquier uso no autorizado de tu cuenta.</BulletPoint>
          <BulletPoint>No debes compartir tu cuenta con terceros.</BulletPoint>
        </BulletList>
        <Subtitle>3.3. Veracidad de la Información</Subtitle>
        <Text>
          Te comprometes a proporcionar información veraz, precisa y actualizada sobre tu perfil nutricional, incluyendo alergias, preferencias alimentarias y objetivos de salud. La información incorrecta puede afectar la calidad y seguridad de las recomendaciones que recibes.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>4. Suscripciones y Pagos</SectionTitle>
        </SectionHeader>
        <Subtitle>4.1. Planes de Suscripción</Subtitle>
        <Text>
          TastyPath ofrece diferentes planes de suscripción, incluyendo un plan gratuito con funcionalidades limitadas y planes premium con acceso completo a todas las características.
        </Text>
        <Subtitle>4.2. Pagos y Facturación</Subtitle>
        <BulletList>
          <BulletPoint>Los pagos se procesan de forma segura a través de proveedores de pago autorizados.</BulletPoint>
          <BulletPoint>Las suscripciones se renuevan automáticamente a menos que las canceles antes del final del período de facturación.</BulletPoint>
          <BulletPoint>Los precios pueden cambiar con previo aviso, pero no afectarán las suscripciones activas hasta su renovación.</BulletPoint>
          <BulletPoint>No ofrecemos reembolsos por períodos parciales de suscripción, salvo en casos excepcionales y a nuestra discreción.</BulletPoint>
        </BulletList>
        <Subtitle>4.3. Cancelación</Subtitle>
        <Text>
          Puedes cancelar tu suscripción en cualquier momento a través de la configuración de tu cuenta. La cancelación entrará en vigor al final del período de facturación actual, y mantendrás acceso a las funciones premium hasta ese momento.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>5. Uso del Servicio y Limitaciones de Responsabilidad</SectionTitle>
        </SectionHeader>
        <Subtitle>5.1. Naturaleza de las Recomendaciones</Subtitle>
        <Text>
          <strong>IMPORTANTE:</strong> Las recomendaciones nutricionales proporcionadas por TastyPath son de carácter informativo y educativo. No constituyen asesoramiento médico, diagnóstico o tratamiento. Siempre consulta con un profesional de la salud calificado antes de realizar cambios significativos en tu dieta, especialmente si tienes condiciones médicas preexistentes.
        </Text>
        <Subtitle>5.2. Limitación de Responsabilidad</Subtitle>
        <Text>
          TastyPath no se hace responsable de:
        </Text>
        <BulletList>
          <BulletPoint>Decisiones de salud tomadas basándose únicamente en nuestras recomendaciones.</BulletPoint>
          <BulletPoint>Reacciones alérgicas o efectos adversos derivados del consumo de alimentos sugeridos.</BulletPoint>
          <BulletPoint>Disponibilidad ininterrumpida del servicio (aunque nos esforzamos por mantenerlo disponible).</BulletPoint>
          <BulletPoint>Pérdida de datos debido a fallos técnicos, aunque realizamos copias de seguridad regulares.</BulletPoint>
        </BulletList>
        <Subtitle>5.3. Uso Apropiado</Subtitle>
        <Text>
          Te comprometes a utilizar TastyPath únicamente para fines legales y de acuerdo con estos términos. No debes:
        </Text>
        <BulletList>
          <BulletPoint>Utilizar el servicio de manera que pueda dañar, deshabilitar o sobrecargar nuestros servidores.</BulletPoint>
          <BulletPoint>Intentar acceder no autorizado a cualquier parte del servicio o sistemas relacionados.</BulletPoint>
          <BulletPoint>Copiar, modificar, distribuir o crear trabajos derivados del contenido sin autorización.</BulletPoint>
          <BulletPoint>Utilizar robots, scripts automatizados o métodos similares para acceder al servicio.</BulletPoint>
        </BulletList>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>6. Propiedad Intelectual</SectionTitle>
        </SectionHeader>
        <Subtitle>6.1. Contenido de TastyPath</Subtitle>
        <Text>
          Todo el contenido de la plataforma, incluyendo pero no limitado a textos, gráficos, logos, iconos, imágenes, compilaciones de datos y software, es propiedad de TastyPath o sus proveedores de contenido y está protegido por leyes de propiedad intelectual.
        </Text>
        <Subtitle>6.2. Contenido del Usuario</Subtitle>
        <Text>
          Al proporcionar contenido a través de TastyPath (como planes guardados o preferencias), conservas la propiedad de dicho contenido, pero nos otorgas una licencia mundial, no exclusiva, libre de regalías para usar, reproducir, modificar y distribuir ese contenido para operar y mejorar nuestros servicios.
        </Text>
        <Subtitle>6.3. Marcas Comerciales</Subtitle>
        <Text>
          "TastyPath" y los logos relacionados son marcas comerciales de TastyPath. No puedes utilizar estas marcas sin nuestro consentimiento previo por escrito.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>7. Privacidad y Protección de Datos</SectionTitle>
        </SectionHeader>
        <Text>
          Tu privacidad es importante para nosotros. El uso de la aplicación está sujeto a nuestra Política de Privacidad, que se incorpora a estos términos por referencia. Al utilizar TastyPath, consientes la recopilación y el uso de tu información de acuerdo con nuestra Política de Privacidad.
        </Text>
        <Text>
          Cumplimos con el Reglamento General de Protección de Datos (GDPR) de la Unión Europea y otras normativas aplicables de protección de datos.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>8. Terminación</SectionTitle>
        </SectionHeader>
        <Subtitle>8.1. Terminación por el Usuario</Subtitle>
        <Text>
          Puedes terminar tu cuenta en cualquier momento eliminando tu cuenta a través de la configuración de tu perfil o contactándonos directamente.
        </Text>
        <Subtitle>8.2. Terminación por TastyPath</Subtitle>
        <Text>
          Nos reservamos el derecho de suspender o terminar tu acceso al servicio, con o sin previo aviso, por cualquier motivo, incluyendo pero no limitado a:
        </Text>
        <BulletList>
          <BulletPoint>Violación de estos términos y condiciones.</BulletPoint>
          <BulletPoint>Uso fraudulento o no autorizado del servicio.</BulletPoint>
          <BulletPoint>Actividad que pueda dañar nuestra reputación o la de otros usuarios.</BulletPoint>
          <BulletPoint>Incumplimiento de obligaciones de pago (en caso de suscripciones premium).</BulletPoint>
        </BulletList>
        <Subtitle>8.3. Efectos de la Terminación</Subtitle>
        <Text>
          Tras la terminación, tu derecho a utilizar el servicio cesará inmediatamente. Podemos eliminar o desactivar tu cuenta y todo el contenido asociado. No seremos responsables ante ti ni ante ningún tercero por la terminación de tu acceso al servicio.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>9. Ley Aplicable y Jurisdicción</SectionTitle>
        </SectionHeader>
        <Text>
          Estos términos se rigen e interpretan de acuerdo con las leyes de España, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
        </Text>
        <Text>
          Para cualquier controversia que pueda surgir en relación con estos términos o el uso del servicio, las partes se someten a los juzgados y tribunales del domicilio del usuario, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.
        </Text>
        <Text>
          Si eres un consumidor residente en la Unión Europea, también tienes derecho a presentar una reclamación ante la autoridad de protección al consumidor de tu país de residencia.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>10. Contacto y Reclamaciones</SectionTitle>
        </SectionHeader>
        <Text>
          Para cualquier pregunta, comentario o reclamación relacionada con estos términos y condiciones, puedes contactarnos a través de:
        </Text>
        <ContactInfo>Email: tastypathhelp@gmail.com</ContactInfo>
        <Text>
          Nos comprometemos a responder a todas las consultas en un plazo máximo de 30 días hábiles.
        </Text>
        <Subtitle>10.1. Resolución de Disputas</Subtitle>
        <Text>
          En caso de disputa, intentaremos resolverla de manera amistosa. Si no es posible, podrás acudir a los mecanismos de resolución de conflictos disponibles según la legislación aplicable, incluyendo la plataforma de resolución de conflictos en línea de la Unión Europea.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>11. Modificaciones de los Términos</SectionTitle>
        </SectionHeader>
        <Text>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos de cambios significativos a través de la plataforma o por correo electrónico.
        </Text>
        <Text>
          El uso continuado del servicio después de la publicación de cambios constituye tu aceptación de los términos modificados. Si no estás de acuerdo con los cambios, debes dejar de utilizar el servicio y puedes cancelar tu cuenta.
        </Text>
      </Section>
      <Section>
        <SectionHeader>
          <span style={{ fontSize: '20px' }}></span>
          <SectionTitle>12. Disposiciones Generales</SectionTitle>
        </SectionHeader>
        <Subtitle>12.1. Integridad del Acuerdo</Subtitle>
        <Text>
          Estos términos, junto con nuestra Política de Privacidad y Política de Seguridad, constituyen el acuerdo completo entre tú y TastyPath respecto al uso del servicio.
        </Text>
        <Subtitle>12.2. Divisibilidad</Subtitle>
        <Text>
          Si alguna disposición de estos términos se considera inválida o inaplicable, las disposiciones restantes permanecerán en pleno vigor y efecto.
        </Text>
        <Subtitle>12.3. Renuncia</Subtitle>
        <Text>
          El hecho de que no ejerzamos algún derecho o disposición de estos términos no constituye una renuncia a tal derecho o disposición.
        </Text>
        <Subtitle>12.4. Cesión</Subtitle>
        <Text>
          No puedes ceder o transferir estos términos o tus derechos bajo estos términos, en su totalidad o en parte, sin nuestro consentimiento previo por escrito. Podemos ceder estos términos sin restricciones.
        </Text>
      </Section>
      <Footer>
        <FooterText>
          Última actualización: Diciembre 2024
        </FooterText>
        <FooterText style={{ marginTop: '8px', fontSize: '13px' }}>
          Versión 1.0 - TastyPath  2024
        </FooterText>
      </Footer>
    </PageWrapper>
  );
};

export default TermsPage;