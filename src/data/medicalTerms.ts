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
  // ── Lab Report Terms ──────────────────────────────────────────────────────
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

  // ── Radiology / X-Ray Terms ──────────────────────────────────────────────
  {
    term: 'Opacity',
    aliases: ['opacity', 'opacities', 'opacification'],
    simple: 'A white or bright area on an X-ray that means something is blocking the X-ray beam — often fluid, tissue, or infection.',
    whyItMatters: 'Unexpected opacities can indicate pneumonia, fluid build-up, or other lung conditions that need attention.',
    normalRole: 'In a healthy chest X-ray the lungs appear dark (air-filled); opaque areas usually signal a problem.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Opacity_(optics)',
  },
  {
    term: 'Consolidation',
    aliases: ['consolidation', 'consolidations'],
    simple: 'A patch in the lung where air has been replaced by fluid, pus, or tissue — often seen as a solid white area on X-ray.',
    whyItMatters: 'It is a key sign of pneumonia or other lung infections and usually needs medical treatment.',
    normalRole: 'In a healthy lung, the air spaces are clear; consolidation means they have filled up with something other than air.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pulmonary_consolidation',
  },
  {
    term: 'Infiltrate',
    aliases: ['infiltrate', 'infiltrates', 'infiltration'],
    simple: 'Hazy or patchy white areas on a chest X-ray, usually indicating fluid, cells, or infection in the lung tissue.',
    whyItMatters: 'Infiltrates can be a sign of pneumonia, tuberculosis, or fluid leaking into the lungs.',
    normalRole: 'Healthy lung tissue appears dark and clear on X-ray; infiltrates suggest something has moved into the lung spaces.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pulmonary_infiltrate',
  },
  {
    term: 'Cardiomegaly',
    aliases: ['cardiomegaly', 'enlarged heart'],
    simple: 'When the heart appears larger than normal on an X-ray or scan.',
    whyItMatters: 'It can be a sign of heart failure, high blood pressure, or other heart conditions that need evaluation.',
    normalRole: 'A normal heart takes up less than half the width of the chest on an X-ray.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Cardiomegaly',
  },
  {
    term: 'Pleural Effusion',
    aliases: ['pleural effusion', 'pleural effusions', 'pleural fluid'],
    simple: 'A build-up of fluid in the space between the lung and the chest wall.',
    whyItMatters: 'It can make breathing harder and may indicate heart failure, infection, or other conditions.',
    normalRole: 'Normally only a tiny amount of fluid exists in this space to lubricate the lung surfaces.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pleural_effusion',
  },
  {
    term: 'Pneumothorax',
    aliases: ['pneumothorax', 'collapsed lung'],
    simple: 'A collapsed lung — air leaks into the space between the lung and chest wall, causing the lung to partially or fully deflate.',
    whyItMatters: 'It can cause sudden chest pain and shortness of breath and is a medical emergency in severe cases.',
    normalRole: 'Normally the lungs stay fully expanded because the space around them is sealed with no air.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pneumothorax',
  },
  {
    term: 'Atelectasis',
    aliases: ['atelectasis'],
    simple: 'A partial or complete collapse of a section of the lung, meaning it isn\u2019t fully inflated.',
    whyItMatters: 'It can reduce oxygen levels and is often caused by blockages, pressure, or after surgery.',
    normalRole: 'Healthy lungs remain fully open during each breath; atelectasis means some air sacs have collapsed.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Atelectasis',
  },
  {
    term: 'Calcification',
    aliases: ['calcification', 'calcifications', 'calcified'],
    simple: 'Calcium deposits that appear as very bright white spots on an X-ray.',
    whyItMatters: 'They are often harmless (old healed infections, aging) but can sometimes indicate tumors or artery disease.',
    normalRole: 'Small amounts of calcification are a normal result of healing and aging in many tissues.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Calcification',
  },
  {
    term: 'Nodule',
    aliases: ['nodule', 'nodules', 'pulmonary nodule'],
    simple: 'A small round growth or spot (usually less than 3 cm) seen on an X-ray or CT scan.',
    whyItMatters: 'Most nodules are benign (harmless), but some may need follow-up to rule out cancer or infection.',
    normalRole: 'Healthy lungs don\u2019t have nodules; their presence may reflect a past infection, scar tissue, or rarely a tumor.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pulmonary_nodule',
  },
  {
    term: 'Pneumonia',
    aliases: ['pneumonia'],
    simple: 'An infection in one or both lungs that causes the air sacs to fill with fluid or pus.',
    whyItMatters: 'It can range from mild to life-threatening and causes symptoms like fever, cough, and difficulty breathing.',
    normalRole: 'Not applicable — in healthy lungs there is no infection.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pneumonia',
  },
  {
    term: 'Fracture',
    aliases: ['fracture', 'fractures', 'fractured'],
    simple: 'A break in a bone, which appears as a line or gap on an X-ray.',
    whyItMatters: 'Fractures need proper treatment to heal correctly and prevent long-term complications.',
    normalRole: 'Bones should be continuous and unbroken on an X-ray.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bone_fracture',
  },
  {
    term: 'Effusion',
    aliases: ['effusion'],
    simple: 'A build-up of excess fluid in a body cavity, such as around the lungs or heart.',
    whyItMatters: 'It can restrict organ function and often signals an underlying condition like infection or heart failure.',
    normalRole: 'Body cavities normally contain only a small amount of lubricating fluid.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Effusion',
  },
  {
    term: 'Hyperinflation',
    aliases: ['hyperinflation', 'hyperinflated'],
    simple: 'Over-inflated lungs on an X-ray — the lungs appear larger than normal because air is trapped inside.',
    whyItMatters: 'It is a common sign of COPD or asthma where air cannot fully escape during breathing.',
    normalRole: 'Healthy lungs inflate and deflate smoothly with each breath; trapped air causes hyperinflation.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Hyperinflation_(medicine)',
  },
  {
    term: 'Scoliosis',
    aliases: ['scoliosis'],
    simple: 'An abnormal sideways curve of the spine, visible on an X-ray.',
    whyItMatters: 'Severe curves can affect posture, breathing, and cause chronic pain; mild cases are often monitored.',
    normalRole: 'A healthy spine is straight when viewed from the front or back.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Scoliosis',
  },
  {
    term: 'Atherosclerosis',
    aliases: ['atherosclerosis', 'arterial calcification', 'aortic calcification'],
    simple: 'The hardening and narrowing of arteries due to plaque build-up, sometimes visible as bright lines on X-ray.',
    whyItMatters: 'It increases the risk of heart attack and stroke by reducing blood flow through arteries.',
    normalRole: 'Healthy arteries are flexible and open; atherosclerosis stiffens and narrows them over time.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Atherosclerosis',
  },
  {
    term: 'Diaphragm',
    aliases: ['diaphragm'],
    simple: 'The dome-shaped muscle below the lungs that controls breathing.',
    whyItMatters: 'An elevated or flattened diaphragm on X-ray can hint at lung disease, fluid, or nerve problems.',
    normalRole: 'It contracts to pull air into the lungs when you breathe in, then relaxes to push air out.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Thoracic_diaphragm',
  },
  {
    term: 'Hilar',
    aliases: ['hilar', 'hilum', 'hilar enlargement'],
    simple: 'The central area of each lung where blood vessels, airways, and lymph nodes connect — visible as a root-like structure on X-ray.',
    whyItMatters: 'Enlarged or prominent hilar areas can indicate infection, sarcoidosis, or lymph node swelling.',
    normalRole: 'Normal hila are visible but not prominent; any significant enlargement warrants further investigation.',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Hilum_of_lung',
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
