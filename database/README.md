# 🗄️ Base de Datos TastyPath

Esta carpeta contiene la configuración y estructura de la base de datos para la aplicación TastyPath.

## 📋 Contenido

- **`init.sql`** - Script de inicialización de la base de datos
- **`README.md`** - Este archivo de documentación
- **`schema.sql`** - Esquema simplificado de la base de datos

## 🚀 Configuración Inicial

### 1. Requisitos Previos

- MySQL 8.0+ o MariaDB 10.5+
- Usuario con permisos de administrador de base de datos
- Acceso a línea de comandos o cliente MySQL

### 2. Instalación

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de inicialización
source /ruta/a/tu/proyecto/database/init.sql;
```

### 3. Verificación

```sql
-- Verificar que la base de datos se creó
SHOW DATABASES;

-- Usar la base de datos
USE nutriquick_db;

-- Verificar las tablas creadas
SHOW TABLES;

-- Verificar los datos de ejemplo
SELECT * FROM ingredients LIMIT 5;
SELECT * FROM recipes LIMIT 3;
```

## 🏗️ Estructura de la Base de Datos

### Tablas Principales

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| `users` | Usuarios de la aplicación | - |
| `weekly_plans` | Planes semanales de comidas | - |
| `meals` | Comidas individuales | - |
| `recipes` | Recetas disponibles | 3 (ejemplo) |
| `shopping_list_items` | Lista de compras | - |
| `ingredients` | Ingredientes base | 10 (ejemplo) |

### Relaciones Clave

```
users (1) ←→ (N) weekly_plans
weekly_plans (1) ←→ (N) meals
weekly_plans (1) ←→ (N) shopping_list_items
users (1) ←→ (N) recipes
```

## 🔧 Configuración de la Aplicación

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nutriquick_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# Configuración de la App
NODE_ENV=development
PORT=3000
```

### Conexión en la Aplicación

La aplicación se conectará automáticamente a la base de datos usando las credenciales configuradas.

## 📊 Datos de Ejemplo Incluidos

### Ingredientes (10)
- Proteínas: Pollo, Salmón, Huevos
- Carbohidratos: Arroz Integral, Quinoa
- Verduras: Brócoli, Espinacas
- Frutas: Plátano
- Grasas: Aguacate
- Frutos Secos: Almendras

### Recetas (3)
1. **Pollo a la Plancha con Arroz Integral**
   - 450 calorías por porción
   - 35g de proteína
   - Tiempo de cocción: 25 min

2. **Ensalada de Quinoa con Salmón**
   - 380 calorías por porción
   - 28g de proteína
   - Tiempo de preparación: 20 min

3. **Bowl de Desayuno Saludable**
   - 320 calorías por porción
   - 12g de proteína
   - Tiempo de preparación: 10 min

## 🛠️ Mantenimiento

### Backup

```bash
# Crear backup completo
mysqldump -u root -p nutriquick_db > backup_nutriquick_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root -p nutriquick_db < backup_nutriquick_20241201.sql
```

### Limpieza

```sql
-- Limpiar datos de prueba (cuidado en producción)
DELETE FROM shopping_list_items WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM meals WHERE plan_id NOT IN (SELECT id FROM weekly_plans);
```

## 🔍 Consultas Útiles

### Estadísticas de Usuarios

```sql
-- Usuarios con planes activos
SELECT 
    u.name,
    COUNT(wp.id) as total_plans,
    SUM(CASE WHEN wp.status = 'active' THEN 1 ELSE 0 END) as active_plans
FROM users u
LEFT JOIN weekly_plans wp ON u.id = wp.user_id
GROUP BY u.id, u.name;
```

### Planes por Semana

```sql
-- Planes de la semana actual
SELECT 
    wp.name,
    wp.week_start,
    wp.week_end,
    COUNT(m.id) as total_meals
FROM weekly_plans wp
LEFT JOIN meals m ON wp.id = m.plan_id
WHERE wp.week_start >= CURDATE()
GROUP BY wp.id, wp.name, wp.week_start, wp.week_end;
```

### Lista de Compras Consolidada

```sql
-- Todos los items de compra de un usuario
SELECT 
    sli.name,
    sli.category,
    sli.quantity,
    sli.unit,
    sli.is_checked
FROM shopping_list_items sli
WHERE sli.user_id = 'ID_DEL_USUARIO'
ORDER BY sli.category, sli.priority DESC;
```

## 🚨 Solución de Problemas

### Error de Conexión

```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql

# Verificar permisos del usuario
mysql -u root -p
GRANT ALL PRIVILEGES ON nutriquick_db.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### Error de Permisos

```sql
-- Verificar permisos del usuario actual
SHOW GRANTS FOR CURRENT_USER();

-- Otorgar permisos necesarios
GRANT SELECT, INSERT, UPDATE, DELETE ON nutriquick_db.* TO 'tu_usuario'@'localhost';
```

## 📚 Recursos Adicionales

- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [Guía de React Native con Base de Datos](https://reactnative.dev/docs/asyncstorage)
- [Mejores Prácticas de Base de Datos](https://www.mysql.com/why-mysql/white-papers/)

## 🤝 Contribución

Para contribuir a la base de datos:

1. Crear una rama para tu feature
2. Modificar los archivos SQL necesarios
3. Actualizar este README si es necesario
4. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Nota**: Esta base de datos está diseñada para desarrollo y pruebas. Para producción, considerar implementar medidas de seguridad adicionales como encriptación, backup automático y monitoreo de rendimiento.
