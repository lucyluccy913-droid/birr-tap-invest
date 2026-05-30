import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, Info, Trophy, UserPlus } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'ዳሽቦርድ', icon: LayoutDashboard },
    { id: 'financials', label: 'ፋይናንስ', icon: Wallet },
    { id: 'invite', label: 'ይጋብዙ', icon: UserPlus },
    { id: 'leaderboard', label: 'ደረጃዎች', icon: Trophy },
    { id: 'info', label: 'መመሪያ', icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-border px-2 py-4 flex justify-around items-center z-50 safe-area-bottom shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5px]' : 'scale-100 stroke-[2px]'}`} />
            </div>
            <span className={`text-[12px] font-bold uppercase tracking-tight text-center leading-tight amharic-text ${isActive ? 'opacity-100 font-black' : 'opacity-80'}`}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div layoutId="activeTabDot" className="w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
};