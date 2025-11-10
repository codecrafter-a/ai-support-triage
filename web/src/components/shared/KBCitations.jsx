import { KB_SOURCES } from '../../constants';

export default function KBCitations({ citations, similarity, onCitationClick }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
      <div className="flex items-center mb-2">
        <svg className="h-4 w-4 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
        <span className="font-medium text-blue-800">{KB_SOURCES.LABEL(citations.length)}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {citations.map((id) => (
          <button
            key={id}
            onClick={() => onCitationClick(id)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            title={KB_SOURCES.CLICK_TO_VIEW(id)}
          >
            📚 KB-{id}
          </button>
        ))}
      </div>
      {similarity && (
        <p className="mt-2 text-xs text-blue-600">
          {KB_SOURCES.BEST_MATCH(similarity)}
        </p>
      )}
    </div>
  );
}

