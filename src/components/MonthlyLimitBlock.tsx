import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiZap, FiArrowLeft } from 'react-icons/fi';
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
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  box-shadow: 0 20px 60px rgba(255, 152, 0, 0.3);

  svg {
    width: 50px;
    height: 50px;
    color: white;
  }
`;

const Title = styled.h1`
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: ${theme.colors.text};
  margin-bottom: 16px;
  font-family: ${theme.fonts.heading};
`;

const Message = styled.p`
  font-size: 1.125rem;
  color: ${theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto 24px;
  line-height: 1.7;
`;

const DateInfo = styled.div`
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.primary};
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
  max-width: 400px;

  p {
    margin: 0;
    font-size: 1rem;
    color: ${theme.colors.text};

    strong {
      color: ${theme.colors.primary};
      font-weight: 700;
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
  margin-top: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(46, 139, 87, 0.4);
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
  color: ${theme.colors.textSecondary};
  background: transparent;
  border: 2px solid ${theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

interface MonthlyLimitBlockProps {
  nextGenerationDate: string;
}

const MonthlyLimitBlock: React.FC<MonthlyLimitBlockProps> = ({ nextGenerationDate }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <BlockContainer>
      <IconWrapper>
        <FiCalendar />
      </IconWrapper>
      <Title>Límite mensual alcanzado</Title>
      <Message>
        Has alcanzado tu límite de 1 plan semanal gratuito este mes. 
        Actualiza a Premium para generar planes ilimitados.
      </Message>
      
      <DateInfo>
        <p>
          Podrás generar un nuevo plan el <strong>{formatDate(nextGenerationDate)}</strong>
        </p>
      </DateInfo>

      <CTAButton onClick={() => navigate('/suscripcion')}>
        <FiZap />
        Actualizar a Premium
      </CTAButton>
      
      <SecondaryButton onClick={() => navigate('/planes')}>
        <FiArrowLeft />
        Ver mis planes
      </SecondaryButton>
    </BlockContainer>
  );
};

export default MonthlyLimitBlock;

