import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { theme } from '../../styles/theme';

const QuestionnaireContainer = styled.div`
  display: grid;
  gap: 24px;
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

const StepDescription = styled.p`
  margin: 0 0 24px 0;
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  font-size: 15px;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const CheckboxLabel = styled.label<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid ${props => props.checked ? theme.colors.primary : 'rgba(46, 139, 87, 0.2)'};
  background: ${props => props.checked ? 'rgba(46, 139, 87, 0.1)' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.checked ? 600 : 400};
  color: ${props => props.checked ? theme.colors.primaryDark : theme.colors.textPrimary};
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: ${props => props.checked ? 'rgba(46, 139, 87, 0.15)' : 'rgba(46, 139, 87, 0.05)'};
  }
  
  input[type="checkbox"] {
    display: none;
  }
  
  svg {
    color: ${props => props.checked ? theme.colors.primary : 'rgba(46, 139, 87, 0.4)'};
    font-size: 20px;
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

interface PreferencesQuestionnaireProps {
  onComplete: (data: {
    allergies: string[];
    dietaryPreferences: string[];
  }) => void;
}

const ALLERGIES = [
  'Gluten',
  'Lactosa',
  'Huevos',
  'Frutos secos',
  'Mariscos',
  'Soja',
  'Pescado',
  'Cacahuetes',
  'Sésamo',
  'Mostaza',
];

const DIETARY_PREFERENCES = [
  'Vegetariana',
  'Vegana',
  'Sin gluten',
  'Sin lactosa',
  'Baja en carbohidratos',
  'Alta en proteínas',
  'Mediterránea',
  'Baja en grasas',
];

const PreferencesQuestionnaire: React.FC<PreferencesQuestionnaireProps> = ({ onComplete }) => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const togglePreference = (preference: string) => {
    setDietaryPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleSubmit = () => {
    onComplete({
      allergies,
      dietaryPreferences,
    });
  };

  return (
    <QuestionnaireContainer>
      <StepCard>
        <StepTitle>
          <FiAlertCircle />
          Alergias e Intolerancias
        </StepTitle>
        <StepDescription>
          Selecciona todas las alergias e intolerancias que tengas. Esto ayudará a generar un plan seguro y personalizado.
        </StepDescription>
        <CheckboxGrid>
          {ALLERGIES.map(allergy => (
            <CheckboxLabel
              key={allergy}
              checked={allergies.includes(allergy)}
              onClick={() => toggleAllergy(allergy)}
            >
              <input
                type="checkbox"
                checked={allergies.includes(allergy)}
                onChange={() => toggleAllergy(allergy)}
              />
              {allergies.includes(allergy) ? <FiCheckCircle /> : <FiAlertCircle />}
              <span>{allergy}</span>
            </CheckboxLabel>
          ))}
        </CheckboxGrid>
      </StepCard>

      <StepCard>
        <StepTitle>
          <FiCheckCircle />
          Preferencias Dietéticas
        </StepTitle>
        <StepDescription>
          Selecciona tus preferencias alimentarias. Puedes seleccionar varias opciones.
        </StepDescription>
        <CheckboxGrid>
          {DIETARY_PREFERENCES.map(preference => (
            <CheckboxLabel
              key={preference}
              checked={dietaryPreferences.includes(preference)}
              onClick={() => togglePreference(preference)}
            >
              <input
                type="checkbox"
                checked={dietaryPreferences.includes(preference)}
                onChange={() => togglePreference(preference)}
              />
              {dietaryPreferences.includes(preference) ? <FiCheckCircle /> : <FiAlertCircle />}
              <span>{preference}</span>
            </CheckboxLabel>
          ))}
        </CheckboxGrid>
      </StepCard>

      <Button onClick={handleSubmit}>
        Continuar y Generar Plan
      </Button>
    </QuestionnaireContainer>
  );
};

export default PreferencesQuestionnaire;


