import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FiArrowLeft,
  FiCalendar,
  FiTarget,
  FiClock,
  FiCheckCircle,
  FiShoppingBag,
  FiTrendingUp,
  FiX,
  FiBook,
  FiCoffee,
  FiCheck,
} from 'react-icons/fi';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { theme } from '../styles/theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageWrapper = styled.div`
  display: grid;
  gap: 32px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 10px 16px;
  border-radius: 16px;
  border: 1px solid rgba(46, 139, 87, 0.25);
  background: rgba(255, 255, 255, 0.9);
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(46, 139, 87, 0.16);
  }
`;

const Header = styled.div`
  display: grid;
  gap: 18px;

  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 4vw, 2.8rem);
    color: ${theme.colors.textPrimary};
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    max-width: 720px;
    line-height: 1.7;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const SummaryCard = styled.div`
  display: grid;
  gap: 12px;
  padding: 24px;
  border-radius: 26px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(236, 253, 245, 0.9));
  border: 1px solid rgba(46, 139, 87, 0.16);
  box-shadow: 0 22px 52px rgba(46, 139, 87, 0.16);
`;

const SummaryLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(46, 139, 87, 0.85);

  svg {
    font-size: 18px;
  }
`;

const SummaryValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
`;

const ProgressWrapper = styled.div`
  display: grid;
  gap: 6px;
`;

const ProgressBar = styled.div<{ percentage: number }>`
  position: relative;
  height: 12px;
  border-radius: 999px;
  background: rgba(46, 139, 87, 0.12);
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    width: ${({ percentage }) => `${percentage}%`};
    background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
    border-radius: 999px;
    transition: width 0.4s ease;
  }
`;

const WeekGrid = styled.div`
  display: grid;
  gap: 22px;
`;

const WeekHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h2 {
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.2rem);
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
  }
`;

const DayGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const DayCard = styled.div<{ isChecked?: boolean }>`
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 26px;
  background: ${({ isChecked }) => (isChecked ? 'rgba(46, 139, 87, 0.05)' : 'rgba(255, 255, 255, 0.94)')};
  border: ${({ isChecked }) => (isChecked ? '2px solid rgba(46, 139, 87, 0.4)' : '1px solid rgba(46, 139, 87, 0.16)')};
  box-shadow: ${({ isChecked }) =>
    isChecked ? '0 18px 45px rgba(46, 139, 87, 0.2)' : '0 18px 45px rgba(46, 139, 87, 0.12)'};
  position: relative;
  transition: all 0.3s ease;
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 1.3rem;
    color: ${theme.colors.primaryDark};
    flex: 1;
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(46, 139, 87, 0.65);
  }
`;

const CheckInButton = styled.button<{ isChecked: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 2px solid ${({ isChecked }) => (isChecked ? theme.colors.primary : 'rgba(46, 139, 87, 0.3)')};
  background: ${({ isChecked }) =>
    isChecked
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.95) 0%, rgba(46, 139, 87, 0.85) 100%)'
      : 'rgba(255, 255, 255, 0.9)'};
  color: ${({ isChecked }) => (isChecked ? '#ffffff' : theme.colors.primary)};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ isChecked }) =>
    isChecked ? '0 4px 12px rgba(46, 139, 87, 0.3)' : '0 2px 8px rgba(46, 139, 87, 0.1)'};
  margin-bottom: 12px;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ isChecked }) =>
      isChecked ? '0 6px 16px rgba(46, 139, 87, 0.4)' : '0 4px 12px rgba(46, 139, 87, 0.2)'};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 16px;
  }
`;

const CheckInStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.08);
  border: 1px solid rgba(46, 139, 87, 0.2);
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.primaryDark};

  svg {
    color: ${theme.colors.primary};
    font-size: 18px;
  }
`;

const MealList = styled.div`
  display: grid;
  gap: 14px;
`;

const MealItem = styled.div`
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(236, 253, 245, 0.7);
  border: 1px solid rgba(46, 139, 87, 0.18);
`;

const MealTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};

  span {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(46, 139, 87, 0.7);
  }
`;

const MealMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const IngredientsList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: ${theme.colors.textSecondary};
  font-size: 13px;
`;

const RecipeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-top: 12px;
  border-radius: 12px;
  border: 2px solid ${theme.colors.primary};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(46, 139, 87, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(46, 139, 87, 0.3);
    background: linear-gradient(135deg, ${theme.colors.primaryLight} 0%, ${theme.colors.primary} 100%);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 16px;
  }
`;

const RecipeModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const RecipeModal = styled.div`
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  padding: 0;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.4s ease-out;
  display: grid;
  grid-template-rows: auto 1fr;
`;

const RecipeModalHeader = styled.div`
  padding: 32px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
  color: #ffffff;
  position: relative;

  h3 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }

  p {
    margin: 0;
    opacity: 0.9;
    font-size: 15px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    font-size: 20px;
  }
`;

const RecipeModalContent = styled.div`
  padding: 32px;
  overflow-y: auto;
  max-height: calc(90vh - 200px);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const InstructionsSection = styled.div`
  margin-bottom: 32px;

  h4 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 700;
    color: ${theme.colors.textPrimary};

    svg {
      color: ${theme.colors.primary};
    }
  }
`;

const InstructionStep = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(46, 139, 87, 0.05);
  border-left: 4px solid ${theme.colors.primary};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(46, 139, 87, 0.08);
    transform: translateX(4px);
  }
`;

const StepNumber = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
`;

const StepContent = styled.div`
  flex: 1;

  p {
    margin: 0;
    color: ${theme.colors.textPrimary};
    line-height: 1.7;
    font-size: 15px;
  }
`;

const IngredientsSection = styled.div`
  margin-bottom: 32px;

  h4 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 700;
    color: ${theme.colors.textPrimary};

    svg {
      color: ${theme.colors.primary};
    }
  }
`;

const IngredientsGrid = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
`;

const IngredientItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.05);
  border: 1px solid rgba(46, 139, 87, 0.1);
  color: ${theme.colors.textPrimary};
  font-size: 14px;

  &::before {
    content: '✓';
    color: ${theme.colors.primary};
    font-weight: 700;
    font-size: 16px;
  }
`;

const NoInstructions = styled.div`
  padding: 40px;
  text-align: center;
  color: ${theme.colors.textSecondary};
  border-radius: 16px;
  background: rgba(46, 139, 87, 0.05);

  p {
    margin: 0;
    font-size: 15px;
  }
`;

const NoPlan = styled.div`
  padding: 60px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px dashed rgba(46, 139, 87, 0.25);
  text-align: center;
  color: ${theme.colors.textSecondary};
`;

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  try {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const normalizedMeals = (plan: any) => {
  const raw = plan?.meals;
  if (!raw) return [];
  const days = Array.isArray(raw) ? raw : Object.values(raw);
  if (!Array.isArray(days)) return [];

  return days.map((day: any, index: number) => {
    const label = day?.day || day?.title || `Día ${index + 1}`;
    const desc = day?.summary || day?.description || null;
    const meals = day?.meals;

    const normalizedEntries = meals
      ? Array.isArray(meals)
        ? meals
            .filter(Boolean)
            .map((meal: any, mealIndex: number) => ({
              key: meal?.id || `${label}-meal-${mealIndex}`,
              type:
                meal?.type ||
                meal?.time ||
                meal?.category ||
                meal?.slot ||
                `Comida ${mealIndex + 1}`,
              name: meal?.name || meal?.title || meal?.dish || 'Receta personalizada',
              description: meal?.description || meal?.notes || '',
              calories: meal?.calories || meal?.kcal,
              macros: meal?.macros,
              ingredients: meal?.ingredients || meal?.items || [],
              instructions: meal?.instructions || meal?.steps || meal?.preparation || [],
              prepTime: meal?.prepTime || meal?.preparationTime || 0,
              cookTime: meal?.cookTime || meal?.cookingTime || 0,
              difficulty: meal?.difficulty || 'fácil',
            }))
        : Object.entries(meals)
            .filter(([, value]) => Boolean(value))
            .map(([key, value]: [string, any], mealIndex) => ({
              key: value?.id || `${label}-meal-${mealIndex}`,
              type: key.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
              name: value?.name || value?.title || value?.dish || 'Receta personalizada',
              description: value?.description || value?.notes || '',
              calories: value?.calories || value?.kcal,
              macros: value?.macros,
              ingredients: value?.ingredients || value?.items || [],
              instructions: value?.instructions || value?.steps || value?.preparation || [],
              prepTime: value?.prepTime || value?.preparationTime || 0,
              cookTime: value?.cookTime || value?.cookingTime || 0,
              difficulty: value?.difficulty || 'fácil',
            }))
      : [];

    return {
      key: day?.id || `day-${index}`,
      label,
      summary: desc,
      meals: normalizedEntries,
    };
  });
};

const PlanDetailPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { getPlanById, updateWeeklyPlan } = useWeeklyPlan();
  const plan = planId ? getPlanById(planId) : undefined;
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedDays, setCheckedDays] = useState<Record<string, boolean>>({});

  const mealsByDay = useMemo(() => (plan ? normalizedMeals(plan) : []), [plan]);

  // Cargar check-ins guardados
  React.useEffect(() => {
    if (planId && mealsByDay.length > 0) {
      try {
        const saved = localStorage.getItem(`tastypath:checkins:${planId}`);
        if (saved) {
          const loadedCheckIns = JSON.parse(saved);
          setCheckedDays(loadedCheckIns);
          
          // Verificar si la semana ya estaba completada
          const allDaysChecked = mealsByDay.every(day => loadedCheckIns[day.key]);
          if (allDaysChecked && plan?.status !== 'completed') {
            updateWeeklyPlan(planId, {
              status: 'completed',
              completedAt: new Date().toISOString(),
            } as any);
          }
        }
      } catch (error) {
        console.error('Error loading check-ins:', error);
      }
    }
  }, [planId, mealsByDay, plan?.status, updateWeeklyPlan]);

  // Guardar check-ins
  const saveCheckIns = React.useCallback(
    (checkins: Record<string, boolean>) => {
      if (planId) {
        try {
          localStorage.setItem(`tastypath:checkins:${planId}`, JSON.stringify(checkins));
        } catch (error) {
          console.error('Error saving check-ins:', error);
        }
      }
    },
    [planId]
  );

  const handleCheckIn = (dayKey: string) => {
    const newCheckedDays = {
      ...checkedDays,
      [dayKey]: !checkedDays[dayKey],
    };
    setCheckedDays(newCheckedDays);
    saveCheckIns(newCheckedDays);

    // Verificar si la semana está completada
    const allDaysChecked = mealsByDay.every(day => newCheckedDays[day.key]);
    if (allDaysChecked && planId) {
      // Marcar la semana como completada en el plan
      updateWeeklyPlan(planId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      } as any);
    }
  };

  const checkedDaysCount = Object.values(checkedDays).filter(Boolean).length;
  const totalDays = mealsByDay.length;
  const isWeekCompleted = totalDays > 0 && checkedDaysCount === totalDays;

  const handleOpenRecipe = (meal: any) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  const formatInstructions = (instructions: any): string[] => {
    if (!instructions) return [];
    if (Array.isArray(instructions)) {
      return instructions.map((inst: any, index: number) => {
        if (typeof inst === 'string') return inst;
        if (inst?.instruction || inst?.step || inst?.text) {
          return inst.instruction || inst.step || inst.text;
        }
        return `Paso ${index + 1}`;
      });
    }
    if (typeof instructions === 'string') {
      return instructions.split('\n').filter((line: string) => line.trim());
    }
    return [];
  };

  if (!plan) {
    return (
      <NoPlan>
        <h3>No se encontró el plan</h3>
        <p>
          Parece que este plan ya no está disponible. Vuelve a{' '}
          <Link to="/planes">Mis Planes</Link> para revisar tus opciones actuales.
        </p>
      </NoPlan>
    );
  }

  return (
    <PageWrapper>
      <BackLink to="/planes">
        <FiArrowLeft />
        Volver a mis planes
      </BackLink>

      <Header>
        <h1>{plan.name}</h1>
        <p>
          {plan.description ||
            'Consulta tu menú semanal: todas las comidas respetan tus alergias, preferencias y objetivos nutricionales.'}
        </p>
      </Header>

      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>
            <FiCalendar />
            Semana planificada
          </SummaryLabel>
          <SummaryValue>
            {formatDate(plan.weekStart)} · {formatDate(plan.weekEnd)}
          </SummaryValue>
        </SummaryCard>

        <SummaryCard>
          <SummaryLabel>
            <FiTarget />
            Objetivo nutricional
          </SummaryLabel>
          <SummaryValue>{plan.config?.goal || 'Personalizado'}</SummaryValue>
          <MealMeta>
            <span>Proteínas: {plan.nutritionGoals?.protein ?? 0}%</span>
            <span>Carbohidratos: {plan.nutritionGoals?.carbs ?? 0}%</span>
            <span>Grasas: {plan.nutritionGoals?.fat ?? 0}%</span>
            <span>Fibra: {plan.nutritionGoals?.fiber ?? 0}%</span>
          </MealMeta>
        </SummaryCard>

        <SummaryCard>
          <SummaryLabel>
            <FiClock />
            Total estimado
          </SummaryLabel>
          <SummaryValue>{plan.estimatedCalories || plan.totalCalories} kcal / semana</SummaryValue>
          <span>{plan.totalMeals} comidas programadas</span>
        </SummaryCard>

        <SummaryCard>
          <SummaryLabel>
            <FiCheckCircle />
            Progreso semanal
          </SummaryLabel>
          <SummaryValue>
            {checkedDaysCount} / {totalDays} días completados
          </SummaryValue>
          <ProgressWrapper>
            <ProgressBar percentage={totalDays > 0 ? (checkedDaysCount / totalDays) * 100 : 0} />
          </ProgressWrapper>
        </SummaryCard>
      </SummaryGrid>

      <WeekGrid>
        <WeekHeader>
          <h2>Planning semanal</h2>
          <p>Explora el menú de cada día. Haz clic en “Lista de Compras” para llevarte todos los ingredientes.</p>
        </WeekHeader>

        <DayGrid>
          {mealsByDay.map(day => (
            <DayCard key={day.key} isChecked={checkedDays[day.key]}>
              <CheckInButton
                isChecked={checkedDays[day.key] || false}
                onClick={() => handleCheckIn(day.key)}
                title={checkedDays[day.key] ? 'Día completado' : 'Marcar día como completado'}
              >
                {checkedDays[day.key] ? (
                  <>
                    <FiCheck />
                    Día completado
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    Marcar día completado
                  </>
                )}
              </CheckInButton>
              <DayHeader>
                <h3>{day.label}</h3>
                <span>
                  <FiShoppingBag /> Ingredientes listos
                </span>
              </DayHeader>

              {day.summary && <p>{day.summary}</p>}

              <MealList>
                {day.meals.length === 0 && (
                  <MealItem>
                    <MealTitle>No hay recetas registradas</MealTitle>
                    <span>Agrega detalles desde tu panel para completar este día.</span>
                  </MealItem>
                )}

                {day.meals.map(meal => (
                  <MealItem key={meal.key}>
                    <MealTitle>
                      {meal.name}
                      <span>{meal.type}</span>
                    </MealTitle>
                    {meal.description && (
                      <div style={{ margin: '8px 0', padding: '12px', borderRadius: '8px', background: 'rgba(46, 139, 87, 0.05)', borderLeft: '3px solid rgba(46, 139, 87, 0.3)' }}>
                        <p style={{ margin: 0, color: theme.colors.textPrimary, lineHeight: '1.7', fontSize: '14px', fontWeight: 500 }}>
                          {meal.description}
                        </p>
                      </div>
                    )}

                    <MealMeta>
                      {meal.calories && <span>{meal.calories} kcal</span>}
                      {meal.macros?.protein && <span>Proteínas: {meal.macros.protein}g</span>}
                      {meal.macros?.carbs && <span>Carbs: {meal.macros.carbs}g</span>}
                      {meal.macros?.fat && <span>Grasas: {meal.macros.fat}g</span>}
                    </MealMeta>

                    {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                      <IngredientsList>
                        {meal.ingredients.map((ingredient: any, index: number) => {
                          const ingredientText =
                            typeof ingredient === 'string'
                              ? ingredient
                              : ingredient?.name || ingredient?.item || ingredient?.ingredient || 'Ingrediente';
                          return <li key={`${meal.key}-ingredient-${index}`}>{ingredientText}</li>;
                        })}
                      </IngredientsList>
                    )}

                    <RecipeButton onClick={() => handleOpenRecipe(meal)}>
                      <FiCoffee />
                      Ver preparado de receta
                    </RecipeButton>
                  </MealItem>
                ))}
              </MealList>
            </DayCard>
          ))}
        </DayGrid>
      </WeekGrid>

      <RecipeModalOverlay
        isOpen={isModalOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseModal();
          }
        }}
      >
        {selectedMeal && (
          <RecipeModal onClick={(e) => e.stopPropagation()}>
            <RecipeModalHeader>
              <CloseButton onClick={handleCloseModal} aria-label="Cerrar">
                <FiX />
              </CloseButton>
              <h3>{selectedMeal.name}</h3>
              <p>{selectedMeal.type}</p>
            </RecipeModalHeader>
            <RecipeModalContent>
              {selectedMeal.description && (
                <div style={{ marginBottom: '32px', padding: '20px', borderRadius: '16px', background: 'rgba(46, 139, 87, 0.05)', borderLeft: '4px solid ' + theme.colors.primary }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: theme.colors.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBook />
                    Descripción detallada
                  </h4>
                  <p style={{ margin: 0, color: theme.colors.textPrimary, lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-line' }}>
                    {selectedMeal.description}
                  </p>
                </div>
              )}

              {Array.isArray(selectedMeal.ingredients) && selectedMeal.ingredients.length > 0 && (
                <IngredientsSection>
                  <h4>
                    <FiShoppingBag />
                    Ingredientes
                  </h4>
                  <IngredientsGrid>
                    {selectedMeal.ingredients.map((ingredient: any, index: number) => {
                      const ingredientText =
                        typeof ingredient === 'string'
                          ? ingredient
                          : ingredient?.name || ingredient?.item || ingredient?.ingredient || 'Ingrediente';
                      return <IngredientItem key={`ingredient-${index}`}>{ingredientText}</IngredientItem>;
                    })}
                  </IngredientsGrid>
                </IngredientsSection>
              )}

              <InstructionsSection>
                <h4>
                  <FiBook />
                  Instrucciones de preparación
                </h4>
                {formatInstructions(selectedMeal.instructions).length > 0 ? (
                  formatInstructions(selectedMeal.instructions).map((instruction, index) => (
                    <InstructionStep key={`step-${index}`}>
                      <StepNumber>{index + 1}</StepNumber>
                      <StepContent>
                        <p>{instruction}</p>
                      </StepContent>
                    </InstructionStep>
                  ))
                ) : (
                  <NoInstructions>
                    <p>
                      No hay instrucciones de preparación disponibles para esta receta. Las instrucciones se generarán
                      automáticamente cuando se cree el plan.
                    </p>
                  </NoInstructions>
                )}
              </InstructionsSection>
            </RecipeModalContent>
          </RecipeModal>
        )}
      </RecipeModalOverlay>
    </PageWrapper>
  );
};

export default PlanDetailPage;
