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
{ label: 'Panduan K3', href: '#panduan-k3' }];


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
'Finance',
'HC',
'Marketing',
];


export const wearpackSizes: string[] = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const sopSteps: string[] = [
'Pilih APD yang dibutuhkan pada formulir peminjaman atau permintaan.',
'Isi identitas diri, divisi, serta keperluan tugas operasional secara lengkap.',
'Ambil APD di ruang logistik QHSE dan konfirmasikan nomor registrasi kepada petugas.',
'Untuk APD wajib kembali, kembalikan sebelum pukul 16.00 WIB pada hari yang sama dengan mengunggah foto bukti fisik.'];


// 4. Daftar APD Peminjaman (6 Item Standar Sesuai Kebutuhan)
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
  description: 'Helm pelindung benturan kepala standar ANSI Z89.1 (Putih K3).'
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
  id: 'sepatu-safety-low',
  name: 'Sepatu Safety (Low Cut)',
  category: 'Foot Protection',
  totalStock: 40,
  availableStock: 15,
  unit: 'pasang',
  requiresReturn: true,
  canIndentIfEmpty: true,
  description: 'Sepatu kerja berujung besi (steel toe cap) anti-selip model pendek.'
},
{
  id: 'boots-safety-high',
  name: 'Boots Safety (High Cut)',
  category: 'Foot Protection',
  totalStock: 30,
  availableStock: 10,
  unit: 'pasang',
  requiresReturn: true,
  canIndentIfEmpty: true,
  description: 'Sepatu boots tinggi tahan benturan, genangan air, oli, dan lumpur.'
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
  description: 'Rompi pelampung keselamatan kerja perairan dan area dok kapal.'
},
{
  id: 'safety-vest',
  name: 'Safety Vest',
  category: 'Body Protection',
  totalStock: 60,
  availableStock: 35,
  unit: 'pcs',
  requiresReturn: true,
  canIndentIfEmpty: false,
  description: 'Rompi keselamatan visibilitas tinggi bersertifikasi dengan pita reflektor ganda.'
}];


// 5. Ekspor yang dibutuhkan BorrowForm.tsx (Menghubungkan langsung ke katalog pinjam)
export const borrowableItems: BorrowableItem[] = ppeCatalog;

// 6. APD Sekali Pakai (Portal Permintaan: 3 Item Standar)
export const consumableItems: ConsumableItem[] = [
{
  id: 'sarung-tangan',
  label: 'Sarung Tangan',
  unit: 'pasang',
  stock: 100,
  canIndentIfEmpty: false,
  description: 'Sarung tangan kerja pelindung tangan mekanik'
},
{
  id: 'masker-medis',
  label: 'Masker Medis',
  unit: 'pcs',
  stock: 120,
  canIndentIfEmpty: false,
  description: 'Masker medis / bedah 3-ply standar higienis harian'
},
{
  id: 'kacamata-safety',
  label: 'Kacamata Safety',
  unit: 'pcs',
  stock: 45,
  hasSubtype: true,
  canIndentIfEmpty: true,
  description: 'Pelindung mata kerja (Lensa Clear, Dark/Smoke, atau Chemical Splash Goggles)'
}];
