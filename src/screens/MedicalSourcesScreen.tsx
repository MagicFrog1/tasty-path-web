import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { MedicalCitation } from '../components/MedicalCitation';
import { MEDICAL_CITATIONS, medicalCitationService } from '../services/MedicalCitationService';

interface MedicalSourcesScreenProps {
  navigation: any;
}

const MedicalSourcesScreen: React.FC<MedicalSourcesScreenProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Obtener todas las citaciones
  const allCitations = Object.values(MEDICAL_CITATIONS);
  
  // Categorías disponibles
  const categories = [
    { id: 'all', name: 'Todas las Fuentes', icon: 'library' },
    { id: 'guideline', name: 'Guías Oficiales', icon: 'shield-checkmark' },
    { id: 'research', name: 'Investigación', icon: 'flask' },
    { id: 'database', name: 'Bases de Datos', icon: 'server' },
  ];

  // Filtrar citaciones según búsqueda y categoría
  const filteredCitations = allCitations.filter(citation => {
    const matchesSearch = searchTerm === '' || 
      citation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citation.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (citation.authors && citation.authors.some(author => 
        author.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesCategory = selectedCategory === 'all' || citation.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const stats = {
    total: allCitations.length,
    guidelines: allCitations.filter(c => c.type === 'guideline').length,
    research: allCitations.filter(c => c.type === 'research').length,
    databases: allCitations.filter(c => c.type === 'database').length,
  };

  const renderCategoryButton = (category: typeof categories[0]) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Ionicons 
        name={category.icon as any} 
        size={16} 
        color={selectedCategory === category.id ? Colors.white : Colors.purple.main} 
      />
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category.id && styles.categoryButtonTextActive
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Ionicons name="analytics" size={24} color={Colors.white} />
        <Text style={styles.statsTitle}>Fuentes Científicas Verificadas</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total de Fuentes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.guidelines}</Text>
          <Text style={styles.statLabel}>Guías Oficiales</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.research}</Text>
          <Text style={styles.statLabel}>Estudios</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.databases}</Text>
          <Text style={styles.statLabel}>Bases de Datos</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fuentes Médicas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información introductoria */}
        <View style={styles.introSection}>
          <View style={styles.introCard}>
            <Ionicons name="medical" size={32} color={Colors.purple.main} />
            <Text style={styles.introTitle}>Información Médica Verificada</Text>
            <Text style={styles.introText}>
              Todas las recomendaciones nutricionales y de salud en TastyPath están respaldadas por fuentes científicas confiables y organizaciones médicas reconocidas mundialmente.
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        {renderStatsCard()}

        {/* Búsqueda */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.purple.main} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar fuentes médicas..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={Colors.textSecondary}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categorías */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Filtrar por Tipo</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {/* Lista de fuentes */}
        <View style={styles.sourcesSection}>
          <Text style={styles.sectionTitle}>
            {filteredCitations.length} Fuente{filteredCitations.length !== 1 ? 's' : ''} Encontrada{filteredCitations.length !== 1 ? 's' : ''}
          </Text>
          
          {filteredCitations.length > 0 ? (
            <MedicalCitation 
              citationIds={filteredCitations.map(c => c.id)}
              style={styles.citationsList}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={48} color={Colors.textSecondary} />
              <Text style={styles.noResultsTitle}>No se encontraron fuentes</Text>
              <Text style={styles.noResultsText}>
                Intenta con otros términos de búsqueda o selecciona una categoría diferente.
              </Text>
            </View>
          )}
        </View>

        {/* Información adicional */}
        <View style={styles.footerSection}>
          <View style={styles.footerCard}>
            <Ionicons name="information-circle" size={24} color={Colors.purple.main} />
            <Text style={styles.footerTitle}>Importante</Text>
            <Text style={styles.footerText}>
              Esta información es solo para fines educativos. Siempre consulta con profesionales de la salud para consejos médicos personalizados. TastyPath no sustituye el consejo médico profesional.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.medical.background,
  },
  
  header: {
    backgroundColor: Colors.purple.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...Shadows.medium,
  },
  
  backButton: {
    padding: Spacing.xs,
  },
  
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  
  placeholder: {
    width: 40,
  },
  
  content: {
    flex: 1,
  },
  
  introSection: {
    padding: Spacing.md,
  },
  
  introCard: {
    backgroundColor: Colors.medical.cardBg,
    padding: Spacing.lg,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.purple.light,
    ...Shadows.small,
  },
  
  introTitle: {
    ...Typography.h3,
    color: Colors.purple.dark,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  
  introText: {
    ...Typography.body,
    color: Colors.medical.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
  },
  
  statsCard: {
    backgroundColor: Colors.purple.main,
    margin: Spacing.md,
    marginHorizontal: 20,
    padding: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.purple.soft,
    ...Shadows.medium,
  },
  
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  statsTitle: {
    ...Typography.h4,
    color: Colors.white,
    marginLeft: Spacing.sm,
    flex: 1,
    fontWeight: '600',
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: Spacing.sm,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  
  statNumber: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '800',
    fontSize: 24,
  },
  
  statLabel: {
    ...Typography.caption,
    color: Colors.white,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontSize: 11,
    opacity: 0.9,
  },
  
  searchSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.medical.cardBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.purple.light,
    ...Shadows.small,
  },
  
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  
  categoriesSection: {
    marginBottom: Spacing.md,
  },
  
  sectionTitle: {
    ...Typography.h4,
    color: Colors.purple.dark,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: '700',
  },
  
  categoriesScroll: {
    paddingHorizontal: Spacing.md,
  },
  
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.medical.cardBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.purple.soft,
    ...Shadows.small,
  },
  
  categoryButtonActive: {
    backgroundColor: Colors.purple.main,
    borderColor: Colors.purple.deep,
    transform: [{ scale: 1.05 }],
  },
  
  categoryButtonText: {
    ...Typography.body,
    color: Colors.purple.main,
    marginLeft: Spacing.xs,
    fontSize: 14,
    fontWeight: '600',
  },
  
  categoryButtonTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  
  sourcesSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  
  citationsList: {
    marginTop: Spacing.sm,
  },
  
  noResultsContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  
  noResultsTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  
  noResultsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  footerSection: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  
  footerCard: {
    backgroundColor: Colors.purple.light,
    padding: Spacing.lg,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.purple.soft,
    ...Shadows.small,
  },
  
  footerTitle: {
    ...Typography.h4,
    color: Colors.purple.dark,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    fontWeight: '700',
  },
  
  footerText: {
    ...Typography.body,
    color: Colors.purple.royal,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
  },
});

export default MedicalSourcesScreen;
