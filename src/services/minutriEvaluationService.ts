import { ENV_CONFIG } from '../../env.config';
import { AI_CONFIG } from '../config/ai';

export interface MonthEvaluation {
  mealCompletionPercentage: number;
  exerciseCompletionPercentage: number;
  overallAdherence: number;
  aspectsToImprove: string[];
  recommendations: string[];
  successMessage?: string;
  needsMorePlans: boolean;
  estimatedMonthsRemaining?: number;
}

export interface EvaluationRequest {
  adherence: number;
  completedDays: number;
  totalDays: number;
  completedMeals: number;
  totalMeals: number;
  completedExercises: number;
  totalExercises: number;
  initialWeight: number;
  currentWeight?: number;
  targetWeight: number;
  goal: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance';
  timeframe: number; // meses totales
  currentMonth: number; // mes actual
  notes?: string;
}

const minutriEvaluationService = {
  async evaluateMonth(request: EvaluationRequest): Promise<MonthEvaluation> {
    const mealCompletionPercentage = Math.round((request.completedMeals / request.totalMeals) * 100);
    const exerciseCompletionPercentage = Math.round((request.completedExercises / request.totalExercises) * 100);
    const overallAdherence = request.adherence;

    // Verificar si se alcanzó el objetivo
    const weightDifference = request.currentWeight 
      ? Math.abs(request.currentWeight - request.targetWeight)
      : Math.abs(request.initialWeight - request.targetWeight);
    
    const progressPerMonth = Math.abs(request.targetWeight - request.initialWeight) / request.timeframe;
    const expectedWeight = request.goal === 'weight_loss'
      ? request.initialWeight - (progressPerMonth * request.currentMonth)
      : request.initialWeight + (progressPerMonth * request.currentMonth);
    
    const actualProgress = request.currentWeight 
      ? Math.abs(request.currentWeight - request.initialWeight)
      : 0;
    const expectedProgress = Math.abs(expectedWeight - request.initialWeight);
    
    const needsMorePlans = weightDifference > 0.5; // Si falta más de 0.5kg para el objetivo
    const estimatedMonthsRemaining = needsMorePlans && request.currentWeight
      ? Math.ceil(weightDifference / (Math.abs(request.currentWeight - request.initialWeight) / request.currentMonth))
      : undefined;

    // Generar evaluación con IA si está configurada
    if (AI_CONFIG.ENABLED && ENV_CONFIG.OPENAI_API_KEY) {
      try {
        const evaluation = await this.generateAIEvaluation(request, {
          mealCompletionPercentage,
          exerciseCompletionPercentage,
          overallAdherence,
          needsMorePlans,
          estimatedMonthsRemaining,
        });
        return evaluation;
      } catch (error) {
        console.error('Error generando evaluación con IA:', error);
        // Continuar con evaluación local
      }
    }

    // Evaluación local (fallback)
    return this.generateLocalEvaluation(request, {
      mealCompletionPercentage,
      exerciseCompletionPercentage,
      overallAdherence,
      needsMorePlans,
      estimatedMonthsRemaining,
    });
  },

  async generateAIEvaluation(
    request: EvaluationRequest,
    stats: {
      mealCompletionPercentage: number;
      exerciseCompletionPercentage: number;
      overallAdherence: number;
      needsMorePlans: boolean;
      estimatedMonthsRemaining?: number;
    }
  ): Promise<MonthEvaluation> {
    const prompt = `Eres un nutricionista experto. Evalúa el progreso del mes de un usuario y proporciona:

1. Aspectos a mejorar (máximo 3-5 puntos específicos y accionables)
2. Recomendaciones personalizadas (máximo 5 recomendaciones concretas)
3. Mensaje de éxito motivacional si la adherencia es alta (más del 80%)

Datos del usuario:
- Adherencia: ${stats.overallAdherence}%
- Comidas completadas: ${stats.mealCompletionPercentage}%
- Ejercicios completados: ${stats.exerciseCompletionPercentage}%
- Días completados: ${request.completedDays}/${request.totalDays}
- Objetivo: ${request.goal === 'weight_loss' ? 'Pérdida de peso' : request.goal === 'weight_gain' ? 'Ganancia de peso' : request.goal === 'muscle_gain' ? 'Ganancia de músculo' : 'Mantenimiento'}
- Peso inicial: ${request.initialWeight}kg
- Peso actual: ${request.currentWeight || 'No registrado'}kg
- Peso objetivo: ${request.targetWeight}kg
- Mes actual: ${request.currentMonth} de ${request.timeframe}
${request.notes ? `- Notas del usuario: ${request.notes}` : ''}

Responde ÚNICAMENTE con JSON válido en este formato:
{
  "aspectsToImprove": ["aspecto1", "aspecto2", ...],
  "recommendations": ["recomendación1", "recomendación2", ...],
  "successMessage": "mensaje motivacional si aplica o null"
}`;

    try {
      const response = await fetch(ENV_CONFIG.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ENV_CONFIG.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: ENV_CONFIG.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un nutricionista experto. Responde ÚNICAMENTE con JSON válido, sin texto adicional.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No se recibió contenido de la IA');
      }

      // Limpiar respuesta
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const evaluation = JSON.parse(cleanContent);

      return {
        mealCompletionPercentage: stats.mealCompletionPercentage,
        exerciseCompletionPercentage: stats.exerciseCompletionPercentage,
        overallAdherence: stats.overallAdherence,
        aspectsToImprove: evaluation.aspectsToImprove || [],
        recommendations: evaluation.recommendations || [],
        successMessage: evaluation.successMessage || undefined,
        needsMorePlans: stats.needsMorePlans,
        estimatedMonthsRemaining: stats.estimatedMonthsRemaining,
      };
    } catch (error) {
      console.error('Error en evaluación con IA:', error);
      throw error;
    }
  },

  generateLocalEvaluation(
    request: EvaluationRequest,
    stats: {
      mealCompletionPercentage: number;
      exerciseCompletionPercentage: number;
      overallAdherence: number;
      needsMorePlans: boolean;
      estimatedMonthsRemaining?: number;
    }
  ): MonthEvaluation {
    const aspectsToImprove: string[] = [];
    const recommendations: string[] = [];

    if (stats.mealCompletionPercentage < 80) {
      aspectsToImprove.push('Cumplimiento de comidas');
      recommendations.push('Intenta planificar tus comidas con anticipación y prepara snacks saludables para evitar saltarte comidas.');
    }

    if (stats.exerciseCompletionPercentage < 70) {
      aspectsToImprove.push('Consistencia en ejercicios');
      recommendations.push('Establece una rutina de ejercicio fija en tu horario diario, incluso si es solo 15-20 minutos.');
    }

    if (stats.overallAdherence < 75) {
      aspectsToImprove.push('Adherencia general al plan');
      recommendations.push('Revisa tu plan diariamente y marca tus logros para mantener la motivación.');
    }

    if (stats.mealCompletionPercentage >= 90 && stats.exerciseCompletionPercentage >= 80) {
      recommendations.push('¡Excelente trabajo! Mantén este ritmo para alcanzar tus objetivos más rápido.');
    }

    let successMessage: string | undefined;
    if (stats.overallAdherence >= 85) {
      successMessage = `¡Felicitaciones! Has completado el ${stats.overallAdherence}% del mes con excelente adherencia. Sigue así para alcanzar tu objetivo.`;
    }

    return {
      mealCompletionPercentage: stats.mealCompletionPercentage,
      exerciseCompletionPercentage: stats.exerciseCompletionPercentage,
      overallAdherence: stats.overallAdherence,
      aspectsToImprove: aspectsToImprove.length > 0 ? aspectsToImprove : ['Mantén la consistencia actual'],
      recommendations: recommendations.length > 0 ? recommendations : ['Continúa siguiendo tu plan'],
      successMessage,
      needsMorePlans: stats.needsMorePlans,
      estimatedMonthsRemaining: stats.estimatedMonthsRemaining,
    };
  },
};

export default minutriEvaluationService;


