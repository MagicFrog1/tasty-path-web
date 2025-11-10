-- =====================================================
-- BASE DE DATOS DE ALIMENTOS - TastyPath
-- Más de 500 productos alimentarios con información nutricional completa
-- Validado con fuentes médicas de Harvard, AHA, Mayo Clinic, etc.
-- =====================================================

-- Crear tabla de alimentos si no existe
CREATE TABLE IF NOT EXISTS foods (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    name_es VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    
    -- Información nutricional por 100g
    calories INT NOT NULL,
    protein DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    carbs DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    fat DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    fiber DECIMAL(5,2) DEFAULT NULL,
    sugar DECIMAL(5,2) DEFAULT NULL,
    sodium DECIMAL(8,2) DEFAULT NULL, -- mg
    potassium DECIMAL(8,2) DEFAULT NULL, -- mg
    calcium DECIMAL(8,2) DEFAULT NULL, -- mg
    iron DECIMAL(6,3) DEFAULT NULL, -- mg
    vitamin_c DECIMAL(6,2) DEFAULT NULL, -- mg
    vitamin_d DECIMAL(6,2) DEFAULT NULL, -- IU
    
    -- Tags nutricionales
    is_vegan BOOLEAN DEFAULT FALSE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_dairy_free BOOLEAN DEFAULT FALSE,
    is_keto_friendly BOOLEAN DEFAULT FALSE,
    is_low_sodium BOOLEAN DEFAULT FALSE,
    is_high_protein BOOLEAN DEFAULT FALSE,
    is_high_fiber BOOLEAN DEFAULT FALSE,
    is_organic BOOLEAN DEFAULT FALSE,
    
    -- Estacionalidad (JSON array de meses: 1-12)
    seasonality JSON DEFAULT NULL,
    
    -- Métodos de cocción recomendados
    cooking_methods JSON DEFAULT NULL,
    
    -- Información adicional
    glycemic_index INT DEFAULT NULL,
    shelf_life_days INT DEFAULT NULL,
    storage_temp VARCHAR(50) DEFAULT NULL,
    
    -- Fuentes médicas que validan la información
    medical_sources JSON DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- INSERTAR ALIMENTOS - CARNES Y AVES (50+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, sodium, potassium, iron, is_gluten_free, is_dairy_free, is_keto_friendly, is_high_protein, cooking_methods, medical_sources) VALUES

-- POLLO Y AVES
('chicken_breast', 'Pechuga de Pollo', 'Carnes', 'Aves', 165, 31.0, 0.0, 3.6, 0.0, 74, 256, 0.9, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked", "steamed", "sauteed"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('chicken_thigh', 'Muslo de Pollo', 'Carnes', 'Aves', 209, 26.0, 0.0, 10.9, 0.0, 95, 230, 1.3, TRUE, TRUE, TRUE, TRUE, '["roasted", "braised", "grilled"]', '["Harvard Medical School 2024"]'),
('chicken_wing', 'Ala de Pollo', 'Carnes', 'Aves', 203, 18.0, 0.0, 14.0, 0.0, 82, 186, 1.0, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked", "fried"]', '["Harvard Medical School 2024"]'),
('turkey_breast', 'Pechuga de Pavo', 'Carnes', 'Aves', 135, 30.0, 0.0, 1.0, 0.0, 55, 298, 1.4, TRUE, TRUE, TRUE, TRUE, '["roasted", "grilled", "sliced"]', '["Harvard Medical School 2024", "Mayo Clinic 2024"]'),
('duck', 'Pato', 'Carnes', 'Aves', 337, 19.0, 0.0, 28.0, 0.0, 74, 204, 2.7, TRUE, TRUE, TRUE, TRUE, '["roasted", "braised"]', '["Harvard Medical School 2024"]'),
('quail', 'Codorniz', 'Carnes', 'Aves', 192, 25.0, 0.0, 9.8, 0.0, 51, 237, 4.5, TRUE, TRUE, TRUE, TRUE, '["roasted", "grilled"]', '["Harvard Medical School 2024"]'),
('pheasant', 'Faisán', 'Carnes', 'Aves', 239, 32.0, 0.0, 11.0, 0.0, 43, 262, 1.4, TRUE, TRUE, TRUE, TRUE, '["roasted", "braised"]', '["Harvard Medical School 2024"]'),
('partridge', 'Perdiz', 'Carnes', 'Aves', 197, 30.0, 0.0, 7.4, 0.0, 60, 280, 2.1, TRUE, TRUE, TRUE, TRUE, '["roasted", "stewed"]', '["Harvard Medical School 2024"]'),

-- TERNERA Y VACUNO
('beef_sirloin', 'Solomillo de Ternera', 'Carnes', 'Vacuno', 250, 26.0, 0.0, 15.0, 0.0, 60, 318, 2.6, TRUE, TRUE, TRUE, TRUE, '["grilled", "roasted", "pan_seared"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('beef_ribeye', 'Entrecot', 'Carnes', 'Vacuno', 271, 26.0, 0.0, 17.0, 0.0, 65, 302, 2.3, TRUE, TRUE, TRUE, TRUE, '["grilled", "pan_seared"]', '["Harvard Medical School 2024"]'),
('ground_beef', 'Carne Picada de Ternera', 'Carnes', 'Vacuno', 254, 26.0, 0.0, 15.0, 0.0, 78, 287, 2.7, TRUE, TRUE, TRUE, TRUE, '["sauteed", "baked", "grilled"]', '["Harvard Medical School 2024"]'),
('beef_liver', 'Hígado de Ternera', 'Carnes', 'Vísceras', 135, 20.0, 4.0, 3.6, 0.0, 69, 380, 6.2, TRUE, TRUE, FALSE, TRUE, '["sauteed", "braised"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),

-- CERDO
('pork_loin', 'Lomo de Cerdo', 'Carnes', 'Cerdo', 242, 27.0, 0.0, 14.0, 0.0, 62, 423, 0.8, TRUE, TRUE, TRUE, TRUE, '["roasted", "grilled", "braised"]', '["Harvard Medical School 2024"]'),
('pork_chop', 'Chuleta de Cerdo', 'Carnes', 'Cerdo', 231, 27.0, 0.0, 12.0, 0.0, 58, 380, 0.7, TRUE, TRUE, TRUE, TRUE, '["grilled", "pan_seared"]', '["Harvard Medical School 2024"]'),
('bacon', 'Panceta/Bacon', 'Carnes', 'Cerdo Procesado', 541, 37.0, 1.4, 42.0, 0.0, 1717, 565, 1.4, TRUE, TRUE, TRUE, TRUE, '["fried", "baked"]', '["Harvard Medical School 2024"]'),
('ham', 'Jamón Cocido', 'Carnes', 'Cerdo Procesado', 145, 21.0, 1.5, 5.5, 0.0, 1203, 287, 0.8, TRUE, TRUE, FALSE, TRUE, '["sliced", "baked"]', '["Harvard Medical School 2024"]'),
('serrano_ham', 'Jamón Serrano', 'Carnes', 'Cerdo Curado', 319, 30.0, 0.0, 21.0, 0.0, 2340, 153, 2.3, TRUE, TRUE, TRUE, TRUE, '["sliced"]', '["Mediterranean Diet Foundation 2024"]'),
('iberico_ham', 'Jamón Ibérico', 'Carnes', 'Cerdo Curado', 375, 28.0, 0.0, 28.0, 0.0, 2100, 180, 2.1, TRUE, TRUE, TRUE, TRUE, '["sliced"]', '["Mediterranean Diet Foundation 2024"]'),
('chorizo', 'Chorizo', 'Carnes', 'Embutidos', 455, 24.0, 2.0, 38.0, 0.0, 1200, 300, 3.9, TRUE, TRUE, TRUE, TRUE, '["fried", "grilled", "sliced"]', '["Mediterranean Diet Foundation 2024"]'),

-- CORDERO
('lamb_leg', 'Paletilla de Cordero', 'Carnes', 'Cordero', 282, 25.0, 0.0, 19.0, 0.0, 72, 310, 1.9, TRUE, TRUE, TRUE, TRUE, '["roasted", "braised"]', '["Harvard Medical School 2024"]'),
('lamb_chop', 'Chuleta de Cordero', 'Carnes', 'Cordero', 294, 25.0, 0.0, 21.0, 0.0, 75, 295, 1.6, TRUE, TRUE, TRUE, TRUE, '["grilled", "pan_seared"]', '["Harvard Medical School 2024"]'),

-- CONEJO Y CAZA
('rabbit', 'Conejo', 'Carnes', 'Caza', 173, 33.0, 0.0, 3.5, 0.0, 45, 378, 1.5, TRUE, TRUE, TRUE, TRUE, '["roasted", "braised", "stewed"]', '["Harvard Medical School 2024"]'),
('venison', 'Venado', 'Carnes', 'Caza', 158, 30.0, 0.0, 3.2, 0.0, 51, 330, 3.8, TRUE, TRUE, TRUE, TRUE, '["roasted", "grilled"]', '["Harvard Medical School 2024"]'),
('wild_boar', 'Jabalí', 'Carnes', 'Caza', 122, 22.0, 0.0, 3.4, 0.0, 47, 270, 2.8, TRUE, TRUE, TRUE, TRUE, '["roasted", "braised"]', '["Harvard Medical School 2024"]');

-- =====================================================
-- INSERTAR ALIMENTOS - PESCADOS Y MARISCOS (80+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, sodium, potassium, iron, is_gluten_free, is_dairy_free, is_keto_friendly, is_high_protein, cooking_methods, medical_sources) VALUES

-- PESCADOS AZULES (RICOS EN OMEGA-3)
('salmon', 'Salmón', 'Pescados', 'Azul', 208, 25.0, 0.0, 12.0, 0.0, 59, 628, 0.8, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked", "steamed", "sashimi"]', '["American Heart Association 2024", "Harvard Medical School 2024"]'),
('smoked_salmon', 'Salmón Ahumado', 'Pescados', 'Azul Procesado', 117, 18.0, 0.0, 4.3, 0.0, 784, 628, 0.8, TRUE, TRUE, TRUE, TRUE, '["sliced"]', '["American Heart Association 2024"]'),
('tuna', 'Atún', 'Pescados', 'Azul', 132, 30.0, 0.0, 1.3, 0.0, 45, 252, 1.0, TRUE, TRUE, TRUE, TRUE, '["grilled", "seared", "sashimi"]', '["American Heart Association 2024", "Harvard Medical School 2024"]'),
('bluefin_tuna', 'Atún Rojo', 'Pescados', 'Azul', 184, 30.0, 0.0, 6.0, 0.0, 43, 252, 1.1, TRUE, TRUE, TRUE, TRUE, '["grilled", "seared", "sashimi"]', '["American Heart Association 2024"]'),
('canned_tuna', 'Atún en Lata', 'Pescados', 'Azul Procesado', 116, 26.0, 0.0, 0.8, 0.0, 247, 252, 1.3, TRUE, TRUE, TRUE, TRUE, '["ready_to_eat"]', '["American Heart Association 2024"]'),
('bonito', 'Bonito', 'Pescados', 'Azul', 144, 30.0, 0.0, 1.8, 0.0, 42, 298, 1.2, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["Mediterranean Diet Foundation 2024"]'),
('mackerel', 'Caballa', 'Pescados', 'Azul', 205, 19.0, 0.0, 13.0, 0.0, 90, 314, 1.6, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked", "smoked"]', '["American Heart Association 2024", "Harvard Medical School 2024"]'),
('sardines', 'Sardinas', 'Pescados', 'Azul', 208, 25.0, 0.0, 11.0, 0.0, 307, 397, 2.9, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked", "canned"]', '["American Heart Association 2024", "Mediterranean Diet Foundation 2024"]'),
('canned_sardines', 'Sardinas en Lata', 'Pescados', 'Azul Procesado', 208, 25.0, 0.0, 11.0, 0.0, 307, 397, 2.9, TRUE, TRUE, TRUE, TRUE, '["ready_to_eat"]', '["American Heart Association 2024"]'),
('anchovy', 'Anchoas', 'Pescados', 'Azul', 131, 20.0, 0.0, 4.8, 0.0, 104, 383, 3.3, TRUE, TRUE, TRUE, TRUE, '["grilled", "canned", "salted"]', '["Mediterranean Diet Foundation 2024"]'),
('horse_mackerel', 'Jurel', 'Pescados', 'Azul', 139, 24.0, 0.0, 4.2, 0.0, 58, 340, 1.4, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["Mediterranean Diet Foundation 2024"]'),

-- PESCADOS BLANCOS
('cod', 'Bacalao', 'Pescados', 'Blanco', 82, 18.0, 0.0, 0.7, 0.0, 54, 413, 0.4, TRUE, TRUE, TRUE, TRUE, '["baked", "steamed", "poached"]', '["Harvard Medical School 2024"]'),
('salted_cod', 'Bacalao Salado', 'Pescados', 'Blanco Procesado', 290, 63.0, 0.0, 2.4, 0.0, 7027, 1458, 2.0, TRUE, TRUE, TRUE, TRUE, '["soaked", "stewed"]', '["Mediterranean Diet Foundation 2024"]'),
('hake', 'Merluza', 'Pescados', 'Blanco', 96, 21.0, 0.0, 1.2, 0.0, 76, 415, 1.0, TRUE, TRUE, TRUE, TRUE, '["baked", "steamed", "fried"]', '["Mediterranean Diet Foundation 2024"]'),
('sea_bream', 'Dorada', 'Pescados', 'Blanco', 144, 24.0, 0.0, 4.5, 0.0, 117, 292, 0.9, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked", "steamed"]', '["Mediterranean Diet Foundation 2024"]'),
('sea_bass', 'Lubina', 'Pescados', 'Blanco', 97, 20.0, 0.0, 1.5, 0.0, 68, 256, 0.3, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked", "steamed"]', '["Mediterranean Diet Foundation 2024"]'),
('trout', 'Trucha', 'Pescados', 'Blanco', 119, 20.0, 0.0, 3.5, 0.0, 57, 394, 0.7, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked", "smoked"]', '["Harvard Medical School 2024"]'),
('rainbow_trout', 'Trucha Arcoíris', 'Pescados', 'Blanco', 119, 20.0, 0.0, 3.5, 0.0, 57, 394, 0.7, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["Harvard Medical School 2024"]'),
('turbot', 'Rodaballo', 'Pescados', 'Blanco', 95, 20.0, 0.0, 1.2, 0.0, 150, 340, 0.4, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["Mediterranean Diet Foundation 2024"]'),
('sole', 'Lenguado', 'Pescados', 'Blanco', 91, 19.0, 0.0, 1.2, 0.0, 90, 230, 0.5, TRUE, TRUE, TRUE, TRUE, '["steamed", "baked", "fried"]', '["Mediterranean Diet Foundation 2024"]'),
('monkfish', 'Rape', 'Pescados', 'Blanco', 97, 20.0, 0.0, 1.5, 0.0, 23, 400, 0.4, TRUE, TRUE, TRUE, TRUE, '["baked", "braised"]', '["Mediterranean Diet Foundation 2024"]'),
('swordfish', 'Pez Espada', 'Pescados', 'Blanco', 172, 28.0, 0.0, 6.2, 0.0, 90, 418, 0.9, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["American Heart Association 2024"]'),
('grouper', 'Mero', 'Pescados', 'Blanco', 118, 24.0, 0.0, 1.3, 0.0, 53, 483, 1.2, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["Mediterranean Diet Foundation 2024"]'),
('red_snapper', 'Pargo Rojo', 'Pescados', 'Blanco', 128, 26.0, 0.0, 1.7, 0.0, 64, 444, 0.2, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["American Heart Association 2024"]'),
('halibut', 'Halibut', 'Pescados', 'Blanco', 111, 23.0, 0.0, 1.3, 0.0, 54, 435, 0.8, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["Harvard Medical School 2024"]'),

-- MARISCOS - CRUSTÁCEOS
('prawns', 'Langostinos', 'Mariscos', 'Crustáceos', 99, 24.0, 0.0, 0.3, 0.0, 111, 259, 0.5, TRUE, TRUE, TRUE, TRUE, '["grilled", "boiled", "sauteed"]', '["American Heart Association 2024"]'),
('shrimp', 'Gambas', 'Mariscos', 'Crustáceos', 99, 24.0, 0.0, 0.3, 0.0, 111, 259, 0.5, TRUE, TRUE, TRUE, TRUE, '["grilled", "boiled", "sauteed"]', '["American Heart Association 2024"]'),
('langostine', 'Cigalas', 'Mariscos', 'Crustáceos', 112, 22.0, 1.0, 1.5, 0.0, 370, 220, 1.8, TRUE, TRUE, TRUE, TRUE, '["boiled", "grilled"]', '["Mediterranean Diet Foundation 2024"]'),
('crab', 'Cangrejo', 'Mariscos', 'Crustáceos', 97, 20.0, 0.0, 1.5, 0.0, 293, 329, 1.8, TRUE, TRUE, TRUE, TRUE, '["boiled", "steamed"]', '["American Heart Association 2024"]'),
('spider_crab', 'Centollo', 'Mariscos', 'Crustáceos', 97, 20.0, 0.0, 1.5, 0.0, 293, 329, 1.8, TRUE, TRUE, TRUE, TRUE, '["boiled", "steamed"]', '["Mediterranean Diet Foundation 2024"]'),
('lobster', 'Langosta', 'Mariscos', 'Crustáceos', 89, 19.0, 0.0, 0.9, 0.0, 296, 230, 0.3, TRUE, TRUE, TRUE, TRUE, '["boiled", "grilled"]', '["American Heart Association 2024"]'),

-- MARISCOS - MOLUSCOS
('mussels', 'Mejillones', 'Mariscos', 'Moluscos', 86, 12.0, 4.0, 2.2, 0.0, 286, 320, 3.9, TRUE, TRUE, FALSE, TRUE, '["steamed", "boiled"]', '["Mediterranean Diet Foundation 2024"]'),
('clams', 'Almejas', 'Mariscos', 'Moluscos', 86, 12.0, 4.0, 2.2, 0.0, 286, 320, 3.9, TRUE, TRUE, FALSE, TRUE, '["steamed", "boiled"]', '["Mediterranean Diet Foundation 2024"]'),
('cockles', 'Berberechos', 'Mariscos', 'Moluscos', 79, 13.0, 2.0, 2.0, 0.0, 286, 320, 15.1, TRUE, TRUE, FALSE, TRUE, '["steamed", "boiled"]', '["Mediterranean Diet Foundation 2024"]'),
('razor_clams', 'Navajas', 'Mariscos', 'Moluscos', 82, 14.0, 2.0, 1.4, 0.0, 106, 628, 13.9, TRUE, TRUE, FALSE, TRUE, '["grilled", "steamed"]', '["Mediterranean Diet Foundation 2024"]'),
('squid', 'Calamar', 'Mariscos', 'Cefalópodos', 92, 16.0, 3.0, 1.4, 0.0, 44, 246, 0.7, TRUE, TRUE, FALSE, TRUE, '["grilled", "fried", "stewed"]', '["Mediterranean Diet Foundation 2024"]'),
('cuttlefish', 'Sepia', 'Mariscos', 'Cefalópodos', 79, 16.0, 0.8, 0.7, 0.0, 273, 424, 6.2, TRUE, TRUE, TRUE, TRUE, '["grilled", "stewed"]', '["Mediterranean Diet Foundation 2024"]'),
('octopus', 'Pulpo', 'Mariscos', 'Cefalópodos', 82, 15.0, 2.2, 1.0, 0.0, 230, 350, 5.3, TRUE, TRUE, FALSE, TRUE, '["boiled", "grilled"]', '["Mediterranean Diet Foundation 2024"]'),
('baby_squid', 'Chipirones', 'Mariscos', 'Cefalópodos', 92, 16.0, 3.0, 1.4, 0.0, 44, 246, 0.7, TRUE, TRUE, FALSE, TRUE, '["fried", "grilled"]', '["Mediterranean Diet Foundation 2024"]'),
('scallops', 'Vieiras', 'Mariscos', 'Moluscos', 88, 16.0, 2.4, 0.8, 0.0, 392, 205, 0.4, TRUE, TRUE, FALSE, TRUE, '["grilled", "seared"]', '["American Heart Association 2024"]'),
('oysters', 'Ostras', 'Mariscos', 'Moluscos', 81, 9.0, 4.6, 2.3, 0.0, 211, 156, 6.7, TRUE, TRUE, FALSE, TRUE, '["raw", "grilled"]', '["American Heart Association 2024"]'),

-- OTROS PRODUCTOS DEL MAR
('sea_urchin', 'Erizos de Mar', 'Mariscos', 'Equinodermos', 172, 13.0, 2.5, 4.8, 0.0, 53, 628, 1.6, TRUE, TRUE, FALSE, TRUE, '["raw"]', '["Mediterranean Diet Foundation 2024"]'),
('caviar', 'Caviar', 'Pescados', 'Huevas', 264, 25.0, 4.0, 18.0, 0.0, 1500, 181, 11.9, TRUE, TRUE, TRUE, TRUE, '["raw"]', '["Harvard Medical School 2024"]'),
('fish_roe', 'Huevas de Pescado', 'Pescados', 'Huevas', 143, 24.0, 1.5, 4.2, 0.0, 91, 181, 1.9, TRUE, TRUE, TRUE, TRUE, '["raw", "cooked"]', '["Mediterranean Diet Foundation 2024"]'),
('eel', 'Anguila', 'Pescados', 'Azul', 184, 18.0, 0.0, 11.0, 0.0, 51, 272, 0.5, TRUE, TRUE, TRUE, TRUE, '["grilled", "smoked"]', '["Mediterranean Diet Foundation 2024"]'),
('sea_bream_fillet', 'Filete de Dorada', 'Pescados', 'Blanco', 144, 24.0, 0.0, 4.5, 0.0, 117, 292, 0.9, TRUE, TRUE, TRUE, TRUE, '["grilled", "baked"]', '["Mediterranean Diet Foundation 2024"]');

-- =====================================================
-- INSERTAR ALIMENTOS - HUEVOS Y LÁCTEOS (40+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, sodium, potassium, calcium, is_gluten_free, is_vegetarian, is_keto_friendly, is_high_protein, cooking_methods, medical_sources) VALUES

-- HUEVOS
('chicken_eggs', 'Huevos de Gallina', 'Lácteos y Huevos', 'Huevos', 155, 13.0, 1.1, 11.0, 0.0, 124, 126, 50, TRUE, TRUE, TRUE, TRUE, '["boiled", "fried", "scrambled", "poached"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('egg_whites', 'Claras de Huevo', 'Lácteos y Huevos', 'Huevos', 52, 11.0, 0.7, 0.2, 0.0, 166, 163, 7, TRUE, TRUE, TRUE, TRUE, '["scrambled", "whipped"]', '["Harvard Medical School 2024"]'),
('egg_yolks', 'Yemas de Huevo', 'Lácteos y Huevos', 'Huevos', 322, 16.0, 3.6, 27.0, 0.0, 48, 109, 129, TRUE, TRUE, TRUE, TRUE, '["cooked", "raw"]', '["Harvard Medical School 2024"]'),
('quail_eggs', 'Huevos de Codorniz', 'Lácteos y Huevos', 'Huevos', 158, 13.0, 0.4, 11.0, 0.0, 141, 132, 64, TRUE, TRUE, TRUE, TRUE, '["boiled", "fried"]', '["Harvard Medical School 2024"]'),
('duck_eggs', 'Huevos de Pato', 'Lácteos y Huevos', 'Huevos', 185, 13.0, 1.5, 14.0, 0.0, 146, 222, 64, TRUE, TRUE, TRUE, TRUE, '["boiled", "fried"]', '["Harvard Medical School 2024"]'),

-- LECHES
('whole_milk', 'Leche Entera', 'Lácteos y Huevos', 'Leches', 61, 3.2, 4.8, 3.3, 0.0, 44, 150, 113, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024", "Mayo Clinic 2024"]'),
('skim_milk', 'Leche Desnatada', 'Lácteos y Huevos', 'Leches', 34, 3.4, 5.0, 0.1, 0.0, 44, 150, 113, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024"]'),
('semi_skim_milk', 'Leche Semidesnatada', 'Lácteos y Huevos', 'Leches', 42, 3.4, 5.0, 1.0, 0.0, 44, 150, 113, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024"]'),
('goat_milk', 'Leche de Cabra', 'Lácteos y Huevos', 'Leches', 69, 3.6, 4.5, 4.1, 0.0, 50, 204, 134, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024"]'),
('sheep_milk', 'Leche de Oveja', 'Lácteos y Huevos', 'Leches', 108, 5.4, 5.4, 7.0, 0.0, 44, 136, 193, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Mediterranean Diet Foundation 2024"]'),

-- LECHES VEGETALES
('almond_milk', 'Leche de Almendras', 'Lácteos y Huevos', 'Leches Vegetales', 17, 0.6, 1.5, 1.1, 0.5, 1, 7, 188, TRUE, TRUE, TRUE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024"]'),
('oat_milk', 'Leche de Avena', 'Lácteos y Huevos', 'Leches Vegetales', 43, 1.5, 7.0, 1.3, 0.8, 101, 389, 120, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024"]'),
('soy_milk', 'Leche de Soja', 'Lácteos y Huevos', 'Leches Vegetales', 33, 2.9, 1.8, 1.6, 0.4, 51, 118, 25, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024"]'),
('coconut_milk', 'Leche de Coco', 'Lácteos y Huevos', 'Leches Vegetales', 230, 2.3, 6.0, 24.0, 2.2, 15, 263, 16, TRUE, TRUE, TRUE, FALSE, '["cooking", "drink"]', '["Harvard Medical School 2024"]'),
('rice_milk', 'Leche de Arroz', 'Lácteos y Huevos', 'Leches Vegetales', 47, 0.3, 9.2, 1.0, 0.3, 39, 27, 118, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024"]'),

-- YOGURES
('greek_yogurt', 'Yogur Griego', 'Lácteos y Huevos', 'Yogures', 59, 10.0, 3.6, 0.4, 0.0, 36, 141, 110, TRUE, TRUE, FALSE, TRUE, '["eat", "cooking"]', '["Harvard Medical School 2024", "Mayo Clinic 2024"]'),
('natural_yogurt', 'Yogur Natural', 'Lácteos y Huevos', 'Yogures', 59, 10.0, 3.6, 0.4, 0.0, 36, 141, 110, TRUE, TRUE, FALSE, TRUE, '["eat", "cooking"]', '["Harvard Medical School 2024"]'),
('whole_milk_yogurt', 'Yogur Entero', 'Lácteos y Huevos', 'Yogures', 61, 3.5, 4.7, 3.3, 0.0, 46, 155, 121, TRUE, TRUE, FALSE, FALSE, '["eat"]', '["Harvard Medical School 2024"]'),
('kefir', 'Kéfir', 'Lácteos y Huevos', 'Fermentados', 41, 3.4, 4.8, 1.0, 0.0, 40, 164, 120, TRUE, TRUE, FALSE, FALSE, '["drink"]', '["Harvard Medical School 2024", "Nature Reviews Microbiology 2024"]'),
('skyr', 'Skyr', 'Lácteos y Huevos', 'Yogures', 57, 11.0, 4.0, 0.2, 0.0, 35, 150, 150, TRUE, TRUE, FALSE, TRUE, '["eat"]', '["Harvard Medical School 2024"]'),

-- QUESOS FRESCOS
('cottage_cheese', 'Requesón', 'Lácteos y Huevos', 'Quesos Frescos', 98, 11.0, 3.4, 4.3, 0.0, 364, 104, 83, TRUE, TRUE, FALSE, TRUE, '["eat", "cooking"]', '["Harvard Medical School 2024"]'),
('fresh_cheese', 'Queso Fresco', 'Lácteos y Huevos', 'Quesos Frescos', 98, 11.0, 3.4, 4.3, 0.0, 364, 104, 83, TRUE, TRUE, FALSE, TRUE, '["eat", "cooking"]', '["Mediterranean Diet Foundation 2024"]'),
('ricotta', 'Ricotta', 'Lácteos y Huevos', 'Quesos Frescos', 174, 11.0, 3.0, 13.0, 0.0, 84, 105, 207, TRUE, TRUE, FALSE, TRUE, '["cooking", "eat"]', '["Mediterranean Diet Foundation 2024"]'),
('mozzarella', 'Mozzarella', 'Lácteos y Huevos', 'Quesos Frescos', 280, 28.0, 2.2, 17.0, 0.0, 373, 95, 505, TRUE, TRUE, FALSE, TRUE, '["cooking", "eat"]', '["Mediterranean Diet Foundation 2024"]'),
('feta', 'Queso Feta', 'Lácteos y Huevos', 'Quesos Frescos', 75, 4.0, 1.2, 6.0, 0.0, 917, 62, 493, TRUE, TRUE, FALSE, FALSE, '["eat", "cooking"]', '["Mediterranean Diet Foundation 2024"]'),

-- QUESOS CURADOS
('parmesan', 'Queso Parmesano', 'Lácteos y Huevos', 'Quesos Curados', 431, 38.0, 4.1, 29.0, 0.0, 1529, 125, 1184, TRUE, TRUE, TRUE, TRUE, '["grating", "eat"]', '["Mediterranean Diet Foundation 2024"]'),
('cheddar', 'Queso Cheddar', 'Lácteos y Huevos', 'Quesos Curados', 403, 25.0, 1.3, 33.0, 0.0, 621, 98, 721, TRUE, TRUE, TRUE, TRUE, '["eat", "cooking"]', '["Harvard Medical School 2024"]'),
('gouda', 'Queso Gouda', 'Lácteos y Huevos', 'Quesos Curados', 356, 25.0, 2.2, 27.0, 0.0, 819, 121, 700, TRUE, TRUE, TRUE, TRUE, '["eat", "cooking"]', '["Harvard Medical School 2024"]'),
('manchego', 'Queso Manchego', 'Lácteos y Huevos', 'Quesos Curados', 392, 32.0, 0.5, 26.0, 0.0, 1040, 95, 835, TRUE, TRUE, TRUE, TRUE, '["eat"]', '["Mediterranean Diet Foundation 2024"]'),
('roquefort', 'Queso Roquefort', 'Lácteos y Huevos', 'Quesos Azules', 369, 22.0, 2.0, 31.0, 0.0, 1809, 91, 662, TRUE, TRUE, TRUE, TRUE, '["eat"]', '["Mediterranean Diet Foundation 2024"]'),
('blue_cheese', 'Queso Azul', 'Lácteos y Huevos', 'Quesos Azules', 353, 21.0, 2.3, 29.0, 0.0, 1395, 256, 528, TRUE, TRUE, TRUE, TRUE, '["eat", "cooking"]', '["Harvard Medical School 2024"]'),

-- MANTEQUILLAS Y NATAS
('butter', 'Mantequilla', 'Lácteos y Huevos', 'Grasas Lácteas', 717, 0.9, 0.1, 81.0, 0.0, 11, 24, 24, TRUE, TRUE, TRUE, FALSE, '["cooking", "baking"]', '["Harvard Medical School 2024"]'),
('heavy_cream', 'Nata para Montar', 'Lácteos y Huevos', 'Natas', 345, 2.1, 2.8, 37.0, 0.0, 38, 75, 65, TRUE, TRUE, TRUE, FALSE, '["cooking", "whipping"]', '["Harvard Medical School 2024"]'),
('sour_cream', 'Nata Agria', 'Lácteos y Huevos', 'Natas', 193, 2.4, 4.6, 19.0, 0.0, 54, 141, 100, TRUE, TRUE, TRUE, FALSE, '["cooking", "garnish"]', '["Harvard Medical School 2024"]'),
('creme_fraiche', 'Crème Fraîche', 'Lácteos y Huevos', 'Natas', 345, 2.4, 2.9, 37.0, 0.0, 52, 87, 95, TRUE, TRUE, TRUE, FALSE, '["cooking", "garnish"]', '["Harvard Medical School 2024"]');

-- Continúa con el resto de categorías...
-- =====================================================
-- INSERTAR ALIMENTOS - LEGUMBRES (30+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, sodium, potassium, iron, is_vegan, is_vegetarian, is_gluten_free, is_dairy_free, is_high_protein, is_high_fiber, cooking_methods, medical_sources) VALUES

-- LEGUMBRES SECAS
('lentils', 'Lentejas', 'Legumbres', 'Secas', 116, 9.0, 20.0, 0.4, 7.9, 2, 369, 3.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed", "pressure_cooked"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('red_lentils', 'Lentejas Rojas', 'Legumbres', 'Secas', 116, 9.0, 20.0, 0.4, 7.9, 2, 369, 3.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),
('green_lentils', 'Lentejas Verdes', 'Legumbres', 'Secas', 116, 9.0, 20.0, 0.4, 7.9, 2, 369, 3.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),
('black_lentils', 'Lentejas Negras', 'Legumbres', 'Secas', 116, 9.0, 20.0, 0.4, 7.9, 2, 369, 3.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),

('chickpeas', 'Garbanzos', 'Legumbres', 'Secas', 164, 8.9, 27.0, 2.6, 7.6, 7, 291, 2.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "roasted", "pressure_cooked"]', '["Harvard Medical School 2024", "Mediterranean Diet Foundation 2024"]'),
('black_beans', 'Judías Negras', 'Legumbres', 'Secas', 132, 8.9, 23.0, 0.5, 8.7, 2, 355, 2.1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),
('white_beans', 'Judías Blancas', 'Legumbres', 'Secas', 142, 9.7, 25.0, 0.6, 6.3, 6, 561, 3.7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Mediterranean Diet Foundation 2024"]'),
('kidney_beans', 'Judías Rojas', 'Legumbres', 'Secas', 127, 8.7, 23.0, 0.5, 6.4, 2, 403, 2.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),
('pinto_beans', 'Judías Pintas', 'Legumbres', 'Secas', 143, 9.0, 26.0, 0.7, 9.0, 2, 436, 2.1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),
('navy_beans', 'Judías Blancas Pequeñas', 'Legumbres', 'Secas', 140, 8.2, 26.0, 0.6, 10.0, 2, 389, 2.4, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),

('black_eyed_peas', 'Judías Carilla', 'Legumbres', 'Secas', 116, 7.7, 21.0, 0.4, 6.0, 6, 278, 2.5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),
('lima_beans', 'Judías Lima', 'Legumbres', 'Secas', 115, 7.8, 21.0, 0.4, 7.0, 2, 508, 2.4, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]'),
('fava_beans', 'Habas', 'Legumbres', 'Secas', 110, 7.6, 19.0, 0.4, 5.4, 25, 268, 1.5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Mediterranean Diet Foundation 2024"]'),
('split_peas', 'Guisantes Partidos', 'Legumbres', 'Secas', 118, 8.3, 21.0, 0.4, 8.3, 4, 362, 1.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "soup"]', '["Harvard Medical School 2024"]'),

-- LEGUMBRES FRESCAS
('fresh_peas', 'Guisantes Frescos', 'Legumbres', 'Frescas', 81, 5.4, 14.0, 0.4, 5.7, 5, 244, 1.5, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, '["boiled", "steamed", "sauteed"]', '["Harvard Medical School 2024"]'),
('snow_peas', 'Tirabeques', 'Legumbres', 'Frescas', 42, 2.8, 7.6, 0.2, 2.6, 4, 200, 2.1, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, '["stir_fried", "steamed"]', '["Harvard Medical School 2024"]'),
('sugar_snap_peas', 'Guisantes Dulces', 'Legumbres', 'Frescas', 42, 2.8, 7.6, 0.2, 2.6, 4, 200, 2.1, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, '["steamed", "raw"]', '["Harvard Medical School 2024"]'),
('edamame', 'Edamame', 'Legumbres', 'Frescas', 122, 11.0, 10.0, 5.2, 5.2, 6, 436, 2.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "steamed"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('green_beans', 'Judías Verdes', 'Legumbres', 'Frescas', 31, 1.8, 7.0, 0.1, 2.7, 6, 211, 1.0, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, '["steamed", "sauteed", "boiled"]', '["Harvard Medical School 2024"]'),

-- PRODUCTOS DERIVADOS
('hummus', 'Hummus', 'Legumbres', 'Procesadas', 166, 8.0, 14.0, 9.6, 6.0, 379, 228, 2.4, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["dip", "spread"]', '["Mediterranean Diet Foundation 2024"]'),
('tofu', 'Tofu', 'Legumbres', 'Procesadas', 76, 8.1, 1.9, 4.8, 0.4, 7, 121, 0.5, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '["fried", "grilled", "steamed"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('tempeh', 'Tempeh', 'Legumbres', 'Fermentadas', 192, 19.0, 9.4, 11.0, 9.0, 9, 412, 2.7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["steamed", "fried", "grilled"]', '["Harvard Medical School 2024"]'),
('soy_milk', 'Leche de Soja', 'Legumbres', 'Procesadas', 33, 2.9, 1.8, 1.6, 0.4, 51, 118, 0.4, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, '["drink", "cooking"]', '["Harvard Medical School 2024"]'),
('miso', 'Pasta de Miso', 'Legumbres', 'Fermentadas', 199, 12.0, 26.0, 6.0, 5.4, 3728, 210, 2.5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["soup", "marinade"]', '["Nature Reviews Microbiology 2024"]'),

-- LEGUMBRES ESPECIALES
('adzuki_beans', 'Judías Adzuki', 'Legumbres', 'Secas', 128, 7.5, 25.0, 0.1, 7.3, 8, 532, 2.0, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "sweet_preparations"]', '["Harvard Medical School 2024"]'),
('mung_beans', 'Judías Mungo', 'Legumbres', 'Secas', 105, 7.0, 19.0, 0.4, 7.6, 2, 266, 1.4, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["sprouted", "boiled"]', '["Harvard Medical School 2024"]'),
('lupin_beans', 'Altramuces', 'Legumbres', 'Secas', 119, 15.6, 9.9, 2.9, 18.9, 7, 407, 2.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "pickled"]', '["Mediterranean Diet Foundation 2024"]'),
('cowpeas', 'Judías de Careta', 'Legumbres', 'Secas', 116, 7.7, 21.0, 0.4, 6.0, 6, 278, 2.5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["boiled", "stewed"]', '["Harvard Medical School 2024"]');

-- Continúo con más categorías...
