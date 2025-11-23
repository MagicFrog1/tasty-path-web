import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiArrowLeft,
  FiCalendar,
  FiActivity,
  FiClock,
  FiTarget,
  FiCheckCircle,
} from 'react-icons/fi';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { theme } from '../styles/theme';

const PageWrapper = styled.div`
  display: grid;
  gap: 32px;
  padding: 0;

  @media (max-width: 1024px) {
    gap: 24px;
    padding: 0 16px;
  }

  @media (max-width: 768px) {
    gap: 20px;
    padding: 0 12px;
  }

  @media (max-width: 480px) {
    gap: 16px;
    padding: 0 8px;
  }
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
  font-size: 14px;
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
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: ${theme.colors.textPrimary};
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    max-width: 720px;
    line-height: 1.7;
    font-size: 16px;
  }
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

const ExerciseGrid = styled.div`
  display: grid;
  gap: 24px;
`;

const ExerciseCard = styled.div`
  display: grid;
  gap: 16px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(236, 253, 245, 0.9));
  border: 1px solid rgba(46, 139, 87, 0.16);
  box-shadow: 0 18px 45px rgba(46, 139, 87, 0.12);
`;

const ExerciseHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  svg {
    color: ${theme.colors.primary};
    font-size: 24px;
  }
`;

const ExerciseTypeBadge = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ type }) => {
    if (type === 'cardio') return 'rgba(239, 68, 68, 0.1)';
    if (type === 'strength') return 'rgba(59, 130, 246, 0.1)';
    if (type === 'flexibility') return 'rgba(168, 85, 247, 0.1)';
    return 'rgba(46, 139, 87, 0.1)';
  }};
  color: ${({ type }) => {
    if (type === 'cardio') return '#dc2626';
    if (type === 'strength') return '#2563eb';
    if (type === 'flexibility') return '#9333ea';
    return theme.colors.primary;
  }};
`;

const LocationBadge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(46, 139, 87, 0.1);
  color: ${theme.colors.primary};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ExerciseDescription = styled.p`
  margin: 0 0 16px 0;
  color: ${theme.colors.textPrimary};
  line-height: 1.7;
  font-size: 14px;
`;

const ExerciseMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    font-weight: 500;
    
    svg {
      color: ${theme.colors.primary};
      font-size: 16px;
    }
  }
`;

const ExerciseInstructions = styled.ol`
  margin: 0 0 16px 0;
  padding-left: 24px;
  color: ${theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.8;
  
  li {
    margin-bottom: 8px;
    padding-left: 8px;
  }
`;

const ExerciseEquipment = styled.div`
  margin-bottom: 16px;
  
  h5 {
    margin: 0 0 8px 0;
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  span {
    padding: 6px 12px;
    border-radius: 8px;
    background: ${theme.colors.white};
    border: 1px solid rgba(46, 139, 87, 0.2);
    font-size: 12px;
    font-weight: 500;
    color: ${theme.colors.textPrimary};
  }
`;

const ExerciseRecommendations = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.05);
  border-left: 3px solid ${theme.colors.primary};
  
  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: ${theme.colors.textSecondary};
    font-size: 13px;
    line-height: 1.7;
    
    li {
      margin-bottom: 6px;
    }
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
    const label = day?.day || day?.title || day?.date || `Día ${day?.dayNumber || index + 1}`;
    const exercise = day?.exercise ? {
      name: day.exercise.name || 'Ejercicio del día',
      type: day.exercise.type || 'mixed',
      duration: day.exercise.duration || 45,
      description: day.exercise.description || '',
      instructions: Array.isArray(day.exercise.instructions) ? day.exercise.instructions : [],
      equipment: Array.isArray(day.exercise.equipment) ? day.exercise.equipment : [],
      recommendations: Array.isArray(day.exercise.recommendations) ? day.exercise.recommendations : [],
      location: day.exercise.location,
    } : null;

    return {
      key: day?.id || `day-${index}`,
      label,
      exercise,
    };
  });
};

const ExercisePlanPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { getPlanById } = useWeeklyPlan();
  const plan = planId ? getPlanById(planId) : undefined;

  const exercisesByDay = useMemo(() => (plan ? normalizedMeals(plan) : []), [plan]);
  const exercisesCount = exercisesByDay.filter(day => day.exercise).length;

  if (!plan) {
    return (
      <NoPlan>
        <h3>No se encontró el plan</h3>
        <p>
          Parece que este plan ya no está disponible. Vuelve a{' '}
          <Link to="/planes">Mis Planes Guardados</Link> para revisar tus opciones actuales.
        </p>
      </NoPlan>
    );
  }

  if (!plan.config?.hasExercises || exercisesCount === 0) {
    return (
      <NoPlan>
        <h3>Este plan no tiene ejercicios personalizados</h3>
        <p>
          Este plan no incluye ejercicios personalizados. Puedes complementarlo con ejercicios desde{' '}
          <Link to="/minutri-personal">MiNutri Personal</Link>.
        </p>
      </NoPlan>
    );
  }

  return (
    <PageWrapper>
      <BackLink to="/planes">
        <FiArrowLeft />
        Volver a mis planes guardados
      </BackLink>

      <Header>
        <h1>Rutina de Ejercicios - {plan.name}</h1>
        <p>
          Plan de ejercicios personalizados adaptados a tu edad y objetivos para ayudarte a alcanzar tus metas más rápido.
        </p>
      </Header>

      <SummaryCard>
        <SummaryLabel>
          <FiActivity />
          Resumen de la Rutina
        </SummaryLabel>
        <SummaryValue>
          {exercisesCount} ejercicios personalizados
        </SummaryValue>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: theme.colors.textSecondary }}>
            <FiCalendar />
            {formatDate(plan.weekStart)} · {formatDate(plan.weekEnd)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: theme.colors.textSecondary }}>
            <FiTarget />
            {plan.config?.goal || 'Personalizado'}
          </span>
        </div>
      </SummaryCard>

      <ExerciseGrid>
        {exercisesByDay
          .filter(day => day.exercise)
          .map(day => (
            <ExerciseCard key={day.key}>
              <ExerciseHeader>
                <h3>
                  <FiActivity />
                  {day.label}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {day.exercise?.location && (
                    <LocationBadge>
                      {day.exercise.location === 'gym' ? '🏋️ Gimnasio' : 
                       day.exercise.location === 'park' ? '🌳 Parque' : 
                       '🏠 Casa'}
                    </LocationBadge>
                  )}
                  {day.exercise?.type && (
                    <ExerciseTypeBadge type={day.exercise.type}>
                      {day.exercise.type === 'cardio' ? 'Cardio' : 
                       day.exercise.type === 'strength' ? 'Fuerza' : 
                       day.exercise.type === 'flexibility' ? 'Flexibilidad' : 'Mixto'}
                    </ExerciseTypeBadge>
                  )}
                </div>
              </ExerciseHeader>
              
              <ExerciseDescription>
                {day.exercise?.description || day.exercise?.name}
              </ExerciseDescription>
              
              <ExerciseMeta>
                {day.exercise?.duration && (
                  <span>
                    <FiClock />
                    {day.exercise.duration} minutos
                  </span>
                )}
                {day.exercise?.type && (
                  <span>
                    <FiTarget />
                    {day.exercise.type === 'cardio' ? 'Cardiovascular' : 
                     day.exercise.type === 'strength' ? 'Fuerza' : 
                     day.exercise.type === 'flexibility' ? 'Flexibilidad' : 'Mixto'}
                  </span>
                )}
              </ExerciseMeta>
              
              {day.exercise?.instructions && day.exercise.instructions.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: theme.colors.primaryDark }}>
                    Instrucciones
                  </h5>
                  <ExerciseInstructions>
                    {day.exercise.instructions.map((instruction: string, idx: number) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ExerciseInstructions>
                </div>
              )}
              
              {day.exercise?.equipment && day.exercise.equipment.length > 0 && (
                <ExerciseEquipment>
                  <h5>Equipo necesario</h5>
                  <div>
                    {day.exercise.equipment.map((item: string, idx: number) => (
                      <span key={idx}>{item}</span>
                    ))}
                  </div>
                </ExerciseEquipment>
              )}
              
              {day.exercise?.recommendations && day.exercise.recommendations.length > 0 && (
                <ExerciseRecommendations>
                  <h5>
                    <FiCheckCircle />
                    Recomendaciones
                  </h5>
                  <ul>
                    {day.exercise.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </ExerciseRecommendations>
              )}
            </ExerciseCard>
          ))}
      </ExerciseGrid>
    </PageWrapper>
  );
};

export default ExercisePlanPage;

