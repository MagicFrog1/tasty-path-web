import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTarget, FiCheckCircle, FiEdit3, FiArrowRight, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import minutriEvaluationService, { EvaluationRequest } from '../../services/minutriEvaluationService';

const ResultsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
`;

const ResultsCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: ${theme.shadows.lg};
  animation: slideUp 0.4s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
  }
`;

const ResultsHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    margin: 0 0 12px 0;
    font-size: 28px;
    font-weight: 800;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    font-size: 16px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
  text-align: center;
  
  .stat-value {
    font-size: 32px;
    font-weight: 800;
    color: ${theme.colors.primaryDark};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .stat-label {
    font-size: 14px;
    color: ${theme.colors.textSecondary};
    font-weight: 600;
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: ${theme.colors.primaryDark};
    font-size: 14px;
  }
  
  input, textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid rgba(46, 139, 87, 0.2);
    border-radius: 12px;
    font-size: 15px;
    font-family: ${theme.fonts.body};
    transition: all 0.3s ease;
    box-sizing: border-box;
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
    }
  ` : `
    background: rgba(46, 139, 87, 0.1);
    color: ${theme.colors.primaryDark};
    border: 1.5px solid rgba(46, 139, 87, 0.2);
    
    &:hover {
      background: rgba(46, 139, 87, 0.15);
    }
  `}
`;

const EvaluationSection = styled.div`
  margin-top: 24px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
`;

const EvaluationTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EvaluationList = styled.ul`
  margin: 0;
  padding-left: 24px;
  color: ${theme.colors.textSecondary};
  line-height: 2;
  
  li {
    margin-bottom: 8px;
  }
`;

const LoadingEvaluation = styled.div`
  text-align: center;
  padding: 20px;
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

interface MonthResultsProps {
  adherence: number;
  completedDays: number;
  completedMeals: number;
  totalMeals: number;
  completedExercises: number;
  totalExercises: number;
  initialWeight: number;
  targetWeight: number;
  goal: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance';
  timeframe: number;
  currentMonth: number;
  onSaveResults: (results: { finalWeight?: number; notes?: string }) => void;
  onCreateNewPlan: () => void;
  onClose: () => void;
}

const MonthResults: React.FC<MonthResultsProps> = ({
  adherence,
  completedDays,
  completedMeals,
  totalMeals,
  completedExercises,
  totalExercises,
  initialWeight,
  targetWeight,
  goal,
  timeframe,
  currentMonth,
  onSaveResults,
  onCreateNewPlan,
  onClose,
}) => {
  const [finalWeight, setFinalWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Generar evaluación cuando se abre el modal
  useEffect(() => {
    const generateEvaluation = async () => {
      setIsEvaluating(true);
      try {
        const evalRequest: EvaluationRequest = {
          adherence,
          completedDays,
          totalDays: 30,
          completedMeals,
          totalMeals,
          completedExercises,
          totalExercises,
          initialWeight,
          currentWeight: finalWeight ? parseFloat(finalWeight) : undefined,
          targetWeight,
          goal,
          timeframe,
          currentMonth,
          notes: notes || undefined,
        };
        
        const evalResult = await minutriEvaluationService.evaluateMonth(evalRequest);
        setEvaluation(evalResult);
      } catch (error) {
        console.error('Error generando evaluación:', error);
      } finally {
        setIsEvaluating(false);
      }
    };

    generateEvaluation();
  }, [adherence, completedDays, completedMeals, totalMeals, completedExercises, totalExercises, initialWeight, targetWeight, goal, timeframe, currentMonth]);

  const handleSaveAndContinue = () => {
    const results = {
      finalWeight: finalWeight ? parseFloat(finalWeight) : undefined,
      notes: notes || undefined,
    };
    // Guardar resultados primero
    onSaveResults(results);
    // Cerrar el modal inmediatamente
    onClose();
    // Crear el nuevo plan después de un pequeño delay para asegurar que el modal se cierre
    setTimeout(() => {
      try {
        onCreateNewPlan();
      } catch (error) {
        console.error('Error al crear nuevo plan:', error);
      }
    }, 300);
  };

  return (
    <ResultsOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ResultsCard onClick={(e) => e.stopPropagation()}>
        <ResultsHeader>
          <h2>
            <FiCheckCircle />
            {evaluation && evaluation.overallAdherence >= 80 ? '¡Mes Completado con Éxito! 🎉' : '¡Mes Completado!'}
          </h2>
          <p>
            {evaluation && evaluation.overallAdherence >= 80 
              ? '¡Felicitaciones! Has completado el mes con excelente adherencia. Registra tus resultados y continúa tu progreso.'
              : 'Registra tus resultados y crea tu próximo plan'}
          </p>
        </ResultsHeader>

        <StatsGrid>
          <StatCard>
            <div className="stat-value">
              <FiTrendingUp />
              {adherence}%
            </div>
            <div className="stat-label">Adherencia</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">
              <FiTarget />
              {completedDays}/30
            </div>
            <div className="stat-label">Días Completados</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">
              <FiCheckCircle />
              {evaluation ? evaluation.mealCompletionPercentage : 0}%
            </div>
            <div className="stat-label">Comidas Completadas</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">
              <FiTarget />
              {evaluation ? evaluation.exerciseCompletionPercentage : 0}%
            </div>
            <div className="stat-label">Ejercicios Completados</div>
          </StatCard>
        </StatsGrid>

        {evaluation && (
          <EvaluationSection>
            {evaluation.overallAdherence >= 80 && (
              <div style={{ 
                marginBottom: '24px', 
                padding: '24px', 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)', 
                border: '2px solid rgba(255, 215, 0, 0.4)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  color: theme.colors.primaryDark, 
                  fontWeight: 800, 
                  fontSize: '22px' 
                }}>
                  ¡Excelente Trabajo!
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: theme.colors.textPrimary, 
                  fontWeight: 600, 
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}>
                  Has completado el mes con un <strong>{evaluation.overallAdherence}% de adherencia</strong>. 
                  Tu dedicación y compromiso están dando resultados. ¡Sigue así!
                </p>
              </div>
            )}
            
            {evaluation.successMessage && (
              <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(46, 139, 87, 0.1)', border: '1.5px solid rgba(46, 139, 87, 0.3)' }}>
                <p style={{ margin: 0, color: theme.colors.primaryDark, fontWeight: 600, fontSize: '15px' }}>
                  {evaluation.successMessage}
                </p>
              </div>
            )}
            
            {evaluation.aspectsToImprove && evaluation.aspectsToImprove.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <EvaluationTitle>
                  <FiAlertCircle />
                  Aspectos a Mejorar
                </EvaluationTitle>
                <EvaluationList>
                  {evaluation.aspectsToImprove.map((aspect: string, index: number) => (
                    <li key={index}>{aspect}</li>
                  ))}
                </EvaluationList>
              </div>
            )}
            
            {evaluation.recommendations && evaluation.recommendations.length > 0 && (
              <div>
                <EvaluationTitle>
                  <FiInfo />
                  Recomendaciones
                </EvaluationTitle>
                <EvaluationList>
                  {evaluation.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </EvaluationList>
              </div>
            )}
            
            {evaluation.needsMorePlans && evaluation.estimatedMonthsRemaining && (
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', border: '1.5px solid rgba(251, 191, 36, 0.3)' }}>
                <p style={{ margin: 0, color: theme.colors.primaryDark, fontWeight: 600, fontSize: '14px' }}>
                  📅 Estimación: Te quedan aproximadamente {evaluation.estimatedMonthsRemaining} mes{evaluation.estimatedMonthsRemaining > 1 ? 'es' : ''} para alcanzar tu objetivo. 
                  {evaluation.estimatedMonthsRemaining > 1 ? ' Continuaremos generando planes hasta que lo logres.' : ' ¡Estás muy cerca!'}
                </p>
              </div>
            )}
          </EvaluationSection>
        )}

        {isEvaluating && (
          <LoadingEvaluation>
            Generando evaluación personalizada con IA...
          </LoadingEvaluation>
        )}

        <FormSection>
          <label>
            <FiEdit3 style={{ marginRight: '6px', display: 'inline' }} />
            Peso Final (kg) - Opcional
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="Ej: 70.5"
            value={finalWeight}
            onChange={(e) => setFinalWeight(e.target.value)}
          />
        </FormSection>

        <FormSection>
          <label>
            <FiEdit3 style={{ marginRight: '6px', display: 'inline' }} />
            Notas sobre tu progreso - Opcional
          </label>
          <textarea
            placeholder="¿Cómo te sentiste? ¿Qué logros alcanzaste? ¿Qué cambiarías?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormSection>

        <ButtonGroup>
          <Button onClick={onClose}>
            Cerrar
          </Button>
          <Button primary onClick={handleSaveAndContinue}>
            Guardar y Crear Nuevo Plan
            <FiArrowRight />
          </Button>
        </ButtonGroup>
      </ResultsCard>
    </ResultsOverlay>
  );
};

export default MonthResults;

