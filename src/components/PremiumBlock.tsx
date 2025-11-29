import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiZap, FiCheckCircle } from 'react-icons/fi';
import { theme } from '../styles/theme';

const BlockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 48px 24px;
  text-align: center;
  background: linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%);
`;

const IconWrapper = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  box-shadow: 0 20px 60px rgba(46, 139, 87, 0.3);

  svg {
    width: 60px;
    height: 60px;
    color: white;
  }
`;

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: ${theme.colors.text};
  margin-bottom: 16px;
  font-family: ${theme.fonts.heading};
`;

const Message = styled.p`
  font-size: 1.125rem;
  color: ${theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.7;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 40px;
  text-align: left;
  max-width: 500px;
  width: 100%;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    color: ${theme.colors.text};
    font-size: 1rem;

    svg {
      color: ${theme.colors.primary};
      flex-shrink: 0;
    }
  }
`;

const CTAButton = styled.button`
  padding: 16px 48px;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(46, 139, 87, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(46, 139, 87, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const SecondaryButton = styled.button`
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.primary};
  background: transparent;
  border: 2px solid ${theme.colors.primary};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;

  &:hover {
    background: ${theme.colors.primary};
    color: white;
  }
`;

interface PremiumBlockProps {
  title?: string;
  message?: string;
  featureName?: string;
}

const PremiumBlock: React.FC<PremiumBlockProps> = ({ 
  title = "Esta función requiere Premium",
  message = "Desbloquea todas las funcionalidades de TastyPath con una suscripción Premium",
  featureName
}) => {
  const navigate = useNavigate();

  const benefits = [
    'Generación ilimitada de planes semanales',
    'Acceso a todas las recetas premium',
    'Lista de compras automática',
    'NutriChat: asistente de nutrición con IA',
    'Mi Nutri Personal: seguimiento completo',
    'Sin restricciones ni límites',
  ];

  return (
    <BlockContainer>
      <IconWrapper>
        <FiLock />
      </IconWrapper>
      <Title>{title}</Title>
      <Message>{message}</Message>
      
      <BenefitsList>
        {benefits.map((benefit, index) => (
          <li key={index}>
            <FiCheckCircle />
            <span>{benefit}</span>
          </li>
        ))}
      </BenefitsList>

      <CTAButton onClick={() => navigate('/suscripcion')}>
        <FiZap />
        Ver Planes Premium
      </CTAButton>
      
      <SecondaryButton onClick={() => navigate('/dashboard')}>
        Volver al Dashboard
      </SecondaryButton>
    </BlockContainer>
  );
};

export default PremiumBlock;

