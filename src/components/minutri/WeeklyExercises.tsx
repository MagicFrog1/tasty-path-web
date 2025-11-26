import React, { useState } from 'react';
import styled from 'styled-components';
import { FiActivity, FiClock, FiTarget, FiCalendar, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { DailyContent } from '../../services/minutriContentService';

const ExercisesContainer = styled.div`
  display: grid;
  gap: 16px;
`;

const WeekHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
  
  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: white;
    flex: 1;
    letter-spacing: -0.3px;
  }
  
  svg {
    color: white;
    font-size: 26px;
    opacity: 0.95;
  }
`;

const ExerciseCard = styled.div<{ isCompleted?: boolean }>`
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 20px;
  box-shadow: ${theme.shadows.md};
  border: 2px solid ${props => props.isCompleted ? 'rgba(46, 139, 87, 0.4)' : 'rgba(46, 139, 87, 0.15)'};
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.isCompleted && `
    background: linear-gradient(135deg, rgba(46, 139, 87, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%);
  `}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${props => props.isCompleted ? theme.colors.primary : theme.colors.primary};
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  
  .exercise-title {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 200px;
    
    h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: ${theme.colors.primaryDark};
    }
    
    svg {
      color: ${theme.colors.primary};
      font-size: 20px;
      flex-shrink: 0;
    }
  }
`;

const ExerciseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const InfoBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  svg {
    font-size: 16px;
    color: white;
    opacity: 0.95;
  }
`;

const ExerciseDescription = styled.p`
  margin: 0 0 16px 0;
  color: ${theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.7;
`;

const ExerciseSection = styled.div`
  margin-top: 16px;
  
  h5 {
    margin: 0 0 12px 0;
    font-size: 15px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      font-size: 16px;
      color: ${theme.colors.primary};
    }
  }
`;

const ExerciseInstructions = styled.ul`
  margin: 0;
  padding-left: 24px;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
  line-height: 2;
  
  li {
    margin-bottom: 8px;
  }
`;

const EquipmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const EquipmentTag = styled.span`
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(46, 139, 87, 0.1);
  color: ${theme.colors.primaryDark};
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(46, 139, 87, 0.2);
`;

const RecommendationsBox = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
`;

const CompleteDayButton = styled.button<{ completed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  margin-top: 20px;
  border-radius: 12px;
  border: 2px solid ${props => props.completed ? theme.colors.primary : '#e2e8f0'};
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.15) 0%, rgba(34, 197, 94, 0.12) 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'};
  color: ${props => props.completed ? theme.colors.primaryDark : theme.colors.textSecondary};
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.completed 
    ? '0 2px 8px rgba(46, 139, 87, 0.2)'
    : '0 2px 4px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.completed 
      ? '0 4px 12px rgba(46, 139, 87, 0.3)'
      : '0 4px 12px rgba(99, 102, 241, 0.2)'};
    border-color: ${props => props.completed ? theme.colors.primary : '#6366f1'};
    background: ${props => props.completed 
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)'
      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'};
    color: ${props => props.completed ? theme.colors.primaryDark : 'white'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 18px;
    stroke-width: 2.5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.colors.textSecondary};
  
  svg {
    font-size: 64px;
    color: ${theme.colors.primary};
    opacity: 0.3;
    margin-bottom: 20px;
  }
  
  h4 {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }
  
  p {
    margin: 0;
    font-size: 15px;
  }
`;

const NavigationButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 14px;
  border: none;
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' 
    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'};
  color: ${props => props.disabled ? '#9ca3af' : 'white'};
  font-weight: 700;
  font-size: 15px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.disabled 
    ? 'none' 
    : '0 4px 14px rgba(99, 102, 241, 0.25)'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 18px;
    stroke-width: 2.5;
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const WeekIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  
  .week-number {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  
  .week-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.9;
  }
`;

interface WeeklyExercisesProps {
  moduleContent: any;
  currentDay: number;
  onDayChange?: (day: number) => void;
  onDayUpdate?: (dayNumber: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'exercise', completed: boolean) => void;
  dayCompletions?: { [dayNumber: number]: { breakfast: boolean; lunch: boolean; dinner: boolean; exercise: boolean } };
}

const WeeklyExercises: React.FC<WeeklyExercisesProps> = ({ 
  moduleContent, 
  currentDay, 
  onDayChange,
  onDayUpdate,
  dayCompletions = {}
}) => {
  const [viewStartDay, setViewStartDay] = useState(Math.max(1, currentDay - 3));
  
  // Asegurar que dayCompletions siempre sea un objeto
  const safeDayCompletions = dayCompletions || {};

  if (!moduleContent || !moduleContent.days || moduleContent.days.length === 0) {
    return (
      <EmptyState>
        <FiActivity />
        <h4>No hay ejercicios disponibles</h4>
        <p>Los ejercicios se generarán con tu plan mensual</p>
      </EmptyState>
    );
  }

  // Obtener los días de la semana actual (7 días a partir del día de inicio de vista)
  const weekStart = viewStartDay;
  const weekEnd = Math.min(30, weekStart + 6);
  const weekDays = moduleContent.days.filter((day: DailyContent) => 
    day.dayNumber >= weekStart && day.dayNumber <= weekEnd
  );

  const handlePreviousWeek = () => {
    const newStart = Math.max(1, viewStartDay - 7);
    setViewStartDay(newStart);
    if (onDayChange) {
      onDayChange(newStart + 3); // Centrar en el día medio de la semana
    }
  };

  const handleNextWeek = () => {
    const newStart = Math.min(24, viewStartDay + 7); // Máximo día 24 para mostrar días 24-30
    setViewStartDay(newStart);
    if (onDayChange) {
      onDayChange(newStart + 3); // Centrar en el día medio de la semana
    }
  };

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <ExercisesContainer>
      <WeekHeader>
        <FiActivity />
        <h3>Ejercicios de la Semana</h3>
        <InfoBadge>
          <FiCalendar />
          Días {weekStart}-{weekEnd}
        </InfoBadge>
      </WeekHeader>

      <NavigationContainer>
        <NavigationButton 
          onClick={handlePreviousWeek}
          disabled={weekStart <= 1}
        >
          <FiChevronLeft />
          Anterior
        </NavigationButton>
        <WeekIndicator>
          <div className="week-number">
            Semana {Math.ceil(weekStart / 7)}
          </div>
          <div className="week-label">
            de {Math.ceil(30 / 7)} semanas
          </div>
        </WeekIndicator>
        <NavigationButton 
          onClick={handleNextWeek}
          disabled={weekEnd >= 30}
        >
          Siguiente
          <FiChevronRight />
        </NavigationButton>
      </NavigationContainer>

      {weekDays.map((day: DailyContent) => {
        if (!day.exercise) return null;
        
        const exercise = day.exercise;
        const date = new Date();
        date.setDate(date.getDate() + (day.dayNumber - currentDay));
        const dayName = dayNames[date.getDay()];
        
        const dayCompletion = safeDayCompletions[day.dayNumber] || { 
          breakfast: false, 
          lunch: false, 
          dinner: false, 
          exercise: false 
        };
        const isDayComplete = dayCompletion.breakfast && 
                              dayCompletion.lunch && 
                              dayCompletion.dinner && 
                              dayCompletion.exercise;

        const handleCompleteDay = () => {
          if (!onDayUpdate) return;
          
          const newState = !isDayComplete;
          // Marcar todas las comidas y el ejercicio
          onDayUpdate(day.dayNumber, 'breakfast', newState);
          onDayUpdate(day.dayNumber, 'lunch', newState);
          onDayUpdate(day.dayNumber, 'dinner', newState);
          onDayUpdate(day.dayNumber, 'exercise', newState);
        };

        return (
          <ExerciseCard key={day.dayNumber} isCompleted={isDayComplete}>
            <ExerciseHeader>
              <div className="exercise-title">
                <FiActivity />
                <h4>{exercise.name}</h4>
              </div>
              <ExerciseInfo>
                <InfoBadge>
                  <FiTarget />
                  Día {day.dayNumber} - {dayName}
                </InfoBadge>
                <InfoBadge>
                  <FiClock />
                  {exercise.duration} min
                </InfoBadge>
              </ExerciseInfo>
            </ExerciseHeader>
            
            <ExerciseDescription>{exercise.description}</ExerciseDescription>
            
            {exercise.instructions && exercise.instructions.length > 0 && (
              <ExerciseSection>
                <h5>
                  <FiTarget />
                  Instrucciones del Ejercicio
                </h5>
                <ExerciseInstructions>
                  {exercise.instructions.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ExerciseInstructions>
              </ExerciseSection>
            )}
            
            {exercise.equipment && exercise.equipment.length > 0 && (
              <ExerciseSection>
                <h5>
                  <FiTarget />
                  Equipamiento Necesario
                </h5>
                <EquipmentList>
                  {exercise.equipment.map((item: string, index: number) => (
                    <EquipmentTag key={index}>{item}</EquipmentTag>
                  ))}
                </EquipmentList>
              </ExerciseSection>
            )}
            
            {exercise.recommendations && exercise.recommendations.length > 0 && (
              <RecommendationsBox>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: theme.colors.primaryDark }}>
                  💡 Recomendaciones
                </h5>
                <ExerciseInstructions>
                  {exercise.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ExerciseInstructions>
              </RecommendationsBox>
            )}
            
            <CompleteDayButton 
              completed={isDayComplete}
              onClick={handleCompleteDay}
            >
              <FiCheckCircle />
              {isDayComplete ? 'Día Completado ✓' : 'Marcar Día Completo'}
            </CompleteDayButton>
          </ExerciseCard>
        );
      })}
    </ExercisesContainer>
  );
};

export default WeeklyExercises;

