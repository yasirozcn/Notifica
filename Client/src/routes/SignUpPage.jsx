import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center mt-[-30px] px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#1E2203]">Sign Up</h2>
          <p className="mt-2 text-sm text-gray-600">
            You can sign up for free now!
          </p>
        </div>
        <div className="px-4 rounded-lg sm:px-10">
          <SignUp
            path="/sign-up"
            routing="path"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-[#9ebf3f] hover:bg-[#8ba835] text-white',
                card: 'border-0 shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'border-2 border-gray-200 hover:border-[#9ebf3f]',
                formFieldInput:
                  'border-2 focus:border-[#9ebf3f] focus:ring-[#9ebf3f]',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
