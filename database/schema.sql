-- =====================================================
-- ESQUEMA SIMPLIFICADO - NUTRIQUICK DATABASE
-- =====================================================
-- Este archivo muestra la estructura básica de las tablas
-- Para la implementación completa, usar init.sql

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE PLANES SEMANALES
-- =====================================================
CREATE TABLE weekly_plans (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA DE COMIDAS
-- =====================================================
CREATE TABLE meals (
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
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plan_id) REFERENCES weekly_plans(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA DE RECETAS
-- =====================================================
CREATE TABLE recipes (
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
    tags JSON NULL,
    is_public BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA DE LISTA DE COMPRAS
-- =====================================================
CREATE TABLE shopping_list_items (
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
    FOREIGN KEY (plan_id) REFERENCES weekly_plans(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA DE INGREDIENTES
-- =====================================================
CREATE TABLE ingredients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    calories_per_100g INT DEFAULT 0,
    protein_per_100g DECIMAL(5,2) DEFAULT 0.00,
    carbs_per_100g DECIMAL(5,2) DEFAULT 0.00,
    fat_per_100g DECIMAL(5,2) DEFAULT 0.00,
    fiber_per_100g DECIMAL(5,2) DEFAULT 0.00,
    common_units JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES BÁSICOS
-- =====================================================

-- Índices para usuarios
CREATE INDEX idx_users_email ON users(email);

-- Índices para planes semanales
CREATE INDEX idx_weekly_plans_user_id ON weekly_plans(user_id);
CREATE INDEX idx_weekly_plans_status ON weekly_plans(status);
CREATE INDEX idx_weekly_plans_week_start ON weekly_plans(week_start);

-- Índices para comidas
CREATE INDEX idx_meals_plan_id ON meals(plan_id);
CREATE INDEX idx_meals_day_type ON meals(day_of_week, meal_type);
CREATE INDEX idx_meals_completed ON meals(is_completed);

-- Índices para recetas
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_public ON recipes(is_public);

-- Índices para lista de compras
CREATE INDEX idx_shopping_user_id ON shopping_list_items(user_id);
CREATE INDEX idx_shopping_plan_id ON shopping_list_items(plan_id);
CREATE INDEX idx_shopping_category ON shopping_list_items(category);
CREATE INDEX idx_shopping_checked ON shopping_list_items(is_checked);

-- Índices para ingredientes
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);

-- =====================================================
-- RELACIONES CLAVE
-- =====================================================
/*
users (1) ←→ (N) weekly_plans
weekly_plans (1) ←→ (N) meals
weekly_plans (1) ←→ (N) shopping_list_items
users (1) ←→ (N) recipes
users (1) ←→ (N) shopping_list_items
*/

-- =====================================================
-- COMENTARIOS
-- =====================================================
/*
Este esquema simplificado incluye:

✅ Tablas principales para funcionalidad básica
✅ Relaciones entre tablas con claves foráneas
✅ Índices para optimizar consultas frecuentes
✅ Campos JSON para flexibilidad en datos
✅ Timestamps automáticos para auditoría

Para implementación completa con:
- Datos de ejemplo
- Procedimientos almacenados
- Triggers automáticos
- Vistas útiles
- Políticas de seguridad

Usar el archivo: init.sql
*/
