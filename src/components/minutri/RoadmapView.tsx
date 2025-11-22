import React from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiClock, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { theme } from '../../styles/theme';

const RoadmapContainer = styled.div`
  display: grid;
  gap: 24px;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 40px;
  
  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.3) 100%);
    border-radius: 2px;
  }
`;

const ModuleCard = styled.div<{ isActive: boolean; isCompleted: boolean; isLocked: boolean }>`
  position: relative;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  background: ${props => {
    if (props.isLocked) {
      return 'rgba(0, 0, 0, 0.02)';
    }
    if (props.isActive) {
      return 'linear-gradient(135deg, rgba(46, 139, 87, 0.12) 0%, rgba(34, 197, 94, 0.08) 100%)';
    }
    if (props.isCompleted) {
      return 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)';
    }
    return 'rgba(255, 255, 255, 0.6)';
  }};
  border: 1.5px solid ${props => {
    if (props.isLocked) return 'rgba(0, 0, 0, 0.1)';
    if (props.isActive) return 'rgba(46, 139, 87, 0.3)';
    if (props.isCompleted) return 'rgba(46, 139, 87, 0.2)';
    return 'rgba(46, 139, 87, 0.1)';
  }};
  box-shadow: ${props => props.isActive ? theme.shadows.md : 'none'};
  transition: all 0.3s ease;
  opacity: ${props => props.isLocked ? 0.5 : 1};
  cursor: ${props => props.isLocked ? 'not-allowed' : 'default'};
  
  &:hover {
    ${props => !props.isLocked && `
      transform: translateX(4px);
      box-shadow: ${theme.shadows.sm};
    `}
  }
`;

const ModuleDot = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  position: absolute;
  left: -32px;
  top: 28px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.isActive) {
      return `linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%)`;
    }
    if (props.isCompleted) {
      return theme.colors.primary;
    }
    return 'rgba(46, 139, 87, 0.2)';
  }};
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(46, 139, 87, 0.2);
  z-index: 1;
  
  svg {
    color: white;
    font-size: 16px;
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ModuleTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModuleStatus = styled.span<{ isActive: boolean; isCompleted: boolean }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    if (props.isActive) return 'rgba(46, 139, 87, 0.15)';
    if (props.isCompleted) return 'rgba(46, 139, 87, 0.1)';
    return 'rgba(0, 0, 0, 0.05)';
  }};
  color: ${props => {
    if (props.isActive) return theme.colors.primary;
    if (props.isCompleted) return theme.colors.primaryDark;
    return theme.colors.textSecondary;
  }};
`;

const ModuleInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  
  svg {
    color: ${theme.colors.primary};
    flex-shrink: 0;
  }
`;

const Milestone = styled.div`
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.05);
  border-left: 3px solid ${theme.colors.primary};
  
  strong {
    color: ${theme.colors.primaryDark};
    font-weight: 600;
  }
`;

interface Module {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  milestone: string;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
  adherence: number;
  targetAdherence: number;
}

interface RoadmapViewProps {
  modules: Module[];
  currentValue: number;
  targetValue: number;
  timeframe: number;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ modules, currentValue, targetValue, timeframe }) => {
  const totalDifference = Math.abs(targetValue - currentValue);
  const progressPerModule = totalDifference / modules.length;

  return (
    <RoadmapContainer>
      <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%)', border: '1.5px solid rgba(46, 139, 87, 0.2)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: theme.colors.primaryDark, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiTarget />
          Objetivo General
        </h3>
        <p style={{ margin: '0', color: theme.colors.textSecondary, lineHeight: '1.6' }}>
          De <strong>{currentValue}kg</strong> a <strong>{targetValue}kg</strong> en <strong>{timeframe} meses</strong>
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: theme.colors.textSecondary }}>
          {modules.length} módulos de 30 días • Progreso estimado: {progressPerModule.toFixed(1)}kg por módulo
        </p>
      </div>

      <Timeline>
        {modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            isActive={module.isActive}
            isCompleted={module.isCompleted}
            isLocked={module.isLocked}
          >
            <ModuleDot isActive={module.isActive} isCompleted={module.isCompleted}>
              {module.isCompleted ? <FiCheckCircle /> : module.isActive ? <FiClock /> : module.isLocked ? <FiTarget /> : <FiTarget />}
            </ModuleDot>
            
            <ModuleHeader>
              <ModuleTitle>
                {module.title}
                {module.isLocked && (
                  <span style={{ fontSize: '14px', color: theme.colors.textSecondary, fontWeight: 400 }}>
                    {' '}(Bloqueado - Completa el módulo anterior)
                  </span>
                )}
              </ModuleTitle>
              <ModuleStatus isActive={module.isActive} isCompleted={module.isCompleted}>
                {module.isLocked ? '🔒 Bloqueado' : module.isCompleted ? '✅ Completado' : module.isActive ? '🔄 En Progreso' : '⏳ Pendiente'}
              </ModuleStatus>
            </ModuleHeader>

            <ModuleInfo>
              <InfoItem>
                <FiClock />
                {module.startDate} - {module.endDate}
              </InfoItem>
              {module.isActive && (
                <>
                  <InfoItem>
                    <FiTrendingUp />
                    {module.progress}% completado
                  </InfoItem>
                  <InfoItem>
                    <FiTrendingUp />
                    Adherencia: {module.adherence}% / {module.targetAdherence}%
                  </InfoItem>
                </>
              )}
              {module.isCompleted && (
                <InfoItem>
                  <FiCheckCircle />
                  Adherencia final: {module.adherence}%
                </InfoItem>
              )}
            </ModuleInfo>

            <Milestone>
              <strong>Hito del Módulo:</strong> {module.milestone}
              {module.isLocked && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: theme.colors.textSecondary }}>
                  Este módulo se desbloqueará cuando completes el módulo anterior con al menos {module.targetAdherence}% de adherencia.
                </div>
              )}
            </Milestone>
          </ModuleCard>
        ))}
      </Timeline>
    </RoadmapContainer>
  );
};

export default RoadmapView;

