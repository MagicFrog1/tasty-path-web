import React from 'react';
import { useParams } from 'react-router-dom';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';

const PlanDetailPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { getPlanById } = useWeeklyPlan();
  const plan = planId ? getPlanById(planId) : undefined;

  if (!plan) return <div>No se encontró el plan.</div>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{plan.name}</h1>
      <p>{plan.description}</p>
      <p>Progreso: {plan.progress.percentage}%</p>
    </div>
  );
};

export default PlanDetailPage;


