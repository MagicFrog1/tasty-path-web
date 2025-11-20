import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { DatabaseService } from '../../services/databaseService';

const Container = styled.div`
  max-width: 450px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1.5rem;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 14px;
    gap: 0.875rem;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    border-radius: 12px;
    gap: 0.75rem;
  }
`;

const Title = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: clamp(1.5rem, 5vw, 1.75rem);
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  line-height: 1.2;

  @media (max-width: 480px) {
    margin-bottom: 0.375rem;
  }
`;

const Subtitle = styled.p`
  margin: 0 0 1.5rem 0;
  font-size: clamp(0.875rem, 3vw, 0.95rem);
  color: #6b7280;
  text-align: center;
  line-height: 1.5;

  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input<{ $hasToggle?: boolean }>`
  width: 100%;
  padding: 12px 14px;
  padding-right: ${props => props.$hasToggle ? '45px' : '14px'};
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  font-size: clamp(14px, 3vw, 1rem);
  transition: all 0.2s;
  
  @media (max-width: 480px) {
    padding: 14px 16px;
    padding-right: ${props => props.$hasToggle ? '50px' : '16px'};
    font-size: 16px; /* Previene zoom en iOS */
    border-radius: 10px;
  }
  
  &:focus {
    outline: none;
    border-color: #2e8b57;
    box-shadow: 0 0 0 3px rgba(46, 139, 87, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  
  &:hover {
    color: #2e8b57;
  }
  
  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  padding: 14px 20px;
  border-radius: 12px;
  border: 0;
  background: #2e8b57;
  color: #fff;
  font-weight: 700;
  font-size: clamp(14px, 3vw, 1rem);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 16px 18px;
    font-size: 16px;
    border-radius: 10px;
  }
  
  &:hover:not(:disabled) {
    background: #256f47;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(46, 139, 87, 0.3);
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
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #fee;
  border-radius: 8px;
  border: 1px solid #fcc;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #2e8b57;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.5rem;
  text-decoration: underline;
  margin-top: 0.5rem;
  
  &:hover {
    color: #256f47;
  }
  
  &:focus {
    outline: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const PasswordHint = styled.div`
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: -0.5rem;
  margin-left: 0.5rem;
`;

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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Introduce un correo válido.');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Por favor ingresa tu nombre');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login con Supabase
        console.log('Intentando iniciar sesión con email:', email.toLowerCase());
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });
        
        if (signInError || !data.user) {
          console.error('Error en signIn:', signInError);
          console.error('Error detallado en login/registro:', signInError);
          
          // Mensajes de error más específicos
          let errorMessage = 'No se pudo iniciar sesión';
          if (signInError?.message?.includes('Failed to fetch') || signInError?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
            errorMessage = 'Error de conexión con el servidor. Verifica tu conexión a internet o contacta con soporte.';
          } else if (signInError?.message?.includes('Invalid login credentials')) {
            errorMessage = 'Email o contraseña incorrectos';
          } else if (signInError?.message) {
            errorMessage = signInError.message;
          }
          
          throw new Error(errorMessage);
        }

        console.log('Login exitoso, obteniendo perfil...');
        // Obtener/crear perfil
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
        // Registro con Supabase
        console.log('Intentando crear cuenta con email:', email.toLowerCase());
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: { emailRedirectTo: undefined },
        });
        
        if (signUpError || !data.user) {
          console.error('Error en signUp:', signUpError);
          console.error('Error detallado en login/registro:', signUpError);
          
          // Mensajes de error más específicos
          let errorMessage = 'No se pudo crear la cuenta';
          if (signUpError?.message?.includes('Failed to fetch') || signUpError?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
            errorMessage = 'Error de conexión con el servidor. Verifica tu conexión a internet o contacta con soporte.';
          } else if (signUpError?.message?.includes('User already registered')) {
            errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
          } else if (signUpError?.message) {
            errorMessage = signUpError.message;
          }
          
          throw new Error(errorMessage);
        }

        console.log('Usuario creado exitosamente, verificando sesión...');
        
        // Verificar que la sesión esté establecida
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session) {
          console.warn('⚠️ Sesión no establecida inmediatamente después de signUp, esperando...');
          // Esperar un momento y verificar de nuevo
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retrySession } = await supabase.auth.getSession();
          if (!retrySession?.session) {
            console.error('❌ No se pudo establecer la sesión después del registro');
            // Continuar de todas formas, puede que funcione con el user ID
          } else {
            console.log('✅ Sesión establecida correctamente');
          }
        } else {
          console.log('✅ Sesión establecida correctamente');
        }

        console.log('Creando perfil de usuario...');
        console.log('📝 ID del usuario:', data.user.id);
        console.log('📝 Email del usuario:', email.toLowerCase());
        
        // Asegurar que el ID es string y coincide exactamente
        const userId = String(data.user.id).trim();
        console.log('📝 ID procesado para perfil:', userId);
        
        // Crear perfil básico
        const profileResult = await DatabaseService.createUserProfile({
          id: userId,
          email: email.toLowerCase(),
          name: name.trim() || data.user.email?.split('@')[0] || 'Usuario',
          avatar: '',
          weight: 70,
          height: 170,
          age: 30,
          gender: 'male',
          activity_level: 'moderate',
        });
        
        if (!profileResult) {
          console.error('Error: No se pudo crear el perfil en la base de datos');
          // Intentar verificar si el perfil ya existe
          const existingProfile = await DatabaseService.getUserProfile(email.toLowerCase());
          if (existingProfile) {
            console.log('✅ El perfil ya existe, continuando...');
          } else {
            throw new Error('No se pudo crear el perfil de usuario. Verifica las políticas RLS en Supabase.');
          }
        } else {
          console.log('Perfil creado exitosamente:', profileResult);
        }

        const userData = {
          id: data.user.id,
          email: email.toLowerCase(),
          name: name.trim() || 'Usuario',
          isLoggedIn: true,
          isNewUser: true,
          hasSelectedPlan: false,
          hasUsedFreePlan: false,
        };
        
        await login(userData);
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Error detallado en login/registro:', err);
      const errorMessage = err?.message || err?.toString() || 'Error desconocido';
      setError(`Ha ocurrido un error: ${errorMessage}`);
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
  };

  return (
    <Container>
      <Form onSubmit={onSubmit}>
        <Title>
          {isLogin ? '¡Bienvenido de vuelta!' : '¡Únete a TastyPath!'}
        </Title>
        <Subtitle>
          {isLogin 
            ? 'Accede a tu cuenta para continuar tu viaje nutricional' 
            : 'Comienza tu transformación nutricional hoy mismo'
          }
        </Subtitle>

        {!isLogin && (
          <Input
            type="text"
            placeholder="Tu nombre completo"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
          />
        )}

        <Input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />

        <InputContainer>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={isLogin ? "Contraseña" : "Contraseña (mínimo 6 caracteres)"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            $hasToggle={true}
          />
          <PasswordToggle
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </PasswordToggle>
        </InputContainer>
        {!isLogin && password.length > 0 && password.length < 6 && (
          <PasswordHint>
            ⚠️ La contraseña debe tener al menos 6 caracteres
          </PasswordHint>
        )}

        {!isLogin && (
          <InputContainer>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              $hasToggle={true}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </PasswordToggle>
          </InputContainer>
        )}

        {error && <Error>{error}</Error>}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span>{isLogin ? 'Iniciando...' : 'Creando...'}</span>
            </>
          ) : (
            <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
          )}
        </Button>

        <ToggleButton type="button" onClick={toggleMode}>
          {isLogin 
            ? '¿No tienes cuenta? Regístrate aquí' 
            : '¿Ya tienes cuenta? Inicia sesión aquí'
          }
        </ToggleButton>
      </Form>
    </Container>
  );
};

export default Login;

