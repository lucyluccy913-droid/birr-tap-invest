import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, LEVELS } from '../types/game';
import { Trophy, TrendingUp, AlertCircle, ShieldCheck, MapPin, Building2, Calendar, Target, ChevronRight, Settings, Lock, Clock, Info, UserPlus, Share2, MousePointer2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DashboardProps {
  state: GameState;
  onTap: () => boolean;
  onDismissModal: () => void;
  onSelectLevel: (levelId: number) => void;
  onAdminLogin: (password: string) => void;
  onInvite: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onTap, onDismissModal, onSelectLevel, onAdminLogin, onInvite }) => {
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  
  const currentLevel = LEVELS[state.level] || LEVELS[0];

  const [cooldownText, setCooldownText] = useState('');
  useEffect(() => {
    if (!state.cooldownEndTime) {
      setCooldownText('');
      return;
    }
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(state.cooldownEndTime!).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setCooldownText('');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCooldownText(`${h}ሰ ${m}ደ ${s}ሴ`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.cooldownEndTime]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (onTap()) {
      const id = Date.now();
      setClicks(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setClicks(prev => prev.filter(c => c.id !== id));
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-24 max-w-md mx-auto h-full overflow-x-hidden relative">
      <div className="absolute top-2 right-4 z-50 flex items-center gap-2">
        <AnimatePresence>
          {showAdminInput && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex items-center gap-1 overflow-hidden">
              <Input type="password" placeholder="Pass" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="h-7 w-20 text-[10px] rounded-lg bg-white/80 dark:bg-slate-800/80" />
              <Button size="icon" className="h-7 w-7 rounded-lg" onClick={() => onAdminLogin(adminPass)}>
                <Lock className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setShowAdminInput(!showAdminInput)} className="p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-full border border-border/50">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none p-4 rounded-3xl flex flex-col items-center shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-bl-3xl" />
          <span className="text-[11px] text-white/60 uppercase font-black tracking-widest mb-1 amharic-text">ጠቅላላ ተቀማጭ</span>
          <span className="text-2xl font-black text-white">
            {(state.mainBalance || 0).toLocaleString()} <span className="text-xs text-white/60">ETB</span>
          </span>
        </Card>
        <Card className="bg-gradient-to-br from-primary to-amber-600 border-none p-4 rounded-3xl flex flex-col items-center shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-bl-3xl" />
          <span className="text-[11px] text-white/80 uppercase font-black tracking-widest mb-1 amharic-text">ሊወጣ የሚችል</span>
          <span className="text-2xl font-black text-white">
            {(state.withdrawableBalance || 0).toLocaleString()} <span className="text-xs text-white/60">ETB</span>
          </span>
        </Card>
      </div>

      <div className="px-1">
        <Card className="bg-white dark:bg-slate-900 border border-border/50 p-4 rounded-3xl shadow-md relative overflow-hidden">
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest amharic-text">የእርስዎ ደረጃ</p>
                <p className="text-xl font-black text-primary">#{(state.userRank || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-end gap-1 amharic-text">
                <Users className="w-3 h-3" /> ጠቅላላ ተጠቃሚዎች
              </p>
              <p className="text-sm font-black">{(state.totalUsers || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-1">
        <Button 
          onClick={onInvite}
          className="w-full h-16 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-black text-[15px] uppercase tracking-tight amharic-text leading-none mb-1">ጓደኞችን ይጋብዙ</p>
                <p className="text-white/80 text-[12px] font-bold amharic-text leading-none">5% የኮሚሽን ትርፍ ያግኙ</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50 transition-transform group-hover:translate-x-1" />
          </div>
        </Button>
      </div>

      {cooldownText && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 p-4 rounded-3xl flex items-center justify-center gap-3 animate-pulse">
          <Clock className="w-5 h-5 text-amber-500" />
          <div className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-tighter amharic-text">
            ቀጣይ ገቢ በ: <span className="text-sm font-black">{cooldownText}</span>
          </div>
        </div>
      )}

      <div className="relative w-full flex items-center justify-center py-4">
        {!cooldownText && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 max-w-[90px]"
          >
            <span className="text-[13px] font-black text-primary animate-bounce text-center leading-tight amharic-text">
              ገንዘብ ለመስራት ይንኩ
            </span>
            <div className="w-6 h-0.5 bg-primary/30 rounded-full" />
          </motion.div>
        )}

        <motion.div
          whileTap={!cooldownText ? { scale: 0.95 } : {}}
          onClick={handleClick}
          className={`relative w-52 h-52 rounded-full p-2 shadow-2xl transition-all duration-300 ${
            cooldownText ? 'opacity-30 grayscale cursor-not-allowed filter contrast-50' : 'bg-gradient-to-b from-amber-200 to-amber-600 cursor-pointer shadow-primary/20'
          }`}
        >
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-800 shadow-inner">
            <img src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/e4100308-e3b6-4fa5-8c2b-8febf8d58567/walya-medallion-c92b4e5b-1780155516640.webp" className="w-full h-full object-cover" alt="Walya" />
          </div>
          <AnimatePresence>
            {!cooldownText && clicks.map(click => (
              <motion.span key={click.id} initial={{ opacity: 1, y: click.y - 20, x: click.x }} animate={{ opacity: 0, y: click.y - 150 }} className="absolute pointer-events-none text-3xl font-black text-primary drop-shadow-md">
                +0.5
              </motion.span>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2 amharic-text">
            <TrendingUp className="w-4 h-4 text-primary" /> የኢንቨስትመንት ደረጃዎች
          </h3>
          <span className="text-[11px] font-black text-amber-500 uppercase amharic-text">ደረጃ: {currentLevel.name}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {LEVELS.filter(l => l.id > 0).map((lvl) => (
            <Card key={lvl.id} className={`p-4 rounded-3xl border-border/50 cursor-pointer relative group transition-all hover:scale-[1.02] ${state.level === lvl.id ? 'ring-2 ring-primary bg-primary/5 shadow-lg' : 'bg-white dark:bg-slate-900'}`} onClick={() => onSelectLevel(lvl.id)}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${state.level === lvl.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>Grade {lvl.id}</span>
              </div>
              <p className="text-xl font-black text-primary mb-1">{lvl.cost} ብር</p>
              <div className="text-[12px] font-bold text-muted-foreground amharic-text">ዕለታዊ: <span className="text-green-600">{lvl.dailyLimit} ብር</span></div>
            </Card>
          ))}
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-border/50 shadow-sm flex gap-4 items-start transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/80">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-[14px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed amharic-text">
          ከከፈሉ በኋላ ለ3 ዓመታት ዕለታዊ ገቢ ያገኛሉ። እንዲሁም በፈለጉት ጊዜ ኢንቨስትመንትዎን ማሳደግ (Upgrade) ይችላሉ።
        </p>
      </div>

      <Dialog open={state.showLimitModal} onOpenChange={onDismissModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none rounded-[2.5rem] p-10 outline-none">
          <DialogHeader className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-inner">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black text-center tracking-tight amharic-text">
              {state.level === 0 ? "ቦነስ ደርሶዎታል!" : "ገደብ ላይ ደርሰዋል!"}
            </DialogTitle>
            <DialogDescription className="text-center text-[16px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed amharic-text">
              {state.level === 0 
                ? "እንኳን ደስ አሎት! 30 ብር ቦነስ ሰብስበዋል። አሁን ወጪ ማድረግ (Withdraw) ይችላሉ።"
                : `የዛሬውን ገደብ (${LEVELS[state.level]?.dailyLimit || 0} ብር) ደርሰዋል። እባክዎ አሁን ገቢዎን ወጪ ያድርጉ።`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6">
            <Button onClick={onDismissModal} className="w-full h-14 rounded-2xl bg-primary text-xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">ኦኬ (OK)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};