import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface MedicalCitationBadgeProps {
  source: string;
  year: number;
  impactFactor?: number;
  url?: string;
  compact?: boolean;
}

export const MedicalCitationBadge: React.FC<MedicalCitationBadgeProps> = ({
  source,
  year,
  impactFactor,
  url,
  compact = false
}) => {
  
  const handlePress = () => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const getSourceAbbreviation = (source: string): string => {
    const abbreviations: { [key: string]: string } = {
      'New England Journal of Medicine': 'NEJM',
      'The Lancet': 'Lancet',
      'Nature Medicine': 'Nat Med',
      'Cell Metabolism': 'Cell Metab',
      'American Heart Association': 'AHA',
      'Harvard Medical School': 'Harvard',
      'Mayo Clinic': 'Mayo',
      'Stanford Medicine': 'Stanford',
      'American Diabetes Association': 'ADA',
      'Cochrane Database': 'Cochrane'
    };
    
    return abbreviations[source] || source.split(' ').map(word => word[0]).join('');
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactBadge} 
        onPress={handlePress}
        disabled={!url}
      >
        <Ionicons name="medical" size={10} color={Colors.primary} />
        <Text style={styles.compactText}>
          {getSourceAbbreviation(source)} {year}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.fullBadge} 
      onPress={handlePress}
      disabled={!url}
    >
      <View style={styles.badgeHeader}>
        <Ionicons name="medical" size={14} color={Colors.primary} />
        <Text style={styles.sourceText}>{getSourceAbbreviation(source)}</Text>
        <Text style={styles.yearText}>({year})</Text>
      </View>
      
      {impactFactor && (
        <Text style={styles.impactFactorText}>
          IF: {impactFactor}
        </Text>
      )}
      
      {url && (
        <Ionicons name="link" size={12} color={Colors.secondary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  
  compactText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 2,
  },
  
  fullBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginVertical: 2,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    minWidth: 100,
  },
  
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  
  sourceText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 4,
  },
  
  yearText: {
    fontSize: 10,
    color: Colors.darkGray,
    marginLeft: 2,
  },
  
  impactFactorText: {
    fontSize: 9,
    color: Colors.secondary,
    fontWeight: '500',
  },
});

export default MedicalCitationBadge;
