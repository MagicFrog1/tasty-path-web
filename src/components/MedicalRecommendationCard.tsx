import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { MedicalCitationBadge } from './MedicalCitationBadge';

interface MedicalRecommendation {
  title: string;
  description: string;
  citations: Array<{
    source: string;
    year: number;
    impactFactor?: number;
    url?: string;
  }>;
  evidenceLevel: 'Meta-analysis' | 'RCT' | 'Cohort' | 'Expert Consensus';
  category: 'nutrition' | 'timing' | 'functional_foods' | 'lifestyle';
}

interface MedicalRecommendationCardProps {
  recommendation: MedicalRecommendation;
  compact?: boolean;
}

export const MedicalRecommendationCard: React.FC<MedicalRecommendationCardProps> = ({
  recommendation,
  compact = false
}) => {
  
  const getEvidenceLevelColor = (level: string): string => {
    switch (level) {
      case 'Meta-analysis': return Colors.success;
      case 'RCT': return Colors.primary;
      case 'Cohort': return Colors.secondary;
      case 'Expert Consensus': return Colors.warning;
      default: return Colors.darkGray;
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'nutrition': return 'nutrition';
      case 'timing': return 'time';
      case 'functional_foods': return 'leaf';
      case 'lifestyle': return 'fitness';
      default: return 'medical';
    }
  };

  if (compact) {
    return (
      <View style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Ionicons 
            name={getCategoryIcon(recommendation.category) as any} 
            size={16} 
            color={Colors.primary} 
          />
          <Text style={styles.compactTitle}>{recommendation.title}</Text>
        </View>
        
        <Text style={styles.compactDescription} numberOfLines={2}>
          {recommendation.description}
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.citationsScroll}
        >
          {recommendation.citations.map((citation, index) => (
            <MedicalCitationBadge
              key={index}
              source={citation.source}
              year={citation.year}
              impactFactor={citation.impactFactor}
              url={citation.url}
              compact={true}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.fullCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Ionicons 
            name={getCategoryIcon(recommendation.category) as any} 
            size={20} 
            color={Colors.primary} 
          />
          <Text style={styles.title}>{recommendation.title}</Text>
        </View>
        
        <View style={styles.evidenceBadge}>
          <Text style={[
            styles.evidenceText, 
            { color: getEvidenceLevelColor(recommendation.evidenceLevel) }
          ]}>
            {recommendation.evidenceLevel}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description}>
        {recommendation.description}
      </Text>
      
      <View style={styles.citationsContainer}>
        <Text style={styles.citationsLabel}>Fuentes médicas:</Text>
        <View style={styles.citationsGrid}>
          {recommendation.citations.map((citation, index) => (
            <MedicalCitationBadge
              key={index}
              source={citation.source}
              year={citation.year}
              impactFactor={citation.impactFactor}
              url={citation.url}
              compact={false}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkGray,
    marginLeft: 8,
    flex: 1,
  },
  
  compactDescription: {
    fontSize: 12,
    color: Colors.darkGray,
    lineHeight: 16,
    marginBottom: 8,
  },
  
  citationsScroll: {
    marginTop: 4,
  },
  
  fullCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkGray,
    marginLeft: 8,
    flex: 1,
  },
  
  evidenceBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  
  evidenceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  
  description: {
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  
  citationsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 12,
  },
  
  citationsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: 8,
  },
  
  citationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});

export default MedicalRecommendationCard;
