# 📍 Cómo Configurar la URL del Logo en el Email de Supabase

## 🔍 Dónde Está la URL del Logo

La URL del logo está en el template HTML en la **línea 34**:

```html
<img src="{{ .SiteURL }}/assets/logo-tastypath-preview.png" alt="TastyPath Logo" ... />
```

---

## ⚙️ Opción 1: Usar Variable de Supabase (Automático)

### ¿Qué es `{{ .SiteURL }}`?

`{{ .SiteURL }}` es una variable que Supabase reemplaza automáticamente con la **Site URL** configurada en tu proyecto.

### Cómo Configurarlo:

1. **Ve a Supabase Dashboard:**
   - https://app.supabase.com/
   - Selecciona tu proyecto: `zftqkqnjpjnmwfwsmxdy`

2. **Configura la Site URL:**
   - Ve a **Authentication** → **URL Configuration**
   - En el campo **"Site URL"**, pon la URL de tu aplicación:
     - Si está en Vercel: `https://tasty-path-web.vercel.app`
     - O tu URL de producción: `https://tu-dominio.com`

3. **En el template HTML:**
   - Deja `{{ .SiteURL }}/assets/logo-tastypath-preview.png` tal cual
   - Supabase lo reemplazará automáticamente por: `https://tu-url.com/assets/logo-tastypath-preview.png`

4. **Asegúrate de que el logo esté disponible:**
   - El logo debe estar en: `public/assets/logo-tastypath-preview.png`
   - O en tu sitio de Vercel en la ruta: `/assets/logo-tastypath-preview.png`

---

## 🌐 Opción 2: Usar URL Directa (Más Simple)

Si prefieres usar una URL directa sin variables:

### Paso 1: Obtener la URL Pública del Logo

Tienes dos opciones:

#### A) Usar la URL de Vercel (Recomendado)
Si tu app está desplegada en Vercel:
```
https://tasty-path-web.vercel.app/assets/logo-tastypath-preview.png
```

#### B) Usar un Servicio de Hosting de Imágenes
1. Sube el logo a [Imgur](https://imgur.com), [Cloudinary](https://cloudinary.com), o similar
2. Copia la URL directa del logo
3. Ejemplo: `https://i.imgur.com/tu-logo.png`

### Paso 2: Reemplazar en el Template

En el archivo `confirm_signup.html`, **línea 34**, reemplaza:

**ANTES:**
```html
<img src="{{ .SiteURL }}/assets/logo-tastypath-preview.png" ... />
```

**DESPUÉS (con URL de Vercel):**
```html
<img src="https://tasty-path-web.vercel.app/assets/logo-tastypath-preview.png" ... />
```

**O con URL de hosting de imágenes:**
```html
<img src="https://i.imgur.com/tu-logo.png" ... />
```

### Paso 3: Copiar al Template en Supabase

1. Edita el template en Supabase con la nueva URL
2. Guarda los cambios

---

## ✅ Recomendación

**Usa la Opción 2 (URL directa de Vercel)** porque:
- ✅ Es más simple y directa
- ✅ No depende de la configuración de Supabase
- ✅ Funciona inmediatamente
- ✅ Si cambias la Site URL en Supabase, el logo seguirá funcionando

**URL recomendada para usar:**
```
https://tasty-path-web.vercel.app/assets/logo-tastypath-preview.png
```

---

## 🔧 Pasos Rápidos (Recomendado)

1. **Edita el template** en Supabase (Authentication → Email Templates → Confirm signup)

2. **Busca esta línea:**
   ```html
   <img src="{{ .SiteURL }}/assets/logo-tastypath-preview.png"
   ```

3. **Reemplázala por:**
   ```html
   <img src="https://tasty-path-web.vercel.app/assets/logo-tastypath-preview.png"
   ```

4. **Guarda** los cambios

5. **Prueba** registrando un usuario nuevo y verifica que el logo se vea

---

## 🧪 Verificar que el Logo Funciona

Antes de configurarlo en el template, verifica que el logo sea accesible:

1. **Abre esta URL en tu navegador:**
   ```
   https://tasty-path-web.vercel.app/assets/logo-tastypath-preview.png
   ```

2. **Si ves el logo:**
   - ✅ Perfecto, esa URL funciona
   - Úsala en el template

3. **Si NO ves el logo:**
   - ❌ El logo no está en esa ruta
   - Verifica dónde está el logo en tu proyecto
   - O sube el logo a un hosting de imágenes

---

## 📝 Resumen

**En el template HTML (línea 34), tienes:**
```html
{{ .SiteURL }}/assets/logo-tastypath-preview.png
```

**Cámbialo por:**
```html
https://tasty-path-web.vercel.app/assets/logo-tastypath-preview.png
```

O usa la URL de tu hosting de imágenes si prefieres.

