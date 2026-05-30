export interface UserLevel {
  id: number;
  name: string;
  cost: number;
  dailyLimit: number; // Max earnings per day
  dailyRoi: number; // Percentage
  monthlyIncome: number;
  annualIncome: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  levelId?: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  bankAccount?: string;
  screenshot?: string;
  userName?: string;
}

export interface GameState {
  mainBalance: number; // Deposit amount
  withdrawableBalance: number; // Tapping earnings
  level: number;
  totalTaps: number;
  dailyTaps: number;
  lastTapDate: string;
  referralCount: number;
  referralCode: string;
  showLimitModal: boolean;
  userRank: number;
  totalUsers: number;
  accountExpiryDate: string;
  pendingTransactions: Transaction[];
  isBonusWithdrawn: boolean;
  cooldownEndTime: string | null;
}

export const LEVELS: UserLevel[] = [
  { id: 0, name: "Normal (Free)", cost: 0, dailyLimit: 30, dailyRoi: 0, monthlyIncome: 0, annualIncome: 0 },
  { id: 1, name: "Grade 1", cost: 500, dailyLimit: 25, dailyRoi: 5, monthlyIncome: 750, annualIncome: 9125 },
  { id: 2, name: "Grade 2", cost: 1000, dailyLimit: 50, dailyRoi: 5, monthlyIncome: 1500, annualIncome: 18250 },
  { id: 3, name: "Grade 3", cost: 4000, dailyLimit: 200, dailyRoi: 5, monthlyIncome: 6000, annualIncome: 73000 },
  { id: 4, name: "Grade 4", cost: 15000, dailyLimit: 750, dailyRoi: 5, monthlyIncome: 22500, annualIncome: 273750 },
  { id: 5, name: "Grade 5", cost: 50000, dailyLimit: 2500, dailyRoi: 5, monthlyIncome: 75000, annualIncome: 912500 },
];