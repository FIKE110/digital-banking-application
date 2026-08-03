import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import { useToast } from '../ui/Toast';
import {
  getNotifications,
  getUnreadCount,
  getNotificationPreferences,
  markNotificationRead,
  markAllNotificationsRead,
  updateNotificationPreferences,
} from '../api/notifications';
import { formatDate } from '../utils/format';
import type { NotificationItem, NotificationPreference } from '../types';

const KIND_ICON: Record<string, string> = {
  SECURITY: 'shield',
  CREDIT: 'arrowDownLeft',
  DEBIT: 'arrowUpRight',
  SYSTEM: 'info',
};

const KIND_TONE: Record<string, string> = {
  SECURITY: 'stat-card__icon--warning',
  CREDIT: 'stat-card__icon--success',
  DEBIT: 'stat-card__icon--danger',
  SYSTEM: 'stat-card__icon--info',
};

const DEFAULT_PREFS: NotificationPreference = {
  securityAlerts: true,
  transactionAlerts: true,
  promotionalUpdates: false,
};

const PREF_LABELS: Array<{ key: keyof NotificationPreference; label: string }> = [
  { key: 'securityAlerts', label: 'Security alerts' },
  { key: 'transactionAlerts', label: 'Credit and debit alerts' },
  { key: 'promotionalUpdates', label: 'Promotional updates' },
];

export default function Notifications() {
  const { error: toastError } = useToast();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [prefs, setPrefs] = useState<NotificationPreference>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [savingPref, setSavingPref] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getNotifications(0, 20), getUnreadCount(), getNotificationPreferences()])
      .then(([list, count, pref]) => {
        setItems(list.data?.content ?? []);
        setUnread(count.data ?? 0);
        setPrefs(pref.data ?? DEFAULT_PREFS);
      })
      .catch((err: any) => setLoadError(err.response?.data?.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRead = async (n: NotificationItem) => {
    if (n.read) return;
    setItems(prev => prev.map(x => (x.id === n.id ? { ...x, read: true } : x)));
    setUnread(u => Math.max(0, u - 1));
    try {
      await markNotificationRead(n.id);
    } catch {
      load();
    }
  };

  const handleMarkAll = async () => {
    if (unread === 0) return;
    setItems(prev => prev.map(x => ({ ...x, read: true })));
    setUnread(0);
    try {
      await markAllNotificationsRead();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to mark notifications as read');
      load();
    }
  };

  const togglePref = async (key: keyof NotificationPreference) => {
    setSavingPref(key);
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      const res = await updateNotificationPreferences(next);
      setPrefs(res.data ?? next);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update preferences');
      setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    } finally {
      setSavingPref(null);
    }
  };

  const visible = useMemo(
    () => (onlyUnread ? items.filter(n => !n.read) : items),
    [items, onlyUnread],
  );

  if (loading) return <SkeletonRows rows={6} />;
  if (loadError) return <ErrorState title="Couldn't load notifications" body={loadError} onRetry={load} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `You have ${unread} unread notification${unread === 1 ? '' : 's'}` : 'You are all caught up'}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOnlyUnread(v => !v)}>
              {onlyUnread ? 'Show all' : 'Unread only'}
            </Button>
            <Button size="sm" onClick={handleMarkAll} disabled={unread === 0}>
              Mark all read
            </Button>
          </>
        }
      />

      <div className="layout-split">
        <div className="surface" style={{ padding: 'var(--space-5)' }}>
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Activity</h3>
              <p className="muted text-sm" style={{ margin: '2px 0 0' }}>
                {onlyUnread ? `${visible.length} unread` : `${items.length} recent notifications`}
              </p>
            </div>
          </div>
          {visible.length === 0 ? (
            <EmptyState icon="bell" title="Nothing here" body="New notifications will appear here when there is activity on your accounts." />
          ) : (
            <div className="stack scroll-list" style={{ gap: 8, paddingRight: 4 }}>
              {visible.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleRead(n)}
                  className="tx-row"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    alignItems: 'flex-start',
                    cursor: n.read ? 'default' : 'pointer',
                    background: n.read ? 'transparent' : 'var(--color-brand-soft)',
                    border: 'none',
                    color: 'inherit',
                    fontFamily: 'inherit',
                  }}
                >
                  <span className={`stat-card__icon ${KIND_TONE[n.type]}`} style={{ width: 38, height: 38, flexShrink: 0 }}>
                    <Icon name={KIND_ICON[n.type]} size={17} />
                  </span>
                  <span className="tx-row__body">
                    <span className="tx-row__title" style={{ display: 'block' }}>
                      {n.title}
                      {!n.read && <Badge tone="brand">NEW</Badge>}
                    </span>
                    <span className="tx-row__meta">{n.body}</span>
                  </span>
                  <time className="muted text-xs" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {formatDate(n.createdAt)}
                  </time>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="stack" style={{ gap: 'var(--space-5)' }}>
          <div className="surface" style={{ padding: 'var(--space-5)' }}>
            <div className="stat-card__label" style={{ marginBottom: 12 }}>Summary</div>
            <div className="stack" style={{ gap: 14 }}>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <span className="stat-card__icon stat-card__icon--info"><Icon name="bell" size={17} /></span>
                <div>
                  <div className="stat-card__value" style={{ fontSize: 18 }}>{unread}</div>
                  <div className="stat-card__label">Unread</div>
                </div>
              </div>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <span className="stat-card__icon stat-card__icon--warning"><Icon name="shield" size={17} /></span>
                <div>
                  <div className="stat-card__value" style={{ fontSize: 18 }}>
                    {items.filter(n => n.type === 'SECURITY').length}
                  </div>
                  <div className="stat-card__label">Security alerts</div>
                </div>
              </div>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <span className="stat-card__icon stat-card__icon--success"><Icon name="transactions" size={17} /></span>
                <div>
                  <div className="stat-card__value" style={{ fontSize: 18 }}>{items.length}</div>
                  <div className="stat-card__label">Total in view</div>
                </div>
              </div>
            </div>
          </div>

          <div className="surface" style={{ padding: 'var(--space-5)' }}>
            <div className="stat-card__label" style={{ marginBottom: 10 }}>Preferences</div>
            <div className="stack" style={{ gap: 10 }}>
              {PREF_LABELS.map(p => (
                <button
                  key={p.key}
                  type="button"
                  className="row row--between"
                  onClick={() => togglePref(p.key)}
                  disabled={savingPref !== null}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontFamily: 'inherit' }}
                >
                  <span className="text-sm font-semibold">{p.label}</span>
                  <span className={`badge ${prefs[p.key] ? 'badge--success' : 'badge--neutral'}`}>
                    {savingPref === p.key ? 'Saving…' : prefs[p.key] ? 'On' : 'Off'}
                  </span>
                </button>
              ))}
            </div>
            <p className="muted text-xs" style={{ margin: '12px 0 0' }}>
              Preferences are saved and respected for new notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
