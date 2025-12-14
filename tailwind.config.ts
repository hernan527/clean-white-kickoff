import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'Roboto',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'sans-serif'
  			],
  			serif: [
  				'Libre Caslon Text',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'Roboto Mono',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				light: 'hsl(var(--primary-light))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  				light: 'hsl(var(--secondary-light))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			'cta-highlight': {
  				DEFAULT: 'hsl(var(--cta-highlight))',
  				foreground: 'hsl(var(--cta-highlight-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			footer: {
  				DEFAULT: 'hsl(var(--footer-bg))',
  				foreground: 'hsl(var(--footer-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		backgroundImage: {
  			'gradient-primary': 'var(--gradient-primary)',
  			'gradient-hero': 'var(--gradient-hero)',
  			'gradient-header': 'var(--gradient-header)',
  			'gradient-accent': 'var(--gradient-accent)',
  			'gradient-cta': 'var(--gradient-cta)',
  			'gradient-success': 'var(--gradient-success)',
  			'gradient-bg': 'var(--gradient-bg)'
  		},
  		boxShadow: {
  			colorful: 'var(--shadow-colorful)',
  			card: 'var(--shadow-card)',
  			'card-hover': 'var(--shadow-hover)',
  			success: 'var(--shadow-success)',
  			accent: 'var(--shadow-accent)',
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		keyframes: {
			'accordion-down': {
				from: {
					height: '0'
				},
				to: {
					height: 'var(--radix-accordion-content-height)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)'
				},
				to: {
					height: '0'
				}
			},
			'fade-in': {
				'0%': {
					opacity: '0',
					transform: 'translateY(10px)'
				},
				'100%': {
					opacity: '1',
					transform: 'translateY(0)'
				}
			},
			'fly-to-cart': {
				'0%': {
					transform: 'scale(1) translate(0, 0) rotate(0deg)',
					opacity: '1'
				},
				'20%': {
					transform: 'scale(0.8) translate(calc(var(--fly-x, 200px) * 0.1), calc(var(--fly-y, -200px) * 0.05 - 30px)) rotate(-5deg)',
					opacity: '0.9'
				},
				'50%': {
					transform: 'scale(0.5) translate(calc(var(--fly-x, 200px) * 0.4), calc(var(--fly-y, -200px) * 0.3 - 50px)) rotate(-10deg)',
					opacity: '0.7'
				},
				'80%': {
					transform: 'scale(0.25) translate(calc(var(--fly-x, 200px) * 0.8), calc(var(--fly-y, -200px) * 0.7)) rotate(-15deg)',
					opacity: '0.4'
				},
				'100%': {
					transform: 'scale(0.1) translate(var(--fly-x, 200px), var(--fly-y, -200px)) rotate(-20deg)',
					opacity: '0'
				}
			},
			'pop-in': {
				'0%': {
					transform: 'scale(0.8)',
					opacity: '0'
				},
				'50%': {
					transform: 'scale(1.1)'
				},
				'100%': {
					transform: 'scale(1)',
					opacity: '1'
				}
			},
			blob: {
				'0%': {
					transform: 'translate(0px, 0px) scale(1)'
				},
				'33%': {
					transform: 'translate(30px, -50px) scale(1.1)'
				},
				'66%': {
					transform: 'translate(-20px, 20px) scale(0.9)'
				},
				'100%': {
					transform: 'translate(0px, 0px) scale(1)'
				}
			},
			float: {
				'0%, 100%': {
					transform: 'translateY(0px)'
				},
				'50%': {
					transform: 'translateY(-20px)'
				}
			},
			glow: {
				from: {
					boxShadow: '0 0 20px hsl(270 91% 65% / 0.3)'
				},
				to: {
					boxShadow: '0 0 40px hsl(270 91% 65% / 0.6)'
				}
			},
			shimmer: {
				'0%': {
					backgroundPosition: '-200% 0'
				},
				'100%': {
					backgroundPosition: '200% 0'
				}
			}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'fade-in': 'fade-in 0.4s ease-out',
			'fly-to-cart': 'fly-to-cart 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
			'pop-in': 'pop-in 0.3s ease-out',
			blob: 'blob 7s infinite',
			float: 'float 6s ease-in-out infinite',
			glow: 'glow 2s ease-in-out infinite alternate',
			shimmer: 'shimmer 2s linear infinite'
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
