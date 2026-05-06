import { fakerID_ID as faker_ID } from '@faker-js/faker';

const STREET_NAME_POOL = [
  // Pulau (Islands)
  'Jawa',
  'Sumatra',
  'Kalimantan',
  'Sulawesi',
  'Bali',
  'Lombok',
  'Sumbawa',
  'Flores',
  'Timor',
  'Seram',
  'Halmahera',
  'Nusantara',
  'Nusa Penida',
  'Nusa Tenggara',
  // Pahlawan (Heroes)
  'Diponegoro',
  'Ahmad Yani',
  'Kartini',
  'Soekarno Hatta',
  'Imam Bonjol',
  'Gajah Mada',
  'Hayam Wuruk',
  'Panglima Sudirman',
  'Cokroaminoto',
  'Thamrin',
  'Mastrip',
  'Dr. Sutomo',
  'Slamet Riyadi',
  'Pahlawan',
  'MT Haryono',
  'S Parman',
  'Basuki Rahmat',
  // Buah (Fruits)
  'Mangga',
  'Rambutan',
  'Durian',
  'Jambu',
  'Nangka',
  'Jeruk',
  'Pisang',
  'Salak',
  // Sungai (Rivers)
  'Barito',
  'Kapuas',
  'Ciliwung',
  'Citarum',
  'Musi',
  // Burung (Birds)
  'Merpati',
  'Manyar',
  'Sriti',
  'Sikatan',
  'Cendrawasih',
  'Kutilang',
  'Kenari',
  'Kaswari',
  'Podang',
  // Bunga (Flowers)
  'Anggrek',
  'Kemuning',
  'Telasih',
  'Kamboja',
  'Seroja',
  'Mawar',
  'Cempaka',
  'Seruni',
  'Arum',
  'Kenongo',
  'Pudak',
  'Menur',
  'Trengguli',
  'Melati',
];

export function generateMadiunAddress(): string {
  const streetName = faker_ID.helpers.arrayElement(STREET_NAME_POOL);
  const streetNumber = faker_ID.number.int({ min: 1, max: 200 });
  return `Jl. ${streetName} No. ${streetNumber}, Kota Madiun, Jawa Timur, Indonesia`;
}
