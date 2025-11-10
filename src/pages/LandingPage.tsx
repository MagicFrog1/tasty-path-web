import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
  display: grid;
  gap: 32px;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(34, 139, 34, 0.12);
  box-shadow: ${theme.shadows.sm};
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: ${theme.colors.primaryDark};
`;

const Nav = styled.nav`
  display: flex;
  gap: 12px;
  a {
    padding: 10px 12px;
    border-radius: 10px;
    color: ${theme.colors.textPrimary};
  }
  a:hover {
    background: rgba(34, 139, 34, 0.08);
  }
`;

const gradientShift = keyframes`
  0% { transform: translate3d(0,0,0) scale(1); opacity: .5; }
  50% { transform: translate3d(2%, -2%, 0) scale(1.05); opacity: .6; }
  100% { transform: translate3d(0,0,0) scale(1); opacity: .5; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  padding: 56px 32px;
  border-radius: 28px;
  background:
    radial-gradient(120% 120% at 80% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(255,255,255,0) 60%),
    linear-gradient(160deg, rgba(34, 139, 34, 0.16), rgba(255,255,255,0));
  border: 1px solid rgba(34, 139, 34, 0.1);
  box-shadow: ${theme.shadows.glow};
  animation: ${fadeUp} .45s ease both;

  &:before, &:after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(30px);
    background: radial-gradient(circle at 30% 30%, rgba(99,102,241,.35), rgba(99,102,241,0));
    width: 320px; height: 320px;
    right: -80px; top: -60px;
    animation: ${gradientShift} 8s ease-in-out infinite;
  }
  &:after {
    background: radial-gradient(circle at 30% 30%, rgba(16,185,129,.28), rgba(16,185,129,0));
    width: 260px; height: 260px;
    left: -70px; bottom: -70px;
    animation-duration: 10s;
  }
`;

const HeroTitle = styled.h1`
  margin: 0 0 12px;
  font-size: 46px;
  line-height: 1.12;
  color: ${theme.colors.primaryDark};
`;

const HeroSubtitle = styled.p`
  margin: 0 0 24px;
  color: ${theme.colors.textSecondary};
  font-size: 18px;
  max-width: 820px;
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
  border-radius: 14px;
  text-decoration: none;
  font-weight: 800;
  box-shadow: ${theme.shadows.md};
  transition: transform .15s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-1px); box-shadow: ${theme.shadows.lg}; }
`;

const SecondaryCta = styled(Link)`
  background: #fff;
  color: ${theme.colors.primary};
  border: 2px solid ${theme.colors.primary};
  padding: 12px 16px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 800;
  transition: transform .15s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-1px); box-shadow: ${theme.shadows.md}; }
`;

const Section = styled.section`
  display: grid;
  gap: 18px;
`;

const SectionAnchor = styled(Section).attrs<{id?: string}>(() => ({}))``;

const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(34, 139, 34, 0.12);
  border-radius: 18px;
  padding: 18px;
  box-shadow: ${theme.shadows.sm};
  transition: transform .15s ease, box-shadow .15s ease;
  &:hover { transform: translateY(-2px); box-shadow: ${theme.shadows.md}; }
  h3 { margin: 0 0 8px; }
  p { margin: 0; color: ${theme.colors.textSecondary}; }
  animation: ${fadeUp} .5s ease both;
`;

const Small = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

const PricingGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const PriceCard = styled.div<{highlight?: boolean}>`
  background: rgba(255,255,255,.96);
  border: 2px solid ${({highlight}) => highlight ? theme.colors.primary : 'rgba(34, 139, 34, 0.12)'};
  border-radius: 18px;
  padding: 18px;
  box-shadow: ${theme.shadows.sm};
  transform: ${({highlight}) => highlight ? 'translateY(-2px)' : 'none'};
  h3 { margin: 0 0 6px; }
  p { margin: 0 0 12px; color: ${theme.colors.textSecondary}; }
  ul { margin: 0; padding-left: 18px; }
  li { margin: 6px 0; }
  transition: transform .15s ease, box-shadow .15s ease, border-color .2s ease;
  &:hover { transform: translateY(-3px); box-shadow: ${theme.shadows.md}; border-color: ${theme.colors.accent}; }
  animation: ${fadeUp} .5s ease both;
`;

const Price = styled.div`
  font-size: 28px;
  font-weight: 800;
  margin: 8px 0 14px;
`;

const LandingPage: React.FC = () => {
  return (
    <Wrapper>
      <Header>
        <Brand>TASTYPATH</Brand>
        <Nav>
          <a href="#beneficios">Beneficios</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#precios">Precios</a>
          <a href="#contacto">Contacto</a>
          <Link to="/dashboard" style={{ fontWeight: 800, color: theme.colors.primary }}>Entrar</Link>
        </Nav>
      </Header>
      <Hero>
        <HeroTitle>Planifica tu nutrición con IA</HeroTitle>
        <HeroSubtitle>
          Presentamos TastyPath: genera menús semanales totalmente personalizados, analiza tus macros,
          y obtén tu lista de compras lista para ir al súper, en segundos.
        </HeroSubtitle>
        <Ctas>
          <PrimaryCta to="/dashboard">Entrar al Dashboard</PrimaryCta>
          <SecondaryCta to="/generador">Probar el Generador</SecondaryCta>
        </Ctas>
      </Hero>

      <SectionAnchor id="beneficios">
        <h2>¿Por qué TastyPath?</h2>
        <Grid>
          <Card>
            <h3>Personalización total</h3>
            <p>Objetivos, preferencias, alérgenos y estilo de vida. Todo adaptado a ti.</p>
          </Card>
          <Card>
            <h3>IA de última generación</h3>
            <p>Menús variados y equilibrados, respaldados por nuestras fuentes médicas.</p>
          </Card>
          <Card>
            <h3>Lista de compra inteligente</h3>
            <p>Generada automáticamente a partir de tu plan semanal.</p>
          </Card>
        </Grid>
      </SectionAnchor>

      <SectionAnchor id="como-funciona">
        <h2>Cómo funciona</h2>
        <Grid>
          <Card>
            <h3>1. Cuestionario</h3>
            <p>Indícanos tus objetivos, preferencias y alérgenos.</p>
          </Card>
          <Card>
            <h3>2. Generación IA</h3>
            <p>Obtenemos un plan semanal con recetas y macros.</p>
          </Card>
          <Card>
            <h3>3. Lista de compras</h3>
            <p>Tu compra organizada por ingredientes y cantidades.</p>
          </Card>
        </Grid>
      </SectionAnchor>

      <SectionAnchor id="precios">
        <h2>Precios</h2>
        <PricingGrid>
          <PriceCard>
            <h3>Gratis</h3>
            <Price>0€</Price>
            <p>Empieza con lo básico.</p>
            <ul>
              <li>1 plan semanal</li>
              <li>Lista de compras básica</li>
              <li>Acceso a funciones esenciales</li>
            </ul>
          </PriceCard>
          <PriceCard highlight>
            <h3>Semanal</h3>
            <Price>4,99€</Price>
            <p>Flexibilidad para empezar.</p>
            <ul>
              <li>Planes ilimitados</li>
              <li>Preferencias y alérgenos completos</li>
              <li>Lista de compras inteligente</li>
            </ul>
          </PriceCard>
          <PriceCard>
            <h3>Mensual</h3>
            <Price>7,99€</Price>
            <p>La opción popular.</p>
            <ul>
              <li>Todo de Semanal</li>
              <li>Analíticas y macros ampliadas</li>
              <li>Soporte prioritario</li>
            </ul>
          </PriceCard>
          <PriceCard>
            <h3>Anual</h3>
            <Price>79,99€</Price>
            <p>Ahorra más al año.</p>
            <ul>
              <li>Todo de Mensual</li>
              <li>Mejor relación calidad/precio</li>
              <li>Actualizaciones premium</li>
            </ul>
          </PriceCard>
        </PricingGrid>
        <Ctas style={{ marginTop: 12 }}>
          <PrimaryCta to="/suscripcion">Elegir plan</PrimaryCta>
          <SecondaryCta to="/dashboard">Seguir explorando</SecondaryCta>
        </Ctas>
      </SectionAnchor>

      <SectionAnchor id="contacto">
        <h2>Contacto</h2>
        <Small>¿Dudas? Escríbenos a <a href="mailto:tastypathhelp@gmail.com">tastypathhelp@gmail.com</a></Small>
      </SectionAnchor>

      <Small>
        ¿Listo? Comienza desde el generador o entra al dashboard para gestionar tus planes.
      </Small>
    </Wrapper>
  );
};

export default LandingPage;

