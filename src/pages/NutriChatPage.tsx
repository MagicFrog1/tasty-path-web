import React from 'react';
import styled from 'styled-components';
import { FiMessageCircle } from 'react-icons/fi';
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

const NutriChatPage: React.FC = () => {
  const { currentPlan } = useSubscription();
  const { profile } = useUserProfile();

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

