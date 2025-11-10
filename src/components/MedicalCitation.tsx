import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Shadows } from '../constants';
import { medicalCitationService, MedicalCitation as MedicalCitationType } from '../services/MedicalCitationService';

interface MedicalCitationProps {
  citationIds: string[];
  style?: any;
  compact?: boolean;
  showTitle?: boolean;
  collapsible?: boolean;
}

export const MedicalCitation: React.FC<MedicalCitationProps> = ({ 
  citationIds, 
  style, 
  compact = false,
  showTitle = true,
  collapsible = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const citations = medicalCitationService.getCitations(citationIds);
  
  if (citations.length === 0) {
    return null;
  }

  const handleCitationPress = (citation: MedicalCitationType) => {
    Alert.alert(
      'Fuente Médica',
      `${medicalCitationService.formatCitation(citation)}\n\n¿Deseas abrir el enlace?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Abrir Enlace', 
          onPress: () => {
            Linking.openURL(citation.url).catch(err => {
              console.error('Error opening URL:', err);
              Alert.alert('Error', 'No se pudo abrir el enlace');
            });
          }
        }
      ]
    );
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Ionicons name="medical" size={14} color={Colors.purple.main} />
        <TouchableOpacity 
          onPress={() => collapsible ? setIsExpanded(!isExpanded) : handleCitationPress(citations[0])}
          style={styles.compactButton}
        >
          <Text style={styles.compactText}>
            Fuente médica ({citations.length} referencia{citations.length > 1 ? 's' : ''})
          </Text>
          {collapsible && (
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={12} 
              color={Colors.info} 
              style={styles.chevronIcon}
            />
          )}
        </TouchableOpacity>
        
        {/* Contenido desplegable para modo compacto */}
        {collapsible && isExpanded && (
          <View style={styles.expandedCompactContent}>
            {citations.map((citation, index) => (
              <TouchableOpacity
                key={citation.id}
                style={styles.compactCitationItem}
                onPress={() => handleCitationPress(citation)}
                activeOpacity={0.7}
              >
                <Text style={styles.compactCitationNumber}>[{index + 1}]</Text>
                <View style={styles.compactCitationContent}>
                  <Text style={styles.compactCitationTitle}>{citation.title}</Text>
                  <Text style={styles.compactCitationSource}>{citation.source}</Text>
                </View>
                <Ionicons name="open-outline" size={14} color={Colors.info} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showTitle && (
        <TouchableOpacity 
          style={styles.header}
          onPress={() => collapsible ? setIsExpanded(!isExpanded) : undefined}
          activeOpacity={collapsible ? 0.7 : 1}
        >
          <Ionicons name="medical" size={18} color={Colors.purple.main} />
          <Text style={styles.headerText}>Fuentes Médicas</Text>
          {collapsible && (
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={Colors.info} 
            />
          )}
        </TouchableOpacity>
      )}
      
      {(!collapsible || isExpanded) && citations.map((citation, index) => (
        <TouchableOpacity
          key={citation.id}
          style={styles.citationItem}
          onPress={() => handleCitationPress(citation)}
          activeOpacity={0.7}
        >
          <View style={styles.citationHeader}>
            <Text style={styles.citationNumber}>[{index + 1}]</Text>
            <View style={styles.citationContent}>
              <Text style={styles.citationTitle}>{citation.title}</Text>
              <Text style={styles.citationSource}>{citation.source}</Text>
              {citation.year && (
                <Text style={styles.citationYear}>({citation.year})</Text>
              )}
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.purple.main} />
          </View>
          
          {citation.authors && citation.authors.length > 0 && (
            <Text style={styles.citationAuthors}>
              Autores: {citation.authors.join(', ')}
            </Text>
          )}
        </TouchableOpacity>
      ))}
      
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={12} color={Colors.textSecondary} />
        <Text style={styles.disclaimerText}>
          Esta información es solo para fines educativos. Consulta con un profesional de la salud para consejos médicos personalizados.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.medical.cardBg,
    borderRadius: 15,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.purple.main,
    borderWidth: 1,
    borderColor: Colors.purple.light,
    ...Shadows.small,
  },
  
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  
  compactButton: {
    marginLeft: 4,
  },
  
  compactText: {
    fontSize: 12,
    color: Colors.purple.main,
    textDecorationLine: 'underline',
    flex: 1,
    fontWeight: '600',
  },
  
  chevronIcon: {
    marginLeft: 4,
  },
  
  expandedCompactContent: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    width: '100%',
  },
  
  compactCitationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  compactCitationNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.info,
    marginRight: 6,
    marginTop: 1,
  },
  
  compactCitationContent: {
    flex: 1,
    marginRight: 6,
  },
  
  compactCitationTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 14,
  },
  
  compactCitationSource: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.purple.dark,
    marginLeft: 8,
  },
  
  citationItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.purple.light,
    ...Shadows.small,
  },
  
  citationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  citationNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.purple.main,
    marginRight: 10,
    marginTop: 2,
  },
  
  citationContent: {
    flex: 1,
    marginRight: 8,
  },
  
  citationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.medical.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  
  citationSource: {
    fontSize: 13,
    color: Colors.purple.main,
    fontWeight: '600',
    marginTop: 2,
  },
  
  citationYear: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  
  citationAuthors: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: 20,
    fontStyle: 'italic',
  },
  
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  
  disclaimerText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
    lineHeight: 14,
  },
});
