import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useAuth } from '../context/AuthContext';
import {
  FiTarget,
  FiHeart,
  FiShield,
  FiShoppingBag,
  FiActivity,
  FiZap,
  FiClock,
  FiTrendingUp,
  FiSmile,
  FiFeather,
  FiBook,
  FiCoffee,
} from 'react-icons/fi';

// Animaciones profesionales y modernas
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.1;
  }
  50% {
    opacity: 0.15;
  }
  100% {
    transform: translate(50%, 50%) rotate(360deg);
    opacity: 0.1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
`;

const fadeInSlow = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 0.25;
  }
`;

// Elementos decorativos sutiles
const DecorativeElement = styled.div<{ top?: string; left?: string; right?: string; bottom?: string; delay?: number }>`
  position: fixed;
  ${({ top }) => top && `top: ${top};`}
  ${({ left }) => left && `left: ${left};`}
  ${({ right }) => right && `right: ${right};`}
  ${({ bottom }) => bottom && `bottom: ${bottom};`}
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  animation: ${fadeInSlow} 3s ease-out ${({ delay }) => delay || 0}s forwards, ${float} 10s ease-in-out ${({ delay }) => (delay || 0) + 3}s infinite;
  filter: blur(50px);
  transform: scale(1.3);
  will-change: transform, opacity;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NotebookIcon = styled(FiBook)`
  font-size: 160px;
  color: rgba(46, 139, 87, 0.04);
  transform: rotate(-12deg) perspective(1000px) rotateX(5deg);
  filter: drop-shadow(0 0 30px rgba(46, 139, 87, 0.08));
  opacity: 0.6;
`;

const PencilIcon = styled.div`
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, rgba(139, 69, 19, 0.08) 0%, rgba(160, 82, 45, 0.05) 50%, rgba(139, 69, 19, 0.03) 100%);
  border-radius: 2px;
  transform: rotate(22deg) perspective(1000px) rotateX(3deg);
  position: relative;
  filter: blur(1.5px);
  opacity: 0.5;
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    width: 8px;
    height: 8px;
    background: rgba(139, 69, 19, 0.1);
    border-radius: 50%;
    filter: blur(2px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    right: 0;
    width: 5px;
    height: 5px;
    background: rgba(184, 134, 11, 0.12);
    border-radius: 50%;
    filter: blur(1.5px);
  }
`;

const CoffeeIcon = styled(FiCoffee)`
  font-size: 140px;
  color: rgba(101, 67, 33, 0.04);
  transform: rotate(8deg) perspective(1000px) rotateX(4deg);
  filter: drop-shadow(0 0 25px rgba(101, 67, 33, 0.08));
  opacity: 0.6;
`;

const HerbIcon = styled(FiFeather)`
  font-size: 100px;
  color: rgba(46, 139, 87, 0.05);
  transform: rotate(-18deg) perspective(1000px) rotateX(3deg);
  filter: drop-shadow(0 0 25px rgba(46, 139, 87, 0.08));
  opacity: 0.55;
`;

const FruitCircle = styled.div<{ size?: string; color?: string }>`
  width: ${({ size }) => size || '70px'};
  height: ${({ size }) => size || '70px'};
  border-radius: 50%;
  background: ${({ color }) => color || 'rgba(255, 165, 0, 0.04)'};
  box-shadow: 0 0 80px ${({ color }) => color || 'rgba(255, 165, 0, 0.08)'};
  filter: blur(4px);
  opacity: 0.5;
  transform: perspective(1000px) rotateX(5deg);
  border: 1px solid ${({ color }) => color ? color.replace('0.04', '0.08') : 'rgba(255, 165, 0, 0.08)'};
`;

// Patrón de mármol elegante
const marblePattern = keyframes`
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
`;

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100vw;
  max-width: 100%;
  padding: 48px 0 120px;
  background: #ffffff;
  overflow-x: hidden;
`;

const Content = styled.main`
  width: min(1200px, calc(100% - 120px));
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  gap: 64px;
  position: relative;
  z-index: 1;
  padding: 0 60px;
  background: transparent;
  
  @media (max-width: 1024px) {
    width: min(100%, calc(100% - 80px));
    padding: 0 40px;
  }
  
  @media (max-width: 768px) {
    width: min(100%, calc(100% - 48px));
    padding: 0 24px;
    gap: 48px;
  }
  
  @media (max-width: 480px) {
    width: min(100%, calc(100% - 32px));
    padding: 0 16px;
    gap: 40px;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px) saturate(200%);
  border-bottom: 1px solid rgba(46, 139, 87, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.6s ease-out;
  border-radius: 0 0 16px 16px;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  font-size: 18px;
  color: #1b1f24;
  font-family: ${theme.fonts.heading};
  animation: ${slideInLeft} 0.8s ease-out;
`;

const Nav = styled.nav`
  display: flex;
  gap: 8px;
  align-items: center;
  animation: ${slideInRight} 0.8s ease-out;
  
  a {
    padding: 8px 16px;
    color: #4a5568;
    font-weight: 500;
    font-size: 15px;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: ${theme.colors.primary};
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(-50%);
    }
  }
  
  a:hover {
    color: ${theme.colors.primary};
    
    &::after {
      width: 60%;
    }
  }
`;

const NavButton = styled(Link)`
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid ${theme.colors.primary};
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  display: inline-block;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: ${theme.colors.primary};
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  &:hover {
    color: #ffffff;
    border-color: ${theme.colors.primary};
    background: rgba(46, 139, 87, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.4), 0 0 20px rgba(46, 139, 87, 0.2);
    
    &::before {
      width: 300px;
      height: 300px;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Hero = styled.section`
  position: relative;
  padding: 100px 0 120px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  display: grid;
  gap: 48px;
  border-bottom: 1px solid rgba(46, 139, 87, 0.08);
  animation: ${fadeInUp} 0.8s ease-out;
  border-radius: 0;
  transform: perspective(1000px);
  transform-style: preserve-3d;
`;

const HeroLayout = styled.div`
  display: grid;
  gap: 36px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  position: relative;
  z-index: 1;
`;

const HeroCopy = styled.div`
  display: grid;
  gap: 20px;
  animation: ${fadeInUp} 1s ease-out 0.2s both;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  line-height: 1.2;
  font-weight: 700;
  color: #1b1f24;
  font-family: ${theme.fonts.heading};
  letter-spacing: -0.02em;
  animation: ${fadeInUp} 1s ease-out 0.3s both;
  
  span {
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  margin: 0;
  color: #2d3748;
  font-size: 20px;
  line-height: 1.7;
  max-width: 680px;
  font-weight: 500;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
  letter-spacing: -0.01em;
`;

const HeroList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
  animation: ${fadeInUp} 1s ease-out 0.5s both;
`;

const HeroListItem = styled.li`
  display: flex;
  gap: 14px;
  align-items: center;
  font-weight: 500;
  color: #2d3748;
  font-size: 16px;
  line-height: 1.5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateX(8px);
    color: #1a202c;
  }
`;

const Bullet = styled.span`
  display: inline-flex;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${theme.colors.primary};
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${HeroListItem}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
  }
`;

const HeroPanel = styled.div`
  position: relative;
  padding: 32px;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  display: grid;
  gap: 20px;
  animation: ${scaleIn} 1s ease-out 0.6s both;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const HeroPanelHeading = styled.div`
  display: grid;
  gap: 8px;
  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #1b1f24;
  }
  span {
    font-size: 15px;
    color: #4a5568;
    font-weight: 400;
  }
`;

const PanelBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 20px;
  background: transparent;
  width: fit-content;
`;

const PanelLogo = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 20px;
  object-fit: contain;
  background: transparent;
  box-shadow: none;
  border: none;
`;

const PanelList = styled.ul`
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: grid;
  gap: 12px;
  color: #4a5568;
  font-size: 15px;
  line-height: 1.6;
  
  li {
    position: relative;
    padding-left: 24px;
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${theme.colors.primary};
      font-weight: 700;
      font-size: 18px;
    }
  }
`;

const Ctas = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const PrimaryCta = styled(Link)`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%);
  color: #ffffff;
  padding: 16px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(46, 139, 87, 0.25), 0 2px 8px rgba(46, 139, 87, 0.15);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(46, 139, 87, 0.35), 0 4px 12px rgba(46, 139, 87, 0.2);
    
    &::before {
      left: 100%;
    }
    
    svg {
      transform: translateX(5px);
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 18px;
  }
`;

const SecondaryCta = styled(Link)`
  background: #ffffff;
  color: ${theme.colors.primary};
  border: 1px solid #d1d5db;
  padding: 14px 28px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    border: 1px solid ${theme.colors.primary};
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.15);
    
    &::after {
      opacity: 1;
    }
    
    svg {
      transform: translateX(4px);
    }
  }
  
  svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;


const StatsRow = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const StatCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid rgba(46, 139, 87, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: grid;
  gap: 8px;
  align-items: start;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.8s ease-out both;
  
  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  &:nth-child(4) {
    animation-delay: 0.4s;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(46, 139, 87, 0.15);
    border-color: ${theme.colors.primary};
    background: #f8f9fa;
  }
  
  h4 {
    margin: 0;
    font-size: 13px;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }
  strong {
    font-size: 32px;
    font-weight: 700;
    font-family: ${theme.fonts.heading};
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const SectionAnchor = styled.section<{ id?: string }>`
  position: relative;
  display: grid;
  gap: 32px;
  padding: 64px 0;
  background: transparent;
  border-bottom: 1px solid rgba(46, 139, 87, 0.1);
  animation: ${fadeIn} 0.8s ease-out;
`;

const SectionTitle = styled.div`
  display: grid;
  gap: 12px;
  h2 {
    margin: 0;
    font-size: clamp(1.875rem, 3vw, 2.25rem);
    color: #1b1f24;
    font-weight: 700;
    font-family: ${theme.fonts.heading};
    letter-spacing: -0.02em;
  }
  span {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 6px 12px;
    border-radius: 4px;
    background: rgba(46, 139, 87, 0.1);
    color: ${theme.colors.primary};
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 12px;
    border: 1px solid rgba(46, 139, 87, 0.2);
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 28px;
  border: 1px solid rgba(46, 139, 87, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.8s ease-out both;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${theme.colors.primary};
    transform: scaleY(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    transform: translateY(-6px);
    border-color: ${theme.colors.primary};
    box-shadow: 0 12px 32px rgba(46, 139, 87, 0.15);
    background: #f8f9fa;
    
    &::before {
      transform: scaleY(1);
    }
  }
  
  p {
    color: #4a5568;
  }
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1b1f24;
  }
`;

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(46, 139, 87, 0.05) 100%);
  color: ${theme.colors.primary};
  font-size: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${Card}:hover & {
    transform: scale(1.1) rotate(5deg);
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
  }
`;

const PricingGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
`;

const PriceCard = styled(Card)<{ highlight?: boolean }>`
  border-width: ${({ highlight }) => (highlight ? '2px' : '1px')};
  border-color: ${({ highlight }) =>
    highlight ? theme.colors.primary : 'rgba(46, 139, 87, 0.1)'};
  &:hover {
    border-color: ${({ highlight }) => (highlight ? theme.colors.primary : theme.colors.primary)};
  }
`;

const Price = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #1b1f24;
  margin-bottom: 16px;
  font-family: ${theme.fonts.heading};
`;

const TestimonialsGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const TestimonialCard = styled(Card)`
  display: grid;
  gap: 20px;
  p {
    margin: 0;
    color: #4a5568;
    font-size: 15px;
    line-height: 1.6;
    font-style: italic;
  }
`;

const TestimonialFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  strong {
    display: block;
    color: #1b1f24;
    font-weight: 600;
    font-size: 15px;
  }
  span {
    color: #4a5568;
    font-size: 14px;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
`;

const FinalCta = styled.section`
  padding: 64px 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(46, 139, 87, 0.05) 100%);
  color: #1b1f24;
  display: grid;
  gap: 24px;
  border: 1px solid rgba(46, 139, 87, 0.2);
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 1s ease-out both;
  box-shadow: 0 4px 16px rgba(46, 139, 87, 0.1);
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  h2 {
    margin: 0;
    font-size: clamp(1.875rem, 3vw, 2.25rem);
    font-weight: 700;
    font-family: ${theme.fonts.heading};
    letter-spacing: -0.02em;
    color: #1b1f24;
  }
  p {
    margin: 0;
    color: #4a5568;
    font-size: 18px;
    line-height: 1.6;
    max-width: 680px;
  }
`;

const FooterNote = styled.p`
  margin: 0;
  color: #4a5568;
  font-size: 14px;
  text-align: center;
  padding-top: 48px;
`;

const ContactNote = styled.small`
  display: block;
  margin-top: 0;
  padding: 24px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid rgba(46, 139, 87, 0.1);
  color: #4a5568;
  font-size: 15px;
  line-height: 1.6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  a {
    color: ${theme.colors.primary};
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    &:hover {
      color: ${theme.colors.primaryLight};
      text-decoration: underline;
    }
  }
`;

const LandingPage: React.FC = () => {
  useScrollReveal();
  const { user } = useAuth();

  const heroList = [
    'IA nutricional entrenada con criterios médicos',
    'Menús adaptados a tus gustos y alergias',
    'Lista de compras automatizada en segundos',
  ];

  const stats = [
    { label: 'Menús generados', value: '25K+' },
    { label: 'Usuarios satisfechos', value: '8.9/10' },
    { label: 'Ingredientes en base', value: '1.200+' },
    { label: 'Fuentes médicas verificadas', value: '35' },
  ];

  const benefits = [
    {
      title: 'Personalización total',
      description: 'Objetivos, niveles de actividad, alergias y horarios ajustados a tu estilo de vida.',
      icon: <FiTarget />,
    },
    {
      title: 'Salud y bienestar',
      description: 'Recomendaciones respaldadas por fuentes médicas y equilibrio nutricional.',
      icon: <FiHeart />,
    },
    {
      title: 'Seguridad alimentaria',
      description: 'Control exhaustivo de alérgenos y requisitos específicos.',
      icon: <FiShield />,
    },
    {
      title: 'Compra organizada',
      description: 'Lista inteligente por categorías y cantidades exactas.',
      icon: <FiShoppingBag />,
    },
  ];

  const steps = [
    {
      title: '1. Cuestionario',
      description: 'Cuéntanos tus objetivos, alergias, preferencias dietéticas y ritmo de vida.',
      icon: <FiActivity />,
    },
    {
      title: '2. Generación IA',
      description: 'Creamos un plan semanal equilibrado con macros y recetas variadas.',
      icon: <FiZap />,
    },
    {
      title: '3. Lista de compras',
      description: 'Te damos una lista clara y agrupada para ir al supermercado sin olvidos.',
      icon: <FiClock />,
    },
  ];

  const pricing = [
    {
      name: 'Gratis',
      price: '0€',
      highlight: false,
      features: ['1 plan semanal', 'Lista de compras básica', 'Funciones esenciales'],
    },
    {
      name: 'Semanal',
      price: '3,49€',
      highlight: true,
      features: ['Planes ilimitados', 'Preferencias y alérgenos completos'],
    },
    {
      name: 'Mensual',
      price: '2,49€',
      highlight: false,
      features: ['Todo del Semanal', 'Analíticas avanzadas', 'Soporte prioritario'],
    },
    {
      name: 'Anual',
      price: '19,99€',
      highlight: false,
      features: ['Ahorras más', 'Actualizaciones exclusivas', 'Acceso early a nuevas funciones'],
    },
  ];

  const testimonials = [
    {
      quote: '“Con MyTastyPath planifico toda la semana en cuestión de minutos. La lista de la compra es lo que más valoro.”',
      name: 'Laura G.',
      role: 'Nutrióloga y mamá de 2',
    },
    {
      quote: '“La IA respeta mis alergias y objetivos deportivos. He logrado mantener mi peso y energía estables.”',
      name: 'Miguel A.',
      role: 'Entrenador personal',
    },
    {
      quote: '“Por fin un planificador que entiende mi estilo de vida vegano. El soporte es excelente.”',
      name: 'Sofía V.',
      role: 'Creadora de contenido',
    },
  ];

  return (
    <Page>
      {/* Elementos decorativos sutiles - Cuaderno y lápiz */}
      <DecorativeElement top="15%" left="5%" delay={0.5}>
        <NotebookIcon />
      </DecorativeElement>
      <DecorativeElement top="18%" left="8%" delay={0.7}>
        <PencilIcon />
      </DecorativeElement>

      {/* Taza de café elegante */}
      <DecorativeElement top="25%" right="8%" delay={1}>
        <CoffeeIcon />
      </DecorativeElement>

      {/* Hierbas frescas */}
      <DecorativeElement top="60%" left="3%" delay={1.2}>
        <HerbIcon />
      </DecorativeElement>
      <DecorativeElement top="65%" left="6%" delay={1.4}>
        <HerbIcon style={{ transform: 'rotate(15deg)', fontSize: '60px' }} />
      </DecorativeElement>

      {/* Frutas de colores - Naranja */}
      <DecorativeElement top="40%" right="5%" delay={1.6}>
        <FruitCircle size="80px" color="rgba(255, 165, 0, 0.04)" />
      </DecorativeElement>

      {/* Frutas de colores - Rojo (tomate/fresa) */}
      <DecorativeElement top="70%" right="12%" delay={1.8}>
        <FruitCircle size="70px" color="rgba(220, 20, 60, 0.03)" />
      </DecorativeElement>

      {/* Frutas de colores - Verde (lima/kiwi) */}
      <DecorativeElement top="50%" left="10%" delay={2}>
        <FruitCircle size="65px" color="rgba(50, 205, 50, 0.04)" />
      </DecorativeElement>

      {/* Hierba adicional en la parte inferior */}
      <DecorativeElement bottom="20%" right="4%" delay={2.2}>
        <HerbIcon style={{ transform: 'rotate(30deg)', fontSize: '70px' }} />
      </DecorativeElement>

      <Content>
        <Header>
          <Brand>MYTASTYPATH</Brand>
          <Nav>
            <a href="#beneficios">Beneficios</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#precios">Precios</a>
            <a href="#testimonios">Experiencias</a>
            <a href="#contacto">Contacto</a>
            <NavButton to={user ? "/dashboard" : "/auth"}>Entrar</NavButton>
          </Nav>
        </Header>

        <Hero data-reveal>
          <HeroLayout>
            <HeroCopy>
              <HeroTitle>Nutrición inteligente diseñada para ti</HeroTitle>
              <HeroSubtitle>
                Genera menús semanales personalizados con IA, obtén una lista de compras inteligente y
                recomendaciones fiables validadas por nuestro equipo nutricional.
              </HeroSubtitle>
              <HeroList>
                {heroList.map((item) => (
                  <HeroListItem key={item}>
                    <Bullet>
                      <FiFeather />
                    </Bullet>
                    {item}
                  </HeroListItem>
                ))}
              </HeroList>
              <Ctas>
                <PrimaryCta to={user ? "/dashboard" : "/auth"}>Empezar a usar</PrimaryCta>
              </Ctas>
            </HeroCopy>

            <HeroPanel>
              <PanelBadge>
                <PanelLogo src="/assets/logo-tastypath-preview.png" alt="Impacto real de TastyPath" />
              </PanelBadge>
              <HeroPanelHeading>
                <h3>Tu plan ideal, en minutos</h3>
                <span>Automatiza tu semana con IA</span>
              </HeroPanelHeading>
              <PanelList>
                <li>Analizamos tus datos metabólicos y objetivos.</li>
                <li>Recetas variadas con macros y tiempos de preparación.</li>
                <li>Lista de compras sin desperdicio.</li>
              </PanelList>
            </HeroPanel>
          </HeroLayout>
        </Hero>

        <StatsRow data-reveal>
          {stats.map((stat) => (
            <StatCard key={stat.label} data-reveal>
              <h4>{stat.label}</h4>
              <strong>{stat.value}</strong>
            </StatCard>
          ))}
        </StatsRow>

        <SectionAnchor id="beneficios" data-reveal>
          <SectionTitle>
            <span>Beneficios principales</span>
            <h2>¿Por qué MyTastyPath?</h2>
          </SectionTitle>
          <Grid>
            {benefits.map((item) => (
              <Card key={item.title} data-reveal>
                <CardHead>
                  <IconWrap>{item.icon}</IconWrap>
                  <h3>{item.title}</h3>
                </CardHead>
                <p>{item.description}</p>
              </Card>
            ))}
          </Grid>
        </SectionAnchor>

        <SectionAnchor id="como-funciona" data-reveal>
          <SectionTitle>
            <span>Proceso guiado</span>
            <h2>Cómo funciona</h2>
          </SectionTitle>
          <Grid>
            {steps.map((step) => (
              <Card key={step.title} data-reveal>
                <CardHead>
                  <IconWrap>{step.icon}</IconWrap>
                  <h3>{step.title}</h3>
                </CardHead>
                <p>{step.description}</p>
              </Card>
            ))}
          </Grid>
        </SectionAnchor>

        <SectionAnchor id="testimonios" data-reveal>
          <SectionTitle>
            <span>Historias reales</span>
            <h2>¿Qué dicen nuestros usuarios?</h2>
          </SectionTitle>
          <TestimonialsGrid>
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} data-reveal>
                <p>{testimonial.quote}</p>
                <TestimonialFooter>
                  <Avatar>{testimonial.name.slice(0, 1)}</Avatar>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </TestimonialFooter>
              </TestimonialCard>
            ))}
          </TestimonialsGrid>
        </SectionAnchor>

        <FinalCta data-reveal>
          <h2>Empieza hoy y transforma tu relación con la alimentación</h2>
          <p>
            Prueba el generador de planes, ajusta tus preferencias y deja que la IA haga el resto. MyTastyPath
            te acompaña en cada paso hacia una nutrición consciente.
          </p>
          <Ctas>
            <PrimaryCta to={user ? "/generador" : "/auth"}>Generar mi plan con IA</PrimaryCta>
            <SecondaryCta to={user ? "/dashboard" : "/auth"}>Ver dashboard</SecondaryCta>
          </Ctas>
        </FinalCta>

        <SectionAnchor id="contacto" data-reveal>
          <SectionTitle>
            <span>Estamos para ayudarte</span>
            <h2>Contacto</h2>
          </SectionTitle>
          <ContactNote>
            ¿Tienes dudas? Escríbenos a <a href="mailto:tastypathhelp@gmail.com">tastypathhelp@gmail.com</a>
          </ContactNote>
        </SectionAnchor>

        <FooterNote>
          © {new Date().getFullYear()} MyTastyPath. Nutrición inteligente impulsada por IA.
        </FooterNote>
      </Content>
    </Page>
  );
};

export default LandingPage;

