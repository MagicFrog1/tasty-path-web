import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiTarget, FiCheckCircle, FiTrendingUp, FiCalendar, FiActivity, FiMessageCircle } from 'react-icons/fi';
import { theme } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';
import { useUserProfile } from '../context/UserProfileContext';
import OnboardingStep from '../components/minutri/OnboardingStep';

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
  gap: 24px;
  grid-template-columns: 1fr;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainContent = styled.div`
  display: grid;
  gap: 24px;
`;

const Sidebar = styled.aside`
  display: grid;
  gap: 24px;
`;

const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 16px;
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

  // Verificar si el usuario es premium
  const isPremium = currentPlan && currentPlan.plan !== 'free' && currentPlan.isActive;

  useEffect(() => {
    // Verificar si ya tiene un roadmap configurado
    const roadmapData = localStorage.getItem('minutri_roadmap');
    if (roadmapData) {
      setHasRoadmap(true);
      setIsOnboarding(false);
    }
  }, []);

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
                localStorage.setItem('minutri_roadmap', JSON.stringify(roadmapData));
                setHasRoadmap(true);
                setIsOnboarding(false);
              }}
            />
          ) : (
            <>
              <Card>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 700, color: theme.colors.primaryDark }}>
                  Roadmap Dinámico
                </h2>
                <p style={{ margin: '0 0 24px 0', color: theme.colors.textSecondary, lineHeight: '1.6' }}>
                  Visualiza tu progreso a largo plazo con módulos de 30 días
                </p>
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)',
                  border: '1.5px solid rgba(46, 139, 87, 0.2)',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0', color: theme.colors.textSecondary, fontSize: '15px' }}>
                    El componente de Roadmap se implementará en el siguiente paso
                  </p>
                </div>
              </Card>

              <Card>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 700, color: theme.colors.primaryDark }}>
                  Módulo Activo (30 Días)
                </h2>
                <p style={{ margin: '0 0 24px 0', color: theme.colors.textSecondary, lineHeight: '1.6' }}>
                  Seguimiento detallado de tu módulo actual
                </p>
                <div style={{ 
                  padding: '24px', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)',
                  border: '1.5px solid rgba(46, 139, 87, 0.2)',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0', color: theme.colors.textSecondary, fontSize: '15px' }}>
                    El componente de seguimiento se implementará en el siguiente paso
                  </p>
                </div>
              </Card>
            </>
          )}
        </MainContent>

        <Sidebar>
          <Card>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700, color: theme.colors.primaryDark, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiMessageCircle />
              NutriChat IA
            </h3>
            <p style={{ margin: '0 0 24px 0', color: theme.colors.textSecondary, lineHeight: '1.6', fontSize: '15px' }}>
              Tu asistente virtual de nutrición. Haz preguntas sobre tu roadmap, plan de ejercicios o ingredientes.
            </p>
            <div style={{ 
              padding: '24px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)',
              border: '1.5px solid rgba(46, 139, 87, 0.2)',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0', color: theme.colors.textSecondary, fontSize: '14px' }}>
                El chatbot se implementará en el siguiente paso
              </p>
            </div>
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

