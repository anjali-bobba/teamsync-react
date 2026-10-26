export const Loading = () => <div className="state" role="status" aria-live="polite">Loading…</div>
export const ErrorBox = ({ error, onRetry }) => <div className="state err" role="alert">{error?.message || 'Something went wrong.'}{onRetry && <> <button className="btn" onClick={onRetry}>Retry</button></>}</div>
export const Empty = ({ title, hint }) => <div className="state"><b>{title}</b><p>{hint}</p></div>
export const Badge = ({ kind, children }) => <span className={`badge b-${String(kind).toLowerCase().replace(/\s/g, '')}`}>{children}</span>
export const Field = ({ label, error, children }) => <label className="field"><span>{label}</span>{children}{error && <small className="errtxt" role="alert">{error}</small>}</label>
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  return <nav className="pager" aria-label="Pagination"><button className="btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button className="btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button></nav>
}
