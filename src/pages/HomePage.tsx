import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';

const Hero = styled.section`
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.15), rgba(99, 102, 241, 0.12));
  border: 1px solid rgba(46, 139, 87, 0.12);
  border-radius: 24px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: ${theme.shadows.soft};
`;

const HeroTitle = styled.h1`
  margin: 0 0 10px;
`;

const HeroText = styled.p`
  margin: 0 0 18px;
  color: ${theme.colors.textSecondary};
`;

const CtaRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Cta = styled(Link)`
  background: ${theme.colors.primary};
  color: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: ${theme.shadows.md};
`;

const GhostCta = styled(Link)`
  background: #fff;
  color: ${theme.colors.primary};
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  border: 2px solid ${theme.colors.primary};
`;

const Benefits = styled.ul`
  margin: 0 0 8px;
  padding-left: 18px;
  color: ${theme.colors.textSecondary};
`;

const Grid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.12), rgba(74, 144, 226, 0.12));
  border: 1px solid rgba(46, 139, 87, 0.12);
  color: ${theme.colors.textPrimary};
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: ${theme.shadows.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const Title = styled.h2`
  margin: 0 0 14px;
  font-size: 22px;
`;
const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
`;

const HomePage: React.FC = () => {
  const entries = [
    { to: '/generador', title: 'Generar Plan Semanal', subtitle: 'Crea menús con IA' },
    { to: '/planes', title: 'Mis Planes', subtitle: 'Ver y gestionar' },
    { to: '/lista-compra', title: 'Lista de Compras', subtitle: 'Organiza tu compra' },
    { to: '/suscripcion', title: 'Suscripción', subtitle: 'Mejora a Premium' },
  ];

  return (
    <div>
      <Hero>
        <HeroTitle>Tu nutrición, impulsada por IA</HeroTitle>
        <HeroText>
          TastyPath genera menús semanales personalizados, analiza macros y crea tu lista de compra automáticamente.
        </HeroText>
        <Benefits>
          <li>Planes ajustados a tus objetivos (pérdida de peso, mantenimiento, músculo...)</li>
          <li>Preferencias dietéticas y alérgenos respetados</li>
          <li>Lista de la compra inteligente basada en tus menús</li>
        </Benefits>
        <CtaRow>
          <Cta to="/generador">Empezar ahora</Cta>
          <GhostCta to="/suscripcion">Ver beneficios Premium</GhostCta>
        </CtaRow>
      </Hero>

      <h2 style={{ marginTop: 0 }}>Acceso rápido</h2>
      <Grid>
        {entries.map(item => (
          <Card key={item.to} to={item.to}>
            <div>
              <Title>{item.title}</Title>
              <Subtitle>{item.subtitle}</Subtitle>
            </div>
            <span>→</span>
          </Card>
        ))}
      </Grid>
    </div>
  );
};

export default HomePage;

