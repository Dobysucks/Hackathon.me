export type MedicalTerm = {
  /** Canonical display key */
  term: string;
  /** Alternative surface forms found in report text (matched case-insensitively) */
  aliases: string[];
  simple: string;
  whyItMatters: string;
  normalRole: string;
  wikipediaUrl: string;
};

export const MEDICAL_TERMS: MedicalTerm[] = [
  {
    term: 'Hemoglobin',
    aliases: ['hemoglobin', 'haemoglobin', 'hgb'],
    simple: 'A protein in red blood cells that carries oxygen from your lungs to the rest of your body.',
    whyItMatters: 'Low levels can mean anemia (not enough oxygen-carrying capacity); high levels can point to dehydration or other conditions.',
    normalRole: 'It binds oxygen in the lungs and releases it to tissues throughout the body, giving blood its red color.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Hemoglobin',
  },
  {
    term: 'Glucose',
    aliases: ['glucose', 'blood sugar', 'blood glucose'],
    simple: 'The main sugar found in your blood, used by your body as its primary source of energy.',
    whyItMatters: 'Consistently high glucose may indicate prediabetes or diabetes; very low glucose can cause dizziness or fainting.',
    normalRole: 'Cells use glucose for energy, and insulin helps move it from the bloodstream into cells.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Blood_glucose',
  },
  {
    term: 'Cholesterol',
    aliases: ['cholesterol'],
    simple: 'A fat-like substance in your blood used to build cells and hormones.',
    whyItMatters: 'Too much of certain types can build up in artery walls and raise the risk of heart disease.',
    normalRole: 'It helps make cell membranes, vitamin D, and hormones like estrogen and testosterone.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Cholesterol',
  },
  {
    term: 'Tumor Marker',
    aliases: ['tumor marker', 'tumour marker', 'tumor markers'],
    simple: 'A substance in the blood that can be elevated when certain cancers or other conditions are present.',
    whyItMatters: 'An elevated marker can prompt further testing, but it does not by itself confirm cancer — many benign conditions raise these markers too.',
    normalRole: 'In healthy people these substances are usually present at low, stable levels as part of normal cell turnover.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Tumor_marker',
  },
  {
    term: 'Anemia',
    aliases: ['anemia', 'anaemia'],
    simple: 'A condition where you don\u2019t have enough healthy red blood cells to carry adequate oxygen.',
    whyItMatters: 'It can cause fatigue, weakness, and shortness of breath, and may signal an underlying nutritional or chronic condition.',
    normalRole: 'Not applicable — this describes a deficiency state rather than a normal body process.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Anemia',
  },
  {
    term: 'Renal Failure',
    aliases: ['renal failure', 'kidney failure'],
    simple: 'A condition where the kidneys lose most or all of their ability to filter waste from the blood.',
    whyItMatters: 'Waste and fluid can build up in the body, which can be dangerous and often needs urgent medical care.',
    normalRole: 'Not applicable — healthy kidneys normally filter blood, balance fluids, and remove waste as urine.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Kidney_failure',
  },
  {
    term: 'Liver Disease',
    aliases: ['liver disease'],
    simple: 'A broad term for conditions that damage the liver and affect how well it works.',
    whyItMatters: 'The liver processes toxins, nutrients, and medications, so damage can affect the whole body over time.',
    normalRole: 'Not applicable — a healthy liver filters blood, produces bile for digestion, and stores energy.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Liver_disease',
  },
  {
    term: 'Creatinine',
    aliases: ['creatinine'],
    simple: 'A waste product from muscle activity that your kidneys filter out of the blood.',
    whyItMatters: 'Higher-than-normal levels can be an early sign that the kidneys aren\u2019t filtering waste efficiently.',
    normalRole: 'It is produced at a steady rate by muscles and removed from the blood by the kidneys.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Creatinine',
  },
  {
    term: 'Triglycerides',
    aliases: ['triglycerides', 'triglyceride'],
    simple: 'A type of fat carried in your blood that stores unused calories for energy.',
    whyItMatters: 'High levels are linked to an increased risk of heart disease and pancreatitis.',
    normalRole: 'They store energy between meals and are released when the body needs fuel.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Triglyceride',
  },
  {
    term: 'Platelets',
    aliases: ['platelets', 'platelet'],
    simple: 'Small blood cell fragments that help your blood clot and stop bleeding.',
    whyItMatters: 'Too few can lead to easy bruising or bleeding; too many can increase clotting risk.',
    normalRole: 'They clump together at injury sites to form clots and stop bleeding.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Platelet',
  },
  {
    term: 'White Blood Cells',
    aliases: ['white blood cells', 'white blood cell', 'wbc'],
    simple: 'Cells in your immune system that help fight infections.',
    whyItMatters: 'High counts can suggest infection or inflammation; low counts can mean a weakened immune system.',
    normalRole: 'They detect and destroy bacteria, viruses, and other invaders in the body.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/White_blood_cell',
  },
  {
    term: 'Red Blood Cells',
    aliases: ['red blood cells', 'red blood cell', 'rbc'],
    simple: 'Cells in your blood that carry oxygen from the lungs to the rest of the body.',
    whyItMatters: 'Abnormal counts can point to anemia, dehydration, or bone marrow conditions.',
    normalRole: 'They transport oxygen using hemoglobin and carry carbon dioxide back to the lungs.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Red_blood_cell',
  },
  {
    term: 'Bilirubin',
    aliases: ['bilirubin'],
    simple: 'A yellowish substance made when old red blood cells break down, processed by the liver.',
    whyItMatters: 'High levels can cause jaundice (yellowing of skin/eyes) and may signal liver or bile duct problems.',
    normalRole: 'The liver normally clears it from the blood and excretes it in bile.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bilirubin',
  },
  {
    term: 'Sodium',
    aliases: ['sodium'],
    simple: 'A mineral (electrolyte) that helps control fluid balance and nerve function.',
    whyItMatters: 'Abnormal levels can affect brain, muscle, and heart function and often reflect hydration status.',
    normalRole: 'It helps regulate the amount of water in and around cells and supports nerve signaling.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Sodium_in_biology',
  },
  {
    term: 'Potassium',
    aliases: ['potassium'],
    simple: 'A mineral (electrolyte) important for heart and muscle function.',
    whyItMatters: 'Levels that are too high or too low can cause dangerous heart rhythm problems.',
    normalRole: 'It helps nerves and muscles, including the heart, contract properly.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Potassium',
  },
  {
    term: 'HDL',
    aliases: ['hdl', 'hdl cholesterol', 'good cholesterol'],
    simple: 'Often called \u201cgood cholesterol,\u201d it helps remove excess cholesterol from your bloodstream.',
    whyItMatters: 'Higher HDL levels are generally linked to a lower risk of heart disease.',
    normalRole: 'It carries excess cholesterol from tissues back to the liver for removal.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/High-density_lipoprotein',
  },
  {
    term: 'LDL',
    aliases: ['ldl', 'ldl cholesterol', 'bad cholesterol'],
    simple: 'Often called \u201cbad cholesterol,\u201d it can build up in artery walls when levels are too high.',
    whyItMatters: 'High LDL is a major risk factor for atherosclerosis and heart disease.',
    normalRole: 'It carries cholesterol to cells that need it for building membranes and hormones.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Low-density_lipoprotein',
  },
  {
    term: 'Thyroid',
    aliases: ['thyroid'],
    simple: 'A small gland in your neck that produces hormones controlling metabolism.',
    whyItMatters: 'An overactive or underactive thyroid can affect weight, energy, mood, and heart rate.',
    normalRole: 'It releases hormones (T3 and T4) that regulate how your body uses energy.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Thyroid',
  },
  {
    term: 'TSH',
    aliases: ['tsh', 'thyroid stimulating hormone'],
    simple: 'A hormone from the pituitary gland that tells the thyroid how much hormone to make.',
    whyItMatters: 'High or low TSH can indicate an underactive or overactive thyroid.',
    normalRole: 'It signals the thyroid gland to produce more or less thyroid hormone as needed.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Thyroid-stimulating_hormone',
  },
  {
    term: 'Hematocrit',
    aliases: ['hematocrit', 'haematocrit'],
    simple: 'The percentage of your blood volume made up of red blood cells.',
    whyItMatters: 'Low values can indicate anemia or blood loss; high values can indicate dehydration or other conditions.',
    normalRole: 'It reflects the blood\u2019s capacity to carry oxygen via red blood cells.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Hematocrit',
  },
  {
    term: 'Vitamin D',
    aliases: ['vitamin d'],
    simple: 'A vitamin your body makes from sunlight (or gets from food) that supports bone health.',
    whyItMatters: 'Low levels are linked to weaker bones and have been associated with several other health issues.',
    normalRole: 'It helps your body absorb calcium and supports immune and muscle function.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Vitamin_D',
  },
  {
    term: 'Albumin',
    aliases: ['albumin'],
    simple: 'The most common protein in your blood, made by the liver.',
    whyItMatters: 'Low levels can suggest liver or kidney disease, malnutrition, or inflammation.',
    normalRole: 'It helps keep fluid inside blood vessels and carries hormones, vitamins, and drugs through the blood.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Human_serum_albumin',
  },
  {
    term: 'Uric Acid',
    aliases: ['uric acid'],
    simple: 'A waste product formed when your body breaks down purines from food and cells.',
    whyItMatters: 'High levels can cause gout (painful joint inflammation) or kidney stones.',
    normalRole: 'It is normally dissolved in blood, filtered by the kidneys, and passed out in urine.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Uric_acid',
  },
];

/**
 * Build a single case-insensitive regex that matches any known term/alias,
 * longest phrases first so multi-word terms take priority over substrings.
 */
export function buildTermMatcher(): { regex: RegExp; lookup: Map<string, MedicalTerm> } {
  const lookup = new Map<string, MedicalTerm>();
  const allAliases: string[] = [];

  for (const entry of MEDICAL_TERMS) {
    for (const alias of entry.aliases) {
      lookup.set(alias.toLowerCase(), entry);
      allAliases.push(alias);
    }
  }

  const sorted = [...allAliases].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

  return { regex, lookup };
}
