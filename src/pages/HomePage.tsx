import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiClock, FiShield, FiSun, FiTrendingUp, FiX, FiZap, FiTarget, FiShoppingBag } from 'react-icons/fi';
import { theme } from '../styles/theme';

// Animaciones profesionales Vision Pro
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

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const glow = keyframes`
  0%, 100% {
    opacity: 0.6;
    filter: blur(20px);
  }
  50% {
    opacity: 0.8;
    filter: blur(25px);
  }
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  min-height: 100vh;
  background: #ffffff;
  width: 100%;
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

const InfoBannerOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px) saturate(180%);
  z-index: 1000;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    padding: 16px;
    backdrop-filter: blur(6px) saturate(180%);
  }
`;

const InfoBanner = styled.div`
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 32px 80px rgba(0, 0, 0, 0.25),
    0 16px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(46, 139, 87, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: ${fadeInUp} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(46, 139, 87, 0.12);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 50%, ${theme.colors.primary} 100%);
    border-radius: 24px 24px 0 0;
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 20px;
    max-height: 85vh;
  }
`;

const BannerContent = styled.div`
  display: grid;
  gap: 32px;
  width: 100%;
  
  @media (min-width: 768px) {
    gap: 40px;
  }
`;

const BannerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding-right: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding-right: 0;
  }
`;

const BannerTitleSection = styled.div`
  display: grid;
  gap: 12px;
  flex: 1;
`;

const BannerTitle = styled.h2`
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #0a0e13;
  font-family: ${theme.fonts.heading};
  letter-spacing: -0.03em;
  line-height: 1.2;
  background: linear-gradient(135deg, #0a0e13 0%, #1b1f24 50%, ${theme.colors.primary} 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
`;

const BannerQuestion = styled.p`
  margin: 0;
  font-size: 17px;
  color: #2d3748;
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: -0.01em;
  
  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  
  &:hover {
    background: linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(46, 139, 87, 0.15) 100%);
    border-color: rgba(46, 139, 87, 0.2);
    color: ${theme.colors.primary};
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.2);
  }
  
  &:active {
    transform: scale(0.95) rotate(90deg);
  }
  
  svg {
    font-size: 22px;
    transition: transform 0.3s ease;
  }
`;

const BannerFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const BannerFeature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
  border-radius: 16px;
  border: 1px solid rgba(46, 139, 87, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
    transform: scaleY(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    background: linear-gradient(135deg, #ffffff 0%, rgba(248, 249, 250, 0.95) 100%);
    border-color: ${theme.colors.primary};
    transform: translateY(-4px);
    box-shadow: 
      0 12px 32px rgba(46, 139, 87, 0.15),
      0 4px 16px rgba(46, 139, 87, 0.1);
    
    &::before {
      transform: scaleY(1);
    }
  }
`;

const BannerFeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.12) 0%, rgba(46, 139, 87, 0.08) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
  flex-shrink: 0;
  border: 1px solid rgba(46, 139, 87, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(46, 139, 87, 0.1);
  
  ${BannerFeature}:hover & {
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
    color: #ffffff;
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 8px 20px rgba(46, 139, 87, 0.25);
    border-color: ${theme.colors.primaryLight};
  }
  
  svg {
    font-size: 24px;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  ${BannerFeature}:hover & svg {
    transform: scale(1.1);
  }
`;

const BannerFeatureText = styled.div`
  display: grid;
  gap: 6px;
  flex: 1;
  padding-top: 2px;
  
  h4 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #0a0e13;
    line-height: 1.4;
    letter-spacing: -0.01em;
    transition: color 0.3s ease;
    
    ${BannerFeature}:hover & {
      color: ${theme.colors.primary};
    }
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #4a5568;
    line-height: 1.6;
    font-weight: 400;
  }
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 0;
  padding: 80px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: none;
  box-shadow: none;
  color: #1b1f24;
  animation: ${fadeInUp} 1s ease-out;
  width: 100%;

  @media (min-width: 768px) {
    padding: 100px 0;
  }

  @media (min-width: 1024px) {
    padding: 120px 0;
  }

  > * {
    position: relative;
    z-index: 1;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;

    @media (min-width: 768px) {
      padding: 0 48px;
    }

    @media (min-width: 1024px) {
      padding: 0 64px;
    }
  }
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 48px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const HeroContent = styled.div`
  display: grid;
  gap: 24px;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(46, 139, 87, 0.05) 100%);
  border: 1px solid rgba(46, 139, 87, 0.2);
  font-weight: 600;
  letter-spacing: 0.08em;
  font-size: 11px;
  text-transform: uppercase;
  color: ${theme.colors.primary};
  animation: ${fadeInUp} 1s ease-out 0.2s both;
  box-shadow: 0 2px 8px rgba(46, 139, 87, 0.1);

  svg {
    font-size: 16px;
    color: ${theme.colors.primary};
  }
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-family: ${theme.fonts.heading};
  font-weight: 800;
  font-size: clamp(2.4rem, 4.5vw, 3.6rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
  animation: ${fadeInUp} 1s ease-out 0.3s both;
  color: #1b1f24;

  span {
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 50%, #3CB371 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
  }
`;

const HeroText = styled.p`
  margin: 0;
  font-size: 19px;
  line-height: 1.75;
  color: #4a5568;
  max-width: 720px;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
  font-weight: 400;
  letter-spacing: 0.01em;
`;

const HeroBenefits = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
  animation: ${fadeInUp} 0.8s ease-out 0.5s both;

  li {
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 500;
    color: #2d3748;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      color: #1a202c;
      transform: translateX(4px);
    }

    svg {
      flex-shrink: 0;
      font-size: 18px;
      color: ${theme.colors.primary};
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &:hover svg {
      transform: scale(1.1);
    }
  }
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
`;

const PrimaryCta = styled(Link)`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%);
  color: #ffffff;
  padding: 16px 32px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 
    0 8px 24px rgba(46, 139, 87, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 14px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s;
  }

  svg {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 12px 32px rgba(46, 139, 87, 0.5),
      0 6px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);

    &::before {
      left: 100%;
    }

    &::after {
      opacity: 1;
    }

    svg {
      transform: translateX(5px);
    }
  }

  &:active {
    transform: translateY(-1px) scale(1);
  }
`;

const SecondaryCta = styled(Link)`
  background: #ffffff;
  color: ${theme.colors.primary};
  padding: 16px 32px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 2px solid ${theme.colors.primary};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(46, 139, 87, 0.1);

  svg {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: ${theme.colors.primary};
    color: #ffffff;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 24px rgba(46, 139, 87, 0.3);

    svg {
      transform: translateX(5px);
    }
  }
`;

const HighlightCard = styled.div`
  position: relative;
  border-radius: 0;
  padding: 36px;
  background: transparent;
  border: none;
  display: grid;
  gap: 24px;
  align-content: start;
  box-shadow: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #1b1f24;
    letter-spacing: -0.01em;
  }

  p {
    margin: 0;
    font-size: 16px;
    line-height: 1.7;
    color: #4a5568;
  }
`;

const HighlightList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;

  li {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #4a5568;

    span:first-child {
      font-weight: 600;
      color: #1b1f24;
    }

    span:last-child {
      opacity: 0.7;
    }
  }
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 10px;
`;

const HeroStat = styled.div`
  background: transparent;
  border-radius: 0;
  padding: 24px;
  border: none;
  display: grid;
  gap: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;

  &:hover {
    transform: translateY(-2px);
  }

  strong {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.03em;
    font-family: ${theme.fonts.heading};
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 50%, #3CB371 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  span {
    font-size: 13px;
    color: #4a5568;
    line-height: 1.6;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
`;

const Section = styled.section`
  display: grid;
  gap: 28px;
  padding: 80px 0;
  width: 100%;

  @media (min-width: 768px) {
    padding: 100px 0;
  }

  @media (min-width: 1024px) {
    padding: 120px 0;
  }

  > * {
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
    padding: 0 24px;

    @media (min-width: 768px) {
      padding: 0 48px;
    }

    @media (min-width: 1024px) {
      padding: 0 64px;
    }
  }
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 12px;
`;

const SectionTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${theme.colors.primary};
  background: rgba(46, 139, 87, 0.1);
  padding: 8px 16px;
  border-radius: 10px;
  width: fit-content;
  border: 1px solid rgba(46, 139, 87, 0.2);
  box-shadow: 0 2px 4px rgba(46, 139, 87, 0.1);
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: clamp(2rem, 3.5vw, 2.5rem);
  font-weight: 800;
  color: #1b1f24;
  font-family: ${theme.fonts.heading};
  letter-spacing: -0.03em;
  line-height: 1.2;
`;

const SectionDescription = styled.p`
  margin: 0;
  max-width: 680px;
  color: #4a5568;
  line-height: 1.75;
  font-size: 17px;
  font-weight: 400;
`;

const FeaturesGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const FeatureCard = styled.div`
  position: relative;
  padding: 36px;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  display: grid;
  gap: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 1s ease-out both;
  overflow: visible;

  &:hover {
    transform: translateY(-4px);
  }

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1b1f24;
    letter-spacing: -0.01em;
  }

  p {
    margin: 0;
    color: #4a5568;
    line-height: 1.7;
    font-size: 16px;
  }
`;

const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 24px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.2) 0%, rgba(46, 139, 87, 0.1) 100%);
  backdrop-filter: blur(20px);
  color: ${theme.colors.primary};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(46, 139, 87, 0.3);
  box-shadow: 
    0 4px 16px rgba(46, 139, 87, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  ${FeatureCard}:hover & {
    transform: scale(1.15) rotate(8deg);
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%);
    color: #ffffff;
    box-shadow: 
      0 8px 24px rgba(46, 139, 87, 0.4),
      0 0 30px rgba(46, 139, 87, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-color: ${theme.colors.primaryLight};
  }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const QuickLinkCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 36px;
  border-radius: 0;
  text-decoration: none;
  color: #1b1f24;
  background: transparent;
  border: none;
  box-shadow: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 1s ease-out both;
  position: relative;
  overflow: visible;

  &:hover {
    transform: translateY(-4px);
  }
`;

const QuickLinkHeading = styled.div`
  display: grid;
  gap: 10px;

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #1b1f24;
    letter-spacing: -0.01em;
  }

  span {
    color: #4a5568;
    font-size: 15px;
    line-height: 1.6;
  }
`;

const QuickLinkFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${theme.colors.primary};
  font-weight: 700;
  font-size: 16px;

  svg {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${QuickLinkCard}:hover & svg {
    transform: translateX(8px);
  }
`;

const HomePage: React.FC = () => {
  const [bannerVisible, setBannerVisible] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Verificar localStorage después de que el componente esté montado
    try {
      const saved = localStorage.getItem('infoBannerDismissed');
      if (saved !== 'true') {
        // Pequeño delay para que se vea la animación
        setTimeout(() => {
          setBannerVisible(true);
        }, 300);
      }
    } catch (error) {
      // Si hay error con localStorage, mostrar el banner de todas formas
      setTimeout(() => {
        setBannerVisible(true);
      }, 300);
    }
  }, []);

  const handleCloseBanner = () => {
    setBannerVisible(false);
    try {
      localStorage.setItem('infoBannerDismissed', 'true');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const entries = [
    { to: '/generador', title: 'Generar Plan Semanal', subtitle: 'Crea menús con IA' },
    { to: '/planes', title: 'Mis Planes', subtitle: 'Revisa, edita y reutiliza' },
    { to: '/lista-compra', title: 'Lista de Compras', subtitle: 'Ordena tu compra automáticamente' },
    { to: '/suscripcion', title: 'Suscripción', subtitle: 'Desbloquea funciones premium' },
  ];

  const bannerFeatures = [
    {
      icon: <FiZap />,
      title: 'Generación con IA',
      description: 'Planes personalizados en segundos basados en tus objetivos y preferencias.',
    },
    {
      icon: <FiTarget />,
      title: 'Macros precisos',
      description: 'Cálculo automático de calorías y macronutrientes según tus metas.',
    },
    {
      icon: <FiShoppingBag />,
      title: 'Lista de compras',
      description: 'Generación automática de lista organizada por categorías.',
    },
  ];

  const stats = [
    { value: '99%', label: 'Precisión en macronutrientes' },
    { value: '+12k', label: 'Planes personalizados generados' },
    { value: '5h', label: 'Promedio de tiempo ahorrado por semana' },
  ];

  const features = [
    {
      icon: FiTrendingUp,
      title: 'Objetivos con resultados',
      description: 'Planifica con inteligencia los macros ideales para perder peso, mantener o ganar masa muscular.',
    },
    {
      icon: FiShield,
      title: 'Rigor nutricional y médico',
      description: 'Cada recomendación se basa en fuentes médicas validadas y supervisión nutricional experta.',
    },
    {
      icon: FiClock,
      title: 'Automatiza tu semana',
      description: 'Recibe menús completos con lista de compra organizada en segundos, sin hojas de cálculo.',
    },
    {
      icon: FiCheckCircle,
      title: 'Respeta tus preferencias',
      description: 'Incluimos tus gustos, alergias y deseos culinarios para que disfrutes cada comida.',
    },
  ];

  return (
    <>
      <InfoBannerOverlay 
        isVisible={bannerVisible}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseBanner();
          }
        }}
      >
        <InfoBanner onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={handleCloseBanner} aria-label="Cerrar banner">
            <FiX />
          </CloseButton>
          <BannerContent>
            <BannerHeader>
              <BannerTitleSection>
                <BannerTitle>¿Cómo funciona TastyPath?</BannerTitle>
                <BannerQuestion>
                  Planifica tu nutrición semanal de forma inteligente con nuestra plataforma impulsada por IA.
                </BannerQuestion>
              </BannerTitleSection>
            </BannerHeader>
            <BannerFeatures>
              {bannerFeatures.map((feature, index) => (
                <BannerFeature key={index}>
                  <BannerFeatureIcon>{feature.icon}</BannerFeatureIcon>
                  <BannerFeatureText>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </BannerFeatureText>
                </BannerFeature>
              ))}
            </BannerFeatures>
          </BannerContent>
        </InfoBanner>
      </InfoBannerOverlay>

      <PageWrapper>
        <Hero>
        <HeroGrid>
          <HeroContent>
            <HeroBadge>
              <FiSun />
              Experiencia IA 2025
            </HeroBadge>
            <HeroTitle>
              Nutrición inteligente para tu vida diaria, impulsada por <span>IA avanzada</span>.
            </HeroTitle>
            <HeroText>
              Crea planes semanales deliciosos, con el balance perfecto de macros, recetas variadas y listas de
              compras optimizadas. TastyPath te acompaña para llevar tus objetivos a resultados reales.
            </HeroText>
            <HeroBenefits>
              <li>
                <FiCheckCircle />
                Menús completos con presencia balanceada de carnes, pescados y opciones vegetales.
              </li>
              <li>
                <FiCheckCircle />
                Ajustamos calorías, macros y raciones a tus metas y preferencias alimentarias.
              </li>
              <li>
                <FiCheckCircle />
                Sincronización con compras inteligentes y recordatorios semanales.
              </li>
            </HeroBenefits>
            <HeroActions>
              <PrimaryCta to="/generador">
                Empezar ahora
                <FiArrowRight />
              </PrimaryCta>
              <SecondaryCta to="/suscripcion">
                Explorar Premium
                <FiArrowRight />
              </SecondaryCta>
            </HeroActions>
            <HeroStats>
              {stats.map(stat => (
                <HeroStat key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </HeroStat>
              ))}
            </HeroStats>
          </HeroContent></HeroGrid>
      </Hero>

      <Section>
        <SectionHeader>
          <SectionTag>Ventajas clave</SectionTag>
          <SectionTitle>La experiencia TastyPath se siente como tu nutricionista personal</SectionTitle>
          <SectionDescription>
            Centralizamos en un panel elegante todo lo que necesitas para planificar, comprar y cocinar con la
            tranquilidad de estar siguiendo un plan hecho a tu medida.
          </SectionDescription>
        </SectionHeader>

        <FeaturesGrid>
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <FeatureCard key={feature.title}>
                <FeatureIcon>
                  <Icon />
                </FeatureIcon>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </FeatureCard>
            );
          })}
        </FeaturesGrid>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTag>Acceso rápido</SectionTag>
          <SectionTitle>Todo tu ecosistema nutricional a un clic</SectionTitle>
          <SectionDescription>
            Navega por tus herramientas favoritas y mantén el control de tu alimentación semanal desde un solo lugar.
          </SectionDescription>
        </SectionHeader>

        <QuickLinksGrid>
          {entries.map(item => (
            <QuickLinkCard key={item.to} to={item.to}>
              <QuickLinkHeading>
                <h3>{item.title}</h3>
                <span>{item.subtitle}</span>
              </QuickLinkHeading>
              <QuickLinkFooter>
                Entrar ahora
                <FiArrowRight />
              </QuickLinkFooter>
            </QuickLinkCard>
          ))}
        </QuickLinksGrid>
      </Section>
      </PageWrapper>
    </>
  );
};

export default HomePage;

