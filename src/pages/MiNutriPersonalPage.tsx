import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTarget, FiCheckCircle, FiTrendingUp, FiCalendar, FiActivity, FiMessageCircle } from 'react-icons/fi';
import { theme } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';
import { useUserProfile } from '../context/UserProfileContext';
import OnboardingStep from '../components/minutri/OnboardingStep';
import MonthlyCalendarView from '../components/minutri/MonthlyCalendarView';
import NutriChat from '../components/minutri/NutriChat';
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
  const [currentMonth, setCurrentMonth] = useState(1);
  const [dayCompletions, setDayCompletions] = useState<{ [dayNumber: number]: { breakfast: boolean; lunch: boolean; dinner: boolean; exercise: boolean } }>({});

  // Verificar si el usuario es premium
  const isPremium = currentPlan && currentPlan.plan !== 'free' && currentPlan.isActive;

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

  const loadModuleContent = async (roadmap: any, module: Module, day: number) => {
    setIsLoadingContent(true);
    try {
      // Verificar si ya existe contenido guardado
      const savedContent = localStorage.getItem(`minutri_content_${module.id}`);
      let content;
      
      if (savedContent) {
        content = JSON.parse(savedContent);
      } else {
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
            weight: profile.weight,
            height: profile.height,
            age: profile.age,
            gender: profile.gender,
            activityLevel: profile.activityLevel,
            allergies: profile.allergies || [],
            dietaryPreferences: profile.dietaryPreferences || [],
          }
        );
        // Guardar contenido generado
        localStorage.setItem(`minutri_content_${module.id}`, JSON.stringify(content));
      }
      
      setModuleContent(content);
      
      // Obtener contenido del día actual
      const todayContent = content.days.find((d: DailyContent) => d.dayNumber === day) || content.days[0];
      setDailyContent(todayContent);
    } catch (error) {
      console.error('Error cargando contenido del módulo:', error);
    } finally {
      setIsLoadingContent(false);
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
        Funcionalidad Premium Activa
      </PremiumBadge>

      <ContentGrid>
        <MainContent>
          {isOnboarding ? (
            <OnboardingStep
              onComplete={(data) => {
                // Guardar datos del roadmap
                const roadmapData = {
                  finalGoal: data.finalGoal,
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
                  loadModuleContent(roadmapData, firstModule, 1);
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

        <Sidebar>
          <Card style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 700, color: theme.colors.primaryDark, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiMessageCircle />
                NutriChat IA
              </h3>
              <p style={{ margin: '0 0 0 0', color: theme.colors.textSecondary, lineHeight: '1.6', fontSize: '14px' }}>
                Tu asistente virtual de nutrición
              </p>
            </div>
            {!isOnboarding && (
              <NutriChat
                adherence={adherence}
                currentDay={currentDay}
                totalDays={30}
              />
            )}
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700, color: theme.colors.primaryDark, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTrendingUp />
              Progreso General
            </h3>
            <p style={{ margin: '0', color: theme.colors.textSecondary, lineHeight: '1.6', fontSize: '15px' }}>
              Estadísticas y logros desbloqueados
            </p>
          </Card>
        </Sidebar>
      </ContentGrid>
    </PageWrapper>
  );
};

export default MiNutriPersonalPage;

