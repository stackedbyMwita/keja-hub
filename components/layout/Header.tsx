// components/layout/header.tsx
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';

export function Header() {
  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      <Show when="signed-out">
        <SignInButton forceRedirectUrl="/sign-in" />
        <SignUpButton forceRedirectUrl="/sign-up">
          <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              userButtonPopoverFooter: 'hidden',
              userProfileFooter: 'hidden',        // hides footer inside manage account modal
              badge: 'hidden',
            },
          }}
        />
      </Show>
    </header>
  );
}