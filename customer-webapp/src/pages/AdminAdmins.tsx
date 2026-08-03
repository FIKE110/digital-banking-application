import { useCallback, useEffect, useState } from 'react';
import { adminListAdmins, adminCreateAdmin, adminSetAdminStatus } from '../api/admin';
import { formatDate } from '../utils/format';
import { PageHeader } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Dialog from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import { BANK_WEBSITE } from '../config';
import type { AdminUser, Paginated } from '../types';

const PAGE_SIZE = 15;

export default function AdminAdmins() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', roles: 'ADMIN' });

  const fetchAdmins = useCallback(async () => {
    try {
      const r = await adminListAdmins({ page, size: PAGE_SIZE });
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const createAdmin = async () => {
    try {
      await adminCreateAdmin({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        roles: form.roles.split(',').map(r => r.trim()).filter(Boolean),
      });
      success(`Admin ${form.username.trim()} created`);
      setShowCreate(false);
      setForm({ username: '', email: '', password: '', roles: 'ADMIN' });
      await fetchAdmins();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const toggleStatus = async (admin: AdminUser) => {
    setBusyId(admin.id);
    try {
      const enabled = admin.status === 'ACTIVE';
      await adminSetAdminStatus(admin.id, !enabled);
      success(enabled ? `Admin ${admin.username} disabled` : `Admin ${admin.username} enabled`);
      await fetchAdmins();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update admin status');
    } finally {
      setBusyId(null);
    }
  };

  const admins = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load admins" body={loadError} onRetry={fetchAdmins} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Administrator Accounts"
        subtitle="Create and manage administrator access"
        actions={
          <>
            <span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>
            <button className="btn btn--brand" onClick={() => setShowCreate(true)}>
              <Icon name="plus" size={14} /> New Admin
            </button>
          </>
        }
      />

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td className="font-semibold">
                    <span className="row" style={{ gap: 8 }}>
                      <span className="avatar avatar--sm">{a.username?.charAt(0)?.toUpperCase() ?? 'A'}</span>
                      {a.username}
                    </span>
                  </td>
                  <td className="text-sm">{a.email}</td>
                  <td>
                    <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                      {(a.roleNames ?? []).slice(0, 3).map(r => (
                        <span key={r} className="badge badge--brand">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-sm">{formatDate(a.createdAt)}</td>
                  <td>
                    <button
                      className={`btn btn--sm ${a.status === 'ACTIVE' ? 'btn--danger-ghost' : 'btn--brand'}`}
                      disabled={busyId === a.id}
                      onClick={() => toggleStatus(a)}
                    >
                      <Icon name={a.status === 'ACTIVE' ? 'lock' : 'unlock'} size={13} />
                      {a.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {admins.length === 0 && <EmptyState icon="shield" title="No admins found" body="Administrator accounts will appear here." />}
      </div>

      {totalPages > 1 && (
        <div className="row" style={{ justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--ghost btn--sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-muted" style={{ fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
          <button className="btn btn--ghost btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Dialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create administrator"
        subtitle="Add a new admin who can access the Admin Portal"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn--brand" onClick={createAdmin} disabled={!form.username.trim() || !form.email.trim() || !form.password}>
              Create admin
            </button>
          </>
        }
      >
        <div className="stack" style={{ gap: 12 }}>
          <div className="field">
            <label className="field__label">Username</label>
            <input className="input" value={form.username} onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))} placeholder="e.g. operations" />
          </div>
          <div className="field">
            <label className="field__label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder={`admin@${BANK_WEBSITE}`} />
          </div>
          <div className="field">
            <label className="field__label">Password</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Temporary password" />
          </div>
          <div className="field">
            <label className="field__label">Roles (comma separated)</label>
            <input className="input" value={form.roles} onChange={e => setForm(prev => ({ ...prev, roles: e.target.value }))} placeholder="ADMIN" />
          </div>
        </div>
      </Dialog>
    </div>
  );
}