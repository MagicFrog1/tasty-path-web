import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiCheckCircle, FiGift, FiStar, FiTrendingUp, FiZap, FiShield, FiLock } from 'react-icons/fi';
import { TbCrown } from 'react-icons/tb';
import { useSubscription } from '../context/SubscriptionContext';
import { theme } from '../styles/theme';
import { redirectToCheckout, isStripeConfigured } from '../services/stripeService';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

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

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
`;

const PageWrapper = styled.div`
  display: grid;
  gap: 48px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  
  @media (min-width: 1024px) {
    gap: 64px;
  }
`;

const Hero = styled.section`
  display: grid;
  gap: 24px;
  padding: 48px;
  border-radius: 0;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.03) 0%, rgba(46, 139, 87, 0.01) 100%);
  border: none;
  box-shadow: none;
  position: relative;
  animation: ${fadeInUp} 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 50%, ${theme.colors.primary} 100%);
  }

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
    max-width: 800px;
    line-height: 1.75;
    color: #2d3748;
    font-size: 18px;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const Benefits = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    font-size: 15px;
    padding: 16px 20px;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid rgba(46, 139, 87, 0.1);
    box-shadow: 0 2px 8px rgba(46, 139, 87, 0.08);
    transition: all 0.3s ease;
    color: #1b1f24;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(46, 139, 87, 0.12);
      border-color: rgba(46, 139, 87, 0.2);
    }
  }

  svg {
    color: ${theme.colors.primary};
    font-size: 20px;
    flex-shrink: 0;
  }
`;

const PlanGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const PlanCard = styled.div<{ highlight?: boolean; isCurrent?: boolean }>`
  position: relative;
  display: grid;
  gap: 24px;
  padding: 40px 32px;
  border-radius: 20px;
  background: ${({ highlight, isCurrent }) => {
    if (isCurrent) {
      return 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(46, 139, 87, 0.04) 100%)';
    }
    return highlight
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.95) 0%, rgba(46, 139, 87, 0.85) 100%)'
      : '#ffffff';
  }};
  color: ${({ highlight }) => (highlight ? '#ffffff' : theme.colors.textPrimary)};
  border: ${({ highlight, isCurrent }) => {
    if (isCurrent) return '2px solid rgba(46, 139, 87, 0.3)';
    return highlight ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(46, 139, 87, 0.12)';
  }};
  box-shadow: ${({ highlight, isCurrent }) => {
    if (isCurrent) return '0 8px 32px rgba(46, 139, 87, 0.15), 0 0 0 1px rgba(46, 139, 87, 0.1)';
    return highlight
      ? '0 24px 64px rgba(46, 139, 87, 0.3), 0 8px 24px rgba(46, 139, 87, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      : '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(46, 139, 87, 0.08)';
  }};
  overflow: hidden;
  isolation: isolate;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.6s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${({ highlight }) => (highlight ? '4px' : '0')};
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.6) 100%);
    opacity: ${({ highlight }) => (highlight ? 1 : 0)};
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ highlight }) =>
      highlight
        ? '0 32px 80px rgba(46, 139, 87, 0.4), 0 12px 32px rgba(46, 139, 87, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        : '0 12px 40px rgba(46, 139, 87, 0.15), 0 0 0 1px rgba(46, 139, 87, 0.2)'};
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 8px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
  backdrop-filter: blur(10px);
  color: #ffffff;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  svg {
    font-size: 14px;
  }
`;

const PriceRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  strong {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: 800;
    font-family: ${theme.fonts.heading};
    letter-spacing: -0.03em;
    line-height: 1;
    color: inherit;
  }

  del {
    opacity: 0.5;
    font-size: 1.2rem;
    font-weight: 500;
    text-decoration: line-through;
  }

  span {
    font-size: 14px;
    opacity: 0.8;
    font-weight: 500;
    margin-top: 4px;
  }
`;

const FeatureList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
  font-size: 15px;

  li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    line-height: 1.6;
    font-weight: 500;
  }

  svg {
    font-size: 20px;
    color: inherit;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const SelectButton = styled.button<{ highlight?: boolean; isCurrent?: boolean }>`
  padding: 16px 24px;
  border-radius: 12px;
  border: ${({ highlight, isCurrent }) => {
    if (isCurrent) return '2px solid rgba(46, 139, 87, 0.3)';
    return highlight ? '2px solid rgba(255, 255, 255, 0.4)' : '2px solid rgba(46, 139, 87, 0.3)';
  }};
  background: ${({ highlight, isCurrent }) => {
    if (isCurrent) {
      return 'linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(46, 139, 87, 0.05) 100%)';
    }
    return highlight
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)'
      : 'linear-gradient(135deg, rgba(46, 139, 87, 0.95) 0%, rgba(46, 139, 87, 0.85) 100%)';
  }};
  color: ${({ highlight, isCurrent }) => {
    if (isCurrent) return theme.colors.primary;
    return highlight ? '#ffffff' : '#ffffff';
  }};
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.02em;
  cursor: ${({ isCurrent }) => (isCurrent ? 'default' : 'pointer')};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ highlight, isCurrent }) => {
    if (isCurrent) return '0 2px 8px rgba(46, 139, 87, 0.1)';
    return highlight
      ? '0 12px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      : '0 8px 24px rgba(46, 139, 87, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
  }};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: ${({ highlight }) =>
      highlight
        ? '0 16px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        : '0 12px 32px rgba(46, 139, 87, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)'};
    
    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PremiumBenefits = styled.section`
  display: grid;
  gap: 32px;
  padding: 48px 0;
  
  h2 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.5rem);
    font-weight: 800;
    color: #0a0e13;
    font-family: ${theme.fonts.heading};
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
`;

const BenefitGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const BenefitCard = styled.article`
  display: grid;
  gap: 16px;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid rgba(46, 139, 87, 0.1);
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
    transform: scaleY(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(46, 139, 87, 0.15);
    border-color: ${theme.colors.primary};
    
    &::before {
      transform: scaleY(1);
    }
  }

  h4 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #0a0e13;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.01em;
    
    svg {
      color: ${theme.colors.primary};
      font-size: 24px;
    }
  }

  p {
    margin: 0;
    color: #4a5568;
    line-height: 1.7;
    font-size: 15px;
    font-weight: 400;
  }
`;

const SubscriptionPage: React.FC = () => {
  const { availablePlans, currentPlan, selectPlan } = useSubscription();
  const { user } = useAuth();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeAvailable, setStripeAvailable] = useState(false);

  // Verificar si Stripe está configurado
  useEffect(() => {
    setStripeAvailable(isStripeConfigured());
  }, []);

  // Manejar redirección después del pago
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    const plan = params.get('plan') as 'weekly' | 'monthly' | 'annual' | null;

    if (success && plan) {
      // El pago fue exitoso, actualizar la suscripción
      selectPlan(plan).then(() => {
        // Limpiar la URL
        window.history.replaceState({}, '', '/suscripcion');
      }).catch(error => {
        console.error('Error actualizando suscripción después del pago:', error);
      });
    } else if (canceled) {
      // El usuario canceló el pago
      console.log('Pago cancelado por el usuario');
      window.history.replaceState({}, '', '/suscripcion');
    }
  }, [location.search, selectPlan]);

  const handleSelectPlan = async (planId: 'weekly' | 'monthly' | 'annual' | 'free') => {
    if (planId === 'free') {
      await selectPlan('free');
      return;
    }

    console.log('🔘 Botón de suscripción clickeado:', planId);
    
    if (!stripeAvailable) {
      console.warn('⚠️ Stripe no está configurado, usando modo simulado');
      console.warn('🔍 Verificando configuración:', {
        publishableKey: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        weeklyPrice: !!import.meta.env.VITE_STRIPE_PRICE_WEEKLY,
        monthlyPrice: !!import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
        annualPrice: !!import.meta.env.VITE_STRIPE_PRICE_ANNUAL,
      });
      // Fallback al modo simulado si Stripe no está configurado
      await selectPlan(planId);
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🚀 Redirigiendo a Stripe Checkout para plan:', planId);
      const result = await redirectToCheckout(
        planId as 'weekly' | 'monthly' | 'annual',
        user?.email
      );

      if (!result.success) {
        console.error('❌ Error en redirectToCheckout:', result.error);
        alert(result.error || 'Error al procesar el pago. Por favor, verifica la configuración de Stripe.');
        setIsProcessing(false);
      } else {
        console.log('✅ Redirección a Stripe iniciada, el usuario será redirigido...');
        // No establecer isProcessing a false aquí porque el usuario será redirigido
        // Si hay un error, se manejará en el catch
      }
    } catch (error) {
      console.error('❌ Error seleccionando plan:', error);
      setIsProcessing(false);
      alert('Error al procesar el pago. Por favor, intenta de nuevo. Si el problema persiste, contacta con soporte.');
    }
  };

  return (
    <PageWrapper>
      <Hero>
        <h1>Upgrade to TastyPath Premium</h1>
        <p>
          Desbloquea cálculos en tiempo real y funciones avanzadas. Genera menús ilimitados con IA, accede a analíticas personalizadas y disfruta de soporte prioritario.
        </p>
        <Benefits>
          <li>
            <FiZap /> Resultados instantáneos
          </li>
          <li>
            <FiTrendingUp /> IA avanzada con nutricionistas
          </li>
          <li>
            <FiShield /> Seguridad de nivel empresarial
          </li>
          <li>
            <FiLock /> Encriptación de nivel bancario
          </li>
        </Benefits>
      </Hero>

      <PlanGrid>
        {availablePlans.map(plan => {
          const highlight = plan.id === 'monthly' || plan.id === 'annual';
          const isCurrent = plan.id === currentPlan?.plan;
          const period = plan.period || 'mes';
          
          return (
            <PlanCard key={plan.id} highlight={highlight} isCurrent={isCurrent}>
              {highlight && (
                <Badge>
                  <TbCrown /> Popular
                </Badge>
              )}
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em' }}>{plan.name}</h3>
                <p style={{ margin: '8px 0 0 0', opacity: highlight ? 0.9 : 0.7, fontSize: '15px', lineHeight: '1.6' }}>
                  {plan.id === 'free'
                    ? 'Perfecto para probar la experiencia TastyPath.'
                    : plan.id === 'weekly'
                      ? 'Flexibilidad semanal para quienes inician su transformación.'
                      : plan.id === 'monthly'
                        ? 'Plan recomendado para resultados sostenidos con IA.'
                        : 'La mejor inversión anual con hasta 2 meses de regalo.'}
                </p>
              </div>
              <PriceRow>
                {'originalPrice' in plan && plan.originalPrice ? (
                  <del>{plan.originalPrice.toFixed(2).replace('.', ',')}€</del>
                ) : null}
                <strong>{plan.price.toFixed(2).replace('.', ',')}€</strong>
                {plan.id !== 'free' && (
                  <span>
                    {plan.id === 'annual' 
                      ? `Facturado anualmente a ${(plan.price / 12).toFixed(2).replace('.', ',')}€/mes`
                      : `/${period}`}
                  </span>
                )}
              </PriceRow>
              <FeatureList>
                <li>
                  <FiCheckCircle />
                  {plan.id === 'free' ? '1 plan generado al mes' : 'Menús ilimitados generados por IA'}
                </li>
                <li>
                  <FiCheckCircle />
                  {plan.id === 'free'
                    ? 'Lista de compras no disponible'
                    : 'Lista de compras inteligente'}
                </li>
                <li>
                  <FiCheckCircle />
                  {plan.id === 'free'
                    ? 'Soporte básico'
                    : plan.id === 'annual'
                      ? 'Prioridad total y early access a nuevas funciones'
                      : 'Soporte prioritario 24h'}
                </li>
                {plan.id !== 'free' && (
                  <li>
                    <FiCheckCircle />
                    Recetas exclusivas con carnes y pescados premium
                  </li>
                )}
              </FeatureList>
              <SelectButton 
                highlight={highlight} 
                isCurrent={isCurrent}
                onClick={() => !isCurrent && handleSelectPlan(plan.id as 'weekly' | 'monthly' | 'annual' | 'free')}
                disabled={isCurrent || isProcessing}
              >
                {isProcessing 
                  ? 'Procesando...' 
                  : isCurrent 
                    ? 'Plan actual' 
                    : plan.id === 'free'
                      ? 'Seleccionar plan'
                      : 'Suscribirse ahora'}
              </SelectButton>
            </PlanCard>
          );
        })}
      </PlanGrid>

      <PremiumBenefits>
        <h2>Características Premium</h2>
        <BenefitGrid>
          <BenefitCard>
            <h4>
              <FiZap /> Resultados instantáneos
            </h4>
            <p>
              Cálculos en tiempo real con nuestra IA avanzada. Genera menús personalizados en segundos basados en tus preferencias, objetivos nutricionales y restricciones dietéticas.
            </p>
          </BenefitCard>
          <BenefitCard>
            <h4>
              <FiTrendingUp /> IA avanzada con nutricionistas
            </h4>
            <p>
              Nuestros modelos integran guías médicas (OMS, USDA) y estudios científicos para crear menús que equilibran carnes, pescados y opciones vegetales sin sacrificar sabor ni tus objetivos.
            </p>
          </BenefitCard>
          <BenefitCard>
            <h4>
              <FiShield /> Seguridad de nivel empresarial
            </h4>
            <p>
              Tus datos están protegidos con encriptación de nivel bancario. Cumplimos con los más altos estándares de seguridad y privacidad para garantizar la protección de tu información personal.
            </p>
          </BenefitCard>
        </BenefitGrid>
      </PremiumBenefits>
    </PageWrapper>
  );
};

export default SubscriptionPage;
