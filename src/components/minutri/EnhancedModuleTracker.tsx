import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiCircle, FiCoffee, FiActivity, FiCalendar, FiTrendingUp, FiShoppingCart, FiClock, FiInfo } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { DayTracking, DailyMenu, ExercisePlan } from '../../services/minutriAIService';
import minutriAIService from '../../services/minutriAIService';

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
  height: 16px;
  background: rgba(46, 139, 87, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
  border-radius: 10px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 2px 8px rgba(46, 139, 87, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
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
    font-size: 28px;
  }
`;

const DayCard = styled.div`
  padding: 24px;
  border-radius: 16px;
  background: ${theme.colors.white};
  border: 1.5px solid rgba(46, 139, 87, 0.1);
  box-shadow: ${theme.shadows.sm};
  margin-bottom: 24px;
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(46, 139, 87, 0.1);
`;

const DayTitle = styled.h4`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MealCard = styled.div<{ completed: boolean }>`
  padding: 20px;
  border-radius: 12px;
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)'
    : 'rgba(46, 139, 87, 0.03)'};
  border: 1.5px solid ${props => props.completed 
    ? 'rgba(46, 139, 87, 0.3)'
    : 'rgba(46, 139, 87, 0.1)'};
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const MealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const MealTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const MealName = styled.h5`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
`;

const MealCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 24px;
    height: 24px;
    cursor: pointer;
    accent-color: ${theme.colors.primary};
  }
`;

const MealDescription = styled.p`
  margin: 0 0 12px 0;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  font-size: 14px;
`;

const MealDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(46, 139, 87, 0.05);
  border-radius: 8px;
`;

const DetailItem = styled.div`
  text-align: center;
  
  strong {
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }
  
  span {
    display: block;
    font-size: 12px;
    color: ${theme.colors.textSecondary};
    margin-top: 4px;
  }
`;

const IngredientsList = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(46, 139, 87, 0.1);
`;

const IngredientsTitle = styled.strong`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.primaryDark};
  margin-bottom: 8px;
`;

const Ingredients = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const IngredientTag = styled.span`
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(46, 139, 87, 0.1);
  color: ${theme.colors.primaryDark};
  font-size: 12px;
  font-weight: 500;
`;

const Instructions = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: rgba(46, 139, 87, 0.05);
  border-radius: 8px;
  border-left: 3px solid ${theme.colors.primary};
`;

const InstructionsTitle = styled.strong`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.primaryDark};
  margin-bottom: 8px;
`;

const InstructionsText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  white-space: pre-line;
`;

const ExerciseCard = styled.div<{ completed: boolean }>`
  padding: 20px;
  border-radius: 12px;
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)'
    : 'rgba(46, 139, 87, 0.03)'};
  border: 1.5px solid ${props => props.completed 
    ? 'rgba(46, 139, 87, 0.3)'
    : 'rgba(46, 139, 87, 0.1)'};
  margin-bottom: 16px;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ExerciseInfo = styled.div`
  flex: 1;
`;

const ExerciseName = styled.h5`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
`;

const ExerciseDescription = styled.p`
  margin: 0 0 12px 0;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  font-size: 14px;
`;

const ExerciseList = styled.div`
  margin-top: 16px;
`;

const ExerciseItem = styled.div`
  padding: 12px;
  background: rgba(46, 139, 87, 0.05);
  border-radius: 8px;
  margin-bottom: 12px;
  
  strong {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: ${theme.colors.primaryDark};
    margin-bottom: 6px;
  }
  
  p {
    margin: 0;
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    line-height: 1.5;
  }
  
  span {
    display: inline-block;
    margin-top: 8px;
    padding: 4px 8px;
    background: rgba(46, 139, 87, 0.1);
    border-radius: 6px;
    font-size: 12px;
    color: ${theme.colors.primaryDark};
    font-weight: 500;
  }
`;

const TipsList = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 8px;
  border-left: 3px solid rgba(251, 191, 36, 0.5);
`;

const TipsTitle = styled.strong`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.primaryDark};
  margin-bottom: 8px;
`;

const TipItem = styled.li`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 6px;
`;

const ShoppingListCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
  margin-top: 24px;
`;

const ShoppingListTitle = styled.h5`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 10px;
`;

interface EnhancedModuleTrackerProps {
  moduleTitle: string;
  currentDay: number;
  totalDays: number;
  adherence: number;
  days: DayTracking[];
  dailyMenu: DailyMenu | null;
  exercisePlan: ExercisePlan | null;
  onUpdate: (day: number, type: 'breakfast' | 'lunch' | 'dinner' | 'exercise', checked: boolean) => void;
}

const EnhancedModuleTracker: React.FC<EnhancedModuleTrackerProps> = ({
  moduleTitle,
  currentDay,
  totalDays,
  adherence,
  days,
  dailyMenu,
  exercisePlan,
  onUpdate,
}) => {
  const today = days.find(d => d.day === currentDay) || days[0];

  const getMealType = (type: string): 'breakfast' | 'lunch' | 'dinner' => {
    if (type === 'breakfast') return 'breakfast';
    if (type === 'lunch') return 'lunch';
    return 'dinner';
  };

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

      <DayCard>
        <DayHeader>
          <DayTitle>
            <FiCalendar />
            {today.date}
          </DayTitle>
        </DayHeader>

        {/* Comidas del día */}
        {dailyMenu && dailyMenu.meals.map((meal, index) => {
          const mealType = getMealType(meal.type);
          const isCompleted = today.meals[mealType];
          
          return (
            <MealCard key={meal.id} completed={isCompleted}>
              <MealHeader>
                <MealTitle>
                  <FiCoffee style={{ color: theme.colors.primary }} />
                  <MealName>
                    {meal.type === 'breakfast' ? 'Desayuno' : meal.type === 'lunch' ? 'Almuerzo' : 'Cena'}: {meal.name}
                  </MealName>
                </MealTitle>
                <MealCheckbox>
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => onUpdate(today.day, mealType, e.target.checked)}
                  />
                  {isCompleted && <FiCheckCircle style={{ color: theme.colors.primary }} />}
                </MealCheckbox>
              </MealHeader>
              
              <MealDescription>{meal.description}</MealDescription>
              
              <MealDetails>
                <DetailItem>
                  <strong>{meal.calories}</strong>
                  <span>Calorías</span>
                </DetailItem>
                <DetailItem>
                  <strong>{meal.protein}g</strong>
                  <span>Proteína</span>
                </DetailItem>
                <DetailItem>
                  <strong>{meal.carbs}g</strong>
                  <span>Carbohidratos</span>
                </DetailItem>
                <DetailItem>
                  <strong>{meal.fats}g</strong>
                  <span>Grasas</span>
                </DetailItem>
                <DetailItem>
                  <strong>{meal.prepTime} min</strong>
                  <span>Tiempo prep.</span>
                </DetailItem>
              </MealDetails>

              {meal.ingredients && meal.ingredients.length > 0 && (
                <IngredientsList>
                  <IngredientsTitle>Ingredientes:</IngredientsTitle>
                  <Ingredients>
                    {meal.ingredients.map((ing, i) => (
                      <IngredientTag key={i}>{ing}</IngredientTag>
                    ))}
                  </Ingredients>
                </IngredientsList>
              )}

              {meal.instructions && (
                <Instructions>
                  <InstructionsTitle>
                    <FiInfo style={{ marginRight: '6px' }} />
                    Instrucciones de Preparación:
                  </InstructionsTitle>
                  <InstructionsText>{meal.instructions}</InstructionsText>
                </Instructions>
              )}
            </MealCard>
          );
        })}

        {/* Ejercicio del día */}
        {exercisePlan && (
          <ExerciseCard completed={today.exercise}>
            <ExerciseHeader>
              <ExerciseInfo>
                <ExerciseName>
                  <FiActivity style={{ marginRight: '8px', color: theme.colors.primary }} />
                  {exercisePlan.name}
                </ExerciseName>
                <ExerciseDescription>{exercisePlan.description}</ExerciseDescription>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '14px', color: theme.colors.textSecondary }}>
                  <span><FiClock style={{ marginRight: '4px' }} />{exercisePlan.duration} minutos</span>
                  {exercisePlan.type === 'strength' && exercisePlan.equipment && (
                    <span>Equipo: {exercisePlan.equipment.join(', ')}</span>
                  )}
                </div>
              </ExerciseInfo>
              <MealCheckbox>
                <input
                  type="checkbox"
                  checked={today.exercise}
                  onChange={(e) => onUpdate(today.day, 'exercise', e.target.checked)}
                />
                {today.exercise && <FiCheckCircle style={{ color: theme.colors.primary }} />}
              </MealCheckbox>
            </ExerciseHeader>

            {exercisePlan.exercises && exercisePlan.exercises.length > 0 && (
              <ExerciseList>
                {exercisePlan.exercises.map((exercise, index) => (
                  <ExerciseItem key={index}>
                    <strong>{exercise.name}</strong>
                    <p>{exercise.description}</p>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>{exercise.sets} series</span>
                      <span>{exercise.reps} repeticiones</span>
                      {exercise.rest > 0 && <span>Descanso: {exercise.rest}s</span>}
                      {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                        <span>Músculos: {exercise.muscleGroups.join(', ')}</span>
                      )}
                    </div>
                  </ExerciseItem>
                ))}
              </ExerciseList>
            )}

            {exercisePlan.tips && exercisePlan.tips.length > 0 && (
              <TipsList>
                <TipsTitle>💡 Consejos:</TipsTitle>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {exercisePlan.tips.map((tip, index) => (
                    <TipItem key={index}>{tip}</TipItem>
                  ))}
                </ul>
              </TipsList>
            )}
          </ExerciseCard>
        )}
      </DayCard>

      {/* Lista de compras */}
      {dailyMenu && dailyMenu.shoppingList && dailyMenu.shoppingList.length > 0 && (
        <ShoppingListCard>
          <ShoppingListTitle>
            <FiShoppingCart />
            Lista de Compras para Hoy
          </ShoppingListTitle>
          <Ingredients>
            {dailyMenu.shoppingList.map((item, index) => (
              <IngredientTag key={index}>{item}</IngredientTag>
            ))}
          </Ingredients>
        </ShoppingListCard>
      )}
    </TrackerContainer>
  );
};

export default EnhancedModuleTracker;

