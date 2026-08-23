import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getKycStatus, type KycStatus } from '../api/kyc';

interface KycContextType {
  kyc: KycStatus | null;
  loading: boolean;
  needsOnboarding: boolean;
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  refresh: () => Promise<void>;
}

const KycContext = createContext<KycContextType>(null!);

export function KycProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [kyc, setKyc] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) {
      setKyc(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getKycStatus();
      setKyc(res.data ?? null);
    } catch {
      setKyc(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const status = kyc?.status ?? 'NOT_STARTED';
  const needsOnboarding = status === 'NOT_STARTED' || status === 'IN_PROGRESS';
  const isPending = status === 'SUBMITTED' || status === 'UNDER_REVIEW';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  return (
    <KycContext.Provider value={{ kyc, loading, needsOnboarding, isPending, isApproved, isRejected, refresh }}>
      {children}
    </KycContext.Provider>
  );
}

export const useKyc = () => useContext(KycContext);