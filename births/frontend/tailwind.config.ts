import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pregnancy App Tokens
        'brand-purple': '#6A0DAD',
        'app-surface': '#FFFFFF',
        'page-bg': '#F6F6F9',
        'primary-text': '#2B2B3A',
        'secondary-text': '#7A7A8C',
        'dark-card': '#3B4540',
        
        // Semantic operational colors from DESIGN.md (Kept for compatibility)
        'sovereign-navy': '#0C2340',
        'congo-azure': '#0077C8',
        'golden-yellow': '#FCD116',
        'republican-crimson': '#CE1126',
        'validation-jade': '#0E8A54',
        'canvas': '#F8FAFC',
        'ink': '#0F172A',
        'border-struct': '#CBD5E1',
        'surface-dark': '#06111E',

        // Material-style tokens
        primary: { DEFAULT: '#000d21', container: '#0c2340', 'on-container': '#778bad' },
        secondary: { DEFAULT: '#0061a5', container: '#57aafe', 'on-container': '#003d6b' },
        tertiary: { DEFAULT: '#715c00', container: '#cba700', 'on-container': '#4d3e00' },
        error: { DEFAULT: '#ba1a1a', container: '#ffdad6', 'on-container': '#93000a' },
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#cfdaf2',
          bright: '#f9f9ff',
          'container-low': '#f0f3ff',
          container: '#e7eeff',
          'container-high': '#dee8ff',
          'container-highest': '#d8e3fb',
        },
        'on-surface': { DEFAULT: '#111c2d', variant: '#44474d' },
        outline: { DEFAULT: '#74777e', variant: '#c4c6ce' },
      },
      fontFamily: {
        sans: ['Nunito', 'Poppins', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #FF8A8A, #F96C7A)',
        'gradient-pink-red': 'linear-gradient(to bottom right, #FF7A8A, #F0506E)',
        'gradient-teal': 'linear-gradient(to bottom right, #4FD1C5, #2AA9B8)',
        'gradient-orange': 'linear-gradient(to bottom right, #FFB84D, #FF9224)',
        'gradient-blue': 'linear-gradient(to bottom right, #5AA9FF, #3B7DFF)',
        'gradient-purple': 'linear-gradient(to bottom right, #9B7BFF, #6C4BE0)',
        'gradient-crimson': 'linear-gradient(to bottom right, #E04B6A, #B8324F)',
        'gradient-plum': 'linear-gradient(to bottom right, #8E44AD, #5B2A86)',
      },
      fontSize: {
        'display-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['30px', { lineHeight: '38px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['28px', { lineHeight: '36px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg-mobile': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['17px', { lineHeight: '26px', fontWeight: '500' }],
        'body-md': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', letterSpacing: '0.01em', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.04em', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['10px', { lineHeight: '14px', letterSpacing: '0.06em', fontWeight: '700' }],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',  
        md: '0.375rem',
        lg: '0.5rem',        
        xl: '0.75rem',
        '2xl': '16px', // Tiles
        '3xl': '20px', // Cards
        full: '9999px', // Pills
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        'gutter': '1.25rem',
        'gutter-mobile': '0.75rem',
        'margin': '2rem',
        'margin-mobile': '1rem',
        'xs': '0.25rem',
        'sm-space': '0.5rem',
        'md-space': '1rem',
        'lg-space': '1.5rem',
        'xl-space': '2.5rem',
      },
      minHeight: {
        'touch': '52px',   // Min touch target
        'btn': '56px',     // Primary action buttons
        'dock': '76px',    // Bottom nav dock
        'topbar': '64px',  // Top bar
      },
      maxWidth: {
        'desktop': '1440px',
        'mobile-app': '420px',
      },
    },
  },
  plugins: [],
}

export default config
