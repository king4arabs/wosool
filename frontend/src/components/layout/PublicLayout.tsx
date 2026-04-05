import { Header } from "./Header"
import { Footer } from "./Footer"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="main-content" className="flex-1 pt-16" role="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
