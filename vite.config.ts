import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno con múltiples prefijos
  // Priorizar NEXT_PUBLIC_* (Vercel) sobre VITE_* (desarrollo local)
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  
  // Preparar variables para definir
  const defineVars = {};
  
  // Obtener valores (priorizar NEXT_PUBLIC_* sobre VITE_*)
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  
  // Exponer variables NEXT_PUBLIC_* primero
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    defineVars['import.meta.env.NEXT_PUBLIC_SUPABASE_URL'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL);
    // También exponer como VITE_* para compatibilidad
    defineVars['import.meta.env.VITE_SUPABASE_URL'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL);
  } else if (env.VITE_SUPABASE_URL) {
    defineVars['import.meta.env.VITE_SUPABASE_URL'] = JSON.stringify(env.VITE_SUPABASE_URL);
  }
  
  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    defineVars['import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    // También exponer como VITE_* para compatibilidad
    defineVars['import.meta.env.VITE_SUPABASE_ANON_KEY'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  } else if (env.VITE_SUPABASE_ANON_KEY) {
    defineVars['import.meta.env.VITE_SUPABASE_ANON_KEY'] = JSON.stringify(env.VITE_SUPABASE_ANON_KEY);
  }
  
  // También exponer como variables directas para acceso fácil
  if (supabaseUrl) {
    defineVars['import.meta.env.SUPABASE_URL'] = JSON.stringify(supabaseUrl);
  }
  if (supabaseAnonKey) {
    defineVars['import.meta.env.SUPABASE_ANON_KEY'] = JSON.stringify(supabaseAnonKey);
  }
  
  // Log durante build (solo en desarrollo)
  if (mode === 'development') {
    console.log('🔧 Vite Config - Variables de entorno cargadas:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗');
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗');
    console.log('  - VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? '✓' : '✗');
    console.log('  - VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗');
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
    // Exponer variables de entorno - Vite solo expone VITE_* por defecto
    // Usamos define para exponer NEXT_PUBLIC_* manualmente
    envPrefix: 'VITE_',
    // Definir variables para acceso en el código
    define: defineVars,
  };
});





