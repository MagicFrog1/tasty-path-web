import React, { useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { MEDICAL_CITATIONS, MedicalCitation } from '../services/MedicalCitationService';

const PageWrapper = styled.div`
  display: grid;
  gap: 32px;
`;

const Hero = styled.section`
  display: grid;
  gap: 16px;
  padding: 36px;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(46, 139, 87, 0.16), rgba(99, 102, 241, 0.18));
  border: 1px solid rgba(46, 139, 87, 0.18);
  box-shadow: 0 28px 60px rgba(46, 139, 87, 0.18);
  color: ${theme.colors.primaryDark};

  h1 {
    margin: 0;
    font-size: clamp(2.2rem, 4vw, 2.8rem);
  }

  p {
    margin: 0;
    max-width: 760px;
    line-height: 1.7;
    color: rgba(33, 37, 41, 0.82);
  }
`;

const Highlights = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 0.95rem;
    color: rgba(33, 37, 41, 0.82);
  }

  li::before {
    content: '•';
    color: ${theme.colors.primary};
    font-size: 1.3rem;
    line-height: 1;
  }
`;

const Section = styled.section`
  display: grid;
  gap: 22px;
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 8px;

  h2 {
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.1rem);
    color: ${theme.colors.textPrimary};
  }

  p {
    margin: 0;
    max-width: 680px;
    color: ${theme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const Card = styled.article`
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(46, 139, 87, 0.14);
  box-shadow: 0 22px 48px rgba(46, 139, 87, 0.12);
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: ${theme.colors.primaryDark};
`;

const CardDesc = styled.p`
  margin: 0;
  color: ${theme.colors.textSecondary};
  line-height: 1.5;
`;

const CitationList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
`;

const CitationItem = styled.li`
  display: grid;
  gap: 4px;
`;

const CitationLink = styled.a`
  color: ${theme.colors.primary};
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.accent};
  }
`;

const CitationSource = styled.span`
  font-size: 0.9rem;
  color: ${theme.colors.textSecondary};
`;

const Disclaimer = styled.div`
  padding: 18px 22px;
  border-radius: 18px;
  background: rgba(46, 139, 87, 0.08);
  border: 1px solid rgba(46, 139, 87, 0.18);
  color: ${theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;
`;

const DATA_GROUPS: Array<{
  title: string;
  description: string;
  citationIds: string[];
}> = [
  {
    title: 'Organismos internacionales y guías gubernamentales',
    description:
      'Las recomendaciones de la OMS, FAO, EFSA y entidades gubernamentales aseguran que la IA de TastyPath siga directrices oficiales vigentes.',
    citationIds: ['who_nutrition', 'who_physical_activity', 'fao_nutrition', 'usda_dietary', 'usda_myplate', 'efsa_nutrition', 'cdc_nutrition']
  },
  {
    title: 'Investigación científica revisada por pares',
    description:
      'Estudios publicados en revistas como The Lancet, NEJM o AJCN sustentan el cálculo de macronutrientes, fibra y recomendaciones personalizadas.',
    citationIds: ['nejm_mediterranean_diet', 'lancet_fiber_health', 'ajcn_protein_requirements', 'nature_microbiome_diet']
  },
  {
    title: 'Instituciones médicas de referencia',
    description:
      'Harvard Health, Mayo Clinic, Cleveland Clinic y la American Heart Association complementan las pautas con protocolos clínicos aplicables.',
    citationIds: ['harvard_healthy_plate', 'mayo_nutrition_basics', 'cleveland_heart_diet', 'aha_dietary_patterns']
  },
  {
    title: 'Bases de datos y recursos específicos',
    description:
      'La IA consulta bases con información nutricional validadas como MyPlate, FDA, guías de probióticos y recursos de hidratación.',
    citationIds: ['fda_nutrition_facts', 'wgo_probiotics', 'mayo_water_intake', 'lancet_planetary_health']
  }
];

const aiPipelineHighlights = [
  'Las respuestas del generador de planes se apoyan en el conjunto de citaciones registradas en `MedicalCitationService` y se actualizan periódicamente.',
  'La IA prioriza combinaciones balanceadas de carnes, pescados y opciones vegetales siguiendo las guías OMS/FAO y ajustes personalizados.',
  'Cada menú incluye datos de macros basados en estudios como los publicados en AJCN y NEJM, garantizando que las recomendaciones tengan respaldo científico.',
  'Las listas de la compra utilizan las mismas fuentes para calcular cantidades y sustituciones seguras cuando hay alergias registradas.'
];

const MedicalSourcesPage: React.FC = () => {
  const groups = useMemo(
    () =>
      DATA_GROUPS.map(group => ({
        ...group,
        citations: group.citationIds
          .map<MedicalCitation | undefined>(id => MEDICAL_CITATIONS[id])
          .filter(Boolean) as MedicalCitation[]
      })),
    []
  );

  return (
    <PageWrapper>
      <Hero>
        <h1>Fuentes Médicas y científicas</h1>
        <p>
          TastyPath combina inteligencia artificial con un repositorio propio de referencias médicas verificadas. Las guías internacionales,
          bases de datos nutricionales y literatura científica sustentan cada plan semanal, cálculo de macronutrientes y recomendación culinaria.
        </p>
        <Highlights>
          {aiPipelineHighlights.map(item => (
            <li key={item}>{item}</li>
          ))}
        </Highlights>
      </Hero>

      {groups.map(group => (
        <Section key={group.title}>
          <SectionHeader>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </SectionHeader>

          <CardsGrid>
            {group.citations.map(citation => (
              <Card key={citation.id}>
                <CardTitle>{citation.title}</CardTitle>
                <CardDesc>{citation.source}</CardDesc>
                <CitationList>
                  <CitationItem>
                    <CitationLink href={citation.url} target="_blank" rel="noopener noreferrer">
                      Ver fuente original
                    </CitationLink>
                    <CitationSource>
                      {citation.type === 'research' ? 'Investigación científica' : 'Guía / Base de datos'} · {citation.year ?? 'Actual'}
                    </CitationSource>
                  </CitationItem>
                </CitationList>
              </Card>
            ))}
          </CardsGrid>
        </Section>
      ))}

      <Disclaimer>
        La IA de TastyPath no reemplaza la valoración profesional de un médico o nutricionista. Los planes generados se basan en la evidencia
        disponible y deben complementarse con seguimiento clínico cuando existan condiciones de salud específicas.
      </Disclaimer>
    </PageWrapper>
  );
};

export default MedicalSourcesPage;
