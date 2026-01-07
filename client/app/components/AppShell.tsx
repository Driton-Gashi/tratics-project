'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="md:grid md:grid-cols-[16rem_1fr]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="min-w-0">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
