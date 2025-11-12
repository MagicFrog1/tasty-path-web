import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiGift, FiStar, FiTrendingUp } from 'react-icons/fi';
import { TbCrown } from 'react-icons/tb';
import { useSubscription } from '../context/SubscriptionContext';
import { theme } from '../styles/theme';

const PageWrapper = styled.div`
  display: grid;
  gap: 32px;
`;

const Hero = styled.section`
  display: grid;
  gap: 16px;
  padding: 36px;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.18), rgba(99, 102, 241, 0.2));
  border: 1px solid rgba(46, 139, 87, 0.18);
  box-shadow: 0 28px 60px rgba(46, 139, 87, 0.18);
  color: ${theme.colors.primaryDark};

  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 4vw, 2.7rem);
  }

  p {
    margin: 0;
    max-width: 780px;
    line-height: 1.7;
    color: rgba(33, 37, 41, 0.82);
  }
`;

const Benefits = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(46, 139, 87, 0.2);
    box-shadow: 0 14px 28px rgba(46, 139, 87, 0.12);
  }

  svg {
    color: ${theme.colors.primary};
  }
`;

const PlanGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const PlanCard = styled.div<{ highlight?: boolean }>`
  position: relative;
  display: grid;
  gap: 18px;
  padding: 26px;
  border-radius: 24px;
  background: ${({ highlight }) =>
    highlight
      ? 'linear-gradient(150deg, rgba(46, 139, 87, 0.75), rgba(99, 102, 241, 0.65))'
      : 'rgba(255, 255, 255, 0.95)'};
  color: ${({ highlight }) => (highlight ? '#fff' : theme.colors.textPrimary)};
  border: 1px solid ${({ highlight }) => (highlight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(46, 139, 87, 0.18)')};
  box-shadow: ${({ highlight }) =>
    highlight ? '0 32px 76px rgba(46, 139, 87, 0.35)' : '0 20px 45px rgba(46, 139, 87, 0.14)'};
  overflow: hidden;
  isolation: isolate;
`;

const Badge = styled.span`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;

  strong {
    font-size: 1.8rem;
  }

  del {
    opacity: 0.6;
  }
`;

const FeatureList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
  font-size: 0.95rem;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  svg {
    font-size: 18px;
    color: inherit;
  }
`;

const SelectButton = styled.button<{ highlight?: boolean }>`
  padding: 12px 18px;
  border-radius: 14px;
  border: ${({ highlight }) => (highlight ? '1px solid rgba(255, 255, 255, 0.4)' : '2px solid rgba(46, 139, 87, 0.3)')};
  background: ${({ highlight }) =>
    highlight ? 'rgba(255, 255, 255, 0.18)' : 'linear-gradient(135deg, rgba(46, 139, 87, 0.95), rgba(99, 102, 241, 0.9))'};
  color: ${({ highlight }) => (highlight ? '#fff' : '#fff')};
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: ${({ highlight }) =>
    highlight ? '0 18px 40px rgba(0, 0, 0, 0.22)' : '0 18px 40px rgba(46, 139, 87, 0.24)'};

  &:hover {
    transform: translateY(-2px);
  }
`;

const PremiumBenefits = styled.section`
  display: grid;
  gap: 22px;
`;

const BenefitGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const BenefitCard = styled.article`
  display: grid;
  gap: 10px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(46, 139, 87, 0.14);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 45px rgba(46, 139, 87, 0.12);

  h4 {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: ${theme.colors.primaryDark};
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const SubscriptionPage: React.FC = () => {
  const { availablePlans, currentPlan, selectPlan } = useSubscription();

  return (
    <PageWrapper>
      <Hero>
        <h1>Suscripción</h1>
        <p>
          Activa TastyPath Premium y desbloquea menús generados por IA sin límites, analíticas avanzadas y soporte prioritario. Tu plan actual es{' '}
          <strong>{currentPlan?.plan ?? 'free'}</strong>.
        </p>
        <Benefits>
          <li>
            <TbCrown /> IA sin límites para menús semanales
          </li>
          <li>
            <FiTrendingUp /> Analíticas personalizadas de macros
          </li>
          <li>
            <FiStar /> Recetas exclusivas con carnes y pescados premium
          </li>
          <li>
            <FiGift /> Beneficios para nuevos lanzamientos
          </li>
        </Benefits>
      </Hero>

      <PlanGrid>
        {availablePlans.map(plan => {
          const highlight = plan.id === 'weekly' || plan.id === 'monthly';
          return (
            <PlanCard key={plan.id} highlight={highlight}>
              {highlight && (
                <Badge>
                  <TbCrown /> Popular
                </Badge>
              )}
              <div>
                <h3 style={{ margin: 0 }}>{plan.name}</h3>
                <p style={{ margin: '4px 0', opacity: highlight ? 0.85 : 0.7 }}>
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
                {'originalPrice' in plan && plan.originalPrice ? <del>{plan.originalPrice}€</del> : null}
                <strong>{plan.price}€</strong>
              </PriceRow>
              <FeatureList>
                <li>
                  <FiCheckCircle />
                  {plan.id === 'free' ? '1 plan generado al mes' : 'Menús ilimitados generados por IA'}
                </li>
                <li>
                  <FiCheckCircle />
                  {plan.id === 'free'
                    ? 'Lista de compras básica'
                    : 'Lista de compras inteligente con sustituciones automáticas'}
                </li>
                <li>
                  <FiCheckCircle />
                  {plan.id === 'annual' ? 'Prioridad total y early access a nuevas funciones' : 'Soporte prioritario 24h'}
                </li>
              </FeatureList>
              <SelectButton highlight={highlight} onClick={() => selectPlan(plan.id)}>
                {plan.id === currentPlan?.plan ? 'Plan actual' : 'Seleccionar'}
              </SelectButton>
            </PlanCard>
          );
        })}
      </PlanGrid>

      <PremiumBenefits>
        <h2>Ventajas exclusivas Premium</h2>
        <BenefitGrid>
          <BenefitCard>
            <h4>
              <FiTrendingUp /> IA avanzada con nutricionistas
            </h4>
            <p>
              Nuestros modelos integran guías médicas (OMS, USDA) y estudios científicos para crear menús que equilibran carnes, pescados y opciones
              vegetales sin sacrificar sabor ni tus objetivos.
            </p>
          </BenefitCard>
          <BenefitCard>
            <h4>
              <FiStar /> Recetas exclusivas cada semana
            </h4>
            <p>
              Accede a platos gourmet y familiares priorizando proteínas de calidad, pescados omega-3 y cortes selectos supervisados por el equipo
              culinario de TastyPath.
            </p>
          </BenefitCard>
          <BenefitCard>
            <h4>
              <FiGift /> Experiencia sin límites
            </h4>
            <p>
              Genera tantos planes como necesites, comparte con tu familia y guarda tus menús favoritos para repetirlos o ajustarlos cuando quieras.
            </p>
          </BenefitCard>
        </BenefitGrid>
      </PremiumBenefits>
    </PageWrapper>
  );
};

export default SubscriptionPage;
