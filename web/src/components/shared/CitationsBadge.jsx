import { EMPTY_STATES } from '../../constants';

export default function CitationsBadge({ citations, maxDisplay = 2, className = '' }) {
  if (!citations || citations.length === 0) {
    return <span className={`text-gray-400 text-xs ${className}`}>{EMPTY_STATES.NO_CITATIONS}</span>;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {citations.slice(0, maxDisplay).map((id) => (
        <span key={id} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          KB-{id.substring(0, 8)}...
        </span>
      ))}
      {citations.length > maxDisplay && (
        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
          +{citations.length - maxDisplay}
        </span>
      )}
    </div>
  );
}

