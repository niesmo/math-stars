import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const VARIANT_STYLES = {
  primary:
    'bg-[#1e3a5f] text-white hover:bg-[#1a3254] active:bg-[#16294a] focus-visible:ring-[#1e3a5f]',
  secondary:
    'bg-white text-[#1e3a5f] border-2 border-[#1e3a5f] hover:bg-[#eff6ff] focus-visible:ring-[#1e3a5f]',
  ghost:
    'text-[#1e3a5f] hover:bg-[#eff6ff] focus-visible:ring-[#1e3a5f]',
  danger:
    'bg-[#dc2626] text-white hover:bg-[#b91c1c] focus-visible:ring-[#dc2626]',
}

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]',
  xl: 'px-8 py-4 text-xl min-h-[60px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 rounded-xl font-semibold
          transition-all duration-150 cursor-pointer select-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}
        `}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
