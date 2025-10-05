'use client';

import { OnboardingForm } from '@/features/auth/components/onboarding-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

const OnboardingPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useCurrentUser();

  // Check if user is already authenticated and redirect if so
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.appMetadata?.role === 'instructor') {
        router.push('/dashboard/instructor');
      } else {
        router.push('/dashboard/learner');
      }
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <OnboardingForm 
        onSuccess={(response) => {
          // After successful onboarding, redirect based on role
          if (response.role === 'instructor') {
            router.push('/dashboard/instructor');
          } else {
            router.push('/dashboard/learner');
          }
        }}
      />
    </div>
  );
};

export default OnboardingPage;