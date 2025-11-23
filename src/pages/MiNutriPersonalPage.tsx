import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTarget, FiCheckCircle, FiAlertCircle, FiX, FiActivity, FiCalendar, FiMapPin } from 'react-icons/fi';
import { theme } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { useNavigate } from 'react-router-dom';
import { generateExercisesForPlan } from '../services/exerciseService';

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

const PremiumBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.3);
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 32px;
`;

const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const PlanSelector = styled.div`
  display: grid;
  gap: 20px;
`;

const PlanSelectorTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PlanList = styled.div`
  display: grid;
  gap: 12px;
`;

const PlanOption = styled.button<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  border-radius: 16px;
  border: 2px solid ${({ selected }) => selected ? theme.colors.primary : 'rgba(46, 139, 87, 0.2)'};
  background: ${({ selected }) => selected ? 'rgba(46, 139, 87, 0.05)' : theme.colors.white};
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.15);
  }

  h4 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${theme.colors.textSecondary};
  }
`;

const LocationSelector = styled.div`
  display: grid;
  gap: 16px;
  margin-top: 24px;
`;

const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const LocationOption = styled.button<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid ${({ selected }) => selected ? theme.colors.primary : 'rgba(46, 139, 87, 0.2)'};
  background: ${({ selected }) => selected ? 'rgba(46, 139, 87, 0.05)' : theme.colors.white};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }

  svg {
    font-size: 24px;
    color: ${theme.colors.primary};
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.primaryDark};
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
  color: white;
  font-weight: 700;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(46, 139, 87, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PremiumRequired = styled.div`
  text-align: center;
  padding: 48px 24px;
  
  h3 {
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }
  
  p {
    margin: 0 0 24px 0;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
  }
  
  button {
    padding: 14px 28px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
    color: white;
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(46, 139, 87, 0.3);
    }
  }
`;

const LoadingOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
`;

const LoadingTitle = styled.h3`
  margin: 20px 0 12px 0;
  font-size: 22px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
`;

const LoadingMessage = styled.p`
  margin: 0 0 24px 0;
  color: ${theme.colors.textSecondary};
  font-size: 15px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(46, 139, 87, 0.2);
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SuccessNotification = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${theme.colors.white};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: ${({ show }) => show ? 'flex' : 'none'};
  align-items: center;
  gap: 16px;
  max-width: 400px;
  z-index: 1000;
  animation: ${fadeInUp} 0.3s ease;
`;

const MiNutriPersonalPage: React.FC = () => {
  const { currentPlan } = useSubscription();
  const { profile } = useUserProfile();
  const { weeklyPlans, updateWeeklyPlan } = useWeeklyPlan();
  const navigate = useNavigate();
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filtrar solo planes semanales (no mensuales)
  const weeklyPlansOnly = weeklyPlans.filter(plan => plan.config?.type !== 'monthly');

  const locations = [
    { id: 'gym', name: 'Gimnasio', icon: FiActivity },
    { id: 'park', name: 'Parques', icon: FiMapPin },
    { id: 'home', name: 'Casa', icon: FiTarget },
  ];

  const handleLocationToggle = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleGenerateExercises = async () => {
    if (!selectedPlanId || selectedLocations.length === 0) {
      alert('Por favor, selecciona un plan semanal y al menos una ubicación para los ejercicios');
      return;
    }

    setIsGenerating(true);

    try {
      const plan = weeklyPlans.find(p => p.id === selectedPlanId);
      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      // Generar ejercicios personalizados
      const exercises = await generateExercisesForPlan(
        plan,
        profile,
        selectedLocations
      );

      // Agregar ejercicios al plan
      const updatedMeals = plan.meals?.map((day: any) => {
        const dayNumber = day?.dayNumber || day?.day || 0;
        const dayExercise = exercises.find((ex: any) => ex.dayNumber === dayNumber);
        if (dayExercise) {
          return {
            ...day,
            exercise: {
              id: dayExercise.id,
              name: dayExercise.name,
              type: dayExercise.type,
              duration: dayExercise.duration,
              description: dayExercise.description,
              instructions: dayExercise.instructions,
              equipment: dayExercise.equipment || [],
              recommendations: dayExercise.recommendations,
              location: dayExercise.location,
            },
          };
        }
        return day;
      }) || [];
      
      const updatedPlan = {
        ...plan,
        meals: updatedMeals,
        config: {
          ...plan.config,
          hasExercises: true,
          exerciseLocations: selectedLocations,
        },
      };

      updateWeeklyPlan(selectedPlanId, updatedPlan);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/planes/${selectedPlanId}`);
      }, 3000);

    } catch (error: any) {
      console.error('Error generando ejercicios:', error);
      alert(error.message || 'Error al generar ejercicios. Por favor, intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (weeklyPlansOnly.length === 0) {
    return (
      <PageWrapper>
        <Header>
          <Title>
            <FiTarget style={{ marginRight: '12px', display: 'inline-block' }} />
            MiNutri Personal
          </Title>
          <Subtitle>
            Complementa tus planes semanales con ejercicios personalizados
          </Subtitle>
        </Header>

        <Card>
          <PremiumRequired>
            <FiCalendar style={{ fontSize: '48px', color: theme.colors.primary, marginBottom: '16px' }} />
            <h3>No tienes planes semanales</h3>
            <p>
              Primero necesitas crear un plan semanal para poder complementarlo con ejercicios personalizados.
            </p>
            <button onClick={() => navigate('/generador')}>
              Crear Plan Semanal
            </button>
          </PremiumRequired>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <>
      <LoadingOverlay show={isGenerating}>
        <LoadingContent>
          <Spinner />
          <LoadingTitle>Generando ejercicios personalizados</LoadingTitle>
          <LoadingMessage>
            Estamos creando ejercicios adaptados a tu plan semanal y ubicaciones seleccionadas...
          </LoadingMessage>
        </LoadingContent>
      </LoadingOverlay>

      <PageWrapper>
        <Header>
          <Title>
            <FiTarget style={{ marginRight: '12px', display: 'inline-block' }} />
            MiNutri Personal
          </Title>
          <Subtitle>
            Complementa tus planes semanales con ejercicios personalizados adaptados a gimnasio, parques y casa
          </Subtitle>
        </Header>


        <Card>
          <PlanSelector>
            <PlanSelectorTitle>
              <FiCalendar />
              Selecciona un Plan Semanal
            </PlanSelectorTitle>
            <PlanList>
              {weeklyPlansOnly.map(plan => (
                <PlanOption
                  key={plan.id}
                  selected={selectedPlanId === plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <h4>{plan.name}</h4>
                  <p>
                    {plan.weekStart && new Date(plan.weekStart).toLocaleDateString('es-ES')} - {' '}
                    {plan.weekEnd && new Date(plan.weekEnd).toLocaleDateString('es-ES')}
                  </p>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>
                    {plan.totalMeals} comidas · {plan.config?.goal || 'Personalizado'}
                  </p>
                </PlanOption>
              ))}
            </PlanList>

            {selectedPlanId && (
              <>
                <LocationSelector>
                  <PlanSelectorTitle>
                    <FiMapPin />
                    ¿Dónde quieres hacer ejercicio?
                  </PlanSelectorTitle>
                  <LocationGrid>
                    {locations.map(location => (
                      <LocationOption
                        key={location.id}
                        selected={selectedLocations.includes(location.id)}
                        onClick={() => handleLocationToggle(location.id)}
                      >
                        <location.icon />
                        <span>{location.name}</span>
                      </LocationOption>
                    ))}
                  </LocationGrid>
                </LocationSelector>

                <GenerateButton
                  onClick={handleGenerateExercises}
                  disabled={selectedLocations.length === 0 || isGenerating}
                >
                  <FiActivity />
                  {isGenerating ? 'Generando...' : 'Generar Ejercicios Personalizados'}
                </GenerateButton>
              </>
            )}
          </PlanSelector>
        </Card>

        <SuccessNotification show={showSuccess}>
          <FiCheckCircle style={{ color: theme.colors.primary, fontSize: '24px' }} />
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.primaryDark, marginBottom: '4px' }}>
              ¡Ejercicios generados exitosamente!
            </div>
            <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
              Los ejercicios se han agregado a tu plan semanal
            </div>
          </div>
          <FiX 
            onClick={() => setShowSuccess(false)}
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
