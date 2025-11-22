import React from 'react';
import styled from 'styled-components';
import { FiActivity, FiTarget, FiTrendingUp, FiClock } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { DailyContent } from '../../services/minutriContentService';

const ExercisesContainer = styled.div`
  display: grid;
  gap: 16px;
`;

const ExerciseCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary};
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    flex: 1;
  }
  
  svg {
    color: ${theme.colors.primary};
    flex-shrink: 0;
  }
`;

const ExerciseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const InfoBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(46, 139, 87, 0.08);
  color: ${theme.colors.primaryDark};
  font-size: 13px;
  font-weight: 600;
  
  svg {
    font-size: 14px;
  }
`;

const ExerciseDescription = styled.p`
  margin: 0 0 12px 0;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
`;

const ExerciseInstructions = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: ${theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.8;
  
  li {
    margin-bottom: 6px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${theme.colors.textSecondary};
  
  svg {
    font-size: 48px;
    color: ${theme.colors.primary};
    opacity: 0.3;
    margin-bottom: 16px;
  }
  
  p {
    margin: 0;
    font-size: 15px;
  }
`;

interface ComplementaryExercisesProps {
  dailyContent: DailyContent | null;
  currentDay: number;
}

const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);
`;

const ComplementaryExercises: React.FC<ComplementaryExercisesProps> = ({ dailyContent, currentDay }) => {
  if (!dailyContent || !dailyContent.exercise) {
    return (
      <>
        <ExerciseHeader>
          <FiActivity />
          <h3>Ejercicios Complementarios</h3>
        </ExerciseHeader>
        <EmptyState>
          <FiActivity />
          <p>No hay ejercicios disponibles para hoy</p>
        </EmptyState>
      </>
    );
  }

  const exercise = dailyContent.exercise;

  return (
    <ExercisesContainer>
      <ExerciseCard>
        <ExerciseHeader>
          <FiActivity />
          <h3>{exercise.name}</h3>
        </ExerciseHeader>
        
        <ExerciseInfo>
          <InfoBadge>
            <FiClock />
            {exercise.duration} min
          </InfoBadge>
          <InfoBadge>
            <FiTarget />
            Día {currentDay}
          </InfoBadge>
        </ExerciseInfo>
        
        <ExerciseDescription>{exercise.description}</ExerciseDescription>
        
        {exercise.instructions && exercise.instructions.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: theme.colors.primaryDark }}>
              Instrucciones:
            </h4>
            <ExerciseInstructions>
              {exercise.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ExerciseInstructions>
          </div>
        )}
        
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: theme.colors.primaryDark }}>
              Equipamiento:
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textSecondary }}>
              {exercise.equipment.join(', ')}
            </p>
          </div>
        )}
        
        {exercise.recommendations && exercise.recommendations.length > 0 && (
          <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(46, 139, 87, 0.05)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: theme.colors.primaryDark }}>
              Recomendaciones:
            </h4>
            <ExerciseInstructions>
              {exercise.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ExerciseInstructions>
          </div>
        )}
      </ExerciseCard>
    </ExercisesContainer>
  );
};

export default ComplementaryExercises;

