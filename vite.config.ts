import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno con múltiples prefijos
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  
  // Preparar variables para definir
  const defineVars = {};
  
  // Exponer variables NEXT_PUBLIC_* como VITE_* también para compatibilidad
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    defineVars['import.meta.env.NEXT_PUBLIC_SUPABASE_URL'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL);
    defineVars['import.meta.env.VITE_SUPABASE_URL'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL);
  }
  
  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    defineVars['import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    defineVars['import.meta.env.VITE_SUPABASE_ANON_KEY'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  
  // También exponer como variables directas para acceso fácil
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    defineVars['import.meta.env.SUPABASE_URL'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL);
  }
  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    defineVars['import.meta.env.SUPABASE_ANON_KEY'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    // Exponer variables de entorno con prefijos VITE_ y NEXT_PUBLIC_
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    // Definir variables para acceso en el código
    define: defineVars,
  };
});





