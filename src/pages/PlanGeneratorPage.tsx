import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { useUserProfile } from '../context/UserProfileContext';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { useShoppingList } from '../context/ShoppingListContext';
import { nutritionService } from '../services/NutritionService';
import AIMenuService, { AIMenuRequest } from '../services/AIMenuService';

const Form = styled.form`
  display: grid;
  gap: 16px;
  max-width: 720px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${theme.colors.gray};
  background: ${theme.colors.white};
`;

const Select = styled.select`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${theme.colors.gray};
  background: ${theme.colors.white};
`;

const CheckboxRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
`;

const Chip = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${theme.colors.gray};
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
`;

const Button = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: 0;
  border-radius: 12px;
  padding: 14px 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: ${theme.shadows.md};
`;

const Ghost = styled(Button)`
  background: #fff;
  color: ${theme.colors.primary};
  border: 2px solid ${theme.colors.primary};
` as unknown as typeof Button;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const Note = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${theme.colors.gray};
`;

const PlanGeneratorPage: React.FC = () => {
  const { profile } = useUserProfile();
  const { addWeeklyPlan } = useWeeklyPlan();
  const { updateShoppingListFromPlan } = useShoppingList();

  const [currentStep, setCurrentStep] = useState(1);
  const [goal, setGoal] = useState('Mantenimiento');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [weight, setWeight] = useState(profile.weight || 70);
  const [height, setHeight] = useState(profile.height || 170);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const toggleList = (list: string[], value: string, setter: (v: string[]) => void) => {
    if (list.includes(value)) setter(list.filter(v => v !== value));
    else setter([...list, value]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(s => s + 1);
      return;
    }

    setIsLoading(true);
    setStatus('Calculando parámetros nutricionales...');

    try {
      const bmr = nutritionService.calculateBMR(weight, height, profile.age, profile.gender);
      const tmt = nutritionService.calculateTMT(bmr, profile.activityLevel);
      let targetCalories = tmt;
      if (goal === 'Pérdida de peso') targetCalories = tmt * 0.85;
      if (goal === 'Aumento de masa muscular') targetCalories = tmt * 1.1;

      setStatus('Preparando solicitud para IA...');

      const aiRequest: AIMenuRequest = {
        nutritionGoals: { protein: 25, carbs: 50, fat: 25, fiber: 25 },
        totalCalories: Math.round(targetCalories * 7),
        dietaryPreferences,
        allergies: allergens,
        weight,
        height,
        bmr,
        activityLevel: profile.activityLevel,
        bmi: nutritionService.calculateBMI(weight, height),
        age: profile.age,
        gender: profile.gender,
      };

      setStatus('Generando menús personalizados con IA...');
      const response = await AIMenuService.generateWeeklyMenu(aiRequest);

      if (!response.success || !response.weeklyMenu) {
        throw new Error('La IA no devolvió un menú válido');
      }

      setStatus('Guardando plan semanal...');

      const now = new Date();
      const planId = Date.now().toString();
      const weeklyPlan = {
        id: planId,
        weekStart: now.toISOString(),
        weekEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalMeals: 21,
        totalCalories: Math.round(targetCalories * 7),
        totalCost: 0,
        status: 'active' as const,
        name: `Plan Semanal - ${now.toLocaleDateString('es-ES')}`,
        description: `Plan generado (web) para ${goal}`,
        nutritionGoals: { protein: 25, carbs: 50, fat: 25, fiber: 25 },
        progress: { completedMeals: 0, totalMeals: 21, percentage: 0 },
        config: { goal, weight, height, dietaryPreferences, allergens },
        meals: response.weeklyMenu,
        estimatedCalories: Math.round(targetCalories),
        createdAt: now.toISOString(),
      };

      addWeeklyPlan(weeklyPlan);

      setStatus('Generando lista de compras...');

      const ingredients = new Map<string, { quantity: string; unit: string }>();
      response.weeklyMenu.forEach(day => {
        if (day.meals) {
          Object.values(day.meals).forEach((meal: any) => {
            if (!meal) return;
            const items = Array.isArray(meal.ingredients) ? meal.ingredients : [];
            items.forEach((raw: string) => {
              const clean = (raw || '').trim().toLowerCase();
              if (!clean) return;
              if (!ingredients.has(clean)) {
                ingredients.set(clean, { quantity: '1', unit: 'unidad' });
              }
            });
          });
        }
      });

      const shoppingListItems = Array.from(ingredients.entries()).map(([name, details]) => ({
        id: `${planId}_${name}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: parseFloat(details.quantity) || 1,
        unit: details.unit,
        price: 0,
        category: 'Otros',
        isChecked: false,
        notes: `Del plan: ${planId}`,
        sourcePlan: planId,
      }));

      if (shoppingListItems.length) {
        updateShoppingListFromPlan(planId, shoppingListItems);
      }

      window.alert('¡Plan generado con IA y guardado! Revisa "Mis Planes" y la "Lista de Compras".');
      setStatus(null);
    } catch (err) {
      console.error(err);
      window.alert('No se pudo generar el plan con IA. Intenta de nuevo.');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Generador de Plan (Web)</h1>
      <Note>
        Cuestionario paso a paso. Al finalizar, generaremos tu menú semanal con IA y crearemos la lista de compras.
      </Note>
      <Form onSubmit={onSubmit}>
        {currentStep === 1 && (
          <>
            <h3>1. Objetivo</h3>
            <Field>
              <Label>Objetivo principal</Label>
              <Select value={goal} onChange={e => setGoal(e.target.value)}>
                <option>Pérdida de peso</option>
                <option>Mantenimiento</option>
                <option>Aumento de masa muscular</option>
                <option>Control de diabetes</option>
                <option>Salud cardiovascular</option>
              </Select>
            </Field>
            <Row>
              <Field>
                <Label>Peso (kg)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value))} />
              </Field>
              <Field>
                <Label>Altura (cm)</Label>
                <Input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value))} />
              </Field>
            </Row>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3>2. Preferencias dietéticas</h3>
            <CheckboxRow>
              {['Vegetariana', 'Vegana', 'Sin gluten', 'Sin lactosa', 'Baja en carbohidratos', 'Alta en proteínas'].map(opt => (
                <Chip key={opt}>
                  <input
                    type="checkbox"
                    checked={dietaryPreferences.includes(opt)}
                    onChange={() => toggleList(dietaryPreferences, opt, setDietaryPreferences)}
                  />
                  <span>{opt}</span>
                </Chip>
              ))}
            </CheckboxRow>
          </>
        )}

        {currentStep === 3 && (
          <>
            <h3>3. Alergias</h3>
            <CheckboxRow>
              {['Gluten', 'Lactosa', 'Huevos', 'Frutos secos', 'Mariscos', 'Soja', 'Pescado', 'Cacahuetes', 'Sésamo', 'Mostaza'].map(opt => (
                <Chip key={opt}>
                  <input
                    type="checkbox"
                    checked={allergens.includes(opt)}
                    onChange={() => toggleList(allergens, opt, setAllergens)}
                  />
                  <span>{opt}</span>
                </Chip>
              ))}
            </CheckboxRow>
          </>
        )}

        <Divider />
        <Actions>
          {currentStep > 1 && (
            <Ghost type="button" onClick={() => setCurrentStep(s => Math.max(1, s - 1))}>Atrás</Ghost>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generando...' : currentStep < 3 ? 'Siguiente' : 'Generar plan'}
          </Button>
        </Actions>
        {status && <Note>{status}</Note>}
      </Form>
    </div>
  );
};

export default PlanGeneratorPage;

