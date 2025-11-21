import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiCalendar, FiShoppingCart, FiUser, FiStar, FiBookOpen, FiMenu, FiX } from 'react-icons/fi';
import { FaKitchenSet } from 'react-icons/fa6';
import { theme } from '../styles/theme';
import { useSubscription } from '../context/SubscriptionContext';
// Usamos ruta pública de Vite al directorio raíz /assets

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  overflow-x: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside<{ isOpen?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  overflow-y: hidden;
  overflow-x: hidden;
  background: linear-gradient(200deg, rgba(34, 139, 34, 0.95) 0%, rgba(73, 150, 102, 0.85) 100%);
  color: ${theme.colors.white};
  padding: 16px 14px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 12px 0 32px rgba(27, 77, 62, 0.2);
  z-index: 100;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    left: ${props => props.isOpen ? '0' : '-100%'};
    height: 100vh;
    width: 280px;
    max-width: 85vw;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: hidden;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 24px 20px;
    background: linear-gradient(200deg, rgba(34, 139, 34, 0.98) 0%, rgba(73, 150, 102, 0.95) 100%);
    backdrop-filter: blur(20px);
    box-shadow: ${props => props.isOpen ? '4px 0 24px rgba(0, 0, 0, 0.3)' : 'none'};
  }

  @media (max-width: 768px) {
    width: 260px;
    padding: 20px 16px;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100vw;
  }
`;

const MobileMenuOverlay = styled.div<{ isOpen: boolean }>`
  display: none;

  @media (max-width: 1024px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 99;
    animation: ${props => props.isOpen ? 'fadeIn' : 'fadeOut'} 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

const MobileMenuButton = styled.button`
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 16px;
    left: 16px;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(34, 139, 34, 0.95);
    color: ${theme.colors.white};
    border: none;
    cursor: pointer;
    z-index: 101;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    &:active {
      transform: scale(0.95);
    }

    svg {
      font-size: 24px;
    }
  }

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    top: 12px;
    left: 12px;
  }
`;

const MobileHeader = styled.div`
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

const CloseButton = styled.button`
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: ${theme.colors.white};
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    &:active {
      transform: scale(0.95);
      background: rgba(255, 255, 255, 0.2);
    }

    svg {
      font-size: 20px;
    }
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;

  img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: contain;
    background: transparent;
    box-shadow: none;
    flex-shrink: 0;
  }

  h1 {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 10px;
    opacity: 0.8;
    letter-spacing: 0.05em;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    h1 {
      font-size: 18px;
    }
    span {
      display: none;
    }
  }

  @media (max-width: 480px) {
    img {
      width: 36px;
      height: 36px;
    }
    h1 {
      font-size: 16px;
    }
  }
`;

const DesktopBrand = styled(Brand)`
  @media (max-width: 1024px) {
    display: none;
  }
`;

const Menu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: hidden;
  overflow-x: hidden;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  justify-content: flex-start;

  @media (max-width: 1024px) {
    width: 100%;
    gap: 6px;
  }
`;

const MenuItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px;
  border-radius: 10px;
  color: ${theme.colors.white};
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.01em;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid transparent;
  text-decoration: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;

  svg {
    font-size: 15px;
    transition: transform .2s ease, opacity .2s ease;
    flex-shrink: 0;
  }

  @media (max-width: 1024px) {
    padding: 14px 12px;
    border-radius: 12px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: 12px 10px;
    font-size: 13px;
  }

  &.active,
  &:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 16px rgba(27, 77, 62, 0.3);
    transform: none;
    svg { transform: none; opacity: .95; }
  }

  @media (max-width: 1024px) {
    &.active,
    &:hover {
      transform: none;
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PremiumBadge = styled.div`
  margin-top: auto;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(236, 72, 153, 0.35));
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: ${theme.colors.white};
  box-shadow: 0 12px 24px rgba(27, 77, 62, 0.2);
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0;

  h3 {
    margin: 0 0 5px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
  }

  p {
    margin: 0;
    font-size: 11px;
    line-height: 1.35;
    opacity: 0.8;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const ContentWrapper = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0;
  position: relative;
  background: #ffffff;
  width: calc(100% - 280px);
  padding: 64px 64px 48px 48px;
  overflow-x: hidden;

  @media (max-width: 1280px) {
    padding: 56px 56px 40px 40px;
  }

  @media (max-width: 1024px) {
    margin-left: 0;
    width: 100%;
    padding: 48px 32px 32px 32px;
  }

  @media (max-width: 768px) {
    padding: 40px 24px 24px 24px;
  }

  @media (max-width: 480px) {
    padding: 32px 16px 16px 16px;
  }
`;

const ContentCard = styled.div`
  max-width: 100%;
  margin: 0;
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
  width: 100%;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  color: ${theme.colors.textSecondary};
  font-size: 14px;

  span {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

interface MainLayoutProps {
  title?: string;
  subtitle?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ title, subtitle }) => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const { currentPlan } = useSubscription();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isPremium = currentPlan && ['weekly', 'monthly', 'annual'].includes(currentPlan.plan);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const breadcrumb = [
    { label: 'Inicio', path: '/' },
    ...segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      // Si el segmento es un número (ID de plan), omitirlo del breadcrumb
      const isNumericId = /^\d+$/.test(segment);
      if (isNumericId) {
        return null;
      }
      const label = segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        label,
        path,
      };
    }).filter(Boolean) as Array<{ label: string; path: string }>,
  ];

  const menuItems = [
    { to: '/dashboard', label: 'Panel Principal', icon: <FiHome /> },
    { to: '/planes', label: 'Planes Guardados', icon: <FiCalendar /> },
    { to: '/generador', label: 'Generador IA', icon: <FaKitchenSet /> },
    ...(isPremium ? [{ to: '/lista-compra', label: 'Lista de Compras', icon: <FiShoppingCart /> }] : []),
    { to: '/perfil', label: 'Mi Perfil', icon: <FiUser /> },
    { to: '/suscripcion', label: 'Suscripción', icon: <FiStar /> },
    { to: '/fuentes-medicas', label: 'Fuentes Médicas', icon: <FiBookOpen /> },
  ];

  return (
    <LayoutWrapper>
      <MobileMenuButton onClick={toggleMenu} aria-label="Abrir menú">
        <FiMenu />
      </MobileMenuButton>

      <MobileMenuOverlay isOpen={isMenuOpen} onClick={closeMenu} />

      <Sidebar isOpen={isMenuOpen}>
        <MobileHeader>
          <Brand>
            <img src="/assets/logo-tastypath-preview.png" alt="TastyPath" />
            <div>
              <h1>MyTastyPath</h1>
            </div>
          </Brand>
          <CloseButton onClick={closeMenu} aria-label="Cerrar menú">
            <FiX />
          </CloseButton>
        </MobileHeader>

        <DesktopBrand>
          <img src="/assets/logo-tastypath-preview.png" alt="TastyPath" />
          <div>
            <h1>MyTastyPath</h1>
            <span>Nutrición inteligente</span>
          </div>
        </DesktopBrand>

        <Menu>
          {menuItems.map(item => (
            <MenuItem 
              key={item.to} 
              to={item.to} 
              end={item.to === '/'}
              onClick={closeMenu}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        <PremiumBadge>
          <h3>Experiencia Premium</h3>
          <p>Accede a menús ilimitados, analíticas avanzadas y soporte prioritario con MyTastyPath Premium.</p>
        </PremiumBadge>
      </Sidebar>

      <ContentWrapper>
        <ContentCard>
          <Outlet />
        </ContentCard>
      </ContentWrapper>
    </LayoutWrapper>
  );
};

