import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiAward } from 'react-icons/fi';
import { theme } from '../../styles/theme';

const fillAnimation = keyframes`
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
`;

const TrophyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 2px solid rgba(46, 139, 87, 0.2);
`;

const TrophyWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TrophyBase = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const TrophySVG = styled.svg<{ fillPercentage: number }>`
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 8px rgba(46, 139, 87, 0.3));
  
  .trophy-fill {
    fill: ${props => {
      if (props.fillPercentage >= 100) return '#FFD700'; // Dorado cuando está completo
      if (props.fillPercentage >= 75) return '#FFA500'; // Naranja
      if (props.fillPercentage >= 50) return '#FF6B6B'; // Rojo claro
      if (props.fillPercentage >= 25) return '#4ECDC4'; // Turquesa
      return '#E0E0E0'; // Gris cuando está vacío
    }};
    transition: fill 0.5s ease;
  }
  
  .trophy-outline {
    fill: none;
    stroke: ${theme.colors.primary};
    stroke-width: 3;
  }
`;

const TrophyIcon = styled(FiAward)<{ fillPercentage: number }>`
  font-size: 100px;
  color: ${props => {
    if (props.fillPercentage >= 100) return '#FFD700';
    if (props.fillPercentage >= 75) return '#FFA500';
    if (props.fillPercentage >= 50) return '#FF6B6B';
    if (props.fillPercentage >= 25) return '#4ECDC4';
    return '#E0E0E0';
  }};
  filter: drop-shadow(0 4px 8px rgba(46, 139, 87, 0.3));
  transition: color 0.5s ease;
  z-index: 1;
`;

const ProgressText = styled.div`
  text-align: center;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: ${theme.colors.textSecondary};
  }
`;

const ProgressBar = styled.div<{ percentage: number }>`
  width: 100%;
  height: 8px;
  background: rgba(46, 139, 87, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.percentage}%;
    background: linear-gradient(90deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
    border-radius: 4px;
    transition: width 0.5s ease;
    animation: ${fillAnimation} 0.5s ease;
  }
`;

interface TrophyProgressProps {
  completedMeals: number;
  totalMeals: number;
  completedExercises: number;
  totalExercises: number;
}

const TrophyProgress: React.FC<TrophyProgressProps> = ({
  completedMeals,
  totalMeals,
  completedExercises,
  totalExercises,
}) => {
  const totalCompleted = completedMeals + completedExercises;
  const totalItems = totalMeals + totalExercises;
  const fillPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
  
  const completedDays = Math.floor(completedMeals / 3); // 3 comidas por día
  const totalDays = Math.floor(totalMeals / 3);

  return (
    <TrophyContainer>
      <TrophyWrapper>
        <TrophyIcon fillPercentage={fillPercentage} />
      </TrophyWrapper>
      <ProgressText>
        <h3>Progreso del Mes</h3>
        <p>{fillPercentage}% Completado</p>
        <p style={{ fontSize: '12px', marginTop: '4px' }}>
          {completedMeals}/{totalMeals} comidas • {completedExercises}/{totalExercises} ejercicios
        </p>
        <p style={{ fontSize: '12px', marginTop: '4px', color: theme.colors.primary }}>
          {completedDays}/{totalDays} días completos
        </p>
      </ProgressText>
      <ProgressBar percentage={fillPercentage} />
    </TrophyContainer>
  );
};

export default TrophyProgress;


