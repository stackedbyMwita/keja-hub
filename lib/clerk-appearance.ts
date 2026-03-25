// lib/clerk-appearance.ts
export function getClerkAppearance(theme: string | undefined) {
  const isDark = theme === 'dark'

  return {
    variables: {
      // maps to your --background / --card
      colorBackground: isDark ? 'hsl(0 0% 9%)' : 'hsl(0 0% 98.8%)',
      colorInputBackground: isDark ? 'hsl(0 0% 14%)' : 'hsl(0 0% 96.5%)',
      colorInputText: isDark ? 'hsl(214 32% 91%)' : 'hsl(0 0% 9%)',
      colorText: isDark ? 'hsl(214 32% 91%)' : 'hsl(0 0% 9%)',
      colorTextSecondary: isDark ? 'hsl(0 0% 63.5%)' : 'hsl(0 0% 32%)',
      // maps to your --primary (green)
      colorPrimary: isDark ? 'hsl(142 69% 58%)' : 'hsl(151 67% 67%)',
      colorDanger: isDark ? 'hsl(7 60% 21%)' : 'hsl(10 82% 43.5%)',
      borderRadius: '0.5rem',           // matches your --radius
      fontFamily: 'Outfit, sans-serif', // matches your --font-sans
    },
    elements: {
      // card container
      card: {
        backgroundColor: isDark ? 'hsl(0 0% 9%)' : 'hsl(0 0% 98.8%)',
        border: `1px solid ${isDark ? 'hsl(0 0% 16%)' : 'hsl(0 0% 87.5%)'}`,
        boxShadow: 'none',
      },
      // primary button — your green primary
      formButtonPrimary: {
        backgroundColor: isDark ? 'hsl(155 100% 19%)' : 'hsl(151 67% 67%)',
        color: isDark ? 'hsl(153 19% 89%)' : 'hsl(153 13% 13.5%)',
      },
      // social buttons (Google etc.)
      socialButtonsBlockButton: {
        backgroundColor: isDark ? 'hsl(0 0% 14%)' : 'hsl(0 0% 99.2%)',
        border: `1px solid ${isDark ? 'hsl(0 0% 16%)' : 'hsl(0 0% 87.5%)'}`,
        color: isDark ? 'hsl(214 32% 91%)' : 'hsl(0 0% 9%)',
      },
      // inputs
      formFieldInput: {
        backgroundColor: isDark ? 'hsl(0 0% 14%)' : 'hsl(0 0% 96.5%)',
        border: `1px solid ${isDark ? 'hsl(0 0% 16%)' : 'hsl(0 0% 87.5%)'}`,
        color: isDark ? 'hsl(214 32% 91%)' : 'hsl(0 0% 9%)',
      },
      formFieldLabel: {
        color: isDark ? 'hsl(0 0% 63.5%)' : 'hsl(0 0% 32%)',
      },
      // footer links
      footerActionLink: {
        color: isDark ? 'hsl(142 69% 58%)' : 'hsl(151 67% 67%)',
      },
      headerTitle: {
        color: isDark ? 'hsl(214 32% 91%)' : 'hsl(0 0% 9%)',
        fontFamily: 'Outfit, sans-serif',
      },
      headerSubtitle: {
        color: isDark ? 'hsl(0 0% 63.5%)' : 'hsl(0 0% 32%)',
      },
      dividerLine: {
        backgroundColor: isDark ? 'hsl(0 0% 16%)' : 'hsl(0 0% 87.5%)',
      },
      dividerText: {
        color: isDark ? 'hsl(0 0% 63.5%)' : 'hsl(0 0% 32%)',
      },
    },
  }
}