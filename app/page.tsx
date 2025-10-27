export default function HomePage() {
  return (
    <main className="min-h-screen">
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
          <div className="flex gap-4 justify-center">
            <a
              href="/books"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Browse Books
            </a>
            <a
              href="/vendor"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Vendor Portal
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
