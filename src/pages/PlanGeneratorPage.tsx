import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiZap, FiCheckCircle } from 'react-icons/fi';
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
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 800;
    color: #0a0e13;
    font-family: ${theme.fonts.heading};
    letter-spacing: -0.03em;
    line-height: 1.2;
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

const ExerciseNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1px solid rgba(46, 139, 87, 0.2);
  box-shadow: 0 4px 12px rgba(46, 139, 87, 0.1);
  margin-top: 8px;
  margin-bottom: 8px;

  &::before {
    content: '🏃';
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: ${theme.colors.primaryDark};
    line-height: 1.6;
    font-weight: 500;

    strong {
      color: ${theme.colors.primary};
      font-weight: 700;
    }
  }
`;

const SidebarCard = styled.aside`
  display: grid;
  gap: 20px;
  padding: 28px;
  border-radius: 20px;
  background: ${theme.colors.white};
  border: 1px solid rgba(46, 139, 87, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  color: ${theme.colors.textPrimary};
  position: relative;
`;

const SidebarTitle = styled.h4`
  margin: 0 0 20px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;

  svg {
    color: ${theme.colors.primary};
    flex-shrink: 0;
  }
`;

const SidebarList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
  position: relative;

  li {
    position: relative;
    padding: 14px 16px 14px 44px;
    font-size: 0.9rem;
    color: ${theme.colors.textPrimary};
    line-height: 1.6;
    font-weight: 400;
    background: ${theme.colors.white};
    border-radius: 12px;
    border: 1px solid rgba(46, 139, 87, 0.12);
    transition: all 0.2s ease;
    opacity: 1;
    transform: translateY(0);
  }

  li:hover {
    border-color: rgba(46, 139, 87, 0.25);
    box-shadow: 0 2px 8px rgba(46, 139, 87, 0.08);
  }

  li .check-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.colors.primary};
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    opacity: 1;
  }
`;

const TipIndicators = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid rgba(46, 139, 87, 0.12);
`;

const TipIndicator = styled.div<{ active: boolean }>`
  width: ${({ active }) => (active ? '24px' : '8px')};
  height: 8px;
  border-radius: 4px;
  background: ${({ active }) => 
    active 
      ? `linear-gradient(90deg, ${theme.colors.primary}, rgba(34, 197, 94, 0.8))` 
      : 'rgba(46, 139, 87, 0.25)'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: ${({ active }) => 
      active 
        ? `linear-gradient(90deg, ${theme.colors.primary}, rgba(34, 197, 94, 0.8))` 
        : 'rgba(46, 139, 87, 0.4)'};
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

const LoadingOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: ${({ show }) => (show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 32px;
  animation: ${({ show }) => (show ? 'fadeIn 0.3s ease' : 'none')};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  max-width: 500px;
  padding: 0 32px;
`;

const Spinner = styled.div`
  width: 80px;
  height: 80px;
  border: 6px solid rgba(46, 139, 87, 0.1);
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 800;
  color: #0a0e13;
  font-family: ${theme.fonts.heading};
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const LoadingMessage = styled.p`
  margin: 0;
  font-size: 18px;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
`;

const LoadingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`;

const LoadingStep = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${({ active, completed }) => 
    completed ? 'rgba(46, 139, 87, 0.1)' : 
    active ? 'rgba(46, 139, 87, 0.15)' : 
    'rgba(46, 139, 87, 0.05)'};
  color: ${({ active, completed }) => 
    completed ? theme.colors.primary : 
    active ? theme.colors.primaryDark : 
    theme.colors.textSecondary};
  font-size: 14px;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  transition: all 0.3s ease;

  &::before {
    content: ${({ completed }) => (completed ? '"✓"' : '"○"')};
    font-size: 18px;
    font-weight: 700;
    color: ${({ completed, active }) => 
      completed ? theme.colors.primary : 
      active ? theme.colors.primary : 
      theme.colors.textSecondary};
  }
`;

const TimeEstimator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1px solid rgba(46, 139, 87, 0.2);
  box-shadow: 0 4px 16px rgba(46, 139, 87, 0.1);
  min-width: 280px;
  margin-top: 8px;
`;

const TimeLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TimeDisplay = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${theme.colors.primary};
  font-family: ${theme.fonts.heading};
  letter-spacing: -0.02em;
  display: flex;
  align-items: baseline;
  gap: 4px;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }

  span {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${theme.colors.textSecondary};
  }
`;

const TimeOscillator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const OscillatorDot = styled.div<{ delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  animation: oscillate 1.5s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;

  @keyframes oscillate {
    0%, 100% {
      transform: translateY(0) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-8px) scale(1.2);
      opacity: 1;
    }
  }
`;

const TimeRange = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin-top: 4px;
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
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(240); // 4 minutos en segundos (rango 3-5 min)
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [status, setStatus] = useState<string>('');
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
      1: '',
      2: '',
      3: '',
    };
    setStatus(messages[step] ?? '');
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
    setLoadingStep(1);
    setElapsedTime(0);
    // Estimar tiempo entre 3-5 minutos (180-300 segundos)
    setEstimatedTime(Math.floor(Math.random() * 120) + 180);
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

      setLoadingStep(2);
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

      setLoadingStep(3);
      setStatus('Generando menús personalizados con IA...');
      const response = await AIMenuService.generateWeeklyMenu(aiRequest);

      if (!response.success || !response.weeklyMenu) {
        throw new Error('La IA no devolvió un menú válido');
      }

      setLoadingStep(4);
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

      setLoadingStep(5);
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

      setLoadingStep(6);
      setStatus('¡Plan generado con IA! Revisa "Mis Planes" y tu "Lista de Compras" para ver el resultado.');
      setStatusType('success');
      
      // Esperar un momento antes de ocultar el loading
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStep(0);
        setShowSuccessNotification(true);
        
        // Ocultar notificación después de 5 segundos
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 5000);
      }, 500);
    } catch (err) {
      console.error(err);
      setStatus('No se pudo generar el plan con IA. Intenta de nuevo.');
      setStatusType('error');
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  // Consejos dinámicos según el objetivo seleccionado
  const getDynamicTips = (goal: string, step: number): string[] => {
    if (step === 1) {
      const goalTips: Record<string, string[]> = {
        'Pérdida de peso': [
          'Haz ejercicio regularmente, al menos 30 minutos al día',
          'Sal a corer o caminar para quemar calorías',
          'Bebe mucha agua, al menos 2 litros diarios',
          'Mantén un déficit calórico constante',
          'Duerme bien, el descanso es clave para perder peso',
          'Haz más deporte, combina cardio y fuerza',
          'Evita el sedentarismo, muévete cada hora',
          'Camina 10,000 pasos al día',
          'Haz entrenamiento de intervalos de alta intensidad',
          'Incluye ejercicios de resistencia en tu rutina',
          'Bebe agua antes de cada comida para sentirte más lleno',
          'Come proteína en cada comida para mantener la masa muscular',
          'Evita las bebidas azucaradas y el alcohol',
          'Planifica tus comidas con anticipación',
          'Mastica lentamente y disfruta cada bocado',
          'Come más vegetales y frutas frescas',
          'Reduce el consumo de alimentos procesados',
          'Haz ejercicio por la mañana para activar el metabolismo',
          'Usa las escaleras en lugar del ascensor',
          'Haz yoga o estiramientos para reducir el estrés',
          'Mantén un diario de alimentos para ser consciente',
          'Come en platos más pequeños para controlar porciones',
          'Bebe té verde para acelerar el metabolismo',
          'Haz ejercicio con amigos para mantener la motivación',
          'Duerme 7-9 horas cada noche',
          'Evita comer tarde en la noche',
          'Haz ejercicio al aire libre para obtener vitamina D',
          'Come alimentos ricos en fibra para sentirte satisfecho',
          'Bebe un vaso de agua al despertar',
          'Haz ejercicio después de las comidas para mejorar la digestión',
          'Incluye pescado en tu dieta 2-3 veces por semana',
          'Haz ejercicios de peso corporal en casa',
          'Camina después de cada comida',
          'Bebe agua con limón en ayunas',
          'Haz ejercicio de fuerza para aumentar el metabolismo',
          'Come snacks saludables entre comidas',
          'Haz ejercicio mientras ves televisión',
          'Bebe infusiones sin azúcar',
          'Haz ejercicio en grupo para mayor compromiso',
          'Come alimentos ricos en proteína magra',
          'Haz ejercicio variado para evitar el aburrimiento',
          'Bebe agua durante el ejercicio',
          'Haz ejercicio de bajo impacto si tienes lesiones',
          'Come alimentos integrales en lugar de refinados',
          'Haz ejercicio con música para aumentar la motivación',
          'Bebe agua antes de hacer ejercicio',
          'Haz ejercicio progresivo aumentando la intensidad',
          'Come alimentos con bajo índice glucémico',
          'Haz ejercicio de resistencia para tonificar',
          'Bebe agua después del ejercicio para rehidratarte',
          'Haz ejercicio funcional para la vida diaria'
        ],
        'Mantenimiento': [
          'Mantén una actividad física moderada',
          'Sal a caminar o hacer ejercicio 3-4 veces por semana',
          'Bebe suficiente agua durante el día',
          'Equilibra tus comidas con todos los nutrientes',
          'Escucha a tu cuerpo y ajusta según necesites',
          'Haz ejercicio variado para mantener el interés',
          'Bebe agua regularmente durante el día',
          'Come una dieta balanceada con todos los grupos alimentarios',
          'Haz ejercicio que disfrutes para mantener la constancia',
          'Mantén horarios regulares de comidas',
          'Haz ejercicio de fuerza 2-3 veces por semana',
          'Bebe agua antes de sentir sed',
          'Come alimentos frescos y naturales',
          'Haz ejercicio al aire libre cuando sea posible',
          'Bebe agua con las comidas',
          'Come porciones moderadas de todos los alimentos',
          'Haz ejercicio de flexibilidad regularmente',
          'Bebe agua después de despertar',
          'Come alimentos ricos en nutrientes',
          'Haz ejercicio con amigos o familia',
          'Bebe agua durante las actividades físicas',
          'Come alimentos de temporada',
          'Haz ejercicio de bajo impacto para cuidar las articulaciones',
          'Bebe agua antes de acostarte',
          'Come alimentos de diferentes colores',
          'Haz ejercicio de resistencia para mantener la fuerza',
          'Bebe agua con limón para hidratación extra',
          'Come alimentos locales cuando sea posible',
          'Haz ejercicio de equilibrio y coordinación',
          'Bebe agua filtrada o purificada',
          'Come alimentos preparados en casa',
          'Haz ejercicio de relajación como yoga',
          'Bebe agua a temperatura ambiente',
          'Come alimentos sin procesar',
          'Haz ejercicio de cardio moderado',
          'Bebe agua durante todo el día',
          'Come alimentos ricos en antioxidantes',
          'Haz ejercicio de estiramiento diario',
          'Bebe agua con electrolitos después del ejercicio intenso',
          'Come alimentos con grasas saludables',
          'Haz ejercicio de resistencia progresiva',
          'Bebe agua antes de hacer ejercicio',
          'Come alimentos con carbohidratos complejos',
          'Haz ejercicio de movilidad articular',
          'Bebe agua después de las comidas',
          'Come alimentos con proteína completa',
          'Haz ejercicio de recuperación activa',
          'Bebe agua con frutas para sabor natural',
          'Come alimentos con fibra soluble e insoluble',
          'Haz ejercicio de coordinación y agilidad',
          'Bebe agua para mantener la hidratación celular'
        ],
        'Aumento de masa muscular': [
          'Entrena con pesas o ejercicios de fuerza regularmente',
          'Haz más deporte, combina cardio y fuerza',
          'Bebe mucha agua, especialmente después del entrenamiento',
          'Asegura suficiente proteína en cada comida',
          'Descansa bien para que los músculos se recuperen',
          'Haz ejercicio de fuerza 4-5 veces por semana',
          'Bebe proteína después del entrenamiento',
          'Come proteína dentro de 30 minutos después del ejercicio',
          'Haz ejercicio de hipertrofia con pesos adecuados',
          'Bebe agua durante el entrenamiento',
          'Come carbohidratos después del entrenamiento para recuperación',
          'Haz ejercicio de fuerza progresiva',
          'Bebe batidos de proteína post-entrenamiento',
          'Come proteína en cada comida principal',
          'Haz ejercicio de resistencia con repeticiones controladas',
          'Bebe agua con electrolitos después del entrenamiento intenso',
          'Come alimentos ricos en proteína magra',
          'Haz ejercicio de fuerza compuesto',
          'Bebe agua antes, durante y después del ejercicio',
          'Come proteína de alta calidad biológica',
          'Haz ejercicio de aislamiento para grupos musculares específicos',
          'Bebe batidos de proteína y carbohidratos',
          'Come proteína animal y vegetal combinada',
          'Haz ejercicio de fuerza con técnica correcta',
          'Bebe agua para mantener la hidratación muscular',
          'Come proteína antes de acostarte',
          'Haz ejercicio de fuerza con periodización',
          'Bebe agua con creatina si la usas',
          'Come proteína en el desayuno',
          'Haz ejercicio de fuerza con descanso adecuado',
          'Bebe agua para optimizar la síntesis de proteína',
          'Come proteína de huevo completa',
          'Haz ejercicio de fuerza con sobrecarga progresiva',
          'Bebe agua para mejorar la recuperación',
          'Come proteína de pescado rica en omega-3',
          'Haz ejercicio de fuerza con rango completo de movimiento',
          'Bebe agua para mantener el volumen muscular',
          'Come proteína de carne magra',
          'Haz ejercicio de fuerza con contracción excéntrica',
          'Bebe agua para prevenir la deshidratación',
          'Come proteína de legumbres y granos',
          'Haz ejercicio de fuerza con variación',
          'Bebe agua para optimizar el rendimiento',
          'Come proteína de productos lácteos',
          'Haz ejercicio de fuerza con intensidad adecuada',
          'Bebe agua para mantener la masa muscular',
          'Come proteína de fuentes variadas',
          'Haz ejercicio de fuerza con descanso entre series',
          'Bebe agua para mejorar la fuerza',
          'Come proteína distribuida a lo largo del día',
          'Haz ejercicio de fuerza con calentamiento previo',
          'Bebe agua para maximizar el crecimiento muscular'
        ],
        'Control de diabetes': [
          'Haz ejercicio moderado de forma regular',
          'Sal a caminar después de las comidas',
          'Bebe agua constantemente durante el día',
          'Controla los niveles de glucosa regularmente',
          'Mantén horarios regulares de comidas',
          'Haz ejercicio de baja intensidad constante',
          'Bebe agua antes de las comidas',
          'Come alimentos con bajo índice glucémico',
          'Haz ejercicio de resistencia ligera',
          'Bebe agua durante las comidas',
          'Come carbohidratos complejos en lugar de simples',
          'Haz ejercicio de caminata diaria',
          'Bebe agua para ayudar a regular la glucosa',
          'Come alimentos ricos en fibra',
          'Haz ejercicio de estiramiento suave',
          'Bebe agua con limón sin azúcar',
          'Come porciones controladas de carbohidratos',
          'Haz ejercicio de yoga o tai chi',
          'Bebe agua para mantener la hidratación',
          'Come alimentos con proteína magra',
          'Haz ejercicio de natación suave',
          'Bebe agua antes de hacer ejercicio',
          'Come alimentos con grasas saludables',
          'Haz ejercicio de bicicleta estática',
          'Bebe agua después de las comidas',
          'Come alimentos sin azúcares añadidos',
          'Haz ejercicio de bajo impacto',
          'Bebe agua para ayudar al metabolismo',
          'Come alimentos integrales',
          'Haz ejercicio de resistencia ligera',
          'Bebe agua durante todo el día',
          'Come alimentos con índice glucémico bajo',
          'Haz ejercicio de movilidad suave',
          'Bebe agua para mejorar la sensibilidad a la insulina',
          'Come alimentos ricos en magnesio',
          'Haz ejercicio de relajación',
          'Bebe agua con canela sin azúcar',
          'Come alimentos con cromo',
          'Haz ejercicio de fuerza ligera',
          'Bebe agua para mantener niveles estables',
          'Come alimentos con zinc',
          'Haz ejercicio de equilibrio',
          'Bebe agua para optimizar la función pancreática',
          'Come alimentos con ácido alfa-lipoico',
          'Haz ejercicio de coordinación',
          'Bebe agua para mejorar el control glucémico',
          'Come alimentos con vitamina D',
          'Haz ejercicio de resistencia moderada',
          'Bebe agua para mantener la homeostasis',
          'Come alimentos con omega-3',
          'Haz ejercicio de flexibilidad',
          'Bebe agua para regular la glucosa en sangre'
        ],
        'Salud cardiovascular': [
          'Haz ejercicio cardiovascular regularmente',
          'Sal a corer o caminar a paso ligero',
          'Bebe mucha agua para mantener el corazón sano',
          'Evita el sedentarismo, muévete cada hora',
          'Combina ejercicio con una dieta equilibrada',
          'Haz ejercicio de cardio 5 veces por semana',
          'Bebe agua para mantener la presión arterial',
          'Come alimentos ricos en omega-3',
          'Haz ejercicio de caminata rápida',
          'Bebe agua para mejorar la circulación',
          'Come alimentos con bajo contenido de sodio',
          'Haz ejercicio de natación',
          'Bebe agua para mantener el corazón hidratado',
          'Come alimentos ricos en potasio',
          'Haz ejercicio de ciclismo',
          'Bebe agua para reducir el riesgo cardiovascular',
          'Come alimentos con antioxidantes',
          'Haz ejercicio de running moderado',
          'Bebe agua para mantener la elasticidad vascular',
          'Come alimentos con fibra soluble',
          'Haz ejercicio de elíptica',
          'Bebe agua para mejorar la función cardíaca',
          'Come alimentos con grasas saludables',
          'Haz ejercicio de remo',
          'Bebe agua para mantener el volumen sanguíneo',
          'Come alimentos con vitamina E',
          'Haz ejercicio de baile',
          'Bebe agua para optimizar el flujo sanguíneo',
          'Come alimentos con coenzima Q10',
          'Haz ejercicio de escaleras',
          'Bebe agua para mantener la presión normal',
          'Come alimentos con resveratrol',
          'Haz ejercicio de HIIT moderado',
          'Bebe agua para mejorar la salud arterial',
          'Come alimentos con licopeno',
          'Haz ejercicio de caminata nórdica',
          'Bebe agua para mantener la función endotelial',
          'Come alimentos con flavonoides',
          'Haz ejercicio de entrenamiento en circuito',
          'Bebe agua para reducir la viscosidad sanguínea',
          'Come alimentos con betacarotenos',
          'Haz ejercicio de entrenamiento funcional',
          'Bebe agua para mantener la frecuencia cardíaca saludable',
          'Come alimentos con vitamina C',
          'Haz ejercicio de entrenamiento de intervalos',
          'Bebe agua para mejorar la oxigenación',
          'Come alimentos con selenio',
          'Haz ejercicio de entrenamiento de resistencia',
          'Bebe agua para mantener la salud vascular',
          'Come alimentos con ácido fólico',
          'Haz ejercicio de entrenamiento de flexibilidad',
          'Bebe agua para optimizar la salud cardiovascular'
        ]
      };
      return goalTips[goal] || goalTips['Mantenimiento'];
    }
    
    // Consejos para otros pasos
    if (step === 2) {
      return [
        'Marca los estilos alimentarios que disfrutas',
        'Combinamos platos con carne, pescado y vegetales según tus gustos',
        'Cuantos más detalles, mejores menús sugeriremos'
      ];
    }
    
    if (step === 3) {
      return [
        'Elimina ingredientes que debamos evitar por completo',
        'Incluye alergias leves para sugerir sustituciones',
        'La lista de compras se ajustará automáticamente'
      ];
    }
    
    return [];
  };

  const steps = useMemo(
    () => [
      { id: 1, label: 'Objetivo' },
      { id: 2, label: 'Preferencias' },
      { id: 3, label: 'Alergias' },
    ],
    []
  );

  const allTips = getDynamicTips(goal, currentStep);
  
  // Función para obtener 4 consejos aleatorios
  const getRandomTips = (tips: string[], count: number): string[] => {
    if (tips.length === 0) return [];
    if (tips.length <= count) return tips;
    
    const shuffled = [...tips].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const [currentTips, setCurrentTips] = useState<string[]>([]);
  
  // Actualizar consejos aleatorios cada 4 segundos
  React.useEffect(() => {
    if (allTips.length === 0) {
      setCurrentTips([]);
      return;
    }
    
    // Establecer consejos iniciales
    setCurrentTips(getRandomTips(allTips, 4));
    
    const interval = setInterval(() => {
      setCurrentTips(getRandomTips(allTips, 4));
    }, 4000);

    return () => clearInterval(interval);
  }, [allTips.length, goal, currentStep]);

  const currentHighlights = currentTips;

  // Si el perfil no está cargado, mostrar un mensaje
  if (!profile) {
    return (
      <PageWrapper>
        <Header>
          <h1>Generador Semanal</h1>
          <p>Cargando tu perfil...</p>
        </Header>
      </PageWrapper>
    );
  }

  const loadingSteps = [
    { id: 1, label: 'Calculando parámetros nutricionales' },
    { id: 2, label: 'Preparando solicitud para IA' },
    { id: 3, label: 'Generando menús personalizados con IA' },
    { id: 4, label: 'Guardando plan semanal' },
    { id: 5, label: 'Generando lista de compras' },
    { id: 6, label: 'Finalizando...' },
  ];

  // Actualizar tiempo transcurrido cada segundo cuando está cargando
  React.useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Calcular tiempo restante estimado
  const remainingTime = Math.max(0, estimatedTime - elapsedTime);
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const formatTime = (mins: number, secs: number) => {
    if (mins === 0 && secs === 0) return 'Casi listo...';
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <PageWrapper>
      <LoadingOverlay show={isLoading}>
        <LoadingContent>
          <Spinner />
          <LoadingTitle>Generando tu plan semanal</LoadingTitle>
          <LoadingMessage>
            Estamos creando un plan personalizado para ti. Esto puede tardar unos momentos...
          </LoadingMessage>
          <TimeEstimator>
            <TimeLabel>Tiempo estimado restante</TimeLabel>
            <TimeDisplay>
              {formatTime(minutes, seconds)}
            </TimeDisplay>
            <TimeOscillator>
              <OscillatorDot delay={0} />
              <OscillatorDot delay={0.2} />
              <OscillatorDot delay={0.4} />
            </TimeOscillator>
            <TimeRange>Estimado: 3-5 minutos</TimeRange>
          </TimeEstimator>
          <LoadingSteps>
            {loadingSteps.map((step) => (
              <LoadingStep
                key={step.id}
                active={loadingStep === step.id}
                completed={loadingStep > step.id}
              >
                {step.label}
              </LoadingStep>
            ))}
          </LoadingSteps>
        </LoadingContent>
      </LoadingOverlay>

      <SuccessNotification show={showSuccessNotification}>
        <div style={{ flex: 1 }}>
          <h3>✅ Plan creado con éxito</h3>
          <p>Tu plan semanal ha sido generado y guardado. Puedes verlo en "Mis Planes".</p>
        </div>
        <button onClick={() => setShowSuccessNotification(false)}>✕</button>
      </SuccessNotification>
      
      <Header>
        <h1>Generador de Plan</h1>
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
                <ExerciseNotice>
                  <p>
                    <strong>Importante:</strong> Cualquier objetivo físico se debe acompañar siempre con algún tipo de ejercicio físico. 
                    La combinación de una alimentación adecuada y actividad física regular es fundamental para alcanzar tus metas de manera saludable y sostenible.
                  </p>
                </ExerciseNotice>
                <Field>
                  <Label>Objetivo principal</Label>
                  <CheckboxRow>
                    {availableGoals.map(opt => (
                      <GoalChip 
                        key={opt} 
                        $selected={goal === opt}
                        onClick={() => {
                          if (isLoading) return;
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
                            if (isLoading) return;
                            if (!availableGoals.includes(opt)) {
                              setStatus('Este objetivo está disponible solo para usuarios Premium. ¡Actualiza tu plan!');
                              setStatusType('error');
                              setShowUpgradePrompt(true);
                              return;
                            }
                            setGoal(opt);
                          }}
                          disabled={isLoading}
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
                    <Input 
                      type="number" 
                      value={weight} 
                      onChange={e => setWeight(parseFloat(e.target.value))}
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <Label>Altura (cm)</Label>
                    <Input 
                      type="number" 
                      value={height} 
                      onChange={e => setHeight(parseFloat(e.target.value))}
                      disabled={isLoading}
                    />
                  </Field>
                </Row>
                <Field>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      id="useCustomCalories"
                      checked={useCustomCalories}
                      onChange={e => {
                        if (isLoading) return;
                        setUseCustomCalories(e.target.checked);
                        if (!e.target.checked) {
                          setCustomCalories(null);
                        }
                      }}
                      disabled={isLoading}
                      style={{ width: '18px', height: '18px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
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
                          if (isLoading) return;
                          const value = parseFloat(e.target.value);
                          if (value > 0 && value <= 5000) {
                            setCustomCalories(value);
                          } else if (e.target.value === '') {
                            setCustomCalories(null);
                          }
                        }}
                        min="800"
                        max="5000"
                        disabled={isLoading}
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
                        onChange={() => {
                          if (isLoading) return;
                          toggleList(dietaryPreferences, opt, setDietaryPreferences, availableDietaryPreferences);
                        }}
                        disabled={isLoading}
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
                        onChange={() => {
                          if (isLoading) return;
                          toggleList(allergens, opt, setAllergens, availableAllergens);
                        }}
                        disabled={isLoading}
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
            <SidebarTitle>
              <FiZap size={22} />
              Consejos rápidos
            </SidebarTitle>
            <SidebarList>
              {currentHighlights.length > 0 ? (
                currentHighlights.map((tip, index) => (
                  <li key={`${goal}-${currentStep}-${currentTipIndex}-${index}`}>
                    <FiCheckCircle className="check-icon" />
                    {tip}
                  </li>
                ))
              ) : (
                <li>
                  <FiCheckCircle className="check-icon" />
                  Selecciona un objetivo para ver consejos personalizados
                </li>
              )}
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
          {status && <Note statusType={statusType}>{status}</Note>}
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep > 1 && (
              <Ghost
                type="button"
                onClick={() => {
                  if (isLoading) return;
                  setCurrentStep(s => {
                    const prev = Math.max(1, s - 1);
                    updateStatusForStep(prev);
                    return prev;
                  });
                }}
                disabled={isLoading}
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

