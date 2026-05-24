import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import AuthPage from './components/AuthPage';
import Workspace from './components/workspace/Workspace';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('toffee_user');
    const savedToken = localStorage.getItem('toffee_token');
    return savedUser && savedToken ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('toffee_token'));

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setToken(localStorage.getItem('toffee_token'));
  };

  const handleLogout = () => {
    localStorage.removeItem('toffee_token');
    localStorage.removeItem('toffee_user');
    queryClient.clear();
    setUser(null);
    setToken(null);
  };

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Workspace user={user} token={token} onLogout={handleLogout} />
    </QueryClientProvider>
  );
}

export default App;
