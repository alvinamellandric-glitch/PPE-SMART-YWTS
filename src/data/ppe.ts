export interface NavLink {
  label: string;
  href: string;
}

export interface PPEItem {
  id: string;
  name: string;
  category: string;
  totalStock: number;
  availableStock: number;
  unit: string;
  requiresReturn: boolean;
  canIndentIfEmpty: boolean;
  description: string;
  hasSubtype?: boolean;
  sizes?: string[];
}

export interface BorrowableItem {
  id: string;
  name: string;
  category: string;
  totalStock: number;
  availableStock: number;
  unit: string;
  requiresReturn: boolean;
  canIndentIfEmpty: boolean;
  description: string;
  hasSubtype?: boolean;
  sizes?: string[];
}

export interface ConsumableItem {
  id: string;
  label: string;
  unit: string;
  stock: number;
  hasSubtype?: boolean;
  canIndentIfEmpty: boolean;
  description?: string;
}

// 1. Ekspor yang dibutuhkan Header.tsx
export const navLinks: NavLink[] = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Form Pinjam', href: '#portal-peminjaman' },
  { label: 'Form Permintaan', href: '#portal-permintaan' },
  { label: 'Panduan K3', href: '#panduan-k3' }
];

// 2. Ekspor yang dibutuhkan Hero.tsx
export const heroImage = 'https://www.samudera.id/public_assets/img/about-ywts.png';

// 3. Konfigurasi Divisi & Ukuran
export const departments: string[] = [
  'Produksi',
  'QHSE',
  'Fasilitas',
  'Ship Building',
  'PPC',
  'Subcon',
  'Engineering',
  'Finance',
  'HC',
  'Marketing'
];

export const wearpackSizes: string[] = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const sopSteps: string[] = [
  'Pilih APD yang dibutuhkan pada formulir peminjaman atau permintaan.',
  'Isi identitas diri, divisi, serta keperluan tugas operasional secara lengkap.',
  'Ambil APD di ruang logistik QHSE dan konfirmasikan nomor registrasi kepada petugas.',
  'Untuk APD wajib kembali, kembalikan sebelum pukul 16.00 WIB pada hari yang sama dengan mengunggah foto bukti fisik.'
];

// 4. Katalog APD Sesuai Daftar 23 Item Master APD di Google Sheets
export const ppeCatalog: PPEItem[] = [
  {
    id: 'helm-safety',
    name: 'Helm Safety',
    category: 'Head Protection',
    totalStock: 50,
    availableStock: 20,
    unit: 'unit',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Helm pelindung benturan kepala standar ANSI Z89.1.'
  },
  {
    id: 'body-harness',
    name: 'Body Harness',
    category: 'Fall Protection',
    totalStock: 25,
    availableStock: 12,
    unit: 'set',
    requiresReturn: true,
    canIndentIfEmpty: false,
    description: 'Full body harness double lanyard shock absorber untuk kerja ketinggian.'
  },
  {
    id: 'safety-shoes-low',
    name: 'Safety Shoes (Low Cut)',
    category: 'Foot Protection',
    totalStock: 40,
    availableStock: 15,
    unit: 'pasang',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Sepatu kerja berujung besi (steel toe cap) model pendek.'
  },
  {
    id: 'safety-boots-high',
    name: 'Safety Boots (High Cut)',
    category: 'Foot Protection',
    totalStock: 30,
    availableStock: 10,
    unit: 'pasang',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Sepatu boots tinggi tahan benturan, genangan air, dan oli.'
  },
  {
    id: 'wearpack',
    name: 'Wearpack',
    category: 'Indent / Khusus',
    totalStock: 50,
    availableStock: 10,
    unit: 'pcs',
    requiresReturn: false,
    canIndentIfEmpty: true,
    description: 'Pakaian kerja safety lapangan standar Samudera (Indent).'
  },
  {
    id: 'sarung-tangan-katun',
    name: 'Sarung Tangan Katun',
    category: 'Hand Protection',
    totalStock: 100,
    availableStock: 50,
    unit: 'pasang',
    requiresReturn: false,
    canIndentIfEmpty: false,
    description: 'Sarung tangan katun untuk aktivitas kerja ringan harian.'
  },
  {
    id: 'sarung-tangan-electrical',
    name: 'Sarung Tangan Electrical',
    category: 'Hand Protection',
    totalStock: 25,
    availableStock: 10,
    unit: 'pasang',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Sarung tangan khusus pelindung bahaya kelistrikan.'
  },
  {
    id: 'sarung-tangan-las',
    name: 'Sarung Tangan Las',
    category: 'Hand Protection',
    totalStock: 30,
    availableStock: 15,
    unit: 'pasang',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Sarung tangan kulit tahan panas untuk pekerjaan pengelasan.'
  },
  {
    id: 'sarung-tangan-kombinasi',
    name: 'Sarung Tangan Kombinasi',
    category: 'Hand Protection',
    totalStock: 40,
    availableStock: 20,
    unit: 'pasang',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Sarung tangan kombinasi kulit dan bahan kuat.'
  },
  {
    id: 'masker-medis',
    name: 'Masker Medis',
    category: 'Respiratory Protection',
    totalStock: 200,
    availableStock: 100,
    unit: 'box',
    requiresReturn: false,
    canIndentIfEmpty: false,
    description: 'Masker medis / bedah 3-ply standar higienis harian.'
  },
  {
    id: 'kacamata-safety-clear',
    name: 'Kacamata Safety (Clear Lense)',
    category: 'Eye Protection',
    totalStock: 50,
    availableStock: 25,
    unit: 'pcs',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Pelindung mata kerja lensa bening (clear lense).'
  },
  {
    id: 'kacamata-safety-dark',
    name: 'Kacamata Safety (Dark/Smoke)',
    category: 'Eye Protection',
    totalStock: 40,
    availableStock: 20,
    unit: 'pcs',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Pelindung mata kerja lensa gelap anti-silau.'
  },
  {
    id: 'kacamata-safety-goggles',
    name: 'Kacamata Safety (Chemical Splash Goggles)',
    category: 'Eye Protection',
    totalStock: 25,
    availableStock: 10,
    unit: 'pcs',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Goggles pelindung percikan kimia berbahaya.'
  },
  {
    id: 'life-jacket',
    name: 'Life Jacket',
    category: 'Marine Safety',
    totalStock: 30,
    availableStock: 18,
    unit: 'unit',
    requiresReturn: true,
    canIndentIfEmpty: false,
    description: 'Rompi pelampung keselamatan kerja perairan dan area dok.'
  },
  {
    id: 'safety-vest-samudera',
    name: 'Safety Vest (Samudera)',
    category: 'Body Protection',
    totalStock: 40,
    availableStock: 20,
    unit: 'pcs',
    requiresReturn: true,
    canIndentIfEmpty: false,
    description: 'Rompi keselamatan resmi berlogo Samudera.'
  },
  {
    id: 'safety-vest-kuning',
    name: 'Safety Vest (Kuning)',
    category: 'Body Protection',
    totalStock: 40,
    availableStock: 20,
    unit: 'pcs',
    requiresReturn: true,
    canIndentIfEmpty: false,
    description: 'Rompi keselamatan visibilitas tinggi warna kuning standar.'
  },
  {
    id: 'chin-strap',
    name: 'Chin Strap',
    category: 'Head Protection',
    totalStock: 40,
    availableStock: 20,
    unit: 'pcs',
    requiresReturn: false,
    canIndentIfEmpty: false,
    description: 'Tali dagu pengaman helm.'
  },
  {
    id: 'apron-jaket',
    name: 'Apron (Jaket)',
    category: 'Body Protection',
    totalStock: 20,
    availableStock: 8,
    unit: 'pcs',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Pelindung dada model jaket.'
  },
  {
    id: 'apron-lengan',
    name: 'Apron (Lengan)',
    category: 'Body Protection',
    totalStock: 20,
    availableStock: 8,
    unit: 'pcs',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Pelindung lengan kerja khusus.'
  },
  {
    id: 'respirator',
    name: 'Respirator',
    category: 'Respiratory Protection',
    totalStock: 25,
    availableStock: 10,
    unit: 'unit',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Masker respirator filter uap kimia dan debu.'
  },
  {
    id: 'kap-las',
    name: 'Kap Las',
    category: 'Eye & Face Protection',
    totalStock: 20,
    availableStock: 9,
    unit: 'unit',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Topeng pelindung wajah dan mata khusus pengelasan.'
  },
  {
    id: 'earplug',
    name: 'Earplug',
    category: 'Hearing Protection',
    totalStock: 150,
    availableStock: 80,
    unit: 'pcs',
    requiresReturn: false,
    canIndentIfEmpty: false,
    description: 'Penyumbat telinga pelindung dari kebisingan.'
  },
  {
    id: 'earmuff',
    name: 'Earmuff',
    category: 'Hearing Protection',
    totalStock: 30,
    availableStock: 12,
    unit: 'unit',
    requiresReturn: true,
    canIndentIfEmpty: true,
    description: 'Pelindung pendengaran cup penutup telinga penuh.'
  }
];

// 5. Ekspor yang dibutuhkan BorrowForm.tsx
export const borrowableItems: BorrowableItem[] = ppeCatalog;

// 6. Ekspor untuk Portal Permintaan (Mengambil langsung dari ppeCatalog agar sinkron)
export const consumableItems: ConsumableItem[] = ppeCatalog.map((item) => ({
  id: item.id,
  label: item.name,
  unit: item.unit,
  stock: item.totalStock,
  canIndentIfEmpty: item.canIndentIfEmpty,
  description: item.description
}));
