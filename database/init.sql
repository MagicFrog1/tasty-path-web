-- =====================================================
-- NUTRIQUICK DATABASE INITIALIZATION
-- =====================================================
-- Base de datos para la aplicación TastyPath
-- Incluye tablas para usuarios, planes semanales, recetas y listas de compras

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS nutriquick_db;
USE nutriquick_db;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    profile_image_url VARCHAR(500) NULL,
    preferences JSON NULL
);

-- =====================================================
-- TABLA DE PLANES SEMANALES
-- =====================================================
CREATE TABLE IF NOT EXISTS weekly_plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',
    total_meals INT DEFAULT 0,
    total_calories INT DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    nutrition_goals JSON NULL,
    progress JSON NULL,
    config JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_week_start (week_start)
);

-- =====================================================
-- TABLA DE COMIDAS
-- =====================================================
CREATE TABLE IF NOT EXISTS meals (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    calories INT DEFAULT 0,
    protein DECIMAL(5,2) DEFAULT 0.00,
    carbs DECIMAL(5,2) DEFAULT 0.00,
    fat DECIMAL(5,2) DEFAULT 0.00,
    fiber DECIMAL(5,2) DEFAULT 0.00,
    cooking_time INT DEFAULT 0,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    ingredients JSON NULL,
    instructions JSON NULL,
    image_url VARCHAR(500) NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plan_id) REFERENCES weekly_plans(id) ON DELETE CASCADE,
    INDEX idx_plan_id (plan_id),
    INDEX idx_day_meal_type (day_of_week, meal_type),
    INDEX idx_is_completed (is_completed)
);

-- =====================================================
-- TABLA DE RECETAS
-- =====================================================
CREATE TABLE IF NOT EXISTS recipes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) NULL,
    cuisine VARCHAR(100) NULL,
    prep_time INT DEFAULT 0,
    cook_time INT DEFAULT 0,
    servings INT DEFAULT 1,
    calories_per_serving INT DEFAULT 0,
    protein_per_serving DECIMAL(5,2) DEFAULT 0.00,
    carbs_per_serving DECIMAL(5,2) DEFAULT 0.00,
    fat_per_serving DECIMAL(5,2) DEFAULT 0.00,
    fiber_per_serving DECIMAL(5,2) DEFAULT 0.00,
    ingredients JSON NOT NULL,
    instructions JSON NOT NULL,
    tips TEXT NULL,
    image_url VARCHAR(500) NULL,
    tags JSON NULL,
    is_public BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_cuisine (cuisine),
    INDEX idx_is_public (is_public),
    INDEX idx_rating (rating)
);

-- =====================================================
-- TABLA DE LISTA DE COMPRAS
-- =====================================================
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    estimated_price DECIMAL(10,2) DEFAULT 0.00,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_checked BOOLEAN DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES weekly_plans(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_category (category),
    INDEX idx_is_checked (is_checked),
    INDEX idx_priority (priority)
);

-- =====================================================
-- TABLA DE INGREDIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS ingredients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    calories_per_100g INT DEFAULT 0,
    protein_per_100g DECIMAL(5,2) DEFAULT 0.00,
    carbs_per_100g DECIMAL(5,2) DEFAULT 0.00,
    fat_per_100g DECIMAL(5,2) DEFAULT 0.00,
    fiber_per_100g DECIMAL(5,2) DEFAULT 0.00,
    common_units JSON NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_category (category)
);

-- =====================================================
-- TABLA DE PREFERENCIAS DIETÉTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS dietary_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    preference_type ENUM('allergy', 'intolerance', 'restriction', 'preference') NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    severity ENUM('mild', 'moderate', 'severe') DEFAULT 'moderate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_preference_type (preference_type)
);

-- =====================================================
-- TABLA DE OBJETIVOS NUTRICIONALES
-- =====================================================
CREATE TABLE IF NOT EXISTS nutrition_goals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    goal_type ENUM('weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'performance') NOT NULL,
    target_weight DECIMAL(5,2) NULL,
    current_weight DECIMAL(5,2) NULL,
    target_calories INT NULL,
    target_protein DECIMAL(5,2) NULL,
    target_carbs DECIMAL(5,2) NULL,
    target_fat DECIMAL(5,2) NULL,
    target_fiber DECIMAL(5,2) NULL,
    activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') DEFAULT 'moderately_active',
    start_date DATE NOT NULL,
    target_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_goal_type (goal_type),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- TABLA DE SEGUIMIENTO DE PROGRESO
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_tracking (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    weight DECIMAL(5,2) NULL,
    body_fat_percentage DECIMAL(4,2) NULL,
    measurements JSON NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date)
);

-- =====================================================
-- INSERCIÓN DE DATOS INICIALES
-- =====================================================

-- Insertar ingredientes básicos
INSERT INTO ingredients (id, name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, common_units) VALUES
('ing-001', 'Pollo', 'Proteínas', 165, 31.0, 0.0, 3.6, 0.0, '["g", "kg", "oz", "lb"]'),
('ing-002', 'Arroz Integral', 'Carbohidratos', 111, 2.6, 23.0, 0.9, 1.8, '["g", "kg", "taza", "cucharada"]'),
('ing-003', 'Brócoli', 'Verduras', 34, 2.8, 7.0, 0.4, 2.6, '["g", "kg", "taza", "pieza"]'),
('ing-004', 'Salmón', 'Proteínas', 208, 25.0, 0.0, 12.0, 0.0, '["g", "kg", "oz", "filete"]'),
('ing-005', 'Quinoa', 'Carbohidratos', 120, 4.4, 22.0, 1.9, 2.8, '["g", "kg", "taza", "cucharada"]'),
('ing-006', 'Espinacas', 'Verduras', 23, 2.9, 3.6, 0.4, 2.2, '["g", "kg", "taza", "manojo"]'),
('ing-007', 'Huevos', 'Proteínas', 155, 13.0, 1.1, 11.0, 0.0, '["unidad", "docena", "g"]'),
('ing-008', 'Aguacate', 'Grasas', 160, 2.0, 9.0, 15.0, 7.0, '["unidad", "g", "taza"]'),
('ing-009', 'Almendras', 'Frutos Secos', 579, 21.0, 22.0, 50.0, 12.5, '["g", "kg", "taza", "puñado"]'),
('ing-010', 'Plátano', 'Frutas', 89, 1.1, 23.0, 0.3, 2.6, '["unidad", "g", "kg"]');

-- Insertar recetas de ejemplo
INSERT INTO recipes (id, name, description, category, cuisine, prep_time, cook_time, servings, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, fiber_per_serving, ingredients, instructions, tips, tags) VALUES
('rec-001', 'Pollo a la Plancha con Arroz Integral', 'Pechuga de pollo a la plancha con arroz integral y brócoli al vapor', 'Plato Principal', 'Mediterránea', 15, 25, 2, 450, 35.0, 45.0, 12.0, 8.0, 
'[{"ingredient": "Pollo", "quantity": 200, "unit": "g"}, {"ingredient": "Arroz Integral", "quantity": 100, "unit": "g"}, {"ingredient": "Brócoli", "quantity": 150, "unit": "g"}, {"ingredient": "Aceite de Oliva", "quantity": 15, "unit": "ml"}]',
'[{"step": 1, "instruction": "Cocinar el arroz integral según las instrucciones del paquete"}, {"step": 2, "instruction": "Cocinar el brócoli al vapor durante 5-7 minutos"}, {"step": 3, "instruction": "Sazonar el pollo con sal y pimienta"}, {"step": 4, "instruction": "Cocinar el pollo a la plancha durante 6-8 minutos por lado"}]',
'Para un pollo más jugoso, déjalo reposar 5 minutos antes de cortarlo', '["saludable", "proteína", "bajo en grasa"]'),

('rec-002', 'Ensalada de Quinoa con Salmón', 'Ensalada nutritiva de quinoa con salmón ahumado y verduras frescas', 'Ensalada', 'Fusión', 20, 15, 2, 380, 28.0, 35.0, 18.0, 6.0,
'[{"ingredient": "Quinoa", "quantity": 80, "unit": "g"}, {"ingredient": "Salmón", "quantity": 120, "unit": "g"}, {"ingredient": "Espinacas", "quantity": 100, "unit": "g"}, {"ingredient": "Aguacate", "quantity": 60, "unit": "g"}]',
'[{"step": 1, "instruction": "Cocinar la quinoa según las instrucciones del paquete"}, {"step": 2, "instruction": "Mezclar la quinoa cocida con las espinacas"}, {"step": 3, "instruction": "Agregar el salmón desmenuzado y el aguacate"}, {"step": 4, "instruction": "Aliñar con limón, aceite de oliva y sal"}]',
'Puedes preparar la quinoa con anticipación y refrigerarla', '["saludable", "omega-3", "proteína completa"]'),

('rec-003', 'Bowl de Desayuno Saludable', 'Bowl nutritivo con avena, frutas y frutos secos', 'Desayuno', 'Internacional', 10, 5, 1, 320, 12.0, 45.0, 14.0, 8.0,
'[{"ingredient": "Avena", "quantity": 50, "unit": "g"}, {"ingredient": "Plátano", "quantity": 100, "unit": "g"}, {"ingredient": "Almendras", "quantity": 30, "unit": "g"}, {"ingredient": "Leche de Almendras", "quantity": 120, "unit": "ml"}]',
'[{"step": 1, "instruction": "Cocinar la avena con leche de almendras"}, {"step": 2, "instruction": "Cortar el plátano en rodajas"}, {"step": 3, "instruction": "Servir la avena en un bowl"}, {"step": 4, "instruction": "Decorar con plátano y almendras picadas"}]',
'Puedes agregar miel o sirope de arce para endulzar', '["desayuno", "energético", "fibra"]');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para planes semanales con información del usuario
CREATE VIEW weekly_plans_with_user AS
SELECT 
    wp.*,
    u.name as user_name,
    u.email as user_email
FROM weekly_plans wp
JOIN users u ON wp.user_id = u.id;

-- Vista para comidas con información nutricional completa
CREATE VIEW meals_with_nutrition AS
SELECT 
    m.*,
    wp.name as plan_name,
    wp.user_id
FROM meals m
JOIN weekly_plans wp ON m.plan_id = wp.id;

-- Vista para lista de compras consolidada
CREATE VIEW consolidated_shopping_list AS
SELECT 
    sli.*,
    u.name as user_name,
    wp.name as plan_name
FROM shopping_list_items sli
JOIN users u ON sli.user_id = u.id
LEFT JOIN weekly_plans wp ON sli.plan_id = wp.id;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER //

-- Procedimiento para crear un plan semanal completo
CREATE PROCEDURE CreateWeeklyPlan(
    IN p_user_id VARCHAR(36),
    IN p_plan_name VARCHAR(255),
    IN p_week_start DATE,
    IN p_week_end DATE,
    IN p_description TEXT
)
BEGIN
    DECLARE plan_id VARCHAR(36);
    
    -- Generar ID único
    SET plan_id = UUID();
    
    -- Insertar el plan
    INSERT INTO weekly_plans (id, user_id, name, description, week_start, week_end)
    VALUES (plan_id, p_user_id, p_plan_name, p_description, p_week_start, p_week_end);
    
    -- Retornar el ID del plan creado
    SELECT plan_id as new_plan_id;
END //

-- Procedimiento para calcular estadísticas nutricionales de un plan
CREATE PROCEDURE CalculatePlanNutrition(
    IN p_plan_id VARCHAR(36)
)
BEGIN
    SELECT 
        wp.name as plan_name,
        COUNT(m.id) as total_meals,
        SUM(m.calories) as total_calories,
        AVG(m.calories) as avg_calories_per_meal,
        SUM(m.protein) as total_protein,
        SUM(m.carbs) as total_carbs,
        SUM(m.fat) as total_fat,
        SUM(m.fiber) as total_fiber
    FROM weekly_plans wp
    LEFT JOIN meals m ON wp.id = m.plan_id
    WHERE wp.id = p_plan_id
    GROUP BY wp.id, wp.name;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar el timestamp de actualización
DELIMITER //
CREATE TRIGGER update_weekly_plans_timestamp
BEFORE UPDATE ON weekly_plans
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

CREATE TRIGGER update_meals_timestamp
BEFORE UPDATE ON meals
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

CREATE TRIGGER update_recipes_timestamp
BEFORE UPDATE ON recipes
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_meals_plan_day_type ON meals(plan_id, day_of_week, meal_type);
CREATE INDEX idx_shopping_user_plan ON shopping_list_items(user_id, plan_id, is_checked);
CREATE INDEX idx_recipes_category_rating ON recipes(category, rating, is_public);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
/*
Esta base de datos está diseñada para la aplicación TastyPath y proporciona:

1. Gestión completa de usuarios y perfiles
2. Planificación semanal de comidas
3. Sistema de recetas con información nutricional
4. Listas de compras inteligentes
5. Seguimiento de progreso y objetivos
6. Sistema de suscripciones premium
7. Optimización para consultas frecuentes

Para usar esta base de datos:
1. Ejecutar este script completo
2. Configurar las credenciales de conexión en la aplicación
3. La aplicación se encargará de crear usuarios y datos automáticamente

Nota: Esta es una base de datos de ejemplo. Para producción, considerar:
- Encriptación de contraseñas
- Backup automático
- Monitoreo de rendimiento
- Seguridad adicional
*/
