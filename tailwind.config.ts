import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/assets/bg-tile.jpg')",
        'sub-pattern':  "url('/assets/sub-pattern.png')",
        'sub-gradient-radial': ' radial-gradient(circle closest-corner at 50%, white, rgba(0.5, 0.5, 0.5, 0) 75%)',
        'gradient-radial': 'radial-gradient(circle farthest-side at 50% 50%, white, rgba(0.5, 0.5, 0.5, 0) 750%)',
        'gradient-radial-footer': 'radial-gradient(circle farthest-side at 0% 0%, #0A4E69, rgba(0.5, 0.5, 0.5, 0) 750%)'
      },
      fontSize:{
        'size-xxl': '3rem', // 48px
        'size-xl': '2.5rem', // 40px
        'size-lg': '2rem', // 32px
        'size-md': '1.5rem', // 24px
        'size-sm': '1.2rem', // ~19px
        'size-base': '1rem', // 16px
        'size-xs': '0.8rem', // 13px
        'size-xxs': '0.6rem', // 10px

        'h-1': '2rem',
        'h-2': '1.5rem',
        'h-3': '1.2rem',
        'h-4': '1rem',
        'p-reg': '1rem',
        'p-sm': '0.8rem',
        'p-xs': '0.6rem',
        'p-xxs': '0.4rem',
      },
      fontWeight:{
        'weight-h': '600',
        'weight-p-2': '500',
        'weight-p': '400'
      },
      fontFamily:{
        fraunces: ['var(--font-fraunces)', 'serif'],
        hanken: ['Hanken Grotesk', 'sans-serif']
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config