import { MODERATION } from '../../constants';

export default function ModerationStatus({ moderation }) {
  if (!moderation) return null;

  const isAllowed = moderation.allowed;
  const bgClass = isAllowed 
    ? 'bg-green-50 border border-green-200' 
    : 'bg-red-50 border border-red-200';
  const textClass = isAllowed ? 'text-green-800' : 'text-red-800';
  const iconClass = isAllowed ? 'text-green-400' : 'text-red-400';
  const reasonTextClass = isAllowed ? 'text-green-700' : 'text-red-700';

  return (
    <div className={`p-4 rounded-lg shadow ${bgClass}`}>
      <div className="flex items-center">
        {isAllowed ? (
          <svg className={`h-5 w-5 ${iconClass} mr-2`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className={`h-5 w-5 ${iconClass} mr-2`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <span className={`font-medium ${textClass}`}>
          {isAllowed ? MODERATION.CONTENT_APPROVED : MODERATION.CONTENT_REJECTED}
        </span>
      </div>
      {moderation.reasons && moderation.reasons.length > 0 && (
        <div className="mt-2 text-sm">
          <span className="font-medium">{MODERATION.REASONS}</span>
          <ul className="list-disc list-inside mt-1">
            {moderation.reasons.map((reason, idx) => (
              <li key={idx} className={reasonTextClass}>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

