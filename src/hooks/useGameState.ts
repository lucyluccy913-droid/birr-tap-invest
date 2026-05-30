import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, LEVELS, Transaction } from '../types/game';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const getStorageKey = (userId: string) => `walya_business_state_${userId}_v8`;

const createInitialState = (userId: string): GameState => {
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 3);

  return {
    mainBalance: 0,
    withdrawableBalance: 0,
    level: 0,
    totalTaps: 0,
    dailyTaps: 0,
    lastTapDate: new Date().toDateString(),
    referralCount: 0,
    referralCode: 'WALYA' + userId.slice(-4),
    showLimitModal: false,
    userRank: Math.floor(Math.random() * 5000) + 1000,
    totalUsers: 0,
    accountExpiryDate: expiry.toISOString(),
    pendingTransactions: [],
    isBonusWithdrawn: false,
    cooldownEndTime: null,
  };
};

export const useGameState = (userId: string) => {
  const STORAGE_KEY = useMemo(() => getStorageKey(userId), [userId]);
  const [loading, setLoading] = useState(true);
  const [allUsersCount, setAllUsersCount] = useState(0);

  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        const today = new Date().toDateString();
        if (parsed.lastTapDate !== today) {
          return { ...parsed, dailyTaps: 0, lastTapDate: today };
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse local storage state", e);
    }
    return createInitialState(userId);
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || userId === 'anonymous') {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId);

        if (txError) {
          console.error('Error fetching transactions:', txError);
        }

        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (!countError && count !== null) {
          setAllUsersCount(count); 
        }

        if (profile) {
          const mappedState: GameState = {
            mainBalance: Number(profile.main_balance || 0),
            withdrawableBalance: Number(profile.withdrawable_balance || 0),
            level: Number(profile.level || 0),
            totalTaps: Number(profile.total_taps || 0),
            dailyTaps: Number(profile.daily_taps || 0),
            lastTapDate: profile.last_tap_date || new Date().toDateString(),
            referralCount: Number(profile.referral_count || 0),
            referralCode: profile.referral_code || ('WALYA' + userId.slice(-4)),
            userRank: Number(profile.user_rank || 1000),
            totalUsers: count !== null ? count : (state.totalUsers || 0),
            accountExpiryDate: profile.account_expiry_date || new Date().toISOString(),
            isBonusWithdrawn: Boolean(profile.is_bonus_withdrawn),
            cooldownEndTime: profile.cooldown_end_time || null,
            pendingTransactions: (transactions || []).map(t => ({
              id: t.id,
              type: t.type,
              amount: Number(t.amount || 0),
              levelId: t.level_id,
              status: t.status,
              date: t.date,
              bankAccount: t.bank_account,
              screenshot: t.screenshot,
              userName: t.user_name
            })),
            showLimitModal: false,
          };
          setState(mappedState);
        } else {
          const initialState = createInitialState(userId);
          await supabase.from('profiles').upsert({
            id: userId,
            name: "User_" + userId.slice(-4),
            main_balance: initialState.mainBalance,
            withdrawable_balance: initialState.withdrawableBalance,
            level: initialState.level,
            total_taps: initialState.totalTaps,
            daily_taps: initialState.dailyTaps,
            last_tap_date: initialState.lastTapDate,
            referral_count: initialState.referralCount,
            referral_code: initialState.referralCode,
            user_rank: initialState.userRank,
            total_users: count || 1,
            account_expiry_date: initialState.accountExpiryDate,
            is_bonus_withdrawn: initialState.isBonusWithdrawn,
            cooldown_end_time: initialState.cooldownEndTime,
          });
        }
      } catch (err) {
        console.error('Persistence error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === 'anonymous' || loading) return;

    const saveToSupabase = async () => {
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          main_balance: state.mainBalance,
          withdrawable_balance: state.withdrawableBalance,
          level: state.level,
          total_taps: state.totalTaps,
          daily_taps: state.dailyTaps,
          last_tap_date: state.lastTapDate,
          referral_count: state.referralCount,
          referral_code: state.referralCode,
          user_rank: state.userRank,
          total_users: allUsersCount,
          account_expiry_date: state.accountExpiryDate,
          is_bonus_withdrawn: state.isBonusWithdrawn,
          cooldown_end_time: state.cooldownEndTime,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Failed to sync to Supabase", e);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    const timeout = setTimeout(saveToSupabase, 2000);
    return () => clearTimeout(timeout);
  }, [state, userId, loading, STORAGE_KEY, allUsersCount]);

  const handleTap = useCallback(() => {
    if (state.cooldownEndTime && new Date(state.cooldownEndTime) > new Date()) {
      const remainingTime = new Date(state.cooldownEndTime).getTime() - new Date().getTime();
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      toast.error(`እባክዎን ገቢዎን ስለወሰዱ ለ ${hours} ሰዓት እና ${minutes} ደቂቃ ይጠብቁ።`);
      return false;
    }

    const earningsPerTap = 0.5;
    
    if (state.level === 0) {
      if (state.isBonusWithdrawn) {
        toast.error('የ 30 ብር ቦነስ ወስደዋል። ለመቀጠል እባክዎ በማንኛውም ደረጃ ዲፖዚት ያድርጉ።');
        return false;
      }
      if (state.withdrawableBalance >= 30) {
        setState(prev => ({ ...prev, showLimitModal: true }));
        return false;
      }
    }

    if (state.level > 0) {
      const levelIdx = state.level;
      if (LEVELS[levelIdx]) {
        const currentLevel = LEVELS[levelIdx];
        if (state.withdrawableBalance >= currentLevel.dailyLimit) {
          setState(prev => ({ ...prev, showLimitModal: true }));
          return false;
        }
      }
    }

    setState(prev => ({
      ...prev,
      withdrawableBalance: prev.withdrawableBalance + earningsPerTap,
      totalTaps: prev.totalTaps + 1,
      dailyTaps: prev.dailyTaps + 1,
      lastTapDate: new Date().toDateString(),
    }));
    return true;
  }, [state]);

  const dismissLimitModal = () => {
    setState(prev => ({ ...prev, showLimitModal: false }));
  };

  const submitTransaction = async (tx: Omit<Transaction, 'id' | 'status' | 'date'>) => {
    try {
      const txId = Math.random().toString(36).substr(2, 9);
      const newTx: Transaction = {
        ...tx,
        id: txId,
        status: 'pending',
        date: new Date().toISOString(),
        userName: "ተጠቃሚ",
      };

      setState(prev => ({
        ...prev,
        pendingTransactions: [...prev.pendingTransactions, newTx]
      }));

      await supabase.from('transactions').insert({
        id: txId,
        user_id: userId,
        type: tx.type,
        amount: tx.amount,
        level_id: tx.levelId,
        status: 'pending',
        date: newTx.date,
        bank_account: tx.bankAccount,
        screenshot: tx.screenshot,
        user_name: newTx.userName,
      });
      
      toast.success('ጥያቄዎ ተልኳል። አስተዳዳሪው ሲያጸድቀው ማሳወቂያ ይደርስዎታል።');
      return true;
    } catch (e) {
      console.error("Failed to submit transaction", e);
      toast.error("ጥያቄውን መላክ አልተቻለም። እባክዎ ደግመው ይሞክሩ።");
      return false;
    }
  };

  const approveTransaction = async (txId: string) => {
    try {
      const tx = state.pendingTransactions.find(t => t.id === txId);
      
      await supabase
        .from('transactions')
        .update({ status: 'approved' })
        .eq('id', txId);

      if (tx) {
        setState(prev => {
          let newState = { ...prev };
          if (tx.type === 'deposit') {
            newState.mainBalance = tx.amount;
            newState.level = tx.levelId || 0;
            newState.withdrawableBalance = 0;
            newState.cooldownEndTime = null;
          } else {
            const amount = tx.amount;
            newState.withdrawableBalance = Math.max(0, newState.withdrawableBalance - amount);
            if (prev.level === 0 && !prev.isBonusWithdrawn) {
              newState.isBonusWithdrawn = true;
            } else {
              const cooldown = new Date();
              cooldown.setHours(cooldown.getHours() + 24);
              newState.cooldownEndTime = cooldown.toISOString();
            }
          }
          newState.pendingTransactions = prev.pendingTransactions.map(t => 
            t.id === txId ? { ...t, status: 'approved' } : t
          );
          return newState;
        });
        toast.success('ተግባሩ ተከናውኗል!');
      }
    } catch (e) {
      console.error("Approve error", e);
      toast.error('ማጽደቅ አልተቻለም');
    }
  };

  const rejectTransaction = async (txId: string) => {
    try {
      await supabase
        .from('transactions')
        .update({ status: 'rejected' })
        .eq('id', txId);

      setState(prev => ({
        ...prev,
        pendingTransactions: prev.pendingTransactions.map(t => 
          t.id === txId ? { ...t, status: 'rejected' } : t
        )
      }));
      toast.error('ጥያቄው ውድቅ ተደርጓል።');
    } catch (e) {
      console.error("Reject error", e);
      toast.error('ውድቅ ማድረግ አልተቻለም');
    }
  };

  return { 
    state: { ...state, totalUsers: allUsersCount }, 
    loading,
    handleTap, 
    dismissLimitModal, 
    submitTransaction, 
    approveTransaction, 
    rejectTransaction 
  };
};