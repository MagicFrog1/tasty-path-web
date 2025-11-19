import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { useUserProfile } from '../context/UserProfileContext';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { useShoppingList } from '../context/ShoppingListContext';
import { nutritionService } from '../services/NutritionService';
import AIMenuService, { AIMenuRequest } from '../services/AIMenuService';
import { useSubscriptionRestrictions, FREE_PLAN_OPTIONS, PREMIUM_PLAN_OPTIONS } from '../hooks/useSubscriptionRestrictions';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const PageWrapper = styled.div`
  display: grid;
  gap: 32px;
`;

const Header = styled.div`
  display: grid;
  gap: 10px;

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

const ProgressTrail = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
`;

const ProgressItem = styled.div<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: ${({ active }) =>
    active ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : 'rgba(46, 139, 87, 0.08)'};
  color: ${({ active }) => (active ? '#fff' : theme.colors.primaryDark)};
  box-shadow: ${({ active }) => (active ? '0 16px 36px rgba(46, 139, 87, 0.26)' : 'none')};
  transition: transform 0.2s ease;

  span {
    display: inline-grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 10px;
    background: ${({ active }) => (active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(46, 139, 87, 0.18)')};
  }
`;

const Form = styled.form`
  display: grid;
  gap: 24px;
  max-width: 960px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const StepLayout = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) 320px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.section`
  display: grid;
  gap: 20px;
  padding: 32px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(46, 139, 87, 0.12);
  box-shadow: 0 26px 60px rgba(46, 139, 87, 0.16);
`;

const StepHeading = styled.div`
  display: grid;
  gap: 10px;

  h3 {
    margin: 0;
    font-size: 1.6rem;
    color: ${theme.colors.textPrimary};
  }

  span {
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(46, 139, 87, 0.8);
  }
`;

const StepDescription = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
`;

const SidebarCard = styled.aside`
  display: grid;
  gap: 16px;
  padding: 26px;
  border-radius: 24px;
  background: linear-gradient(150deg, rgba(46, 139, 87, 0.18), rgba(99, 102, 241, 0.18));
  border: 1px solid rgba(46, 139, 87, 0.25);
  box-shadow: 0 24px 55px rgba(46, 139, 87, 0.2);
  backdrop-filter: blur(20px);
  color: ${theme.colors.primaryDark};
`;

const SidebarTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
`;

const SidebarList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;

  li {
    position: relative;
    padding-left: 24px;
    font-size: 0.95rem;
    color: rgba(33, 37, 41, 0.8);
    line-height: 1.5;
  }

  li:before {
    content: '•';
    position: absolute;
    left: 8px;
    color: ${theme.colors.primary};
    font-size: 1.2rem;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${theme.colors.gray};
  background: ${theme.colors.white};
`;

const Select = styled.select`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${theme.colors.gray};
  background: ${theme.colors.white};
`;

const CheckboxRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
`;

const Chip = styled.label<{ $checked?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${({ $checked }) => ($checked ? theme.colors.primary : theme.colors.gray)};
  border-radius: 999px;
  background: ${({ $checked }) => ($checked ? 'rgba(46, 139, 87, 0.1)' : '#fff')};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${({ $checked }) => ($checked ? 600 : 400)};
  color: ${({ $checked }) => ($checked ? theme.colors.primary : theme.colors.textPrimary)};
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: ${({ $checked }) => ($checked ? 'rgba(46, 139, 87, 0.15)' : 'rgba(46, 139, 87, 0.05)')};
  }
  
  input[type="checkbox"],
  input[type="radio"] {
    display: none;
  }
  
  span {
    user-select: none;
  }
`;

const GoalChip = styled.label<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${({ $selected }) => ($selected ? theme.colors.primary : theme.colors.gray)};
  border-radius: 999px;
  background: ${({ $selected }) => ($selected ? 'rgba(46, 139, 87, 0.1)' : '#fff')};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};
  color: ${({ $selected }) => ($selected ? theme.colors.primary : theme.colors.textPrimary)};
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: ${({ $selected }) => ($selected ? 'rgba(46, 139, 87, 0.15)' : 'rgba(46, 139, 87, 0.05)')};
  }
  
  input[type="radio"] {
    display: none;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 16px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  color: ${theme.colors.white};
  box-shadow: 0 18px 40px rgba(46, 139, 87, 0.24);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 24px 52px rgba(46, 139, 87, 0.28);
    filter: brightness(1.02);
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
    transform: none;
    box-shadow: 0 12px 26px rgba(46, 139, 87, 0.16);
    filter: none;
  }
`;

const Ghost = styled(Button)`
  background: ${theme.colors.white};
  color: ${theme.colors.primary};
  border: 2px solid rgba(46, 139, 87, 0.4);
  box-shadow: 0 14px 32px rgba(46, 139, 87, 0.12);
  filter: none;

  &:hover {
    box-shadow: 0 18px 40px rgba(46, 139, 87, 0.2);
    filter: none;
  }
` as unknown as typeof Button;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Note = styled.div<{ statusType: 'info' | 'success' | 'error' }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ statusType }) => {
    if (statusType === 'success') return 'rgba(34, 139, 87, 0.95)';
    if (statusType === 'error') return '#c0392b';
    return theme.colors.textSecondary;
  }};
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${theme.colors.gray};
`;

const SuccessNotification = styled.div<{ show: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 20px 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.95), rgba(34, 197, 94, 0.95));
  color: white;
  box-shadow: 0 20px 60px rgba(46, 139, 87, 0.4);
  display: ${({ show }) => (show ? 'flex' : 'none')};
  align-items: center;
  gap: 12px;
  min-width: 320px;
  max-width: 500px;
  animation: ${({ show }) => (show ? 'slideIn 0.3s ease-out' : 'none')};
  
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
  
  p {
    margin: 4px 0 0 0;
    font-size: 14px;
    opacity: 0.95;
  }
  
  button {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const PlanGeneratorPage: React.FC = () => {
  const { profile } = useUserProfile();
  const { addWeeklyPlan, weeklyPlans } = useWeeklyPlan();
  const { updateShoppingListFromPlan } = useShoppingList();
  const restrictions = useSubscriptionRestrictions();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [goal, setGoal] = useState('Mantenimiento');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [weight, setWeight] = useState(profile?.weight || 70);
  const [height, setHeight] = useState(profile?.height || 170);
  const [customCalories, setCustomCalories] = useState<number | null>(null);
  const [useCustomCalories, setUseCustomCalories] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('Dinos tu objetivo principal para empezar.');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Verificar si puede crear planes
  React.useEffect(() => {
    if (!restrictions.canCreatePlan) {
      setShowUpgradePrompt(true);
      setStatus('Has alcanzado el límite de planes gratuitos. ¡Actualiza a Premium para crear planes ilimitados!');
      setStatusType('error');
    }
  }, [restrictions.canCreatePlan]);

  // Opciones disponibles según el plan
  const availableGoals = restrictions.canUseAllGoals ? PREMIUM_PLAN_OPTIONS.goals : FREE_PLAN_OPTIONS.goals;
  const availableDietaryPreferences = restrictions.canUseAllDietaryPreferences ? PREMIUM_PLAN_OPTIONS.dietaryPreferences : FREE_PLAN_OPTIONS.dietaryPreferences;
  const availableAllergens = restrictions.canUseAllAllergens ? PREMIUM_PLAN_OPTIONS.allergens : FREE_PLAN_OPTIONS.allergens;

  const updateStatusForStep = (step: number) => {
    const messages: Record<number, string> = {
      1: 'Dinos tu objetivo principal para empezar.',
      2: 'Selecciona estilos de comida que disfrutes para ajustar el plan.',
      3: 'Marca alergias o ingredientes a evitar antes de generar el plan.',
    };
    setStatus(messages[step] ?? 'Puedes retroceder y ajustar tu plan en cualquier momento.');
    setStatusType('info');
  };

  const getSuggestedDailyCalories = React.useCallback(() => {
    if (!profile || !profile.age || !profile.gender || !profile.activityLevel) {
      return 2000; // Valor por defecto si no hay perfil completo
    }
    try {
      const bmr = nutritionService.calculateBMR(weight, height, profile.age, profile.gender);
      const tmt = nutritionService.calculateTMT(bmr, profile.activityLevel);
      let target = tmt;

      if (goal === 'Pérdida de peso') target *= 0.85;
      else if (goal === 'Aumento de masa muscular') target *= 1.1;
      else if (goal === 'Control de diabetes') target *= 0.9;
      else if (goal === 'Salud cardiovascular') target *= 0.95;

      return Math.round(target);
    } catch (error) {
      console.error('Error calculando calorías sugeridas:', error);
      return 2000; // Valor por defecto en caso de error
    }
  }, [weight, height, profile?.age, profile?.gender, profile?.activityLevel, goal]);

  const toggleList = (list: string[], value: string, setter: (v: string[]) => void, allowedOptions?: string[]) => {
    // Si hay opciones permitidas y el valor no está permitido, mostrar mensaje
    if (allowedOptions && !allowedOptions.includes(value)) {
      setStatus('Esta opción está disponible solo para usuarios Premium. ¡Actualiza tu plan!');
      setStatusType('error');
      setShowUpgradePrompt(true);
      return;
    }
    if (list.includes(value)) setter(list.filter(v => v !== value));
    else setter([...list, value]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar restricciones antes de generar
    if (!restrictions.canCreatePlan) {
      setStatus('Has alcanzado el límite de planes gratuitos. ¡Actualiza a Premium!');
      setStatusType('error');
      setShowUpgradePrompt(true);
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(s => {
        const next = s + 1;
        updateStatusForStep(next);
        return next;
      });
      return;
    }

    setIsLoading(true);
    setStatus('Calculando parámetros nutricionales...');
    setStatusType('info');

    try {
      if (!profile || !profile.age || !profile.gender || !profile.activityLevel) {
        setStatus('Por favor, completa tu perfil primero en "Mi Perfil" para generar un plan personalizado.');
        setStatusType('error');
        setIsLoading(false);
        return;
      }

      const bmr = nutritionService.calculateBMR(weight, height, profile.age, profile.gender);
      const tmt = nutritionService.calculateTMT(bmr, profile.activityLevel);
      let targetCalories = tmt;
      
      // Si el usuario especificó calorías personalizadas, usarlas
      if (useCustomCalories && customCalories && customCalories > 0) {
        targetCalories = customCalories;
      } else {
        // Calcular según objetivo
        if (goal === 'Pérdida de peso') targetCalories = tmt * 0.85;
        else if (goal === 'Aumento de masa muscular') targetCalories = tmt * 1.1;
        else if (goal === 'Control de diabetes') targetCalories = tmt * 0.9;
        else if (goal === 'Salud cardiovascular') targetCalories = tmt * 0.95;
      }

      setStatus('Preparando solicitud para IA...');

      // Calcular macros según objetivo y características físicas
      let proteinPercent = 25;
      let carbsPercent = 50;
      let fatPercent = 25;
      
      if (goal === 'Aumento de masa muscular') {
        proteinPercent = 30;
        carbsPercent = 45;
        fatPercent = 25;
      } else if (goal === 'Pérdida de peso') {
        proteinPercent = 30;
        carbsPercent = 40;
        fatPercent = 30;
      } else if (goal === 'Control de diabetes') {
        proteinPercent = 25;
        carbsPercent = 40;
        fatPercent = 35;
      } else if (goal === 'Salud cardiovascular') {
        proteinPercent = 25;
        carbsPercent = 45;
        fatPercent = 30;
      }

      const aiRequest: AIMenuRequest = {
        nutritionGoals: { 
          protein: proteinPercent, 
          carbs: carbsPercent, 
          fat: fatPercent, 
          fiber: 25 
        },
        totalCalories: Math.round(targetCalories * 7),
        dietaryPreferences,
        allergies: allergens,
        weight,
        height,
        bmr,
        activityLevel: profile.activityLevel,
        bmi: nutritionService.calculateBMI(weight, height),
        age: profile.age,
        gender: profile.gender,
      };

      setStatus('Generando menús personalizados con IA...');
      const response = await AIMenuService.generateWeeklyMenu(aiRequest);

      if (!response.success || !response.weeklyMenu) {
        throw new Error('La IA no devolvió un menú válido');
      }

      setStatus('Guardando plan semanal...');

      const now = new Date();
      const planId = Date.now().toString();
      const weeklyPlan = {
        id: planId,
        weekStart: now.toISOString(),
        weekEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalMeals: 21,
        totalCalories: Math.round(targetCalories * 7),
        totalCost: 0,
        status: 'active' as const,
        name: `Plan Semanal - ${now.toLocaleDateString('es-ES')}`,
        description: `Plan generado (web) para ${goal}`,
        nutritionGoals: { protein: 25, carbs: 50, fat: 25, fiber: 25 },
        progress: { completedMeals: 0, totalMeals: 21, percentage: 0 },
        config: { goal, weight, height, dietaryPreferences, allergens },
        meals: response.weeklyMenu,
        estimatedCalories: Math.round(targetCalories),
        createdAt: now.toISOString(),
      };

      addWeeklyPlan(weeklyPlan);

      setStatus('Generando lista de compras...');

      const ingredients = new Map<string, { quantity: string; unit: string }>();
      response.weeklyMenu.forEach(day => {
        if (day.meals) {
          Object.values(day.meals).forEach((meal: any) => {
            if (!meal) return;
            const items = Array.isArray(meal.ingredients) ? meal.ingredients : [];
            items.forEach((raw: string) => {
              const clean = (raw || '').trim().toLowerCase();
              if (!clean) return;
              if (!ingredients.has(clean)) {
                ingredients.set(clean, { quantity: '1', unit: 'unidad' });
              }
            });
          });
        }
      });

      const shoppingListItems = Array.from(ingredients.entries()).map(([name, details]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: parseFloat(details.quantity) || 1,
        unit: details.unit,
      }));

      if (shoppingListItems.length) {
        updateShoppingListFromPlan(
          {
            id: planId,
            name: weeklyPlan.name,
            description: weeklyPlan.description,
            weekStart: weeklyPlan.weekStart,
            weekEnd: weeklyPlan.weekEnd,
          },
          shoppingListItems,
        );
      }

      setStatus('¡Plan generado con IA! Revisa "Mis Planes" y tu "Lista de Compras" para ver el resultado.');
      setStatusType('success');
      setShowSuccessNotification(true);
      
      // Ocultar notificación después de 5 segundos
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    } catch (err) {
      console.error(err);
      setStatus('No se pudo generar el plan con IA. Intenta de nuevo.');
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = useMemo(
    () => [
      { id: 1, label: 'Objetivo', highlights: ['Define hacia dónde quieres avanzar este mes.', 'Usa valores reales para calorías precisas.', 'Puedes actualizar tu objetivo en cualquier momento.'] },
      { id: 2, label: 'Preferencias', highlights: ['Marca los estilos alimentarios que disfrutas.', 'Combinamos platos con carne, pescado y vegetales según tus gustos.', 'Cuantos más detalles, mejores menús sugeriremos.'] },
      { id: 3, label: 'Alergias', highlights: ['Elimina ingredientes que debamos evitar por completo.', 'Incluye alergias leves para sugerir sustituciones.', 'La lista de compras se ajustará automáticamente.'] },
    ],
    []
  );

  const currentHighlights = steps.find(step => step.id === currentStep)?.highlights ?? [];

  // Si el perfil no está cargado, mostrar un mensaje
  if (!profile) {
    return (
      <PageWrapper>
        <Header>
          <h1>Generador de Plan (Web)</h1>
          <p>Cargando tu perfil...</p>
        </Header>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SuccessNotification show={showSuccessNotification}>
        <div style={{ flex: 1 }}>
          <h3>✅ Plan creado con éxito</h3>
          <p>Tu plan semanal ha sido generado y guardado. Puedes verlo en "Mis Planes".</p>
        </div>
        <button onClick={() => setShowSuccessNotification(false)}>✕</button>
      </SuccessNotification>
      
      <Header>
        <h1>Generador de Plan (Web)</h1>
        <p>Cuestionario paso a paso. Al finalizar, generaremos tu menú semanal con IA y crearemos la lista de compras.</p>
      </Header>

      <ProgressTrail>
        {steps.map(step => (
          <ProgressItem key={step.id} active={currentStep === step.id}>
            <span>{step.id}</span>
            {step.label}
          </ProgressItem>
        ))}
      </ProgressTrail>

      <Form onSubmit={onSubmit}>
        <StepLayout>
          <StepCard>
            <StepHeading>
              <span>Paso {currentStep} de 3</span>
              <h3>{steps[currentStep - 1].label}</h3>
            </StepHeading>
            {currentStep === 1 && (
              <>
                <StepDescription>
                  Elige tu objetivo principal y comparte tus medidas actuales para que ajustemos calorías y macros.
                </StepDescription>
                <Field>
                  <Label>Objetivo principal</Label>
                  <CheckboxRow>
                    {availableGoals.map(opt => (
                      <GoalChip 
                        key={opt} 
                        $selected={goal === opt}
                        onClick={() => {
                          if (!availableGoals.includes(opt)) {
                            setStatus('Este objetivo está disponible solo para usuarios Premium. ¡Actualiza tu plan!');
                            setStatusType('error');
                            setShowUpgradePrompt(true);
                            return;
                          }
                          setGoal(opt);
                        }}
                      >
                        <input
                          type="radio"
                          name="goal"
                          value={opt}
                          checked={goal === opt}
                          onChange={() => {
                            if (!availableGoals.includes(opt)) {
                              setStatus('Este objetivo está disponible solo para usuarios Premium. ¡Actualiza tu plan!');
                              setStatusType('error');
                              setShowUpgradePrompt(true);
                              return;
                            }
                            setGoal(opt);
                          }}
                        />
                        <span>{opt}</span>
                      </GoalChip>
                    ))}
                  </CheckboxRow>
                  {!restrictions.canUseAllGoals && (
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '8px' }}>
                      Plan gratuito: Solo "Mantenimiento" disponible. <a href="/suscripcion" style={{ color: theme.colors.primary, textDecoration: 'underline' }}>Actualiza a Premium</a> para más opciones.
                    </p>
                  )}
                </Field>
                <Row>
                  <Field>
                    <Label>Peso (kg)</Label>
                    <Input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value))} />
                  </Field>
                  <Field>
                    <Label>Altura (cm)</Label>
                    <Input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value))} />
                  </Field>
                </Row>
                <Field>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      id="useCustomCalories"
                      checked={useCustomCalories}
                      onChange={e => {
                        setUseCustomCalories(e.target.checked);
                        if (!e.target.checked) {
                          setCustomCalories(null);
                        }
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <Label htmlFor="useCustomCalories" style={{ margin: 0, cursor: 'pointer' }}>
                      Especificar calorías personalizadas por día
                    </Label>
                  </div>
                  {useCustomCalories && (
                    <div style={{ marginTop: '8px' }}>
                      <Input
                        type="number"
                        placeholder="Ej: 2000"
                        value={customCalories || ''}
                        onChange={e => {
                          const value = parseFloat(e.target.value);
                          if (value > 0 && value <= 5000) {
                            setCustomCalories(value);
                          } else if (e.target.value === '') {
                            setCustomCalories(null);
                          }
                        }}
                        min="800"
                        max="5000"
                        style={{ maxWidth: '200px' }}
                      />
                      <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                        Calorías diarias objetivo. Si no especificas, se calcularán automáticamente según tu objetivo y características físicas.
                      </p>
                    </div>
                  )}
                  <p style={{ fontSize: '12px', color: theme.colors.primary, marginTop: '4px', fontWeight: 600 }}>
                    Recomendación automática para ti: {getSuggestedDailyCalories()} kcal/día (aprox.).
                  </p>
                  {customCalories && (
                    <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '2px' }}>
                      Has establecido manualmente {customCalories} kcal/día.
                    </p>
                  )}
                </Field>
              </>
            )}

            {currentStep === 2 && (
              <>
                <StepDescription>
                  Marca las preferencias que mejor describen tu estilo. Combinaremos carnes, pescados y vegetales según tu selección.
                </StepDescription>
                <CheckboxRow>
                  {availableDietaryPreferences.map(opt => (
                    <Chip 
                      key={opt}
                      $checked={dietaryPreferences.includes(opt)}
                    >
                      <input
                        type="checkbox"
                        checked={dietaryPreferences.includes(opt)}
                        onChange={() => toggleList(dietaryPreferences, opt, setDietaryPreferences, availableDietaryPreferences)}
                      />
                      <span>{opt}</span>
                    </Chip>
                  ))}
                </CheckboxRow>
                {!restrictions.canUseAllDietaryPreferences && (
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '8px' }}>
                    Opciones limitadas en plan gratuito. <a href="/suscripcion" style={{ color: theme.colors.primary, textDecoration: 'underline' }}>Actualiza a Premium</a> para más opciones.
                  </p>
                )}
              </>
            )}

            {currentStep === 3 && (
              <>
                <StepDescription>
                  Indica alergias o ingredientes que debamos evitar para que la IA ajuste recetas y lista de compras.
                </StepDescription>
                <CheckboxRow>
                  {availableAllergens.map(opt => (
                    <Chip 
                      key={opt}
                      $checked={allergens.includes(opt)}
                    >
                      <input
                        type="checkbox"
                        checked={allergens.includes(opt)}
                        onChange={() => toggleList(allergens, opt, setAllergens, availableAllergens)}
                      />
                      <span>{opt}</span>
                    </Chip>
                  ))}
                </CheckboxRow>
                {!restrictions.canUseAllAllergens && (
                  <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '8px' }}>
                    Opciones limitadas en plan gratuito. <a href="/suscripcion" style={{ color: theme.colors.primary, textDecoration: 'underline' }}>Actualiza a Premium</a> para más opciones.
                  </p>
                )}
              </>
            )}
          </StepCard>

          <SidebarCard>
            <SidebarTitle>Consejos rápidos</SidebarTitle>
            <SidebarList>
              {currentHighlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </SidebarList>
          </SidebarCard>
        </StepLayout>

        <Divider />
        {showUpgradePrompt && (
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.1), rgba(99, 102, 241, 0.1))',
            border: `2px solid ${theme.colors.primary}`,
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: theme.colors.primary }}>✨ Actualiza a Premium</h3>
            <p style={{ margin: '0 0 15px 0', color: theme.colors.textSecondary }}>
              {restrictions.upgradeRequired 
                ? `Has alcanzado el límite de ${restrictions.maxPlansAllowed} plan${restrictions.maxPlansAllowed > 1 ? 'es' : ''} gratuito${restrictions.maxPlansAllowed > 1 ? 's' : ''}. Actualiza a Premium para crear planes ilimitados.`
                : 'Esta función está disponible solo para usuarios Premium. ¡Desbloquea todas las características!'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                type="button"
                onClick={() => {
                  navigate('/suscripcion');
                  setShowUpgradePrompt(false);
                }}
                style={{ margin: 0 }}
              >
                Ver Planes Premium
              </Button>
              <Ghost 
                type="button"
                onClick={() => setShowUpgradePrompt(false)}
                style={{ margin: 0 }}
              >
                Cerrar
              </Ghost>
            </div>
          </div>
        )}
        <Actions>
          <Note statusType={statusType}>{status}</Note>
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep > 1 && (
              <Ghost
                type="button"
                onClick={() =>
                  setCurrentStep(s => {
                    const prev = Math.max(1, s - 1);
                    updateStatusForStep(prev);
                    return prev;
                  })
                }
              >
                Atrás
              </Ghost>
            )}
            <Button type="submit" disabled={isLoading || !restrictions.canCreatePlan}>
              {isLoading ? 'Generando...' : currentStep < 3 ? 'Siguiente' : 'Generar plan'}
            </Button>
          </div>
        </Actions>
        {!restrictions.canCreatePlan && currentStep === 3 && (
          <p style={{ fontSize: '14px', color: theme.colors.textSecondary, textAlign: 'center', marginTop: '10px' }}>
            Planes creados: {restrictions.plansCreated} / {restrictions.maxPlansAllowed === -1 ? '∞' : restrictions.maxPlansAllowed}
          </p>
        )}
      </Form>
    </PageWrapper>
  );
};

export default PlanGeneratorPage;

