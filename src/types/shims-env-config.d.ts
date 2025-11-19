declare module '../../env.config' {
  export const ENV_CONFIG: {
    OPENAI_API_KEY: string;
    OPENAI_API_URL: string;
    OPENAI_MODEL: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    REVENUECAT_PUBLIC_KEY: string;
    APP_NAME: string;
    APP_VERSION: string;
  };
  export function getConfig(): typeof ENV_CONFIG;
}

declare module '../env.config' {
  export const ENV_CONFIG: {
    OPENAI_API_KEY: string;
    OPENAI_API_URL: string;
    OPENAI_MODEL: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    REVENUECAT_PUBLIC_KEY: string;
    APP_NAME: string;
    APP_VERSION: string;
  };
  export function getConfig(): typeof ENV_CONFIG;
}

declare module '../../../env.config' {
  export const ENV_CONFIG: {
    OPENAI_API_KEY: string;
    OPENAI_API_URL: string;
    OPENAI_MODEL: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    REVENUECAT_PUBLIC_KEY: string;
    APP_NAME: string;
    APP_VERSION: string;
  };
  export function getConfig(): typeof ENV_CONFIG;
}





