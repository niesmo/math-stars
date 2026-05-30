'use client'

interface WelcomeBannerProps {
  displayName: string
  totalStars: number
  todayStars?: number
  className?: string
  teacherName?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function WelcomeBanner({ displayName, totalStars, todayStars = 0, className, teacherName }: WelcomeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] rounded-3xl p-6 text-white">
      <p className="text-blue-200 text-sm font-medium">{getGreeting()},</p>
      <h1 className="text-3xl font-black mt-1">{displayName}! 👋</h1>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true">⭐</span>
          <span className="font-bold">{totalStars} total stars</span>
        </div>
        {todayStars > 0 && (
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm">
            <span aria-hidden="true">🌟</span>
            <span>+{todayStars} today</span>
          </div>
        )}
      </div>
      {(className || teacherName) && (
        <p className="text-blue-100 text-sm mt-2">
          {className ? `Class: ${className}` : ''}{className && teacherName ? ' • ' : ''}{teacherName ? `Teacher: ${teacherName}` : ''}
        </p>
      )}
    </div>
  )
}
