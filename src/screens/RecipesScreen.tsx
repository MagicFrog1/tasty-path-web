import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';

interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  calories: number;
  price: number;
  tags: string[];
  isPremium: boolean;
}

const RecipesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todas');

  const categories = ['Todas', 'Desayuno', 'Almuerzo', 'Cena', 'Snacks', 'Vegetariana', 'Vegana', 'Sin Gluten'];
  const difficulties = ['Todas', 'Fácil', 'Media', 'Difícil'];

  const recipes: Recipe[] = [
    {
      id: '1',
      name: 'Avena con Frutas y Frutos Secos',
      description: 'Un desayuno nutritivo y energético perfecto para empezar el día',
      imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300',
      category: 'Desayuno',
      cookingTime: 10,
      difficulty: 'Fácil',
      calories: 320,
      price: 2.50,
      tags: ['vegetariana', 'sin gluten', 'alta fibra'],
      isPremium: false,
    },
    {
      id: '2',
      name: 'Ensalada César con Pollo',
      description: 'Una ensalada clásica con pollo a la plancha y aderezo casero',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      category: 'Almuerzo',
      cookingTime: 15,
      difficulty: 'Fácil',
      calories: 450,
      price: 4.20,
      tags: ['proteína', 'baja en calorías'],
      isPremium: false,
    },
    {
      id: '3',
      name: 'Salmón al Horno con Hierbas',
      description: 'Salmón fresco cocinado al horno con hierbas aromáticas y limón',
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72719488?w=300',
      category: 'Cena',
      cookingTime: 25,
      difficulty: 'Media',
      calories: 580,
      price: 8.50,
      tags: ['omega-3', 'proteína', 'bajo en carbohidratos'],
      isPremium: true,
    },
    {
      id: '4',
      name: 'Quinoa con Verduras Asadas',
      description: 'Quinoa integral con verduras de temporada asadas al horno',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
      category: 'Almuerzo',
      cookingTime: 30,
      difficulty: 'Media',
      calories: 420,
      price: 4.50,
      tags: ['vegetariana', 'sin gluten', 'proteína completa'],
      isPremium: false,
    },
    {
      id: '5',
      name: 'Smoothie Verde Energético',
      description: 'Batido verde con espinacas, manzana y jengibre para energía natural',
      imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300',
      category: 'Desayuno',
      cookingTime: 5,
      difficulty: 'Fácil',
      calories: 180,
      price: 3.20,
      tags: ['vegetariana', 'vegana', 'detox'],
      isPremium: false,
    },
    {
      id: '6',
      name: 'Pasta Integral con Salsa de Tomate',
      description: 'Pasta integral con salsa de tomate casera y albahaca fresca',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300',
      category: 'Cena',
      cookingTime: 20,
      difficulty: 'Fácil',
      calories: 480,
      price: 3.80,
      tags: ['vegetariana', 'alta en fibra'],
      isPremium: false,
    },
    {
      id: '7',
      name: 'Bowl de Acai con Granola',
      description: 'Bowl de acai con granola casera, frutas frescas y semillas',
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300',
      category: 'Desayuno',
      cookingTime: 8,
      difficulty: 'Fácil',
      calories: 350,
      price: 5.50,
      tags: ['vegetariana', 'antioxidantes', 'superfood'],
      isPremium: true,
    },
    {
      id: '8',
      name: 'Ensalada de Lentejas con Feta',
      description: 'Ensalada de lentejas con queso feta, tomates cherry y hierbas',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996f?w=300',
      category: 'Almuerzo',
      cookingTime: 15,
      difficulty: 'Fácil',
      calories: 380,
      price: 4.80,
      tags: ['vegetariana', 'alta en proteína', 'fibra'],
      isPremium: false,
    },
  ];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'Todas' || recipe.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.recipeCard} activeOpacity={0.8}>
      <Image source={{ uri: item.imageUrl }} style={styles.recipeImage} />
      {item.isPremium && (
        <View style={styles.premiumBadge}>
          <Ionicons name="star" size={16} color={Colors.secondary} />
          <Text style={styles.premiumText}>PRO</Text>
        </View>
      )}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={Colors.darkGray} />
            <Text style={styles.metaText}>{item.cookingTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={16} color={Colors.darkGray} />
            <Text style={styles.metaText}>{item.calories} cal</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={16} color={Colors.darkGray} />
            <Text style={styles.metaText}>€{item.price.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterChip = (item: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={item}
      style={[styles.filterChip, selected && styles.selectedFilterChip]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, selected && styles.selectedFilterChipText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recetas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.darkGray}
          />
        </View>
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Categorías:</Text>
        {categories.map(category => 
          renderFilterChip(
            category,
            selectedCategory === category,
            () => setSelectedCategory(category)
          )
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Dificultad:</Text>
        {difficulties.map(difficulty => 
          renderFilterChip(
            difficulty,
            selectedDifficulty === difficulty,
            () => setSelectedDifficulty(difficulty)
          )
        )}
      </ScrollView>

      {/* Lista de recetas */}
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.recipesList}
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.body.fontSize,
    color: Colors.textPrimary,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  filtersTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
    alignSelf: 'center',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  selectedFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  selectedFilterChipText: {
    color: Colors.white,
  },
  recipesList: {
    padding: Spacing.md,
  },
  recipeCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  premiumBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    ...Shadows.small,
  },
  premiumText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: 'bold',
    marginLeft: Spacing.xs,
  },
  recipeInfo: {
    padding: Spacing.md,
  },
  recipeName: {
    ...Typography.h4,
    marginBottom: Spacing.sm,
  },
  recipeDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.darkGray,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    fontSize: 10,
  },
});

export default RecipesScreen;
