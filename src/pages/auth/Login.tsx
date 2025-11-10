import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const Form = styled.form`
  display: grid;
  gap: 12px;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const Button = styled.button`
  padding: 12px 14px;
  border-radius: 12px;
  border: 0;
  background: #2e8b57;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

const Error = styled.div`
  color: #e74c3c;
  font-size: 13px;
`;

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Introduce un correo válido.');
      return;
    }
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const name = email.split('@')[0];
    await login({
      id: `user-${name}`,
      email,
      name,
      isLoggedIn: true,
      isNewUser: false,
      hasSelectedPlan: true,
    });
  };

  return (
    <Form onSubmit={onSubmit}>
      <Input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && <Error>{error}</Error>}
      <Button type="submit">Entrar</Button>
    </Form>
  );
};

export default Login;

