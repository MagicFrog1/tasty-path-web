import React from 'react';
import { Link } from 'react-router-dom';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';

const SavedPlansPage: React.FC = () => {
  const { weeklyPlans } = useWeeklyPlan();
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Mis Planes</h1>
      <ul>
        {weeklyPlans.map(plan => (
          <li key={plan.id}>
            <Link to={`/plan/${plan.id}`}>{plan.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavedPlansPage;


