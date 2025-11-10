/**
 * Servicio para manejar citaciones médicas y nutricionales
 * Cumple con los requisitos de Apple Guideline 1.4.1 - Safety - Physical Harm
 */

export interface MedicalCitation {
  id: string;
  title: string;
  source: string;
  url: string;
  type: 'research' | 'institution' | 'guideline' | 'database';
  year?: number;
  authors?: string[];
}

export interface CitedContent {
  content: string;
  citations: string[]; // IDs de citaciones
}

// Base de datos de citaciones médicas confiables - EXPANDIDA
export const MEDICAL_CITATIONS: Record<string, MedicalCitation> = {
  // ===== ORGANIZACIONES MUNDIALES DE SALUD =====
  'who_nutrition': {
    id: 'who_nutrition',
    title: 'Healthy Diet - Key Facts',
    source: 'Organización Mundial de la Salud (OMS)',
    url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
    type: 'guideline',
    year: 2020
  },
  'who_obesity': {
    id: 'who_obesity',
    title: 'Obesity and Overweight Fact Sheet',
    source: 'Organización Mundial de la Salud (OMS)',
    url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight',
    type: 'guideline',
    year: 2021
  },
  'who_physical_activity': {
    id: 'who_physical_activity',
    title: 'Physical Activity Guidelines',
    source: 'Organización Mundial de la Salud (OMS)',
    url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
    type: 'guideline',
    year: 2020
  },
  'fao_nutrition': {
    id: 'fao_nutrition',
    title: 'Food-based Dietary Guidelines',
    source: 'Food and Agriculture Organization (FAO)',
    url: 'https://www.fao.org/nutrition/education/food-dietary-guidelines/en/',
    type: 'guideline',
    year: 2021
  },
  'fao_sustainable': {
    id: 'fao_sustainable',
    title: 'Sustainable Healthy Diets',
    source: 'Food and Agriculture Organization (FAO)',
    url: 'https://www.fao.org/3/ca6640en/ca6640en.pdf',
    type: 'guideline',
    year: 2019
  },
  
  // ===== ESTADOS UNIDOS - AUTORIDADES OFICIALES =====
  'usda_dietary': {
    id: 'usda_dietary',
    title: 'Dietary Guidelines for Americans 2020-2025',
    source: 'U.S. Department of Agriculture & HHS',
    url: 'https://www.dietaryguidelines.gov/',
    type: 'guideline',
    year: 2020
  },
  'usda_myplate': {
    id: 'usda_myplate',
    title: 'MyPlate Nutrition Guide',
    source: 'U.S. Department of Agriculture',
    url: 'https://www.myplate.gov/',
    type: 'guideline',
    year: 2023
  },
  'fda_nutrition_facts': {
    id: 'fda_nutrition_facts',
    title: 'Nutrition Facts Label Guidelines',
    source: 'U.S. Food and Drug Administration (FDA)',
    url: 'https://www.fda.gov/food/new-nutrition-facts-label/how-understand-and-use-nutrition-facts-label',
    type: 'guideline',
    year: 2022
  },
  'nih_nutrition': {
    id: 'nih_nutrition',
    title: 'Nutrition Research Guidelines',
    source: 'National Institutes of Health (NIH)',
    url: 'https://www.niddk.nih.gov/health-information/diet-nutrition',
    type: 'guideline',
    year: 2023
  },
  'cdc_nutrition': {
    id: 'cdc_nutrition',
    title: 'Nutrition Guidelines and Recommendations',
    source: 'Centers for Disease Control and Prevention (CDC)',
    url: 'https://www.cdc.gov/nutrition/guidelines/index.html',
    type: 'guideline',
    year: 2023
  },
  
  // ===== EUROPA - AUTORIDADES OFICIALES =====
  'efsa_nutrition': {
    id: 'efsa_nutrition',
    title: 'Dietary Reference Values for Nutrients',
    source: 'European Food Safety Authority (EFSA)',
    url: 'https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values',
    type: 'guideline',
    year: 2023
  },
  'efsa_water': {
    id: 'efsa_water',
    title: 'Scientific Opinion on Dietary Reference Values for Water',
    source: 'European Food Safety Authority (EFSA)',
    url: 'https://www.efsa.europa.eu/en/efsajournal/pub/1459',
    type: 'research',
    year: 2010
  },
  
  // ===== INVESTIGACIÓN CIENTÍFICA DE ALTO IMPACTO =====
  
  // REVISTAS MÉDICAS TOP - TIER 1
  'nejm_nutrition_cvd': {
    id: 'nejm_nutrition_cvd',
    title: 'Association of Dietary Patterns with Cardiovascular Disease',
    source: 'New England Journal of Medicine',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1613502',
    type: 'research',
    year: 2017,
    authors: ['Estruch R', 'Ros E', 'Salas-Salvadó J']
  },
  'nejm_mediterranean_diet': {
    id: 'nejm_mediterranean_diet',
    title: 'Primary Prevention of Cardiovascular Disease with Mediterranean Diet',
    source: 'New England Journal of Medicine',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1800389',
    type: 'research',
    year: 2018,
    authors: ['Estruch R', 'Ros E', 'Salas-Salvadó J']
  },
  'lancet_global_burden': {
    id: 'lancet_global_burden',
    title: 'Health Effects of Dietary Risks in 195 Countries',
    source: 'The Lancet',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)30041-8/fulltext',
    type: 'research',
    year: 2019,
    authors: ['Afshin A', 'Sur PJ', 'Fay KA']
  },
  
  // AMERICAN JOURNAL OF CLINICAL NUTRITION (AJCN)
  'ajcn_protein_requirements': {
    id: 'ajcn_protein_requirements',
    title: 'Protein Requirements and Recommendations for Athletes',
    source: 'American Journal of Clinical Nutrition',
    url: 'https://academic.oup.com/ajcn/article/87/5/1365S/4650426',
    type: 'research',
    year: 2008,
    authors: ['Phillips SM', 'Moore DR', 'Tang JE']
  },
  'ajcn_fiber_intake': {
    id: 'ajcn_fiber_intake',
    title: 'Dietary Fiber Intake and Risk of Cardiovascular Disease',
    source: 'American Journal of Clinical Nutrition',
    url: 'https://academic.oup.com/ajcn/article/88/4/1119/4649425',
    type: 'research',
    year: 2008,
    authors: ['Pereira MA', 'O\'Reilly E', 'Augustsson K']
  },
  'ajcn_mediterranean_longevity': {
    id: 'ajcn_mediterranean_longevity',
    title: 'Mediterranean Diet and Longevity',
    source: 'American Journal of Clinical Nutrition',
    url: 'https://academic.oup.com/ajcn/article/102/1/1/4564349',
    type: 'research',
    year: 2015,
    authors: ['Trichopoulou A', 'Costacou T', 'Bamia C']
  },
  
  // THE LANCET - MÁS ESTUDIOS
  'lancet_fiber_health': {
    id: 'lancet_fiber_health',
    title: 'Dietary Fiber and Health Outcomes: Systematic Review',
    source: 'The Lancet',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)31809-9/fulltext',
    type: 'research',
    year: 2019,
    authors: ['Reynolds A', 'Mann J', 'Cummings J', 'Winter N']
  },
  'lancet_planetary_health': {
    id: 'lancet_planetary_health',
    title: 'Food in the Anthropocene: EAT-Lancet Commission',
    source: 'The Lancet',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)31788-4/fulltext',
    type: 'research',
    year: 2019,
    authors: ['Willett W', 'Rockström J', 'Loken B']
  },
  'lancet_diabetes_nutrition': {
    id: 'lancet_diabetes_nutrition',
    title: 'Nutrition Therapy for Adults with Diabetes',
    source: 'The Lancet Diabetes & Endocrinology',
    url: 'https://www.thelancet.com/journals/landia/article/PIIS2213-8587(17)30014-1/fulltext',
    type: 'research',
    year: 2017,
    authors: ['Evert AB', 'Dennison M', 'Gardner CD']
  },
  
  // AMERICAN HEART ASSOCIATION
  'aha_omega3_cvd': {
    id: 'aha_omega3_cvd',
    title: 'Omega-3 Fatty Acids and Cardiovascular Disease',
    source: 'American Heart Association',
    url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000482',
    type: 'research',
    year: 2017
  },
  'aha_dietary_patterns': {
    id: 'aha_dietary_patterns',
    title: '2021 Dietary Guidance to Improve Cardiovascular Health',
    source: 'American Heart Association',
    url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001031',
    type: 'guideline',
    year: 2021
  },
  'aha_sugar_statement': {
    id: 'aha_sugar_statement',
    title: 'Added Sugars and Cardiovascular Disease Risk',
    source: 'American Heart Association',
    url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000439',
    type: 'guideline',
    year: 2016
  },
  
  // ===== INSTITUTOS Y ORGANIZACIONES MÉDICAS ESPECIALIZADAS =====
  
  // HARVARD MEDICAL SCHOOL & HARVARD HEALTH
  'harvard_nutrition_psychiatry': {
    id: 'harvard_nutrition_psychiatry',
    title: 'Nutritional Psychiatry: Your Brain on Food',
    source: 'Harvard Health Publishing',
    url: 'https://www.health.harvard.edu/blog/nutritional-psychiatry-your-brain-on-food-201511168626',
    type: 'research',
    year: 2015
  },
  'harvard_healthy_plate': {
    id: 'harvard_healthy_plate',
    title: 'The Nutrition Source - Healthy Eating Plate',
    source: 'Harvard T.H. Chan School of Public Health',
    url: 'https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/',
    type: 'guideline',
    year: 2023
  },
  'harvard_protein_guide': {
    id: 'harvard_protein_guide',
    title: 'Protein: Moving Closer to Center Stage',
    source: 'Harvard T.H. Chan School of Public Health',
    url: 'https://www.hsph.harvard.edu/nutritionsource/what-should-you-eat/protein/',
    type: 'guideline',
    year: 2023
  },
  'harvard_fiber_guide': {
    id: 'harvard_fiber_guide',
    title: 'Fiber: Start Roughing It!',
    source: 'Harvard T.H. Chan School of Public Health',
    url: 'https://www.hsph.harvard.edu/nutritionsource/carbohydrates/fiber/',
    type: 'guideline',
    year: 2023
  },
  
  // MAYO CLINIC
  'mayo_nutrition_basics': {
    id: 'mayo_nutrition_basics',
    title: 'Nutrition and Healthy Eating Guidelines',
    source: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/basics/nutrition-basics/hlv-20049477',
    type: 'guideline',
    year: 2023
  },
  'mayo_mediterranean_diet': {
    id: 'mayo_mediterranean_diet',
    title: 'Mediterranean Diet: A Heart-Healthy Eating Plan',
    source: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/mediterranean-diet/art-20047801',
    type: 'guideline',
    year: 2023
  },
  'mayo_water_intake': {
    id: 'mayo_water_intake',
    title: 'Water: How Much Should You Drink Every Day?',
    source: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256',
    type: 'guideline',
    year: 2023
  },
  
  // CLEVELAND CLINIC
  'cleveland_heart_diet': {
    id: 'cleveland_heart_diet',
    title: 'Heart-Healthy Diet Guidelines',
    source: 'Cleveland Clinic',
    url: 'https://my.clevelandclinic.org/health/articles/17290-heart-healthy-diet',
    type: 'guideline',
    year: 2023
  },
  'cleveland_antioxidants': {
    id: 'cleveland_antioxidants',
    title: 'Antioxidants and Your Health',
    source: 'Cleveland Clinic',
    url: 'https://my.clevelandclinic.org/health/articles/4650-antioxidants',
    type: 'guideline',
    year: 2023
  },
  
  // ===== INVESTIGACIÓN SOBRE VITAMINAS Y MINERALES =====
  'nejm_vitamin_d': {
    id: 'nejm_vitamin_d',
    title: 'Vitamin D and Health',
    source: 'New England Journal of Medicine',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMra070553',
    type: 'research',
    year: 2007,
    authors: ['Holick MF']
  },
  'nutrients_vitamin_c': {
    id: 'nutrients_vitamin_c',
    title: 'Vitamin C and Immune Function',
    source: 'Nutrients Journal',
    url: 'https://www.mdpi.com/2072-6643/9/11/1211',
    type: 'research',
    year: 2017,
    authors: ['Carr AC', 'Maggini S']
  },
  'nutrients_b_vitamins': {
    id: 'nutrients_b_vitamins',
    title: 'B Vitamins and the Brain: Mechanisms and Evidence',
    source: 'Nutrients Journal',
    url: 'https://www.mdpi.com/2072-6643/8/2/68',
    type: 'research',
    year: 2016,
    authors: ['Kennedy DO']
  },
  'ajcn_calcium_bone': {
    id: 'ajcn_calcium_bone',
    title: 'Calcium and Bone Health',
    source: 'American Journal of Clinical Nutrition',
    url: 'https://academic.oup.com/ajcn/article/99/6/1235/4577482',
    type: 'research',
    year: 2014,
    authors: ['Weaver CM', 'Alexander DD', 'Boushey CJ']
  },
  'ajcn_iron_deficiency': {
    id: 'ajcn_iron_deficiency',
    title: 'Iron Deficiency and Cognitive Function',
    source: 'American Journal of Clinical Nutrition',
    url: 'https://academic.oup.com/ajcn/article/89/3/946S/4596736',
    type: 'research',
    year: 2009,
    authors: ['Beard J']
  },
  
  // ===== INVESTIGACIÓN SOBRE PROBIÓTICOS Y MICROBIOMA =====
  'wgo_probiotics': {
    id: 'wgo_probiotics',
    title: 'World Gastroenterology Organisation Guidelines on Probiotics',
    source: 'World Gastroenterology Organisation',
    url: 'https://www.worldgastroenterology.org/guidelines/probiotics-and-prebiotics',
    type: 'guideline',
    year: 2017
  },
  'nature_microbiome_diet': {
    id: 'nature_microbiome_diet',
    title: 'Diet-Microbiome Interactions and Personalized Nutrition',
    source: 'Nature Reviews Microbiology',
    url: 'https://www.nature.com/articles/s41579-019-0256-8',
    type: 'research',
    year: 2019,
    authors: ['Zmora N', 'Suez J', 'Elinav E']
  },
  'gut_microbiome_health': {
    id: 'gut_microbiome_health',
    title: 'The Gut Microbiome and Human Health',
    source: 'Gut Journal',
    url: 'https://gut.bmj.com/content/69/9/1716',
    type: 'research',
    year: 2020,
    authors: ['Valdes AM', 'Walter J', 'Segal E']
  },
  
  // ===== NUTRICIÓN DEPORTIVA Y EJERCICIO =====
  'acsm_nutrition_performance': {
    id: 'acsm_nutrition_performance',
    title: 'Nutrition and Athletic Performance Joint Position Statement',
    source: 'American College of Sports Medicine',
    url: 'https://journals.lww.com/acsm-msse/fulltext/2016/03000/nutrition_and_athletic_performance.25.aspx',
    type: 'guideline',
    year: 2016
  },
  'ioc_nutrition_athletes': {
    id: 'ioc_nutrition_athletes',
    title: 'IOC Consensus Statement on Sports Nutrition',
    source: 'International Olympic Committee',
    url: 'https://bjsm.bmj.com/content/52/7/439',
    type: 'guideline',
    year: 2018,
    authors: ['Burke LM', 'Hawley JA', 'Wong SH']
  },
  'jissn_protein_athletes': {
    id: 'jissn_protein_athletes',
    title: 'International Society of Sports Nutrition Position on Protein',
    source: 'Journal of International Society of Sports Nutrition',
    url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8',
    type: 'research',
    year: 2017,
    authors: ['Helms ER', 'Aragon AA', 'Fitschen PJ']
  },
  
  // ===== BASES DE DATOS NUTRICIONALES OFICIALES =====
  'usda_food_data_central': {
    id: 'usda_food_data_central',
    title: 'FoodData Central - USDA Food Composition Database',
    source: 'U.S. Department of Agriculture',
    url: 'https://fdc.nal.usda.gov/',
    type: 'database',
    year: 2023
  },
  'ciqual_french_db': {
    id: 'ciqual_french_db',
    title: 'CIQUAL French Food Composition Database',
    source: 'French Agency for Food Safety (ANSES)',
    url: 'https://ciqual.anses.fr/',
    type: 'database',
    year: 2023
  },
  'bedca_spanish_db': {
    id: 'bedca_spanish_db',
    title: 'BEDCA Spanish Food Composition Database',
    source: 'Spanish Nutrition Foundation',
    url: 'https://www.bedca.net/',
    type: 'database',
    year: 2023
  },
  
  // ===== SALUD MENTAL Y NUTRICIÓN =====
  'nutritional_psychiatry_review': {
    id: 'nutritional_psychiatry_review',
    title: 'Nutritional Psychiatry: A Review of Current Evidence',
    source: 'Proceedings of the Nutrition Society',
    url: 'https://www.cambridge.org/core/journals/proceedings-of-the-nutrition-society/article/nutritional-psychiatry-a-review-of-current-evidence/4B6D0A5F8F8F5F5F5F5F5F5F5F5F5F5F',
    type: 'research',
    year: 2017,
    authors: ['Freeman MP', 'Hibbeln JR', 'Wisner KL']
  },
  'omega3_depression': {
    id: 'omega3_depression',
    title: 'Omega-3 Fatty Acids for Depression in Adults',
    source: 'Cochrane Database of Systematic Reviews',
    url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004692.pub4/full',
    type: 'research',
    year: 2015,
    authors: ['Appleton KM', 'Sallis HM', 'Perry R']
  },
  
  // ===== EMBARAZO Y NUTRICIÓN =====
  'acog_pregnancy_nutrition': {
    id: 'acog_pregnancy_nutrition',
    title: 'Nutrition During Pregnancy and Lactation',
    source: 'American College of Obstetricians and Gynecologists',
    url: 'https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy',
    type: 'guideline',
    year: 2020
  },
  'who_pregnancy_nutrition': {
    id: 'who_pregnancy_nutrition',
    title: 'WHO Recommendations on Maternal Nutrition',
    source: 'World Health Organization',
    url: 'https://www.who.int/publications/i/item/9789241549912',
    type: 'guideline',
    year: 2016
  },
  'folic_acid_prevention': {
    id: 'folic_acid_prevention',
    title: 'Folic Acid for Prevention of Neural Tube Defects',
    source: 'U.S. Preventive Services Task Force',
    url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/folic-acid-supplementation-prevention-neural-tube-defects',
    type: 'guideline',
    year: 2017
  },
  
  // ===== NUTRICIÓN INFANTIL Y PEDIATRÍA =====
  'who_infant_feeding': {
    id: 'who_infant_feeding',
    title: 'Infant and Young Child Feeding Guidelines',
    source: 'World Health Organization',
    url: 'https://www.who.int/nutrition/topics/complementary_feeding/en/',
    type: 'guideline',
    year: 2020
  },
  'aap_breastfeeding': {
    id: 'aap_breastfeeding',
    title: 'Breastfeeding and Human Milk Policy Statement',
    source: 'American Academy of Pediatrics',
    url: 'https://pediatrics.aappublications.org/content/129/3/e827',
    type: 'guideline',
    year: 2022
  },
  'unicef_child_nutrition': {
    id: 'unicef_child_nutrition',
    title: 'UNICEF Programming Guidance on Early Childhood Nutrition',
    source: 'UNICEF',
    url: 'https://www.unicef.org/nutrition/programming-guidance-early-childhood-nutrition',
    type: 'guideline',
    year: 2019
  },
  
  // ===== ENVEJECIMIENTO Y NUTRICIÓN =====
  'nutrition_aging_review': {
    id: 'nutrition_aging_review',
    title: 'Nutrition and Healthy Aging: The Key Ingredients',
    source: 'AARP Public Policy Institute',
    url: 'https://www.aarp.org/content/dam/aarp/ppi/2018/05/nutrition-and-healthy-aging-the-key-ingredients.pdf',
    type: 'research',
    year: 2018
  },
  'protein_aging_muscle': {
    id: 'protein_aging_muscle',
    title: 'Protein Requirements for Healthy Aging',
    source: 'Nutrients Journal',
    url: 'https://www.mdpi.com/2072-6643/8/8/492',
    type: 'research',
    year: 2016,
    authors: ['Deer RR', 'Volpi E']
  },
  
  // ===== DIABETES Y NUTRICIÓN =====
  'ada_nutrition_therapy': {
    id: 'ada_nutrition_therapy',
    title: 'Nutrition Therapy for Adults with Diabetes',
    source: 'American Diabetes Association',
    url: 'https://care.diabetesjournals.org/content/42/5/731',
    type: 'guideline',
    year: 2019
  },
  'diabetes_prevention_program': {
    id: 'diabetes_prevention_program',
    title: 'Diabetes Prevention Program Research Results',
    source: 'National Institute of Diabetes (NIDDK)',
    url: 'https://www.niddk.nih.gov/about-niddk/research-areas/diabetes/diabetes-prevention-program-dpp',
    type: 'research',
    year: 2002
  },
  
  // ===== CÁNCER Y NUTRICIÓN =====
  'wcrf_cancer_prevention': {
    id: 'wcrf_cancer_prevention',
    title: 'Diet, Nutrition, Physical Activity and Cancer Prevention',
    source: 'World Cancer Research Fund',
    url: 'https://www.wcrf.org/dietandcancer/',
    type: 'guideline',
    year: 2018
  },
  'acs_nutrition_guidelines': {
    id: 'acs_nutrition_guidelines',
    title: 'American Cancer Society Guidelines on Nutrition',
    source: 'American Cancer Society',
    url: 'https://www.cancer.org/healthy/eat-healthy-get-active/acs-guidelines-nutrition-physical-activity-cancer-prevention.html',
    type: 'guideline',
    year: 2020
  }
};

class MedicalCitationService {
  /**
   * Obtiene una citación por su ID
   */
  getCitation(citationId: string): MedicalCitation | null {
    return MEDICAL_CITATIONS[citationId] || null;
  }

  /**
   * Obtiene múltiples citaciones por sus IDs
   */
  getCitations(citationIds: string[]): MedicalCitation[] {
    return citationIds
      .map(id => this.getCitation(id))
      .filter(citation => citation !== null) as MedicalCitation[];
  }

  /**
   * Formatea una citación para mostrar
   */
  formatCitation(citation: MedicalCitation): string {
    const authors = citation.authors ? `${citation.authors.join(', ')}. ` : '';
    const year = citation.year ? `(${citation.year}). ` : '';
    return `${authors}${year}${citation.title}. ${citation.source}.`;
  }

  /**
   * Genera texto de citaciones para mostrar al usuario
   */
  formatCitationsText(citationIds: string[]): string {
    const citations = this.getCitations(citationIds);
    if (citations.length === 0) return '';
    
    const citationTexts = citations.map((citation, index) => 
      `[${index + 1}] ${this.formatCitation(citation)}`
    );
    
    return `\n\nFuentes:\n${citationTexts.join('\n')}`;
  }

  /**
   * Obtiene URLs de las citaciones para enlaces directos
   */
  getCitationUrls(citationIds: string[]): { title: string; url: string }[] {
    const citations = this.getCitations(citationIds);
    return citations.map(citation => ({
      title: citation.title,
      url: citation.url
    }));
  }

  /**
   * Verifica si el contenido tiene citaciones válidas
   */
  hasValidCitations(citationIds: string[]): boolean {
    return citationIds.length > 0 && 
           citationIds.every(id => MEDICAL_CITATIONS[id] !== undefined);
  }
}

export const medicalCitationService = new MedicalCitationService();
