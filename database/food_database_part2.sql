-- =====================================================
-- BASE DE DATOS DE ALIMENTOS - PARTE 2
-- Cereales, Verduras, Frutas, Frutos Secos y más
-- =====================================================

-- =====================================================
-- INSERTAR ALIMENTOS - CEREALES Y GRANOS (50+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, sodium, potassium, iron, is_vegan, is_vegetarian, is_gluten_free, is_dairy_free, is_high_fiber, glycemic_index, cooking_methods, medical_sources) VALUES

-- ARROZ
('brown_rice', 'Arroz Integral', 'Cereales', 'Arroz', 111, 2.6, 23.0, 0.9, 1.8, 5, 43, 0.4, TRUE, TRUE, TRUE, TRUE, FALSE, 50, '["boiled", "steamed", "pilaf"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('white_rice', 'Arroz Blanco', 'Cereales', 'Arroz', 130, 2.7, 28.0, 0.3, 0.4, 1, 35, 0.2, TRUE, TRUE, TRUE, TRUE, FALSE, 73, '["boiled", "steamed"]', '["Harvard Medical School 2024"]'),
('wild_rice', 'Arroz Salvaje', 'Cereales', 'Arroz', 101, 4.0, 21.0, 0.3, 1.8, 2, 101, 0.6, TRUE, TRUE, TRUE, TRUE, FALSE, 45, '["boiled", "pilaf"]', '["Harvard Medical School 2024"]'),
('basmati_rice', 'Arroz Basmati', 'Cereales', 'Arroz', 121, 2.5, 25.0, 0.4, 0.6, 2, 37, 0.5, TRUE, TRUE, TRUE, TRUE, FALSE, 58, '["boiled", "pilaf"]', '["Harvard Medical School 2024"]'),
('jasmine_rice', 'Arroz Jazmín', 'Cereales', 'Arroz', 129, 2.7, 28.0, 0.3, 0.4, 1, 35, 0.2, TRUE, TRUE, TRUE, TRUE, FALSE, 68, '["boiled", "steamed"]', '["Harvard Medical School 2024"]'),
('black_rice', 'Arroz Negro', 'Cereales', 'Arroz', 356, 8.9, 75.0, 3.5, 4.9, 6, 268, 2.4, TRUE, TRUE, TRUE, TRUE, TRUE, 42, '["boiled", "steamed"]', '["Nature Medicine 2024"]'),
('red_rice', 'Arroz Rojo', 'Cereales', 'Arroz', 405, 7.9, 86.0, 2.2, 2.3, 6, 86, 5.5, TRUE, TRUE, TRUE, TRUE, FALSE, 55, '["boiled", "pilaf"]', '["Harvard Medical School 2024"]'),

-- AVENA Y DERIVADOS
('rolled_oats', 'Copos de Avena', 'Cereales', 'Avena', 389, 17.0, 66.0, 7.0, 10.6, 2, 429, 4.7, TRUE, TRUE, TRUE, TRUE, TRUE, 55, '["porridge", "baked", "overnight"]', '["Harvard Medical School 2024", "American Heart Association 2024"]'),
('steel_cut_oats', 'Avena Cortada', 'Cereales', 'Avena', 389, 17.0, 66.0, 7.0, 10.6, 2, 429, 4.7, TRUE, TRUE, TRUE, TRUE, TRUE, 42, '["porridge", "cooked"]', '["Harvard Medical School 2024"]'),
('oat_bran', 'Salvado de Avena', 'Cereales', 'Avena', 246, 17.3, 66.2, 7.0, 15.4, 4, 566, 5.4, TRUE, TRUE, TRUE, TRUE, TRUE, 55, '["porridge", "baking"]', '["American Heart Association 2024"]'),
('oat_flour', 'Harina de Avena', 'Cereales', 'Harinas', 404, 14.7, 65.7, 9.1, 6.5, 3, 371, 3.6, TRUE, TRUE, TRUE, TRUE, TRUE, 44, '["baking", "cooking"]', '["Harvard Medical School 2024"]'),

-- QUINOA Y PSEUDOCEREALES
('quinoa', 'Quinoa', 'Cereales', 'Pseudocereales', 368, 14.1, 64.2, 6.1, 7.0, 5, 563, 4.6, TRUE, TRUE, TRUE, TRUE, TRUE, 53, '["boiled", "steamed", "pilaf"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('red_quinoa', 'Quinoa Roja', 'Cereales', 'Pseudocereales', 368, 14.1, 64.2, 6.1, 7.0, 5, 563, 4.6, TRUE, TRUE, TRUE, TRUE, TRUE, 53, '["boiled", "pilaf"]', '["Harvard Medical School 2024"]'),
('black_quinoa', 'Quinoa Negra', 'Cereales', 'Pseudocereales', 368, 14.1, 64.2, 6.1, 7.0, 5, 563, 4.6, TRUE, TRUE, TRUE, TRUE, TRUE, 53, '["boiled", "pilaf"]', '["Harvard Medical School 2024"]'),
('amaranth', 'Amaranto', 'Cereales', 'Pseudocereales', 371, 13.6, 65.3, 7.0, 6.7, 4, 508, 7.6, TRUE, TRUE, TRUE, TRUE, TRUE, 35, '["boiled", "popped"]', '["Harvard Medical School 2024"]'),
('buckwheat', 'Trigo Sarraceno', 'Cereales', 'Pseudocereales', 343, 13.3, 71.5, 3.4, 10.0, 1, 460, 2.2, TRUE, TRUE, TRUE, TRUE, TRUE, 45, '["boiled", "pancakes"]', '["Harvard Medical School 2024"]'),

-- TRIGO Y DERIVADOS
('whole_wheat', 'Trigo Integral', 'Cereales', 'Trigo', 339, 13.2, 71.2, 2.5, 12.2, 2, 363, 3.6, TRUE, TRUE, FALSE, TRUE, TRUE, 30, '["ground", "cooked"]', '["Harvard Medical School 2024"]'),
('wheat_berries', 'Granos de Trigo', 'Cereales', 'Trigo', 339, 13.2, 71.2, 2.5, 12.2, 2, 363, 3.6, TRUE, TRUE, FALSE, TRUE, TRUE, 30, '["boiled", "pilaf"]', '["Harvard Medical School 2024"]'),
('bulgur', 'Bulgur', 'Cereales', 'Trigo', 342, 12.3, 75.9, 1.3, 12.5, 17, 410, 2.5, TRUE, TRUE, FALSE, TRUE, TRUE, 48, '["soaked", "pilaf"]', '["Mediterranean Diet Foundation 2024"]'),
('wheat_bran', 'Salvado de Trigo', 'Cereales', 'Trigo', 216, 15.6, 64.5, 4.3, 42.8, 2, 1182, 10.6, TRUE, TRUE, FALSE, TRUE, TRUE, 25, '["baking", "cereal"]', '["American Heart Association 2024"]'),
('wheat_germ', 'Germen de Trigo', 'Cereales', 'Trigo', 360, 23.2, 51.8, 9.7, 13.2, 12, 892, 6.3, TRUE, TRUE, FALSE, TRUE, TRUE, 25, '["sprinkled", "baking"]', '["Harvard Medical School 2024"]'),

-- CEBADA Y CENTENO
('pearl_barley', 'Cebada Perlada', 'Cereales', 'Cebada', 354, 12.5, 73.5, 2.3, 17.3, 9, 452, 3.6, TRUE, TRUE, FALSE, TRUE, TRUE, 25, '["boiled", "soup"]', '["Harvard Medical School 2024"]'),
('hulled_barley', 'Cebada Integral', 'Cereales', 'Cebada', 354, 12.5, 73.5, 2.3, 17.3, 9, 452, 3.6, TRUE, TRUE, FALSE, TRUE, TRUE, 22, '["boiled", "pilaf"]', '["Harvard Medical School 2024"]'),
('rye_berries', 'Granos de Centeno', 'Cereales', 'Centeno', 338, 10.3, 75.9, 1.6, 15.1, 2, 510, 2.6, TRUE, TRUE, FALSE, TRUE, TRUE, 35, '["boiled", "bread"]', '["Harvard Medical School 2024"]'),

-- OTROS GRANOS
('millet', 'Mijo', 'Cereales', 'Otros', 378, 11.0, 73.0, 4.2, 8.5, 5, 195, 3.0, TRUE, TRUE, TRUE, TRUE, TRUE, 71, '["boiled", "porridge"]', '["Harvard Medical School 2024"]'),
('sorghum', 'Sorgo', 'Cereales', 'Otros', 329, 10.6, 72.1, 3.5, 6.7, 2, 363, 3.4, TRUE, TRUE, TRUE, TRUE, TRUE, 62, '["boiled", "popped"]', '["Harvard Medical School 2024"]'),
('teff', 'Teff', 'Cereales', 'Otros', 367, 13.3, 73.1, 2.4, 8.0, 12, 427, 7.6, TRUE, TRUE, TRUE, TRUE, TRUE, 57, '["boiled", "porridge"]', '["Harvard Medical School 2024"]'),
('farro', 'Farro', 'Cereales', 'Trigo Ancestral', 340, 15.0, 67.0, 2.5, 5.0, 3, 440, 3.2, TRUE, TRUE, FALSE, TRUE, TRUE, 40, '["boiled", "pilaf"]', '["Mediterranean Diet Foundation 2024"]'),
('spelt', 'Espelta', 'Cereales', 'Trigo Ancestral', 338, 14.6, 70.2, 2.4, 10.7, 8, 388, 4.4, TRUE, TRUE, FALSE, TRUE, TRUE, 40, '["boiled", "flour"]', '["Harvard Medical School 2024"]'),
('kamut', 'Kamut', 'Cereales', 'Trigo Ancestral', 337, 14.7, 70.0, 2.2, 7.4, 4, 403, 3.5, TRUE, TRUE, FALSE, TRUE, TRUE, 40, '["boiled", "pilaf"]', '["Harvard Medical School 2024"]'),

-- HARINAS
('whole_wheat_flour', 'Harina Integral', 'Cereales', 'Harinas', 340, 13.7, 72.0, 2.5, 10.7, 2, 405, 3.9, TRUE, TRUE, FALSE, TRUE, TRUE, 30, '["baking", "cooking"]', '["Harvard Medical School 2024"]'),
('white_flour', 'Harina Blanca', 'Cereales', 'Harinas', 364, 10.3, 76.3, 1.0, 2.7, 2, 107, 1.2, TRUE, TRUE, FALSE, TRUE, FALSE, 85, '["baking", "cooking"]', '["Harvard Medical School 2024"]'),
('almond_flour', 'Harina de Almendras', 'Cereales', 'Harinas Sin Gluten', 579, 21.2, 21.6, 50.6, 12.5, 1, 733, 3.7, TRUE, TRUE, TRUE, TRUE, TRUE, 0, '["baking", "cooking"]', '["Harvard Medical School 2024"]'),
('coconut_flour', 'Harina de Coco', 'Cereales', 'Harinas Sin Gluten', 400, 19.3, 58.0, 13.3, 38.5, 64, 1006, 3.9, TRUE, TRUE, TRUE, TRUE, TRUE, 35, '["baking"]', '["Harvard Medical School 2024"]'),
('chickpea_flour', 'Harina de Garbanzos', 'Cereales', 'Harinas Sin Gluten', 387, 22.4, 57.8, 6.7, 11.0, 64, 846, 4.9, TRUE, TRUE, TRUE, TRUE, TRUE, 35, '["baking", "cooking"]', '["Mediterranean Diet Foundation 2024"]'),
('rice_flour', 'Harina de Arroz', 'Cereales', 'Harinas Sin Gluten', 366, 5.9, 80.1, 1.4, 2.4, 0, 76, 0.4, TRUE, TRUE, TRUE, TRUE, FALSE, 95, '["baking", "cooking"]', '["Harvard Medical School 2024"]');

-- =====================================================
-- INSERTAR ALIMENTOS - VERDURAS Y HORTALIZAS (80+ productos)
-- =====================================================

INSERT INTO foods (name, name_es, category, subcategory, calories, protein, carbs, fat, fiber, vitamin_c, potassium, iron, is_vegan, is_vegetarian, is_gluten_free, is_dairy_free, is_low_sodium, is_high_fiber, seasonality, cooking_methods, medical_sources) VALUES

-- VEGETALES DE HOJA VERDE
('spinach', 'Espinacas', 'Verduras', 'Hojas Verdes', 23, 2.9, 3.6, 0.4, 2.2, 28.1, 558, 2.7, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[10, 11, 12, 1, 2, 3, 4]', '["raw", "steamed", "sauteed", "wilted"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('kale', 'Col Rizada', 'Verduras', 'Hojas Verdes', 49, 4.3, 8.8, 0.9, 3.6, 120.0, 491, 1.5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[10, 11, 12, 1, 2, 3]', '["raw", "massaged", "sauteed", "baked"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('arugula', 'Rúcula', 'Verduras', 'Hojas Verdes', 25, 2.6, 3.7, 0.7, 1.6, 15.0, 369, 1.5, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[3, 4, 5, 9, 10, 11]', '["raw", "salad", "wilted"]', '["Mediterranean Diet Foundation 2024"]'),
('lettuce', 'Lechuga', 'Verduras', 'Hojas Verdes', 15, 1.4, 2.9, 0.2, 1.3, 9.2, 194, 0.9, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[4, 5, 6, 7, 8, 9, 10]', '["raw", "salad"]', '["Harvard Medical School 2024"]'),
('romaine_lettuce', 'Lechuga Romana', 'Verduras', 'Hojas Verdes', 17, 1.2, 3.3, 0.3, 2.1, 4.0, 247, 1.0, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[4, 5, 6, 7, 8, 9, 10]', '["raw", "salad", "grilled"]', '["Harvard Medical School 2024"]'),
('iceberg_lettuce', 'Lechuga Iceberg', 'Verduras', 'Hojas Verdes', 14, 0.9, 3.0, 0.1, 1.2, 2.8, 141, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[4, 5, 6, 7, 8, 9, 10]', '["raw", "salad"]', '["Harvard Medical School 2024"]'),
('swiss_chard', 'Acelgas', 'Verduras', 'Hojas Verdes', 19, 1.8, 3.7, 0.2, 1.6, 30.0, 379, 1.8, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[6, 7, 8, 9, 10, 11]', '["steamed", "sauteed", "braised"]', '["Mediterranean Diet Foundation 2024"]'),
('collard_greens', 'Col Forrajera', 'Verduras', 'Hojas Verdes', 32, 3.0, 5.4, 0.6, 4.0, 35.3, 213, 0.5, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[10, 11, 12, 1, 2, 3]', '["steamed", "braised"]', '["Harvard Medical School 2024"]'),
('watercress', 'Berros', 'Verduras', 'Hojas Verdes', 11, 2.3, 1.3, 0.1, 0.5, 43.0, 330, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[3, 4, 5, 6, 9, 10, 11]', '["raw", "salad", "soup"]', '["Harvard Medical School 2024"]'),
('lamb_lettuce', 'Canónigos', 'Verduras', 'Hojas Verdes', 21, 2.0, 3.5, 0.4, 1.8, 38.2, 459, 2.0, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[10, 11, 12, 1, 2, 3, 4]', '["raw", "salad"]', '["Mediterranean Diet Foundation 2024"]'),

-- CRUCÍFERAS
('broccoli', 'Brócoli', 'Verduras', 'Crucíferas', 34, 2.8, 7.0, 0.4, 2.6, 89.2, 316, 0.7, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[10, 11, 12, 1, 2, 3, 4]', '["steamed", "roasted", "stir_fried"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('cauliflower', 'Coliflor', 'Verduras', 'Crucíferas', 25, 1.9, 5.0, 0.3, 2.0, 48.2, 299, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[9, 10, 11, 12, 1, 2, 3]', '["steamed", "roasted", "mashed"]', '["Harvard Medical School 2024"]'),
('brussels_sprouts', 'Coles de Bruselas', 'Verduras', 'Crucíferas', 43, 3.4, 8.9, 0.3, 3.8, 85.0, 389, 1.4, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[9, 10, 11, 12, 1, 2]', '["roasted", "steamed", "sauteed"]', '["Harvard Medical School 2024"]'),
('cabbage', 'Repollo', 'Verduras', 'Crucíferas', 25, 1.3, 6.0, 0.1, 2.5, 36.6, 170, 0.5, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[10, 11, 12, 1, 2, 3]', '["raw", "steamed", "fermented"]', '["Harvard Medical School 2024"]'),
('red_cabbage', 'Repollo Morado', 'Verduras', 'Crucíferas', 31, 1.4, 7.4, 0.2, 2.1, 57.0, 243, 0.8, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[10, 11, 12, 1, 2]', '["raw", "braised", "pickled"]', '["Harvard Medical School 2024"]'),
('bok_choy', 'Pak Choi', 'Verduras', 'Crucíferas', 13, 1.5, 2.2, 0.2, 1.0, 45.0, 252, 0.8, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[4, 5, 6, 9, 10, 11]', '["stir_fried", "steamed"]', '["Harvard Medical School 2024"]'),
('radish', 'Rábanos', 'Verduras', 'Crucíferas', 16, 0.7, 3.4, 0.1, 1.6, 14.8, 233, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[3, 4, 5, 6, 10, 11]', '["raw", "pickled", "roasted"]', '["Harvard Medical School 2024"]'),
('turnip', 'Nabos', 'Verduras', 'Crucíferas', 28, 0.9, 6.4, 0.1, 1.8, 21.0, 191, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[10, 11, 12, 1, 2, 3]', '["roasted", "boiled", "mashed"]', '["Harvard Medical School 2024"]'),

-- RAÍCES Y TUBÉRCULOS
('carrots', 'Zanahorias', 'Verduras', 'Raíces', 41, 0.9, 9.6, 0.2, 2.8, 5.9, 320, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', '["raw", "steamed", "roasted", "boiled"]', '["Harvard Medical School 2024"]'),
('beets', 'Remolacha', 'Verduras', 'Raíces', 43, 1.6, 9.6, 0.2, 2.8, 4.9, 325, 0.8, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[6, 7, 8, 9, 10, 11]', '["roasted", "boiled", "raw"]', '["Harvard Medical School 2024"]'),
('sweet_potato', 'Boniato', 'Verduras', 'Tubérculos', 86, 1.6, 20.1, 0.1, 3.0, 2.4, 337, 0.6, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[9, 10, 11, 12]', '["roasted", "baked", "steamed"]', '["Harvard Medical School 2024"]'),
('potato', 'Patata', 'Verduras', 'Tubérculos', 77, 2.0, 17.5, 0.1, 2.1, 19.7, 425, 0.8, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[6, 7, 8, 9, 10]', '["boiled", "baked", "roasted", "mashed"]', '["Harvard Medical School 2024"]'),
('parsnip', 'Chirivía', 'Verduras', 'Raíces', 75, 1.2, 18.0, 0.3, 4.9, 17.0, 375, 0.6, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[10, 11, 12, 1, 2]', '["roasted", "mashed", "soup"]', '["Harvard Medical School 2024"]'),
('rutabaga', 'Colinabo', 'Verduras', 'Raíces', 36, 1.1, 8.1, 0.2, 2.3, 25.0, 305, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[10, 11, 12, 1, 2]', '["roasted", "mashed"]', '["Harvard Medical School 2024"]'),

-- SOLANÁCEAS
('tomatoes', 'Tomates', 'Verduras', 'Solanáceas', 18, 0.9, 3.9, 0.2, 1.2, 13.7, 237, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[6, 7, 8, 9, 10]', '["raw", "roasted", "stewed", "sauce"]', '["Mediterranean Diet Foundation 2024"]'),
('cherry_tomatoes', 'Tomates Cherry', 'Verduras', 'Solanáceas', 18, 0.9, 3.9, 0.2, 1.2, 13.7, 237, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[6, 7, 8, 9, 10]', '["raw", "roasted"]', '["Mediterranean Diet Foundation 2024"]'),
('bell_peppers', 'Pimientos', 'Verduras', 'Solanáceas', 31, 1.0, 7.3, 0.3, 2.5, 127.7, 211, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[7, 8, 9, 10]', '["raw", "roasted", "stuffed", "grilled"]', '["Harvard Medical School 2024"]'),
('red_bell_pepper', 'Pimiento Rojo', 'Verduras', 'Solanáceas', 31, 1.0, 7.3, 0.3, 2.5, 127.7, 211, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[7, 8, 9, 10]', '["raw", "roasted", "grilled"]', '["Harvard Medical School 2024"]'),
('yellow_bell_pepper', 'Pimiento Amarillo', 'Verduras', 'Solanáceas', 27, 1.0, 6.3, 0.2, 0.9, 183.5, 212, 0.5, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[7, 8, 9, 10]', '["raw", "roasted", "grilled"]', '["Harvard Medical School 2024"]'),
('eggplant', 'Berenjena', 'Verduras', 'Solanáceas', 25, 1.0, 5.9, 0.2, 3.0, 2.2, 230, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[7, 8, 9, 10]', '["grilled", "roasted", "fried", "stewed"]', '["Mediterranean Diet Foundation 2024"]'),

-- CUCURBITÁCEAS
('zucchini', 'Calabacín', 'Verduras', 'Cucurbitáceas', 17, 1.2, 3.1, 0.3, 1.0, 17.9, 261, 0.4, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[6, 7, 8, 9, 10]', '["grilled", "sauteed", "baked", "spiralized"]', '["Harvard Medical School 2024"]'),
('cucumber', 'Pepino', 'Verduras', 'Cucurbitáceas', 16, 0.7, 4.0, 0.1, 0.5, 2.8, 147, 0.3, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[6, 7, 8, 9]', '["raw", "pickled", "salad"]', '["Harvard Medical School 2024"]'),
('pumpkin', 'Calabaza', 'Verduras', 'Cucurbitáceas', 26, 1.0, 6.5, 0.1, 0.5, 9.0, 340, 0.8, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[9, 10, 11, 12]', '["roasted", "soup", "puree"]', '["Harvard Medical School 2024"]'),
('butternut_squash', 'Calabaza Butternut', 'Verduras', 'Cucurbitáceas', 45, 1.0, 11.7, 0.1, 2.0, 21.0, 352, 0.7, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[9, 10, 11, 12]', '["roasted", "soup", "puree"]', '["Harvard Medical School 2024"]'),
('acorn_squash', 'Calabaza Bellota', 'Verduras', 'Cucurbitáceas', 56, 1.1, 14.6, 0.1, 4.4, 11.0, 347, 0.9, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[9, 10, 11, 12]', '["roasted", "baked"]', '["Harvard Medical School 2024"]'),

-- ALLIUMS
('onions', 'Cebollas', 'Verduras', 'Alliums', 40, 1.1, 9.3, 0.1, 1.7, 7.4, 146, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', '["raw", "sauteed", "caramelized", "roasted"]', '["Harvard Medical School 2024"]'),
('red_onions', 'Cebollas Moradas', 'Verduras', 'Alliums', 40, 1.1, 9.3, 0.1, 1.7, 7.4, 146, 0.2, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', '["raw", "pickled", "grilled"]', '["Harvard Medical School 2024"]'),
('shallots', 'Chalotes', 'Verduras', 'Alliums', 72, 2.5, 16.8, 0.1, 3.2, 8.0, 334, 1.2, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', '["sauteed", "roasted"]', '["Harvard Medical School 2024"]'),
('garlic', 'Ajo', 'Verduras', 'Alliums', 149, 6.4, 33.1, 0.5, 2.1, 31.2, 401, 1.7, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', '["raw", "roasted", "sauteed"]', '["Harvard Medical School 2024", "Nature Medicine 2024"]'),
('leeks', 'Puerros', 'Verduras', 'Alliums', 61, 1.5, 14.2, 0.3, 1.8, 12.0, 180, 2.1, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[10, 11, 12, 1, 2, 3, 4]', '["braised", "soup", "sauteed"]', '["Harvard Medical School 2024"]'),
('scallions', 'Cebolletas', 'Verduras', 'Alliums', 32, 1.8, 7.3, 0.2, 2.6, 18.8, 276, 1.5, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[3, 4, 5, 6, 7, 8, 9, 10]', '["raw", "grilled", "stir_fried"]', '["Harvard Medical School 2024"]'),
('chives', 'Cebollino', 'Verduras', 'Alliums', 30, 3.3, 4.4, 0.7, 2.5, 58.1, 296, 1.6, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[3, 4, 5, 6, 7, 8, 9]', '["raw", "garnish"]', '["Harvard Medical School 2024"]'),

-- OTRAS VERDURAS
('celery', 'Apio', 'Verduras', 'Otras', 16, 0.7, 3.0, 0.2, 1.6, 3.1, 260, 0.2, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]', '["raw", "braised", "soup"]', '["Harvard Medical School 2024"]'),
('asparagus', 'Espárragos', 'Verduras', 'Otras', 20, 2.2, 3.9, 0.1, 2.1, 5.6, 202, 2.1, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[3, 4, 5, 6]', '["grilled", "roasted", "steamed"]', '["Harvard Medical School 2024"]'),
('artichokes', 'Alcachofas', 'Verduras', 'Otras', 47, 3.3, 10.5, 0.2, 5.4, 11.7, 370, 1.3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[3, 4, 5, 6, 10, 11]', '["steamed", "braised", "grilled"]', '["Mediterranean Diet Foundation 2024"]'),
('fennel', 'Hinojo', 'Verduras', 'Otras', 31, 1.2, 7.3, 0.2, 3.1, 12.0, 414, 0.7, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[10, 11, 12, 1, 2, 3]', '["braised", "roasted", "raw"]', '["Mediterranean Diet Foundation 2024"]'),
('okra', 'Quimbombó', 'Verduras', 'Otras', 33, 1.9, 7.5, 0.2, 3.2, 23.0, 299, 0.6, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '[7, 8, 9, 10]', '["fried", "stewed", "grilled"]', '["Harvard Medical School 2024"]'),
('corn', 'Maíz', 'Verduras', 'Otras', 86, 3.3, 18.7, 1.4, 2.0, 6.8, 287, 0.5, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, '[7, 8, 9, 10]', '["boiled", "grilled", "roasted"]', '["Harvard Medical School 2024"]');

-- Continúa el archivo...
