import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiCheckCircle, FiClock, FiTarget, FiTrendingUp, FiLock } from 'react-icons/fi';
import { theme } from '../../styles/theme';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const RoadmapContainer = styled.div`
  display: grid;
  gap: 32px;
  position: relative;
  padding: 60px 20px;
  min-height: 400px;
`;

const RoadPath = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
`;

const ModulesContainer = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  padding: 40px 0;
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const ModulePin = styled.div<{ isActive: boolean; isCompleted: boolean; isLocked: boolean; color: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: ${props => props.isLocked ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.isLocked ? 0.5 : 1};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.isLocked ? 'none' : 'translateY(-4px)'};
  }
`;

const PinIcon = styled.div<{ isActive: boolean; isCompleted: boolean; isLocked: boolean; color: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.isLocked) return 'rgba(0, 0, 0, 0.15)';
    if (props.isActive) return `linear-gradient(135deg, ${props.color} 0%, ${props.color}dd 100%)`;
    if (props.isCompleted) return props.color;
    return 'rgba(0, 0, 0, 0.1)';
  }};
  border: 4px solid white;
  box-shadow: ${props => props.isActive 
    ? `0 8px 24px ${props.color}40, 0 4px 12px ${props.color}20`
    : '0 4px 12px rgba(0, 0, 0, 0.15)'};
  position: relative;
  z-index: 2;
  animation: ${props => props.isActive ? pulse : 'none'} 2s ease-in-out infinite;
  
  svg {
    color: white;
    font-size: 24px;
    font-weight: bold;
  }
  
  span {
    color: white;
    font-size: 20px;
    font-weight: 700;
  }
`;

const ModuleCard = styled.div<{ isActive: boolean; isCompleted: boolean; isLocked: boolean }>`
  position: relative;
  padding: 20px;
  border-radius: 16px;
  background: ${props => {
    if (props.isLocked) return 'rgba(255, 255, 255, 0.4)';
    if (props.isActive) {
      return 'linear-gradient(135deg, rgba(46, 139, 87, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)';
    }
    if (props.isCompleted) {
      return 'linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(34, 197, 94, 0.08) 100%)';
    }
    return 'rgba(255, 255, 255, 0.8)';
  }};
  border: 2px solid ${props => {
    if (props.isLocked) return 'rgba(0, 0, 0, 0.1)';
    if (props.isActive) return 'rgba(46, 139, 87, 0.4)';
    if (props.isCompleted) return 'rgba(46, 139, 87, 0.3)';
    return 'rgba(46, 139, 87, 0.2)';
  }};
  box-shadow: ${props => props.isActive ? theme.shadows.md : theme.shadows.sm};
  transition: all 0.3s ease;
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  
  &:hover {
    transform: ${props => props.isLocked ? 'none' : 'translateY(-4px)'};
    box-shadow: ${props => props.isActive ? theme.shadows.lg : theme.shadows.md};
  }
`;

const ModuleTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
`;

const ModuleStatus = styled.span<{ isActive: boolean; isCompleted: boolean; isLocked: boolean }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    if (props.isLocked) return 'rgba(0, 0, 0, 0.05)';
    if (props.isActive) return 'rgba(46, 139, 87, 0.15)';
    if (props.isCompleted) return 'rgba(46, 139, 87, 0.1)';
    return 'rgba(0, 0, 0, 0.05)';
  }};
  color: ${props => {
    if (props.isLocked) return theme.colors.textSecondary;
    if (props.isActive) return theme.colors.primary;
    if (props.isCompleted) return theme.colors.primaryDark;
    return theme.colors.textSecondary;
  }};
  margin-bottom: 12px;
`;

const ModuleInfo = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  
  svg {
    color: ${theme.colors.primary};
    flex-shrink: 0;
    font-size: 14px;
  }
`;

const Milestone = styled.div`
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.08);
  border-left: 3px solid ${theme.colors.primary};
  
  strong {
    color: ${theme.colors.primaryDark};
    font-weight: 600;
    font-size: 13px;
    display: block;
    margin-bottom: 4px;
  }
  
  p {
    margin: 0;
    font-size: 12px;
    color: ${theme.colors.textSecondary};
    line-height: 1.4;
  }
`;

const PinColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

interface Module {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  milestone: string;
  isActive: boolean;
  isCompleted: boolean;
  isLocked?: boolean;
  progress: number;
  adherence?: number;
  targetAdherence?: number;
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

  // Generar path SVG dinámico basado en número de módulos
  const generatePath = () => {
    const numModules = modules.length;
    const points: Array<{ x: number; y: number }> = [];
    const stepX = 100 / (numModules + 1);
    
    for (let i = 0; i <= numModules; i++) {
      const x = 10 + (i * stepX);
      const y = 50 + (i % 2 === 0 ? 0 : 20); // Alternar altura
      points.push({ x, y });
    }
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      path += ` Q ${midX} ${prev.y}, ${midX} ${(prev.y + curr.y) / 2} T ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

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

      <RoadPath viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={generatePath()}
          fill="none"
          stroke="rgba(46, 139, 87, 0.2)"
          strokeWidth="1"
          strokeDasharray="2, 2"
        />
        <path
          d={generatePath()}
          fill="none"
          stroke={theme.colors.primary}
          strokeWidth="0.8"
          strokeDasharray="2, 2"
        />
      </RoadPath>

      <ModulesContainer>
        {modules.map((module, index) => {
          const isLocked = module.isLocked !== undefined ? module.isLocked : (!module.isActive && !module.isCompleted);
          const color = PinColors[index % PinColors.length];
          
          return (
            <ModulePin
              key={module.id}
              isActive={module.isActive}
              isCompleted={module.isCompleted}
              isLocked={isLocked}
              color={color}
            >
              <PinIcon
                isActive={module.isActive}
                isCompleted={module.isCompleted}
                isLocked={isLocked}
                color={color}
              >
                {isLocked ? (
                  <FiLock />
                ) : module.isCompleted ? (
                  <FiCheckCircle />
                ) : module.isActive ? (
                  <FiClock />
                ) : (
                  <span>{module.id}</span>
                )}
              </PinIcon>
              
              <ModuleCard
                isActive={module.isActive}
                isCompleted={module.isCompleted}
                isLocked={isLocked}
              >
                <div>
                  <ModuleTitle>{module.title}</ModuleTitle>
                  <ModuleStatus
                    isActive={module.isActive}
                    isCompleted={module.isCompleted}
                    isLocked={isLocked}
                  >
                    {isLocked ? 'Bloqueado' : module.isCompleted ? 'Completado' : 'En Progreso'}
                  </ModuleStatus>
                </div>

                <ModuleInfo>
                  <InfoItem>
                    <FiClock />
                    <span>{module.startDate}</span>
                  </InfoItem>
                  {module.isActive && (
                    <>
                      <InfoItem>
                        <FiTrendingUp />
                        <span>{module.progress}%</span>
                      </InfoItem>
                      {module.adherence !== undefined && (
                        <InfoItem>
                          <span>Adherencia: {module.adherence}%</span>
                        </InfoItem>
                      )}
                    </>
                  )}
                  {module.isCompleted && module.adherence !== undefined && (
                    <InfoItem>
                      <FiCheckCircle />
                      <span>Adherencia: {module.adherence}%</span>
                    </InfoItem>
                  )}
                </ModuleInfo>

                <Milestone>
                  <strong>Hito:</strong>
                  <p>{module.milestone}</p>
                  {isLocked && module.targetAdherence !== undefined && (
                    <p style={{ marginTop: '8px', fontSize: '11px', fontStyle: 'italic' }}>
                      Completa el módulo anterior con {module.targetAdherence}% de adherencia para desbloquear
                    </p>
                  )}
                </Milestone>
              </ModuleCard>
            </ModulePin>
          );
        })}
      </ModulesContainer>
    </RoadmapContainer>
  );
};

export default RoadmapView;
