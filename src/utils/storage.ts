export const storage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const value = window.localStorage.getItem(key);
      if (!value) return defaultValue;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error leyendo la clave ${key} de localStorage`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error guardando la clave ${key} en localStorage`, error);
    }
  },

  remove(key: string) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error eliminando la clave ${key} de localStorage`, error);
    }
  },
};





