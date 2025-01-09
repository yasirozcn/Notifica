import { useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import AppContent from './AppContent';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

export default function RootLayout() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
    >
      <AppContent />
    </ClerkProvider>
  );
}
