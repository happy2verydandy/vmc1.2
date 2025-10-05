import { redirect } from 'next/navigation';
import { loadCurrentUser } from '@/features/auth/server/load-current-user';
import OnboardingPage from './onboarding-client';

// Server component to check auth on initial load
const OnboardingPageWrapper = async ({ 
  searchParams 
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // Check if user is already authenticated server-side
  const userSnapshot = await loadCurrentUser();
  
  // If user is already authenticated, redirect to appropriate dashboard
  if (userSnapshot.status === 'authenticated') {
    if (userSnapshot.user?.appMetadata?.role === 'instructor') {
      redirect('/dashboard/instructor');
    } else {
      redirect('/dashboard/learner');
    }
  }

  return <OnboardingPage />;
};

export default OnboardingPageWrapper;