import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiFileText, FiShield, FiLock, FiInfo, FiArrowRight } from 'react-icons/fi';
import { useUserProfile } from '../context/UserProfileContext';
import { theme } from '../styles/theme';

const PageWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  font-size: 16px;
`;

const ProfileCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(139, 92, 246, 0.1);
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
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
  font-size: 15px;
  transition: all 0.2s ease;
  background: ${theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &:hover {
    border-color: rgba(139, 92, 246, 0.3);
  }
`;

const LegalCard = styled.div`
  background: ${theme.colors.white};
  border-radius: 24px;
  padding: 32px;
  box-shadow: ${theme.shadows.md};
  border: 1px solid rgba(139, 92, 246, 0.1);
  margin-top: 24px;
`;

const LegalLinksGrid = styled.div`
  display: grid;
  gap: 12px;
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

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(139, 92, 246, 0.3);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1));
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
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
`;

const LegalLinkText = styled.span`
  font-size: 15px;
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

const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useUserProfile();

  const legalLinks = [
    { to: '/terminos', icon: FiFileText, label: 'Términos de Servicio' },
    { to: '/privacidad', icon: FiShield, label: 'Política de Privacidad' },
    { to: '/seguridad', icon: FiLock, label: 'Política de Seguridad' },
    { to: '/legal', icon: FiInfo, label: 'Información Legal' },
  ];

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
              onChange={e => updateProfile({ email: e.target.value })}
              placeholder="tu@email.com"
            />
          </Field>
        </FormGrid>
      </ProfileCard>

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
    </PageWrapper>
  );
};

export default ProfilePage;