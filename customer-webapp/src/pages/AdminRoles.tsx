import { useCallback, useEffect, useState } from 'react';
import { adminListRoles, adminCreateRole, adminUpdateRolePermissions, adminListPermissions } from '../api/admin';
import { formatDate } from '../utils/format';
import { PageHeader } from '../ui/Card';
import Icon from '../ui/Icon';
import { SkeletonRows } from '../ui/Skeleton';
import { EmptyState, ErrorState } from '../ui/States';
import Dialog from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import type { AdminPermission, AdminRole, Paginated } from '../types';

const PAGE_SIZE = 15;

export default function AdminRoles() {
  const { success, error: toastError } = useToast();
  const [pageData, setPageData] = useState<Paginated<AdminRole> | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [editing, setEditing] = useState<AdminRole | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const fetchRoles = useCallback(async () => {
    try {
      const r = await adminListRoles({ page, size: PAGE_SIZE });
      setPageData(r.data ?? null);
    } catch (err: any) {
      setLoadError(err.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchPermissions = useCallback(async () => {
    try {
      const r = await adminListPermissions();
      setPermissions(r.data ?? []);
    } catch {
      // permissions list is optional; role form still works with known ones
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);
  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const createRole = async () => {
    if (!createName.trim()) return;
    try {
      await adminCreateRole({
        roleName: createName.trim().toUpperCase(),
        description: createDesc.trim() || undefined,
        permissions: selectedPerms,
      });
      success(`Role ${createName.trim().toUpperCase()} created`);
      setShowCreate(false);
      setCreateName('');
      setCreateDesc('');
      setSelectedPerms([]);
      await fetchRoles();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to create role');
    }
  };

  const openEdit = (role: AdminRole) => {
    setEditing(role);
    setSelectedPerms([...role.permissions]);
  };

  const savePermissions = async () => {
    if (!editing) return;
    setBusyId(editing.id);
    try {
      await adminUpdateRolePermissions(editing.id, selectedPerms);
      success(`Permissions updated for ${editing.roleName}`);
      setEditing(null);
      await fetchRoles();
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update permissions');
    } finally {
      setBusyId(null);
    }
  };

  const togglePerm = (name: string) => {
    setSelectedPerms(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };

  const roles = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  if (loading) return <SkeletonRows rows={7} />;
  if (loadError) return <ErrorState title="Couldn't load roles" body={loadError} onRetry={fetchRoles} />;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        title="Admin · Roles & Permissions"
        subtitle="Manage system roles and their permissions"
        actions={
          <>
            <span className="badge badge--warning"><Icon name="shield" size={11} /> Administrator</span>
            <button className="btn btn--brand" onClick={() => { setShowCreate(true); setSelectedPerms([]); }}>
              <Icon name="plus" size={14} /> New Role
            </button>
          </>
        }
      />

      <div className="surface" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td className="font-semibold">{role.roleName}</td>
                  <td className="text-sm">{role.description || '—'}</td>
                  <td>
                    <div className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                      {role.permissions.slice(0, 4).map(p => (
                        <span key={p} className="badge badge--neutral">{p}</span>
                      ))}
                      {role.permissions.length > 4 && (
                        <span className="badge badge--info">+{role.permissions.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-sm">{formatDate(role.createdAt)}</td>
                  <td>
                    <button className="btn btn--ghost btn--sm" onClick={() => openEdit(role)}>
                      <Icon name="edit" size={13} /> Permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {roles.length === 0 && <EmptyState icon="shield" title="No roles found" body="System roles will appear here." />}
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
        title="Create role"
        subtitle="Define a new system role with permissions"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn--brand" onClick={createRole} disabled={!createName.trim()}>Create role</button>
          </>
        }
      >
        <div className="stack" style={{ gap: 12 }}>
          <div className="field">
            <label className="field__label">Role name</label>
            <input className="input" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="e.g. SUPPORT_AGENT" />
          </div>
          <div className="field">
            <label className="field__label">Description</label>
            <input className="input" value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Purpose of this role" />
          </div>
          <div>
            <label className="field__label">Permissions</label>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {permissions.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`badge ${selectedPerms.includes(p.permissionName) ? 'badge--brand' : 'badge--neutral'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                  onClick={() => togglePerm(p.permissionName)}
                >
                  {p.permissionName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Permissions · ${editing?.roleName ?? ''}`}
        subtitle="Select the permissions granted to this role"
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn--brand" onClick={savePermissions} disabled={busyId !== null}>Save permissions</button>
          </>
        }
      >
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {permissions.map(p => (
            <button
              key={p.id}
              type="button"
              className={`badge ${selectedPerms.includes(p.permissionName) ? 'badge--brand' : 'badge--neutral'}`}
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={() => togglePerm(p.permissionName)}
            >
              {p.permissionName}
            </button>
          ))}
        </div>
      </Dialog>
    </div>
  );
}