import { useState } from 'react';
import { Sparkles, Brain, Bell, CheckCircle2, ListTodo, ArrowRight, Moon, Sun, Zap, Shield } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useTheme } from '@/hooks/useTheme';

interface LandingPageProps {
  onLogin: (email: string, password: string) => boolean;
  onGuestLogin: () => void;
}

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Assistant', desc: 'Create tasks and reminders using natural language. Just tell it what you need.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Never miss a deadline with intelligent date and time parsing from your words.' },
  { icon: CheckCircle2, title: 'Task Management', desc: 'Organize tasks by category, priority, and status. Complete, pending, or urgent.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your tasks are stored safely and persist across sessions, even after refresh.' },
];

const STEPS = [
  { icon: Zap, title: 'Quick Add', desc: 'Add tasks instantly or let AI parse your natural language' },
  { icon: ListTodo, title: 'Organize', desc: 'Filter by category, priority, and completion status' },
  { icon: Sparkles, title: 'AI Assist', desc: 'Ask AI to create, filter, or generate checklists for you' },
];

export function LandingPage({ onLogin, onGuestLogin }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-100 dark:bg-primary-900/20 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-accent-100 dark:bg-accent-900/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-emerald-100 dark:bg-emerald-900/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
            <ListTodo className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">SmartRemind<span className="text-primary-500"> AI</span></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={() => openAuth('login')}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuth('register')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm font-medium shadow-lg shadow-primary-500/20 hover:shadow-xl hover:scale-105 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">Powered by AI Natural Language Processing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6 animate-slide-up">
          Welcome to <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">SmartRemind AI</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          The smartest way to manage your tasks and reminders. Just tell the AI what you need in plain English — it handles the rest.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => openAuth('register')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white text-base font-semibold shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:scale-105 transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => openAuth('login')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-base font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Sign In
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 animate-fade-in" style={{ animationDelay: '300ms' }}>
          No credit card required — continue as guest in one click
        </p>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Everything you need to stay organized</h2>
          <p className="text-slate-500 dark:text-slate-400">Powerful features designed to make task management effortless</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">How it works</h2>
          <p className="text-slate-500 dark:text-slate-400">Three simple steps to a more organized life</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 mb-4">
                  <Icon className="w-7 h-7 text-primary-500" />
                </div>
                <div className="absolute top-0 -left-4 text-6xl font-bold text-slate-100 dark:text-slate-800 -z-0 select-none">
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 relative z-10">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 relative z-10">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-primary-600 via-primary-600 to-accent-600 p-10 sm:p-14 text-center shadow-2xl shadow-primary-500/20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to get organized?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Join SmartRemind AI and let your AI assistant handle the planning while you focus on what matters.
          </p>
          <button
            onClick={() => openAuth('register')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-600 text-base font-bold shadow-xl hover:scale-105 transition-transform"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
              <ListTodo className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">SmartRemind AI</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Built with React, Tailwind CSS, and AI-powered natural language processing.</p>
        </div>
      </footer>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={onLogin}
        onGuestLogin={onGuestLogin}
      />
    </div>
  );
}
