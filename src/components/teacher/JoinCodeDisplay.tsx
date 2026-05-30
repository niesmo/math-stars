'use client'

import { useState } from 'react'

interface JoinCodeDisplayProps {
  code: string
  className?: string
}

export function JoinCodeDisplay({ code, className = '' }: JoinCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="text-sm font-medium text-gray-500">Class Join Code</div>
      <div
        className="text-5xl font-black tracking-[0.3em] text-[#1e3a5f] bg-blue-50 px-8 py-4 rounded-2xl border-2 border-blue-200 font-mono"
        aria-label={`Class join code: ${code.split('').join(' ')}`}
      >
        {code}
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl font-semibold text-sm
          hover:bg-[#1a3254] transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
        aria-label={copied ? 'Code copied!' : 'Copy join code'}
      >
        {copied ? '✓ Copied!' : '📋 Copy Code'}
      </button>
    </div>
  )
}
