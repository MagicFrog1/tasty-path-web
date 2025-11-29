import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiFileText, FiShield, FiLock, FiInfo, FiArrowRight, FiLogOut, FiTrash2, FiCreditCard, FiSettings } from 'react-icons/fi';
import { useUserProfile } from '../context/UserProfileContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DatabaseService } from '../services/databaseService';
import { theme } from '../styles/theme';
import { redirectToBillingPortal } from '../services/stripeService';
import { useSubscription } from '../context/SubscriptionContext';
import { getUserSubscription } from '../services/subscriptionService';

const PageWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #0a0e13;
  font-family: ${theme.fonts.heading};
  letter-spacing: -0.03em;
  line-height: 1.2;

  @media (max-width: 768px) {
    margin-bottom: 6px;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  font-size: clamp(14px, 3vw, 16px);
  line-height: 1.5;
`;

const ProfileCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(139, 92, 246, 0.1);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 16px;
    margin-bottom: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.1rem, 4vw, 1.4rem);
  font-weight: 700;
  color: ${theme.colors.primary};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 14px;
  }

  svg {
    flex-shrink: 0;
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid rgba(139, 92, 246, 0.15);
  font-size: clamp(14px, 3vw, 15px);
  transition: all 0.2s ease;
  background: ${theme.colors.white};
  width: 100%;

  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 16px; /* Previene zoom en iOS */
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &:hover {
    border-color: rgba(139, 92, 246, 0.3);
  }
`;

const LegalLinksGrid = styled.div`
  display: grid;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const LegalLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  text-decoration: none;
  color: ${theme.colors.textPrimary};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05));
  border: 2px solid rgba(139, 92, 246, 0.15);
  border-radius: 16px;
  transition: all 0.25s ease;
  font-weight: 500;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 768px) {
    padding: 16px 18px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    border-radius: 12px;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(139, 92, 246, 0.3);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1));
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  }

  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LegalLinkContent = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const LegalLinkIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
  color: ${theme.colors.primary};
  font-size: 20px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 18px;
    border-radius: 10px;
  }
`;

const LegalLinkText = styled.span`
  font-size: clamp(14px, 3vw, 15px);
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const LegalLinkArrow = styled.div`
  color: ${theme.colors.primary};
  font-size: 18px;
  transition: transform 0.25s ease;
  
  ${LegalLink}:hover & {
    transform: translateX(4px);
  }
`;

const PremiumMessage = styled.div`
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.08) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 1.5px solid rgba(46, 139, 87, 0.2);
  margin-top: 16px;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const PremiumMessageTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.primaryDark};
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: ${theme.colors.primary};
    flex-shrink: 0;
  }
  
  @media (max-width: 480px) {
    font-size: 16px;
    gap: 8px;
  }
`;

const PremiumMessageText = styled.p`
  margin: 0 0 16px 0;
  color: ${theme.colors.textSecondary};
  font-size: 15px;
  line-height: 1.6;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const PremiumMessageButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, rgba(34, 197, 94, 0.9) 100%);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 20px;
  border: 2px solid ${props => 
    props.variant === 'danger' ? 'rgba(239, 68, 68, 0.3)' :
    props.variant === 'primary' ? 'rgba(139, 92, 246, 0.3)' :
    'rgba(139, 92, 246, 0.15)'};
  border-radius: 16px;
  background: ${props => 
    props.variant === 'danger' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05))' :
    props.variant === 'primary' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))' :
    'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))'};
  color: ${props => 
    props.variant === 'danger' ? '#ef4444' :
    props.variant === 'primary' ? theme.colors.primary :
    theme.colors.textPrimary};
  font-size: clamp(14px, 3vw, 15px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 768px) {
    padding: 16px 18px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    border-radius: 12px;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => 
      props.variant === 'danger' ? 'rgba(239, 68, 68, 0.5)' :
      props.variant === 'primary' ? 'rgba(139, 92, 246, 0.5)' :
      'rgba(139, 92, 246, 0.3)'};
    background: ${props => 
      props.variant === 'danger' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))' :
      props.variant === 'primary' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15))' :
      'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))'};
    box-shadow: 0 4px 12px ${props => 
      props.variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' :
      'rgba(139, 92, 246, 0.15)'};
  }

  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ActionButtonIcon = styled.div<{ variant?: 'danger' | 'primary' | 'secondary' }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' :
    props.variant === 'primary' ? 'rgba(139, 92, 246, 0.1)' :
    'rgba(139, 92, 246, 0.1)'};
  color: ${props => 
    props.variant === 'danger' ? '#ef4444' :
    props.variant === 'primary' ? theme.colors.primary :
    theme.colors.primary};
  font-size: 20px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 18px;
    border-radius: 10px;
  }
`;

const ActionButtonText = styled.span`
  font-size: 15px;
  font-weight: 600;
`;

const ActionsCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(139, 92, 246, 0.1);
  margin-top: 24px;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 16px;
    margin-top: 16px;
  }
`;

const ActionsGrid = styled.div`
  display: grid;
  gap: 12px;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const LegalCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(139, 92, 246, 0.1);
  margin-top: 24px;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 16px;
    margin-top: 16px;
  }
`;

const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useUserProfile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const legalLinks = [
    { to: '/terminos', icon: FiFileText, label: 'Términos de Servicio' },
    { to: '/privacidad', icon: FiShield, label: 'Política de Privacidad' },
    { to: '/seguridad', icon: FiLock, label: 'Política de Seguridad' },
    { to: '/legal', icon: FiInfo, label: 'Información Legal' },
  ];

  const handleLogout = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      return;
    }

    setIsLoggingOut(true);
    try {
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Limpiar estado local
      await logout();
      
      // Redirigir a la página de inicio
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = '¿Estás seguro de que deseas eliminar tu cuenta?\n\nEsta acción es IRREVERSIBLE y eliminará:\n- Tu perfil\n- Todos tus planes semanales\n- Tus listas de compras\n- Tu configuración de dieta\n\n¿Deseas continuar?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Confirmación adicional
    const finalConfirm = window.prompt('Para confirmar, escribe "ELIMINAR" en mayúsculas:');
    if (finalConfirm !== 'ELIMINAR') {
      alert('Confirmación incorrecta. La eliminación ha sido cancelada.');
      return;
    }

    setIsDeleting(true);
    try {
      if (!user?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Eliminar todos los datos del usuario de la base de datos
      const deleted = await DatabaseService.clearAllUserData(user.id);
      
      if (!deleted) {
        throw new Error('No se pudieron eliminar todos los datos');
      }

      // Nota: La eliminación del usuario de Supabase Auth requiere permisos de administrador
      // que no están disponibles desde el cliente. Los datos de la base de datos ya fueron eliminados.
      // El usuario puede contactar al soporte si necesita eliminar completamente su cuenta de Auth.

      // Cerrar sesión
      await supabase.auth.signOut();
      await logout();

      alert('Tu cuenta ha sido eliminada exitosamente. Gracias por usar TastyPath.');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      alert('Error al eliminar la cuenta. Por favor, contacta al soporte si el problema persiste.');
    } finally {
      setIsDeleting(false);
    }
  };

  const { currentPlan, checkSubscriptionStatus } = useSubscription();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  // Actualizar estado de suscripción cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id) {
      checkSubscriptionStatus(user.id);
    }
  }, [user?.id, checkSubscriptionStatus]);

  const handleOpenBillingPortal = async () => {
    setIsOpeningPortal(true);
    try {
      let customerId: string | null = null;

      // 1. Intentar obtener el customer ID desde Supabase (prioridad)
      if (user?.id) {
        try {
          console.log('🔍 Buscando customer_id en Supabase para usuario:', user.id);
          const subscription = await getUserSubscription(user.id);
          if (subscription?.stripe_customer_id) {
            customerId = subscription.stripe_customer_id;
            console.log('✅ Customer ID obtenido desde Supabase:', customerId);
          } else {
            console.warn('⚠️ No se encontró stripe_customer_id en la suscripción de Supabase');
            console.log('📋 Datos de suscripción encontrados:', subscription);
          }
        } catch (error) {
          console.error('❌ Error obteniendo customer ID desde Supabase:', error);
        }
      }

      // 2. Si no hay customer_id, intentar sincronizar desde Stripe
      if (!customerId && user?.id && user?.email) {
        try {
          console.log('🔄 Sincronizando suscripción desde Stripe...');
          const syncResponse = await fetch('/api/sync-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              userEmail: user.email,
            }),
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            if (syncData.customerId) {
              customerId = syncData.customerId;
              console.log('✅ Customer ID obtenido después de sincronizar:', customerId);
            } else {
              console.warn('⚠️ Sincronización completada pero no se encontró customerId');
            }
          } else {
            const errorData = await syncResponse.json();
            console.error('❌ Error en sincronización:', errorData);
          }
        } catch (error) {
          console.error('❌ Error sincronizando suscripción:', error);
        }
      }

      // 3. Fallback: Intentar obtenerlo del localStorage
      if (!customerId) {
        const storedCustomerId = localStorage.getItem('stripe_customer_id');
        if (storedCustomerId) {
          customerId = storedCustomerId;
          console.log('📋 Customer ID encontrado en localStorage (fallback):', customerId);
        }
      }
      
      // 4. Si no se encontró el customer ID
      if (!customerId) {
        console.error('❌ No se pudo obtener customer_id de ninguna fuente');
        alert('No se encontró información de suscripción de Stripe. Asegúrate de tener una suscripción activa. Si acabas de suscribirte, espera unos momentos y vuelve a intentar. Si el problema persiste, contacta al soporte.');
        setIsOpeningPortal(false);
        return;
      }

      // 5. Validar que el customer_id tenga el formato correcto
      if (!customerId.startsWith('cus_')) {
        console.error('❌ Customer ID tiene formato incorrecto:', customerId);
        alert('El ID de cliente de Stripe tiene un formato incorrecto. Por favor, contacta al soporte.');
        setIsOpeningPortal(false);
        return;
      }

      console.log('🚀 Intentando abrir portal de facturación con customer_id:', customerId);

      // 6. Redirigir al portal de facturación de Stripe
      const result = await redirectToBillingPortal(customerId);
      
      if (!result.success && result.error) {
        console.error('❌ Error al abrir portal:', result.error);
        alert(result.error || 'Error al abrir el portal de facturación. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('❌ Error abriendo portal de facturación:', error);
      alert('Error al abrir el portal de facturación. Por favor, intenta de nuevo o contacta al soporte.');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  return (
    <PageWrapper>
      <Header>
        <Title>Mi Perfil</Title>
        <Subtitle>Gestiona tu información personal y revisa nuestras políticas</Subtitle>
      </Header>

      <ProfileCard>
        <SectionTitle>
          <FiUser />
          Información Personal
        </SectionTitle>
        <FormGrid>
          <Field>
            <Label>
              <FiUser size={16} />
              Nombre
            </Label>
            <Input
              type="text"
              value={profile.name}
              onChange={e => updateProfile({ name: e.target.value })}
              placeholder="Tu nombre completo"
            />
          </Field>
          <Field>
            <Label>
              <FiMail size={16} />
              Email
            </Label>
            <Input
              type="email"
              value={profile.email}
              readOnly
              disabled
              placeholder="tu@email.com"
              style={{
                cursor: 'not-allowed',
                opacity: 0.7,
                backgroundColor: 'rgba(0, 0, 0, 0.02)'
              }}
            />
            <p style={{
              margin: '8px 0 0 0',
              fontSize: '13px',
              color: theme.colors.textSecondary,
              fontStyle: 'italic'
            }}>
              El email no se puede modificar después de crear la cuenta
            </p>
          </Field>
        </FormGrid>
      </ProfileCard>

      <ActionsCard>
        <SectionTitle>
          <FiCreditCard />
          Gestión de Cuenta
        </SectionTitle>
        <ActionsGrid>
          {currentPlan && currentPlan.plan !== 'free' && currentPlan.isActive ? (
            <ActionButton
              variant="primary"
              onClick={handleOpenBillingPortal}
              disabled={isOpeningPortal}
            >
              <ActionButtonContent>
                <ActionButtonIcon variant="primary">
                  <FiSettings />
                </ActionButtonIcon>
                <ActionButtonText>
                  {isOpeningPortal ? 'Abriendo portal...' : 'Gestionar Suscripción'}
                </ActionButtonText>
              </ActionButtonContent>
              <FiArrowRight />
            </ActionButton>
          ) : (
            <PremiumMessage>
              <PremiumMessageTitle>
                <FiCreditCard />
                Suscripción Premium Requerida
              </PremiumMessageTitle>
              <PremiumMessageText>
                Para gestionar tu suscripción, actualizar métodos de pago o cambiar de plan, necesitas tener una suscripción activa. Descubre nuestros planes Premium y desbloquea todas las funcionalidades de TastyPath.
              </PremiumMessageText>
              <PremiumMessageButton onClick={() => navigate('/suscripcion')}>
                Ver Planes Premium
              </PremiumMessageButton>
            </PremiumMessage>
          )}
        </ActionsGrid>
      </ActionsCard>

      <LegalCard>
        <SectionTitle>
          <FiShield />
          Políticas y Legal
        </SectionTitle>
        <LegalLinksGrid>
          {legalLinks.map(link => {
            const Icon = link.icon;
            return (
              <LegalLink key={link.to} to={link.to}>
                <LegalLinkContent>
                  <LegalLinkIcon>
                    <Icon />
                  </LegalLinkIcon>
                  <LegalLinkText>{link.label}</LegalLinkText>
                </LegalLinkContent>
                <LegalLinkArrow>
                  <FiArrowRight />
                </LegalLinkArrow>
              </LegalLink>
            );
          })}
        </LegalLinksGrid>
      </LegalCard>

      <ActionsCard>
        <SectionTitle>
          <FiLogOut />
          Acciones de Cuenta
        </SectionTitle>
        <ActionsGrid>
          <ActionButton
            variant="secondary"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <ActionButtonContent>
              <ActionButtonIcon>
                <FiLogOut />
              </ActionButtonIcon>
              <ActionButtonText>
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </ActionButtonText>
            </ActionButtonContent>
            <FiArrowRight />
          </ActionButton>

          <ActionButton
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            <ActionButtonContent>
              <ActionButtonIcon variant="danger">
                <FiTrash2 />
              </ActionButtonIcon>
              <ActionButtonText>
                {isDeleting ? 'Eliminando cuenta...' : 'Eliminar Cuenta'}
              </ActionButtonText>
            </ActionButtonContent>
            <FiArrowRight />
          </ActionButton>
        </ActionsGrid>
      </ActionsCard>
    </PageWrapper>
  );
};

export default ProfilePage;