import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
  FiArrowLeft,
  FiCalendar,
  FiTarget,
  FiClock,
  FiCheckCircle,
  FiShoppingBag,
  FiTrendingUp,
  FiX,
  FiBook,
  FiCoffee,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiActivity,
} from 'react-icons/fi';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { theme } from '../styles/theme';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 2000px;
    transform: translateY(0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
`;

const PageWrapper = styled.div`
  display: grid;
  gap: 32px;
  padding: 0;

  @media (max-width: 1024px) {
    gap: 24px;
    padding: 0 16px;
  }

  @media (max-width: 768px) {
    gap: 20px;
    padding: 0 12px;
  }

  @media (max-width: 480px) {
    gap: 16px;
    padding: 0 8px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 10px 16px;
  border-radius: 16px;
  border: 1px solid rgba(46, 139, 87, 0.25);
  background: rgba(255, 255, 255, 0.9);
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(46, 139, 87, 0.16);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 13px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 12px;
    gap: 6px;
    width: 100%;
    justify-content: center;
  }

  svg {
    @media (max-width: 480px) {
      font-size: 16px;
    }
  }
`;

const Header = styled.div`
  display: grid;
  gap: 18px;

  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    color: ${theme.colors.textPrimary};
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: clamp(1.5rem, 5vw, 2rem);
    }

    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    max-width: 720px;
    line-height: 1.7;
    font-size: 16px;

    @media (max-width: 768px) {
      font-size: 15px;
      line-height: 1.6;
    }

    @media (max-width: 480px) {
      font-size: 14px;
      line-height: 1.5;
    }
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const SummaryCard = styled.div`
  display: grid;
  gap: 12px;
  padding: 24px;
  border-radius: 26px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(236, 253, 245, 0.9));
  border: 1px solid rgba(46, 139, 87, 0.16);
  box-shadow: 0 22px 52px rgba(46, 139, 87, 0.16);

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 16px;
    gap: 8px;
  }
`;

const SummaryLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(46, 139, 87, 0.85);

  svg {
    font-size: 18px;
  }
`;

const SummaryValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${theme.colors.primaryDark};

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const ProgressWrapper = styled.div`
  display: grid;
  gap: 6px;
`;

const ProgressBar = styled.div<{ percentage: number }>`
  position: relative;
  height: 12px;
  border-radius: 999px;
  background: rgba(46, 139, 87, 0.12);
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    width: ${({ percentage }) => `${percentage}%`};
    background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
    border-radius: 999px;
    transition: width 0.4s ease;
  }
`;

const WeekGrid = styled.div`
  display: grid;
  gap: 22px;
`;

const WeekHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h2 {
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.2rem);
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: clamp(1.5rem, 4vw, 1.8rem);
    }

    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    font-size: 16px;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 15px;
    }

    @media (max-width: 480px) {
      font-size: 14px;
      line-height: 1.5;
    }
  }
`;

const CalendarContainer = styled.div`
  display: grid;
  gap: 16px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(236, 253, 245, 0.9));
  border: 1px solid rgba(46, 139, 87, 0.16);
  box-shadow: 0 18px 45px rgba(46, 139, 87, 0.12);

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
    gap: 14px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 16px;
    gap: 12px;
  }
`;

const CalendarTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};

  svg {
    color: ${theme.colors.primary};
    font-size: 20px;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    gap: 8px;

    svg {
      font-size: 18px;
    }
  }

  @media (max-width: 480px) {
    font-size: 15px;
    gap: 6px;

    svg {
      font-size: 16px;
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const CalendarDay = styled.button<{ isCompleted: boolean; isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: 16px;
  border: 2px solid ${({ isCompleted, isExpanded }) =>
    isCompleted
      ? theme.colors.primary
      : isExpanded
      ? 'rgba(46, 139, 87, 0.4)'
      : 'rgba(46, 139, 87, 0.2)'};
  background: ${({ isCompleted, isExpanded }) =>
    isCompleted
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.95) 0%, rgba(46, 139, 87, 0.85) 100%)'
      : isExpanded
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.15) 0%, rgba(46, 139, 87, 0.08) 100%)'
      : 'rgba(255, 255, 255, 0.9)'};
  color: ${({ isCompleted }) => (isCompleted ? '#ffffff' : theme.colors.textPrimary)};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ isCompleted, isExpanded }) =>
    isCompleted
      ? '0 4px 12px rgba(46, 139, 87, 0.3)'
      : isExpanded
      ? '0 4px 12px rgba(46, 139, 87, 0.15)'
      : '0 2px 8px rgba(46, 139, 87, 0.08)'};
  position: relative;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 80px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ isCompleted }) =>
      isCompleted
        ? '0 6px 16px rgba(46, 139, 87, 0.4)'
        : '0 4px 12px rgba(46, 139, 87, 0.2)'};
    border-color: ${theme.colors.primary};
  }

  &:active {
    transform: translateY(-1px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ isCompleted }) =>
      isCompleted
        ? 'rgba(255, 255, 255, 0.3)'
        : 'linear-gradient(90deg, transparent, rgba(46, 139, 87, 0.3), transparent)'};
    opacity: ${({ isExpanded }) => (isExpanded ? 1 : 0)};
    transition: opacity 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 12px 8px;
    gap: 4px;
    min-height: 70px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 10px 6px;
    gap: 3px;
    min-height: 60px;
    border-radius: 10px;
    border-width: 1.5px;
  }
`;

const CalendarDayName = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 11px;
    letter-spacing: 0.06em;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    letter-spacing: 0.04em;
  }
`;

const CalendarDayNumber = styled.span`
  font-size: 20px;
  font-weight: 700;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const CalendarDayLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  opacity: 0.7;
  margin-top: 2px;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  @media (max-width: 480px) {
    font-size: 9px;
    display: none;
  }
`;

const CalendarDayBadge = styled.div<{ isCompleted: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ isCompleted }) =>
    isCompleted
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(46, 139, 87, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ isCompleted }) =>
    isCompleted ? '#ffffff' : theme.colors.primary};

  svg {
    font-size: 12px;
    color: ${({ isCompleted }) => (isCompleted ? '#ffffff' : theme.colors.primary)};
  }

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    top: 6px;
    right: 6px;
    border-width: 1.5px;

    svg {
      font-size: 10px;
    }
  }

  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
    top: 4px;
    right: 4px;
    border-width: 1.5px;

    svg {
      font-size: 9px;
    }
  }
`;

const DayGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const DayCard = styled.div<{ isChecked?: boolean; isExpanded?: boolean }>`
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 26px;
  background: ${({ isChecked }) => (isChecked ? 'rgba(46, 139, 87, 0.05)' : 'rgba(255, 255, 255, 0.94)')};
  border: ${({ isChecked }) => (isChecked ? '2px solid rgba(46, 139, 87, 0.4)' : '1px solid rgba(46, 139, 87, 0.16)')};
  box-shadow: ${({ isChecked, isExpanded }) =>
    isChecked
      ? '0 18px 45px rgba(46, 139, 87, 0.2)'
      : isExpanded
      ? '0 20px 50px rgba(46, 139, 87, 0.18)'
      : '0 18px 45px rgba(46, 139, 87, 0.12)'};
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 18px;
    border-radius: 20px;
    gap: 14px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 16px;
    gap: 12px;
  }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  h3 {
    margin: 0;
    font-size: 1.3rem;
    color: ${theme.colors.primaryDark};
    flex: 1;
    line-height: 1.3;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(46, 139, 87, 0.65);

    @media (max-width: 480px) {
      font-size: 11px;
      gap: 6px;
    }
  }

  button {
    @media (max-width: 480px) {
      padding: 6px 10px !important;
      font-size: 11px !important;
      gap: 4px !important;
    }
  }
`;

const DayToggleButton = styled.button<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid rgba(46, 139, 87, 0.2);
  background: ${({ isExpanded }) =>
    isExpanded
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(46, 139, 87, 0.05) 100%)'
      : 'rgba(255, 255, 255, 0.9)'};
  color: ${theme.colors.primaryDark};
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ isExpanded }) =>
    isExpanded ? '0 4px 12px rgba(46, 139, 87, 0.15)' : '0 2px 8px rgba(46, 139, 87, 0.08)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ isExpanded }) =>
      isExpanded ? '0 6px 16px rgba(46, 139, 87, 0.2)' : '0 4px 12px rgba(46, 139, 87, 0.12)'};
    border-color: ${theme.colors.primary};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 20px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${({ isExpanded }) => (isExpanded ? 'rotate(180deg)' : 'rotate(0deg)')};
    color: ${theme.colors.primary};
  }
`;

const DayContent = styled.div<{ isExpanded: boolean }>`
  display: grid;
  gap: 16px;
  max-height: ${({ isExpanded }) => (isExpanded ? '5000px' : '0')};
  overflow: hidden;
  opacity: ${({ isExpanded }) => (isExpanded ? 1 : 0)};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${({ isExpanded }) => (isExpanded ? slideDown : 'none')} 0.4s ease-out;

  @media (max-width: 768px) {
    gap: 14px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const CheckInButton = styled.button<{ isChecked: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 2px solid ${({ isChecked }) => (isChecked ? theme.colors.primary : 'rgba(46, 139, 87, 0.3)')};
  background: ${({ isChecked }) =>
    isChecked
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.95) 0%, rgba(46, 139, 87, 0.85) 100%)'
      : 'rgba(255, 255, 255, 0.9)'};
  color: ${({ isChecked }) => (isChecked ? '#ffffff' : theme.colors.primary)};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ isChecked }) =>
    isChecked ? '0 4px 12px rgba(46, 139, 87, 0.3)' : '0 2px 8px rgba(46, 139, 87, 0.1)'};
  margin-bottom: 12px;
  width: 100%;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ isChecked }) =>
      isChecked ? '0 6px 16px rgba(46, 139, 87, 0.4)' : '0 4px 12px rgba(46, 139, 87, 0.2)'};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 12px;
    min-height: 48px;
    gap: 6px;

    svg {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 11px;
    min-height: 44px;
    gap: 6px;

    svg {
      font-size: 13px;
    }
  }
`;

const CheckInStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.08);
  border: 1px solid rgba(46, 139, 87, 0.2);
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.primaryDark};

  svg {
    color: ${theme.colors.primary};
    font-size: 18px;
  }
`;

const MealList = styled.div`
  display: grid;
  gap: 14px;
`;

const MealItem = styled.div<{ isExpanded: boolean }>`
  display: grid;
  gap: 0;
  border-radius: 18px;
  background: rgba(236, 253, 245, 0.7);
  border: 1px solid rgba(46, 139, 87, 0.18);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ isExpanded }) =>
    isExpanded ? '0 4px 12px rgba(46, 139, 87, 0.15)' : '0 2px 6px rgba(46, 139, 87, 0.08)'};
`;

const MealToggleButton = styled.button<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px 18px;
  border: none;
  background: ${({ isExpanded }) =>
    isExpanded
      ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.15) 0%, rgba(46, 139, 87, 0.08) 100%)'
      : 'transparent'};
  color: ${theme.colors.textPrimary};
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;

  &:hover {
    background: ${({ isExpanded }) =>
      isExpanded
        ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.2) 0%, rgba(46, 139, 87, 0.12) 100%)'
        : 'rgba(46, 139, 87, 0.1)'};
  }

  &:active {
    background: ${({ isExpanded }) =>
      isExpanded
        ? 'linear-gradient(135deg, rgba(46, 139, 87, 0.25) 0%, rgba(46, 139, 87, 0.15) 100%)'
        : 'rgba(46, 139, 87, 0.15)'};
  }

  svg {
    font-size: 18px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${({ isExpanded }) => (isExpanded ? 'rotate(180deg)' : 'rotate(0deg)')};
    color: ${theme.colors.primary};
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
    gap: 10px;
    min-height: 48px;

    svg {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 13px;
    gap: 8px;
    min-height: 44px;

    svg {
      font-size: 15px;
    }
  }
`;

const MealContent = styled.div<{ isExpanded: boolean }>`
  display: grid;
  gap: 12px;
  padding: ${({ isExpanded }) => (isExpanded ? '16px 18px' : '0 18px')};
  max-height: ${({ isExpanded }) => (isExpanded ? '2000px' : '0')};
  overflow: hidden;
  opacity: ${({ isExpanded }) => (isExpanded ? 1 : 0)};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const MealTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};

  span {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(46, 139, 87, 0.7);
  }
`;

const MealTitleText = styled.span`
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  font-size: 15px;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const MealMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};

  @media (max-width: 768px) {
    gap: 8px 12px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    gap: 6px 10px;
    font-size: 10px;
  }
`;

const IngredientsList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: ${theme.colors.textSecondary};
  font-size: 13px;

  @media (max-width: 768px) {
    padding-left: 16px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding-left: 14px;
    font-size: 11px;
  }

  li {
    margin-bottom: 4px;
    line-height: 1.5;

    @media (max-width: 480px) {
      margin-bottom: 3px;
      line-height: 1.4;
    }
  }
`;

// Componentes para ejercicios en planes mensuales
const ExerciseSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.06) 0%, rgba(34, 197, 94, 0.04) 100%);
  border: 1px solid rgba(46, 139, 87, 0.15);
`;

const ExerciseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  h4 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  svg {
    color: ${theme.colors.primary};
    font-size: 20px;
  }
`;

const ExerciseTypeBadge = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${({ type }) => {
    if (type === 'cardio') return 'rgba(239, 68, 68, 0.1)';
    if (type === 'strength') return 'rgba(59, 130, 246, 0.1)';
    if (type === 'flexibility') return 'rgba(168, 85, 247, 0.1)';
    return 'rgba(46, 139, 87, 0.1)';
  }};
  color: ${({ type }) => {
    if (type === 'cardio') return '#dc2626';
    if (type === 'strength') return '#2563eb';
    if (type === 'flexibility') return '#9333ea';
    return theme.colors.primary;
  }};
  margin-left: auto;
`;

const ExerciseDescription = styled.p`
  margin: 0 0 16px 0;
  color: ${theme.colors.textPrimary};
  line-height: 1.7;
  font-size: 14px;
`;

const ExerciseMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${theme.colors.textSecondary};
    font-weight: 500;
    
    svg {
      color: ${theme.colors.primary};
      font-size: 16px;
    }
  }
`;

const ExerciseInstructions = styled.ol`
  margin: 0 0 16px 0;
  padding-left: 24px;
  color: ${theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.8;
  
  li {
    margin-bottom: 8px;
    padding-left: 8px;
  }
`;

const ExerciseEquipment = styled.div`
  margin-bottom: 16px;
  
  h5 {
    margin: 0 0 8px 0;
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  span {
    padding: 6px 12px;
    border-radius: 8px;
    background: ${theme.colors.white};
    border: 1px solid rgba(46, 139, 87, 0.2);
    font-size: 12px;
    font-weight: 500;
    color: ${theme.colors.textPrimary};
  }
`;

const ExerciseRecommendations = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.05);
  border-left: 3px solid ${theme.colors.primary};
  
  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.primaryDark};
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: ${theme.colors.textSecondary};
    font-size: 13px;
    line-height: 1.7;
    
    li {
      margin-bottom: 6px;
    }
  }
`;

const TipsSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.05);
  border-left: 3px solid rgba(251, 191, 36, 0.4);
  
  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.textPrimary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    color: ${theme.colors.textSecondary};
    font-size: 13px;
    line-height: 1.7;
    
    li {
      margin-bottom: 6px;
    }
  }
`;

const RecipeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-top: 12px;
  border-radius: 12px;
  border: 2px solid ${theme.colors.primary};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(46, 139, 87, 0.2);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  width: 100%;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(46, 139, 87, 0.3);
    background: linear-gradient(135deg, ${theme.colors.primaryLight} 0%, ${theme.colors.primary} 100%);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 13px;
    min-height: 48px;
    gap: 6px;

    svg {
      font-size: 15px;
    }
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 12px;
    min-height: 44px;
    gap: 6px;

    svg {
      font-size: 14px;
    }
  }
`;

const RecipeModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const RecipeModal = styled.div`
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  padding: 0;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.4s ease-out;
  display: grid;
  grid-template-rows: auto 1fr;

  @media (max-width: 768px) {
    max-width: 95vw;
    border-radius: 20px;
    max-height: 95vh;
  }

  @media (max-width: 480px) {
    max-width: 100vw;
    border-radius: 16px;
    max-height: 100vh;
    margin: 0;
  }
`;

const RecipeModalHeader = styled.div`
  padding: 32px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
  color: #ffffff;
  position: relative;

  h3 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.3;

    @media (max-width: 768px) {
      font-size: 20px;
      margin-bottom: 6px;
      padding-right: 40px;
    }

    @media (max-width: 480px) {
      font-size: 18px;
      margin-bottom: 4px;
      padding-right: 36px;
    }
  }

  p {
    margin: 0;
    opacity: 0.9;
    font-size: 15px;

    @media (max-width: 768px) {
      font-size: 14px;
    }

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }

  @media (max-width: 768px) {
    padding: 24px;
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-width: 44px;
  min-height: 44px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.4);
  }

  svg {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;

    svg {
      font-size: 18px;
    }
  }

  @media (max-width: 480px) {
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    padding: 8px;

    svg {
      font-size: 16px;
    }
  }
`;

const RecipeModalContent = styled.div`
  padding: 32px;
  overflow-y: auto;
  max-height: calc(90vh - 200px);

  @media (max-width: 768px) {
    padding: 24px;
    max-height: calc(95vh - 180px);
  }

  @media (max-width: 480px) {
    padding: 20px;
    max-height: calc(100vh - 160px);
  }
`;

const InstructionsSection = styled.div`
  margin-bottom: 32px;

  h4 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 700;
    color: ${theme.colors.textPrimary};

    svg {
      color: ${theme.colors.primary};
    }

    @media (max-width: 768px) {
      font-size: 18px;
      margin-bottom: 16px;
      gap: 8px;
    }

    @media (max-width: 480px) {
      font-size: 16px;
      margin-bottom: 14px;
      gap: 6px;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

const InstructionStep = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(46, 139, 87, 0.05);
  border-left: 4px solid ${theme.colors.primary};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(46, 139, 87, 0.08);
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    gap: 12px;
    padding: 16px;
    margin-bottom: 20px;
    border-left-width: 3px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    padding: 14px;
    margin-bottom: 16px;
    border-left-width: 3px;
    flex-direction: column;
  }
`;

const StepNumber = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
    align-self: flex-start;
  }
`;

const StepContent = styled.div`
  flex: 1;

  p {
    margin: 0;
    color: ${theme.colors.textPrimary};
    line-height: 1.7;
    font-size: 15px;

    @media (max-width: 768px) {
      font-size: 14px;
      line-height: 1.6;
    }

    @media (max-width: 480px) {
      font-size: 13px;
      line-height: 1.5;
    }
  }
`;

const IngredientsSection = styled.div`
  margin-bottom: 32px;

  h4 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 700;
    color: ${theme.colors.textPrimary};

    svg {
      color: ${theme.colors.primary};
    }

    @media (max-width: 768px) {
      font-size: 18px;
      margin-bottom: 16px;
      gap: 8px;
    }

    @media (max-width: 480px) {
      font-size: 16px;
      margin-bottom: 14px;
      gap: 6px;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

const IngredientsGrid = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
`;

const IngredientItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(46, 139, 87, 0.05);
  border: 1px solid rgba(46, 139, 87, 0.1);
  color: ${theme.colors.textPrimary};
  font-size: 14px;

  &::before {
    content: '✓';
    color: ${theme.colors.primary};
    font-weight: 700;
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    gap: 10px;
    font-size: 13px;

    &::before {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    gap: 8px;
    font-size: 12px;
    border-radius: 10px;

    &::before {
      font-size: 13px;
    }
  }
`;

const NoInstructions = styled.div`
  padding: 40px;
  text-align: center;
  color: ${theme.colors.textSecondary};
  border-radius: 16px;
  background: rgba(46, 139, 87, 0.05);

  p {
    margin: 0;
    font-size: 15px;
  }
`;

const NoPlan = styled.div`
  padding: 60px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px dashed rgba(46, 139, 87, 0.25);
  text-align: center;
  color: ${theme.colors.textSecondary};

  @media (max-width: 768px) {
    padding: 40px 20px;
    border-radius: 24px;
  }

  @media (max-width: 480px) {
    padding: 30px 16px;
    border-radius: 20px;
  }
`;

const EmptyStateContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px dashed rgba(46, 139, 87, 0.25);

  @media (max-width: 768px) {
    padding: 40px 20px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 30px 16px;
    border-radius: 16px;
  }

  svg {
    font-size: 48px;
    color: ${theme.colors.primary};
    margin-bottom: 16px;

    @media (max-width: 768px) {
      font-size: 40px;
      margin-bottom: 14px;
    }

    @media (max-width: 480px) {
      font-size: 36px;
      margin-bottom: 12px;
    }
  }

  h3 {
    margin: 0 0 12px 0;
    color: ${theme.colors.textPrimary};
    font-size: 20px;

    @media (max-width: 768px) {
      font-size: 18px;
      margin-bottom: 10px;
    }

    @media (max-width: 480px) {
      font-size: 16px;
      margin-bottom: 8px;
    }
  }

  p {
    margin: 0;
    color: ${theme.colors.textSecondary};
    font-size: 15px;
    padding: 0;

    @media (max-width: 768px) {
      font-size: 14px;
    }

    @media (max-width: 480px) {
      font-size: 13px;
      padding: 0 12px;
    }
  }
`;

const CloseDayButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(46, 139, 87, 0.2);
  background: rgba(255, 255, 255, 0.9);
  color: ${theme.colors.primary};
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;

  &:hover {
    background: rgba(46, 139, 87, 0.1);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    background: rgba(46, 139, 87, 0.15);
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 12px;
    gap: 6px;
    min-height: 48px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 11px;
    gap: 6px;
    min-height: 44px;
  }

  svg {
    font-size: 16px;

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }
`;

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  try {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const formatShortDate = (value?: string) => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const getDayName = (value?: string | Date) => {
  if (!value) return '';
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
    }).format(date);
  } catch {
    return '';
  }
};

const normalizedMeals = (plan: any) => {
  const raw = plan?.meals;
  if (!raw) return [];
  const days = Array.isArray(raw) ? raw : Object.values(raw);
  if (!Array.isArray(days)) return [];

  return days.map((day: any, index: number) => {
    const label = day?.day || day?.title || day?.date || `Día ${day?.dayNumber || index + 1}`;
    const desc = day?.summary || day?.description || null;
    const meals = day?.meals;

    const normalizedEntries = meals
      ? Array.isArray(meals)
        ? meals
            .filter(Boolean)
            .map((meal: any, mealIndex: number) => ({
              key: meal?.id || `${label}-meal-${mealIndex}`,
              type:
                meal?.type ||
                meal?.time ||
                meal?.category ||
                meal?.slot ||
                `Comida ${mealIndex + 1}`,
              name: meal?.name || meal?.title || meal?.dish || (meal?.type?.toLowerCase().includes('snack') ? 'Snack' : 'Receta personalizada'),
              description: meal?.description || meal?.notes || '',
              calories: meal?.calories || meal?.nutrition?.calories || meal?.kcal,
              macros: meal?.macros || meal?.nutrition,
              ingredients: meal?.ingredients || meal?.items || [],
              instructions: meal?.instructions || meal?.steps || meal?.preparation || [],
              prepTime: meal?.prepTime || meal?.preparationTime || 0,
              cookTime: meal?.cookTime || meal?.cookingTime || 0,
              difficulty: meal?.difficulty || 'fácil',
            }))
        : Object.entries(meals)
            .filter(([, value]) => Boolean(value))
            .map(([key, value]: [string, any], mealIndex) => ({
              key: value?.id || `${label}-meal-${mealIndex}`,
              type: key.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
              name: value?.name || value?.title || value?.dish || (key.toLowerCase().includes('snack') ? 'Snack' : 'Receta personalizada'),
              description: value?.description || value?.notes || '',
              calories: value?.calories || value?.nutrition?.calories || value?.kcal,
              macros: value?.macros || value?.nutrition,
              ingredients: value?.ingredients || value?.items || [],
              instructions: value?.instructions || value?.steps || value?.preparation || [],
              prepTime: value?.prepTime || value?.preparationTime || 0,
              cookTime: value?.cookTime || value?.cookingTime || 0,
              difficulty: value?.difficulty || 'fácil',
            }))
      : [];

    // Incluir ejercicio si existe
    const exercise = day?.exercise ? {
      name: day.exercise.name || 'Ejercicio del día',
      type: day.exercise.type || 'mixed',
      duration: day.exercise.duration || 45,
      description: day.exercise.description || '',
      instructions: Array.isArray(day.exercise.instructions) ? day.exercise.instructions : [],
      equipment: Array.isArray(day.exercise.equipment) ? day.exercise.equipment : [],
      recommendations: Array.isArray(day.exercise.recommendations) ? day.exercise.recommendations : [],
      location: day.exercise.location,
    } : null;

    return {
      key: day?.id || `day-${index}`,
      label,
      summary: desc,
      meals: normalizedEntries,
      exercise,
      tips: day?.tips ? (Array.isArray(day.tips) ? day.tips : []) : null,
    };
  });
};

const PlanDetailPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { getPlanById, updateWeeklyPlan } = useWeeklyPlan();
  const plan = planId ? getPlanById(planId) : undefined;
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedDays, setCheckedDays] = useState<Record<string, boolean>>({});
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const mealsByDay = useMemo(() => (plan ? normalizedMeals(plan) : []), [plan]);
  const hasExercises = plan?.config?.hasExercises || false;

  // Cargar check-ins guardados
  React.useEffect(() => {
    if (planId && mealsByDay.length > 0) {
      try {
        const saved = localStorage.getItem(`tastypath:checkins:${planId}`);
        if (saved) {
          const loadedCheckIns = JSON.parse(saved);
          setCheckedDays(loadedCheckIns);
          
          // Verificar si la semana ya estaba completada
          const allDaysChecked = mealsByDay.every(day => loadedCheckIns[day.key]);
          if (allDaysChecked && plan?.status !== 'completed') {
            updateWeeklyPlan(planId, {
              status: 'completed',
              completedAt: new Date().toISOString(),
            } as any);
          }
        }
      } catch (error) {
        console.error('Error loading check-ins:', error);
      }
    }
  }, [planId, mealsByDay, plan?.status, updateWeeklyPlan]);

  // Guardar check-ins
  const saveCheckIns = React.useCallback(
    (checkins: Record<string, boolean>) => {
      if (planId) {
        try {
          localStorage.setItem(`tastypath:checkins:${planId}`, JSON.stringify(checkins));
        } catch (error) {
          console.error('Error saving check-ins:', error);
        }
      }
    },
    [planId]
  );

  const handleCheckIn = (dayKey: string) => {
    const newCheckedDays = {
      ...checkedDays,
      [dayKey]: !checkedDays[dayKey],
    };
    setCheckedDays(newCheckedDays);
    saveCheckIns(newCheckedDays);

    // Verificar si la semana está completada
    const allDaysChecked = mealsByDay.every(day => newCheckedDays[day.key]);
    if (allDaysChecked && planId) {
      // Marcar la semana como completada en el plan
      updateWeeklyPlan(planId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      } as any);
    }
  };

  const checkedDaysCount = Object.values(checkedDays).filter(Boolean).length;
  const totalDays = mealsByDay.length;
  const isWeekCompleted = totalDays > 0 && checkedDaysCount === totalDays;

  const handleOpenRecipe = (meal: any) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  const toggleDay = (dayKey: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  const toggleMeal = (mealKey: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey],
    }));
  };

  const handleCalendarDayClick = (dayKey: string) => {
    // Si se hace clic en el mismo día, cerrarlo
    if (selectedDayKey === dayKey) {
      setSelectedDayKey(null);
      setExpandedDays(prev => ({
        ...prev,
        [dayKey]: false,
      }));
      return;
    }
    
    // Establecer el nuevo día seleccionado (esto automáticamente cierra el anterior)
    setSelectedDayKey(dayKey);
    // Expandir solo el día seleccionado
    setExpandedDays({ [dayKey]: true });
    // Scroll suave al día seleccionado
    setTimeout(() => {
      const element = document.querySelector(`[data-day-key="${dayKey}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Calcular fecha del día basándose en weekStart e índice
  const getDayDate = React.useCallback((index: number): { dayName: string; dayNumber: string; month: string; fullDate: Date | null } => {
    if (!plan?.weekStart) {
      return { dayName: '', dayNumber: '', month: '', fullDate: null };
    }
    try {
      const startDate = new Date(plan.weekStart);
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + index);
      
      const dayName = getDayName(dayDate);
      const dayNumber = dayDate.getDate().toString();
      const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(dayDate);
      
      return { dayName, dayNumber, month, fullDate: dayDate };
    } catch {
      return { dayName: '', dayNumber: '', month: '', fullDate: null };
    }
  }, [plan?.weekStart]);

  const formatInstructions = (instructions: any): string[] => {
    if (!instructions) return [];
    if (Array.isArray(instructions)) {
      return instructions.map((inst: any, index: number) => {
        if (typeof inst === 'string') return inst;
        if (inst?.instruction || inst?.step || inst?.text) {
          return inst.instruction || inst.step || inst.text;
        }
        return `Paso ${index + 1}`;
      });
    }
    if (typeof instructions === 'string') {
      return instructions.split('\n').filter((line: string) => line.trim());
    }
    return [];
  };

  if (!plan) {
    return (
      <NoPlan>
        <h3>No se encontró el plan</h3>
        <p>
          Parece que este plan ya no está disponible. Vuelve a{' '}
          <Link to="/planes">Mis Planes Semanales</Link> para revisar tus opciones actuales.
        </p>
      </NoPlan>
    );
  }

  return (
    <PageWrapper>
      <BackLink to="/planes">
        <FiArrowLeft />
        Volver a mis planes guardados
      </BackLink>

      <Header>
        <h1>{plan.name}</h1>
        <p>
          {plan.description ||
            (hasExercises
              ? 'Plan semanal con ejercicios personalizados adaptados a tu edad y objetivos para ayudarte a alcanzar tus metas más rápido.'
              : 'Consulta tu menú semanal: todas las comidas respetan tus alergias, preferencias y objetivos nutricionales.')}
        </p>
      </Header>

      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>
            <FiCalendar />
            Semana planificada
          </SummaryLabel>
          <SummaryValue>
            {formatDate(plan.weekStart)} · {formatDate(plan.weekEnd)}
          </SummaryValue>
        </SummaryCard>

        {hasExercises ? (
          <SummaryCard>
            <SummaryLabel>
              <FiActivity />
              Ejercicios personalizados
            </SummaryLabel>
            <SummaryValue>
              {mealsByDay.filter(day => day.exercise).length} ejercicios
            </SummaryValue>
            <MealMeta>
              <span>Adaptados a tu edad</span>
              <span>Según tu objetivo</span>
              <span>{plan.config?.goal || 'Personalizado'}</span>
            </MealMeta>
            <Link to="/mi-nutri-personal" style={{ marginTop: '12px', display: 'inline-block' }}>
              <RecipeButton style={{ width: '100%', justifyContent: 'center' }}>
                <FiActivity />
                Ver ejercicios
              </RecipeButton>
            </Link>
          </SummaryCard>
        ) : (
          <SummaryCard>
            <SummaryLabel>
              <FiTarget />
              Objetivo nutricional
            </SummaryLabel>
            <SummaryValue>{plan.config?.goal || 'Personalizado'}</SummaryValue>
          </SummaryCard>
        )}

        <SummaryCard>
          <SummaryLabel>
            <FiClock />
            Total estimado
          </SummaryLabel>
          <SummaryValue>
            {plan.estimatedCalories || plan.totalCalories} kcal / semana
          </SummaryValue>
          <span>
            {plan.totalMeals} comidas programadas
            {hasExercises && ' + ejercicios personalizados'}
          </span>
        </SummaryCard>

        <SummaryCard>
          <SummaryLabel>
            <FiCheckCircle />
            Progreso semanal
          </SummaryLabel>
          <SummaryValue>
            {checkedDaysCount} / {totalDays} días completados
          </SummaryValue>
          <ProgressWrapper>
            <ProgressBar percentage={totalDays > 0 ? (checkedDaysCount / totalDays) * 100 : 0} />
          </ProgressWrapper>
        </SummaryCard>
      </SummaryGrid>

      <WeekGrid>
        <WeekHeader>
          <h2>Planning semanal</h2>
          <p>Selecciona un día del calendario para ver sus comidas y recetas. Cada comida tiene su propio desplegable con información detallada.</p>
        </WeekHeader>

        <CalendarContainer>
          <CalendarTitle>
            <FiCalendar />
            Calendario semanal
          </CalendarTitle>
          <CalendarGrid>
            {mealsByDay.map((day, index) => {
              const isCompleted = checkedDays[day.key] || false;
              const isSelected = selectedDayKey === day.key;
              const dateInfo = getDayDate(index);
              const dayName = dateInfo.dayName || day.label.split(',')[0] || `Día ${index + 1}`;
              
              return (
                <CalendarDay
                  key={day.key}
                  isCompleted={isCompleted}
                  isExpanded={isSelected}
                  onClick={() => handleCalendarDayClick(day.key)}
                  title={isCompleted ? `${day.label} - Completado` : day.label}
                >
                  <CalendarDayBadge isCompleted={isCompleted}>
                    {isCompleted ? <FiCheck /> : <FiCalendar />}
                  </CalendarDayBadge>
                  <CalendarDayName>{dayName}</CalendarDayName>
                  <CalendarDayNumber>
                    {dateInfo.dayNumber || index + 1}
                  </CalendarDayNumber>
                  {dateInfo.month && (
                    <CalendarDayLabel>{dateInfo.month}</CalendarDayLabel>
                  )}
                </CalendarDay>
              );
            })}
          </CalendarGrid>
        </CalendarContainer>

        {selectedDayKey && (
          <DayGrid>
            {mealsByDay
              .filter(day => day.key === selectedDayKey)
              .map(day => {
                const isDayExpanded = true; // Siempre expandido cuando está seleccionado
                return (
                  <DayCard key={day.key} isChecked={checkedDays[day.key]} isExpanded={isDayExpanded} data-day-key={day.key}>
                    <CheckInButton
                      isChecked={checkedDays[day.key] || false}
                      onClick={() => handleCheckIn(day.key)}
                      title={checkedDays[day.key] ? 'Día completado' : 'Marcar día como completado'}
                    >
                      {checkedDays[day.key] ? (
                        <>
                          <FiCheck />
                          Día completado
                        </>
                      ) : (
                        <>
                          <FiCheckCircle />
                          Marcar día completado
                        </>
                      )}
                    </CheckInButton>

                    <DayHeader>
                      <h3>{day.label}</h3>
                      <CloseDayButton onClick={() => setSelectedDayKey(null)}>
                        <FiX />
                        Cerrar
                      </CloseDayButton>
                    </DayHeader>

                    <DayContent isExpanded={isDayExpanded}>
                      {day.summary && (
                        <p style={{ margin: 0, padding: '12px 16px', borderRadius: '12px', background: 'rgba(46, 139, 87, 0.05)', color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                          {day.summary}
                        </p>
                      )}

                      <MealList>
                        {day.meals.length === 0 && (
                          <MealItem isExpanded={true}>
                            <div style={{ padding: '16px 18px' }}>
                              <MealTitle>
                                <span>No hay recetas registradas</span>
                              </MealTitle>
                              <p style={{ margin: '8px 0 0 0', color: theme.colors.textSecondary, fontSize: '13px' }}>
                                Agrega detalles desde tu panel para completar este día.
                              </p>
                            </div>
                          </MealItem>
                        )}

                        {day.meals.map(meal => {
                          const isMealExpanded = expandedMeals[meal.key] || false;
                          return (
                            <MealItem key={meal.key} isExpanded={isMealExpanded}>
                              <MealToggleButton
                                isExpanded={isMealExpanded}
                                onClick={() => toggleMeal(meal.key)}
                                aria-expanded={isMealExpanded}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                                  <MealTitleText>{meal.name}</MealTitleText>
                                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(46, 139, 87, 0.7)', padding: '2px 8px', borderRadius: '6px', background: 'rgba(46, 139, 87, 0.1)' }}>
                                    {meal.type}
                                  </span>
                                </div>
                                {isMealExpanded ? <FiChevronUp /> : <FiChevronDown />}
                              </MealToggleButton>

                              <MealContent isExpanded={isMealExpanded}>
                                <MealMeta>
                                  {meal.calories && <span>{meal.calories} kcal</span>}
                                  {meal.macros?.protein && <span>Proteínas: {meal.macros.protein}g</span>}
                                  {meal.macros?.carbs && <span>Carbs: {meal.macros.carbs}g</span>}
                                  {meal.macros?.fat && <span>Grasas: {meal.macros.fat}g</span>}
                                </MealMeta>

                                {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
                                  <IngredientsList>
                                    {meal.ingredients.map((ingredient: any, index: number) => {
                                      const ingredientText =
                                        typeof ingredient === 'string'
                                          ? ingredient
                                          : ingredient?.name || ingredient?.item || ingredient?.ingredient || 'Ingrediente';
                                      return <li key={`${meal.key}-ingredient-${index}`}>{ingredientText}</li>;
                                    })}
                                  </IngredientsList>
                                )}

                                <RecipeButton onClick={() => handleOpenRecipe(meal)}>
                                  <FiCoffee />
                                  Ver preparado de receta
                                </RecipeButton>
                              </MealContent>
                            </MealItem>
                          );
                        })}
                      </MealList>

                      {/* Sección de ejercicios personalizados */}
                      {day.exercise && (
                        <ExerciseSection>
                          <ExerciseHeader>
                            <h4>
                              <FiActivity />
                              Ejercicio del Día
                            </h4>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {day.exercise.location && (
                                <span style={{ 
                                  padding: '4px 10px', 
                                  borderRadius: '6px', 
                                  background: 'rgba(46, 139, 87, 0.1)', 
                                  color: theme.colors.primary, 
                                  fontSize: '11px', 
                                  fontWeight: 600,
                                  textTransform: 'uppercase'
                                }}>
                                  {day.exercise.location === 'gym' ? '🏋️ Gimnasio' : 
                                   day.exercise.location === 'park' ? '🌳 Parque' : 
                                   '🏠 Casa'}
                                </span>
                              )}
                              <ExerciseTypeBadge type={day.exercise.type}>
                                {day.exercise.type === 'cardio' ? 'Cardio' : 
                                 day.exercise.type === 'strength' ? 'Fuerza' : 
                                 day.exercise.type === 'flexibility' ? 'Flexibilidad' : 'Mixto'}
                              </ExerciseTypeBadge>
                            </div>
                          </ExerciseHeader>
                          
                          <ExerciseDescription>
                            {day.exercise.description || day.exercise.name}
                          </ExerciseDescription>
                          
                          <ExerciseMeta>
                            <span>
                              <FiClock />
                              {day.exercise.duration} minutos
                            </span>
                            {day.exercise.type && (
                              <span>
                                <FiTarget />
                                {day.exercise.type === 'cardio' ? 'Cardiovascular' : 
                                 day.exercise.type === 'strength' ? 'Fuerza' : 
                                 day.exercise.type === 'flexibility' ? 'Flexibilidad' : 'Mixto'}
                              </span>
                            )}
                          </ExerciseMeta>
                          
                          {day.exercise.instructions && day.exercise.instructions.length > 0 && (
                            <div>
                              <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: theme.colors.primaryDark }}>
                                Instrucciones
                              </h5>
                              <ExerciseInstructions>
                                {day.exercise.instructions.map((instruction: string, idx: number) => (
                                  <li key={idx}>{instruction}</li>
                                ))}
                              </ExerciseInstructions>
                            </div>
                          )}
                          
                          {day.exercise.equipment && day.exercise.equipment.length > 0 && (
                            <ExerciseEquipment>
                              <h5>Equipo necesario</h5>
                              <div>
                                {day.exercise.equipment.map((item: string, idx: number) => (
                                  <span key={idx}>{item}</span>
                                ))}
                              </div>
                            </ExerciseEquipment>
                          )}
                          
                          {day.exercise.recommendations && day.exercise.recommendations.length > 0 && (
                            <ExerciseRecommendations>
                              <h5>
                                <FiCheckCircle />
                                Recomendaciones
                              </h5>
                              <ul>
                                {day.exercise.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </ExerciseRecommendations>
                          )}
                        </ExerciseSection>
                      )}

                      {/* Sección de tips */}
                      {day.tips && day.tips.length > 0 && (
                        <TipsSection>
                          <h5>
                            <FiTarget />
                            Consejos del Día
                          </h5>
                          <ul>
                            {day.tips.map((tip: string, idx: number) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </TipsSection>
                      )}
                    </DayContent>
                  </DayCard>
                );
              })}
          </DayGrid>
        )}
        
        {!selectedDayKey && (
          <EmptyStateContainer>
            <FiCalendar />
            <h3>Selecciona un día del calendario</h3>
            <p>Haz clic en cualquier día del calendario arriba para ver sus comidas y recetas</p>
          </EmptyStateContainer>
        )}
      </WeekGrid>

      <RecipeModalOverlay
        isOpen={isModalOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseModal();
          }
        }}
      >
        {selectedMeal && (
          <RecipeModal onClick={(e) => e.stopPropagation()}>
            <RecipeModalHeader>
              <CloseButton onClick={handleCloseModal} aria-label="Cerrar">
                <FiX />
              </CloseButton>
              <h3>{selectedMeal.name}</h3>
              <p>{selectedMeal.type}</p>
            </RecipeModalHeader>
            <RecipeModalContent>
              {/* Para snacks simples, mostrar información básica */}
              {selectedMeal.type?.toLowerCase().includes('snack') && (
                <div style={{ marginBottom: '32px', padding: '20px', borderRadius: '16px', background: 'rgba(46, 139, 87, 0.05)', borderLeft: '4px solid ' + theme.colors.primary }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: theme.colors.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiShoppingBag />
                    Snack
                  </h4>
                  <p style={{ margin: 0, color: theme.colors.textPrimary, lineHeight: '1.8', fontSize: '15px' }}>
                    {selectedMeal.name || 'Snack simple'}
                  </p>
                  {selectedMeal.description && (
                    <p style={{ margin: '12px 0 0 0', color: theme.colors.textSecondary, lineHeight: '1.6', fontSize: '14px' }}>
                      {selectedMeal.description}
                    </p>
                  )}
                </div>
              )}

              {/* Instrucciones paso a paso desde description si no hay instructions */}
              {!selectedMeal.type?.toLowerCase().includes('snack') && formatInstructions(selectedMeal.instructions).length === 0 && selectedMeal.description && (
                <div style={{ marginBottom: '32px', padding: '20px', borderRadius: '16px', background: 'rgba(46, 139, 87, 0.05)', borderLeft: '4px solid ' + theme.colors.primary }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: theme.colors.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBook />
                    Instrucciones de preparación
                  </h4>
                  <div style={{ marginTop: '12px' }}>
                    {selectedMeal.description.split(/(?=\d+\.)/).filter((step: string) => step.trim()).map((step: string, index: number) => {
                      const cleanedStep = step.trim().replace(/^\d+\.\s*/, '');
                      return cleanedStep ? (
                        <InstructionStep key={`desc-step-${index}`} style={{ marginBottom: '12px' }}>
                          <StepNumber>{index + 1}</StepNumber>
                          <StepContent>
                            <p>{cleanedStep}</p>
                          </StepContent>
                        </InstructionStep>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {Array.isArray(selectedMeal.ingredients) && selectedMeal.ingredients.length > 0 && (
                <IngredientsSection>
                  <h4>
                    <FiShoppingBag />
                    Ingredientes
                  </h4>
                  <IngredientsGrid>
                    {selectedMeal.ingredients.map((ingredient: any, index: number) => {
                      const ingredientText =
                        typeof ingredient === 'string'
                          ? ingredient
                          : ingredient?.name || ingredient?.item || ingredient?.ingredient || 'Ingrediente';
                      return <IngredientItem key={`ingredient-${index}`}>{ingredientText}</IngredientItem>;
                    })}
                  </IngredientsGrid>
                </IngredientsSection>
              )}

              {!selectedMeal.type?.toLowerCase().includes('snack') && (
                <InstructionsSection>
                  <h4>
                    <FiBook />
                    Instrucciones de preparación
                  </h4>
                  {formatInstructions(selectedMeal.instructions).length > 0 ? (
                    formatInstructions(selectedMeal.instructions).map((instruction, index) => (
                      <InstructionStep key={`step-${index}`}>
                        <StepNumber>{index + 1}</StepNumber>
                        <StepContent>
                          <p>{instruction}</p>
                        </StepContent>
                      </InstructionStep>
                    ))
                  ) : (
                    <NoInstructions>
                      <p>
                        No hay instrucciones de preparación disponibles para esta receta. Las instrucciones se generarán
                        automáticamente cuando se cree el plan.
                      </p>
                    </NoInstructions>
                  )}
                </InstructionsSection>
              )}
            </RecipeModalContent>
          </RecipeModal>
        )}
      </RecipeModalOverlay>
    </PageWrapper>
  );
};

export default PlanDetailPage;
