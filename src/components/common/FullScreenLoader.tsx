import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const pulse = keyframes`
  0% { transform: translateY(0); opacity: 0.9; }
  50% { transform: translateY(-12px); opacity: 1; }
  100% { transform: translateY(0); opacity: 0.9; }
`;

const LoaderWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, rgba(46, 139, 87, 0.12), rgba(255, 255, 255, 0.95)),
    linear-gradient(180deg, rgba(75, 0, 130, 0.08), rgba(255, 255, 255, 0));
  padding: 40px;
`;

const LoaderCard = styled.div`
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28px;
  padding: 48px 56px;
  text-align: center;
  max-width: 460px;
  width: 100%;
  border: 1px solid rgba(46, 139, 87, 0.12);
  box-shadow: ${theme.shadows.lg};
  backdrop-filter: blur(16px);

  h2 {
    margin-top: 24px;
    font-size: 24px;
    color: ${theme.colors.primaryDark};
  }

  p {
    margin-top: 12px;
    font-size: 15px;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const DotContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
`;

const Dot = styled.span<{ index: number }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  opacity: 0.9;
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${({ index }) => index * 0.15}s;
  box-shadow: 0 8px 18px rgba(46, 139, 87, 0.25);
`;

export const FullScreenLoader: React.FC<{ message?: string; title?: string }> = ({
  message = 'Estamos preparando tu experiencia personalizada. Este proceso puede tardar unos segundos.',
  title = 'Cargando TastyPath',
}) => (
  <LoaderWrapper>
    <LoaderCard>
      <DotContainer>
        {[0, 1, 2, 3].map(index => (
          <Dot key={index} index={index} />
        ))}
      </DotContainer>
      <h2>{title}</h2>
      <p>{message}</p>
    </LoaderCard>
  </LoaderWrapper>
);




