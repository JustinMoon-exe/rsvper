import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'page-bg': 'var(--color-page-bg)',
        'text-main': 'var(--color-text-main)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-accent': 'var(--color-text-accent)',
        
        // Button Colors (Decline = Prominent, Accept = Subtle)
        'button-bg': 'var(--color-button-bg)',         // Prominent BG (e.g., for Decline)
        'button-text': 'var(--color-button-text)',       // Text for Prominent BG
        'button-hover-bg': 'var(--color-button-hover-bg)', // Hover for Prominent

        'button-secondary-bg': 'var(--color-button-secondary-bg)',  // Subtle BG (e.g., for Accept)
        'button-secondary-text': 'var(--color-button-secondary-text)',// Text for Subtle
        'button-secondary-hover-bg': 'var(--color-button-secondary-hover-bg)',// Hover for Subtle
        
        'form-bg': 'var(--color-form-bg)',             // Background of the RSVP glass form box
        'card-bg': 'var(--color-card-bg)',             // Background for the image "frame"
        'text-on-glass': 'var(--color-text-on-glass)', // Text color on the glass form
      },
      fontFamily: {
        'gayathri': ['var(--font-gayathri)', 'sans-serif'], // Ensures Tailwind can use 'font-gayathri'
      },
      boxShadow: {
        'invite-image-frame': '0 6px 20px -3px rgba(50, 50, 80, 0.2), 0 4px 10px -4px rgba(50, 50, 80, 0.16)',
        // 'form-section': '0 8px 25px rgba(var(--color-text-main), 0.06)', // Not used if glass-form-box handles it
      },
      transitionProperty: {
        'filter': 'filter', 
      },
      // For custom animations if needed beyond Framer Motion
      keyframes: {
        softPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
      animation: {
        softPulse: 'softPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;