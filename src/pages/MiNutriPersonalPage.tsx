import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTarget, FiCheckCircle, FiTrendingUp, FiCalendar, FiActivity, FiMessageCircle, FiX, FiTrash2 } from 'react-icons/fi';
import { theme } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';
import { useUserProfile } from '../context/UserProfileContext';
import OnboardingStep from '../components/minutri/OnboardingStep';
import PreferencesQuestionnaire from '../components/minutri/PreferencesQuestionnaire';
import MonthlyCalendarView from '../components/minutri/MonthlyCalendarView';
import WeeklyExercises from '../components/minutri/WeeklyExercises';
import MonthResults from '../components/minutri/MonthResults';
import TrophyProgress from '../components/minutri/TrophyProgress';
import GoalAchievedScreen from '../components/minutri/GoalAchievedScreen';
import { minutriService, Module, DayTracking } from '../services/minutriService';
import { generateModuleContent, DailyContent } from '../services/minutriContentService';

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

// Estilos base
const PageWrapper = styled.div`
  width: 100%;
  margin: 0;
  padding: 12px;
  animation: ${fadeInUp} 0.6s ease-out;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 10px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const Header = styled.div`
  margin-bottom: 12px;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const Title = styled.h1`
  margin: 0 0 12px 0;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #0a0e13;
  font-family: ${theme.fonts.heading};
  letter-spacing: -0.03em;
  line-height: 1.2;
  background: linear-gradient(135deg, ${theme.colors.primaryDark} 0%, ${theme.colors.primary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  font-size: clamp(16px, 3vw, 18px);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const ViewButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid ${props => props.active ? theme.colors.primary : 'rgba(46, 139, 87, 0.2)'};
  background: ${props => props.active 
    ? `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%)`
    : theme.colors.white};
  color: ${props => props.active ? 'white' : theme.colors.primaryDark};
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.active 
      ? '0 4px 12px rgba(46, 139, 87, 0.3)'
      : '0 2px 8px rgba(46, 139, 87, 0.2)'};
  }
  
  svg {
    font-size: 18px;
  }
`;

const MainContent = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;


const Sidebar = styled.aside`
  display: grid;
  gap: 20px;
  min-width: 0;
`;

const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: 12px;
  padding: 12px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);
  animation: ${fadeInUp} 0.6s ease-out;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 10px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    border-radius: 8px;
  }
`;

const PremiumBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(46, 139, 87, 0.12) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.25);
  color: ${theme.colors.primaryDark};
  font-weight: 600;
  font-size: 15px;
  margin: 0 auto 16px auto;
  max-width: 600px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.2);
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(46, 139, 87, 0.15) 100%);
  }
  
  svg {
    color: ${theme.colors.primaryDark};
    flex-shrink: 0;
  }
`;

// Pantalla de carga para generación de planes mensales
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
      active ? theme.colors.primaryDark : 
      theme.colors.textSecondary};
    width: 24px;
    text-align: center;
  }
`;

const MiNutriPersonalPage: React.FC = () => {
  const { currentPlan } = useSubscription();
  const { profile } = useUserProfile();
  const [hasRoadmap, setHasRoadmap] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [validatedGoal, setValidatedGoal] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [trackingDays, setTrackingDays] = useState<DayTracking[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [adherence, setAdherence] = useState(0);
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [moduleContent, setModuleContent] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [dayCompletions, setDayCompletions] = useState<{ [dayNumber: number]: { breakfast: boolean; lunch: boolean; dinner: boolean; exercise: boolean } }>({});
  
  // Estados para pantalla de carga
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  
  // Estados para resultados del mes
  const [showResults, setShowResults] = useState(false);
  const [monthResults, setMonthResults] = useState<{ finalWeight?: number; notes?: string } | null>(null);
  const [showGoalAchieved, setShowGoalAchieved] = useState(false);
  
  // Estado para alternar entre ejercicios y calendario
  const [activeView, setActiveView] = useState<'exercises' | 'calendar'>('calendar');

  // Permitir acceso a todos los usuarios (incluyendo plan gratis)
  // const isPremium = currentPlan && currentPlan.plan !== 'free' && currentPlan.isActive;
  const isPremium = true; // Siempre permitir acceso

  useEffect(() => {
    // Verificar si ya tiene un roadmap configurado
    const roadmapData = minutriService.getRoadmap();
    if (roadmapData) {
      setHasRoadmap(true);
      setIsOnboarding(false);
      
      // Cargar módulos
      let savedModules = minutriService.getModules();
      if (!savedModules) {
        savedModules = minutriService.generateModules(roadmapData);
        minutriService.saveModules(savedModules);
      }
      setModules(savedModules);
      
      // Encontrar módulo activo
      const active = savedModules.find(m => m.isActive);
      if (active) {
        setActiveModule(active);
        
        // Cargar tracking
        let tracking = minutriService.getTracking(active.id);
        if (!tracking) {
          const startDate = new Date(roadmapData.createdAt);
          startDate.setDate(startDate.getDate() + ((active.id - 1) * 30));
          tracking = minutriService.initializeTracking(active.id, startDate);
          minutriService.saveTracking(active.id, tracking);
        }
        setTrackingDays(tracking);
        
        // Calcular día actual y adherencia
        const day = minutriService.getCurrentDay(active.startDate);
        setCurrentDay(day);
        setAdherence(minutriService.calculateAdherence(tracking));
        
        // Cargar completions desde tracking
        const completions: { [key: number]: { breakfast: boolean; lunch: boolean; dinner: boolean; exercise: boolean } } = {};
        tracking.forEach(t => {
          completions[t.day] = {
            breakfast: t.meals.breakfast,
            lunch: t.meals.lunch,
            dinner: t.meals.dinner,
            exercise: t.exercise,
          };
        });
        setDayCompletions(completions);
        
        // Cargar o generar contenido del módulo
        loadModuleContent(roadmapData, active, day);
      }
    }
  }, []);

  // Función para verificar si se debe mostrar el modal de resultados
  const checkIfShouldShowResults = (updatedTracking: DayTracking[]) => {
    if (!activeModule || showResults) return;
    
    // Verificar días completamente completados (las 3 comidas + ejercicio)
    const completedDays = updatedTracking.filter(d => 
      d.meals.breakfast && d.meals.lunch && d.meals.dinner && d.exercise
    ).length;
    
    // Mostrar el modal si:
    // 1. Ha completado TODOS los 30 días completos (independientemente del día actual)
    // 2. O ha completado al menos 20 días completos Y está en el día 30 o más
    if (completedDays >= 30 || (completedDays >= 20 && currentDay >= 30)) {
      setShowResults(true);
    }
  };

  const handleSaveResults = (results: { finalWeight?: number; notes?: string }) => {
    setMonthResults(results);
    // Aquí podrías guardar los resultados en localStorage o enviarlos a un backend
    console.log('Resultados del mes guardados:', results);
  };

  const handleCreateNewPlan = () => {
    try {
      // Asegurar que el modal esté cerrado
      setShowResults(false);
      
      // Obtener el roadmap actual
      const currentRoadmap = minutriService.getRoadmap();
      if (!currentRoadmap) {
        // Si no hay roadmap, limpiar todo y volver al onboarding
        minutriService.clearRoadmap();
        setHasRoadmap(false);
        setIsOnboarding(true);
        setModules([]);
        setActiveModule(null);
        setTrackingDays([]);
        setModuleContent(null);
        setDayCompletions({});
        setCurrentDay(1);
        setAdherence(0);
        setCurrentMonth(1);
        setMonthResults(null);
        return;
      }

      // Actualizar el peso actual con el peso final del mes anterior (si se proporcionó)
      if (monthResults?.finalWeight) {
        currentRoadmap.currentValue = monthResults.finalWeight;
        minutriService.saveRoadmap(currentRoadmap);
      }

      // Verificar si se alcanzó el objetivo
      const currentWeight = monthResults?.finalWeight || currentRoadmap.currentValue;
      const weightDifference = Math.abs(currentWeight - currentRoadmap.targetValue);
      const goalReached = weightDifference <= 0.5; // Considerar objetivo alcanzado si está a 0.5kg o menos

      if (goalReached) {
        // Mostrar pantalla de felicitaciones
        setShowGoalAchieved(true);
        return;
      }

      // Generar el siguiente módulo
      const currentModules = minutriService.getModules() || [];
      const nextModuleId = currentModules.length + 1;
      
      // Continuar generando planes hasta alcanzar el objetivo
      // No limitar por número de módulos, sino por si se alcanzó el objetivo
      if (weightDifference > 0.5) {
        // Generar el siguiente módulo
        const newModule: Module = {
          id: nextModuleId,
          title: `Módulo ${nextModuleId}`,
          startDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          milestone: currentRoadmap.finalGoal === 'weight_loss'
            ? `Alcanzar ${(currentRoadmap.targetValue - ((currentRoadmap.targetValue - currentRoadmap.currentValue) / currentRoadmap.modules * nextModuleId)).toFixed(1)}kg`
            : `Alcanzar ${(currentRoadmap.currentValue + ((currentRoadmap.targetValue - currentRoadmap.currentValue) / currentRoadmap.modules * nextModuleId)).toFixed(1)}kg`,
          isActive: true,
          isCompleted: false,
          isLocked: false,
          progress: 0,
          adherence: 0,
          targetAdherence: 80,
        };

        // Desactivar el módulo anterior
        const updatedModules = currentModules.map(m => ({ ...m, isActive: false }));
        updatedModules.push(newModule);
        minutriService.saveModules(updatedModules);
        setModules(updatedModules);

        // Inicializar tracking del nuevo módulo
        const startDate = new Date();
        const tracking = minutriService.initializeTracking(newModule.id, startDate);
        minutriService.saveTracking(newModule.id, tracking);

        setActiveModule(newModule);
        setTrackingDays(tracking);
        setCurrentDay(1);
        setAdherence(0);
        setCurrentMonth(nextModuleId);
        setMonthResults(null);
        setActiveView('calendar');

        // Inicializar completions
        const completions: { [key: number]: { breakfast: boolean; lunch: boolean; dinner: boolean; exercise: boolean } } = {};
        tracking.forEach(t => {
          completions[t.day] = {
            breakfast: t.meals.breakfast,
            lunch: t.meals.lunch,
            dinner: t.meals.dinner,
            exercise: t.exercise,
          };
        });
        setDayCompletions(completions);

        // Generar contenido del nuevo módulo
        setTimeout(() => {
          loadModuleContent(currentRoadmap, newModule, 1, true);
        }, 500);
      } else {
        // Si por alguna razón no se puede generar más módulos pero no se alcanzó el objetivo,
        // mostrar mensaje y permitir continuar
        alert('Continuaremos generando planes hasta que alcances tu objetivo. Se creará un nuevo módulo.');
        // Crear un módulo adicional
        const extraModule: Module = {
          id: nextModuleId,
          title: `Módulo ${nextModuleId}`,
          startDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          milestone: currentRoadmap.finalGoal === 'weight_loss'
            ? `Alcanzar ${currentRoadmap.targetValue.toFixed(1)}kg`
            : `Alcanzar ${currentRoadmap.targetValue.toFixed(1)}kg`,
          isActive: true,
          isCompleted: false,
          isLocked: false,
          progress: 0,
          adherence: 0,
          targetAdherence: 80,
        };

        const updatedModules = currentModules.map(m => ({ ...m, isActive: false }));
        updatedModules.push(extraModule);
        minutriService.saveModules(updatedModules);
        setModules(updatedModules);

        const startDate = new Date();
        const tracking = minutriService.initializeTracking(extraModule.id, startDate);
        minutriService.saveTracking(extraModule.id, tracking);

        setActiveModule(extraModule);
        setTrackingDays(tracking);
        setCurrentDay(1);
        setAdherence(0);
        setCurrentMonth(nextModuleId);
        setMonthResults(null);
        setActiveView('calendar');

        const completions: { [key: number]: { breakfast: boolean; lunch: boolean; dinner: boolean; exercise: boolean } } = {};
        tracking.forEach(t => {
          completions[t.day] = {
            breakfast: t.meals.breakfast,
            lunch: t.meals.lunch,
            dinner: t.meals.dinner,
            exercise: t.exercise,
          };
        });
        setDayCompletions(completions);

        setTimeout(() => {
          loadModuleContent(currentRoadmap, extraModule, 1, true);
        }, 500);
      }
    } catch (error) {
      console.error('Error en handleCreateNewPlan:', error);
      // Asegurar que el modal se cierre incluso si hay un error
      setShowResults(false);
      alert('Hubo un error al crear el nuevo plan. Por favor, intenta de nuevo.');
    }
  };

  const loadModuleContent = async (roadmap: any, module: Module, day: number, showLoading: boolean = false, preferences?: { allergies: string[]; dietaryPreferences: string[] }) => {
    if (showLoading) {
      setIsGeneratingPlan(true);
      setLoadingStep(1);
      setLoadingStatus('Iniciando generación de plan mensal...');
    } else {
      setIsLoadingContent(true);
    }
    
    try {
      // Verificar si ya existe contenido guardado
      const savedContent = localStorage.getItem(`minutri_content_${module.id}`);
      let content;
      
      if (savedContent && !showLoading) {
        // Si hay contenido guardado y no se está regenerando, usarlo
        content = JSON.parse(savedContent);
      } else {
        // Generar nuevo contenido con pantalla de carga
        if (showLoading) {
          setLoadingStep(2);
          setLoadingStatus('Calculando objetivos nutricionales y requerimientos calóricos...');
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        if (showLoading) {
          setLoadingStep(3);
          setLoadingStatus('Generando menús personalizados con IA (esto puede tomar 2-3 minutos)...');
        }
        
        // Generar contenido completo del módulo con timeout más largo
        const contentPromise = generateModuleContent(
          module.id,
          {
            finalGoal: roadmap.finalGoal,
            targetValue: roadmap.targetValue,
            currentValue: roadmap.currentValue,
            timeframe: roadmap.timeframe,
          },
          {
            weight: profile?.weight,
            height: profile?.height,
            age: profile?.age,
            gender: profile?.gender,
            activityLevel: profile?.activityLevel,
            allergies: preferences?.allergies || roadmap.allergies || (profile as any)?.allergies || [],
            dietaryPreferences: preferences?.dietaryPreferences || roadmap.dietaryPreferences || (profile as any)?.dietaryPreferences || [],
          }
        );
        
        // Timeout de 5 minutos para la generación
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La generación del plan está tomando demasiado tiempo')), 300000)
        );
        
        content = await Promise.race([contentPromise, timeoutPromise]) as any;
        
        if (showLoading) {
          setLoadingStep(4);
          setLoadingStatus('Generando planes de ejercicio personalizados...');
          await new Promise(resolve => setTimeout(resolve, 600));
        }
        
        if (showLoading) {
          setLoadingStep(5);
          setLoadingStatus('Generando listas de compras optimizadas...');
          await new Promise(resolve => setTimeout(resolve, 600));
        }
        
        // Guardar contenido generado
        localStorage.setItem(`minutri_content_${module.id}`, JSON.stringify(content));
        
        if (showLoading) {
          setLoadingStep(6);
          setLoadingStatus('¡Plan generado exitosamente! Preparando tu calendario...');
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }
      
      setModuleContent(content);
      
      // Obtener contenido del día actual
      const todayContent = content.days.find((d: DailyContent) => d.dayNumber === day) || content.days[0];
      setDailyContent(todayContent);
    } catch (error: any) {
      console.error('Error cargando contenido del módulo:', error);
      if (showLoading) {
        const errorMessage = error?.message?.includes('Timeout') 
          ? 'El proceso está tomando más tiempo del esperado. Por favor, verifica tu conexión a internet e intenta de nuevo.'
          : error?.message || 'Error al generar el plan. Por favor, verifica tu conexión y la configuración de la API.';
        setLoadingStatus(`Error: ${errorMessage}`);
        setLoadingStep(0);
        // Mantener la pantalla de carga por 3 segundos más para que el usuario vea el error
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } finally {
      if (showLoading) {
        setIsGeneratingPlan(false);
        setLoadingStep(0);
        setLoadingStatus('');
      } else {
        setIsLoadingContent(false);
      }
    }
  };

  if (!isPremium) {
    return (
      <PageWrapper>
        <Card>
          <Header>
            <Title>MiNutri Personal</Title>
            <Subtitle>
              Tu dashboard de seguimiento Premium impulsado por IA
            </Subtitle>
          </Header>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FiTarget size={64} style={{ color: theme.colors.primary, marginBottom: '24px', opacity: 0.5 }} />
            <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 700, color: theme.colors.primaryDark }}>
              Suscripción Premium Requerida
            </h2>
            <p style={{ margin: '0 0 32px 0', color: theme.colors.textSecondary, lineHeight: '1.6', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
              MiNutri Personal es una funcionalidad exclusiva para usuarios Premium. 
              Desbloquea roadmaps dinámicos de 30 días, seguimiento personalizado y asistencia IA proactiva.
            </p>
            <a
              href="/suscripcion"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%)`,
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(46, 139, 87, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Ver Planes Premium
            </a>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <LoadingOverlay show={isGeneratingPlan}>
        <LoadingContent>
          <Spinner />
          <LoadingTitle>Generando tu Plan Personalizado</LoadingTitle>
          <LoadingMessage>{loadingStatus || 'Preparando todo para ti...'}</LoadingMessage>
          <LoadingSteps>
            <LoadingStep active={loadingStep === 1} completed={loadingStep > 1}>
              Iniciando generación
            </LoadingStep>
            <LoadingStep active={loadingStep === 2} completed={loadingStep > 2}>
              Calculando objetivos nutricionales
            </LoadingStep>
            <LoadingStep active={loadingStep === 3} completed={loadingStep > 3}>
              Generando menús con IA
            </LoadingStep>
            <LoadingStep active={loadingStep === 4} completed={loadingStep > 4}>
              Creando planes de ejercicio
            </LoadingStep>
            <LoadingStep active={loadingStep === 5} completed={loadingStep > 5}>
              Preparando listas de compras
            </LoadingStep>
            <LoadingStep active={loadingStep === 6} completed={loadingStep > 6}>
              Finalizando plan
            </LoadingStep>
          </LoadingSteps>
        </LoadingContent>
      </LoadingOverlay>

      <Header>
        <Title style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <FiTarget />
          MiNutri Personal
        </Title>
        <Subtitle>
          Tu dashboard de seguimiento Premium impulsado por IA con roadmaps dinámicos de 30 días
        </Subtitle>
      </Header>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <PremiumBadge>
          <FiCheckCircle size={20} />
          MiNutri Personal - Tu Plan de Alimentación Personalizado
        </PremiumBadge>
        {!isOnboarding && hasRoadmap && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm('¿Estás seguro de que quieres cancelar tu plan actual? Se eliminarán todos los datos del roadmap, módulos y progreso.')) {
                try {
                  minutriService.clearRoadmap();
                  setHasRoadmap(false);
                  setIsOnboarding(true);
                  setModules([]);
                  setActiveModule(null);
                  setTrackingDays([]);
                  setModuleContent(null);
                  setDayCompletions({});
                  setCurrentDay(1);
                  setAdherence(0);
                  setCurrentMonth(1);
                  setShowResults(false);
                  setMonthResults(null);
                  console.log('✅ Plan cancelado exitosamente');
                } catch (error) {
                  console.error('Error al cancelar el plan:', error);
                  alert('Hubo un error al cancelar el plan. Por favor, intenta de nuevo.');
                }
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FiTrash2 size={18} />
            Cancelar Plan
          </button>
        )}
      </div>

      <ContentGrid>
        {isOnboarding && !showPreferences ? (
          <MainContent style={{ gridColumn: '1 / -1' }}>
            <OnboardingStep
              onComplete={(data) => {
                // Guardar el objetivo validado y mostrar el cuestionario de preferencias
                setValidatedGoal(data);
                setShowPreferences(true);
              }}
            />
          </MainContent>
        ) : isOnboarding && showPreferences ? (
          <MainContent style={{ gridColumn: '1 / -1' }}>
            <PreferencesQuestionnaire
              onComplete={(preferencesData) => {
                if (!validatedGoal) return;
                
                // Guardar datos del roadmap con preferencias
                const roadmapData = {
                  finalGoal: validatedGoal.finalGoal as 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance',
                  targetValue: validatedGoal.targetValue,
                  currentValue: validatedGoal.currentValue,
                  timeframe: validatedGoal.timeframe,
                  createdAt: new Date().toISOString(),
                  modules: Math.ceil(validatedGoal.timeframe * 30 / 30), // Número total de módulos de 30 días
                  allergies: preferencesData.allergies,
                  dietaryPreferences: preferencesData.dietaryPreferences,
                };
                minutriService.saveRoadmap(roadmapData);
                
                // Generar SOLO el primer módulo (los demás se generarán cuando se complete el mes)
                const roadmapForFirstModule = {
                  ...roadmapData,
                  modules: 1, // Solo generar el primer módulo
                };
                const generatedModules = minutriService.generateModules(roadmapForFirstModule);
                minutriService.saveModules(generatedModules);
                setModules(generatedModules);
                
                // Inicializar tracking del primer módulo
                const startDate = new Date();
                const firstModule = generatedModules[0];
                const tracking = minutriService.initializeTracking(firstModule.id, startDate);
                minutriService.saveTracking(firstModule.id, tracking);
                
                setActiveModule(firstModule);
                setTrackingDays(tracking);
                setCurrentDay(1);
                setAdherence(0);
                setHasRoadmap(true);
                setIsOnboarding(false);
                setShowPreferences(false);
                setCurrentMonth(1);
                
                // Inicializar completions
                const completions: { [key: number]: { breakfast: boolean; lunch: boolean; dinner: boolean; exercise: boolean } } = {};
                tracking.forEach(t => {
                  completions[t.day] = {
                    breakfast: t.meals.breakfast,
                    lunch: t.meals.lunch,
                    dinner: t.meals.dinner,
                    exercise: t.exercise,
                  };
                });
                setDayCompletions(completions);
                
                // Cargar contenido del módulo con preferencias
                setTimeout(() => {
                  loadModuleContent(roadmapData, firstModule, 1, true, preferencesData); // true = mostrar pantalla de carga
                }, 500);
              }}
            />
          </MainContent>
        ) : (
          <>
            {/* Trofeo de progreso */}
            {activeModule && (
              <MainContent style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
                <Card>
                  <TrophyProgress
                    completedMeals={Object.values(dayCompletions).reduce((acc, day) => {
                      return acc + (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0);
                    }, 0)}
                    totalMeals={30 * 3} // 30 días * 3 comidas
                    completedExercises={Object.values(dayCompletions).filter(day => day.exercise).length}
                    totalExercises={30} // 30 días
                  />
                </Card>
              </MainContent>
            )}

            <ViewToggle>
              <ViewButton 
                active={activeView === 'calendar'}
                onClick={() => setActiveView('calendar')}
              >
                <FiCalendar />
                Calendario de Dieta
              </ViewButton>
              <ViewButton 
                active={activeView === 'exercises'}
                onClick={() => setActiveView('exercises')}
              >
                <FiActivity />
                Ejercicios de la Semana
              </ViewButton>
            </ViewToggle>

            <MainContent style={{ gridColumn: '1 / -1' }}>
              {activeModule ? (
                <Card>
                  {activeView === 'exercises' ? (
                    // Vista de ejercicios
                    !moduleContent || isLoadingContent ? (
                      <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.textSecondary }}>
                        <div style={{ fontSize: '18px', marginBottom: '12px' }}>
                          {isLoadingContent ? 'Generando tu plan mensual completo...' : 'Cargando ejercicios...'}
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          {isLoadingContent ? 'Esto puede tomar unos momentos' : 'Por favor espera'}
                        </div>
                      </div>
                    ) : (
                      <WeeklyExercises 
                        moduleContent={moduleContent}
                        currentDay={currentDay}
                        dayCompletions={dayCompletions}
                        onDayUpdate={(dayNumber, mealType, completed) => {
                          // Actualizar tracking
                          const updated = trackingDays.map(d => {
                            if (d.day === dayNumber) {
                              if (mealType === 'exercise') {
                                return { ...d, exercise: completed };
                              } else {
                                return { ...d, meals: { ...d.meals, [mealType]: completed } };
                              }
                            }
                            return d;
                          });
                          setTrackingDays(updated);
                          minutriService.saveTracking(activeModule.id, updated);
                          
                          // Actualizar completions
                          const newCompletions = { ...dayCompletions };
                          if (!newCompletions[dayNumber]) {
                            newCompletions[dayNumber] = { breakfast: false, lunch: false, dinner: false, exercise: false };
                          }
                          if (mealType === 'exercise') {
                            newCompletions[dayNumber].exercise = completed;
                          } else {
                            newCompletions[dayNumber][mealType] = completed;
                          }
                          setDayCompletions(newCompletions);
                          
                          // Recalcular adherencia
                          const newAdherence = minutriService.calculateAdherence(updated);
                          setAdherence(newAdherence);
                          
                          // Actualizar progreso del módulo
                          const updatedModules = modules.map(m => {
                            if (m.id === activeModule.id) {
                              return { ...m, progress: Math.round((currentDay / 30) * 100), adherence: newAdherence };
                            }
                            return m;
                          });
                          setModules(updatedModules);
                          minutriService.saveModules(updatedModules);
                          
                          // Verificar si se debe mostrar el modal de resultados
                          checkIfShouldShowResults(updated);
                        }}
                      />
                    )
                  ) : (
                    // Vista de calendario
                    !moduleContent || isLoadingContent ? (
                      <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.textSecondary }}>
                        <div style={{ fontSize: '18px', marginBottom: '12px' }}>
                          {isLoadingContent ? 'Generando tu plan mensual completo...' : 'Cargando tu plan...'}
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          {isLoadingContent ? 'Esto puede tomar unos momentos' : 'Por favor espera'}
                        </div>
                      </div>
                    ) : (
                      <MonthlyCalendarView
                        monthNumber={currentMonth}
                        totalMonths={modules.length}
                        days={moduleContent.days}
                        dayCompletions={dayCompletions}
                        onMonthChange={(month) => setCurrentMonth(month)}
                        onDayUpdate={(dayNumber, mealType, completed) => {
                          // Actualizar tracking
                          const updated = trackingDays.map(d => {
                            if (d.day === dayNumber) {
                              if (mealType === 'exercise') {
                                return { ...d, exercise: completed };
                              } else {
                                return { ...d, meals: { ...d.meals, [mealType]: completed } };
                              }
                            }
                            return d;
                          });
                          setTrackingDays(updated);
                          minutriService.saveTracking(activeModule.id, updated);
                          
                          // Actualizar completions
                          const newCompletions = { ...dayCompletions };
                          if (!newCompletions[dayNumber]) {
                            newCompletions[dayNumber] = { breakfast: false, lunch: false, dinner: false, exercise: false };
                          }
                          if (mealType === 'exercise') {
                            newCompletions[dayNumber].exercise = completed;
                          } else {
                            newCompletions[dayNumber][mealType] = completed;
                          }
                          setDayCompletions(newCompletions);
                          
                          // Recalcular adherencia
                          const newAdherence = minutriService.calculateAdherence(updated);
                          setAdherence(newAdherence);
                          
                          // Actualizar progreso del módulo
                          const updatedModules = modules.map(m => {
                            if (m.id === activeModule.id) {
                              return { ...m, progress: Math.round((currentDay / 30) * 100), adherence: newAdherence };
                            }
                            return m;
                          });
                          setModules(updatedModules);
                          minutriService.saveModules(updatedModules);
                          
                          // Verificar si se debe mostrar el modal de resultados
                          // Solo después de que el usuario marque algo (no automáticamente)
                          checkIfShouldShowResults(updated);
                        }}
                      />
                    )
                  )}
                </Card>
              ) : (
                <Card>
                  <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.textSecondary }}>
                    <div style={{ fontSize: '18px', marginBottom: '12px' }}>No hay módulo activo</div>
                    <div style={{ fontSize: '14px' }}>Por favor, completa el onboarding para comenzar</div>
                  </div>
                </Card>
              )}
            </MainContent>
          </>
        )}
      </ContentGrid>

      {showResults && activeModule && (() => {
        const roadmap = minutriService.getRoadmap();
        const completedMeals = Object.values(dayCompletions).reduce((acc, day) => {
          return acc + (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0);
        }, 0);
        const completedExercises = Object.values(dayCompletions).filter(day => day.exercise).length;
        const totalMeals = 30 * 3; // 30 días * 3 comidas
        const totalExercises = 30; // 30 días
        
        return (
          <MonthResults
            adherence={adherence}
            completedDays={trackingDays.filter(d => 
              d.meals.breakfast && d.meals.lunch && d.meals.dinner && d.exercise
            ).length}
            completedMeals={completedMeals}
            totalMeals={totalMeals}
            completedExercises={completedExercises}
            totalExercises={totalExercises}
            initialWeight={roadmap?.currentValue || 70}
            targetWeight={roadmap?.targetValue || 70}
            goal={roadmap?.finalGoal || 'maintenance'}
            timeframe={roadmap?.timeframe || 3}
            currentMonth={currentMonth}
            onSaveResults={handleSaveResults}
            onCreateNewPlan={handleCreateNewPlan}
            onClose={() => setShowResults(false)}
          />
        );
      })()}

      {showGoalAchieved && activeModule && (() => {
        const roadmap = minutriService.getRoadmap();
        const finalWeight = monthResults?.finalWeight || roadmap?.currentValue || 70;
        const initialWeight = roadmap?.currentValue || 70;
        const targetWeight = roadmap?.targetValue || 70;
        const completedDays = trackingDays.filter(d => 
          d.meals.breakfast && d.meals.lunch && d.meals.dinner && d.exercise
        ).length;
        
        return (
          <GoalAchievedScreen
            initialWeight={initialWeight}
            finalWeight={finalWeight}
            targetWeight={targetWeight}
            goal={roadmap?.finalGoal || 'maintenance'}
            adherence={adherence}
            completedDays={completedDays}
            onClose={() => {
              setShowGoalAchieved(false);
              // Limpiar todo y volver al onboarding
              minutriService.clearRoadmap();
              setHasRoadmap(false);
              setIsOnboarding(true);
              setModules([]);
              setActiveModule(null);
              setTrackingDays([]);
              setModuleContent(null);
              setDayCompletions({});
              setCurrentDay(1);
              setAdherence(0);
              setCurrentMonth(1);
              setMonthResults(null);
            }}
          />
        );
      })()}
    </PageWrapper>
  );
};

export default MiNutriPersonalPage;

