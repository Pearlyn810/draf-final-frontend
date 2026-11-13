import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CheckCircle2, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#402155] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-purple-400/30">
        <CheckCircle2 className="w-4 h-4 text-[#D9B85F] shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
