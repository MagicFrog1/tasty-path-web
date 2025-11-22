import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiSend, FiMessageCircle, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { AI_CONFIG, isAIConfigured } from '../../config/ai';
import { medicalKnowledgeService } from '../../services/MedicalKnowledgeService';
import { ENV_CONFIG } from '../../../env.config';

const ChatContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 500px;
  max-height: 700px;
  height: 100%;
`;

const ChatHeader = styled.div`
  padding: 16px;
  border-bottom: 1.5px solid rgba(46, 139, 87, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
  }
`;

const MessagesContainer = styled.div`
  overflow-y: auto;
  padding: 20px;
  display: grid;
  gap: 16px;
  align-content: flex-start;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(46, 139, 87, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary};
    border-radius: 3px;
  }
`;

const Message = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  
  div {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    background: ${props => props.isUser 
      ? `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%)`
      : 'rgba(46, 139, 87, 0.08)'};
    color: ${props => props.isUser ? 'white' : theme.colors.textPrimary};
    border: ${props => props.isUser ? 'none' : '1px solid rgba(46, 139, 87, 0.2)'};
  }
`;

const ProactiveTip = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%);
  border: 1.5px solid rgba(251, 191, 36, 0.3);
  margin-bottom: 16px;
  
  h5 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  p {
    margin: 0;
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1.5px solid rgba(46, 139, 87, 0.1);
  display: flex;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(46, 139, 87, 0.2);
  border-radius: 12px;
  font-size: 14px;
  font-family: ${theme.fonts.body};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
  }
`;

const SendButton = styled.button`
  padding: 12px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

interface NutriChatProps {
  adherence: number;
  currentDay: number;
  totalDays: number;
}

const NutriChat: React.FC<NutriChatProps> = ({ adherence, currentDay, totalDays }) => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    {
      text: '¡Hola! Soy NutriChat, tu asistente virtual especializado en alimentación y nutrición. Puedo ayudarte con dudas sobre tu plan alimenticio, ingredientes, recetas, valores nutricionales y cualquier pregunta relacionada con nutrición. ¿En qué puedo ayudarte?',
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Consejería proactiva basada en adherencia
  useEffect(() => {
    if (adherence < 70 && messages.length === 1) {
      const tip = adherence < 50
        ? 'Tu adherencia es del ' + adherence + '%. Sugerencia: Planifica tus comidas del día siguiente antes de acostarte para mejorar la consistencia. También te recomiendo establecer recordatorios para tus comidas y ejercicios.'
        : 'Tu adherencia es del ' + adherence + '%. Estás en buen camino, pero podemos mejorar. Sugerencia: Enfócate en completar al menos 2 de las 3 comidas diarias y el ejercicio programado. Cada pequeño paso cuenta.';
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: tip,
          isUser: false
        }]);
      }, 2000);
    }
  }, [adherence, messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsTyping(true);

    try {
      // Verificar si la pregunta es sobre nutrición/alimentación
      const nutritionKeywords = [
        'nutrición', 'alimentación', 'comida', 'alimento', 'dieta', 'calorías', 'proteína', 'carbohidrato',
        'grasa', 'vitamina', 'mineral', 'fibra', 'receta', 'ingrediente', 'cocinar', 'preparar',
        'macronutriente', 'micronutriente', 'metabolismo', 'digestión', 'absorción', 'nutriente',
        'saludable', 'nutritivo', 'balanceado', 'plan alimenticio', 'menú', 'desayuno', 'almuerzo', 'cena'
      ];
      
      const isNutritionQuestion = nutritionKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );

      if (!isNutritionQuestion) {
        setMessages(prev => [...prev, { 
          text: 'Lo siento, pero solo puedo ayudarte con preguntas relacionadas con alimentación y nutrición. Soy NutriChat, tu asistente especializado en nutrición. ¿Tienes alguna pregunta sobre tu plan alimenticio, ingredientes, recetas o nutrición en general?', 
          isUser: false 
        }]);
        setIsTyping(false);
        return;
      }

      // Obtener conocimiento médico relevante
      const medicalKnowledge = medicalKnowledgeService.generateComprehensiveMedicalPrompt({
        allergies: [],
        dietaryPreferences: [],
        medicalConditions: [],
        weight: 70,
        height: 170,
        age: 30,
        gender: 'male',
        activityLevel: 'moderate',
      });

      // Generar respuesta con IA real
      if (isAIConfigured()) {
        const prompt = `Eres NutriChat, un asistente virtual especializado exclusivamente en alimentación y nutrición. Tu conocimiento está basado en fuentes médicas y científicas confiables.

${medicalKnowledge}

CONTEXTO DEL USUARIO:
- Día actual del módulo: ${currentDay} de ${totalDays}
- Adherencia al plan: ${adherence}%

INSTRUCCIONES CRÍTICAS:
1. SOLO responde preguntas relacionadas con alimentación, nutrición, dietas, ingredientes, recetas y temas relacionados.
2. Si la pregunta NO es sobre nutrición/alimentación, responde amablemente: "Lo siento, pero solo puedo ayudarte con preguntas relacionadas con alimentación y nutrición. Soy NutriChat, tu asistente especializado en nutrición. ¿Tienes alguna pregunta sobre tu plan alimenticio, ingredientes, recetas o nutrición en general?"
3. Usa el conocimiento médico proporcionado para dar respuestas precisas y basadas en evidencia.
4. Sé amable, profesional y claro en tus respuestas.
5. Si no estás seguro de algo, admítelo amablemente y sugiere consultar con un profesional de la salud.
6. Mantén las respuestas concisas pero informativas.

PREGUNTA DEL USUARIO: ${userMessage}

Responde SOLO con la respuesta a la pregunta, sin explicaciones adicionales ni formato markdown.`;

        const response = await fetch(AI_CONFIG.OPENAI_BASE_URL + '/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: AI_CONFIG.OPENAI_MODEL,
            messages: [
              {
                role: 'system',
                content: 'Eres NutriChat, un asistente virtual especializado exclusivamente en alimentación y nutrición. Responde de forma amable, profesional y basada en evidencia científica.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices[0]?.message?.content?.trim();
          
          if (aiResponse) {
            setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
            setIsTyping(false);
            return;
          }
        }
      }

      // Fallback: Respuesta básica si la IA no está disponible
      let response = '';
      
      if (userMessage.toLowerCase().includes('comida') || userMessage.toLowerCase().includes('alimento') || userMessage.toLowerCase().includes('ingrediente') || userMessage.toLowerCase().includes('receta')) {
        response = 'Tu plan nutricional está diseñado específicamente para ayudarte a alcanzar tus objetivos. Cada comida está balanceada con los macronutrientes necesarios. ¿Quieres saber más sobre algún ingrediente específico o sobre cómo preparar alguna receta?';
      } else if (userMessage.toLowerCase().includes('nutrición') || userMessage.toLowerCase().includes('dieta') || userMessage.toLowerCase().includes('calorías')) {
        response = 'La nutrición es fundamental para alcanzar tus objetivos. Tu plan está diseñado con las calorías y macronutrientes adecuados para tu meta. ¿Hay algún aspecto específico de la nutrición que te gustaría conocer mejor?';
      } else if (userMessage.toLowerCase().includes('adherencia') || userMessage.toLowerCase().includes('progreso')) {
        response = 'Tu adherencia actual es del ' + adherence + '%. Para mejorar, te sugiero: 1) Planificar tus comidas con anticipación, 2) Preparar ingredientes con antelación, 3) Seguir las recetas del plan. ¿Quieres que te ayude a mejorar algún aspecto específico de tu alimentación?';
      } else {
        response = 'Entiendo tu pregunta sobre nutrición. Basándome en tu progreso actual (adherencia del ' + adherence + '%), te recomiendo mantener la consistencia en tus comidas. ¿Hay algo específico sobre tu plan alimenticio que te gustaría aclarar?';
      }

      setMessages(prev => [...prev, { text: response, isUser: false }]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error en NutriChat:', error);
      setMessages(prev => [...prev, { 
        text: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo o reformula tu pregunta sobre nutrición.', 
        isUser: false 
      }]);
      setIsTyping(false);
    }
  };

  const proactiveTip = adherence < 70 ? (
    <ProactiveTip>
      <h5>
        <FiAlertCircle />
        Consejo Proactivo
      </h5>
      <p>
        {adherence < 50
          ? 'Tu adherencia es del ' + adherence + '%. Recomendamos enfocarte en el ejercicio de fuerza estas dos semanas para impulsar tu metabolismo. Consulta tu nuevo plan de ejercicios.'
          : 'Tu adherencia es del ' + adherence + '%. Estás progresando bien. Para mejorar aún más, intenta planificar tus comidas del día siguiente antes de acostarte.'}
      </p>
    </ProactiveTip>
  ) : null;

  return (
    <ChatContainer>
      <ChatHeader>
        <FiMessageCircle />
        <h4>NutriChat</h4>
      </ChatHeader>
      
      <MessagesContainer>
        {proactiveTip}
        {messages.map((msg, index) => (
          <Message key={index} isUser={msg.isUser}>
            <div>{msg.text}</div>
          </Message>
        ))}
        {isTyping && (
          <Message isUser={false}>
            <div>Escribiendo...</div>
          </Message>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe tu pregunta..."
        />
        <SendButton onClick={handleSend} disabled={!input.trim() || isTyping}>
          <FiSend />
          Enviar
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default NutriChat;

