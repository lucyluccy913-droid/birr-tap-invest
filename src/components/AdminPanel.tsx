import React, { useState, useEffect } from 'react';
import { GameState, Transaction, LEVELS } from '../types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Users, ArrowUpRight, ArrowDownLeft, Landmark, Clock, UserCheck, Copy, CheckCircle2, WalletCards, Loader2, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface AdminPanelProps {
  state: GameState;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  main_balance: number;
  withdrawable_balance: number;
  level: number;
  created_at: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ state, onApprove, onReject, onClose }) => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('withdrawals');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!txError && txData) {
        setAllTransactions(txData.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          levelId: t.level_id,
          status: t.status,
          date: t.date,
          bankAccount: t.bank_account,
          screenshot: t.screenshot,
          userName: t.user_name
        })));
      }

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!userError && userData) {
        setAllUsers(userData);
      }
    } catch (err) {
      console.error(err);
      toast.error('ዳታ መጫን አልተቻለም');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    await onApprove(id);
    fetchData();
  };

  const handleReject = async (id: string) => {
    await onReject(id);
    fetchData();
  };

  const pending = allTransactions.filter(t => t.status === 'pending');
  const deposits = pending.filter(t => t.type === 'deposit');
  const withdrawals = pending.filter(t => t.type === 'withdrawal');
  const history = allTransactions.filter(t => t.status !== 'pending');

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('አካውንት ቁጥሩ ተቀድቷል!');
    } else {
      toast.error('ኮፒ ማድረግ አልተቻለም');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto">
      <header className="sticky top-0 bg-slate-900 text-white p-4 flex justify-between items-center shadow-xl z-50">
        <div className="flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary" />
          <h1 className="font-black text-lg uppercase tracking-tight">Walya Admin Panel</h1>
        </div>
        <Button variant="ghost" className="text-white font-black amharic-text" onClick={onClose}>ውጣ (EXIT)</Button>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 bg-primary/10 border-primary/20 rounded-2xl shadow-sm">
            <Users className="w-5 h-5 text-primary mb-2" />
            <p className="text-[11px] font-black text-muted-foreground uppercase amharic-text">ጠቅላላ ተጠቃሚዎች</p>
            <p className="text-xl font-black">{state.totalUsers.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-amber-500/10 border-amber-500/20 rounded-2xl shadow-sm">
            <Clock className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-[11px] font-black text-muted-foreground uppercase amharic-text">በጥበቃ ላይ</p>
            <p className="text-xl font-black">{pending.length}</p>
          </Card>
          <Button onClick={fetchData} variant="outline" className="h-full rounded-2xl border-2 amharic-text">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ዳታ አድስ (Refresh)"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-8 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 shadow-inner">
            <TabsTrigger value="withdrawals" className="font-black text-[11px] uppercase gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm transition-all amharic-text">
              <WalletCards className="w-3.5 h-3.5" /> ወጪዎች ({withdrawals.length})
            </TabsTrigger>
            <TabsTrigger value="deposits" className="font-black text-[11px] uppercase gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm transition-all amharic-text">
              <ArrowDownLeft className="w-3.5 h-3.5" /> ገቢዎች ({deposits.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="font-black text-[11px] uppercase gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm transition-all amharic-text">
              <Users className="w-3.5 h-3.5" /> ተጠቃሚዎች ({allUsers.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="font-black text-[11px] uppercase gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-sm transition-all amharic-text">
              <Clock className="w-3.5 h-3.5" /> ታሪክ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawals" className="space-y-4 mt-2">
            {withdrawals.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-bold amharic-text">ምንም የወጪ ጥያቄ የለም</div>
            ) : (
              withdrawals.map(tx => (
                <RequestCard key={tx.id} tx={tx} onApprove={handleApprove} onReject={handleReject} onCopy={handleCopy} type="withdrawal" />
              ))
            )}
          </TabsContent>

          <TabsContent value="deposits" className="space-y-4 mt-2">
            {deposits.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-bold amharic-text">ምንም የገቢ ጥያቄ የለም</div>
            ) : (
              deposits.map(tx => (
                <RequestCard key={tx.id} tx={tx} onApprove={handleApprove} onReject={handleReject} type="deposit" />
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-2">
            {allUsers.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-bold amharic-text">ምንም ተጠቃሚ የለም</div>
            ) : (
              <div className="grid gap-3 pb-20">
                {allUsers.map(u => (
                  <Card key={u.id} className="p-4 rounded-2xl flex items-center justify-between border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                        <User className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-black text-[15px]">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground font-bold amharic-text">የተቀላቀለበት: {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black">{(u.main_balance + u.withdrawable_balance).toLocaleString()} <span className="text-[10px]">ETB</span></p>
                      <Badge variant="secondary" className="text-[9px] uppercase mt-1 px-2 py-0.5 rounded-lg">Grade {u.level}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-2">
            {history.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground font-bold amharic-text">ምንም የታሪክ መረጃ የለም</div>
            ) : (
              <div className="pb-20 space-y-4">
                {history.slice(0, 50).map(tx => (
                  <RequestCard key={tx.id} tx={tx} onApprove={handleApprove} onReject={handleReject} isHistory />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const RequestCard = ({ 
  tx, 
  onApprove, 
  onReject, 
  onCopy, 
  type,
  isHistory = false 
}: { 
  tx: Transaction, 
  onApprove: (id: string) => void, 
  onReject: (id: string) => void, 
  onCopy?: (text: string) => void,
  type?: 'deposit' | 'withdrawal',
  isHistory?: boolean
}) => {
  const level = tx.levelId !== undefined ? LEVELS.find(l => l.id === tx.levelId) : null;
  const isWithdraw = tx.type === 'withdrawal';
  
  return (
    <Card className="p-6 rounded-3xl border-border/50 shadow-sm space-y-5 bg-white dark:bg-slate-900 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl shadow-sm ${isWithdraw ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {isWithdraw ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest amharic-text">{isWithdraw ? 'ወጪ' : 'ገቢ'}</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{tx.amount.toLocaleString()} <span className="text-xs">ETB</span></p>
          </div>
        </div>
        <Badge className={`uppercase text-[10px] font-black px-3 py-1 rounded-full amharic-text shadow-sm ${
          tx.status === 'approved' ? 'bg-green-500' : tx.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
        }`}>
          {tx.status === 'approved' ? 'ጸድቋል' : tx.status === 'rejected' ? 'ውድቅ ተደርጓል' : 'በጥበቃ ላይ'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-5 text-[11px] font-bold">
        <div className="space-y-1.5">
          <p className="text-muted-foreground uppercase font-black tracking-widest amharic-text">ተጠቃሚ</p>
          <p className="text-[15px] font-black">{tx.userName}</p>
        </div>
        {tx.bankAccount && (
          <div className="space-y-1.5">
            <p className="text-muted-foreground uppercase font-black tracking-widest amharic-text">ባንክ ዝርዝር</p>
            <p className="text-[14px] font-black text-primary tracking-tight">{tx.bankAccount}</p>
          </div>
        )}
        {level && (
          <div className="space-y-1.5">
            <p className="text-muted-foreground uppercase font-black tracking-widest amharic-text">ደረጃ</p>
            <p className="text-[14px] font-black text-amber-600">{level.name}</p>
          </div>
        )}
        <div className="space-y-1.5">
          <p className="text-muted-foreground uppercase font-black tracking-widest amharic-text">ቀን</p>
          <p className="text-slate-500 font-bold">{new Date(tx.date).toLocaleString()}</p>
        </div>
      </div>

      {tx.type === 'deposit' && !isHistory && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-border/50 text-center shadow-inner group">
          <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest amharic-text">የክፍያ ማረጋገጫ (Payment Proof)</p>
          <div className="h-28 bg-slate-200/50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[12px] font-black text-slate-400 transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
            Screenshot Placeholder
          </div>
        </div>
      )}

      {!isHistory && (
        <div className="flex flex-col gap-3 pt-2">
          {isWithdraw && onCopy && (
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl font-black uppercase text-[11px] gap-2 bg-slate-50 dark:bg-slate-800 border-none shadow-sm amharic-text" 
              onClick={() => {
                const parts = tx.bankAccount?.split(' - ') || [];
                const accNo = parts[parts.length - 1] || "";
                onCopy(accNo);
              }}
            >
              <Copy className="w-4 h-4" /> አካውንት ቁጥሩን ኮፒ አድርግ
            </Button>
          )}
          <div className="flex gap-3">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 h-14 rounded-2xl font-black uppercase text-xs shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] amharic-text" onClick={() => onApprove(tx.id)}>
              <CheckCircle2 className="w-5 h-5 mr-2" /> {isWithdraw ? 'ተከፍሏል (Paid)' : 'አጽድቅ (Approve)'}
            </Button>
            <Button variant="destructive" className="flex-1 h-14 rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] amharic-text" onClick={() => onReject(tx.id)}>
              <X className="w-5 h-5 mr-2" /> ውድቅ አድርግ (Reject)
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};