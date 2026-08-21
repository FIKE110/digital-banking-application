import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../ui/Card';
import Button from '../ui/Button';
import Dialog from '../ui/Dialog';
import { Field, Input, Select } from '../ui/FormControls';
import Badge from '../ui/Badge';
import BankCard from '../ui/BankCard';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import { createCard, freezeCard, getCards, replaceCard, unfreezeCard, updateCardLimits, changeCardPin, type Card } from '../api/cards';
import { getAccounts } from '../api/accounts';
import { formatMoney, formatDate } from '../utils/format';
import type { Account } from '../types';

type DialogKind = 'create' | 'pin' | 'limits' | 'replace' | null;

const VALIDATION = /^\d{4}$/;

export default function Cards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [active, setActive] = useState<Card | null>(null);
  const [busy, setBusy] = useState(false);
  const { success, error: toastError } = useToast();

  // create form
  const [accountNumber, setAccountNumber] = useState('');
  const [cardType, setCardType] = useState<'PHYSICAL' | 'VIRTUAL'>('PHYSICAL');
  // pin form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  // limits form
  const [dailyLimit, setDailyLimit] = useState(500000);
  const [monthlyLimit, setMonthlyLimit] = useState(2000000);

  const load = useCallback(async () => {
    try {
      const [cardsRes, accountsRes] = await Promise.all([getCards(), getAccounts()]);
      setCards(cardsRes.data || []);
      setAccounts(accountsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async (message: string) => {
    const res = await getCards();
    setCards(res.data || []);
    success(message);
  }, [success]);

  const close = () => { setDialog(null); setActive(null); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber) return;
    setBusy(true);
    try {
      await createCard({ accountNumber, cardType });
      await refresh('Card created successfully');
      close();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create card');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleFreeze = async (card: Card) => {
    try {
      if (card.status === 'FROZEN') {
        await unfreezeCard(card.id);
        await refresh('Card unfrozen');
      } else {
        await freezeCard(card.id);
        await refresh('Card frozen. Payments will be declined');
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handlePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    if (!VALIDATION.test(currentPin) || !VALIDATION.test(newPin)) {
      toastError('PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      toastError('New PIN and confirmation do not match');
      return;
    }
      setBusy(true);
    try {
      await changeCardPin(active.id, currentPin, newPin);
      await refresh('Card PIN changed successfully');
      close();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to change PIN');
    } finally {
      setBusy(false);
    }
  };

  const handleLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    if (dailyLimit <= 0 || monthlyLimit <= 0 || monthlyLimit < dailyLimit) {
      toastError('Monthly limit must be greater than the daily limit');
      return;
    }
    setBusy(true);
    try {
      await updateCardLimits(active.id, dailyLimit, monthlyLimit);
      await refresh('Card limits updated');
      close();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update limits');
    } finally {
      setBusy(false);
    }
  };

  const handleReplace = async () => {
    if (!active) return;
    setBusy(true);
    try {
      await replaceCard(active.id);
      await refresh('Card replaced. The old card is no longer active');
      close();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to replace card');
    } finally {
      setBusy(false);
    }
  };

  const openLimits = (card: Card) => {
    setActive(card);
    setDailyLimit(Number(card.dailyLimit));
    setMonthlyLimit(Number(card.monthlyLimit));
    setDialog('limits');
  };

  const currency = (accountNumber: string) =>
    accounts.find(a => a.accountNumber === accountNumber)?.currency ?? 'NGN';

  const totals = useMemo(() => {
    const activeCards = cards.filter(c => c.status !== 'CLOSED');
    const frozen = activeCards.filter(c => c.status === 'FROZEN').length;
    return { total: activeCards.length, frozen };
  }, [cards]);

  if (loading) return <SkeletonRows rows={6} />;
  if (error) return <ErrorState title="Couldn't load cards" body={error} onRetry={load} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Cards"
        subtitle="Manage your physical and virtual cards"
        actions={
          <Button icon="plus" onClick={() => setDialog('create')}>
            Request a card
          </Button>
        }
      />

      <div className="grid-2">
        <div className="surface stat-card">
          <div className="stat-card__icon"><Icon name="card" size={18} /></div>
          <div>
            <div className="stat-card__label">Active cards</div>
            <div className="stat-card__value">{totals.total}</div>
          </div>
        </div>
        <div className="surface stat-card">
          <div className="stat-card__icon stat-card__icon--warning"><Icon name="snowflake" size={18} /></div>
          <div>
            <div className="stat-card__label">Frozen</div>
            <div className="stat-card__value">{totals.frozen}</div>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon="card"
          title="No cards yet"
          body="Request a physical or virtual card to pay online, in stores and everywhere you go."
          actionLabel="Request a card"
          action={() => setDialog('create')}
        />
      ) : (
        <div className="stack" style={{ gap: 20 }}>
          {cards.map(card => (
            <div key={card.id} className="surface" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="stack stack--4" style={{ padding: 'var(--space-5)' }}>
                <div className="grid-2" style={{ gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  <BankCard
                    card={{
                      id: card.id,
                      last4: card.cardNumber.slice(-4),
                      cardNumber: card.cardNumber,
                      cardholderName: 'YOU',
                      expiry: card.expiryDate?.slice(0, 7)?.replace('-', '/'),
                      status: card.status,
                      type: card.cardType,
                    }}
                  />
                  <div className="stack stack--3" style={{ justifyContent: 'center' }}>
                    <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <Badge tone={card.status === 'ACTIVE' ? 'success' : 'warning'}>
                        <Icon name={card.status === 'ACTIVE' ? 'checkCircle' : 'snowflake'} size={11} />
                        {card.status}
                      </Badge>
                      <Badge tone="info">{card.cardType}</Badge>
                    </div>
                    <dl className="stack stack--2" style={{ margin: 0 }}>
                      <div className="row row--between">
                        <dt className="muted text-sm">Linked account</dt>
                        <dd className="mono text-sm font-semibold" style={{ margin: 0 }}>{card.accountNumber}</dd>
                      </div>
                      <div className="row row--between">
                        <dt className="muted text-sm">Daily limit</dt>
                        <dd className="text-sm font-semibold" style={{ margin: 0 }}>
                          {formatMoney(card.dailyLimit, currency(card.accountNumber))}
                        </dd>
                      </div>
                      <div className="row row--between">
                        <dt className="muted text-sm">Monthly limit</dt>
                        <dd className="text-sm font-semibold" style={{ margin: 0 }}>
                          {formatMoney(card.monthlyLimit, currency(card.accountNumber))}
                        </dd>
                      </div>
                      <div className="row row--between">
                        <dt className="muted text-sm">Issued</dt>
                        <dd className="text-sm font-semibold" style={{ margin: 0 }}>{formatDate(card.createdAt)}</dd>
                      </div>
                    </dl>
                    <div className="row" style={{ flexWrap: 'wrap' }}>
                      <Button
                        variant={card.status === 'FROZEN' ? 'secondary' : 'warning'}
                        size="sm"
                        icon={card.status === 'FROZEN' ? 'play' : 'pause'}
                        onClick={() => handleToggleFreeze(card)}
                      >
                        {card.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                      </Button>
                      <Button variant="secondary" size="sm" icon="pin" onClick={() => { setActive(card); setCurrentPin(''); setNewPin(''); setConfirmPin(''); setDialog('pin'); }}>
                        Change PIN
                      </Button>
                      <Button variant="secondary" size="sm" icon="settings" onClick={() => openLimits(card)}>
                        Limits
                      </Button>
                      <Button variant="ghost" size="sm" icon="refresh" onClick={() => { setActive(card); setDialog('replace'); }}>
                        Replace
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialog === 'create'}
        onClose={close}
        title="Request a card"
        subtitle="Choose a card type and the account to link it to"
      >
        <form onSubmit={handleCreate} className="stack stack--4">
          <Field label="Card type">
            <Select value={cardType} onChange={e => setCardType(e.target.value as 'PHYSICAL' | 'VIRTUAL')}>
              <option value="PHYSICAL">Physical (for use in stores and ATMs)</option>
              <option value="VIRTUAL">Virtual (for online payments)</option>
            </Select>
          </Field>
          <Field label="Linked account">
            <Select value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required>
              <option value="">Select an account</option>
              {accounts.map(a => (
                <option key={a.id} value={a.accountNumber}>
                  {a.accountName} · {a.accountNumber} · {formatMoney(a.balance, a.currency)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={close} type="button">Cancel</Button>
            <Button type="submit" loading={busy} disabled={!accountNumber}>Create card</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={dialog === 'pin'}
        onClose={close}
        title="Change card PIN"
        subtitle={`${active?.cardType ?? ''} card ending in ${active?.cardNumber.slice(-4) ?? '····'}`}
      >
        <form onSubmit={handlePin} className="stack stack--4">
          <Field label="Current PIN">
            <Input type="password" inputMode="numeric" maxLength={4} value={currentPin} onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))} required autoComplete="current-password" />
          </Field>
          <Field label="New PIN">
            <Input type="password" inputMode="numeric" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} required autoComplete="new-password" />
          </Field>
          <Field label="Confirm new PIN">
            <Input type="password" inputMode="numeric" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} required autoComplete="new-password" />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={close} type="button">Cancel</Button>
            <Button type="submit" loading={busy}>Update PIN</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={dialog === 'limits'}
        onClose={close}
        title="Spending limits"
        subtitle={`${active?.cardType ?? ''} card ending in ${active?.cardNumber.slice(-4) ?? '····'}`}
      >
        <form onSubmit={handleLimits} className="stack stack--4">
          <Field label="Daily limit" hint="Maximum you can spend in one day">
            <Input type="number" min={100} step={1000} value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} required />
          </Field>
          <Field label="Monthly limit" hint="Must be greater than the daily limit">
            <Input type="number" min={1000} step={10000} value={monthlyLimit} onChange={e => setMonthlyLimit(Number(e.target.value))} required />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={close} type="button">Cancel</Button>
            <Button type="submit" loading={busy}>Save limits</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={dialog === 'replace'}
        onClose={close}
        title="Replace card"
        subtitle={`${active?.cardType ?? ''} card ending in ${active?.cardNumber.slice(-4) ?? '····'}`}
      >
        <div className="stack stack--4">
          <p className="text-sm" style={{ color: 'var(--color-text-2)' }}>
            A replacement card will be issued with a new number and PIN. Your current card will be
            deactivated immediately. Continue?
          </p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={close} type="button">Cancel</Button>
            <Button variant="danger" onClick={handleReplace} loading={busy}>Replace card</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
