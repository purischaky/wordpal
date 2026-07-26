import Link from "next/link";
import { Brain, BarChart3, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="WordPal logo" className="w-8 h-8" />
          <span className="font-display text-xl font-bold" style={{ color: '#FE669A' }}>
            WordPal
          </span>
        </div>
        <Link
          href="/auth/signin"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <img src="/logo.png" alt="WordPal" className="w-24 h-24 mb-6" />
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4" style={{ color: '#FE669A' }}>
            WordPal
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Build English, Block by Block
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-wp-primary hover:bg-wp-primary-hover text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            ▶ Start Learning
          </Link>
        </div>

        {/* Demo Blocks */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          <div className="bg-block-subject text-white font-semibold px-5 py-3 rounded-lg shadow-[var(--shadow-block)] text-lg">
            The
          </div>
          <div className="bg-block-object text-white font-semibold px-5 py-3 rounded-lg shadow-[var(--shadow-block)] text-lg">
            cat
          </div>
          <div className="bg-block-verb text-white font-semibold px-5 py-3 rounded-lg shadow-[var(--shadow-block)] text-lg">
            sat
          </div>
          <div className="bg-block-modifier text-white font-semibold px-5 py-3 rounded-lg shadow-[var(--shadow-block)] text-lg">
            on
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Color-coded grammar blocks make learning intuitive
        </p>

        {/* Feature Highlights */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-surface-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-block-subject-light mb-4">
              <Brain className="w-7 h-7 text-block-subject" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">
              AI Feedback
            </h3>
            <p className="text-sm text-muted-foreground">
              Get instant, intelligent feedback on your sentence constructions
              powered by Amazon Bedrock.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-surface-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-block-object-light mb-4">
              <BarChart3 className="w-7 h-7 text-block-object" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">
              Progress Tracking
            </h3>
            <p className="text-sm text-muted-foreground">
              Track your learning journey with detailed progress across lessons
              and exercises.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-surface-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-block-modifier-light mb-4">
              <Trophy className="w-7 h-7 text-block-modifier" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">
              Gamification
            </h3>
            <p className="text-sm text-muted-foreground">
              Earn achievements, climb the leaderboard, and stay motivated
              through friendly competition.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        Built with ❤️ for the AWS Hackathon
      </footer>
    </div>
  );
}
