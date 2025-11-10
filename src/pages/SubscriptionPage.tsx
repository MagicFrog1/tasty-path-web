import React from 'react';
import styled from 'styled-components';
import { useSubscription } from '../context/SubscriptionContext';

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 18px;
  background: #fff;
`;

const SubscriptionPage: React.FC = () => {
  const { availablePlans, currentPlan, selectPlan } = useSubscription();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Suscripción</h1>
      <p>Plan actual: {currentPlan?.plan ?? 'free'}</p>
      <Cards>
        {availablePlans.map(plan => (
          <Card key={plan.id}>
            <h3 style={{ marginTop: 0 }}>{plan.name}</h3>
            {'originalPrice' in plan && plan.originalPrice ? (
              <p>
                <del>{plan.originalPrice}€</del> <strong>{plan.price}€</strong>
              </p>
            ) : (
              <p>
                <strong>{plan.price}€</strong>
              </p>
            )}
            <button onClick={() => selectPlan(plan.id)}>Seleccionar</button>
          </Card>
        ))}
      </Cards>
    </div>
  );
};

export default SubscriptionPage;


