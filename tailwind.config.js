/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066cc',
          focus: '#0071e3',
          'on-dark': '#2997ff',
        },
        ink: {
          DEFAULT: '#1d1d1f',
          'muted-80': '#333333',
          'muted-48': '#7a7a7a',
        },
        body: {
          DEFAULT: '#1d1d1f',
          'on-dark': '#ffffff',
          muted: '#cccccc',
        },
        canvas: {
          DEFAULT: '#ffffff',
          parchment: '#f5f5f7',
        },
        surface: {
          pearl: '#fafafc',
          'tile-1': '#272729',
          'tile-2': '#2a2a2c',
          'tile-3': '#252527',
          black: '#000000',
          chip: '#d2d2d7',
        },
        divider: {
          soft: '#f0f0f0',
        },
        hairline: '#e0e0e0',
        on: {
          primary: '#ffffff',
          dark: '#ffffff',
        },
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '17px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        section: '80px',
      },
      borderRadius: {
        xs: '5px',
        sm: '8px',
        md: '11px',
        lg: '18px',
        pill: '9999px',
      },
      fontFamily: {
        display: [
          'SF Pro Display',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        text: [
          'SF Pro Text',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      fontSize: {
        'hero-display': ['56px', { lineHeight: '1.07', letterSpacing: '-0.28px', fontWeight: '600' }],
        'display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '0', fontWeight: '600' }],
        'display-md': ['34px', { lineHeight: '1.47', letterSpacing: '-0.374px', fontWeight: '600' }],
        tagline: ['21px', { lineHeight: '1.19', letterSpacing: '0.231px', fontWeight: '600' }],
        'body-strong': ['17px', { lineHeight: '1.24', letterSpacing: '-0.374px', fontWeight: '600' }],
        body: ['17px', { lineHeight: '1.47', letterSpacing: '-0.374px', fontWeight: '400' }],
        caption: ['14px', { lineHeight: '1.43', letterSpacing: '-0.224px', fontWeight: '400' }],
        'caption-strong': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px', fontWeight: '600' }],
        'button-large': ['18px', { lineHeight: '1', letterSpacing: '0', fontWeight: '300' }],
        'button-utility': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px', fontWeight: '400' }],
        'fine-print': ['12px', { lineHeight: '1', letterSpacing: '-0.12px', fontWeight: '400' }],
        'nav-link': ['12px', { lineHeight: '1', letterSpacing: '-0.12px', fontWeight: '400' }],
      },
      maxWidth: {
        content: '1440px',
        'content-narrow': '980px',
      },
      boxShadow: {
        product: '3px 5px 30px 0 rgba(0, 0, 0, 0.22)',
      },
    },
  },
  plugins: [],
};
