-- =====================================================
-- BASE DE DATOS DE ALIMENTOS - PARTE 3
-- Frutas, Frutos Secos, Especias, Aceites y Otros
-- =====================================================

-- =====================================================
-- INSERTAR ALIMENTOS - FRUTAS (60+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, vitamin_c, potassium, iron, is_vegan, is_vegetarian, is_gluten_free, is_dairy_free, is_low_sodium, seasonality, glycemic_index, cooking_methods, medical_sources) VALUES

-- FRUTAS CÍTRICAS
('oranges', 'Naranjas', 'Frutas', 'Cítricas', 47, 0.9, 11.8, 0.1, 2.4, 53.2, 181, 0.1, TRUE, TRUE, TRUE, TRUE, TRUE, '[11, 12, 1, 2, 3, 4]', 45, '["raw", "juice", "zest"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('lemons', 'Limones', 'Frutas', 'Cítricas', 29, 1.1, 9.3, 0.3, 2.8, 53.0, 138, 0.6, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 25, '["juice", "zest", "raw"]', '["Harvard Medical School 2024"]'),
('limes', 'Limas', 'Frutas', 'Cítricas', 30, 0.7, 10.5, 0.2, 2.8, 29.1, 102, 0.6, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 25, '["juice", "zest", "raw"]', '["Harvard Medical School 2024"]'),
('grapefruits', 'Pomelos', 'Frutas', 'Cítricas', 42, 0.8, 10.7, 0.1, 1.6, 31.2, 135, 0.1, TRUE, TRUE, TRUE, TRUE, TRUE, '[11, 12, 1, 2, 3, 4, 5]', 25, '["raw", "juice"]', '["Harvard Medical School 2024"]'),
('mandarins', 'Mandarinas', 'Frutas', 'Cítricas', 53, 0.8, 13.3, 0.3, 1.8, 26.7, 166, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[11, 12, 1, 2, 3]', 47, '["raw", "juice"]', '["Harvard Medical School 2024"]'),
('tangerines', 'Mandarinas', 'Frutas', 'Cítricas', 53, 0.8, 13.3, 0.3, 1.8, 26.7, 166, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[11, 12, 1, 2, 3]', 47, '["raw", "juice"]', '["Harvard Medical School 2024"]'),

-- BAYAS Y FRUTOS DEL BOSQUE
('strawberries', 'Fresas', 'Frutas', 'Bayas', 32, 0.7, 7.7, 0.3, 2.0, 58.8, 153, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, '[4, 5, 6, 7]', 40, '["raw", "smoothies", "desserts"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('blueberries', 'Arándanos', 'Frutas', 'Bayas', 57, 0.7, 14.5, 0.3, 2.4, 9.7, 77, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8, 9]', 53, '["raw", "smoothies", "baked"]', '["Harvard Medical School 2024", "Nature Reviews 2024"]'),
('blackberries', 'Moras', 'Frutas', 'Bayas', 43, 1.4, 9.6, 0.5, 5.3, 21.0, 162, 0.6, TRUE, TRUE, TRUE, TRUE, TRUE, '[7, 8, 9]', 25, '["raw", "smoothies", "jam"]', '["Harvard Medical School 2024"]'),
('raspberries', 'Frambuesas', 'Frutas', 'Bayas', 52, 1.2, 11.9, 0.7, 6.5, 26.2, 151, 0.7, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8, 9]', 32, '["raw", "smoothies", "desserts"]', '["Harvard Medical School 2024"]'),
('cranberries', 'Arándanos Rojos', 'Frutas', 'Bayas', 46, 0.4, 12.2, 0.1, 4.6, 13.3, 85, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[9, 10, 11, 12]', 35, '["raw", "dried", "sauce"]', '["Harvard Medical School 2024"]'),
('elderberries', 'Saúco', 'Frutas', 'Bayas', 73, 0.7, 18.4, 0.5, 7.0, 36.0, 280, 1.6, TRUE, TRUE, TRUE, TRUE, TRUE, '[8, 9, 10]', 35, '["cooked", "syrup", "jam"]', '["Harvard Medical School 2024"]'),
('gooseberries', 'Grosellas', 'Frutas', 'Bayas', 44, 0.9, 10.2, 0.6, 4.3, 27.7, 198, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8]', 35, '["raw", "cooked", "jam"]', '["Harvard Medical School 2024"]'),

-- FRUTAS DE HUESO
('peaches', 'Melocotones', 'Frutas', 'Hueso', 39, 0.9, 9.5, 0.3, 1.5, 6.6, 190, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8, 9]', 35, '["raw", "grilled", "baked"]', '["Harvard Medical School 2024"]'),
('nectarines', 'Nectarinas', 'Frutas', 'Hueso', 44, 1.1, 10.6, 0.3, 1.7, 5.4, 201, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8, 9]', 35, '["raw", "grilled"]', '["Harvard Medical School 2024"]'),
('plums', 'Ciruelas', 'Frutas', 'Hueso', 46, 0.7, 11.4, 0.3, 1.4, 9.5, 157, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[7, 8, 9, 10]', 35, '["raw", "dried", "baked"]', '["Harvard Medical School 2024"]'),
('apricots', 'Albaricoques', 'Frutas', 'Hueso', 48, 1.4, 11.1, 0.4, 2.0, 10.0, 259, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8]', 35, '["raw", "dried", "jam"]', '["Harvard Medical School 2024"]'),
('cherries', 'Cerezas', 'Frutas', 'Hueso', 63, 1.1, 16.0, 0.2, 2.1, 7.0, 222, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8]', 22, '["raw", "dried", "juice"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('sweet_cherries', 'Cerezas Dulces', 'Frutas', 'Hueso', 63, 1.1, 16.0, 0.2, 2.1, 7.0, 222, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8]', 22, '["raw", "desserts"]', '["Harvard Medical School 2024"]'),
('sour_cherries', 'Cerezas Ácidas', 'Frutas', 'Hueso', 50, 1.0, 12.2, 0.3, 1.6, 10.0, 173, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8]', 22, '["cooked", "juice", "dried"]', '["Harvard Medical School 2024"]'),

-- FRUTAS DE PEPITA
('apples', 'Manzanas', 'Frutas', 'Pepita', 52, 0.3, 13.8, 0.2, 2.4, 4.6, 107, 0.1, TRUE, TRUE, TRUE, TRUE, TRUE, '[8, 9, 10, 11, 12]', 36, '["raw", "baked", "sauce"]', '["Harvard Medical School 2024"]'),
('green_apples', 'Manzanas Verdes', 'Frutas', 'Pepita', 52, 0.3, 13.8, 0.2, 2.4, 4.6, 107, 0.1, TRUE, TRUE, TRUE, TRUE, TRUE, '[8, 9, 10, 11]', 36, '["raw", "salads"]', '["Harvard Medical School 2024"]'),
('red_apples', 'Manzanas Rojas', 'Frutas', 'Pepita', 52, 0.3, 13.8, 0.2, 2.4, 4.6, 107, 0.1, TRUE, TRUE, TRUE, TRUE, TRUE, '[8, 9, 10, 11, 12]', 36, '["raw", "baked"]', '["Harvard Medical School 2024"]'),
('pears', 'Peras', 'Frutas', 'Pepita', 57, 0.4, 15.2, 0.1, 3.1, 4.3, 116, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[8, 9, 10, 11]', 33, '["raw", "poached", "baked"]', '["Harvard Medical School 2024"]'),
('quinces', 'Membrillos', 'Frutas', 'Pepita', 57, 0.4, 15.3, 0.1, 1.9, 15.0, 197, 0.7, TRUE, TRUE, TRUE, TRUE, TRUE, '[10, 11, 12]', 35, '["cooked", "jam", "paste"]', '["Mediterranean Diet Foundation 2024"]'),

-- FRUTAS TROPICALES
('bananas', 'Plátanos', 'Frutas', 'Tropicales', 89, 1.1, 22.8, 0.3, 2.6, 8.7, 358, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 51, '["raw", "smoothies", "baked"]', '["Harvard Medical School 2024"]'),
('pineapple', 'Piña', 'Frutas', 'Tropicales', 50, 0.5, 13.1, 0.1, 1.4, 47.8, 109, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 59, '["raw", "grilled", "juice"]', '["Harvard Medical School 2024"]'),
('mango', 'Mango', 'Frutas', 'Tropicales', 60, 0.8, 15.0, 0.4, 1.6, 36.4, 168, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[4, 5, 6, 7, 8, 9]', 51, '["raw", "smoothies", "salsa"]', '["Harvard Medical School 2024"]'),
('papaya', 'Papaya', 'Frutas', 'Tropicales', 43, 0.5, 10.8, 0.3, 1.7, 60.9, 182, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 59, '["raw", "salads", "smoothies"]', '["Harvard Medical School 2024"]'),
('kiwi', 'Kiwi', 'Frutas', 'Tropicales', 61, 1.1, 14.7, 0.5, 3.0, 92.7, 312, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[5, 6, 7, 8, 9, 10, 11]', 53, '["raw", "smoothies", "salads"]', '["Harvard Medical School 2024"]'),
('passion_fruit', 'Maracuyá', 'Frutas', 'Tropicales', 97, 2.2, 23.4, 0.7, 10.4, 30.0, 348, 1.6, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 30, '["raw", "juice", "desserts"]', '["Harvard Medical School 2024"]'),
('dragon_fruit', 'Pitahaya', 'Frutas', 'Tropicales', 60, 1.2, 13.0, 0.4, 3.0, 20.5, 272, 0.7, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 48, '["raw", "smoothies"]', '["Harvard Medical School 2024"]'),
('star_fruit', 'Carambola', 'Frutas', 'Tropicales', 31, 1.0, 6.7, 0.3, 2.8, 34.4, 133, 0.1, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 45, '["raw", "salads", "juice"]', '["Harvard Medical School 2024"]'),
('guava', 'Guayaba', 'Frutas', 'Tropicales', 68, 2.6, 14.3, 1.0, 5.4, 228.3, 417, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 35, '["raw", "juice", "jam"]', '["Harvard Medical School 2024"]'),
('lychee', 'Lichi', 'Frutas', 'Tropicales', 66, 0.8, 16.5, 0.4, 1.3, 71.5, 171, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8, 9]', 57, '["raw", "desserts"]', '["Harvard Medical School 2024"]'),
('rambutan', 'Rambután', 'Frutas', 'Tropicales', 68, 0.9, 16.0, 0.2, 0.9, 4.9, 42, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8, 9, 10, 11]', 59, '["raw"]', '["Harvard Medical School 2024"]'),

-- MELONES Y SANDÍAS
('watermelon', 'Sandía', 'Frutas', 'Melones', 30, 0.6, 7.6, 0.2, 0.4, 8.1, 112, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8, 9]', 72, '["raw", "juice", "salads"]', '["Harvard Medical School 2024"]'),
('cantaloupe', 'Melón Cantaloupe', 'Frutas', 'Melones', 34, 0.8, 8.2, 0.2, 0.9, 36.7, 267, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[6, 7, 8, 9]', 65, '["raw", "smoothies"]', '["Harvard Medical School 2024"]'),
('honeydew_melon', 'Melón Honeydew', 'Frutas', 'Melones', 36, 0.5, 9.1, 0.1, 0.8, 18.0, 228, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, '[7, 8, 9]', 62, '["raw", "salads"]', '["Harvard Medical School 2024"]'),

-- UVAS
('grapes', 'Uvas', 'Frutas', 'Uvas', 67, 0.6, 17.2, 0.2, 0.9, 10.8, 191, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, '[8, 9, 10, 11]', 46, '["raw", "juice", "dried"]', '["Harvard Medical School 2024", "Mediterranean Diet Foundation 2024"]'),
('red_grapes', 'Uvas Rojas', 'Frutas', 'Uvas', 67, 0.6, 17.2, 0.2, 0.9, 10.8, 191, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, '[8, 9, 10]', 46, '["raw", "juice"]', '["Harvard Medical School 2024"]'),
('green_grapes', 'Uvas Verdes', 'Frutas', 'Uvas', 67, 0.6, 17.2, 0.2, 0.9, 10.8, 191, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, '[8, 9, 10]', 46, '["raw", "juice"]', '["Harvard Medical School 2024"]'),

-- FRUTAS SECAS
('dates', 'Dátiles', 'Frutas', 'Secas', 277, 1.8, 75.0, 0.2, 6.7, 0.4, 696, 0.9, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 35, '["raw", "stuffed", "energy_balls"]', '["Harvard Medical School 2024"]'),
('raisins', 'Pasas', 'Frutas', 'Secas', 299, 3.1, 79.2, 0.5, 3.7, 2.3, 749, 1.9, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 64, '["raw", "baking", "trail_mix"]', '["Harvard Medical School 2024"]'),
('dried_figs', 'Higos Secos', 'Frutas', 'Secas', 249, 3.3, 63.9, 0.9, 9.8, 1.2, 680, 2.0, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 35, '["raw", "baking", "stuffed"]', '["Mediterranean Diet Foundation 2024"]'),
('dried_apricots', 'Orejones', 'Frutas', 'Secas', 241, 3.4, 62.6, 0.5, 7.3, 1.0, 1162, 2.7, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 35, '["raw", "trail_mix", "baking"]', '["Harvard Medical School 2024"]'),
('prunes', 'Ciruelas Pasas', 'Frutas', 'Secas', 240, 2.2, 63.9, 0.4, 7.1, 0.6, 732, 0.9, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', 35, '["raw", "stewed", "baking"]', '["Harvard Medical School 2024"]');

-- =====================================================
-- INSERTAR ALIMENTOS - FRUTOS SECOS Y SEMILLAS (40+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, vitamin_c, potassium, iron, is_vegan, is_vegetarian, is_gluten_free, is_dairy_free, is_high_protein, is_high_fiber, is_keto_friendly, cooking_methods, medical_sources) VALUES

-- FRUTOS SECOS
('almonds', 'Almendras', 'Frutos Secos', 'Frutos Secos', 579, 21.2, 21.6, 49.9, 12.5, 0.0, 733, 3.7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted", "sliced", "flour"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('walnuts', 'Nueces', 'Frutos Secos', 'Frutos Secos', 654, 15.2, 13.7, 65.2, 6.7, 1.3, 441, 2.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted", "chopped"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('cashews', 'Anacardos', 'Frutos Secos', 'Frutos Secos', 553, 18.2, 30.2, 43.9, 3.3, 0.5, 660, 6.7, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, '["raw", "roasted", "butter"]', '["Harvard Medical School 2024"]'),
('pistachios', 'Pistachos', 'Frutos Secos', 'Frutos Secos', 560, 20.2, 27.2, 45.3, 10.6, 5.6, 1025, 3.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted", "shelled"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('hazelnuts', 'Avellanas', 'Frutos Secos', 'Frutos Secos', 628, 15.0, 16.7, 60.8, 9.7, 6.3, 680, 4.7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted", "ground"]', '["Mediterranean Diet Foundation 2024"]'),
('brazil_nuts', 'Nueces de Brasil', 'Frutos Secos', 'Frutos Secos', 659, 14.3, 12.3, 67.1, 7.5, 0.7, 659, 2.4, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted"]', '["Harvard Medical School 2024"]'),
('pecans', 'Nueces Pecanas', 'Frutos Secos', 'Frutos Secos', 691, 9.2, 13.9, 72.0, 9.6, 1.1, 410, 2.5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted", "pie"]', '["Harvard Medical School 2024"]'),
('macadamia_nuts', 'Nueces de Macadamia', 'Frutos Secos', 'Frutos Secos', 718, 7.9, 13.8, 75.8, 8.6, 1.2, 368, 3.7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted"]', '["Harvard Medical School 2024"]'),
('pine_nuts', 'Piñones', 'Frutos Secos', 'Frutos Secos', 673, 13.7, 13.1, 68.4, 3.7, 0.8, 597, 5.5, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, '["raw", "toasted", "pesto"]', '["Mediterranean Diet Foundation 2024"]'),
('chestnuts', 'Castañas', 'Frutos Secos', 'Frutos Secos', 213, 2.4, 45.5, 2.3, 8.1, 43.0, 518, 1.0, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, '["roasted", "boiled", "flour"]', '["Mediterranean Diet Foundation 2024"]'),

-- SEMILLAS
('sunflower_seeds', 'Semillas de Girasol', 'Frutos Secos', 'Semillas', 584, 20.8, 20.0, 51.5, 8.6, 1.4, 645, 5.2, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted", "sprouted"]', '["Harvard Medical School 2024"]'),
('pumpkin_seeds', 'Semillas de Calabaza', 'Frutos Secos', 'Semillas', 559, 30.2, 10.7, 49.1, 6.0, 1.9, 809, 8.8, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted", "sprouted"]', '["Harvard Medical School 2024"]'),
('chia_seeds', 'Semillas de Chía', 'Frutos Secos', 'Semillas', 486, 16.5, 42.1, 30.7, 34.4, 1.6, 407, 7.7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["soaked", "pudding", "smoothies"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('flax_seeds', 'Semillas de Lino', 'Frutos Secos', 'Semillas', 534, 18.3, 28.9, 42.2, 27.3, 0.6, 813, 5.7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["ground", "oil", "baking"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('sesame_seeds', 'Semillas de Sésamo', 'Frutos Secos', 'Semillas', 573, 17.7, 23.4, 49.7, 11.8, 0.0, 468, 14.6, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "toasted", "tahini"]', '["Mediterranean Diet Foundation 2024"]'),
('hemp_seeds', 'Semillas de Cáñamo', 'Frutos Secos', 'Semillas', 553, 31.6, 8.7, 48.8, 4.0, 0.5, 1200, 7.9, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, '["raw", "oil", "protein_powder"]', '["Harvard Medical School 2024"]'),
('poppy_seeds', 'Semillas de Amapola', 'Frutos Secos', 'Semillas', 525, 17.9, 28.1, 41.6, 19.5, 1.0, 719, 9.8, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["baking", "filling"]', '["Harvard Medical School 2024"]'),

-- MANTEQUILLAS DE FRUTOS SECOS
('almond_butter', 'Mantequilla de Almendras', 'Frutos Secos', 'Mantequillas', 614, 21.2, 18.8, 55.5, 12.2, 0.0, 748, 3.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["spread", "baking", "smoothies"]', '["Harvard Medical School 2024"]'),
('peanut_butter', 'Mantequilla de Cacahuete', 'Frutos Secos', 'Mantequillas', 588, 25.1, 19.6, 50.4, 8.0, 0.0, 649, 1.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["spread", "baking", "sauce"]', '["Harvard Medical School 2024"]'),
('cashew_butter', 'Mantequilla de Anacardos', 'Frutos Secos', 'Mantequillas', 587, 17.6, 27.6, 49.4, 2.0, 0.0, 546, 5.1, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, '["spread", "sauce", "desserts"]', '["Harvard Medical School 2024"]'),
('tahini', 'Tahini', 'Frutos Secos', 'Mantequillas', 595, 18.1, 18.0, 53.8, 9.3, 0.0, 414, 9.0, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["spread", "sauce", "hummus"]', '["Mediterranean Diet Foundation 2024"]'),
('sunflower_seed_butter', 'Mantequilla de Semillas de Girasol', 'Frutos Secos', 'Mantequillas', 617, 20.0, 16.4, 57.2, 7.6, 1.2, 689, 3.8, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["spread", "baking"]', '["Harvard Medical School 2024"]'),

-- COCOS Y DERIVADOS
('coconut_meat', 'Carne de Coco', 'Frutos Secos', 'Cocos', 354, 3.3, 15.2, 33.5, 9.0, 3.3, 356, 2.4, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, '["raw", "dried", "flakes"]', '["Harvard Medical School 2024"]'),
('coconut_flakes', 'Coco Rallado', 'Frutos Secos', 'Cocos', 660, 6.9, 24.2, 64.5, 16.3, 3.3, 543, 3.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["baking", "desserts", "granola"]', '["Harvard Medical School 2024"]'),
('coconut_flour', 'Harina de Coco', 'Frutos Secos', 'Cocos', 400, 19.3, 58.0, 13.3, 38.5, 3.0, 1006, 3.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '["baking", "coating"]', '["Harvard Medical School 2024"]'),

-- CACAHUETES (TÉCNICAMENTE LEGUMBRES PERO CONSUMIDOS COMO FRUTOS SECOS)
('peanuts', 'Cacahuetes', 'Frutos Secos', 'Cacahuetes', 567, 25.8, 16.1, 49.2, 8.5, 0.0, 705, 4.6, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["raw", "roasted", "boiled"]', '["Harvard Medical School 2024"]'),
('roasted_peanuts', 'Cacahuetes Tostados', 'Frutos Secos', 'Cacahuetes', 585, 24.0, 21.5, 49.7, 8.0, 0.0, 658, 2.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["snack", "trail_mix"]', '["Harvard Medical School 2024"]'),

-- MEZCLAS
('mixed_nuts', 'Frutos Secos Variados', 'Frutos Secos', 'Mezclas', 607, 20.0, 21.7, 54.1, 7.0, 1.0, 600, 3.5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '["snack", "trail_mix"]', '["Harvard Medical School 2024"]'),
('trail_mix', 'Mezcla de Frutos Secos y Frutas', 'Frutos Secos', 'Mezclas', 462, 13.8, 44.9, 29.9, 5.0, 2.0, 514, 2.1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '["snack", "hiking"]', '["Harvard Medical School 2024"]');

-- =====================================================
-- INSERTAR ALIMENTOS - ESPECIAS Y CONDIMENTOS (50+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, sodium, potassium, iron, is_vegan, is_vegetarian, is_gluten_free, is_dairy_free, cooking_methods, medical_sources) VALUES

-- ESPECIAS BÁSICAS
('salt', 'Sal', 'Especias', 'Básicas', 0, 0.0, 0.0, 0.0, 0.0, 38758, 8, 0.0, TRUE, TRUE, TRUE, TRUE, '["seasoning", "preservation"]', '["American Heart Association 2024"]'),
('black_pepper', 'Pimienta Negra', 'Especias', 'Básicas', 251, 10.4, 63.9, 3.3, 25.3, 20, 1329, 9.7, TRUE, TRUE, TRUE, TRUE, '["grinding", "seasoning"]', '["Harvard Medical School 2024"]'),
('white_pepper', 'Pimienta Blanca', 'Especias', 'Básicas', 296, 10.4, 68.6, 2.1, 16.2, 5, 73, 14.3, TRUE, TRUE, TRUE, TRUE, '["grinding", "seasoning"]', '["Harvard Medical School 2024"]'),
('paprika', 'Pimentón', 'Especias', 'Básicas', 282, 14.1, 53.9, 12.9, 34.9, 68, 2280, 21.1, TRUE, TRUE, TRUE, TRUE, '["seasoning", "coloring"]', '["Mediterranean Diet Foundation 2024"]'),
('cayenne_pepper', 'Pimienta de Cayena', 'Especias', 'Picantes', 318, 12.0, 56.6, 17.3, 27.2, 30, 2014, 7.8, TRUE, TRUE, TRUE, TRUE, '["seasoning", "heat"]', '["Harvard Medical School 2024"]'),

-- ESPECIAS AROMÁTICAS
('cinnamon', 'Canela', 'Especias', 'Aromáticas', 247, 4.0, 80.6, 1.2, 53.1, 10, 431, 8.3, TRUE, TRUE, TRUE, TRUE, '["baking", "beverages", "stews"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('nutmeg', 'Nuez Moscada', 'Especias', 'Aromáticas', 525, 5.8, 49.3, 36.3, 20.8, 16, 350, 3.0, TRUE, TRUE, TRUE, TRUE, '["baking", "beverages"]', '["Harvard Medical School 2024"]'),
('cloves', 'Clavos de Olor', 'Especias', 'Aromáticas', 274, 5.9, 65.5, 13.0, 33.9, 277, 1020, 11.8, TRUE, TRUE, TRUE, TRUE, '["baking", "beverages", "meat"]', '["Harvard Medical School 2024"]'),
('cardamom', 'Cardamomo', 'Especias', 'Aromáticas', 311, 10.8, 68.5, 6.7, 28.0, 18, 1119, 13.9, TRUE, TRUE, TRUE, TRUE, '["baking", "beverages", "curries"]', '["Harvard Medical School 2024"]'),
('star_anise', 'Anís Estrellado', 'Especias', 'Aromáticas', 337, 17.6, 50.0, 15.9, 14.6, 16, 1441, 13.1, TRUE, TRUE, TRUE, TRUE, '["beverages", "braising"]', '["Harvard Medical School 2024"]'),
('vanilla', 'Vainilla', 'Especias', 'Aromáticas', 288, 0.1, 12.7, 0.1, 0.0, 9, 148, 0.1, TRUE, TRUE, TRUE, TRUE, '["baking", "desserts", "extract"]', '["Harvard Medical School 2024"]'),

-- ESPECIAS DE COCINA INTERNACIONAL
('cumin', 'Comino', 'Especias', 'Internacionales', 375, 17.8, 44.2, 22.3, 10.5, 168, 1788, 66.4, TRUE, TRUE, TRUE, TRUE, '["toasting", "grinding", "curries"]', '["Harvard Medical School 2024"]'),
('coriander_seeds', 'Semillas de Cilantro', 'Especias', 'Internacionales', 298, 12.4, 54.9, 17.8, 41.9, 35, 1267, 16.3, TRUE, TRUE, TRUE, TRUE, '["toasting", "grinding"]', '["Harvard Medical School 2024"]'),
('turmeric', 'Cúrcuma', 'Especias', 'Internacionales', 354, 7.8, 64.9, 9.9, 21.1, 38, 2525, 41.4, TRUE, TRUE, TRUE, TRUE, '["curries", "golden_milk", "anti_inflammatory"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('curry_powder', 'Curry en Polvo', 'Especias', 'Mezclas', 325, 14.3, 58.2, 14.0, 53.2, 52, 1543, 29.6, TRUE, TRUE, TRUE, TRUE, '["curries", "marinades"]', '["Harvard Medical School 2024"]'),
('garam_masala', 'Garam Masala', 'Especias', 'Mezclas', 379, 16.8, 72.8, 8.3, 24.6, 29, 1669, 16.6, TRUE, TRUE, TRUE, TRUE, '["curries", "meat", "vegetables"]', '["Harvard Medical School 2024"]'),
('five_spice', 'Cinco Especias Chinas', 'Especias', 'Mezclas', 347, 15.1, 76.1, 8.5, 35.7, 24, 1677, 18.1, TRUE, TRUE, TRUE, TRUE, '["chinese_cooking", "meat", "vegetables"]', '["Harvard Medical School 2024"]'),

-- HIERBAS SECAS
('oregano', 'Orégano', 'Especias', 'Hierbas', 265, 9.0, 68.9, 4.3, 42.5, 25, 1260, 36.8, TRUE, TRUE, TRUE, TRUE, '["pizza", "pasta", "mediterranean"]', '["Mediterranean Diet Foundation 2024"]'),
('thyme', 'Tomillo', 'Especias', 'Hierbas', 101, 5.6, 24.4, 1.7, 14.0, 9, 609, 17.5, TRUE, TRUE, TRUE, TRUE, '["roasting", "soups", "stews"]', '["Mediterranean Diet Foundation 2024"]'),
('rosemary', 'Romero', 'Especias', 'Hierbas', 131, 3.3, 20.7, 5.9, 14.1, 26, 668, 6.7, TRUE, TRUE, TRUE, TRUE, '["roasting", "grilling", "bread"]', '["Mediterranean Diet Foundation 2024"]'),
('sage', 'Salvia', 'Especias', 'Hierbas', 315, 10.6, 60.7, 12.8, 40.3, 11, 1070, 28.1, TRUE, TRUE, TRUE, TRUE, '["stuffing", "pasta", "meat"]', '["Mediterranean Diet Foundation 2024"]'),
('bay_leaves', 'Hojas de Laurel', 'Especias', 'Hierbas', 313, 7.6, 74.9, 8.4, 26.3, 23, 529, 43.0, TRUE, TRUE, TRUE, TRUE, '["soups", "stews", "braising"]', '["Mediterranean Diet Foundation 2024"]'),
('tarragon', 'Estragón', 'Especias', 'Hierbas', 295, 22.8, 50.2, 7.2, 7.4, 62, 3020, 32.3, TRUE, TRUE, TRUE, TRUE, '["french_cooking", "sauces", "vinegar"]', '["Harvard Medical School 2024"]'),

-- HIERBAS FRESCAS
('basil', 'Albahaca', 'Especias', 'Hierbas Frescas', 22, 3.2, 2.6, 0.6, 1.6, 4, 295, 3.2, TRUE, TRUE, TRUE, TRUE, '["pesto", "caprese", "pasta"]', '["Mediterranean Diet Foundation 2024"]'),
('parsley', 'Perejil', 'Especias', 'Hierbas Frescas', 36, 3.0, 6.3, 0.8, 3.3, 56, 554, 6.2, TRUE, TRUE, TRUE, TRUE, '["garnish", "chimichurri", "tabbouleh"]', '["Mediterranean Diet Foundation 2024"]'),
('cilantro', 'Cilantro', 'Especias', 'Hierbas Frescas', 23, 2.1, 3.7, 0.5, 2.8, 46, 521, 1.8, TRUE, TRUE, TRUE, TRUE, '["mexican", "asian", "salsa"]', '["Harvard Medical School 2024"]'),
('dill', 'Eneldo', 'Especias', 'Hierbas Frescas', 43, 3.5, 7.0, 1.1, 2.1, 61, 738, 6.6, TRUE, TRUE, TRUE, TRUE, '["fish", "pickles", "yogurt"]', '["Harvard Medical School 2024"]'),
('mint', 'Menta', 'Especias', 'Hierbas Frescas', 70, 3.8, 14.9, 0.9, 8.0, 31, 569, 5.1, TRUE, TRUE, TRUE, TRUE, '["beverages", "desserts", "middle_eastern"]', '["Harvard Medical School 2024"]'),
('chives', 'Cebollino', 'Especias', 'Hierbas Frescas', 30, 3.3, 4.4, 0.7, 2.5, 3, 296, 1.6, TRUE, TRUE, TRUE, TRUE, '["garnish", "eggs", "potatoes"]', '["Harvard Medical School 2024"]'),

-- CONDIMENTOS LÍQUIDOS
('soy_sauce', 'Salsa de Soja', 'Especias', 'Líquidos', 8, 1.3, 0.8, 0.0, 0.1, 5493, 217, 0.4, TRUE, TRUE, FALSE, TRUE, '["stir_fry", "marinades", "dipping"]', '["Harvard Medical School 2024"]'),
('vinegar', 'Vinagre', 'Especias', 'Líquidos', 19, 0.0, 0.9, 0.0, 0.0, 5, 2, 0.2, TRUE, TRUE, TRUE, TRUE, '["salads", "marinades", "pickling"]', '["Harvard Medical School 2024"]'),
('balsamic_vinegar', 'Vinagre Balsámico', 'Especias', 'Líquidos', 88, 0.5, 17.0, 0.0, 0.0, 23, 112, 0.7, TRUE, TRUE, TRUE, TRUE, '["salads", "reductions", "drizzling"]', '["Mediterranean Diet Foundation 2024"]'),
('apple_cider_vinegar', 'Vinagre de Manzana', 'Especias', 'Líquidos', 22, 0.0, 0.9, 0.0, 0.0, 5, 73, 0.2, TRUE, TRUE, TRUE, TRUE, '["health_tonic", "marinades", "salads"]', '["Harvard Medical School 2024"]'),
('lemon_juice', 'Zumo de Limón', 'Especias', 'Líquidos', 22, 0.4, 6.9, 0.2, 0.3, 2, 103, 0.1, TRUE, TRUE, TRUE, TRUE, '["marinades", "dressings", "beverages"]', '["Harvard Medical School 2024"]'),
('lime_juice', 'Zumo de Lima', 'Especias', 'Líquidos', 25, 0.4, 8.4, 0.1, 0.4, 1, 68, 0.1, TRUE, TRUE, TRUE, TRUE, '["cocktails", "marinades", "asian"]', '["Harvard Medical School 2024"]'),

-- CONDIMENTOS ESPECIALES
('wasabi', 'Wasabi', 'Especias', 'Especiales', 109, 4.8, 23.5, 0.6, 7.8, 17, 568, 1.0, TRUE, TRUE, TRUE, TRUE, '["sushi", "japanese"]', '["Harvard Medical School 2024"]'),
('horseradish', 'Rábano Picante', 'Especias', 'Especiales', 48, 1.2, 11.3, 0.7, 3.3, 314, 246, 0.4, TRUE, TRUE, TRUE, TRUE, '["sauces", "condiment"]', '["Harvard Medical School 2024"]'),
('mustard_seed', 'Semillas de Mostaza', 'Especias', 'Especiales', 508, 26.1, 28.1, 36.2, 12.2, 13, 738, 9.2, TRUE, TRUE, TRUE, TRUE, '["pickling", "curries", "mustard"]', '["Harvard Medical School 2024"]'),
('capers', 'Alcaparras', 'Especias', 'Especiales', 23, 2.4, 4.9, 0.9, 3.2, 2348, 40, 1.7, TRUE, TRUE, TRUE, TRUE, '["mediterranean", "fish", "sauces"]', '["Mediterranean Diet Foundation 2024"]'),

-- EDULCORANTES NATURALES
('honey', 'Miel', 'Especias', 'Edulcorantes', 304, 0.3, 82.4, 0.0, 0.2, 4, 52, 0.4, TRUE, TRUE, TRUE, TRUE, '["baking", "beverages", "marinades"]', '["Harvard Medical School 2024"]'),
('maple_syrup', 'Sirope de Arce', 'Especias', 'Edulcorantes', 260, 0.0, 67.0, 0.2, 0.0, 12, 212, 0.1, TRUE, TRUE, TRUE, TRUE, '["pancakes", "baking", "glazes"]', '["Harvard Medical School 2024"]'),
('agave_syrup', 'Sirope de Agave', 'Especias', 'Edulcorantes', 310, 0.0, 76.4, 0.5, 0.2, 4, 4, 0.1, TRUE, TRUE, TRUE, TRUE, '["beverages", "baking"]', '["Harvard Medical School 2024"]'),
('stevia', 'Stevia', 'Especias', 'Edulcorantes', 0, 0.0, 0.0, 0.0, 0.0, 0, 0, 0.0, TRUE, TRUE, TRUE, TRUE, '["beverages", "baking"]', '["Harvard Medical School 2024"]');

-- Continúa con aceites y otros...
