import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiArrowLeft,
  FiCalendar,
  FiTarget,
  FiClock,
  FiCheckCircle,
  FiShoppingBag,
  FiTrendingUp,
} from 'react-icons/fi';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { theme } from '../styles/theme';

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

const DayCard = styled.div`
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(46, 139, 87, 0.16);
  box-shadow: 0 18px 45px rgba(46, 139, 87, 0.12);
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 1.3rem;
    color: ${theme.colors.primaryDark};
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
  const { getPlanById } = useWeeklyPlan();
  const plan = planId ? getPlanById(planId) : undefined;

  const mealsByDay = useMemo(() => (plan ? normalizedMeals(plan) : []), [plan]);

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
        <p>{plan.description || 'Consulta tu menú semanal con todo el detalle de comidas, macronutrientes y objetivos.'}</p>
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
            Progreso
          </SummaryLabel>
          <ProgressWrapper>
            <ProgressBar percentage={plan.progress?.percentage ?? 0} />
            <span>
              {plan.progress?.completedMeals ?? 0} / {plan.progress?.totalMeals ?? plan.totalMeals} comidas completadas (
              {plan.progress?.percentage ?? 0}%)
            </span>
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
            <DayCard key={day.key}>
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
                    {meal.description && <p style={{ margin: 0, color: theme.colors.textSecondary }}>{meal.description}</p>}

                    <MealMeta>
                      {meal.calories && <span>{meal.calories} kcal</span>}
                      {meal.macros?.protein && <span>Proteínas: {meal.macros.protein}g</span>}
                      {meal.macros?.carbs && <span>Carbs: {meal.macros.carbs}g</span>}
                      {meal.macros?.fat && <span>Grasas: {meal.macros.fat}g</span>}
                    </MealMeta>

                    {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                      <IngredientsList>
                        {meal.ingredients.slice(0, 5).map((ingredient: any, index: number) => {
                          const ingredientText =
                            typeof ingredient === 'string'
                              ? ingredient
                              : ingredient?.name || ingredient?.item || ingredient?.ingredient || 'Ingrediente';
                          return <li key={`${meal.key}-ingredient-${index}`}>{ingredientText}</li>;
                        })}
                        {meal.ingredients.length > 5 && <li>+ {meal.ingredients.length - 5} ingredientes más…</li>}
                      </IngredientsList>
                    )}
                  </MealItem>
                ))}
              </MealList>
            </DayCard>
          ))}
        </DayGrid>
      </WeekGrid>
    </PageWrapper>
  );
};

export default PlanDetailPage;
