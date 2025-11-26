# Instrucciones para Configurar el Email de Confirmación en Supabase

## 📧 Template de Email de Confirmación

Este directorio contiene los templates para el email de confirmación de registro en Supabase.

---

## 📁 Archivos Incluidos

1. **`confirm_signup.html`** - Template HTML con diseño profesional y responsivo
2. **`confirm_signup_plain.txt`** - Versión en texto plano (fallback)
3. **`INSTRUCCIONES_EMAIL.md`** - Este archivo con instrucciones

---

## 🚀 Cómo Configurar en Supabase

### Paso 1: Acceder a Supabase Dashboard

1. Ve a tu proyecto en Supabase: https://app.supabase.com/
2. Selecciona tu proyecto: `zftqkqnjpjnmwfwsmxdy`
3. Ve a **Authentication** → **Email Templates**

### Paso 2: Configurar el Template de Confirmación

1. En el menú de templates, selecciona **"Confirm signup"**
2. Copia el contenido completo del archivo `confirm_signup.html`
3. Pégalo en el editor de Supabase
4. Guarda los cambios

### Paso 3: Configurar el Logo (Importante)

El template usa esta URL para el logo:
```
{{ .SiteURL }}/assets/logo-tastypath-preview.png
```

**Opciones para el logo:**

#### Opción A: Usar URL pública (Recomendado)
1. Sube tu logo a un servicio de hosting de imágenes (Imgur, Cloudinary, etc.)
2. O despliega el logo en tu sitio web de Vercel
3. Reemplaza la URL en el template con la URL pública del logo
4. Ejemplo: `https://tasty-path-web.vercel.app/assets/logo-tastypath-preview.png`

#### Opción B: Usar variable de Supabase
- El template usa `{{ .SiteURL }}` que Supabase reemplaza automáticamente con la URL de tu proyecto
- Asegúrate de que el logo esté disponible en esa ruta

### Paso 4: Configurar Texto Plano (Opcional)

1. En Supabase, también puedes configurar una versión en texto plano
2. Copia el contenido de `confirm_signup_plain.txt`
3. Pégalo en el campo de texto plano (si está disponible)

---

## 🎨 Personalización del Template

### Colores Principales

El template usa un gradiente púrpura profesional:
- **Primario:** `#667eea` (Azul púrpura)
- **Secundario:** `#764ba2` (Púrpura oscuro)
- **Fondo:** `#f5f5f5` (Gris claro)
- **Texto:** `#333333` (Gris oscuro)

### Variables Disponibles de Supabase

- `{{ .SiteURL }}` - URL de tu sitio web
- `{{ .Email }}` - Email del usuario
- `{{ .ConfirmationURL }}` - URL de confirmación con token
- `{{ .Token }}` - Token de confirmación (si lo necesitas)

### Modificar Colores

Para cambiar los colores, busca y reemplaza:
- `#667eea` - Color primario (botones, enlaces)
- `#764ba2` - Color secundario (gradiente)
- `#f5f5f5` - Fondo del email
- `#ffffff` - Fondo del contenido

---

## ✅ Verificar que Funciona

1. **Registra un nuevo usuario** en tu aplicación
2. **Revisa el correo** en la bandeja de entrada (también en spam)
3. **Verifica que:**
   - El logo se muestra correctamente
   - El botón de confirmación funciona
   - El diseño se ve bien en móvil y desktop
   - Los colores y estilos son correctos

---

## 🐛 Solución de Problemas

### El logo no se muestra
- Verifica que la URL del logo sea accesible públicamente
- Prueba abrir la URL del logo directamente en el navegador
- Considera usar un servicio de hosting de imágenes como Imgur o Cloudinary

### El email se ve mal en algunos clientes
- El template usa estilos inline para máxima compatibilidad
- Gmail, Outlook, Apple Mail, etc. deberían renderizarlo correctamente
- Si hay problemas específicos, ajusta los estilos inline

### El botón no funciona
- Verifica que `{{ .ConfirmationURL }}` esté presente en el template
- Supabase reemplaza automáticamente esta variable
- Prueba copiar el enlace alternativo si el botón no funciona

---

## 📝 Notas Importantes

1. **No modifiques las variables** `{{ .Variable }}` - Supabase las reemplaza automáticamente
2. **Mantén los estilos inline** - Muchos clientes de email no soportan CSS externo
3. **Prueba en múltiples clientes** - Gmail, Outlook, Apple Mail, etc.
4. **Verifica en móvil** - Muchos usuarios leen emails en sus teléfonos

---

## 🎯 Próximos Pasos

Después de configurar este template, considera crear templates para:
- Recuperación de contraseña
- Cambio de email
- Invitaciones
- Notificaciones

---

## 📞 Soporte

Si tienes problemas configurando el template:
- Email: tastypathhelp@gmail.com
- Verifica la documentación de Supabase: https://supabase.com/docs/guides/auth/auth-email-templates

