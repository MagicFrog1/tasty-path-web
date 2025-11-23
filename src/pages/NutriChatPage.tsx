import React from 'react';
import styled from 'styled-components';
import { FiMessageCircle, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';
import { useUserProfile } from '../context/UserProfileContext';
import NutriChat from '../components/minutri/NutriChat';
import { minutriService } from '../services/minutriService';

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 12px 0;
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  color: ${theme.colors.primaryDark};
  font-family: ${theme.fonts.heading};
  letter-spacing: -0.03em;
  line-height: 1.2;
  background: linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  font-size: clamp(14px, 2vw, 16px);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
  }
`;

const PremiumLock = styled.div`
  text-align: center;
  padding: 48px 24px;
  
  svg {
    font-size: 64px;
    color: ${theme.colors.primary};
    margin-bottom: 24px;
  }
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }
  
  p {
    margin: 0 0 24px 0;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
  
  button {
    padding: 14px 28px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
    color: white;
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(46, 139, 87, 0.3);
    }
  }
`;

const PremiumBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.3);
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 16px;
`;

const NutriChatPage: React.FC = () => {
  const { currentPlan } = useSubscription();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  // Verificar si el usuario tiene plan premium
  const isPremium = currentPlan && currentPlan.plan !== 'free' && currentPlan.isActive;

  // Obtener información del roadmap si existe
  const roadmap = minutriService.getRoadmap();
  const modules = minutriService.getModules();
  const activeModule = modules?.find(m => m.isActive);
  
  // Obtener tracking y calcular adherencia
  let adherence = 0;
  let currentDay = 1;
  
  if (activeModule) {
    const tracking = minutriService.getTracking(activeModule.id);
    if (tracking) {
      adherence = minutriService.calculateAdherence(tracking);
      currentDay = minutriService.getCurrentDay(activeModule.startDate);
    }
  }

  return (
    <PageWrapper>
      <Header>
        <Title>
          <FiMessageCircle />
          NutriChat
        </Title>
        <Subtitle>
          Tu asistente virtual especializado en alimentación y nutrición. 
          Basado en fuentes médicas verificadas y evidencia científica.
        </Subtitle>
        {isPremium && (
          <PremiumBadge>
            <FiLock />
            Función Premium Activa
          </PremiumBadge>
        )}
      </Header>

      <Card>
        <NutriChat
          adherence={adherence}
          currentDay={currentDay}
          totalDays={activeModule ? 30 : 1}
        />
      </Card>
    </PageWrapper>
  );
};

export default NutriChatPage;

