import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { DatabaseService } from '../../services/databaseService';
import { createInitialUserSubscription } from '../../services/subscriptionService';

// =====================================================
// STYLED COMPONENTS - Diseño Moderno y Profesional
// =====================================================

const Container = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 0;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1.25rem;
  width: 100%;

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input<{ $hasError?: boolean; $hasToggle?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  padding-right: ${props => props.$hasToggle ? '48px' : '16px'};
  border-radius: 12px;
  border: 2px solid ${props => props.$hasError ? '#ef4444' : '#e5e7eb'};
  background-color: #f9fafb;
  font-size: 15px;
  color: #1f2937;
  transition: all 0.2s ease;
  
  @media (max-width: 480px) {
    padding: 16px 18px;
    padding-right: ${props => props.$hasToggle ? '52px' : '18px'};
    font-size: 16px; /* Previene zoom en iOS */
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#ef4444' : '#10b981'};
    background-color: #ffffff;
    box-shadow: 0 0 0 4px ${props => props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #f3f4f6;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 6px;
  
  &:hover {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 14px;
  line-height: 1.5;
  margin-top: -0.5rem;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 10px;
  color: #166534;
  font-size: 14px;
  line-height: 1.6;
  margin-top: -0.5rem;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const InfoMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  color: #1e40af;
  font-size: 13px;
  line-height: 1.6;
  margin-top: -0.5rem;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
    accent-color: #10b981;
    flex-shrink: 0;
  }

  label {
    font-size: 13px;
    color: #4b5563;
    line-height: 1.5;
    cursor: pointer;
    margin: 0;
    flex: 1;

    a {
      color: #10b981;
      text-decoration: none;
      font-weight: 600;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px 24px;
  border-radius: 12px;
  border: 0;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 0.5rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  
  @media (max-width: 480px) {
    padding: 18px 24px;
    font-size: 16px;
  }
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  @media (max-width: 768px) {
    &:hover:not(:disabled) {
      transform: none;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ToggleMode = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  
  p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
  }

  button {
    background: none;
    border: none;
    color: #10b981;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
    margin-left: 4px;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.2s;
    
    &:hover {
      color: #059669;
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      border-radius: 4px;
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const FieldError = styled.p`
  margin: 0;
  font-size: 13px;
  color: #dc2626;
  margin-top: -0.25rem;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

// Iconos SVG modernos y minimalistas
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const ErrorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const SuccessIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Validar email en tiempo real
  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError(null);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return false;
    }
    setEmailError(null);
    return true;
  };

  // Validar contraseña en tiempo real
  const validatePassword = (passwordValue: string) => {
    if (!passwordValue) {
      setPasswordError(null);
      return false;
    }
    if (passwordValue.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setEmailError(null);
    setPasswordError(null);

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Por favor ingresa tu nombre completo');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden. Por favor verifica e intenta de nuevo');
        return;
      }
      if (!acceptedTerms) {
        setError('Debes aceptar los términos y condiciones para crear una cuenta');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        console.log('Intentando iniciar sesión con email:', email.toLowerCase());
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });
        
        if (signInError || !data.user) {
          console.error('Error en signIn:', signInError);
          
          // Mensajes de error específicos y claros
          let errorMessage = 'No se pudo iniciar sesión';
          
          if (signInError?.message?.includes('Failed to fetch') || signInError?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
            errorMessage = 'Error de conexión con el servidor. Verifica tu conexión a internet o contacta con soporte.';
          } else if (signInError?.message?.includes('Email not confirmed') || signInError?.message?.includes('email not confirmed')) {
            errorMessage = 'Tu correo electrónico no ha sido confirmado. Por favor revisa tu bandeja de entrada (incluyendo la carpeta de spam) y haz clic en el enlace de confirmación que te enviamos.';
          } else if (signInError?.message) {
            errorMessage = signInError.message;
          }
          
          throw new Error(errorMessage);
        }

        // Verificar si el email está confirmado
        if (data.user && !data.user.email_confirmed_at) {
          setError('Tu correo electrónico no ha sido confirmado. Por favor revisa tu bandeja de entrada y haz clic en el enlace de confirmación que te enviamos por email.');
          setIsLoading(false);
          return;
        }

        console.log('Login exitoso, obteniendo perfil...');
        const profile = await DatabaseService.getUserProfile(email.toLowerCase());
        console.log('Perfil obtenido:', profile);
        const resolvedName = profile?.name || data.user.email?.split('@')[0] || 'Usuario';

        const userData = {
          id: data.user.id,
          email: email.toLowerCase(),
          name: resolvedName,
          isLoggedIn: true,
          isNewUser: false,
          hasSelectedPlan: !!profile,
          hasUsedFreePlan: false,
        };
        
        await login(userData);
        navigate('/dashboard', { replace: true });
      } else {
        // REGISTRO
        console.log('Intentando crear cuenta con email:', email.toLowerCase());
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: { 
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              name: name.trim(),
            }
          },
        });
        
        if (signUpError || !data.user) {
          console.error('Error en signUp:', signUpError);
          
          // Mensajes de error específicos
          let errorMessage = 'No se pudo crear la cuenta';
          
          if (signUpError?.message?.includes('Failed to fetch') || signUpError?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
            errorMessage = 'Error de conexión con el servidor. Verifica tu conexión a internet o contacta con soporte.';
          } else if (signUpError?.message?.includes('User already registered') || signUpError?.message?.includes('already registered')) {
            errorMessage = 'Este correo electrónico ya está registrado. Por favor inicia sesión con tu contraseña.';
          } else if (signUpError?.message?.includes('Password')) {
            errorMessage = 'La contraseña no cumple con los requisitos de seguridad.';
          } else if (signUpError?.message) {
            errorMessage = signUpError.message;
          }
          
          throw new Error(errorMessage);
        }

        // Crear registro inicial en user_subscriptions (sin suscripción)
        if (data.user?.id) {
          try {
            console.log('📝 Creando registro inicial en user_subscriptions para usuario:', data.user.id);
            await createInitialUserSubscription(data.user.id);
            console.log('✅ Registro inicial en user_subscriptions creado exitosamente');
          } catch (subError: any) {
            console.error('⚠️ Error creando registro inicial en user_subscriptions:', subError);
            // No bloquear el registro si esto falla, solo loguear
          }
        }

        // Mensaje de éxito con instrucciones
        setSuccess(`¡Cuenta creada exitosamente! Hemos enviado un correo de confirmación a ${email.toLowerCase()}. Por favor revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de confirmación para activar tu cuenta.`);
        
        // Limpiar formulario
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        setAcceptedTerms(false);
        
        // Cambiar a modo login después de 3 segundos
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(null);
        }, 5000);
      }
    } catch (err: any) {
      console.error('Error detallado en login/registro:', err);
      const errorMessage = err?.message || err?.toString() || 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(null);
    setEmailError(null);
    setPasswordError(null);
    setAcceptedTerms(false);
  };

  return (
    <Container>
      <Form onSubmit={onSubmit}>
        {error && (
          <ErrorMessage>
            <ErrorIcon />
            <span>{error}</span>
          </ErrorMessage>
        )}

        {success && (
          <SuccessMessage>
            <SuccessIcon />
            <span>{success}</span>
          </SuccessMessage>
        )}

        {!isLogin && (
          <InputGroup>
            <Input
              type="text"
              placeholder="Tu nombre completo"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              disabled={isLoading}
            />
          </InputGroup>
        )}

        <InputGroup>
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            onBlur={() => validateEmail(email)}
            autoComplete="email"
            disabled={isLoading}
            $hasError={!!emailError}
          />
          {emailError && (
            <FieldError>
              <ErrorIcon />
              {emailError}
            </FieldError>
          )}
        </InputGroup>

        <InputGroup>
          <InputContainer>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={isLogin ? "Tu contraseña" : "Crea una contraseña segura (mín. 6 caracteres)"}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={isLoading}
              $hasToggle={true}
              $hasError={!!passwordError}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              disabled={isLoading}
            >
              <EyeIcon open={showPassword} />
            </PasswordToggle>
          </InputContainer>
          {passwordError && (
            <FieldError>
              <ErrorIcon />
              {passwordError}
            </FieldError>
          )}
        </InputGroup>

        {!isLogin && (
          <>
            <InputGroup>
              <InputContainer>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                  $hasToggle={true}
                  $hasError={confirmPassword.length > 0 && password !== confirmPassword}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  disabled={isLoading}
                >
                  <EyeIcon open={showConfirmPassword} />
                </PasswordToggle>
              </InputContainer>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <FieldError>
                  <ErrorIcon />
                  Las contraseñas no coinciden
                </FieldError>
              )}
            </InputGroup>

            <CheckboxContainer onClick={() => !isLoading && setAcceptedTerms(!acceptedTerms)}>
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="terms">
                Acepto los <Link to="/terminos" target="_blank" onClick={(e) => e.stopPropagation()}>términos y condiciones</Link> y la <Link to="/privacidad" target="_blank" onClick={(e) => e.stopPropagation()}>política de privacidad</Link> de TastyPath
              </label>
            </CheckboxContainer>

            <InfoMessage>
              <MailIcon />
              <span>
                <strong>Importante:</strong> Después de registrarte, recibirás un correo electrónico de confirmación. 
                Por favor revisa tu bandeja de entrada (incluyendo la carpeta de spam) y haz clic en el enlace de confirmación 
                para activar tu cuenta y comenzar a usar TastyPath.
              </span>
            </InfoMessage>
          </>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span>{isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}</span>
            </>
          ) : (
            <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
          )}
        </Button>

        <ToggleMode>
          <p>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button type="button" onClick={toggleMode} disabled={isLoading}>
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
            </button>
          </p>
        </ToggleMode>
      </Form>
    </Container>
  );
};

export default Login;
