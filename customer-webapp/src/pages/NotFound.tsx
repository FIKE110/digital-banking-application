import { PageHeader } from '../ui/Card';
import { EmptyState } from '../ui/States';

export default function NotFound() {
  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader title="Page not found" subtitle="The page you are looking for doesn't exist." />
      <EmptyState
        icon="search"
        title="404 — Lost in the vault"
        body="The page may have been moved, renamed, or never existed."
        actionLabel="Back to dashboard"
        action={() => { window.location.href = '/dashboard'; }}
      />
    </div>
  );
}
