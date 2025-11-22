import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiSend, FiMessageCircle, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { theme } from '../../styles/theme';
import { AI_CONFIG, isAIConfigured } from '../../config/ai';
import { medicalKnowledgeService } from '../../services/MedicalKnowledgeService';
import { ENV_CONFIG } from '../../../env.config';
import { useUserProfile } from '../../context/UserProfileContext';
import { minutriService } from '../../services/minutriService';

// API Key específica para NutriChat
const NUTRICHAT_API_KEY = ENV_CONFIG.NUTRICHAT_API_KEY || AI_CONFIG.OPENAI_API_KEY;
const NUTRICHAT_BASE_URL = 'https://api.openai.com/v1/chat/completions';

// Debug: Verificar configuración de API Key
console.log('🔍 NutriChat - Debug de API Key:');
console.log('  - ENV_CONFIG.NUTRICHAT_API_KEY:', ENV_CONFIG.NUTRICHAT_API_KEY ? `${ENV_CONFIG.NUTRICHAT_API_KEY.substring(0, 10)}...` : 'NO CONFIGURADA');
console.log('  - AI_CONFIG.OPENAI_API_KEY:', AI_CONFIG.OPENAI_API_KEY ? `${AI_CONFIG.OPENAI_API_KEY.substring(0, 10)}...` : 'NO CONFIGURADA');
console.log('  - NUTRICHAT_API_KEY final:', NUTRICHAT_API_KEY ? `${NUTRICHAT_API_KEY.substring(0, 10)}...` : 'NO CONFIGURADA');
console.log('  - import.meta.env.VITE_NUTRICHAT_API_KEY:', typeof import.meta !== 'undefined' && import.meta.env?.VITE_NUTRICHAT_API_KEY ? `${import.meta.env.VITE_NUTRICHAT_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADA');
console.log('  - import.meta.env.NEXT_PUBLIC_NUTRICHAT_API_KEY:', typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_NUTRICHAT_API_KEY ? `${import.meta.env.NEXT_PUBLIC_NUTRICHAT_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADA');

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

const Message = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isUser',
})<{ isUser: boolean }>`
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
  const { profile } = useUserProfile();
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
      // Obtener información del roadmap para determinar objetivos
      const roadmap = minutriService.getRoadmap();
      const goals: string[] = [];
      if (roadmap) {
        if (roadmap.finalGoal === 'weight_loss') goals.push('weight_loss');
        else if (roadmap.finalGoal === 'weight_gain') goals.push('weight_gain');
        else if (roadmap.finalGoal === 'muscle_gain') goals.push('muscle_gain');
        else if (roadmap.finalGoal === 'maintenance') goals.push('maintenance');
      }

      // Obtener conocimiento médico relevante usando el perfil del usuario y la pregunta
      const medicalKnowledge = medicalKnowledgeService.generateComprehensiveMedicalPrompt({
        age: profile?.age || 30,
        gender: (profile?.gender as 'male' | 'female') || 'male',
        weight: profile?.weight || 70,
        height: profile?.height || 170,
        activityLevel: profile?.activityLevel || 'moderate',
        goals: goals.length > 0 ? goals : ['maintenance'],
        medicalConditions: (profile as any)?.medicalConditions || [],
      }, userMessage);

      // Construir historial de conversación para contexto
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
      }));

      // Generar respuesta con IA real para TODAS las preguntas usando la API key de NutriChat
      if (NUTRICHAT_API_KEY && NUTRICHAT_API_KEY.length > 0 && NUTRICHAT_API_KEY.startsWith('sk-')) {
        console.log('🤖 NutriChat: Enviando solicitud a OpenAI...');
        console.log('🔑 API Key presente:', !!NUTRICHAT_API_KEY);
        console.log('🔑 API Key válida (empieza con sk-):', NUTRICHAT_API_KEY.startsWith('sk-'));
        console.log('📝 Modelo:', AI_CONFIG.OPENAI_MODEL || 'gpt-4o-mini');
        console.log('💬 Mensaje del usuario:', userMessage);
        
        const systemPrompt = `Eres NutriChat, un asistente virtual especializado en alimentación, nutrición y ejercicio físico. Te comportas como un nutricionista profesional pero amigable y conversacional.

IMPORTANTE - DISCLAIMER MÉDICO:
- Debes SIEMPRE dejar claro que tus consejos son orientativos y NO sustituyen el consejo de un profesional de la salud.
- Si el usuario tiene condiciones médicas específicas, siempre recomienda consultar con un médico o nutricionista certificado.
- Nunca prescribas tratamientos médicos ni diagnósticos.

ÁMBITO DE CONOCIMIENTO - SE FLEXIBLE:
Puedes responder preguntas sobre:
- Nutrición y alimentación (macronutrientes, micronutrientes, suplementos, etc.)
- Subir o bajar de peso (estrategias, déficit/superávit calórico, etc.)
- Ganar o perder músculo (proteína, entrenamiento, timing nutricional, etc.)
- Platos y recetas (preparación, ingredientes, técnicas de cocción, etc.)
- Alérgenos e intolerancias (gluten, lactosa, frutos secos, alternativas, etc.)
- Consejos nutricionales generales y específicos
- Ejercicio físico y actividad física
- Ayuda sobre el uso de la plataforma TastyPath

SÉ FLEXIBLE: Si la pregunta está relacionada con nutrición, alimentación, ejercicio o salud en general, responde usando el conocimiento médico proporcionado. Solo rechaza preguntas completamente fuera de estos temas.

${medicalKnowledge}

CONTEXTO DEL USUARIO:
- Día actual del módulo: ${currentDay} de ${totalDays}
- Adherencia al plan: ${adherence}%

INSTRUCCIONES:
1. Comportarte como un nutricionista profesional pero amigable: sé conversacional, natural y empático.
2. Responde a saludos simples (hola, buenos días, etc.) de forma cálida y natural.
3. Para preguntas sobre nutrición/alimentación: usa el conocimiento médico proporcionado y da respuestas precisas, basadas en evidencia científica, pero siempre con un disclaimer de que no sustituye consejo profesional.
4. Para preguntas sobre subir/bajar peso: usa los protocolos médicos relevantes del conocimiento proporcionado.
5. Para preguntas sobre ganar/perder músculo: usa la información sobre ganancia de músculo y pérdida de músculo del conocimiento proporcionado.
6. Para preguntas sobre platos y recetas: usa la información sobre recetas y preparación de alimentos del conocimiento proporcionado.
7. Para preguntas sobre alérgenos: usa la información sobre alérgenos y alternativas del conocimiento proporcionado.
8. Para preguntas sobre ejercicio: proporciona consejos generales y seguros, siempre recomendando consultar con un entrenador si es necesario.
9. Para preguntas sobre la plataforma: ayuda al usuario a entender cómo usar las funciones de TastyPath.
10. Mantén un tono amigable, profesional y accesible.
11. Si no estás seguro de algo, admítelo amablemente y sugiere consultar con un profesional de la salud.
12. Responde de forma concisa pero completa, adaptándote al nivel de la pregunta (simple o compleja).
13. Usa emojis ocasionalmente para hacer la conversación más amigable (pero no excesivamente).
14. SIEMPRE incluye un recordatorio amigable de que tus consejos son orientativos cuando respondas preguntas de salud/nutrición.
15. USA SIEMPRE la información médica proporcionada cuando sea relevante para la pregunta del usuario.

Responde de forma natural y conversacional, como lo haría un nutricionista humano real.`;

        const response = await fetch(NUTRICHAT_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NUTRICHAT_API_KEY}`,
          },
          body: JSON.stringify({
            model: AI_CONFIG.OPENAI_MODEL || 'gpt-4o-mini',
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
          console.log('✅ NutriChat: Respuesta recibida de OpenAI');
          const aiResponse = data.choices[0]?.message?.content?.trim();
          
          if (aiResponse) {
            console.log('✅ NutriChat: Respuesta procesada correctamente');
            setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
            setIsTyping(false);
            return;
          } else {
            console.error('❌ NutriChat: Respuesta de IA vacía:', data);
            throw new Error('La respuesta de la IA está vacía');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ NutriChat: Error en respuesta de API:', response.status, errorData);
          console.error('❌ Detalles del error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          let errorMessage = 'Error al procesar tu solicitud.';
          if (response.status === 401) {
            errorMessage = 'Error de autenticación con la API. Por favor, verifica la configuración de la API key.';
          } else if (response.status === 429) {
            errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.';
          } else if (response.status === 500) {
            errorMessage = 'Error en el servidor de OpenAI. Por favor, intenta de nuevo en unos momentos.';
          } else if (errorData.error?.message) {
            errorMessage = `Error: ${errorData.error.message}`;
          }
          
          throw new Error(errorMessage);
        }
      } else {
        console.warn('⚠️ NutriChat: API Key no configurada o inválida');
        console.warn('  - NUTRICHAT_API_KEY presente:', !!NUTRICHAT_API_KEY);
        console.warn('  - NUTRICHAT_API_KEY longitud:', NUTRICHAT_API_KEY?.length || 0);
        console.warn('  - NUTRICHAT_API_KEY empieza con sk-:', NUTRICHAT_API_KEY?.startsWith('sk-') || false);
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
    } catch (error: any) {
      console.error('Error en NutriChat:', error);
      console.error('Detalles del error:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response
      });
      
      // Mensaje de error más informativo
      let errorMessage = 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo. 😊';
      
      if (error?.message?.includes('API')) {
        errorMessage = 'Parece que hay un problema con la conexión a la IA. Por favor, verifica tu conexión a internet e intenta de nuevo.';
      } else if (error?.message?.includes('401') || error?.message?.includes('autenticación')) {
        errorMessage = 'Error de autenticación con el servicio de IA. Por favor, contacta al soporte.';
      }
      
      setMessages(prev => [...prev, { 
        text: errorMessage, 
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

