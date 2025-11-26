import React, { useState } from 'react';
import styled from 'styled-components';
import { FiTarget, FiCalendar, FiTrendingUp, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { theme } from '../../styles/theme';

const OnboardingContainer = styled.div`
  display: grid;
  gap: 32px;
`;

const StepCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 20px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(46, 139, 87, 0.1);
`;

const StepTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 22px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  font-size: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(46, 139, 87, 0.2);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  font-family: ${theme.fonts.body};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(46, 139, 87, 0.2);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  font-family: ${theme.fonts.body};
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
  }
`;

const Button = styled.button`
  padding: 14px 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

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

const ValidationCard = styled.div<{ type: 'success' | 'warning' | 'error' }>`
  padding: 20px;
  border-radius: 16px;
  margin-top: 24px;
  border: 1.5px solid;
  background: ${props => {
    if (props.type === 'success') return 'linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%)';
    if (props.type === 'warning') return 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%)';
    return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.08) 100%)';
  }};
  border-color: ${props => {
    if (props.type === 'success') return 'rgba(46, 139, 87, 0.3)';
    if (props.type === 'warning') return 'rgba(251, 191, 36, 0.3)';
    return 'rgba(239, 68, 68, 0.3)';
  }};
`;

const ValidationTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ValidationText = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  font-size: 15px;
`;

interface OnboardingStepProps {
  onComplete: (data: {
    finalGoal: string;
    targetValue: number;
    currentValue: number;
    timeframe: number; // en meses
    age: number;
    validated: boolean;
    adjustedGoal?: { value: number; timeframe: number };
  }) => void;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ onComplete }) => {
  const [finalGoal, setFinalGoal] = useState<'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance'>('weight_loss');
  const [targetValue, setTargetValue] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [validation, setValidation] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    adjustedGoal?: { value: number; timeframe: number };
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!targetValue || !currentValue || !age) {
      alert('Por favor, completa todos los campos');
      return;
    }

    setIsValidating(true);

    // Simular validación por IA (en producción, esto sería una llamada a la API)
    // Los planes mensuales siempre son de 1 mes
    setTimeout(() => {
      const target = parseFloat(targetValue);
      const current = parseFloat(currentValue);
      const months = 1; // Siempre 1 mes para planes mensuales
      const difference = Math.abs(target - current);
      const weeklyChange = difference / (months * 4.33);
      
      // Validación de realismo
      let validationResult: typeof validation;
      
      if (finalGoal === 'weight_loss') {
        if (weeklyChange > 1.5) {
          // Pérdida de peso demasiado rápida
          const adjustedMonths = Math.ceil(difference / (1.0 * 4.33)); // Máximo 1kg por semana
          validationResult = {
            type: 'warning',
            title: 'Objetivo Ambicioso',
            message: `Perder ${difference}kg en ${months} meses requiere una pérdida de ${weeklyChange.toFixed(2)}kg por semana, lo cual no es recomendable para la salud. Te sugerimos ajustar el plazo a ${adjustedMonths} meses para una pérdida saludable de aproximadamente 1kg por semana.`,
            adjustedGoal: {
              value: target,
              timeframe: adjustedMonths
            }
          };
        } else if (weeklyChange < 0.25) {
          validationResult = {
            type: 'success',
            title: 'Objetivo Realista',
            message: `Tu objetivo es alcanzable. Requiere adherencia del 85-90% y seguimiento constante. El sistema generará un plan mensual de 30 días para alcanzar tu meta.`,
          };
        } else {
          validationResult = {
            type: 'success',
            title: 'Objetivo Realista',
            message: `Tu objetivo es alcanzable con adherencia del 90-95%. El sistema generará un plan mensual de 30 días para alcanzar tu meta.`,
          };
        }
      } else {
        // Para ganancia de peso o músculo
        if (weeklyChange > 0.5) {
          const adjustedMonths = Math.ceil(difference / (0.3 * 4.33));
          validationResult = {
            type: 'warning',
            title: 'Objetivo Ambicioso',
            message: `Ganar ${difference}kg en ${months} meses puede no ser sostenible. Te sugerimos ajustar el plazo a ${adjustedMonths} meses para una ganancia saludable.`,
            adjustedGoal: {
              value: target,
              timeframe: adjustedMonths
            }
          };
        } else {
          validationResult = {
            type: 'success',
            title: 'Objetivo Realista',
            message: `Tu objetivo es alcanzable. El sistema generará un plan mensual de 30 días con ejercicios personalizados.`,
          };
        }
      }

      setValidation(validationResult);
      setIsValidating(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!validation || validation.type === 'error') {
      alert('Por favor, valida tu objetivo primero');
      return;
    }

    const adjusted = validation.adjustedGoal || { value: parseFloat(targetValue), timeframe: 1 };

    onComplete({
      finalGoal,
      targetValue: adjusted.value,
      currentValue: parseFloat(currentValue),
      timeframe: 1, // Siempre 1 mes para planes mensuales
      age: parseFloat(age),
      validated: true,
      adjustedGoal: validation.adjustedGoal,
    });
  };

  return (
    <OnboardingContainer>
      <StepCard>
        <StepTitle>
          <FiTarget />
          Define tu Objetivo Final
        </StepTitle>
        
        <FormGroup>
          <Label>¿Cuál es tu objetivo principal?</Label>
          <Select value={finalGoal} onChange={(e) => setFinalGoal(e.target.value as any)}>
            <option value="weight_loss">Pérdida de Peso</option>
            <option value="weight_gain">Ganancia de Peso</option>
            <option value="muscle_gain">Ganancia de Músculo</option>
            <option value="maintenance">Mantenimiento</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Valor Actual (kg)</Label>
          <Input
            type="number"
            step="0.1"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="Ej: 75.5"
          />
        </FormGroup>

        <FormGroup>
          <Label>Objetivo Final (kg)</Label>
          <Input
            type="number"
            step="0.1"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Ej: 70"
          />
        </FormGroup>


        <FormGroup>
          <Label>Edad</Label>
          <Input
            type="number"
            min="12"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ej: 30"
          />
        </FormGroup>

        <Button onClick={handleValidate} disabled={isValidating}>
          {isValidating ? 'Validando con IA...' : 'Validar Objetivo con IA'}
        </Button>

        {validation && (
          <ValidationCard type={validation.type}>
            <ValidationTitle>
              {validation.type === 'success' && <FiCheckCircle />}
              {validation.type === 'warning' && <FiAlertCircle />}
              {validation.title}
            </ValidationTitle>
            <ValidationText>{validation.message}</ValidationText>
            {validation.adjustedGoal && (
              <div style={{ marginTop: '16px' }}>
                <Button
                  onClick={() => {
                    setTargetValue(validation.adjustedGoal!.value.toString());
                    setValidation(null);
                  }}
                  style={{ marginTop: '12px' }}
                >
                  Aplicar Ajuste Sugerido
                </Button>
              </div>
            )}
          </ValidationCard>
        )}

        {validation && validation.type !== 'error' && (
          <Button onClick={handleSubmit} style={{ marginTop: '24px' }}>
            Confirmar y Crear Roadmap
          </Button>
        )}
      </StepCard>
    </OnboardingContainer>
  );
};

export default OnboardingStep;

