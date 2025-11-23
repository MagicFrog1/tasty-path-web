import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTarget, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { theme } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';
import { useUserProfile } from '../context/UserProfileContext';
import OnboardingStep from '../components/minutri/OnboardingStep';
import PreferencesQuestionnaire from '../components/minutri/PreferencesQuestionnaire';
import { minutriService } from '../services/minutriService';
import { generateModuleContent, DailyContent } from '../services/minutriContentService';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { useNavigate } from 'react-router-dom';

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
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
  width: 100%;
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 32px;
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
  gap: 20px;
  grid-template-columns: 1fr;

  @media (min-width: 1200px) {
    grid-template-columns: 1.5fr 1fr;
    gap: 24px;
  }
`;

const MainContent = styled.div`
  display: grid;
  gap: 20px;
  min-width: 0; /* Permite que el contenido se ajuste */
`;

const Sidebar = styled.aside`
  display: grid;
  gap: 20px;
  min-width: 0;
`;

const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: 20px;
  padding: 24px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const PremiumBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 24px;
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

// Diálogo de confirmación
const ConfirmDialog = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: ${({ show }) => (show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const DialogTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DialogMessage = styled.p`
  margin: 0 0 24px 0;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  font-size: 16px;
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DialogButton = styled.button<{ primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ primary }) => 
    primary 
      ? `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%)`
      : 'rgba(46, 139, 87, 0.1)'};
  color: ${({ primary }) => (primary ? 'white' : theme.colors.primaryDark)};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ primary }) => 
      primary 
        ? '0 8px 20px rgba(46, 139, 87, 0.3)'
        : '0 4px 12px rgba(46, 139, 87, 0.2)'};
  }
`;

const SuccessNotification = styled.div<{ show: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 2px solid ${theme.colors.primary};
  z-index: 10001;
  display: ${({ show }) => (show ? 'flex' : 'none')};
  align-items: center;
  gap: 12px;
  max-width: 400px;
  animation: ${fadeInUp} 0.3s ease;
`;

const MiNutriPersonalPage: React.FC = () => {
  const { currentPlan } = useSubscription();
  const { profile } = useUserProfile();
  const { addWeeklyPlan, weeklyPlans, deleteWeeklyPlan } = useWeeklyPlan();
  const navigate = useNavigate();
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [hasPreviousPlan, setHasPreviousPlan] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Estados para pantalla de carga
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  // Permitir acceso a todos los usuarios (incluyendo plan gratis)
  const isPremium = true; // Siempre permitir acceso

  useEffect(() => {
    // Verificar si ya tiene un plan mensual anterior
    // Buscar en planes guardados y también en roadmap
    const roadmapData = minutriService.getRoadmap();
    const monthlyPlans = weeklyPlans.filter(plan => plan.config?.type === 'monthly');
    
    if (roadmapData || monthlyPlans.length > 0) {
      if (!hasPreviousPlan) {
        setHasPreviousPlan(true);
        setShowConfirmDialog(true);
      }
    } else {
      if (hasPreviousPlan) {
        setHasPreviousPlan(false);
        setShowConfirmDialog(false);
      }
    }
  }, [weeklyPlans, hasPreviousPlan]);
  
  const clearPreviousPlan = () => {
    // Eliminar todos los planes mensuales guardados
    const monthlyPlans = weeklyPlans.filter(plan => plan.config?.type === 'monthly');
    monthlyPlans.forEach(plan => {
      deleteWeeklyPlan(plan.id);
    });
    
    // Eliminar todos los datos del roadmap anterior
    localStorage.removeItem('minutri_roadmap');
    localStorage.removeItem('minutri_modules');
    // Eliminar todos los tracking
    for (let i = 1; i <= 12; i++) {
      localStorage.removeItem(`minutri_tracking_${i}`);
      localStorage.removeItem(`minutri_content_${i}`);
    }
    setHasPreviousPlan(false);
    setShowConfirmDialog(false);
  };

  const generateMonthlyPlan = async (roadmap: any) => {
    setIsGeneratingPlan(true);
    setLoadingStep(1);
    setLoadingStatus('Iniciando generación de plan mensal...');
    
    // Timeout de seguridad: 3 minutos (reducido para planes de 1 mes optimizados)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout: La generación del plan está tomando demasiado tiempo. Por favor, intenta de nuevo.'));
      }, 180000); // 3 minutos
    });
    
    try {
      setLoadingStep(2);
      setLoadingStatus('Calculando objetivos nutricionales...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Callback de progreso
      const progressCallback = (step: number, total: number, message: string) => {
        setLoadingStep(step);
        setLoadingStatus(message);
      };
      
      setLoadingStep(3);
      setLoadingStatus('Generando menús personalizados con IA (esto puede tomar 30-60 segundos)...');
      
      setLoadingStep(4);
      setLoadingStatus('Generando ejercicios físicos personalizados adaptados a tu edad y objetivos...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generar contenido del primer módulo (30 días)
      const content = await Promise.race([
        generateModuleContent(
          1, // Siempre módulo 1 para nuevo plan
          {
            finalGoal: roadmap.finalGoal,
            targetValue: roadmap.targetValue,
            currentValue: roadmap.currentValue,
            timeframe: roadmap.timeframe,
            age: roadmap.age,
          },
          {
            weight: profile?.weight,
            height: profile?.height,
            age: roadmap.age || profile?.age,
            gender: profile?.gender,
            activityLevel: profile?.activityLevel,
            allergies: roadmap.allergies || (profile as any)?.allergies || [],
            dietaryPreferences: roadmap.dietaryPreferences || (profile as any)?.dietaryPreferences || [],
          },
          progressCallback
        ),
        timeoutPromise
      ]) as any;
      
      if (!content || !content.days || content.days.length === 0) {
        throw new Error('El contenido generado está vacío o incompleto');
      }
      
      setLoadingStep(6);
      setLoadingStatus('Guardando plan generado...');
      
      // Guardar plan mensual en planes guardados
      const now = new Date();
      const planId = `minutri_monthly_${Date.now()}`;
      const monthlyPlan = {
        id: planId,
        weekStart: now.toISOString(),
        weekEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalMeals: 90, // 30 días * 3 comidas
        totalCalories: Math.round((roadmap.finalGoal === 'weight_loss' ? 1800 : roadmap.finalGoal === 'weight_gain' || roadmap.finalGoal === 'muscle_gain' ? 2500 : 2000) * 30),
        totalCost: 0,
        status: 'active' as const,
        name: `Plan Mensual MiNutri - ${now.toLocaleDateString('es-ES')}`,
        description: `Plan mensual con ejercicios personalizados generado para ${roadmap.finalGoal === 'weight_loss' ? 'Pérdida de Peso' : roadmap.finalGoal === 'weight_gain' ? 'Ganancia de Peso' : roadmap.finalGoal === 'muscle_gain' ? 'Ganancia de Músculo' : 'Mantenimiento'}. Incluye ejercicios físicos adaptados a tu edad (${roadmap.age || profile?.age || 'N/A'} años) y objetivos para ayudarte a alcanzar tus metas más rápido.`,
        nutritionGoals: {
          protein: roadmap.finalGoal === 'muscle_gain' ? 30 : roadmap.finalGoal === 'weight_loss' ? 30 : 25,
          carbs: roadmap.finalGoal === 'weight_loss' ? 40 : 45,
          fat: 25,
          fiber: 30,
        },
        progress: { completedMeals: 0, totalMeals: 90, percentage: 0 },
        config: {
          goal: roadmap.finalGoal,
          weight: profile?.weight,
          height: profile?.height,
          age: roadmap.age,
          dietaryPreferences: roadmap.dietaryPreferences || [],
          allergens: roadmap.allergies || [],
          type: 'monthly',
        },
        meals: content.days.map((day: DailyContent) => ({
          date: day.date,
          dayNumber: day.dayNumber,
          meals: {
            breakfast: day.meals.breakfast,
            lunch: day.meals.lunch,
            dinner: day.meals.dinner,
          },
          exercise: day.exercise, // Incluir ejercicio personalizado diario
          tips: day.tips, // Incluir tips diarios
        })),
        estimatedCalories: roadmap.finalGoal === 'weight_loss' ? 1800 : roadmap.finalGoal === 'weight_gain' || roadmap.finalGoal === 'muscle_gain' ? 2500 : 2000,
        createdAt: now.toISOString(),
      };
      
      addWeeklyPlan(monthlyPlan);
      
      // Guardar roadmap para poder detectarlo después
      minutriService.saveRoadmap({
        finalGoal: roadmap.finalGoal,
        targetValue: roadmap.targetValue,
        currentValue: roadmap.currentValue,
        timeframe: roadmap.timeframe,
        createdAt: now.toISOString(),
        modules: 1, // Solo un módulo de 30 días para planes mensuales
      });
      
      setLoadingStep(6);
      setLoadingStatus('¡Plan generado exitosamente!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar notificación de éxito
      setIsGeneratingPlan(false);
      setLoadingStep(0);
      setLoadingStatus('');
      setShowSuccessNotification(true);
      
      // Resetear formulario
      setIsOnboarding(true);
      setShowPreferences(false);
      setOnboardingData(null);
      
      // Ocultar notificación después de 5 segundos
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
      
    } catch (error: any) {
      console.error('Error generando plan mensual:', error);
      const errorMessage = error?.message || 'Error al generar el plan. Por favor, intenta de nuevo.';
      setLoadingStatus(errorMessage);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsGeneratingPlan(false);
      setLoadingStep(0);
      setLoadingStatus('');
      alert(errorMessage);
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
    <>
      {/* Overlay de carga durante generación del plan */}
      <LoadingOverlay show={isGeneratingPlan}>
        <LoadingContent>
          <Spinner />
          <LoadingTitle>Cargando tu plan...</LoadingTitle>
          <LoadingMessage>
            {loadingStatus || 'Por favor espera'}
          </LoadingMessage>
          <LoadingSteps>
            <LoadingStep active={loadingStep >= 1} completed={loadingStep > 1}>
              Iniciando generación de plan mensal
            </LoadingStep>
            <LoadingStep active={loadingStep >= 2} completed={loadingStep > 2}>
              Calculando objetivos nutricionales
            </LoadingStep>
            <LoadingStep active={loadingStep >= 3} completed={loadingStep > 3}>
              Generando menús personalizados con IA
            </LoadingStep>
            <LoadingStep active={loadingStep >= 4} completed={loadingStep > 4}>
              Generando ejercicios físicos personalizados
            </LoadingStep>
            <LoadingStep active={loadingStep >= 5} completed={loadingStep > 5}>
              Generando listas de compras
            </LoadingStep>
            <LoadingStep active={loadingStep >= 6} completed={loadingStep > 6}>
              Finalizando plan mensual
            </LoadingStep>
          </LoadingSteps>
        </LoadingContent>
      </LoadingOverlay>

      <PageWrapper>
        <Header>
          <Title>
            <FiTarget style={{ marginRight: '12px', display: 'inline-block' }} />
            MiNutri Personal
          </Title>
          <Subtitle>
            Tu dashboard de seguimiento Premium impulsado por IA con roadmaps dinámicos de 30 días
          </Subtitle>
        </Header>

        <PremiumBadge>
          <FiCheckCircle />
          MiNutri Personal - Tu Plan de Alimentación Personalizado
        </PremiumBadge>

        <ContentGrid>
          <MainContent>
            {isOnboarding && !showPreferences ? (
              <Card>
                <OnboardingStep
                  onComplete={(data) => {
                    setOnboardingData(data);
                    setShowPreferences(true);
                  }}
                />
              </Card>
            ) : isOnboarding && showPreferences ? (
              <Card>
                <PreferencesQuestionnaire
                  onComplete={(preferencesData) => {
                    // Guardar datos del roadmap con preferencias
                    const roadmapData = {
                      finalGoal: onboardingData.finalGoal as 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance',
                      targetValue: onboardingData.targetValue,
                      currentValue: onboardingData.currentValue,
                      timeframe: onboardingData.timeframe,
                      age: onboardingData.age,
                      createdAt: new Date().toISOString(),
                      modules: Math.ceil(onboardingData.timeframe * 30 / 30),
                      allergies: preferencesData.allergies,
                      dietaryPreferences: preferencesData.dietaryPreferences,
                    };
                    
                    // Generar plan mensual
                    generateMonthlyPlan(roadmapData);
                  }}
                />
              </Card>
            ) : null}
          </MainContent>
        </ContentGrid>
        
        {/* Diálogo de confirmación para plan anterior */}
        <ConfirmDialog show={showConfirmDialog}>
          <DialogContent>
            <DialogTitle>
              <FiAlertCircle />
              ¿Ya alcanzaste tu objetivo?
            </DialogTitle>
            <DialogMessage>
              Ya tienes un plan de MiNutri Personal activo. Para crear un nuevo plan, primero debes confirmar que ya alcanzaste tu objetivo en el plan anterior. Esto eliminará el plan anterior y creará uno nuevo.
            </DialogMessage>
            <DialogButtons>
              <DialogButton onClick={() => setShowConfirmDialog(false)}>
                Cancelar
              </DialogButton>
              <DialogButton primary onClick={() => {
                clearPreviousPlan();
              }}>
                Sí, ya alcancé mi objetivo
              </DialogButton>
            </DialogButtons>
          </DialogContent>
        </ConfirmDialog>
        
        {/* Notificación de éxito */}
        <SuccessNotification show={showSuccessNotification}>
          <FiCheckCircle style={{ color: theme.colors.primary, fontSize: '24px' }} />
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.primaryDark, marginBottom: '4px' }}>
              ¡Plan generado exitosamente!
            </div>
            <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
              Tu plan mensual se ha guardado en "Planes Guardados"
            </div>
            <button
              onClick={() => {
                navigate('/planes');
                setShowSuccessNotification(false);
              }}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Ver planes
            </button>
          </div>
          <FiX 
            onClick={() => setShowSuccessNotification(false)}
            style={{ 
              cursor: 'pointer', 
              color: theme.colors.textSecondary,
              marginLeft: 'auto'
            }} 
          />
        </SuccessNotification>
    </PageWrapper>
    </>
  );
};

export default MiNutriPersonalPage;

