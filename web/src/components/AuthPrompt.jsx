import { useState } from 'react';
import { LABELS, PLACEHOLDERS, MESSAGES } from '../constants';

export default function AuthPrompt({ onAuth, onBack }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
      if (!token.trim()) {
      setError(MESSAGES.TOKEN_REQUIRED);
      return;
    }
    localStorage.setItem('adminToken', token);
    onAuth(token);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            {LABELS.BACK_TO_TICKET_SUBMISSION}
          </button>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{LABELS.ADMIN_AUTHENTICATION}</h2>
        <p className="text-gray-600 mb-6">
          {MESSAGES.ADMIN_TOKEN_DESCRIPTION}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              {LABELS.ADMIN_TOKEN}
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
              placeholder={PLACEHOLDERS.ADMIN_TOKEN}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {LABELS.AUTHENTICATE}
          </button>
        </form>
        
        <p className="mt-4 text-xs text-gray-500 text-center">
          {MESSAGES.DEFAULT_TOKEN_INFO.split(': ')[0]}: <code className="bg-gray-100 px-1 rounded">{MESSAGES.DEFAULT_TOKEN_VALUE}</code>
        </p>
      </div>
    </div>
  );
}

