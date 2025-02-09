import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#1E2203]">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>
        <SignIn
          path="/sign-in"
          routing="path"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#9ebf3f] hover:bg-[#8ba835] text-white',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton:
                'border-2 border-gray-200 hover:border-[#9ebf3f]',
              formFieldInput:
                'border-2 focus:border-[#9ebf3f] focus:ring-[#9ebf3f] w-full',
              card: 'w-full shadow-none',
              formFieldLabel: 'text-base',
              formFieldLabelRow: 'mb-2',
              identityPreviewText: 'text-base',
              formButtonReset: 'text-base',
              footerActionLink: 'text-[#9ebf3f] hover:text-[#8ba835]',
            },
          }}
        />
      </div>
    </div>
  );
}
