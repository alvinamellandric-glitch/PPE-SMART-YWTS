import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PortalCards } from './components/PortalCards';
import { BorrowSection } from './components/borrow/BorrowSection';
import { RequestSection } from './components/request/RequestSection';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { Footer } from './components/Footer';
interface AppProps {
  /** Buka dashboard rekapitulasi tanpa memasukkan kata sandi (untuk review desain). */
  adminUnlocked?: boolean;
}
export function App({
  adminUnlocked = false
}: AppProps) {
  const [unlocked, setUnlocked] = useState(adminUnlocked);
  const [modalOpen, setModalOpen] = useState(false);
  const openAdmin = () => {
    if (unlocked) {
      document.getElementById('rekapitulasi')?.scrollIntoView({
        behavior: 'smooth'
      });
    } else {
      setModalOpen(true);
    }
  };
  const handleUnlock = () => {
    setUnlocked(true);
    window.setTimeout(() => document.getElementById('rekapitulasi')?.scrollIntoView({
      behavior: 'smooth'
    }), 120);
  };
  return <div className="min-h-full w-full bg-canvas font-sans text-ink">
      <Header onAdminClick={openAdmin} />
      <main>
        <Hero />
        <PortalCards onAdminClick={openAdmin} />
        <BorrowSection />
        <RequestSection />
        <AdminDashboard unlocked={unlocked || adminUnlocked} onRequestAccess={openAdmin} />
      </main>
      <Footer />
      <AdminPasswordModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleUnlock} />
    </div>;
}