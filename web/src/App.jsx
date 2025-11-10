import { useState, useEffect } from 'react';
import TicketsList from './components/TicketsList';
import TicketDetail from './components/TicketDetail';
import KBManager from './components/KBManager';
import AuthPrompt from './components/AuthPrompt';
import TicketSubmission from './components/TicketSubmission';
import { LABELS, APP_TITLES } from './constants';

function App() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setCheckingAuth(false);
  }, []);

  const handleAuth = (token) => {
    setIsAuthenticated(!!token);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{LABELS.LOADING}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showAdminLogin) {
      return <AuthPrompt onAuth={handleAuth} onBack={() => setShowAdminLogin(false)} />;
    }
    
    return (
      <div>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowAdminLogin(true)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {LABELS.ADMIN_LOGIN}
          </button>
        </div>
        <TicketSubmission />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{APP_TITLES.MAIN}</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {LABELS.LOGOUT}
          </button>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('tickets');
                setSelectedTicketId(null);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {LABELS.TICKETS}
            </button>
            <button
              onClick={() => {
                setActiveTab('kb');
                setSelectedTicketId(null);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'kb'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {LABELS.KNOWLEDGE_BASE}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tickets' && (
          <>
            {selectedTicketId ? (
              <TicketDetail
                ticketId={selectedTicketId}
                onBack={() => setSelectedTicketId(null)}
              />
            ) : (
              <TicketsList onSelectTicket={setSelectedTicketId} />
            )}
          </>
        )}
        {activeTab === 'kb' && <KBManager />}
      </main>
    </div>
  );
}

export default App;

