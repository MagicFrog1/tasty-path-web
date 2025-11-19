import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiClock, FiShield, FiSun, FiTrendingUp } from 'react-icons/fi';
import { theme } from '../styles/theme';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 36px;
  padding: 56px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.9), rgba(99, 102, 241, 0.75));
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: ${theme.shadows.lg};
  color: ${theme.colors.white};
  isolation: isolate;

  @media (max-width: 900px) {
    padding: 40px 28px;
  }

  &:before {
    content: '';
    position: absolute;
    inset: -20% -30%;
    background: radial-gradient(closest-side, rgba(255, 255, 255, 0.45), transparent 65%);
    opacity: 0.4;
    z-index: -1;
    transform: rotate(-12deg);
  }

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%);
    mix-blend-mode: soft-light;
    z-index: -1;
  }
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 48px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const HeroContent = styled.div`
  display: grid;
  gap: 24px;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-weight: 600;
  letter-spacing: 0.04em;
  font-size: 13px;

  svg {
    font-size: 16px;
  }
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-family: ${theme.fonts.heading};
  font-weight: 700;
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  line-height: 1.1;

  span {
    color: ${theme.colors.accentLight};
  }
`;

const HeroText = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
  max-width: 620px;
`;

const HeroBenefits = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);

    svg {
      flex-shrink: 0;
      font-size: 18px;
      color: ${theme.colors.premiumGold};
      filter: drop-shadow(0 4px 12px rgba(236, 72, 153, 0.4));
    }
  }
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
`;

const PrimaryCta = styled(Link)`
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  color: ${theme.colors.white};
  padding: 14px 20px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 16px 35px rgba(34, 139, 34, 0.35);
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;

  svg {
    transition: transform 0.25s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(34, 139, 34, 0.45);

    svg {
      transform: translateX(4px);
    }
  }
`;

const SecondaryCta = styled(Link)`
  background: rgba(255, 255, 255, 0.15);
  color: ${theme.colors.white};
  padding: 14px 20px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;

  svg {
    transition: transform 0.25s ease;
  }

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.4);

    svg {
      transform: translateX(4px);
    }
  }
`;

const HighlightCard = styled.div`
  position: relative;
  border-radius: 24px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  display: grid;
  gap: 18px;
  align-content: start;
  box-shadow: ${theme.shadows.glow};

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.82);
  }
`;

const HighlightList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;

  li {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.82);

    span:first-child {
      font-weight: 600;
    }

    span:last-child {
      opacity: 0.75;
    }
  }
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 10px;
`;

const HeroStat = styled.div`
  background: rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  display: grid;
  gap: 6px;

  strong {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.4;
  }
`;

const Section = styled.section`
  display: grid;
  gap: 28px;
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 12px;
`;

const SectionTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.primary};
  background: rgba(46, 139, 87, 0.12);
  padding: 8px 14px;
  border-radius: 999px;
  width: fit-content;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.4rem);
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const SectionDescription = styled.p`
  margin: 0;
  max-width: 620px;
  color: ${theme.colors.textSecondary};
  line-height: 1.7;
  font-size: 16px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const FeatureCard = styled.div`
  position: relative;
  padding: 26px 24px;
  border-radius: 24px;
  background: linear-gradient(155deg, rgba(248, 249, 250, 0.9), rgba(255, 255, 255, 0.9));
  border: 1px solid rgba(46, 139, 87, 0.12);
  box-shadow: ${theme.shadows.soft};
  display: grid;
  gap: 12px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: ${theme.shadows.md};
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const FeatureIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 20px;
  background: rgba(46, 139, 87, 0.12);
  color: ${theme.colors.primary};
  box-shadow: 0 12px 28px rgba(46, 139, 87, 0.18);
`;

const QuickLinksGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const QuickLinkCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 24px;
  text-decoration: none;
  color: ${theme.colors.textPrimary};
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1), rgba(74, 144, 226, 0.1));
  border: 1px solid rgba(46, 139, 87, 0.15);
  box-shadow: ${theme.shadows.sm};
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.md};
    border-color: rgba(46, 139, 87, 0.3);
  }
`;

const QuickLinkHeading = styled.div`
  display: grid;
  gap: 6px;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  span {
    color: ${theme.colors.textSecondary};
    font-size: 14px;
  }
`;

const QuickLinkFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 14px;

  svg {
    transition: transform 0.25s ease;
  }

  ${QuickLinkCard}:hover & svg {
    transform: translateX(6px);
  }
`;

const HomePage: React.FC = () => {
  const entries = [
    { to: '/generador', title: 'Generar Plan Semanal', subtitle: 'Crea menÃºs con IA' },
    { to: '/planes', title: 'Mis Planes', subtitle: 'Revisa, edita y reutiliza' },
    { to: '/lista-compra', title: 'Lista de Compras', subtitle: 'Ordena tu compra automÃ¡ticamente' },
    { to: '/suscripcion', title: 'SuscripciÃ³n', subtitle: 'Desbloquea funciones premium' },
  ];

  const stats = [
    { value: '99%', label: 'PrecisiÃ³n en macronutrientes' },
    { value: '+12k', label: 'Planes personalizados generados' },
    { value: '5h', label: 'Promedio de tiempo ahorrado por semana' },
  ];

  const features = [
    {
      icon: FiTrendingUp,
      title: 'Objetivos con resultados',
      description: 'Planifica con inteligencia los macros ideales para perder peso, mantener o ganar masa muscular.',
    },
    {
      icon: FiShield,
      title: 'Rigor nutricional y mÃ©dico',
      description: 'Cada recomendaciÃ³n se basa en fuentes mÃ©dicas validadas y supervisiÃ³n nutricional experta.',
    },
    {
      icon: FiClock,
      title: 'Automatiza tu semana',
      description: 'Recibe menÃºs completos con lista de compra organizada en segundos, sin hojas de cÃ¡lculo.',
    },
    {
      icon: FiCheckCircle,
      title: 'Respeta tus preferencias',
      description: 'Incluimos tus gustos, alergias y deseos culinarios para que disfrutes cada comida.',
    },
  ];

  return (
    <PageWrapper>
      <Hero>
        <HeroGrid>
          <HeroContent>
            <HeroBadge>
              <FiSun />
              Experiencia IA 2025
            </HeroBadge>
            <HeroTitle>
              NutriciÃ³n inteligente para tu vida diaria, impulsada por <span>IA avanzada</span>.
            </HeroTitle>
            <HeroText>
              Crea planes semanales deliciosos, con el balance perfecto de macros, recetas variadas y listas de
              compras optimizadas. TastyPath te acompaÃ±a para llevar tus objetivos a resultados reales.
            </HeroText>
            <HeroBenefits>
              <li>
                <FiCheckCircle />
                MenÃºs completos con presencia balanceada de carnes, pescados y opciones vegetales.
              </li>
              <li>
                <FiCheckCircle />
                Ajustamos calorÃ­as, macros y raciones a tus metas y preferencias alimentarias.
              </li>
              <li>
                <FiCheckCircle />
                SincronizaciÃ³n con compras inteligentes y recordatorios semanales.
              </li>
            </HeroBenefits>
            <HeroActions>
              <PrimaryCta to="/generador">
                Empezar ahora
                <FiArrowRight />
              </PrimaryCta>
              <SecondaryCta to="/suscripcion">
                Explorar Premium
                <FiArrowRight />
              </SecondaryCta>
            </HeroActions>
            <HeroStats>
              {stats.map(stat => (
                <HeroStat key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </HeroStat>
              ))}
            </HeroStats>
          </HeroContent></HeroGrid>
      </Hero>

      <Section>
        <SectionHeader>
          <SectionTag>Ventajas clave</SectionTag>
          <SectionTitle>La experiencia TastyPath se siente como tu nutricionista personal</SectionTitle>
          <SectionDescription>
            Centralizamos en un panel elegante todo lo que necesitas para planificar, comprar y cocinar con la
            tranquilidad de estar siguiendo un plan hecho a tu medida.
          </SectionDescription>
        </SectionHeader>

        <FeaturesGrid>
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <FeatureCard key={feature.title}>
                <FeatureIcon>
                  <Icon />
                </FeatureIcon>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            );
          })}
        </FeaturesGrid>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTag>Acceso rÃ¡pido</SectionTag>
          <SectionTitle>Todo tu ecosistema nutricional a un clic</SectionTitle>
          <SectionDescription>
            Navega por tus herramientas favoritas y mantÃ©n el control de tu alimentaciÃ³n semanal desde un solo lugar.
          </SectionDescription>
        </SectionHeader>

        <QuickLinksGrid>
          {entries.map(item => (
            <QuickLinkCard key={item.to} to={item.to}>
              <QuickLinkHeading>
                <h3>{item.title}</h3>
                <span>{item.subtitle}</span>
              </QuickLinkHeading>
              <QuickLinkFooter>
                Entrar ahora
                <FiArrowRight />
              </QuickLinkFooter>
            </QuickLinkCard>
          ))}
        </QuickLinksGrid>
      </Section>
    </PageWrapper>
  );
};

export default HomePage;

