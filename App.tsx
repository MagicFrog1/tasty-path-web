import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './src/layouts/MainLayout';
import { AuthLayout } from './src/layouts/AuthLayout';
import { FullScreenLoader } from './src/components/common/FullScreenLoader';
import { useAuth } from './src/context/AuthContext';

// Páginas mínimas web
const LandingPage = React.lazy(() => import('./src/pages/LandingPage'));
const HomePage = React.lazy(() => import('./src/pages/HomePage'));
const PlanGeneratorPage = React.lazy(() => import('./src/pages/PlanGeneratorPage'));
const ShoppingListPage = React.lazy(() => import('./src/pages/ShoppingListPage'));
const ProfilePage = React.lazy(() => import('./src/pages/ProfilePage'));
const SubscriptionPage = React.lazy(() => import('./src/pages/SubscriptionPage'));
const SavedPlansPage = React.lazy(() => import('./src/pages/SavedPlansPage'));
const PlanDetailPage = React.lazy(() => import('./src/pages/PlanDetailPage'));
const MedicalSourcesPage = React.lazy(() => import('./src/pages/MedicalSourcesPage'));
const MiNutriPersonalPage = React.lazy(() => import('./src/pages/MiNutriPersonalPage'));
const NutriChatPage = React.lazy(() => import('./src/pages/NutriChatPage'));
const TermsPage = React.lazy(() => import('./src/pages/TermsPage'));
const PrivacyPage = React.lazy(() => import('./src/pages/PrivacyPage'));
const SecurityPage = React.lazy(() => import('./src/pages/SecurityPage'));
const LegalInfoPage = React.lazy(() => import('./src/pages/LegalInfoPage'));
const LoginPage = React.lazy(() => import('./src/pages/auth/Login'));

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader title="Cargando TastyPath" message="Preparando tu experiencia web..." />;
  }

  if (!user) {
    return (
      <React.Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/auth/*"
            element={
              <AuthLayout title="Inicia sesión" subtitle="Accede a tu plan de nutrición personalizado">
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/generador" element={<PlanGeneratorPage />} />
          <Route path="/lista-compra" element={<ShoppingListPage />} />
          <Route path="/minutri-personal" element={<MiNutriPersonalPage />} />
          <Route path="/nutrichat" element={<NutriChatPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/suscripcion" element={<SubscriptionPage />} />
          <Route path="/planes" element={<SavedPlansPage />} />
          <Route path="/plan/:planId" element={<PlanDetailPage />} />
          <Route path="/fuentes-medicas" element={<MedicalSourcesPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/seguridad" element={<SecurityPage />} />
          <Route path="/legal" element={<LegalInfoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
