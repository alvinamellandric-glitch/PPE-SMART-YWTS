import React from 'react';
import { ArrowRightIcon, BarChart3Icon, HardHatIcon, LockIcon, PackageSearchIcon } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
interface PortalCardsProps {
  onAdminClick: () => void;
}
export function PortalCards({
  onAdminClick
}: PortalCardsProps) {
  return <section aria-labelledby="portal-heading" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-2xl">
        <h2 id="portal-heading" className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Tiga portal, satu alur pencatatan
        </h2>
        <p className="mt-2 text-ink-muted">
          Pilih portal sesuai kebutuhan APD Anda. Dua portal terbuka untuk semua personel, satu portal
          khusus tim audit K3.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <article className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-safety-50 text-safety-600 ring-1 ring-safety-100">
              <HardHatIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <StatusBadge tone="success">Akses Terbuka</StatusBadge>
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">Peminjaman Mandiri</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Helm, harness, sepatu, dan rompi safety. Tanpa approval supervisor — langsung catat dan bawa
            ke lapangan.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-ink-muted">
            <li>· Stok tampil live per jenis APD</li>
            <li>· Wajib dikembalikan sesuai tanggal rencana</li>
          </ul>
          <a href="#portal-peminjaman" className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold text-safety-600 transition-colors duration-150 ease-smooth hover:text-safety-700">
            Buka form pinjam
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </a>
        </article>

        <article className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-safety-50 text-safety-600 ring-1 ring-safety-100">
              <PackageSearchIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <StatusBadge tone="success">Akses Terbuka</StatusBadge>
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">Permintaan &amp; Pengadaan</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            APD habis pakai dan wearpack custom size. Dilengkapi pelacak status pesanan hingga siap
            diambil.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-ink-muted">
            <li>· Masker, sarung tangan, kacamata safety</li>
            <li>· Timeline vendor untuk item indent</li>
          </ul>
          <a href="#portal-permintaan" className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold text-safety-600 transition-colors duration-150 ease-smooth hover:text-safety-700">
            Buka form permintaan
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </a>
        </article>

        <article className="flex flex-col rounded-2xl border border-ink bg-ink p-6 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
              <BarChart3Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-safety-600 px-2.5 py-1 text-xs font-bold text-white">
              <LockIcon className="h-3 w-3" aria-hidden="true" />
              Admin Only
            </span>
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight text-white">Rekapitulasi Bulanan K3</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Ringkasan audit, analitik penggunaan APD, dan verifikasi bukti foto pengembalian per bulan.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
            <li>· Rekap per jenis APD &amp; tipe kebutuhan</li>
            <li>· Export ke Excel / PDF untuk audit</li>
          </ul>
          <button type="button" onClick={onAdminClick} className="mt-auto inline-flex w-fit items-center gap-1.5 pt-6 text-sm font-bold text-white transition-colors duration-150 ease-smooth hover:text-safety-400">
            Masuk portal admin
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </article>
      </div>
    </section>;
}