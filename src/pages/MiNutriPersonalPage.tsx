import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTarget, FiCheckCircle, FiTrendingUp, FiCalendar, FiActivity, FiMessageCircle } from 'react-icons/fi';
import { theme } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';
import { useUserProfile } from '../context/UserProfileContext';
import OnboardingStep from '../components/minutri/OnboardingStep';
import MonthlyCalendarView from '../components/minutri/MonthlyCalendarView';
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
  gap: 0;
  grid-template-columns: 1fr;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`;

const MainContent = styled.div`
  display: grid;
  gap: 0;
  min-width: 0; /* Permite que el contenido se ajuste */
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

  const loadModuleContent = async (roadmap: any, module: Module, day: number, showLoading: boolean = false) => {
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
          setLoadingStatus('Calculando objetivos nutricionales...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (showLoading) {
          setLoadingStep(3);
          setLoadingStatus('Generando menús personalizados con IA (esto puede tomar unos minutos)...');
        }
        
        // Generar contenido completo del módulo
        content = await generateModuleContent(
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
            allergies: (profile as any)?.allergies || [],
            dietaryPreferences: (profile as any)?.dietaryPreferences || [],
          }
        );
        
        if (showLoading) {
          setLoadingStep(4);
          setLoadingStatus('Generando planes de ejercicio...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (showLoading) {
          setLoadingStep(5);
          setLoadingStatus('Generando listas de compras...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Guardar contenido generado
        localStorage.setItem(`minutri_content_${module.id}`, JSON.stringify(content));
        
        if (showLoading) {
          setLoadingStep(6);
          setLoadingStatus('¡Plan generado exitosamente!');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setModuleContent(content);
      
      // Obtener contenido del día actual
      const todayContent = content.days.find((d: DailyContent) => d.dayNumber === day) || content.days[0];
      setDailyContent(todayContent);
    } catch (error) {
      console.error('Error cargando contenido del módulo:', error);
      if (showLoading) {
        setLoadingStatus('Error al generar el plan. Por favor, intenta de nuevo.');
        await new Promise(resolve => setTimeout(resolve, 2000));
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
      <Header>
        <Title style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <FiTarget />
          MiNutri Personal
        </Title>
        <Subtitle>
          Tu dashboard de seguimiento Premium impulsado por IA con roadmaps dinámicos de 30 días
        </Subtitle>
      </Header>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <PremiumBadge>
          <FiCheckCircle size={20} />
          MiNutri Personal - Tu Plan de Alimentación Personalizado
        </PremiumBadge>
      </div>

      <ContentGrid>
        <MainContent>
          {isOnboarding ? (
            <OnboardingStep
              onComplete={(data) => {
                // Guardar datos del roadmap
                const roadmapData = {
                  finalGoal: data.finalGoal as 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance',
                  targetValue: data.targetValue,
                  currentValue: data.currentValue,
                  timeframe: data.timeframe,
                  createdAt: new Date().toISOString(),
                  modules: Math.ceil(data.timeframe * 30 / 30), // Número de módulos de 30 días
                };
                minutriService.saveRoadmap(roadmapData);
                
                // Generar módulos
                const generatedModules = minutriService.generateModules(roadmapData);
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
                
                // Cargar contenido del módulo
                    setTimeout(() => {
                      loadModuleContent(roadmapData, firstModule, 1, true); // true = mostrar pantalla de carga
                    }, 500);
              }}
            />
          ) : (
            <>
              {activeModule && moduleContent && (
                <Card>
                  {isLoadingContent ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.textSecondary }}>
                      <div style={{ fontSize: '18px', marginBottom: '12px' }}>Generando tu plan mensual completo...</div>
                      <div style={{ fontSize: '14px' }}>Esto puede tomar unos momentos</div>
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
                      }}
                    />
                  )}
                </Card>
              )}

            </>
          )}
        </MainContent>
      </ContentGrid>
    </PageWrapper>
  );
};

export default MiNutriPersonalPage;

