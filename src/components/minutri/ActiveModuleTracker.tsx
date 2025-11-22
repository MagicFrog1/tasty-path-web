import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiCircle, FiCoffee, FiActivity, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { theme } from '../../styles/theme';

const TrackerContainer = styled.div`
  display: grid;
  gap: 24px;
`;

const ProgressCard = styled.div`
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
  text-align: center;
`;

const ProgressTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(46, 139, 87, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  position: relative;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
  border-radius: 8px;
  transition: width 0.5s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  
  strong {
    color: ${theme.colors.primaryDark};
    font-weight: 700;
    font-size: 24px;
  }
`;

const TrackingSection = styled.div`
  display: grid;
  gap: 20px;
`;

const DayCard = styled.div`
  padding: 20px;
  border-radius: 16px;
  background: ${theme.colors.white};
  border: 1.5px solid rgba(46, 139, 87, 0.1);
  box-shadow: ${theme.shadows.sm};
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(46, 139, 87, 0.1);
`;

const DayTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CheckboxGroup = styled.div`
  display: grid;
  gap: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(46, 139, 87, 0.08);
  }
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: ${theme.colors.primary};
  }
  
  span {
    flex: 1;
    font-size: 15px;
    color: ${theme.colors.textPrimary};
    font-weight: 500;
  }
  
  svg {
    color: ${theme.colors.primary};
    font-size: 18px;
  }
`;

interface DayTracking {
  day: number;
  date: string;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  exercise: boolean;
}

interface ActiveModuleTrackerProps {
  moduleTitle: string;
  currentDay: number;
  totalDays: number;
  adherence: number;
  days: DayTracking[];
  onUpdate: (day: number, type: 'breakfast' | 'lunch' | 'dinner' | 'exercise', checked: boolean) => void;
}

const ActiveModuleTracker: React.FC<ActiveModuleTrackerProps> = ({
  moduleTitle,
  currentDay,
  totalDays,
  adherence,
  days,
  onUpdate,
}) => {
  const today = days.find(d => d.day === currentDay) || days[0];

  return (
    <TrackerContainer>
      <ProgressCard>
        <ProgressTitle>
          <FiCalendar />
          Día {currentDay} de {totalDays}
        </ProgressTitle>
        <ProgressBar>
          <ProgressFill percentage={(currentDay / totalDays) * 100} />
        </ProgressBar>
        <ProgressText>
          <span>Progreso del Módulo</span>
          <strong>{Math.round((currentDay / totalDays) * 100)}%</strong>
        </ProgressText>
      </ProgressCard>

      <ProgressCard>
        <ProgressTitle>
          <FiTrendingUp />
          Adherencia al Plan
        </ProgressTitle>
        <ProgressBar>
          <ProgressFill percentage={adherence} />
        </ProgressBar>
        <ProgressText>
          <span>Objetivos Cumplidos</span>
          <strong>{adherence}%</strong>
        </ProgressText>
      </ProgressCard>

      <TrackingSection>
        <DayCard>
          <DayHeader>
            <DayTitle>
              <FiCalendar />
              {today.date}
            </DayTitle>
          </DayHeader>
          
          <CheckboxGroup>
            <CheckboxItem>
              <input
                type="checkbox"
                checked={today.meals.breakfast}
                onChange={(e) => onUpdate(today.day, 'breakfast', e.target.checked)}
              />
              <FiCoffee />
              <span>Desayuno completado</span>
              {today.meals.breakfast && <FiCheckCircle />}
            </CheckboxItem>
            
            <CheckboxItem>
              <input
                type="checkbox"
                checked={today.meals.lunch}
                onChange={(e) => onUpdate(today.day, 'lunch', e.target.checked)}
              />
              <FiCoffee />
              <span>Almuerzo completado</span>
              {today.meals.lunch && <FiCheckCircle />}
            </CheckboxItem>
            
            <CheckboxItem>
              <input
                type="checkbox"
                checked={today.meals.dinner}
                onChange={(e) => onUpdate(today.day, 'dinner', e.target.checked)}
              />
              <FiCoffee />
              <span>Cena completada</span>
              {today.meals.dinner && <FiCheckCircle />}
            </CheckboxItem>
            
            <CheckboxItem>
              <input
                type="checkbox"
                checked={today.exercise}
                onChange={(e) => onUpdate(today.day, 'exercise', e.target.checked)}
              />
              <FiActivity />
              <span>Ejercicio completado</span>
              {today.exercise && <FiCheckCircle />}
            </CheckboxItem>
          </CheckboxGroup>
        </DayCard>
      </TrackingSection>
    </TrackerContainer>
  );
};

export default ActiveModuleTracker;

