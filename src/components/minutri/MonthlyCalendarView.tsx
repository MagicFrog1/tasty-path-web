import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiCheckCircle, FiCoffee, FiActivity, FiInfo, FiCalendar } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { DailyContent } from '../../services/minutriContentService';

const CalendarContainer = styled.div`
  display: grid;
  gap: 24px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
`;

const MonthTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const NavButton = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  background: ${theme.colors.white};
  border: 1.5px solid rgba(46, 139, 87, 0.2);
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(46, 139, 87, 0.1);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
  background: ${theme.colors.white};
  border-radius: 10px;
  padding: 4px;
  border: 1.5px solid rgba(46, 139, 87, 0.2);
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.active 
    ? `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%)`
    : 'transparent'};
  color: ${props => props.active ? 'white' : theme.colors.textSecondary};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active 
      ? `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%)`
      : 'rgba(46, 139, 87, 0.1)'};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  background: ${theme.colors.white};
  border-radius: 20px;
  padding: 20px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);
`;

const DayHeader = styled.div`
  text-align: center;
  padding: 12px 8px;
  font-weight: 700;
  font-size: 14px;
  color: ${theme.colors.primaryDark};
  border-bottom: 2px solid rgba(46, 139, 87, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DayCell = styled.div<{ isToday: boolean; isEmpty: boolean }>`
  min-height: 120px;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid ${props => props.isToday 
    ? theme.colors.primary 
    : 'rgba(46, 139, 87, 0.1)'};
  background: ${props => {
    if (props.isEmpty) return 'rgba(0, 0, 0, 0.02)';
    if (props.isToday) return 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)';
    return theme.colors.white;
  }};
  cursor: ${props => props.isEmpty ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    ${props => !props.isEmpty && `
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.sm};
      border-color: ${theme.colors.primary};
    `}
  }
`;

const DayNumber = styled.div<{ isToday: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.isToday ? theme.colors.primary : theme.colors.primaryDark};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DayContent = styled.div`
  display: grid;
  gap: 6px;
`;

const MealPreview = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  background: ${props => props.completed 
    ? 'rgba(46, 139, 87, 0.1)'
    : 'rgba(46, 139, 87, 0.05)'};
  font-size: 11px;
  color: ${theme.colors.textSecondary};
  
  svg {
    font-size: 12px;
    color: ${props => props.completed ? theme.colors.primary : theme.colors.textSecondary};
    flex-shrink: 0;
  }
  
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ExercisePreview = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  background: ${props => props.completed 
    ? 'rgba(46, 139, 87, 0.1)'
    : 'rgba(46, 139, 87, 0.05)'};
  font-size: 11px;
  color: ${theme.colors.textSecondary};
  
  svg {
    font-size: 12px;
    color: ${props => props.completed ? theme.colors.primary : theme.colors.textSecondary};
    flex-shrink: 0;
  }
  
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const DayExpanded = styled.div<{ expanded: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: ${props => props.expanded ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
`;

const ExpandedContent = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  box-shadow: ${theme.shadows.lg};
  position: relative;
  
  @media (max-width: 768px) {
    padding: 24px;
    max-height: 95vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(46, 139, 87, 0.1);
  color: ${theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(46, 139, 87, 0.2);
    transform: scale(1.1);
  }
`;

const ExpandedDayHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(46, 139, 87, 0.1);
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    font-size: 15px;
  }
`;

const MealSection = styled.div`
  margin-bottom: 24px;
`;

const MealHeader = styled.div<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.12) 0%, rgba(34, 197, 94, 0.08) 100%)'
    : 'rgba(46, 139, 87, 0.05)'};
  border: 1.5px solid ${props => props.completed 
    ? 'rgba(46, 139, 87, 0.3)'
    : 'rgba(46, 139, 87, 0.1)'};
  margin-bottom: 16px;
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
  
  h4 {
    margin: 0 0 6px 0;
    font-size: 18px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: ${theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

const MealDetails = styled.div<{ expanded: boolean }>`
  max-height: ${props => props.expanded ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-top: 12px;
  padding: ${props => props.expanded ? '20px' : '0'};
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.03);
  border: ${props => props.expanded ? '1px solid rgba(46, 139, 87, 0.1)' : 'none'};
`;

const DetailSection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h5 {
    margin: 0 0 10px 0;
    font-size: 15px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  ul {
    margin: 0;
    padding-left: 24px;
    font-size: 14px;
    color: ${theme.colors.textSecondary};
    line-height: 1.8;
    
    li {
      margin-bottom: 6px;
    }
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: ${theme.colors.textSecondary};
    line-height: 1.8;
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const NutritionBadge = styled.div`
  padding: 10px;
  border-radius: 10px;
  background: rgba(46, 139, 87, 0.1);
  text-align: center;
  
  strong {
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    margin-bottom: 4px;
  }
  
  span {
    font-size: 12px;
    color: ${theme.colors.textSecondary};
  }
`;

const ExerciseSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid rgba(46, 139, 87, 0.1);
`;

interface MonthlyCalendarViewProps {
  monthNumber: number;
  totalMonths: number;
  days: DailyContent[];
  onDayUpdate: (dayNumber: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'exercise', completed: boolean) => void;
  dayCompletions: { [dayNumber: number]: { breakfast: boolean; lunch: boolean; dinner: boolean; exercise: boolean } };
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  monthNumber,
  totalMonths,
  days,
  onDayUpdate,
  dayCompletions,
  onMonthChange,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<{ [key: string]: boolean }>({});

  const weekDays = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + (monthNumber - 1));
  const currentMonth = startDate.getMonth();
  const currentYear = startDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Lunes = 0
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  const toggleMeal = (mealKey: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey],
    }));
  };

  const getDayContent = (dayNumber: number): DailyContent | null => {
    return days.find(d => d.dayNumber === dayNumber) || null;
  };

  const renderCalendarDays = () => {
    const calendarDays: Array<{ day: number | null; isToday: boolean }> = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push({ day: null, isToday: false });
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      calendarDays.push({ day, isToday });
    }
    
    return calendarDays;
  };

  const handleDayClick = (day: number) => {
    setExpandedDay(day);
  };

  const selectedDayContent = expandedDay ? getDayContent(expandedDay) : null;
  const selectedDayCompletions = expandedDay ? dayCompletions[expandedDay] : null;

  return (
    <CalendarContainer>
      <CalendarHeader>
        <MonthTitle>
          <FiCalendar />
          Calendario {monthNumber} mes {totalMonths > 1 ? `de ${totalMonths}` : ''}
        </MonthTitle>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ViewToggle>
            <ViewButton active={viewMode === 'month'} onClick={() => setViewMode('month')}>
              Mes
            </ViewButton>
            <ViewButton active={viewMode === 'week'} onClick={() => setViewMode('week')}>
              Semana
            </ViewButton>
          </ViewToggle>
          <NavigationButtons>
            <NavButton 
              disabled={monthNumber === 1}
              onClick={() => {
                if (monthNumber > 1 && onMonthChange) {
                  onMonthChange(monthNumber - 1);
                }
              }}
            >
              <FiChevronLeft />
              Anterior
            </NavButton>
            <NavButton 
              disabled={monthNumber === totalMonths}
              onClick={() => {
                if (monthNumber < totalMonths && onMonthChange) {
                  onMonthChange(monthNumber + 1);
                }
              }}
            >
              Siguiente
              <FiChevronRight />
            </NavButton>
          </NavigationButtons>
        </div>
      </CalendarHeader>

      <CalendarGrid>
        {weekDays.map(day => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}
        
        {renderCalendarDays().map((cell, index) => {
          if (cell.day === null) {
            return <DayCell key={index} isToday={false} isEmpty={true} />;
          }
          
          const dayContent = getDayContent(cell.day);
          const completions = dayCompletions[cell.day] || { breakfast: false, lunch: false, dinner: false, exercise: false };
          
          return (
            <DayCell
              key={index}
              isToday={cell.isToday}
              isEmpty={false}
              onClick={() => handleDayClick(cell.day!)}
            >
              <DayNumber isToday={cell.isToday}>
                <span>{cell.day}</span>
                {cell.isToday && (
                  <span style={{ fontSize: '10px', color: theme.colors.primary }}>HOY</span>
                )}
              </DayNumber>
              
              {dayContent && (
                <DayContent>
                  <MealPreview completed={completions.breakfast}>
                    <FiCoffee />
                    <span>{dayContent.meals.breakfast.name}</span>
                    {completions.breakfast && <FiCheckCircle />}
                  </MealPreview>
                  
                  <MealPreview completed={completions.lunch}>
                    <FiCoffee />
                    <span>{dayContent.meals.lunch.name}</span>
                    {completions.lunch && <FiCheckCircle />}
                  </MealPreview>
                  
                  <MealPreview completed={completions.dinner}>
                    <FiCoffee />
                    <span>{dayContent.meals.dinner.name}</span>
                    {completions.dinner && <FiCheckCircle />}
                  </MealPreview>
                  
                  <ExercisePreview completed={completions.exercise}>
                    <FiActivity />
                    <span>{dayContent.exercise.name}</span>
                    {completions.exercise && <FiCheckCircle />}
                  </ExercisePreview>
                </DayContent>
              )}
            </DayCell>
          );
        })}
      </CalendarGrid>

      {expandedDay && selectedDayContent && (
        <DayExpanded expanded={true} onClick={(e) => {
          if (e.target === e.currentTarget) {
            setExpandedDay(null);
          }
        }}>
          <ExpandedContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setExpandedDay(null)}>
              ×
            </CloseButton>
            
            <ExpandedDayHeader>
              <h3>
                <FiCalendar />
                Día {expandedDay} - {selectedDayContent.date}
              </h3>
              <p>Plan completo del día con comidas y ejercicio detallados</p>
            </ExpandedDayHeader>

            <MealSection>
              <MealHeader
                completed={selectedDayCompletions?.breakfast || false}
                onClick={() => toggleMeal(`breakfast-${expandedDay}`)}
              >
                <MealCheckbox
                  type="checkbox"
                  checked={selectedDayCompletions?.breakfast || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    onDayUpdate(expandedDay, 'breakfast', e.target.checked);
                  }}
                />
                <MealInfo>
                  <h4>
                    <FiCoffee />
                    {selectedDayContent.meals.breakfast.name}
                    {selectedDayCompletions?.breakfast && <FiCheckCircle style={{ color: theme.colors.primary }} />}
                  </h4>
                  <p>{selectedDayContent.meals.breakfast.description}</p>
                </MealInfo>
                {expandedMeals[`breakfast-${expandedDay}`] ? <FiChevronUp /> : <FiChevronDown />}
              </MealHeader>
              <MealDetails expanded={expandedMeals[`breakfast-${expandedDay}`] || false}>
                <DetailSection>
                  <h5><FiInfo /> Ingredientes</h5>
                  <ul>
                    {selectedDayContent.meals.breakfast.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </DetailSection>
                <DetailSection>
                  <h5><FiInfo /> Método de Preparación</h5>
                  <p>{selectedDayContent.meals.breakfast.preparation}</p>
                </DetailSection>
                <DetailSection>
                  <h5><FiInfo /> Información Nutricional</h5>
                  <NutritionGrid>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.breakfast.nutrition.calories}</strong>
                      <span>kcal</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.breakfast.nutrition.protein}g</strong>
                      <span>Proteína</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.breakfast.nutrition.carbs}g</strong>
                      <span>Carbohidratos</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.breakfast.nutrition.fat}g</strong>
                      <span>Grasas</span>
                    </NutritionBadge>
                  </NutritionGrid>
                </DetailSection>
              </MealDetails>
            </MealSection>

            <MealSection>
              <MealHeader
                completed={selectedDayCompletions?.lunch || false}
                onClick={() => toggleMeal(`lunch-${expandedDay}`)}
              >
                <MealCheckbox
                  type="checkbox"
                  checked={selectedDayCompletions?.lunch || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    onDayUpdate(expandedDay, 'lunch', e.target.checked);
                  }}
                />
                <MealInfo>
                  <h4>
                    <FiCoffee />
                    {selectedDayContent.meals.lunch.name}
                    {selectedDayCompletions?.lunch && <FiCheckCircle style={{ color: theme.colors.primary }} />}
                  </h4>
                  <p>{selectedDayContent.meals.lunch.description}</p>
                </MealInfo>
                {expandedMeals[`lunch-${expandedDay}`] ? <FiChevronUp /> : <FiChevronDown />}
              </MealHeader>
              <MealDetails expanded={expandedMeals[`lunch-${expandedDay}`] || false}>
                <DetailSection>
                  <h5><FiInfo /> Ingredientes</h5>
                  <ul>
                    {selectedDayContent.meals.lunch.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </DetailSection>
                <DetailSection>
                  <h5><FiInfo /> Método de Preparación</h5>
                  <p>{selectedDayContent.meals.lunch.preparation}</p>
                </DetailSection>
                <DetailSection>
                  <h5><FiInfo /> Información Nutricional</h5>
                  <NutritionGrid>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.lunch.nutrition.calories}</strong>
                      <span>kcal</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.lunch.nutrition.protein}g</strong>
                      <span>Proteína</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.lunch.nutrition.carbs}g</strong>
                      <span>Carbohidratos</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.lunch.nutrition.fat}g</strong>
                      <span>Grasas</span>
                    </NutritionBadge>
                  </NutritionGrid>
                </DetailSection>
              </MealDetails>
            </MealSection>

            <MealSection>
              <MealHeader
                completed={selectedDayCompletions?.dinner || false}
                onClick={() => toggleMeal(`dinner-${expandedDay}`)}
              >
                <MealCheckbox
                  type="checkbox"
                  checked={selectedDayCompletions?.dinner || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    onDayUpdate(expandedDay, 'dinner', e.target.checked);
                  }}
                />
                <MealInfo>
                  <h4>
                    <FiCoffee />
                    {selectedDayContent.meals.dinner.name}
                    {selectedDayCompletions?.dinner && <FiCheckCircle style={{ color: theme.colors.primary }} />}
                  </h4>
                  <p>{selectedDayContent.meals.dinner.description}</p>
                </MealInfo>
                {expandedMeals[`dinner-${expandedDay}`] ? <FiChevronUp /> : <FiChevronDown />}
              </MealHeader>
              <MealDetails expanded={expandedMeals[`dinner-${expandedDay}`] || false}>
                <DetailSection>
                  <h5><FiInfo /> Ingredientes</h5>
                  <ul>
                    {selectedDayContent.meals.dinner.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </DetailSection>
                <DetailSection>
                  <h5><FiInfo /> Método de Preparación</h5>
                  <p>{selectedDayContent.meals.dinner.preparation}</p>
                </DetailSection>
                <DetailSection>
                  <h5><FiInfo /> Información Nutricional</h5>
                  <NutritionGrid>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.dinner.nutrition.calories}</strong>
                      <span>kcal</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.dinner.nutrition.protein}g</strong>
                      <span>Proteína</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.dinner.nutrition.carbs}g</strong>
                      <span>Carbohidratos</span>
                    </NutritionBadge>
                    <NutritionBadge>
                      <strong>{selectedDayContent.meals.dinner.nutrition.fat}g</strong>
                      <span>Grasas</span>
                    </NutritionBadge>
                  </NutritionGrid>
                </DetailSection>
              </MealDetails>
            </MealSection>

            <ExerciseSection>
              <MealHeader
                completed={selectedDayCompletions?.exercise || false}
                onClick={() => toggleMeal(`exercise-${expandedDay}`)}
              >
                <MealCheckbox
                  type="checkbox"
                  checked={selectedDayCompletions?.exercise || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    onDayUpdate(expandedDay, 'exercise', e.target.checked);
                  }}
                />
                <MealInfo>
                  <h4>
                    <FiActivity />
                    {selectedDayContent.exercise.name}
                    {selectedDayCompletions?.exercise && <FiCheckCircle style={{ color: theme.colors.primary }} />}
                  </h4>
                  <p>{selectedDayContent.exercise.description} • {selectedDayContent.exercise.duration} minutos</p>
                </MealInfo>
                {expandedMeals[`exercise-${expandedDay}`] ? <FiChevronUp /> : <FiChevronDown />}
              </MealHeader>
              <MealDetails expanded={expandedMeals[`exercise-${expandedDay}`] || false}>
                <DetailSection>
                  <h5><FiInfo /> Instrucciones del Ejercicio</h5>
                  <ul>
                    {selectedDayContent.exercise.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ul>
                </DetailSection>
                {selectedDayContent.exercise.equipment && selectedDayContent.exercise.equipment.length > 0 && (
                  <DetailSection>
                    <h5><FiInfo /> Equipamiento Necesario</h5>
                    <p>{selectedDayContent.exercise.equipment.join(', ')}</p>
                  </DetailSection>
                )}
                <DetailSection>
                  <h5><FiInfo /> Recomendaciones</h5>
                  <ul>
                    {selectedDayContent.exercise.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </DetailSection>
              </MealDetails>
            </ExerciseSection>
          </ExpandedContent>
        </DayExpanded>
      )}
    </CalendarContainer>
  );
};

export default MonthlyCalendarView;

