import { fakerID_ID as faker_ID } from '@faker-js/faker';

const STREET_NAME_POOL = [
  // Bunga (Flowers)
  'Melati',
  'Mawar',
  'Anggrek',
  'Kenanga',
  'Dahlia',
  'Flamboyan',
  'Bougenville',
  'Teratai',
  'Cempaka',
  'Kamboja',
  // Pahlawan (Heroes)
  'Diponegoro',
  'Sudirman',
  'Ahmad Yani',
  'Kartini',
  'Soekarno',
  'Hatta',
  'Imam Bonjol',
  'Gajah Mada',
  'Hayam Wuruk',
  'Panglima Sudirman',
  // Buah (Fruits)
  'Mangga',
  'Rambutan',
  'Durian',
  'Jambu',
  'Nangka',
  'Kelapa',
  'Pisang',
  'Salak',
  // Pohon (Trees)
  'Jati',
  'Cemara',
  'Beringin',
  'Mahoni',
  'Pinus',
  'Bambu',
  'Akasia',
  // Hewan (Animals)
  'Rajawali',
  'Elang',
  'Merpati',
  'Kutilang',
  'Cendrawasih',
  'Garuda',
  // Geografi (Geography)
  'Kahuripan',
  'Lawu',
  'Wilis',
  'Slamet Riyadi',
  'Pahlawan',
  'Merdeka',
];

export function generateMadiunAddress(): string {
  const streetName = faker_ID.helpers.arrayElement(STREET_NAME_POOL);
  const streetNumber = faker_ID.number.int({ min: 1, max: 200 });
  return `Jl. ${streetName} No. ${streetNumber}, Kota Madiun, Jawa Timur, Indonesia`;
}
