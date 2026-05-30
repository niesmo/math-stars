export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#f0f4ff] to-[#dbeafe]">
      {children}
    </div>
  )
}
