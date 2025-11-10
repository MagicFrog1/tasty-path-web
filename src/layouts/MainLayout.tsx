import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiCalendar, FiShoppingCart, FiUser, FiStar, FiBookOpen } from 'react-icons/fi';
import { FaKitchenSet } from 'react-icons/fa6';
import { theme } from '../styles/theme';
// Usamos ruta pública de Vite al directorio raíz /assets

const LayoutWrapper = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background: radial-gradient(120% 120% at 80% 0%, rgba(140, 82, 255, 0.08) 0%, rgba(255, 255, 255, 0) 55%),
    linear-gradient(180deg, rgba(34, 139, 34, 0.12) 0%, rgba(255, 255, 255, 0) 50%);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: linear-gradient(200deg, rgba(34, 139, 34, 0.95) 0%, rgba(73, 150, 102, 0.85) 100%);
  color: ${theme.colors.white};
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-shadow: 12px 0 32px rgba(27, 77, 62, 0.2);

  @media (max-width: 1024px) {
    position: sticky;
    top: 0;
    z-index: 10;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: rgba(34, 139, 34, 0.95);
    backdrop-filter: blur(12px);
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  img {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 10px 24px rgba(255, 255, 255, 0.25);
  }

  h1 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0;
  }

  span {
    font-size: 12px;
    opacity: 0.8;
    letter-spacing: 0.08em;
  }

  @media (max-width: 1024px) {
    h1 {
      font-size: 18px;
    }
    span {
      display: none;
    }
  }
`;

const Menu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const MenuItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  color: ${theme.colors.white};
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid transparent;

  svg {
    font-size: 18px;
    transition: transform .2s ease, opacity .2s ease;
  }

  &.active,
  &:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 12px 20px rgba(27, 77, 62, 0.35);
    transform: translateX(6px);
    svg { transform: translateX(2px); opacity: .95; }
  }
`;

const PremiumBadge = styled.div`
  margin-top: auto;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(236, 72, 153, 0.35));
  border-radius: 18px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: ${theme.colors.white};
  box-shadow: 0 18px 36px rgba(27, 77, 62, 0.25);

  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    opacity: 0.8;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const ContentWrapper = styled.main`
  padding: 40px 48px;
  position: relative;

  @media (max-width: 1280px) {
    padding: 32px 24px;
  }

  @media (max-width: 1024px) {
    padding-top: 120px;
  }
`;

const ContentCard = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 32px;
  box-shadow: ${theme.shadows.lg};
  border: 1px solid rgba(34, 139, 34, 0.08);
  backdrop-filter: blur(14px);

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
  }
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

  const breadcrumb = [
    { label: 'Inicio', path: '/' },
    ...segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        label: segment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        path,
      };
    }),
  ];

  const menuItems = [
    { to: '/dashboard', label: 'Panel Principal', icon: <FiHome /> },
    { to: '/planes', label: 'Planes Guardados', icon: <FiCalendar /> },
    { to: '/generador', label: 'Generador IA', icon: <FaKitchenSet /> },
    { to: '/lista-compra', label: 'Lista de Compras', icon: <FiShoppingCart /> },
    { to: '/perfil', label: 'Mi Perfil', icon: <FiUser /> },
    { to: '/suscripcion', label: 'Suscripción', icon: <FiStar /> },
    { to: '/fuentes-medicas', label: 'Fuentes Médicas', icon: <FiBookOpen /> },
  ];

  return (
    <LayoutWrapper>
      <Sidebar>
        <Brand>
          <img src="/assets/new_icon_tastypath.png" alt="TastyPath" />
          <div>
            <h1>TastyPath</h1>
            <span>Nutrición inteligente</span>
          </div>
        </Brand>

        <Menu>
          {menuItems.map(item => (
            <MenuItem key={item.to} to={item.to} end={item.to === '/'}>
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        <PremiumBadge>
          <h3>Experiencia Premium</h3>
          <p>Accede a menús ilimitados, analíticas avanzadas y soporte prioritario con TastyPath Premium.</p>
        </PremiumBadge>
      </Sidebar>

      <ContentWrapper>
        <ContentCard>
          <Breadcrumb>
            {breadcrumb.map((crumb, index) => (
              <span key={crumb.path}>
                {index > 0 && '•'}
                {crumb.label}
              </span>
            ))}
          </Breadcrumb>
          <Outlet />
        </ContentCard>
      </ContentWrapper>
    </LayoutWrapper>
  );
};

