import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { GoalProvider, useGoal } from './context/GoalContext.js';
import { LandingPage } from './components/LandingPage.js';
import { DashboardView } from './components/DashboardView.js';
import { OnboardingModal } from './components/OnboardingModal.js';
import { AuthModal } from './components/AuthModal.js';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { activeGoal, loading: goalLoading, refreshAllGoalData } = useGoal();

  const { selectActiveGoal } = useGoal();
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pendingAction, setPendingAction] = useState<'app' | 'onboarding' | null>(null);

  // Auto-switch to landing if user logs out
  React.useEffect(() => {
    if (!user && currentView === 'app') {
      setCurrentView('landing');
    }
  }, [user, currentView]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
          <span className="font-mono">Initializing Northstar Operating System...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'landing' || !user ? (
        <LandingPage
          user={user}
          onStartOnboarding={() => {
            if (user) {
              setIsOnboardingOpen(true);
            } else {
              setAuthMode('register');
              setPendingAction('onboarding');
              setIsAuthOpen(true);
            }
          }}
          onEnterApp={() => {
            if (user) {
              setCurrentView('app');
            } else {
              setAuthMode('login');
              setPendingAction('app');
              setIsAuthOpen(true);
            }
          }}
          onOpenLogin={() => {
            setAuthMode('login');
            setPendingAction('app');
            setIsAuthOpen(true);
          }}
        />
      ) : (
        <DashboardView />
      )}

      {/* Global Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanGenerated={async (savedGoal) => {
          setIsOnboardingOpen(false);
          await refreshAllGoalData();
          if (savedGoal?.id) {
            await selectActiveGoal(savedGoal.id);
          }
          setCurrentView('app');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        defaultMode={authMode}
        onClose={() => {
          setIsAuthOpen(false);
          if (user) {
            if (pendingAction === 'onboarding') {
              setIsOnboardingOpen(true);
            } else if (pendingAction === 'app') {
              setCurrentView('app');
            }
          }
          setPendingAction(null);
        }}
      />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GoalProvider>
          <AppContent />
        </GoalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
