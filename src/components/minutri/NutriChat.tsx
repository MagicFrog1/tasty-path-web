import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiSend, FiMessageCircle, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { theme } from '../../styles/theme';

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
      text: '¡Hola! Soy NutriChat, tu asistente virtual de nutrición. Puedo ayudarte con dudas sobre tu roadmap, plan de ejercicios, ingredientes o cualquier pregunta relacionada con tu objetivo. ¿En qué puedo ayudarte?',
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

    // Simular respuesta de IA (en producción sería una llamada a la API)
    setTimeout(() => {
      let response = '';
      
      if (userMessage.toLowerCase().includes('roadmap') || userMessage.toLowerCase().includes('módulo')) {
        response = 'Tu roadmap está diseñado con módulos de 30 días. Cada módulo tiene objetivos específicos y hitos que debes alcanzar. El módulo actual es el día ' + currentDay + ' de ' + totalDays + '. ¿Te gustaría saber más sobre algún aspecto específico del roadmap?';
      } else if (userMessage.toLowerCase().includes('ejercicio') || userMessage.toLowerCase().includes('entrenamiento')) {
        response = 'Tu plan de ejercicio está optimizado para tu objetivo. Te recomiendo seguir el programa semanal que se generó específicamente para este módulo. ¿Tienes alguna pregunta sobre ejercicios específicos o sobre cómo adaptar el plan?';
      } else if (userMessage.toLowerCase().includes('comida') || userMessage.toLowerCase().includes('alimento') || userMessage.toLowerCase().includes('ingrediente')) {
        response = 'Tu plan nutricional está vinculado a tu objetivo del módulo. Cada comida está diseñada para ayudarte a alcanzar tus metas. ¿Quieres saber más sobre algún ingrediente específico o sobre cómo preparar alguna receta?';
      } else if (userMessage.toLowerCase().includes('adherencia') || userMessage.toLowerCase().includes('progreso')) {
        response = 'Tu adherencia actual es del ' + adherence + '%. Para mejorar, te sugiero: 1) Planificar tus comidas con anticipación, 2) Establecer recordatorios, 3) Mantener un registro diario. ¿Quieres que te ayude a mejorar algún aspecto específico?';
      } else {
        response = 'Entiendo tu pregunta. Basándome en tu progreso actual (adherencia del ' + adherence + '%), te recomiendo mantener la consistencia en tus comidas y ejercicios. ¿Hay algo específico sobre tu plan que te gustaría aclarar?';
      }

      setMessages(prev => [...prev, { text: response, isUser: false }]);
      setIsTyping(false);
    }, 1000);
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
        <h4>NutriChat IA</h4>
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

