'use client';

import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  LayoutDashboard,
  Calendar,
  Briefcase,
  CheckCircle2,
  BarChart3,
  Globe,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ArrowRight,
  Lock,
  ChevronRight,
  ExternalLink,
  Sun,
  Moon,
  Clock,
  Star,
  Users,
  Code2,
  Terminal,
  Server,
  FolderSync,
  HelpCircle,
  LogIn
} from 'lucide-react';

export default function LandingPage({ onOpenAuth, theme, toggleTheme }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "What is Workplace Hub?",
      a: "Workplace Hub is an agency management platform built for WordPress & web development agencies (such as EleSquad) to track client orders, staging subdomains, DNS cutovers, sprint notes, and 80% net earnings in real-time."
    },
    {
      q: "How does the automatic net profit calculation work?",
      a: "Whenever an order's gross amount is entered, Workplace Hub automatically deducts 20% standard platform fees and logs the exact 80% take-home profit instantly across all monthly financial analytics."
    },
    {
      q: "How does ongoing order carry-over work across months?",
      a: "Any order that is still In-Progress (WIP) or has active issues is automatically prioritized in the current active month until it is marked as Delivered or Done, ensuring no client deliverable is ever forgotten."
    },
    {
      q: "How do I sign in or create an account?",
      a: "You can sign in with your Google account in one click, or use your registered agency email and password."
    }
  ];

  return (
    <div className="landing-wrapper">
      {/* Sticky Top Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <div className="landing-logo">
              <img src="/logo-black.png" alt="Logo" className="brand-logo-light" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              <img src="/logo-white.png" alt="Logo" className="brand-logo-dark" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            </div>
            <div>
              <span className="landing-brand-name">Workplace Hub</span>
              <span className="landing-brand-badge">Agency OS</span>
            </div>
          </div>

          <nav className="landing-nav-links">
            <a href="#services" className="landing-link">Services</a>
            <a href="#features" className="landing-link">Key Features</a>
            <a href="#workflow" className="landing-link">How It Works</a>
            <a href="#faq" className="landing-link">FAQ</a>
          </nav>

          <div className="landing-nav-actions">
            <button className="btn-v-icon" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="btn-v btn-v-secondary" onClick={() => onOpenAuth('signin')}>
              <LogIn size={13} /> Sign In
            </button>
            <button className="btn-v btn-v-primary" onClick={() => onOpenAuth('signup')}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-container">
          <div className="landing-pill">
            <Sparkles size={12} color="#38bdf8" />
            <span>EleSquad Agency Operating System • 2026 Edition</span>
          </div>

          <h1 className="landing-hero-title">
            Run Your Web Development Agency with <span className="gradient-text">Flawless Precision</span>
          </h1>

          <p className="landing-hero-subtitle">
            Centralize client briefs, staging subdomains, multi-profile earnings, and delivery sprints into one high-density, real-time operating workspace.
          </p>

          <div className="landing-cta-group">
            <button className="landing-btn-hero primary" onClick={() => onOpenAuth('signin')}>
              <span>Sign In to Your Workspace</span>
              <ArrowRight size={16} />
            </button>
            <button className="landing-btn-hero secondary" onClick={() => onOpenAuth('signup')}>
              <span>Create Account</span>
            </button>
          </div>

          {/* Interactive UI Mockup Preview */}
          <div className="landing-preview-card">
            <div className="landing-preview-bar">
              <div className="landing-preview-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="landing-preview-url">
                <Lock size={10} /> https://my-work-place.vercel.app/workspace
              </div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                ● Database Connected
              </div>
            </div>

            <div className="landing-preview-content">
              {/* Quick Metrics Bar */}
              <div className="preview-metrics-grid">
                <div className="preview-metric">
                  <span className="preview-metric-label">Gross Revenue</span>
                  <span className="preview-metric-value">$38,500.00</span>
                  <span className="preview-metric-sub">Across 150+ Projects</span>
                </div>
                <div className="preview-metric">
                  <span className="preview-metric-label">Net Take-Home (80%)</span>
                  <span className="preview-metric-value" style={{ color: '#10b981' }}>$30,800.00</span>
                  <span className="preview-metric-sub">Platform fees auto-deducted</span>
                </div>
                <div className="preview-metric">
                  <span className="preview-metric-label">Active Sprints</span>
                  <span className="preview-metric-value" style={{ color: '#38bdf8' }}>8 Running</span>
                  <span className="preview-metric-sub">On QA Staging Subdomains</span>
                </div>
                <div className="preview-metric">
                  <span className="preview-metric-label">Delivery Rate</span>
                  <span className="preview-metric-value">99.4%</span>
                  <span className="preview-metric-sub">5-Star Client Rating</span>
                </div>
              </div>

              {/* Sample Table Mock */}
              <div className="preview-table-container">
                <div className="preview-table-header">
                  <span>Assign Date</span>
                  <span>Client Username</span>
                  <span>Profile</span>
                  <span>Gross / Net</span>
                  <span>Order Status</span>
                  <span>Staging Subdomain</span>
                </div>
                <div className="preview-table-row">
                  <span className="mono-text">2026-05-28</span>
                  <span style={{ fontWeight: 600 }}>jordimaasdam</span>
                  <span style={{ color: 'var(--accents-5)' }}>Miahs05_Fiverr</span>
                  <span className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>$390 / $312</span>
                  <span className="v-status-badge v-status-delivered">Delivered</span>
                  <span style={{ color: '#38bdf8', fontSize: '0.74rem' }}>jordimaasdam.wpelemburg.com</span>
                </div>
                <div className="preview-table-row">
                  <span className="mono-text">2026-05-29</span>
                  <span style={{ fontWeight: 600 }}>paulsneep</span>
                  <span style={{ color: 'var(--accents-5)' }}>Web_Spero_Fiverr</span>
                  <span className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>$300 / $240</span>
                  <span className="v-status-badge v-status-done">Done</span>
                  <span style={{ color: '#38bdf8', fontSize: '0.74rem' }}>paulsneep.teamcodexora.com</span>
                </div>
                <div className="preview-table-row">
                  <span className="mono-text">2026-05-30</span>
                  <span style={{ fontWeight: 600 }}>kishanachang</span>
                  <span style={{ color: 'var(--accents-5)' }}>WPRiders</span>
                  <span className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>$200 / $160</span>
                  <span className="v-status-badge v-status-wip">In Progress</span>
                  <span style={{ color: '#38bdf8', fontSize: '0.74rem' }}>kishanachang.wpendgame.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Use Cases Section */}
      <section id="services" className="landing-section">
        <div className="landing-section-container">
          <div className="section-header">
            <span className="section-badge">Agency Infrastructure</span>
            <h2 className="section-title">Engineered Specifically for High-Growth Web Agencies</h2>
            <p className="section-subtitle">
              Eliminate spreadsheet chaos and disorganized client links with an automated operational pipeline.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon-box" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                <Briefcase size={22} />
              </div>
              <h3 className="service-title">Multi-Marketplace Routing</h3>
              <p className="service-desc">
                Organize incoming orders across 11+ profiles (Fiverr, Upwork, LeadsBridge, Direct Contracts) under one unified dashboard without tab switching.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-box" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                <Server size={22} />
              </div>
              <h3 className="service-title">Staging & DNS Lifecycle</h3>
              <p className="service-desc">
                Link dedicated QA staging subdomains, Google Docs brief sheets, and client live domain cutovers directly inside every client record.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-box" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                <BarChart3 size={22} />
              </div>
              <h3 className="service-title">Automated 80% Net Take-Home</h3>
              <p className="service-desc">
                Instant net revenue calculation factoring in 20% platform commissions. Know your exact take-home profit for every day, month, and sprint.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-box" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                <FolderSync size={22} />
              </div>
              <h3 className="service-title">Intelligent Month Carry-Over</h3>
              <p className="service-desc">
                Active orders stay pinned in the current month until delivered. When marked complete, they archive neatly into their assigned historical record.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guideline / How It Works */}
      <section id="workflow" className="landing-section alt-bg">
        <div className="landing-section-container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">4-Step Agile Delivery Workflow</h2>
            <p className="section-subtitle">
              From client brief to live domain deployment — standardizing every sprint for maximum speed and quality.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h4 className="step-title">Intake & Brief Mapping</h4>
              <p className="step-desc">
                Log the client username, assign date, marketplace profile, gross budget, and brief specification document.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h4 className="step-title">Staging QA & Sprint Dev</h4>
              <p className="step-desc">
                Assign team developers, spin up isolated staging subdomains, and log daily blocker and revision updates.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h4 className="step-title">Delivery & Client Review</h4>
              <p className="step-desc">
                Submit delivery assets, handle client feedback loops with zero confusion, and record 5-star review ratings.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <h4 className="step-title">Live Cutover & Profit Log</h4>
              <p className="step-desc">
                Point live domains, verify SSL cutovers, record cPanel backup links, and capture exact net profit in MongoDB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="landing-section">
        <div className="landing-section-container">
          <div className="section-header">
            <span className="section-badge">Core Capabilities</span>
            <h2 className="section-title">Built for Speed, Reliability, and Density</h2>
            <p className="section-subtitle">
              Every detail optimized with minimal latency, sticky navigation, and high-contrast dark/light themes.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <SlidersHorizontal size={18} color="#38bdf8" />
              <div>
                <h4>High-Density Table View</h4>
                <p>Sticky pinned header with subtle horizontal scroll controls for viewing extensive client records.</p>
              </div>
            </div>

            <div className="feature-item">
              <Layers size={18} color="#10b981" />
              <div>
                <h4>Drag & Drop Kanban</h4>
                <p>Visual pipeline across Assigned, In Progress, Issue, Delivered, and Done columns.</p>
              </div>
            </div>

            <div className="feature-item">
              <Calendar size={18} color="#6366f1" />
              <div>
                <h4>Auto-Synced Monthly Tabs</h4>
                <p>Never manually configure month tags — assign dates automatically sync to the correct calendar month.</p>
              </div>
            </div>

            <div className="feature-item">
              <Zap size={18} color="#f59e0b" />
              <div>
                <h4>Instant Status Updates</h4>
                <p>Inline dropdowns with real-time saving spinners and optimistic UI feedback.</p>
              </div>
            </div>

            <div className="feature-item">
              <ShieldCheck size={18} color="#10b981" />
              <div>
                <h4>Enterprise MongoDB Atlas</h4>
                <p>Persistent cloud database with Mongoose schemas and automated multi-layer caching.</p>
              </div>
            </div>

            <div className="feature-item">
              <Code2 size={18} color="#38bdf8" />
              <div>
                <h4>NextAuth Multi-Provider</h4>
                <p>Google OAuth and hashed Email/Password credentials security with role-based access.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="landing-section alt-bg">
        <div className="landing-section-container" style={{ maxWidth: 780 }}>
          <div className="section-header">
            <span className="section-badge">Frequently Asked Questions</span>
            <h2 className="section-title">Got Questions? We Have Answers.</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item ${activeFaq === idx ? 'open' : ''}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <ChevronRight size={16} className="faq-arrow" />
                </div>
                {activeFaq === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Converting Bottom CTA Banner */}
      <section className="landing-cta-banner">
        <div className="landing-cta-box">
          <span className="section-badge" style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8' }}>
            Elevate Your Agency Today
          </span>
          <h2 className="landing-cta-title">
            Ready to Take Full Control of Your Agency Orders?
          </h2>
          <p className="landing-cta-desc">
            Access your live database, track active sprints, and organize client deliverables in seconds.
          </p>
          <div className="landing-cta-group">
            <button className="landing-btn-hero primary" onClick={() => onOpenAuth('signin')}>
              <span>Sign In with Account</span>
              <ArrowRight size={16} />
            </button>
            <button className="landing-btn-hero secondary" onClick={() => onOpenAuth('signup')}>
              <span>Create Free Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-brand">
            <div className="landing-logo">
              <img src="/logo-black.png" alt="Logo" className="brand-logo-light" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              <img src="/logo-white.png" alt="Logo" className="brand-logo-dark" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Workplace Hub • EleSquad</span>
          </div>

          <div className="landing-footer-links">
            <button type="button" onClick={() => onOpenAuth('signin')} className="footer-link-btn">Sign In</button>
            <button type="button" onClick={() => onOpenAuth('signup')} className="footer-link-btn">Sign Up</button>
            <a href="#services" className="footer-link-btn">Services</a>
            <a href="#features" className="footer-link-btn">Features</a>
            <a href="#workflow" className="footer-link-btn">Guideline</a>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--accents-5)' }}>
            © {new Date().getFullYear()} Workplace Hub by Alireja Khan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
