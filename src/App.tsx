import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useGameState } from './hooks/useGameState';
import { Dashboard } from './components/Dashboard';
import { Financials } from './components/Financials';
import { BottomNav } from './components/BottomNav';
import { AdminPanel } from './components/AdminPanel';
import { TrendingUp, ShieldCheck, HelpCircle, Briefcase, Globe, BarChart3, Award, ArrowLeft, BookOpen, UserPlus, Share2, Copy, Gift, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copyToClipboard } from '@/lib/utils';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [preSelectedLevel, setPreSelectedLevel] = useState<number | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [tgUser, setTgUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTgUser({
          id: user.id.toString(),
          name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
        });
      } else {
        setTgUser({ id: 'local_user_123', name: 'Local Dev User' });
      }
    } else {
      setTgUser({ id: 'local_user_123', name: 'Local Dev User' });
    }
  }, []);

  const { 
    state, 
    loading,
    handleTap, 
    dismissLimitModal, 
    submitTransaction,
    approveTransaction,
    rejectTransaction
  } = useGameState(tgUser?.id || 'anonymous');

  if (!tgUser || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <Card className="p-8 rounded-3xl text-center space-y-6 shadow-xl border-none max-w-sm w-full animate-in fade-in zoom-in duration-300">
          <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black italic tracking-tight">ክፈት በቴሌግራም...</h2>
            <p className="text-base text-slate-600 font-bold leading-relaxed amharic-text">እባክዎ መተግበሪያውን በቴሌግራም ቦት በኩል ይክፈቱ።</p>
          </div>
        </Card>
      </div>
    );
  }

  const handleSelectLevelFromDashboard = (levelId: number) => {
    setPreSelectedLevel(levelId);
    setActiveTab('financials');
  };

  const handleAdminLogin = (password: string) => {
    if (password === "kal19") {
      setIsAdminView(true);
      toast.success('የአስተዳዳሪ መግቢያ ተሳክቷል');
    } else {
      toast.error('የይለፍ ቃል የተሳሳተ ነው');
    }
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setPreSelectedLevel(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'financials') {
      setPreSelectedLevel(null);
    }
  };

  const copyInviteLink = async () => {
    const link = `https://t.me/WalyaBusinessBot?start=${state.referralCode}`;
    const success = await copyToClipboard(link);
    if (success) {
      toast.success('የግብዣ ሊንኩ ተቀድቷል!');
    } else {
      toast.error('ሊንኩን ኮፒ ማድረግ አልተቻለም');
    }
  };

  const shareInviteLink = () => {
    const link = `https://t.me/WalyaBusinessBot?start=${state.referralCode}`;
    const text = `በዋልያ ቢዝነስ በቀን እስከ 5% ትርፍ ያግኙ! አሁኑኑ ይመዝገቡ፡ ${link}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            state={state} 
            onTap={handleTap} 
            onDismissModal={dismissLimitModal} 
            onSelectLevel={handleSelectLevelFromDashboard}
            onAdminLogin={handleAdminLogin}
            onInvite={() => setActiveTab('invite')}
          />
        );
      case 'financials':
        return (
          <Financials 
            state={state} 
            onSubmitTransaction={submitTransaction}
            initialTab="deposit"
            preSelectedLevelId={preSelectedLevel}
            onBack={handleBackToDashboard}
          />
        );
      case 'invite':
        return (
          <div className="p-6 max-w-md mx-auto space-y-8 pb-24 relative overflow-x-hidden">
            <button onClick={handleBackToDashboard} className="absolute top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-full border border-border shadow-sm">
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div className="mt-12 text-center space-y-2">
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">INVITE & EARN</h2>
              <p className="text-muted-foreground font-black text-[13px] uppercase tracking-widest amharic-text">ጓደኞችን ይጋብዙ እና ያትርፉ</p>
            </div>
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 text-center space-y-6">
                <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                  <Gift className="w-10 h-10 text-white animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">5% ኮሚሽን</h3>
                  <p className="text-white/90 text-sm font-bold leading-relaxed amharic-text">
                    ጓደኞችዎን ሲጋብዙ እና የመጀመሪያ ዲፖዚት ሲያደርጉ የዲፖዚቱን 5% ወዲያውኑ ወደ አካውንትዎ ገቢ ይደረጋል።
                  </p>
                </div>
              </div>
            </Card>
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-[2rem] border border-border/50 space-y-4">
                <p className="text-[12px] font-black text-muted-foreground uppercase tracking-widest text-center amharic-text">የእርስዎ የግብዣ ሊንክ</p>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-border text-xs font-mono break-all text-center text-primary font-bold">
                  https://t.me/WalyaBusinessBot?start={state.referralCode}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={copyInviteLink} className="h-14 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-border hover:bg-slate-50 font-black uppercase text-sm">
                    <Copy className="w-4 h-4 mr-2" /> ኮፒ
                  </Button>
                  <Button onClick={shareInviteLink} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase text-sm shadow-lg shadow-primary/20">
                    <Share2 className="w-4 h-4 mr-2" /> ሼር
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[2rem] border border-amber-200/50">
              <h4 className="text-amber-600 font-black text-sm mb-3 amharic-text">እንዴት ይሰራል?</h4>
              <ul className="space-y-4">
                {[
                  "የግብዣ ሊንኩን ለጓደኛዎ ይላኩ",
                  "ጓደኛዎ በሊንኩ ተመዝግቦ የፈለገውን ደረጃ ይግዛ",
                  "ዲፖዚቱ ሲጸድቅ 5% ኮሚሽን ያገኛሉ",
                  "ምንም የግብዣ ገደብ የለም - ብዙ በጋበዙ ቁጥር ብዙ ያገኛሉ!"
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-[13px] font-bold text-amber-800/80 dark:text-amber-400/80 leading-snug amharic-text">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'info':
        return (
          <div className="p-6 max-w-md mx-auto space-y-8 pb-24 overflow-x-hidden relative">
            <button onClick={handleBackToDashboard} className="absolute top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-full border border-border shadow-sm">
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div className="mt-12 text-center space-y-2">
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">WALYA GUIDE</h2>
              <p className="text-muted-foreground font-black text-[13px] uppercase tracking-widest amharic-text">እንዴት እንደሚሰራ ይረዱ</p>
            </div>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-48 border border-border/50 group">
              <img 
                src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/e4100308-e3b6-4fa5-8c2b-8febf8d58567/business-banner-567f3954-1780155515501.webp" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Business Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                <p className="text-white font-black text-xl mb-1 amharic-text">ዓለም አቀፍ ኢንቨስትመንት</p>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-primary" />
                  <p className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">CEX & FOREX Experts</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BookOpen className="w-16 h-16 text-primary" />
              </div>
              <p className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 font-bold italic relative z-10 amharic-text">
                "ከከፈሉ በኋላ ለ3 ዓመታት ዕለታዊ ገቢ ያገኛሉ። እንዲሁም በፈለጉት ጊዜ ኢንቨስትመንትዎን ማሳደግ (Upgrade) ይችላሉ።"
              </p>
            </div>
            <div className="grid gap-4">
              <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm flex items-start gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-sm">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-1 tracking-tight amharic-text">ስራችን (Work)</h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed font-medium amharic-text">
                    ዋልያ ቢዝነስ በየቀኑ በክሪፕቶ (Crypto)፣ በፎሬክስ (Forex) እና መሰል ዓለም አቀፍ የንግድ ልውውጦች ላይ በመሳተፍ ከ6% እስከ 10% ትርፍ ያገኛል።
                  </p>
                </div>
              </div>
              <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm flex items-start gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl shadow-sm">
                  <BarChart3 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-1 tracking-tight amharic-text">ትርፍ (ROI)</h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed font-medium amharic-text">
                    ከተገኘው ትርፍ ውስጥ 5% ለተጠቃሚዎች ይከፈላል። ስራው ሙሉ በሙሉ ህጋዊ፣ ፍትሃዊ እና የተፈቀደ (Halal) ነው።
                  </p>
                </div>
              </div>
              <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm flex items-start gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl shadow-sm">
                  <Briefcase className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-1 tracking-tight amharic-text">ደህንነት (Security)</h4>
                  <p className="text-[13px] text-muted-foreground leading-relaxed font-medium amharic-text">
                    አንድ ጊዜ ከፍለው ሲመዘገቡ አካውንቱ ለ3 ዓመታት ያገለግላል። በፈለጉት ጊዜ ደረጃዎን ማሳደግ ይችላሉ።
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-[2.5rem] text-center space-y-4 shadow-inner border border-border/50">
              <HelpCircle className="w-12 h-12 text-primary mx-auto drop-shadow-md" />
              <div className="space-y-1">
                <h4 className="font-black text-sm uppercase amharic-text">ተጨማሪ እርዳታ?</h4>
                <p className="text-[13px] text-muted-foreground font-bold tracking-tight amharic-text">የደንበኞች አገልግሎታችንን በቴሌግራም @WalyaAdmin ያግኙ።</p>
              </div>
              <Button className="w-full h-14 rounded-2xl font-black uppercase text-sm shadow-xl shadow-primary/20">ያናግሩን (Contact Us)</Button>
            </div>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="p-6 max-w-md mx-auto space-y-6 pb-24 relative">
            <button onClick={handleBackToDashboard} className="absolute top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 rounded-full border border-border shadow-sm">
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>
            <div className="mt-12 text-center space-y-2">
              <h2 className="text-3xl font-black text-primary flex items-center justify-center gap-2 uppercase tracking-tighter">
                <Award className="w-8 h-8" /> ውጤት
              </h2>
              <p className="text-muted-foreground font-black text-[13px] uppercase tracking-widest amharic-text">የዋልያ ቢዝነስ ምርጥ ተጠቃሚዎች</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-amber-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-xs uppercase font-black opacity-80 tracking-widest amharic-text">የእርስዎ ደረጃ</p>
                  <p className="text-4xl font-black tracking-tighter">#{state.userRank.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase font-black opacity-80 tracking-widest amharic-text">ጠቅላላ ነጥብ</p>
                  <p className="text-2xl font-black tracking-tight">{state.withdrawableBalance.toLocaleString()} <span className="text-xs font-bold">ETB</span></p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "ዮሃንስ ገ.", amount: "450,200", level: "Lvl 5", rank: 1, color: "text-amber-500" },
                { name: "መቅደስ አ.", amount: "320,500", level: "Lvl 5", rank: 2, color: "text-slate-400" },
                { name: "ዳዊት ለ.", amount: "285,000", level: "Lvl 4", rank: 3, color: "text-amber-700" },
                { name: "ትዕግስት ሺ.", amount: "190,000", level: "Lvl 4", rank: 4, color: "text-slate-600" },
                { name: "ኢዮብ መ.", amount: "155,000", level: "Lvl 3", rank: 5, color: "text-slate-600" },
              ].map((user) => (
                <div key={user.rank} className="bg-card border border-border/50 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-black w-6 text-center ${user.color}`}>#{user.rank}</span>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-lg border border-border/50 shadow-sm">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-sm">{user.name}</p>
                      <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">{user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600 text-sm">{user.amount} <span className="text-[10px] uppercase font-bold text-muted-foreground">ETB</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <Dashboard 
            state={state} 
            onTap={handleTap} 
            onDismissModal={dismissLimitModal} 
            onSelectLevel={handleSelectLevelFromDashboard}
            onAdminLogin={handleAdminLogin}
            onInvite={() => setActiveTab('invite')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-black text-lg tracking-tighter uppercase">WALYA <span className="text-primary text-[10px] font-black tracking-[0.2em] ml-0.5">BUSINESS</span></h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-border shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.1em]">Verified Official</span>
        </div>
      </header>
      <main className="animate-in fade-in duration-500">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <Toaster position="top-center" richColors />
      {isAdminView && (
        <AdminPanel 
          state={state} 
          onApprove={approveTransaction} 
          onReject={rejectTransaction} 
          onClose={() => setIsAdminView(false)} 
        />
      )}
    </div>
  );
}

export default App;