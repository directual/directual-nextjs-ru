'use client';

import { SlidersVertical } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <SlidersVertical size={28} className="flex-shrink-0" />
        Настройки
      </h1>
    </div>
  );
}

