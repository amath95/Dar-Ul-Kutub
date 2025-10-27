import { auth } from '@/lib/auth'
import { UserNav } from '@/components/auth/user-nav'

export default async function HomePage() {
  const session = await auth()

  return (
    <main className="min-h-screen">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">Dar-Ul-Kutub</div>
          <UserNav />
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Dar-Ul-Kutub
          </h1>
          <p className="text-xl text-muted-foreground font-amiri">
            دار الكتب
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your trusted Islamic book marketplace. Find authentic books from verified vendors
            across the United States.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/books"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Browse Books
            </a>

            {session?.user.role === 'ADMIN' && (
              <a
                href="/admin"
                className="inline-flex items-center justify-center rounded-md bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground shadow hover:bg-secondary/90"
              >
                Admin Dashboard
              </a>
            )}

            {session?.user.role === 'VENDOR' && (
              <a
                href="/vendor"
                className="inline-flex items-center justify-center rounded-md bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground shadow hover:bg-secondary/90"
              >
                Vendor Dashboard
              </a>
            )}

            {!session && (
              <>
                <a
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Admin/Vendor Login
                </a>
                <a
                  href="/vendor/signup"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Become a Vendor
                </a>
              </>
            )}
          </div>

          {session && (
            <div className="mt-8 p-4 bg-muted rounded-lg max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">
                Logged in as <span className="font-medium text-foreground">{session.user.email}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Role: {session.user.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
