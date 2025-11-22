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
  height: 500px;
  max-height: 500px;
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
      text: '¡Hola! 👋 Soy NutriChat, tu asistente personal de nutrición. Estoy aquí para ayudarte con cualquier pregunta sobre alimentación, desde las más simples hasta las más complejas. ¿En qué puedo ayudarte hoy?',
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

      // Construir historial de conversación para contexto
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
      }));

      // Generar respuesta con IA real para TODAS las preguntas
      if (isAIConfigured()) {
        const systemPrompt = `Eres NutriChat, un asistente virtual especializado en alimentación y nutrición. Te comportas como un asistente humano real, amigable y conversacional.

${medicalKnowledge}

CONTEXTO DEL USUARIO:
- Día actual del módulo: ${currentDay} de ${totalDays}
- Adherencia al plan: ${adherence}%

INSTRUCCIONES IMPORTANTES:
1. Comportarte como un asistente humano real: sé amigable, conversacional y natural.
2. Responde a saludos simples (hola, buenos días, etc.) de forma cálida y natural.
3. Para preguntas sobre nutrición/alimentación: usa el conocimiento médico proporcionado y da respuestas precisas y basadas en evidencia.
4. Para preguntas que NO son sobre nutrición: responde amablemente explicando que solo puedes ayudar con temas de alimentación y nutrición, pero hazlo de forma conversacional y natural.
5. Mantén un tono amigable, profesional y accesible.
6. Si no estás seguro de algo, admítelo amablemente y sugiere consultar con un profesional de la salud.
7. Responde de forma concisa pero completa, adaptándote al nivel de la pregunta (simple o compleja).
8. Usa emojis ocasionalmente para hacer la conversación más amigable (pero no excesivamente).

Responde de forma natural y conversacional, como lo haría un asistente humano real.`;

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
                content: systemPrompt,
              },
              ...conversationHistory,
              {
                role: 'user',
                content: userMessage,
              },
            ],
            temperature: 0.8, // Más creativo para respuestas más naturales
            max_tokens: 600,
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

      // Fallback: Respuestas básicas más naturales si la IA no está disponible
      const lowerMessage = userMessage.toLowerCase();
      let response = '';
      
      // Saludos simples
      if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días') || lowerMessage.includes('buenas tardes') || lowerMessage.includes('buenas noches') || lowerMessage === 'hi' || lowerMessage === 'hello') {
        response = '¡Hola! 👋 Me alegra saludarte. ¿En qué puedo ayudarte con tu nutrición hoy?';
      } else if (lowerMessage.includes('gracias') || lowerMessage.includes('thanks')) {
        response = '¡De nada! 😊 Estoy aquí para ayudarte siempre que lo necesites. ¿Hay algo más sobre nutrición en lo que pueda asistirte?';
      } else if (lowerMessage.includes('adiós') || lowerMessage.includes('hasta luego') || lowerMessage.includes('bye')) {
        response = '¡Hasta luego! 👋 Recuerda que estoy aquí cuando necesites ayuda con tu nutrición. ¡Que tengas un excelente día!';
      } else if (lowerMessage.includes('cómo estás') || lowerMessage.includes('qué tal')) {
        response = '¡Muy bien, gracias por preguntar! 😊 Estoy aquí para ayudarte con todo lo relacionado con nutrición. ¿En qué puedo asistirte?';
      } else if (lowerMessage.includes('comida') || lowerMessage.includes('alimento') || lowerMessage.includes('ingrediente') || lowerMessage.includes('receta')) {
        response = 'Tu plan nutricional está diseñado específicamente para ayudarte a alcanzar tus objetivos. Cada comida está balanceada con los macronutrientes necesarios. ¿Quieres saber más sobre algún ingrediente específico o sobre cómo preparar alguna receta?';
      } else if (lowerMessage.includes('nutrición') || lowerMessage.includes('dieta') || lowerMessage.includes('calorías')) {
        response = 'La nutrición es fundamental para alcanzar tus objetivos. Tu plan está diseñado con las calorías y macronutrientes adecuados para tu meta. ¿Hay algún aspecto específico de la nutrición que te gustaría conocer mejor?';
      } else if (lowerMessage.includes('adherencia') || lowerMessage.includes('progreso')) {
        response = 'Tu adherencia actual es del ' + adherence + '%. Para mejorar, te sugiero: 1) Planificar tus comidas con anticipación, 2) Preparar ingredientes con antelación, 3) Seguir las recetas del plan. ¿Quieres que te ayude a mejorar algún aspecto específico de tu alimentación?';
      } else {
        // Respuesta genérica más amigable
        response = 'Entiendo tu pregunta. Aunque puedo ayudarte mejor con temas de nutrición y alimentación, estaré encantado de responder. ¿Podrías reformular tu pregunta relacionándola con nutrición, o tienes alguna duda específica sobre tu plan alimenticio?';
      }

      setMessages(prev => [...prev, { text: response, isUser: false }]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error en NutriChat:', error);
      setMessages(prev => [...prev, { 
        text: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo. 😊', 
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

