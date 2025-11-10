import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { createShoppingListFromPlan, ShoppingListPlan, ShoppingListItem } from '../utils/shoppingListGenerator';

const { width } = Dimensions.get('window');

interface ShoppingListScreenProps {
  navigation: any;
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ navigation }) => {
  const { weeklyPlans } = useWeeklyPlan();
  const [shoppingLists, setShoppingLists] = useState<ShoppingListPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Generar listas de compras para todos los planes
  useEffect(() => {
    if (!weeklyPlans || !Array.isArray(weeklyPlans)) {
      console.warn('weeklyPlans no está disponible o no es un array');
      setShoppingLists([]);
      return;
    }

    console.log('Generando listas de compras para', weeklyPlans.length, 'planes');
    const lists = weeklyPlans.map(plan => {
      const shoppingList = createShoppingListFromPlan(plan);
      console.log(`Plan ${plan.name}: ${shoppingList.items.length} ingredientes`);
      return shoppingList;
    });
    setShoppingLists(lists);
    
    // Seleccionar el primer plan por defecto si hay planes
    if (lists.length > 0 && !selectedPlan) {
      setSelectedPlan(lists[0].planId);
    }
  }, [weeklyPlans]);

  // Obtener la lista seleccionada
  const currentList = shoppingLists.find(list => list.planId === selectedPlan);

  // Función eliminada - ya no se puede marcar items



  // Renderizar selector de planes (carpetas)
  const renderPlanFolders = () => (
    <View style={styles.foldersContainer}>
      <View style={styles.foldersHeader}>
        <View style={styles.foldersIconContainer}>
          <Ionicons name="calendar" size={20} color={Colors.white} />
        </View>
        <View style={styles.foldersTitleContainer}>
          <Text style={styles.foldersTitle}>Planes Semanales</Text>
          <Text style={styles.foldersSubtitle}>
            {shoppingLists.length} plan{shoppingLists.length !== 1 ? 'es' : ''} disponible{shoppingLists.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.foldersScroll}>
        {shoppingLists.map((list) => (
          <TouchableOpacity
            key={list.planId}
            style={[
              styles.folderCard,
              selectedPlan === list.planId && styles.selectedFolderCard,
            ]}
            onPress={() => setSelectedPlan(selectedPlan === list.planId ? null : list.planId)}
          >
            <LinearGradient
              colors={selectedPlan === list.planId 
                ? ['#3498DB', '#5DADE2'] 
                : ['#F8F9FA', '#E9ECEF']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.folderGradient}
            >
              <View style={styles.folderIcon}>
                <Ionicons 
                  name={selectedPlan === list.planId ? "folder-open" : "folder"} 
                  size={24} 
                  color={selectedPlan === list.planId ? Colors.white : '#3498DB'} 
                />
            </View>
            
            <Text style={[
                styles.folderName,
                selectedPlan === list.planId && styles.selectedFolderName,
            ]} numberOfLines={2}>
                {list.planName}
            </Text>
            
            <View style={styles.folderStats}>
              <View style={styles.statItem}>
                <Ionicons 
                  name="nutrition" 
                  size={14} 
                  color={selectedPlan === list.planId ? Colors.white : '#6C757D'} 
                />
                <Text style={[
                  styles.statText,
                  selectedPlan === list.planId && styles.selectedStatText
                ]}>
                  {list.items.length}
                </Text>
              </View>
            </View>

              
              <View style={styles.folderArrow}>
                <Ionicons 
                  name={selectedPlan === list.planId ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={selectedPlan === list.planId ? Colors.white : '#6C757D'} 
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Renderizar lista desplegable de ingredientes
  const renderIngredientList = () => {
    if (!currentList) {
      console.log('No hay currentList seleccionado');
      return null;
    }

    console.log('CurrentList encontrado:', currentList.planName, 'Items:', currentList.items.length);

    if (currentList.items.length === 0) {
      console.log('La lista está vacía');
    return (
        <View style={styles.ingredientListContainer}>
          <View style={styles.emptyList}>
            <Ionicons name="basket-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyListTitle}>No hay ingredientes</Text>
            <Text style={styles.emptyListText}>
              Este plan no tiene ingredientes disponibles
            </Text>
          </View>
        </View>
      );
    }

    // Agrupar items por categoría
    const itemsByCategory = currentList.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    console.log('Items agrupados por categoría:', Object.keys(itemsByCategory));

    return (
      <View style={styles.ingredientListContainer}>
        {/* Resumen de la lista */}
        <View style={styles.listSummary}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="list" size={20} color="#3498DB" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>{currentList.planName}</Text>
              <Text style={styles.summarySubtitle}>
                {currentList.items.length} ingredientes • {Object.keys(itemsByCategory).length} categorías
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.ingredientListContent} showsVerticalScrollIndicator={false}>
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIconContainer}>
                  <Ionicons name="nutrition" size={16} color="#3498DB" />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <Text style={styles.categoryCount}>{items.length} ingredientes</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{items.length}</Text>
                </View>
              </View>
              <View style={styles.itemsContainer}>
                {items.map(item => (
                  <View key={item.id} style={styles.itemWrapper}>
                    {renderShoppingItem(item)}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Renderizar item de la lista (solo visual)
  const renderShoppingItem = (item: ShoppingListItem) => {
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemIcon}>
          <Ionicons
            name="ellipse-outline"
            size={16}
            color="#3498DB"
          />
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>
            {item.name}
          </Text>
        </View>
        
        <View style={styles.itemActions}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#E9ECEF"
          />
        </View>
      </View>
    );
  };

  // Renderizar mensaje cuando no hay plan seleccionado
  const renderNoPlanSelected = () => {
    if (currentList) return null;

      return (
        <View style={styles.noPlanSelected}>
        <Ionicons name="folder-outline" size={64} color={Colors.gray} />
          <Text style={styles.noPlanSelectedTitle}>Selecciona un Plan</Text>
          <Text style={styles.noPlanSelectedText}>
          Toca una carpeta para ver los ingredientes de esa semana
          </Text>
        </View>
      );
  };

      return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3498DB', '#5DADE2', '#85C1E9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backButtonContainer}>
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.headerMain}>
            <View style={styles.iconContainer}>
              <Ionicons name="basket" size={36} color={Colors.white} />
              <View style={styles.iconGlow} />
        </View>
            <Text style={styles.headerTitle}>Lista de Compras</Text>
            <Text style={styles.headerSubtitle}>
              Organiza tus ingredientes por semana
                      </Text>
                </View>
              </View>
      </LinearGradient>

      {/* Carpetas de planes */}
      {renderPlanFolders()}
      
      {/* Lista desplegable de ingredientes */}
      {renderIngredientList()}
      
      {/* Mensaje cuando no hay plan seleccionado */}
      {renderNoPlanSelected()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: Spacing.sm,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerMain: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -6,
    left: -6,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginTop: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 3,
    textAlign: 'center',
  },
  foldersContainer: {
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    ...Shadows.small,
  },
  foldersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  foldersIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  foldersTitleContainer: {
    flex: 1,
  },
  foldersTitle: {
    ...Typography.h4,
    color: '#3498DB',
    fontWeight: 'bold',
  },
  foldersSubtitle: {
    ...Typography.caption,
    color: '#6C757D',
    marginTop: 1,
    fontSize: 11,
  },
  foldersScroll: {
    // Add any specific styles for the horizontal scroll view if needed
  },
  folderCard: {
    width: 160,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    ...Shadows.small,
    overflow: 'hidden',
  },
  selectedFolderCard: {
    ...Shadows.large,
  },
  folderGradient: {
    padding: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  folderIcon: {
    marginBottom: Spacing.xs,
  },
  folderName: {
    ...Typography.bodySmall,
    color: '#495057',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontWeight: '600',
    fontSize: 13,
  },
  selectedFolderName: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  folderStats: {
    marginBottom: Spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    ...Typography.caption,
    color: '#6C757D',
    marginLeft: 4,
    fontWeight: '600',
  },
  selectedStatText: {
    color: Colors.white,
  },
  folderArrow: {
    marginTop: Spacing.xs,
    alignItems: 'center',
  },

  ingredientListContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    margin: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  listSummary: {
    backgroundColor: '#F8F9FA',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    ...Typography.h4,
    color: '#3498DB',
    fontWeight: 'bold',
  },
  summarySubtitle: {
    ...Typography.caption,
    color: '#6C757D',
    marginTop: 1,
    fontSize: 11,
  },
  ingredientListContent: {
    flex: 1,
  },



  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  categorySection: {
    marginBottom: Spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    ...Typography.h4,
    color: '#3498DB',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoryCount: {
    ...Typography.caption,
    color: '#6C757D',
    marginTop: 1,
    fontSize: 11,
  },
  categoryBadge: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  categoryBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemsContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  itemWrapper: {
    marginBottom: Spacing.xs,
  },
  itemCard: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  itemIcon: {
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...Typography.body,
    marginBottom: Spacing.xs,
    fontWeight: '600',
    color: '#212529',
  },
  itemQuantity: {
    ...Typography.bodySmall,
    color: '#6C757D',
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPlanSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  noPlanSelectedTitle: {
    ...Typography.h4,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  noPlanSelectedText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  emptyListTitle: {
    ...Typography.h4,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyListText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  shoppingListContainer: {
    flex: 1,
  },
});

export default ShoppingListScreen;