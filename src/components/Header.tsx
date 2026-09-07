import React, { useState } from 'react';
import { LockIcon, MenuIcon, XIcon } from 'lucide-react';
import { navLinks } from '../data/ppe';
import { BrandMark } from './BrandMark';
interface HeaderProps {
  onAdminClick: () => void;
}
export function Header({
  onAdminClick
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <header className="sticky top-0 z-40 w-full border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a href="#beranda" className="rounded-lg" aria-label="PPE SMART — Beranda">
          <BrandMark size="sm" />
        </a>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
              {link.label}
            </a>)}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onAdminClick} className="hidden items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-bold text-ink transition-colors duration-150 ease-smooth hover:border-safety-200 hover:bg-safety-50 hover:text-safety-700 sm:inline-flex">
            <LockIcon className="h-4 w-4 text-safety-600" aria-hidden="true" />
            Portal Admin
            <span className="hidden text-xs font-medium text-ink-subtle xl:inline">(Rekapitulasi)</span>
          </button>

          <button type="button" onClick={() => setMobileOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink transition-colors duration-150 ease-smooth hover:bg-canvas lg:hidden" aria-expanded={mobileOpen} aria-controls="mobile-nav" aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}>
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && <div id="mobile-nav" className="border-t border-line bg-white px-4 py-3 lg:hidden">
          <nav aria-label="Navigasi seluler" className="flex flex-col">
            {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
                {link.label}
              </a>)}
            <button type="button" onClick={() => {
          setMobileOpen(false);
          onAdminClick();
        }} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm font-bold text-ink">
              <LockIcon className="h-4 w-4 text-safety-600" aria-hidden="true" />
              Portal Admin (Rekapitulasi)
            </button>
          </nav>
        </div>}
    </header>;
}