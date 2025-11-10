import React from 'react';
import styled from 'styled-components';
import { useUserProfile } from '../context/UserProfileContext';

const Grid = styled.div`
  display: grid;
  gap: 12px;
  max-width: 560px;
`;

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useUserProfile();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Mi Perfil</h1>
      <Grid>
        <Field>
          <label>Nombre</label>
          <Input
            value={profile.name}
            onChange={e => updateProfile({ name: e.target.value })}
          />
        </Field>
        <Field>
          <label>Email</label>
          <Input
            value={profile.email}
            onChange={e => updateProfile({ email: e.target.value })}
          />
        </Field>
      </Grid>
    </div>
  );
};

export default ProfilePage;


