import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, LEVELS, Transaction } from '../types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Copy, Upload, CheckCircle2, Landmark, Target, ArrowLeft, Info, History, ArrowDownLeft, ArrowUpRight, BadgeCheck, Clock, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';

interface FinancialsProps {
  state: GameState;
  onSubmitTransaction: (tx: Omit<Transaction, 'id' | 'status' | 'date'>) => Promise<boolean> | boolean;
  initialTab: 'deposit' | 'withdraw';
  preSelectedLevelId?: number | null;
  onBack: () => void;
}

export const Financials: React.FC<FinancialsProps> = ({ 
  state, 
  onSubmitTransaction, 
  initialTab,
  preSelectedLevelId,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [amount, setAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [bankType, setBankType] = useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(preSelectedLevelId || null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bankAccounts = [
    { bank: 'CBE', number: '1000261313735', name: 'Kaleab' },
    { bank: 'Abyssinia', number: '188613349', name: 'Kaleab' },
    { bank: 'Telebirr', number: '0995961016', name: 'Yitbarek' }
  ];

  const withdrawBanks = [
    'CBE', 'Abyssinia', 'Telebirr', 'Awash', 'Dashen', 'Other Bank'
  ];

  useEffect(() => {
    if (preSelectedLevelId) {
      setSelectedLevelId(preSelectedLevelId);
      const level = LEVELS.find(l => l.id === preSelectedLevelId);
      if (level) setAmount(level.cost.toString());
    }
  }, [preSelectedLevelId]);

  useEffect(() => {
    if (activeTab === 'withdraw') {
      setAmount(state.withdrawableBalance.toString());
    }
  }, [activeTab, state.withdrawableBalance]);

  const handleLevelSelect = (levelId: number) => {
    setSelectedLevelId(levelId);
    const level = LEVELS.find(l => l.id === levelId);
    if (level) setAmount(level.cost.toString());
  };

  const handleDeposit = async () => {
    const val = parseFloat(amount);
    if (!selectedLevelId) return toast.error('እባክዎን ደረጃ ይምረጡ');
    if (isNaN(val) || val <= 0) return toast.error('ትክክለኛ መጠን ያስገቡ');
    if (!file) return toast.error('የደረሰኝ ስክሪንሾት ያያይዙ');

    setSubmitting(true);
    try {
      await onSubmitTransaction({
        type: 'deposit',
        amount: val,
        levelId: selectedLevelId,
        screenshot: "receipt_image_placeholder.jpg"
      });
      setAmount('');
      setFile(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!bankType) return toast.error('እባክዎን ባንክ ይምረጡ');
    if (!withdrawAccount) return toast.error('እባክዎን የባንክ አካውንት ያስገቡ');
    if (isNaN(val) || val < 10) return toast.error('ዝቅተኛው ወጪ መጠን 10 ብር ነው');
    if (val > state.withdrawableBalance) return toast.error('በቂ ተከፋይ ሂሳብ (Withdrawable Balance) የሎትም');

    setSubmitting(true);
    try {
      await onSubmitTransaction({
        type: 'withdrawal',
        amount: val,
        bankAccount: `${bankType} - ${withdrawAccount}`
      });
      setAmount('');
      setWithdrawAccount('');
      setBankType('');
    } finally {
      setSubmitting(false);
    }
  };

  const copyOnlyNumber = async (num: string) => {
    const success = await copyToClipboard(num);
    if (success) {
      toast.success(`ቁጥሩ ተቀድቷል: ${num}`);
    } else {
      toast.error('ኮፒ ማድረግ አልተቻለም');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 max-w-md mx-auto min-h-screen relative overflow-x-hidden">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-full border border-border shadow-sm"
      >
        <ArrowLeft className="w-5 h-5 text-primary" />
      </button>

      <div className="mt-12 flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-3 px-4 rounded-lg text-[13px] font-black transition-all amharic-text ${
            activeTab === 'deposit' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          ገንዘብ ማስገቢያ (Deposit)
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-3 px-4 rounded-lg text-[13px] font-black transition-all amharic-text ${
            activeTab === 'withdraw' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          ገንዘብ ማውጫ (Withdraw)
        </button>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-primary rounded-2xl shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground font-black uppercase tracking-widest amharic-text">ሊወጣ የሚችል ሂሳብ</p>
            <p className="text-3xl font-black text-primary tracking-tight">{(state.withdrawableBalance || 0).toLocaleString()} <span className="text-sm font-bold amharic-text">ብር</span></p>
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {activeTab === 'deposit' ? (
          <motion.div key="deposit" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-black px-1 uppercase flex items-center gap-2 amharic-text">
                <Target className="w-4 h-4 text-primary" /> ደረጃ ይምረጡ
              </h3>
              <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide px-1">
                {LEVELS.filter(l => l.id > 0).map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => handleLevelSelect(lvl.id)}
                    className={`min-w-[145px] p-5 rounded-2xl border-2 text-left transition-all shrink-0 shadow-sm ${
                      selectedLevelId === lvl.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card'
                    }`}
                  >
                    <p className="text-[10px] font-black opacity-60 uppercase mb-1">Grade {lvl.id}</p>
                    <p className="font-bold text-[13px] truncate amharic-text">{lvl.name}</p>
                    <p className="font-black text-primary text-base mt-1">{lvl.cost} ብር</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-green-600 amharic-text">
                      +{lvl.dailyLimit} ብር / ቀን
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedLevelId && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-5 space-y-6 rounded-[2rem] border-2 border-primary/10 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner">
                  <div className="space-y-4">
                    <p className="text-[13px] font-black text-muted-foreground uppercase ml-1 flex items-center gap-2 amharic-text">
                      <Landmark className="w-3.5 h-3.5" /> ክፍያ የሚፈጸምባቸው አካውንቶች
                    </p>
                    {bankAccounts.map((acc, i) => (
                      <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 flex justify-between items-center shadow-sm transition-transform active:scale-[0.98]">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-primary uppercase">{acc.bank}</p>
                          <p className="text-base font-black tracking-wider">{acc.number}</p>
                          <p className="text-[11px] font-bold text-muted-foreground italic amharic-text">ስም: {acc.name}</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => copyOnlyNumber(acc.number)} className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-none shadow-sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-black text-muted-foreground uppercase ml-1 amharic-text">መጠን (Amount)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-14 rounded-2xl font-bold bg-white dark:bg-slate-900 text-lg border-2 border-border focus-visible:border-primary transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-black text-muted-foreground uppercase ml-1 amharic-text">የክፍያ ማረጋገጫ (Receipt)</label>
                    <div className="relative h-28 border-2 border-dashed border-border rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 transition-all hover:border-primary/50 group shadow-sm">
                      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {file ? (
                        <div className="flex flex-col items-center gap-2 text-green-600 font-bold text-[13px] amharic-text">
                          <CheckCircle2 className="w-7 h-7" /> {file.name.slice(0, 25)}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground font-bold text-[13px] amharic-text group-hover:text-primary transition-colors">
                          <Upload className="w-7 h-7" /> ደረሰኝ ይምረጡ
                        </div>
                      )}
                    </div>
                  </div>

                  <Button disabled={submitting} onClick={handleDeposit} className="w-full h-16 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98] amharic-text">
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "ሰብሚት (Submit Deposit)"}
                  </Button>
                </Card>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="withdraw" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Card className="p-6 space-y-5 rounded-[2rem] border-border/50 shadow-lg bg-slate-50/50 dark:bg-slate-900/50 shadow-inner">
              <div className="space-y-2">
                <label className="text-[13px] font-black text-muted-foreground uppercase ml-1 amharic-text">ባንክ ይምረጡ</label>
                <Select value={bankType} onValueChange={setBankType}>
                  <SelectTrigger className="h-14 rounded-2xl font-bold bg-white dark:bg-slate-900 border-2 border-border shadow-sm">
                    <SelectValue placeholder="Bank Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {withdrawBanks.map(bank => (
                      <SelectItem key={bank} value={bank} className="font-bold py-3">{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-black text-muted-foreground uppercase ml-1 amharic-text">መቀበያ አካውንት / ስልክ</label>
                <Input
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder="Receiving Account"
                  className="h-14 rounded-2xl font-bold bg-white dark:bg-slate-900 border-2 border-border shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-black text-muted-foreground uppercase ml-1 amharic-text">የሚወጣ መጠን</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="h-14 rounded-2xl font-bold text-xl bg-white dark:bg-slate-900 text-primary border-2 border-border shadow-sm"
                />
              </div>
              <Button disabled={submitting} onClick={handleWithdraw} className="w-full h-16 rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98] amharic-text">
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "ገንዘብ ማውጫ ጥያቄ (Withdraw)"}
              </Button>
            </Card>

            <div className="space-y-4 pb-4">
              <h3 className="text-sm font-black px-1 uppercase flex items-center gap-2 amharic-text">
                <History className="w-4 h-4 text-primary" /> የትላንትና ስራዎች (History)
              </h3>
              <div className="space-y-3">
                {state.pendingTransactions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-border/50">
                    <p className="text-sm font-bold text-muted-foreground amharic-text">ምንም መረጃ የለም</p>
                  </div>
                ) : (
                  state.pendingTransactions.slice().reverse().map(tx => (
                    <Card key={tx.id} className="p-4 rounded-2xl border-border/50 shadow-sm flex items-center justify-between hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider">{tx.type}</p>
                          <p className="text-[11px] font-bold text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[15px] font-black ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}{tx.amount} <span className="text-[10px]">ETB</span>
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          {tx.status === 'approved' ? (
                            <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                          ) : tx.status === 'pending' ? (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <span className={`text-[10px] font-black uppercase amharic-text ${
                            tx.status === 'approved' ? 'text-green-500' : 
                            tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                          }`}>{tx.status === 'approved' ? 'ጸድቋል' : tx.status === 'pending' ? 'በጥበቃ ላይ' : 'ውድቅ ተደርጓል'}</span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};