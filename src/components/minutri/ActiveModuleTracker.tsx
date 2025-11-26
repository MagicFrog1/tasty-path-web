import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiCoffee, FiActivity, FiCalendar, FiTrendingUp, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { DailyMeal, DailyExercise } from '../../services/minutriContentService';

const TrackerContainer = styled.div`
  display: grid;
  gap: 20px;
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProgressCard = styled.div`
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
  text-align: center;
`;

const ProgressTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  svg {
    font-size: 18px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: rgba(46, 139, 87, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin: 12px 0;
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
  margin-top: 8px;
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  
  strong {
    color: ${theme.colors.primaryDark};
    font-weight: 700;
    font-size: 20px;
  }
`;

const DayCard = styled.div`
  padding: 20px;
  border-radius: 16px;
  background: ${theme.colors.white};
  border: 1.5px solid rgba(46, 139, 87, 0.1);
  box-shadow: ${theme.shadows.sm};
  margin-bottom: 16px;
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(46, 139, 87, 0.1);
`;

const DayTitle = styled.h4`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MealSection = styled.div`
  margin-bottom: 20px;
`;

const MealHeader = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%)'
    : 'rgba(46, 139, 87, 0.03)'};
  border: 1.5px solid ${props => props.completed 
    ? 'rgba(46, 139, 87, 0.3)'
    : 'rgba(46, 139, 87, 0.1)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.completed 
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.15) 0%, rgba(34, 197, 94, 0.12) 100%)'
      : 'rgba(46, 139, 87, 0.08)'};
  }
`;

const MealCheckbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${theme.colors.primary};
  flex-shrink: 0;
`;

const MealInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${theme.colors.primary};
    font-size: 20px;
    flex-shrink: 0;
  }
`;

const MealTitle = styled.div`
  flex: 1;
  
  h5 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }
  
  p {
    margin: 0;
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    line-height: 1.4;
  }
`;

const MealDetails = styled.div<{ expanded: boolean }>`
  max-height: ${props => props.expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-top: 12px;
  padding: ${props => props.expanded ? '16px' : '0'};
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.03);
  border: ${props => props.expanded ? '1px solid rgba(46, 139, 87, 0.1)' : 'none'};
`;

const DetailSection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h6 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
    
    li {
      margin-bottom: 4px;
    }
  }
  
  p {
    margin: 0;
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const NutritionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(46, 139, 87, 0.1);
  font-size: 12px;
  color: ${theme.colors.primaryDark};
  font-weight: 600;
  margin-right: 8px;
  margin-top: 4px;
`;

const ExerciseSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(46, 139, 87, 0.1);
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
  dailyContent?: {
    meals: {
      breakfast: DailyMeal;
      lunch: DailyMeal;
      dinner: DailyMeal;
    };
    exercise: DailyExercise;
  };
  onUpdate: (day: number, type: 'breakfast' | 'lunch' | 'dinner' | 'exercise', checked: boolean) => void;
}

const ActiveModuleTracker: React.FC<ActiveModuleTrackerProps> = ({
  moduleTitle,
  currentDay,
  totalDays,
  adherence,
  days,
  dailyContent,
  onUpdate,
}) => {
  const [expandedMeals, setExpandedMeals] = useState<{ [key: string]: boolean }>({});
  const today = days.find(d => d.day === currentDay) || days[0];

  const toggleMeal = (mealType: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType],
    }));
  };

  const meals = dailyContent?.meals || {
    breakfast: {
      id: 'breakfast',
      name: 'Desayuno del día',
      description: 'Desayuno nutritivo para comenzar el día',
      ingredients: ['Ingrediente 1', 'Ingrediente 2'],
      preparation: 'Preparación detallada',
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      time: 'Desayuno',
    },
    lunch: {
      id: 'lunch',
      name: 'Almuerzo del día',
      description: 'Almuerzo balanceado',
      ingredients: ['Ingrediente 1', 'Ingrediente 2'],
      preparation: 'Preparación detallada',
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      time: 'Almuerzo',
    },
    dinner: {
      id: 'dinner',
      name: 'Cena del día',
      description: 'Cena ligera y nutritiva',
      ingredients: ['Ingrediente 1', 'Ingrediente 2'],
      preparation: 'Preparación detallada',
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      time: 'Cena',
    },
  };

  const exercise = dailyContent?.exercise || {
    id: 'exercise',
    name: 'Ejercicio del día',
    type: 'mixed',
    duration: 30,
    description: 'Ejercicio para mantenerte activo',
    instructions: ['Instrucción 1', 'Instrucción 2'],
    recommendations: ['Recomendación 1'],
  };

  return (
    <TrackerContainer>
      <ProgressGrid>
        <ProgressCard>
          <ProgressTitle>
            <FiCalendar />
            Progreso
          </ProgressTitle>
          <ProgressBar>
            <ProgressFill percentage={(currentDay / totalDays) * 100} />
          </ProgressBar>
          <ProgressText>
            <span>Día {currentDay} de {totalDays}</span>
            <strong>{Math.round((currentDay / totalDays) * 100)}%</strong>
          </ProgressText>
        </ProgressCard>

        <ProgressCard>
          <ProgressTitle>
            <FiTrendingUp />
            Adherencia
          </ProgressTitle>
          <ProgressBar>
            <ProgressFill percentage={adherence} />
          </ProgressBar>
          <ProgressText>
            <span>Objetivos Cumplidos</span>
            <strong>{adherence}%</strong>
          </ProgressText>
        </ProgressCard>
      </ProgressGrid>

      <DayCard>
        <DayHeader>
          <DayTitle>
            <FiCalendar />
            {today.date}
          </DayTitle>
        </DayHeader>

        <MealSection>
          <MealHeader
            completed={today.meals.breakfast}
            onClick={() => toggleMeal('breakfast')}
          >
            <MealCheckbox
              type="checkbox"
              checked={today.meals.breakfast}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate(today.day, 'breakfast', e.target.checked);
              }}
            />
            <MealInfo>
              <FiCoffee />
              <MealTitle>
                <h5>
                  {meals.breakfast.name}
                  {today.meals.breakfast && <FiCheckCircle style={{ marginLeft: '8px', color: theme.colors.primary }} />}
                </h5>
                <p>{meals.breakfast.description}</p>
              </MealTitle>
            </MealInfo>
            {expandedMeals.breakfast ? <FiChevronUp /> : <FiChevronDown />}
          </MealHeader>
          <MealDetails expanded={expandedMeals.breakfast}>
            <DetailSection>
              <h6><FiInfo /> Ingredientes</h6>
              <ul>
                {meals.breakfast.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </DetailSection>
            <DetailSection>
              <h6><FiInfo /> Preparación</h6>
              <p>{meals.breakfast.preparation}</p>
            </DetailSection>
            <DetailSection>
              <h6><FiInfo /> Información Nutricional</h6>
              <div>
                <NutritionBadge>{meals.breakfast.nutrition.calories} kcal</NutritionBadge>
                <NutritionBadge>{meals.breakfast.nutrition.protein}g proteína</NutritionBadge>
                <NutritionBadge>{meals.breakfast.nutrition.carbs}g carbohidratos</NutritionBadge>
                <NutritionBadge>{meals.breakfast.nutrition.fat}g grasas</NutritionBadge>
              </div>
            </DetailSection>
          </MealDetails>
        </MealSection>

        <MealSection>
          <MealHeader
            completed={today.meals.lunch}
            onClick={() => toggleMeal('lunch')}
          >
            <MealCheckbox
              type="checkbox"
              checked={today.meals.lunch}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate(today.day, 'lunch', e.target.checked);
              }}
            />
            <MealInfo>
              <FiCoffee />
              <MealTitle>
                <h5>
                  {meals.lunch.name}
                  {today.meals.lunch && <FiCheckCircle style={{ marginLeft: '8px', color: theme.colors.primary }} />}
                </h5>
                <p>{meals.lunch.description}</p>
              </MealTitle>
            </MealInfo>
            {expandedMeals.lunch ? <FiChevronUp /> : <FiChevronDown />}
          </MealHeader>
          <MealDetails expanded={expandedMeals.lunch}>
            <DetailSection>
              <h6><FiInfo /> Ingredientes</h6>
              <ul>
                {meals.lunch.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </DetailSection>
            <DetailSection>
              <h6><FiInfo /> Preparación</h6>
              <p>{meals.lunch.preparation}</p>
            </DetailSection>
            <DetailSection>
              <h6><FiInfo /> Información Nutricional</h6>
              <div>
                <NutritionBadge>{meals.lunch.nutrition.calories} kcal</NutritionBadge>
                <NutritionBadge>{meals.lunch.nutrition.protein}g proteína</NutritionBadge>
                <NutritionBadge>{meals.lunch.nutrition.carbs}g carbohidratos</NutritionBadge>
                <NutritionBadge>{meals.lunch.nutrition.fat}g grasas</NutritionBadge>
              </div>
            </DetailSection>
          </MealDetails>
        </MealSection>

        <MealSection>
          <MealHeader
            completed={today.meals.dinner}
            onClick={() => toggleMeal('dinner')}
          >
            <MealCheckbox
              type="checkbox"
              checked={today.meals.dinner}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate(today.day, 'dinner', e.target.checked);
              }}
            />
            <MealInfo>
              <FiCoffee />
              <MealTitle>
                <h5>
                  {meals.dinner.name}
                  {today.meals.dinner && <FiCheckCircle style={{ marginLeft: '8px', color: theme.colors.primary }} />}
                </h5>
                <p>{meals.dinner.description}</p>
              </MealTitle>
            </MealInfo>
            {expandedMeals.dinner ? <FiChevronUp /> : <FiChevronDown />}
          </MealHeader>
          <MealDetails expanded={expandedMeals.dinner}>
            <DetailSection>
              <h6><FiInfo /> Ingredientes</h6>
              <ul>
                {meals.dinner.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </DetailSection>
            <DetailSection>
              <h6><FiInfo /> Preparación</h6>
              <p>{meals.dinner.preparation}</p>
            </DetailSection>
            <DetailSection>
              <h6><FiInfo /> Información Nutricional</h6>
              <div>
                <NutritionBadge>{meals.dinner.nutrition.calories} kcal</NutritionBadge>
                <NutritionBadge>{meals.dinner.nutrition.protein}g proteína</NutritionBadge>
                <NutritionBadge>{meals.dinner.nutrition.carbs}g carbohidratos</NutritionBadge>
                <NutritionBadge>{meals.dinner.nutrition.fat}g grasas</NutritionBadge>
              </div>
            </DetailSection>
          </MealDetails>
        </MealSection>

        <ExerciseSection>
          <MealHeader
            completed={today.exercise}
            onClick={() => toggleMeal('exercise')}
          >
            <MealCheckbox
              type="checkbox"
              checked={today.exercise}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate(today.day, 'exercise', e.target.checked);
              }}
            />
            <MealInfo>
              <FiActivity />
              <MealTitle>
                <h5>
                  {exercise.name}
                  {today.exercise && <FiCheckCircle style={{ marginLeft: '8px', color: theme.colors.primary }} />}
                </h5>
                <p>{exercise.description} • {exercise.duration} minutos</p>
              </MealTitle>
            </MealInfo>
            {expandedMeals.exercise ? <FiChevronUp /> : <FiChevronDown />}
          </MealHeader>
          <MealDetails expanded={expandedMeals.exercise}>
            <DetailSection>
              <h6><FiInfo /> Instrucciones</h6>
              <ul>
                {exercise.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            </DetailSection>
            {exercise.equipment && exercise.equipment.length > 0 && (
              <DetailSection>
                <h6><FiInfo /> Equipamiento</h6>
                <p>{exercise.equipment.join(', ')}</p>
              </DetailSection>
            )}
            <DetailSection>
              <h6><FiInfo /> Recomendaciones</h6>
              <ul>
                {exercise.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </DetailSection>
          </MealDetails>
        </ExerciseSection>
      </DayCard>
    </TrackerContainer>
  );
};

export default ActiveModuleTracker;
