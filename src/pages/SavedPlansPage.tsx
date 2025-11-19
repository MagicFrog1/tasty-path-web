import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiTrendingUp, FiChevronRight, FiTrash2, FiPlay, FiEdit, FiCheck, FiX, FiAward } from 'react-icons/fi';
import { TbCrown } from 'react-icons/tb';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { theme } from '../styles/theme';
import { useShoppingList } from '../context/ShoppingListContext';
import { storage } from '../utils/storage';

const PageWrapper = styled.div`
  display: grid;
  gap: 28px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 4vw, 2.6rem);
    color: ${theme.colors.textPrimary};
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    max-width: 660px;
    line-height: 1.6;
  }
`;

const PlanGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const PlanCard = styled.article<{ active?: boolean }>`
  position: relative;
  display: grid;
  gap: 18px;
  padding: 24px;
  border-radius: 22px;
  background: ${({ active }) => (active ? '#f0fdf4' : '#ffffff')};
  border: 1px solid ${({ active }) => (active ? 'rgba(34, 197, 94, 0.65)' : 'rgba(15, 23, 42, 0.08)')};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  color: ${theme.colors.textPrimary};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 42px rgba(15, 23, 42, 0.12);
    border-color: ${({ active }) => (active ? 'rgba(34, 197, 94, 0.75)' : 'rgba(34, 197, 94, 0.35)')};
  }
`;

const PlanHeader = styled.div`
  display: grid;
  gap: 10px;

  h3 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }

  span {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(34, 197, 94, 0.8);
  }
`;

const CompletedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.15) 100%);
  border: 2px solid rgba(255, 193, 7, 0.4);
  color: #f57c00;
  font-weight: 700;
  font-size: 14px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
    }
    50% {
      box-shadow: 0 6px 20px rgba(255, 193, 7, 0.35);
    }
  }

  svg {
    font-size: 18px;
    color: #f57c00;
  }
`;

const Meta = styled.div`
  display: grid;
  gap: 10px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${theme.colors.textSecondary};
  font-size: 14px;

  svg {
    font-size: 18px;
    color: ${theme.colors.primary};
  }
`;

const PreviewMeals = styled.div`
  display: grid;
  gap: 8px;
`;

const PreviewTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.55);
`;

const PreviewList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: ${theme.colors.textSecondary};

    span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: rgba(34, 197, 94, 0.18);
      color: ${theme.colors.primary};
      font-weight: 700;
      font-size: 11px;
    }
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: inherit;
  font-size: 14px;

  svg {
    transition: transform 0.25s ease;
  }
`;

const EmptyState = styled.div`
  padding: 60px;
  border-radius: 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px dashed rgba(46, 139, 87, 0.25);
  color: ${theme.colors.textSecondary};
  box-shadow: 0 18px 45px rgba(46, 139, 87, 0.12);

  h3 {
    margin-top: 0;
    color: ${theme.colors.primaryDark};
  }

  p {
    margin-bottom: 16px;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: 16px;
    background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
    color: #fff;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 18px 40px rgba(46, 139, 87, 0.24);
  }
`;

const PlanLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  font-weight: 600;
  text-decoration: none;

  svg {
    transition: transform 0.25s ease;
  }

  &:hover svg {
    transform: translateX(6px);
  }
`;

const PlanActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  background: ${({ variant }) =>
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? 'rgba(248, 113, 113, 0.12)'
        : 'rgba(15, 23, 42, 0.06)'};
  color: ${({ variant }) =>
    variant === 'primary' ? '#fff' : variant === 'danger' ? '#b91c1c' : theme.colors.primaryDark};
  border-color: ${({ variant }) =>
    variant === 'primary'
      ? 'transparent'
      : variant === 'danger'
        ? 'rgba(248, 113, 113, 0.5)'
        : 'rgba(15, 23, 42, 0.12)'};
  box-shadow: ${({ variant }) =>
    variant === 'primary'
      ? '0 12px 24px rgba(34, 197, 94, 0.24)'
      : variant === 'danger'
        ? '0 10px 20px rgba(248, 113, 113, 0.18)'
        : '0 10px 20px rgba(15, 23, 42, 0.12)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ variant }) =>
      variant === 'primary'
        ? '0 16px 28px rgba(34, 197, 94, 0.28)'
        : variant === 'danger'
          ? '0 12px 24px rgba(248, 113, 113, 0.22)'
          : '0 12px 24px rgba(15, 23, 42, 0.16)'};
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
    transform: none;
    box-shadow: none;
  }
`;

const ActiveTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: ${theme.colors.primary};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
`;

const RenameForm = styled.form`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
`;

const NameInput = styled.input`
  flex: 1 1 220px;
  min-width: 200px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  background: rgba(255, 255, 255, 0.96);
  padding: 10px 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.06);
`;

const InlineError = styled.span`
  display: block;
  width: 100%;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
`;

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const getMealPreview = (plan: any) => {
  const raw = plan?.meals;
  if (!raw) return [];

  const days = Array.isArray(raw) ? raw : Object.values(raw);
  if (!Array.isArray(days)) return [];

  return days
    .slice(0, 3)
    .map((day: any, index: number) => {
      const dayLabel = day?.day || day?.title || `Día ${index + 1}`;
      const meals = day?.meals;
      const firstMeal = meals
        ? Array.isArray(meals)
          ? meals[0]?.name || meals[0]?.title
          : Object.values(meals)[0]?.name || Object.values(meals)[0]?.title
        : null;

      return {
        day: dayLabel,
        meal: firstMeal || 'Menú completo disponible',
      };
    });
};

const ACTIVE_PLAN_STORAGE_KEY = 'tastypath:activePlan';

const SavedPlansPage: React.FC = () => {
  const { weeklyPlans, setActivePlan, deleteWeeklyPlan, activePlan, updateWeeklyPlan } = useWeeklyPlan();
  const { setShoppingList, updatePlanMetadata } = useShoppingList();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, boolean>>({});
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [draftPlanName, setDraftPlanName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const orderedPlans = useMemo(
    () =>
      [...weeklyPlans].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.weekStart || '').getTime();
        const dateB = new Date(b.createdAt || b.weekStart || '').getTime();
        return dateB - dateA;
      }),
    [weeklyPlans]
  );

  if (orderedPlans.length === 0) {
    return (
      <PageWrapper>
        <Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <h1>Mis Planes</h1>
          </div>
          <p>Aún no has generado ningún plan semanal. Crea tu primer plan con IA para comenzar a organizar tus comidas.</p>
        </Header>
        <EmptyState>
          <h3>Empieza con tu primer plan</h3>
          <p>Responde el cuestionario y deja que la IA prepare un menú adaptado a tus objetivos.</p>
          <Link to="/generador">Generar plan ahora</Link>
        </EmptyState>
      </PageWrapper>
    );
  }

  const toggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    setSelectedPlans({});
  };

  const togglePlanSelection = (planId: string) => {
    setSelectedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const selectedIds = Object.entries(selectedPlans)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(
      selectedIds.length === 1
        ? '¿Eliminar el plan seleccionado y su lista asociada?'
        : `¿Eliminar los ${selectedIds.length} planes seleccionados y sus listas asociadas?`,
    );
    if (!confirmed) return;

    for (const planId of selectedIds) {
      const plan = weeklyPlans.find(p => p.id === planId);
      if (!plan) continue;
      await deleteWeeklyPlan(planId);
      setShoppingList(prev => prev.filter(item => item.sourcePlan !== planId));
    }
    setSelectedPlans({});
    setSelectionMode(false);
  };

  const handleUsePlan = (plan: any) => {
    setActivePlan(plan);
    storage.set(ACTIVE_PLAN_STORAGE_KEY, plan);
  };

  const handleDeletePlan = async (plan: any) => {
    const confirmed = window.confirm(`¿Eliminar "${plan.name}" y su lista asociada?`);
    if (!confirmed) return;

    await deleteWeeklyPlan(plan.id);
    setShoppingList(prev => prev.filter(item => item.sourcePlan !== plan.id));
  };

  const handleStartRename = (planId: string, currentName: string) => {
    setEditingPlanId(planId);
    setDraftPlanName(currentName);
    setNameError(null);
  };

  const handleCancelRename = () => {
    setEditingPlanId(null);
    setDraftPlanName('');
    setNameError(null);
  };

  const handleConfirmRename = async (plan: any) => {
    const trimmed = draftPlanName.trim();
    if (!trimmed) {
      setNameError('El nombre no puede estar vacío.');
      return;
    }

    if (trimmed.length > 80) {
      setNameError('El nombre debe tener menos de 80 caracteres.');
      return;
    }

    try {
      await updateWeeklyPlan(plan.id, { name: trimmed });
      updatePlanMetadata(plan.id, { planName: trimmed });
      setEditingPlanId(null);
      setDraftPlanName('');
      setNameError(null);
    } catch (error) {
      console.error('Error renombrando plan:', error);
      setNameError('No se pudo actualizar el nombre. Inténtalo de nuevo.');
    }
  };

  return (
    <PageWrapper>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <h1>Mis Planes</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            {selectionMode && (
              <ActionButton
                variant="danger"
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                style={{ color: '#fff', background: 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(190,18,60,0.9))' }}
              >
                <FiTrash2 />
                {selectedIds.length > 0 ? `Eliminar (${selectedIds.length})` : 'Eliminar'}
              </ActionButton>
            )}
            <ActionButton
              variant={selectionMode ? 'danger' : 'primary'}
              type="button"
              onClick={toggleSelectionMode}
            >
              {selectionMode ? 'Cancelar selección' : 'Seleccionar planes'}
            </ActionButton>
          </div>
        </div>
        <p>Revisa tus planes semanales generados por IA, consulta el menú de cada día y mantén tus objetivos siempre visibles.</p>
      </Header>

      <PlanGrid>
        {orderedPlans.map(plan => {
          const preview = getMealPreview(plan);
          const isActive = activePlan?.id === plan.id;
          const isSelected = selectionMode && !!selectedPlans[plan.id];
          const isEditing = editingPlanId === plan.id;
          return (
            <PlanCard key={plan.id} active={isActive} style={isSelected ? { borderColor: '#2563eb', boxShadow: '0 0 0 2px rgba(37,99,235,0.25)' } : undefined}>
              {selectionMode && (
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePlanSelection(plan.id)}
                    style={{ width: 18, height: 18 }}
                  />
                </div>
              )}
              <PlanHeader>
                <span>{isActive || plan.status === 'active' ? 'Plan activo' : plan.status === 'completed' ? 'Semana completada' : 'Plan guardado'}</span>
                {isEditing ? (
                  <>
                    <RenameForm
                      onSubmit={event => {
                        event.preventDefault();
                        handleConfirmRename(plan);
                      }}
                    >
                      <NameInput
                        value={draftPlanName}
                        onChange={event => {
                          setDraftPlanName(event.target.value);
                          if (nameError) setNameError(null);
                        }}
                        placeholder="Nombre del plan"
                        autoFocus
                      />
                      <ActionButton variant="primary" type="submit">
                        <FiCheck />
                        Guardar
                      </ActionButton>
                      <ActionButton variant="secondary" type="button" onClick={handleCancelRename}>
                        <FiX />
                        Cancelar
                      </ActionButton>
                    </RenameForm>
                    {nameError && <InlineError>{nameError}</InlineError>}
                  </>
                ) : (
                  <h3>{plan.name}</h3>
                )}
                {isActive && (
                  <ActiveTag>
                    <TbCrown /> Plan en uso
                  </ActiveTag>
                )}
                {plan.status === 'completed' && (
                  <CompletedBadge>
                    <FiAward />
                    🎉 Semana completada - ¡Logro desbloqueado!
                  </CompletedBadge>
                )}
              </PlanHeader>

              <Meta>
                <MetaRow>
                  <FiCalendar />
                  {formatDate(plan.weekStart)} · {formatDate(plan.weekEnd)}
                </MetaRow>
                <MetaRow>
                  <FiClock />
                  {plan.totalMeals} comidas · {plan.estimatedCalories || plan.totalCalories} kcal/semana
                </MetaRow>
                <MetaRow>
                  <FiTrendingUp />
                  Objetivo: {plan.config?.goal || 'Personalizado'}
                </MetaRow>
              </Meta>

              {preview.length > 0 && (
                <PreviewMeals>
                  <PreviewTitle>Vista rápida</PreviewTitle>
                  <PreviewList>
                    {preview.map(item => (
                      <li key={item.day}>
                        <span>{item.day.slice(0, 2)}</span>
                        {item.day} · {item.meal}
                      </li>
                    ))}
                  </PreviewList>
                </PreviewMeals>
              )}

              <PlanActions>
                {isEditing ? (
                  <ActionButton variant="secondary" type="button" onClick={handleCancelRename}>
                    <FiX />
                    Cancelar edición
                  </ActionButton>
                ) : (
                  <>
                    <ActionButton
                      variant="primary"
                      type="button"
                      onClick={() => handleUsePlan(plan)}
                      disabled={isActive}
                      style={isActive ? { opacity: 0.7, cursor: 'default' } : undefined}
                    >
                      <FiPlay />
                      {isActive ? 'Plan en uso' : 'Usar este plan'}
                    </ActionButton>
                    {!selectionMode && (
                      <ActionButton variant="secondary" type="button" onClick={() => handleStartRename(plan.id, plan.name)}>
                        <FiEdit />
                        Renombrar
                      </ActionButton>
                    )}
                    {!selectionMode && (
                      <ActionButton variant="danger" type="button" onClick={() => handleDeletePlan(plan)}>
                        <FiTrash2 />
                        Eliminar
                      </ActionButton>
                    )}
                  </>
                )}
              </PlanActions>

              <Footer>
                <PlanLink to={`/plan/${plan.id}`}>
                  Ver menú completo <FiChevronRight />
                </PlanLink>
              </Footer>
            </PlanCard>
          );
        })}
      </PlanGrid>
    </PageWrapper>
  );
};

export default SavedPlansPage;
