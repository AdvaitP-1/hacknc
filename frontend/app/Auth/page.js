'use client'
import { SignIn, SignUp, ClerkLoaded } from '@clerk/nextjs';
import { useState } from 'react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleForm = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-center text-3xl font-bold mb-2">
          {isSignUp ? 'Join StudyShare' : 'Sign in to StudyShare'}
        </h1>
        <p className="text-center text-gray-500 mb-4">
          {isSignUp
            ? 'Create an account to get started'
            : 'Welcome back! Please sign in to continue'}
        </p>

        <div className="text-center mb-4">
          <button
            onClick={toggleForm}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        <ClerkLoaded>
          {isSignUp ? (
            <SignUp
              routing="hash"
              fallbackRedirectUrl='/Onboarding'
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-lg',
                  formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
                },
              }}
            />
          ) : (
            <SignIn
              routing="hash"
              fallbackRedirectUrl='/Onboarding'
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-lg',
                  formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
                },
              }}
            />
          )}
        </ClerkLoaded>
      </div>
    </div>
  );
}
