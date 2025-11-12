import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAuth } from '../context/AuthContext';
import {
  FiTarget,
  FiHeart,
  FiShield,
  FiShoppingBag,
  FiActivity,
  FiZap,
  FiClock,
  FiTrendingUp,
  FiSmile,
  FiFeather,
} from 'react-icons/fi';

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 32px 0 96px;
  background: radial-gradient(circle at top left, rgba(75, 0, 130, 0.22), rgba(255, 255, 255, 0))
      0 0 / 90% 90% no-repeat,
    radial-gradient(circle at bottom right, rgba(34, 139, 34, 0.18), rgba(255, 255, 255, 0))
      0 0 / 95% 95% no-repeat,
    linear-gradient(180deg, #f2f7f4 0%, #f9fbff 100%);
`;

const Content = styled.main`
  width: min(1180px, 92vw);
  margin: 0 auto;
  display: grid;
  gap: 56px;
  position: relative;
  z-index: 1;
`;

const Header = styled.header`
  position: sticky;
  top: 16px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(34, 139, 34, 0.12);
  box-shadow: ${theme.shadows.sm};
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${theme.colors.primaryDark};
`;

const Nav = styled.nav`
  display: flex;
  gap: 14px;
  a {
    padding: 10px 14px;
    border-radius: 12px;
    color: ${theme.colors.textPrimary};
    font-weight: 600;
  }
  a:hover {
    background: rgba(34, 139, 34, 0.12);
  }
`;

const float = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const bounce = keyframes`
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 6px); }
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  padding: 68px 56px;
  border-radius: 32px;
  border: 1px solid rgba(34, 139, 34, 0.12);
  background: linear-gradient(130deg, rgba(34, 139, 34, 0.12), rgba(99, 102, 241, 0.1));
  box-shadow: ${theme.shadows.glow};
  display: grid;
  gap: 40px;
  animation: ${float} 16s ease-in-out infinite;

  &:before,
  &:after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(35px);
    opacity: 0.55;
    animation: ${gradientFlow} 12s ease infinite;
  }
  &:before {
    width: 380px;
    height: 380px;
    top: -120px;
    right: -80px;
    background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.45), rgba(255, 255, 255, 0));
  }
  &:after {
    width: 320px;
    height: 320px;
    bottom: -100px;
    left: -80px;
    background: radial-gradient(circle at 40% 40%, rgba(34, 139, 34, 0.4), rgba(255, 255, 255, 0));
    animation-delay: 1.6s;
  }
`;

const HeroLayout = styled.div`
  display: grid;
  gap: 36px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  position: relative;
  z-index: 1;
`;

const HeroCopy = styled.div`
  display: grid;
  gap: 20px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.9rem, 6vw, 3.8rem);
  line-height: 1.05;
  background: linear-gradient(90deg, #1f7a43 0%, #3c9d6f 40%, #5c7ef5 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ${gradientFlow} 12s ease infinite;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  color: rgba(17, 24, 39, 0.7);
  font-size: 18px;
  max-width: 540px;
`;

const HeroList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
`;

const HeroListItem = styled.li`
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.85);
`;

const Bullet = styled.span`
  display: inline-flex;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(34, 139, 34, 0.2);
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
`;

const HeroPanel = styled.div`
  position: relative;
  padding: 28px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 24px 45px rgba(34, 139, 34, 0.18);
  display: grid;
  gap: 18px;
`;

const HeroPanelHeading = styled.div`
  display: grid;
  gap: 6px;
  h3 {
    margin: 0;
    font-size: 24px;
  }
  span {
    font-size: 14px;
    color: rgba(17, 24, 39, 0.5);
  }
`;

const PanelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 20px;
  background: transparent;
  width: fit-content;
`;

const PanelLogo = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.35);
`;

const PanelList = styled.ul`
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  color: rgba(17, 24, 39, 0.7);
`;

const Ctas = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const PrimaryCta = styled(Link)`
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  color: #fff;
  padding: 14px 18px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 800;
  box-shadow: 0 12px 35px rgba(34, 139, 87, 0.35);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 40px rgba(34, 139, 87, 0.4);
    filter: brightness(1.04);
  }
`;

const SecondaryCta = styled(Link)`
  background: #fff;
  color: ${theme.colors.primary};
  border: 2px solid ${theme.colors.primary};
  padding: 12px 18px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 800;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const ScrollIndicator = styled.a`
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-decoration: none;
  letter-spacing: 0.06em;
  animation: ${bounce} 2.8s ease-in-out infinite;
`;

const StatsRow = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 18px 22px;
  border: 1px solid rgba(34, 139, 34, 0.12);
  box-shadow: ${theme.shadows.sm};
  display: grid;
  gap: 6px;
  align-items: start;
  h4 {
    margin: 0;
    font-size: 14px;
    color: rgba(17, 24, 39, 0.55);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  strong {
    font-size: 30px;
    color: ${theme.colors.primaryDark};
  }
`;

const SectionAnchor = styled.section<{ id?: string }>`
  display: grid;
  gap: 22px;
`;

const SectionTitle = styled.div`
  display: grid;
  gap: 6px;
  h2 {
    margin: 0;
    font-size: 32px;
    color: ${theme.colors.primaryDark};
  }
  span {
    color: rgba(17, 24, 39, 0.55);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 13px;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 22px;
  border: 1px solid rgba(34, 139, 34, 0.12);
  box-shadow: ${theme.shadows.sm};
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.md};
    border-color: rgba(99, 102, 241, 0.25);
  }
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  h3 {
    margin: 0;
  }
`;

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(34, 139, 34, 0.12);
  color: ${theme.colors.primary};
`;

const PricingGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
`;

const PriceCard = styled(Card)<{ highlight?: boolean }>`
  border-width: ${({ highlight }) => (highlight ? '2px' : '1px')};
  border-color: ${({ highlight }) =>
    highlight ? theme.colors.primary : 'rgba(34, 139, 34, 0.12)'};
  transform: ${({ highlight }) => (highlight ? 'translateY(-6px)' : 'none')};
  &:hover {
    border-color: ${theme.colors.accent};
  }
`;

const Price = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${theme.colors.primaryDark};
  margin-bottom: 12px;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const TestimonialCard = styled(Card)`
  display: grid;
  gap: 16px;
  p {
    margin: 0;
    color: rgba(17, 24, 39, 0.65);
  }
`;

const TestimonialFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  strong {
    display: block;
  }
  span {
    color: rgba(17, 24, 39, 0.5);
    font-size: 13px;
  }
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const FinalCta = styled.section`
  padding: 38px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(34, 139, 34, 0.95), rgba(99, 102, 241, 0.9));
  color: #fff;
  display: grid;
  gap: 18px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 24px 48px rgba(34, 139, 87, 0.35);
  h2 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.6rem);
  }
  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.85);
  }
`;

const FooterNote = styled.p`
  margin: 0;
  color: rgba(17, 24, 39, 0.6);
  font-size: 14px;
  text-align: center;
`;

const ContactNote = styled.small`
  display: block;
  color: rgba(17, 24, 39, 0.6);
  font-size: 14px;
  line-height: 1.6;

  a {
    color: ${theme.colors.primary};
    font-weight: 600;
    text-decoration: none;
  }
`;

const LandingPage: React.FC = () => {
  useScrollReveal();
  const { user } = useAuth();

  const heroList = [
    'IA nutricional entrenada con criterios médicos',
    'Menús adaptados a tus gustos y alergias',
    'Lista de compras automatizada en segundos',
  ];

  const stats = [
    { label: 'Menús generados', value: '25K+' },
    { label: 'Usuarios satisfechos', value: '8.9/10' },
    { label: 'Ingredientes en base', value: '1.200+' },
    { label: 'Fuentes médicas verificadas', value: '35' },
  ];

  const benefits = [
    {
      title: 'Personalización total',
      description: 'Objetivos, niveles de actividad, alergias y horarios ajustados a tu estilo de vida.',
      icon: <FiTarget />,
    },
    {
      title: 'Salud y bienestar',
      description: 'Recomendaciones respaldadas por fuentes médicas y equilibrio nutricional.',
      icon: <FiHeart />,
    },
    {
      title: 'Seguridad alimentaria',
      description: 'Control exhaustivo de alérgenos y requisitos específicos.',
      icon: <FiShield />,
    },
    {
      title: 'Compra organizada',
      description: 'Lista inteligente por categorías y cantidades exactas.',
      icon: <FiShoppingBag />,
    },
  ];

  const steps = [
    {
      title: '1. Cuestionario',
      description: 'Cuéntanos tus objetivos, alergias, preferencias dietéticas y ritmo de vida.',
      icon: <FiActivity />,
    },
    {
      title: '2. Generación IA',
      description: 'Creamos un plan semanal equilibrado con macros y recetas variadas.',
      icon: <FiZap />,
    },
    {
      title: '3. Lista de compras',
      description: 'Te damos una lista clara y agrupada para ir al supermercado sin olvidos.',
      icon: <FiClock />,
    },
  ];

  const pricing = [
    {
      name: 'Gratis',
      price: '0€',
      highlight: false,
      features: ['1 plan semanal', 'Lista de compras básica', 'Funciones esenciales'],
    },
    {
      name: 'Semanal',
      price: '4,99€',
      highlight: true,
      features: ['Planes ilimitados', 'Preferencias y alérgenos completos', 'Lista de compras inteligente'],
    },
    {
      name: 'Mensual',
      price: '7,99€',
      highlight: false,
      features: ['Todo del Semanal', 'Analíticas avanzadas', 'Soporte prioritario'],
    },
    {
      name: 'Anual',
      price: '79,99€',
      highlight: false,
      features: ['Ahorras más', 'Actualizaciones exclusivas', 'Acceso early a nuevas funciones'],
    },
  ];

  const testimonials = [
    {
      quote: '“Con TastyPath planifico toda la semana en cuestión de minutos. La lista de la compra es lo que más valoro.”',
      name: 'Laura G.',
      role: 'Nutrióloga y mamá de 2',
    },
    {
      quote: '“La IA respeta mis alergias y objetivos deportivos. He logrado mantener mi peso y energía estables.”',
      name: 'Miguel A.',
      role: 'Entrenador personal',
    },
    {
      quote: '“Por fin un planificador que entiende mi estilo de vida vegano. El soporte es excelente.”',
      name: 'Sofía V.',
      role: 'Creadora de contenido',
    },
  ];

  return (
    <Page>
      <Content>
        <Header>
          <Brand>TASTYPATH</Brand>
          <Nav>
            <a href="#beneficios">Beneficios</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#precios">Precios</a>
            <a href="#testimonios">Experiencias</a>
            <a href="#contacto">Contacto</a>
            <Link to={user ? "/dashboard" : "/auth"} style={{ fontWeight: 800, color: theme.colors.primary }}>Entrar</Link>
          </Nav>
        </Header>

        <Hero data-reveal>
          <HeroLayout>
            <HeroCopy>
              <HeroTitle>Nutrición inteligente diseñada para ti</HeroTitle>
              <HeroSubtitle>
                Genera menús semanales personalizados con IA, obtén una lista de compras inteligente y
                recomendaciones fiables validadas por nuestro equipo nutricional.
              </HeroSubtitle>
              <HeroList>
                {heroList.map((item) => (
                  <HeroListItem key={item}>
                    <Bullet>
                      <FiFeather />
                    </Bullet>
                    {item}
                  </HeroListItem>
                ))}
              </HeroList>
              <Ctas>
                <PrimaryCta to={user ? "/dashboard" : "/auth"}>Entrar al Dashboard</PrimaryCta>
                <SecondaryCta to={user ? "/generador" : "/auth"}>Probar el Generador</SecondaryCta>
              </Ctas>
            </HeroCopy>

            <HeroPanel>
              <PanelBadge>
                <PanelLogo src="/assets/new_icon_tastypath.png" alt="Impacto real de TastyPath" />
              </PanelBadge>
              <HeroPanelHeading>
                <h3>Tu plan ideal, en minutos</h3>
                <span>Automatiza tu semana con IA</span>
              </HeroPanelHeading>
              <PanelList>
                <li>Analizamos tus datos metabólicos y objetivos.</li>
                <li>Recetas variadas con macros y tiempos de preparación.</li>
                <li>Lista de compras sin desperdicio.</li>
              </PanelList>
            </HeroPanel>
          </HeroLayout>
          <ScrollIndicator href="#beneficios">Desplázate para ver más ↓</ScrollIndicator>
        </Hero>

        <StatsRow data-reveal>
          {stats.map((stat) => (
            <StatCard key={stat.label} data-reveal>
              <h4>{stat.label}</h4>
              <strong>{stat.value}</strong>
            </StatCard>
          ))}
        </StatsRow>

        <SectionAnchor id="beneficios" data-reveal>
          <SectionTitle>
            <span>Beneficios principales</span>
            <h2>¿Por qué TastyPath?</h2>
          </SectionTitle>
          <Grid>
            {benefits.map((item) => (
              <Card key={item.title} data-reveal>
                <CardHead>
                  <IconWrap>{item.icon}</IconWrap>
                  <h3>{item.title}</h3>
                </CardHead>
                <p>{item.description}</p>
              </Card>
            ))}
          </Grid>
        </SectionAnchor>

        <SectionAnchor id="como-funciona" data-reveal>
          <SectionTitle>
            <span>Proceso guiado</span>
            <h2>Cómo funciona</h2>
          </SectionTitle>
          <Grid>
            {steps.map((step) => (
              <Card key={step.title} data-reveal>
                <CardHead>
                  <IconWrap>{step.icon}</IconWrap>
                  <h3>{step.title}</h3>
                </CardHead>
                <p>{step.description}</p>
              </Card>
            ))}
          </Grid>
        </SectionAnchor>

        <SectionAnchor id="testimonios" data-reveal>
          <SectionTitle>
            <span>Historias reales</span>
            <h2>¿Qué dicen nuestros usuarios?</h2>
          </SectionTitle>
          <TestimonialsGrid>
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} data-reveal>
                <p>{testimonial.quote}</p>
                <TestimonialFooter>
                  <Avatar>{testimonial.name.slice(0, 1)}</Avatar>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </TestimonialFooter>
              </TestimonialCard>
            ))}
          </TestimonialsGrid>
        </SectionAnchor>

        <FinalCta data-reveal>
          <h2>Empieza hoy y transforma tu relación con la alimentación</h2>
          <p>
            Prueba el generador de planes, ajusta tus preferencias y deja que la IA haga el resto. TastyPath
            te acompaña en cada paso hacia una nutrición consciente.
          </p>
          <Ctas>
            <PrimaryCta to={user ? "/generador" : "/auth"}>Generar mi plan con IA</PrimaryCta>
            <SecondaryCta to={user ? "/dashboard" : "/auth"}>Ver dashboard</SecondaryCta>
          </Ctas>
        </FinalCta>

        <SectionAnchor id="contacto" data-reveal>
          <SectionTitle>
            <span>Estamos para ayudarte</span>
            <h2>Contacto</h2>
          </SectionTitle>
          <ContactNote>
            ¿Tienes dudas? Escríbenos a <a href="mailto:tastypathhelp@gmail.com">tastypathhelp@gmail.com</a>
          </ContactNote>
        </SectionAnchor>

        <FooterNote>
          © {new Date().getFullYear()} TastyPath. Nutrición inteligente impulsada por IA.
        </FooterNote>
      </Content>
    </Page>
  );
};

export default LandingPage;

