import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
// Usamos ruta pública de Vite al directorio raíz /assets

const Wrapper = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  background: linear-gradient(120deg, rgba(34, 139, 34, 0.1), rgba(75, 0, 130, 0.12)),
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.28), transparent 42%),
    radial-gradient(circle at 80% 10%, rgba(16, 185, 129, 0.2), transparent 45%);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Hero = styled.section`
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: ${theme.colors.white};
  background: linear-gradient(200deg, rgba(34, 139, 34, 0.95), rgba(41, 121, 87, 0.75));
  position: relative;
  overflow: hidden;

  &:before,
  &:after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.35;
  }

  &:before {
    width: 380px;
    height: 380px;
    background: rgba(99, 102, 241, 0.8);
    top: -80px;
    right: -120px;
  }

  &:after {
    width: 280px;
    height: 280px;
    background: rgba(236, 72, 153, 0.6);
    bottom: -60px;
    left: -40px;
  }

  h1 {
    font-size: 46px;
    line-height: 1.12;
    max-width: 480px;
    font-weight: 800;
    margin-bottom: 24px;
  }

  p {
    font-size: 18px;
    max-width: 520px;
    opacity: 0.92;
    line-height: 1.7;
  }

  @media (max-width: 1024px) {
    padding: 56px 24px 32px;
    text-align: center;

    h1,
    p {
      max-width: none;
    }
  }
`;

const FormContainer = styled.section`
  padding: 64px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) {
    padding: 32px 24px 64px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 48px;
  box-shadow: ${theme.shadows.soft};
  border: 1px solid rgba(46, 139, 87, 0.08);
  backdrop-filter: blur(18px);

  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 24px;
  }
`;

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  img {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    object-fit: cover;
    box-shadow: 0 12px 28px rgba(46, 139, 87, 0.35);
  }

  h2 {
    margin: 0;
    font-size: 20px;
    color: ${theme.colors.primaryDark};
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  span {
    display: block;
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    letter-spacing: 0.04em;
  }
`;

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  heroTitle?: string;
  heroDescription?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  heroTitle = 'Nutrición inteligente diseñada para ti',
  heroDescription = 'Genera menús semanales personalizados con IA, listas de compras inteligentes y recomendaciones respaldadas por fuentes médicas fiables.',
}) => {
  return (
    <Wrapper>
      <Hero>
        <h1>{heroTitle}</h1>
        <p>{heroDescription}</p>
      </Hero>

      <FormContainer>
        <Card>
          <BrandHeader>
            <img src="/assets/new_icon_tastypath.png" alt="TastyPath" />
            <div>
              <h2>MyTastyPath</h2>
              <span>Bienestar gastronómico inteligente</span>
            </div>
          </BrandHeader>
          <h3>{title}</h3>
          {subtitle && <p style={{ marginTop: 8, color: theme.colors.textSecondary }}>{subtitle}</p>}
          <div style={{ marginTop: 24 }}>{children}</div>
        </Card>
      </FormContainer>
    </Wrapper>
  );
};

