import { useState } from 'react';
import type { SkippedRow } from '../../../lib/receiveImport';

export interface ImportReport {
  filename: string;
  matched: number;
  added: number;
  updated: number;
  skipped: SkippedRow[];
}

interface Props {
  report: ImportReport;
  onDismiss: () => void;
}

export const ImportSummaryStrip = ({ report, onDismiss }: Props) => {
  const [showSkipped, setShowSkipped] = useState(false);
  return (
    <div className="card import-strip" role="status">
      <div className="import-strip-row">
        <span className="import-strip-file">📄 {report.filename}</span>
        <span className="import-strip-stat">
          <strong>{report.matched}</strong> matched
        </span>
        <span className="import-strip-stat">
          <strong>{report.added}</strong> new
        </span>
        {report.updated > 0 && (
          <span className="import-strip-stat">
            <strong>{report.updated}</strong> line{report.updated === 1 ? '' : 's'} updated
          </span>
        )}
        {report.skipped.length > 0 && (
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => setShowSkipped((s) => !s)}
          >
            {report.skipped.length} skipped {showSkipped ? '▴' : '▾'}
          </button>
        )}
        <button
          type="button"
          className="btn btn-quiet btn-sm import-strip-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss import summary"
        >
          ✕
        </button>
      </div>
      {showSkipped && (
        <ul className="import-skip-list">
          {report.skipped.map((s) => (
            <li key={s.rowNo}>
              Row {s.rowNo} · <strong>{s.label}</strong> — {s.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
