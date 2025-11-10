
export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

export const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'normal': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getIntentColor = (intent) => {
  switch (intent) {
    case 'billing': return 'bg-purple-100 text-purple-800';
    case 'technical': return 'bg-blue-100 text-blue-800';
    case 'account': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'answered': return 'bg-green-100 text-green-800';
    case 'needs_info': return 'bg-orange-100 text-orange-800';
    case 'queued': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const extractCitations = (text) => {
  const citationRegex = /\[KB-([^\]]+)\]/g;
  const matches = [];
  let match;
  while ((match = citationRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};


export const renderAnswerWithCitations = (text, onCitationClick) => {
  const parts = text.split(/(\[KB-[^\]]+\])/g);
  return parts.map((part, idx) => {
    const citationMatch = part.match(/\[KB-([^\]]+)\]/);
    if (citationMatch) {
      const kbId = citationMatch[1];
      return (
        <button
          key={idx}
          onClick={() => onCitationClick(kbId)}
          className="text-blue-600 hover:text-blue-800 underline font-semibold"
        >
          {part}
        </button>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};


export const handleAuthError = (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    localStorage.removeItem('adminToken');
    window.location.reload();
    return true;
  }
  return false;
};


export const debounce = (func, wait) => {
  let timeout;
  const debounced = function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
};

