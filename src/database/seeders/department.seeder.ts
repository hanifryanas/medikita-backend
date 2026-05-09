import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { DataSource, Repository } from 'typeorm';
import { Department } from '../../modules/department/entities/department.entity';
import { DepartmentContent } from '../../modules/department/interfaces/department-content.interface';

const DEPARTMENT_SEED: Partial<Department>[] = [
  // Operational units
  {
    typeCode: 'frontoffice',
    displayName: 'Front Office',
    iconName: 'concierge-bell',
    isClinical: false,
    isClinic: false,
    isActive: true,
    content: {
      tagline: 'Your first warm welcome at Medikita.',
      overview:
        'The Front Office is your first point of contact — assisting with registration, appointments, billing inquiries, and general information so your visit feels easy from the moment you arrive.',
      highlights: [
        'Patient registration and check-in',
        'Appointment scheduling and rescheduling',
        'Billing and insurance inquiries',
        'General information and visitor assistance',
      ],
      faq: [
        {
          question: 'Do I need to register before my appointment?',
          answer:
            'Yes, please check in at the Front Office at least 15 minutes before your scheduled time so we can verify your details.',
        },
        {
          question: 'Can the Front Office help with insurance claims?',
          answer:
            'Our team can guide you through the process and connect you with our billing specialists for detailed claim assistance.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'backoffice',
    displayName: 'Back Office',
    iconName: 'building-2',
    isClinical: false,
    isClinic: false,
    isActive: true,
    content: {
      tagline: 'The team behind every smooth visit.',
      overview:
        'The Back Office handles the operations that keep Medikita running — administration, finance, human resources, and partnerships — so our clinical teams can focus on patient care.',
      highlights: [
        'Administration and operational support',
        'Finance, billing, and procurement',
        'Human resources and staff development',
        'Partnership and vendor coordination',
      ],
      faq: [
        {
          question: 'How can I contact the Back Office?',
          answer:
            'Please reach out through our official email or main reception, and your request will be routed to the relevant team.',
        },
        {
          question: 'Does the Back Office handle medical records requests?',
          answer:
            'Medical records requests are coordinated with the Front Office and our records team to ensure proper verification and confidentiality.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'services',
    displayName: 'Support Services',
    iconName: 'wrench',
    isClinical: false,
    isClinic: false,
    isActive: true,
    content: {
      tagline: 'Keeping every corner safe, clean, and ready.',
      overview:
        'Support Services maintain a safe, clean, and well-equipped environment — from facility upkeep and security to housekeeping and logistics — so patients and staff can focus on care.',
      highlights: [
        'Facility maintenance and engineering',
        'Housekeeping and infection control support',
        '24/7 security and visitor management',
        'Logistics and equipment readiness',
      ],
      faq: [
        {
          question: 'Are visitors screened on entry?',
          answer:
            'Yes, all visitors are checked in by security to ensure a safe environment for patients and staff.',
        },
        {
          question: 'Who do I contact for facility issues?',
          answer:
            'Please notify any staff member or the Front Office, and Support Services will respond promptly.',
        },
      ],
    } satisfies DepartmentContent,
  },
  // Clinical support units that do not run an outpatient clinic
  {
    typeCode: 'laboratory',
    displayName: 'Laboratory',
    iconName: 'flask-conical',
    isClinical: true,
    isClinic: false,
    isActive: true,
    content: {
      tagline: 'Accurate results that guide better decisions.',
      overview:
        'Our Laboratory provides reliable and timely diagnostic testing — from routine blood work to specialized panels — supporting clinicians and patients with results they can trust.',
      highlights: [
        'Hematology, chemistry, and urinalysis',
        'Microbiology and serology testing',
        'Pre-employment and health screening packages',
        'Strict quality control and turnaround times',
      ],
      faq: [
        {
          question: 'Do I need to fast before lab tests?',
          answer:
            'Some tests, such as fasting blood sugar and lipid panels, require 8–12 hours of fasting. Please confirm with your doctor or our lab staff.',
        },
        {
          question: 'How long until I receive my results?',
          answer:
            'Most routine tests are ready the same day; specialized tests may take longer and the timeline will be communicated at registration.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'pharmacy',
    displayName: 'Pharmacy',
    iconName: 'pill',
    isClinical: true,
    isClinic: false,
    isActive: true,
    content: {
      tagline: 'Right medicine, clear guidance, every time.',
      overview:
        'Our Pharmacy dispenses medications safely and efficiently, with licensed pharmacists available to explain dosage, side effects, and interactions so you can use your medicine with confidence.',
      highlights: [
        'Prescription dispensing for inpatient and outpatient care',
        'Medication counseling by licensed pharmacists',
        'Drug interaction and allergy screening',
        'Wide selection of generic and branded medicines',
      ],
      faq: [
        {
          question: 'Can I refill my prescription at the Pharmacy?',
          answer:
            'Yes, please bring your previous prescription. For controlled medications, a new prescription from your doctor may be required.',
        },
        {
          question: 'Are generic medicines as effective as branded ones?',
          answer:
            'Generic medicines contain the same active ingredient and meet the same quality standards. Our pharmacists can help you choose the best option.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'radiology',
    displayName: 'Radiology',
    iconName: 'scan',
    isClinical: true,
    isClinic: false,
    isActive: true,
    content: {
      tagline: 'Clear images for confident diagnoses.',
      overview:
        'The Radiology department provides modern imaging services — X-ray, ultrasound, CT, and MRI — interpreted by experienced radiologists to support accurate diagnosis and treatment planning.',
      highlights: [
        'Digital X-ray and fluoroscopy',
        'Ultrasound including obstetric and abdominal scans',
        'CT and MRI scanning',
        'Reports reviewed by board-certified radiologists',
      ],
      faq: [
        {
          question: 'Do I need a referral for an imaging scan?',
          answer:
            'Most imaging studies require a doctor’s referral so the right scan can be selected for your condition.',
        },
        {
          question: 'How should I prepare for an MRI or CT scan?​',
          answer:
            'Specific preparation depends on the scan. Our team will give you instructions when you book, including fasting or removing metal accessories if needed.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'emergency',
    displayName: 'ER',
    iconName: 'siren',
    isClinical: true,
    isClinic: false,
    isActive: true,
    content: {
      tagline: 'Ready for you, around the clock.',
      overview:
        'Our Emergency Room operates 24/7 to provide rapid evaluation and life-saving care for urgent injuries and illnesses, supported by experienced doctors, nurses, and on-call specialists.',
      highlights: [
        '24/7 emergency physicians and nursing team',
        'Rapid triage and resuscitation',
        'On-site imaging and laboratory support',
        'Direct coordination with ICU and specialty teams',
      ],
      faq: [
        {
          question: 'When should I go to the ER?',
          answer:
            'Go immediately for chest pain, difficulty breathing, severe bleeding, sudden weakness, loss of consciousness, or any condition that feels life-threatening.',
        },
        {
          question: 'Do I need an appointment for the ER?',
          answer:
            'No appointment is needed. Patients are prioritized by the severity of their condition through triage.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'generalsurgery',
    displayName: 'Operating Theatre',
    iconName: 'scissors',
    isClinical: true,
    isClinic: false,
    isActive: true,
    content: {
      tagline: 'Safe surgery in a fully equipped, sterile environment.',
      overview:
        'Our Operating Theatre supports planned and emergency surgical procedures across multiple specialties, with modern equipment, strict sterile protocols, and an experienced surgical and anesthesia team.',
      highlights: [
        'Multi-specialty operating rooms',
        'Experienced anesthesiologists and surgical nurses',
        'Strict infection control and sterilization standards',
        'Pre-operative assessment and post-operative recovery care',
      ],
      faq: [
        {
          question: 'How do I prepare for surgery?',
          answer:
            'Your surgeon will guide you through pre-operative tests, fasting instructions, and medication adjustments before the scheduled date.',
        },
        {
          question: 'Will I meet the anesthesiologist before surgery?',
          answer:
            'Yes, you will have a pre-operative consultation to review your medical history and discuss the type of anesthesia.',
        },
      ],
    } satisfies DepartmentContent,
  },

  // Clinic departments (poli) that run an outpatient clinic where patients can book consultation appointments
  {
    typeCode: 'cardiology',
    displayName: 'Heart Center',
    iconName: 'heart-pulse',
    description:
      'Expert diagnosis and treatment for heart and cardiovascular conditions.',
    featuredOrdinal: 2,
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Caring for every beat of your life.',
      overview:
        'Our Heart Center provides comprehensive cardiovascular care, from preventive screening to advanced diagnostics and management of complex heart conditions, supported by experienced cardiologists and modern imaging technology.',
      highlights: [
        'Board-certified cardiologists with subspecialty expertise',
        'Echocardiography, ECG, treadmill stress test, and Holter monitoring',
        'Personalized prevention plans for hypertension and high cholesterol',
        'Coordinated care with internal medicine and rehabilitation',
      ],
      faq: [
        {
          question: 'When should I see a cardiologist?',
          answer:
            'Consider a consultation if you experience chest pain, shortness of breath, palpitations, or have risk factors such as hypertension, diabetes, or a family history of heart disease.',
        },
        {
          question: 'Do I need a referral?',
          answer:
            'No referral is required. You can book a consultation directly through our app or front office.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'dermatology',
    displayName: 'Skin & Aesthetic',
    iconName: 'sparkles',
    description:
      'Specialized care for skin conditions, cosmetic treatments, and aesthetic procedures.',
    featuredOrdinal: 3,
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Healthy skin, restored confidence.',
      overview:
        'A full-service dermatology and aesthetic clinic offering medical treatment for skin conditions and evidence-based cosmetic procedures performed by certified dermatologists.',
      highlights: [
        'Acne, eczema, psoriasis, and pigmentation management',
        'Laser treatments, chemical peels, and skin rejuvenation',
        'Pediatric and adult dermatology',
        'Personalized skincare regimens',
      ],
      faq: [
        {
          question: 'Are aesthetic procedures safe?',
          answer:
            'All procedures are performed by licensed dermatologists using approved devices and protocols, with a thorough consultation before any treatment.',
        },
        {
          question: 'How long until I see results?',
          answer:
            'Results vary by treatment — some, like peels, show effects within days, while others may take several weeks of consistent care.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'pediatrics',
    displayName: 'Children Care',
    iconName: 'baby',
    description:
      'Dedicated medical care for infants, children, and adolescents.',
    featuredOrdinal: 4,
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Gentle, expert care from the very first day.',
      overview:
        'Comprehensive pediatric services covering well-child checkups, immunizations, growth monitoring, and treatment of common and complex childhood illnesses in a child-friendly environment.',
      highlights: [
        'Routine immunization following national schedule',
        'Growth and developmental assessments',
        'Management of asthma, allergies, and infections',
        'Family-centered consultation and education',
      ],
      faq: [
        {
          question: 'At what age can my child see a pediatrician?',
          answer:
            'Our pediatricians care for patients from newborn through 18 years of age.',
        },
        {
          question: 'Do you offer vaccination?',
          answer:
            'Yes, we provide all routine and recommended vaccines according to the national immunization program.',
        },
        {
          question: 'What should I bring to my child’s first visit?',
          answer:
            'Please bring your child’s immunization record, any previous medical reports, and a list of current medications or allergies.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'neurology',
    displayName: 'Neuroscience Center',
    iconName: 'brain',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Advanced care for the brain, spine, and nervous system.',
      overview:
        'Diagnosis and management of disorders of the brain, spine, and nervous system, including headache, stroke prevention, epilepsy, and movement disorders.',
      highlights: [
        'Stroke risk assessment and prevention',
        'EEG and nerve conduction studies',
        'Headache and migraine clinics',
        'Multidisciplinary care with rehabilitation',
      ],
      faq: [
        {
          question: 'When should I worry about headaches?',
          answer:
            'Seek evaluation if headaches are sudden and severe, worsening, or accompanied by neurological symptoms such as weakness or vision changes.',
        },
        {
          question: 'Do you handle stroke rehabilitation?',
          answer:
            'Yes, we work closely with our rehabilitation team for post-stroke recovery and prevention of recurrence.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'orthopedics',
    displayName: 'Bone, Joint, & Mobility Center',
    iconName: 'bone',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Helping you move freely again.',
      overview:
        'Care for bone, joint, and musculoskeletal conditions — from sports injuries to degenerative joint disease — with conservative and surgical treatment options.',
      highlights: [
        'Sports injury evaluation and recovery',
        'Joint pain and arthritis management',
        'Fracture care and post-surgical follow-up',
        'Coordination with physical rehabilitation',
      ],
      faq: [
        {
          question: 'Do I need surgery for joint pain?',
          answer:
            'Most cases respond to non-surgical treatment such as medication, physiotherapy, and lifestyle changes. Surgery is considered only when needed.',
        },
        {
          question: 'Can I walk-in for an injury?',
          answer:
            'For acute injuries, please visit the ER. For follow-up or chronic concerns, please book a consultation.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'obgyn',
    displayName: "Women's Health & Maternity Care",
    iconName: 'heart-handshake',
    description:
      'Comprehensive care for pregnancy, childbirth, and reproductive health.',
    featuredOrdinal: 1,
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Trusted partners through every stage of womanhood.',
      overview:
        'End-to-end obstetric and gynecologic services including prenatal care, delivery, postpartum support, and management of reproductive health concerns at every life stage.',
      highlights: [
        'Routine and high-risk prenatal care',
        '4D ultrasound and fetal monitoring',
        'Family planning and fertility consultation',
        'Screening for cervical and breast health',
      ],
      faq: [
        {
          question: 'When should I start prenatal visits?',
          answer:
            'As soon as you know you are pregnant — ideally in the first trimester — to establish a baseline and plan your care.',
        },
        {
          question: 'Do you support natural birth and C-section?',
          answer:
            'Yes, we support both, with delivery plans tailored to medical needs and personal preferences.',
        },
        {
          question: 'How often will I have check-ups during pregnancy?',
          answer:
            'Typically once a month in the first two trimesters, every two weeks in the third trimester, and weekly in the final month — adjusted based on your individual needs.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'oncology',
    displayName: 'Comprehensive Cancer Center',
    iconName: 'ribbon',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'A united team standing with you against cancer.',
      overview:
        'A multidisciplinary cancer care program providing screening, diagnosis, treatment planning, and supportive care, with a focus on patient-centered outcomes.',
      highlights: [
        'Cancer screening and early detection',
        'Chemotherapy and targeted therapy',
        'Multidisciplinary tumor board review',
        'Pain management and palliative support',
      ],
      faq: [
        {
          question: 'Do you offer cancer screening?',
          answer:
            'Yes, we offer screening for breast, cervical, colorectal, and other cancers based on age and risk factors.',
        },
        {
          question: 'Will I be cared for by one doctor or a team?',
          answer:
            'Cancer care is delivered by a coordinated team including oncologists, surgeons, radiologists, and supportive care specialists.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'otolaryngology',
    displayName: 'ENT (Ear, Nose, & Throat) Care',
    iconName: 'ear',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline:
        'Specialized care so you can hear, breathe, and speak with ease.',
      overview:
        'Evaluation and treatment of conditions affecting the ear, nose, throat, and related head and neck structures, for both adults and children.',
      highlights: [
        'Hearing loss and balance disorder evaluation',
        'Sinusitis, allergy, and snoring management',
        'Pediatric ENT including tonsil and adenoid care',
        'Voice and swallowing assessment',
      ],
      faq: [
        {
          question: 'When should I see an ENT?',
          answer:
            'Persistent ear pain, hearing changes, chronic nasal congestion, sore throat, or hoarseness lasting more than two weeks warrant an evaluation.',
        },
        {
          question: 'Do you perform hearing tests?',
          answer:
            'Yes, we provide audiometry and other diagnostic hearing tests on-site.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'ophthalmology',
    displayName: 'Eye Center',
    iconName: 'eye',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Clear vision for every stage of life.',
      overview:
        'Comprehensive eye care from routine vision checks to diagnosis and treatment of eye diseases such as cataracts, glaucoma, and retinal conditions.',
      highlights: [
        'Comprehensive eye examination',
        'Cataract evaluation and surgical referral',
        'Glaucoma screening and monitoring',
        'Diabetic retinopathy care',
      ],
      faq: [
        {
          question: 'How often should I have an eye exam?',
          answer:
            'Adults should have a comprehensive exam every 1–2 years, or annually if you have diabetes, hypertension, or a family history of eye disease.',
        },
        {
          question: 'Do you prescribe glasses and contact lenses?',
          answer:
            'Yes, refraction and prescriptions for both glasses and contact lenses are part of our standard service.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'urology',
    displayName: 'Urology Center',
    iconName: 'droplets',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Confidential care for urinary and reproductive health.',
      overview:
        'Care for conditions of the urinary tract and male reproductive system, including kidney stones, prostate health, and urinary infections.',
      highlights: [
        'Kidney stone diagnosis and management',
        'Prostate health screening',
        'Urinary tract infection treatment',
        'Men’s health and fertility consultation',
      ],
      faq: [
        {
          question: 'When should men start prostate screening?',
          answer:
            'Discuss screening with your doctor starting at age 50, or earlier if you have a family history of prostate cancer.',
        },
        {
          question: 'Do you treat both men and women?',
          answer:
            'Yes, urologists care for both men and women with urinary tract concerns.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'internist',
    displayName: 'Internist & Adult Care Center',
    iconName: 'stethoscope',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Whole-person care for adults at every age.',
      overview:
        'Comprehensive care for adults, focused on prevention, diagnosis, and long-term management of chronic conditions such as hypertension, diabetes, and gastrointestinal disorders.',
      highlights: [
        'Annual health screening and preventive care',
        'Chronic disease management',
        'Coordination across specialties',
        'Pre-operative medical evaluation',
      ],
      faq: [
        {
          question: 'Should I see an internist or a specialist first?',
          answer:
            'Internists are excellent first points of contact for adult care and can refer you to a specialist if needed.',
        },
        {
          question: 'Do you offer routine check-ups?',
          answer:
            'Yes, we provide annual physicals and tailored health screenings based on age and risk factors.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'psychiatry',
    displayName: 'Mental Health & Wellness',
    iconName: 'brain-cog',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'A safe space to feel heard and find balance.',
      overview:
        'Confidential, compassionate care for mental health concerns including anxiety, depression, sleep problems, and stress, delivered by licensed psychiatrists.',
      highlights: [
        'Evaluation and treatment for anxiety and depression',
        'Sleep and stress management',
        'Medication management when appropriate',
        'Coordination with counseling and therapy',
      ],
      faq: [
        {
          question: 'Is my consultation confidential?',
          answer:
            'Yes, all consultations follow strict medical confidentiality standards.',
        },
        {
          question: 'Will I need medication?',
          answer:
            'Not necessarily. Treatment plans are individualized and may include lifestyle support, therapy, medication, or a combination.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'physiatry',
    displayName: 'Physical Medicine & Rehabilitation',
    iconName: 'accessibility',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Recover stronger, move better, live fuller.',
      overview:
        'Restoring function and quality of life through evidence-based rehabilitation for patients recovering from injury, surgery, stroke, or chronic conditions.',
      highlights: [
        'Post-stroke and post-surgical rehabilitation',
        'Sports injury and musculoskeletal recovery',
        'Pain management without surgery',
        'Individualized therapy programs',
      ],
      faq: [
        {
          question: 'Do I need a referral for rehabilitation?',
          answer:
            'A referral is helpful but not required — you can book an evaluation directly.',
        },
        {
          question: 'How long does rehabilitation take?',
          answer:
            'Duration varies by condition; your physiatrist will design a plan with clear milestones.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'pulmonology',
    displayName: 'Respiratory Care',
    iconName: 'wind',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Breathe easier with expert lung care.',
      overview:
        'Specialized diagnosis and treatment for lung and breathing disorders such as asthma, COPD, chronic cough, and sleep-related breathing problems.',
      highlights: [
        'Asthma and COPD management',
        'Spirometry and lung function testing',
        'Chronic cough and shortness of breath evaluation',
        'Smoking cessation support',
      ],
      faq: [
        {
          question: 'When should I see a pulmonologist?',
          answer:
            'See a specialist for persistent cough, wheezing, recurrent chest infections, or unexplained shortness of breath.',
        },
        {
          question: 'Do you perform lung function tests?',
          answer: 'Yes, spirometry and related tests are available on-site.',
        },
      ],
    } satisfies DepartmentContent,
  },
  {
    typeCode: 'endocrinology',
    displayName: 'Diabetes, Thyroid & Hormone Care',
    iconName: 'activity',
    isClinical: true,
    isClinic: true,
    isActive: true,
    content: {
      tagline: 'Personalized care for diabetes, thyroid, and hormone health.',
      overview:
        'Care for hormonal and metabolic conditions including diabetes, thyroid disorders, and other endocrine issues, with a focus on long-term wellness.',
      highlights: [
        'Diabetes diagnosis and individualized management',
        'Thyroid disease evaluation and treatment',
        'Hormonal imbalance assessment',
        'Nutrition and lifestyle counseling',
      ],
      faq: [
        {
          question: 'How often should I check my blood sugar?',
          answer:
            'Frequency depends on your treatment plan; your endocrinologist will recommend a schedule tailored to your condition.',
        },
        {
          question: 'Do you handle thyroid problems?',
          answer:
            'Yes, including hypothyroidism, hyperthyroidism, and thyroid nodule evaluation.',
        },
      ],
    } satisfies DepartmentContent,
  },
];

@Injectable()
export class DepartmentSeeder implements Seeder {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed() {
    await this.dataSource.transaction(async (manager) => {
      for (const dept of DEPARTMENT_SEED) {
        const existing = await manager.findOne(Department, {
          where: { typeCode: dept.typeCode },
        });
        if (existing) {
          await manager.update(Department, existing.departmentId, {
            displayName: dept.displayName,
            iconName: dept.iconName,
            description: dept.description ?? null,
            content: dept.content ?? null,
            featuredOrdinal: dept.featuredOrdinal ?? null,
            isClinical: dept.isClinical,
            isClinic: dept.isClinic,
            isActive: dept.isActive,
          });
        } else {
          await manager.save(Department, manager.create(Department, dept));
        }
      }

      console.log(`Seeded ${DEPARTMENT_SEED.length} departments`);
    });
  }

  async drop() {
    await this.departmentRepository.delete({});
  }
}
