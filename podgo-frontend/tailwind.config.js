/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FFFFFF',
        'surface-container': '#E4EEFA',
        'surface-container-high': '#E4EEFA',
        'surface-container-highest': '#8ABBF8',
        'surface-container-low': '#FFFFFF',
        'surface-container-lowest': '#FFFFFF',
        'surface-bright': '#FFFFFF',
        'surface-dim': '#F0F2F5',
        
        primary: '#0866ff',
        'primary-container': '#4394F6',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#FFFFFF',
        
        secondary: '#4394F6',
        'secondary-container': '#8ABBF8',
        'on-secondary': '#FFFFFF',
        
        'on-surface': '#050505',
        'on-surface-variant': '#65676B',
        
        outline: '#E4EEFA',
        'outline-variant': '#E4EEFA',
        
        error: '#EF4444',
        'error-container': '#FEE2E2',
        
        // Keeping old ones temporarily so nothing crashes
        accent: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        success: {
          100: '#DCFCE7',
          500: '#22C55E',
        },
        warning: {
          100: '#FEF3C7',
          500: '#F59E0B',
        },
        danger: {
          100: '#FEE2E2',
          500: '#EF4444',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        // Legacy
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'headline-lg': ['30px', { lineHeight: '38px', fontWeight: '700' }],
        'headline-md': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'title-md': ['16px', { lineHeight: '22px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'label-sm': ['10px', { lineHeight: '12px', letterSpacing: '0.05em', fontWeight: '700' }],
        'price-display': ['22px', { lineHeight: '26px', fontWeight: '700' }],
      },
      spacing: {
        'space-xs': '4px',
        'space-sm': '8px',
        'space-md': '12px',
        'space-lg': '16px',
        'space-xl': '24px',
        'margin': '16px',
        'gutter': '16px',
      },
      borderRadius: {
        'card': '14px',
        'input': '10px',
        'modal': '16px',
      }
    },
  },
  plugins: [],
}

