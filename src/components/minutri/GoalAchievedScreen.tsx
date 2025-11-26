import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiAward, FiCheckCircle, FiHeart, FiStar, FiTrendingUp } from 'react-icons/fi';
import { theme } from '../../styles/theme';

const confettiAnimation = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const CelebrationCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(236, 253, 245, 0.95) 100%);
  border-radius: 32px;
  padding: 48px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 32px 80px rgba(46, 139, 87, 0.4);
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(46, 139, 87, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 24px;
  }
`;

const TrophyIcon = styled.div`
  font-size: 120px;
  margin: 0 auto 24px;
  animation: bounce 1s ease-in-out infinite;
  filter: drop-shadow(0 8px 16px rgba(255, 215, 0, 0.4));
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 80px;
  }
`;

const Title = styled.h1`
  margin: 0 0 16px 0;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, ${theme.colors.primary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  margin: 0 0 32px 0;
  font-size: 18px;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 32px 0;
`;

const StatCard = styled.div`
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%);
  border: 2px solid rgba(46, 139, 87, 0.2);
  
  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: ${theme.colors.primaryDark};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .stat-label {
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const MessageSection = styled.div`
  margin: 32px 0;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 2px solid rgba(46, 139, 87, 0.2);
  
  p {
    margin: 0;
    font-size: 16px;
    line-height: 1.8;
    color: ${theme.colors.textPrimary};
  }
`;

const Button = styled.button`
  margin-top: 32px;
  padding: 16px 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
  color: white;
  font-weight: 700;
  font-size: 18px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(46, 139, 87, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(46, 139, 87, 0.4);
  }
  
  svg {
    font-size: 20px;
  }
`;

interface GoalAchievedScreenProps {
  initialWeight: number;
  finalWeight: number;
  targetWeight: number;
  goal: string;
  adherence: number;
  completedDays: number;
  onClose: () => void;
}

const GoalAchievedScreen: React.FC<GoalAchievedScreenProps> = ({
  initialWeight,
  finalWeight,
  targetWeight,
  goal,
  adherence,
  completedDays,
  onClose,
}) => {
  const weightChange = finalWeight - initialWeight;
  const goalText = goal === 'weight_loss' ? 'Pérdida de Peso' 
    : goal === 'weight_gain' ? 'Ganancia de Peso'
    : goal === 'muscle_gain' ? 'Ganancia de Músculo'
    : 'Mantenimiento';

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <CelebrationCard onClick={(e) => e.stopPropagation()}>
        <TrophyIcon>🏆</TrophyIcon>
        
        <Title>¡Objetivo Alcanzado!</Title>
        <Subtitle>
          Has logrado tu meta de {goalText.toLowerCase()}. ¡Felicitaciones por tu dedicación y esfuerzo!
        </Subtitle>

        <StatsGrid>
          <StatCard>
            <div className="stat-value">
              <FiTrendingUp />
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
            </div>
            <div className="stat-label">Cambio de Peso</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">
              <FiCheckCircle />
              {adherence}%
            </div>
            <div className="stat-label">Adherencia Final</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">
              <FiAward />
              {completedDays}/30
            </div>
            <div className="stat-label">Días Completados</div>
          </StatCard>
        </StatsGrid>

        <MessageSection>
          <p>
            <strong>¡Gracias por usar TastyPath!</strong>
            <br />
            Has demostrado un compromiso excepcional con tu salud y bienestar. 
            Tu dedicación diaria ha dado sus frutos y has alcanzado tu objetivo.
            <br /><br />
            Te animamos a mantener estos hábitos saludables y seguir usando nuestra plataforma 
            para mantener tu progreso y alcanzar nuevas metas.
          </p>
        </MessageSection>

        <Button onClick={onClose}>
          <FiHeart />
          Continuar
        </Button>
      </CelebrationCard>
    </Overlay>
  );
};

export default GoalAchievedScreen;


