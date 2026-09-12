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
  LogIn,
  Check
} from 'lucide-react';

export default function LandingPage({ onOpenAuth, theme, toggleTheme }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "What is Workplace Hub?",
      a: "Workplace Hub is a personal project and freelance order management workspace built to help you track development builds, client deliverables, staging URLs, deadlines, and net take-home earnings in one clean dashboard."
    },
    {
      q: "Is my personal data protected?",
      a: "Yes. All client records, pricing, domains, and sprint notes are strictly protected behind authentication. Only you can access your dashboard once you sign in."
    },
    {
      q: "How does the automatic 80% net take-home calculation work?",
      a: "When you enter a project's gross amount, Workplace Hub automatically deducts 20% standard platform fees and records your exact 80% net earnings instantly in your monthly analytics."
    },
    {
      q: "How does ongoing project carry-over work across months?",
      a: "Any project marked In-Progress (WIP) or having an open issue remains highlighted in the current active month until delivered, ensuring no deadline is ever missed."
    }
  ];

  return (
    <div className="landing-wrapper">
      {/* Sticky Top Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-brand">
            <div className="landing-logo">
              <img src="/logo-black.png" alt="Logo" className="brand-logo-light" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              <img src="/logo-white.png" alt="Logo" className="brand-logo-dark" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            </div>
            <div>
              <span className="landing-brand-name">Workplace Hub</span>
              <span className="landing-brand-badge">Personal Workspace</span>
            </div>
          </div>

          <nav className="landing-nav-links">
            <a href="#features" className="landing-link">Features</a>
            <a href="#workflow" className="landing-link">Workflow</a>
            <a href="#capabilities" className="landing-link">Capabilities</a>
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
            <Sparkles size={13} />
            <span>Personal Project & Freelance Management Hub</span>
          </div>

          <h1 className="landing-hero-title">
            Manage Your Personal Projects & Orders with Total Clarity
          </h1>

          <p className="landing-hero-subtitle">
            A focused, high-density personal dashboard to track your development builds, client deliverables, staging URLs, deadlines, and take-home earnings in real-time.
          </p>

          <div className="landing-cta-group">
            <button className="landing-btn-hero primary" onClick={() => onOpenAuth('signin')}>
              <span>Open Personal Workspace</span>
              <ArrowRight size={16} />
            </button>
            <button className="landing-btn-hero secondary" onClick={() => onOpenAuth('signup')}>
              <span>Create Account</span>
            </button>
          </div>

          {/* Clean Neutral UI Mockup Preview */}
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
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Personal Workspace
              </div>
            </div>

            <div className="landing-preview-content">
              {/* Quick Metrics Bar */}
              <div className="preview-metrics-grid">
                <div className="preview-metric">
                  <span className="preview-metric-label">Total Projects</span>
                  <span className="preview-metric-value">150+</span>
                  <span className="preview-metric-sub">Personal Builds & Freelance</span>
                </div>
                <div className="preview-metric">
                  <span className="preview-metric-label">Marketplace Profiles</span>
                  <span className="preview-metric-value">11 Profiles</span>
                  <span className="preview-metric-sub">Fiverr, LeadsBridge, Direct</span>
                </div>
                <div className="preview-metric">
                  <span className="preview-metric-label">Net Take-Home (80%)</span>
                  <span className="preview-metric-value" style={{ color: '#10b981' }}>$30,800.00</span>
                  <span className="preview-metric-sub">20% fees auto-deducted</span>
                </div>
                <div className="preview-metric">
                  <span className="preview-metric-label">Staging Protocol</span>
                  <span className="preview-metric-value">Subdomain QA</span>
                  <span className="preview-metric-sub">Zero Downtime Deployment</span>
                </div>
              </div>

              {/* Sample Table Mock */}
              <div className="preview-table-container">
                <div className="preview-table-header">
                  <span>Assign Date</span>
                  <span>Client Username</span>
                  <span>Profile</span>
                  <span>Gross / Net</span>
                  <span>Status</span>
                  <span>Staging Subdomain</span>
                </div>
                <div className="preview-table-row">
                  <span className="mono-text">2026-05-30</span>
                  <span style={{ fontWeight: 600 }}>paulsneep</span>
                  <span style={{ color: 'var(--accents-5)' }}>Web_Spero_Fiverr</span>
                  <span className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>$300 / $240</span>
                  <span className="v-status-badge v-status-done">Done</span>
                  <span style={{ color: 'var(--accents-5)', fontSize: '0.74rem' }}>paulsneep.teamcodexora.com</span>
                </div>
                <div className="preview-table-row">
                  <span className="mono-text">2026-05-28</span>
                  <span style={{ fontWeight: 600 }}>jordimaasdam</span>
                  <span style={{ color: 'var(--accents-5)' }}>Miahs05_Fiverr</span>
                  <span className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>$390 / $312</span>
                  <span className="v-status-badge v-status-delivered">Delivered</span>
                  <span style={{ color: 'var(--accents-5)', fontSize: '0.74rem' }}>jordimaasdam.wpelemburg.com</span>
                </div>
                <div className="preview-table-row">
                  <span className="mono-text">2026-05-25</span>
                  <span style={{ fontWeight: 600 }}>kishanachang</span>
                  <span style={{ color: 'var(--accents-5)' }}>WPRiders</span>
                  <span className="mono-text" style={{ color: '#10b981', fontWeight: 600 }}>$200 / $160</span>
                  <span className="v-status-badge v-status-wip">In Progress</span>
                  <span style={{ color: 'var(--accents-5)', fontSize: '0.74rem' }}>kishanachang.wpendgame.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Features */}
      <section id="features" className="landing-section">
        <div className="landing-section-container">
          <div className="section-header">
            <span className="section-badge">Personal Workflow</span>
            <h2 className="section-title">Built for Managing Your Projects & Orders</h2>
            <p className="section-subtitle">
              Keep all your personal builds, client orders, staging domains, and income organized in one place.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon-box">
                <Briefcase size={20} />
              </div>
              <h3 className="service-title">Multi-Platform Tracking</h3>
              <p className="service-desc">
                Track client orders across all freelance marketplace profiles (Fiverr, LeadsBridge, Codesilly, Direct) in a single unified dashboard.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-box">
                <Server size={20} />
              </div>
              <h3 className="service-title">Staging & Live URLs</h3>
              <p className="service-desc">
                Attach dedicated staging subdomains, Google Docs brief sheets, and client live domain cutovers directly inside each project record.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-box">
                <BarChart3 size={20} />
              </div>
              <h3 className="service-title">Automated 80% Net Take-Home</h3>
              <p className="service-desc">
                Instant net income calculation factoring in 20% platform commissions. Know your exact take-home earnings for every order and month.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon-box">
                <FolderSync size={20} />
              </div>
              <h3 className="service-title">Smart Monthly Carry-Over</h3>
              <p className="service-desc">
                Active in-progress orders stay highlighted in the current active month until delivered, ensuring no client deliverable is overlooked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Personal Delivery Workflow */}
      <section id="workflow" className="landing-section alt-bg">
        <div className="landing-section-container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">Simple 4-Step Project Delivery Workflow</h2>
            <p className="section-subtitle">
              From order kickoff to final client delivery and earnings logging.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h4 className="step-title">Order Intake & Brief</h4>
              <p className="step-desc">
                Record client username, assign date, marketplace profile, gross budget, and brief specification document.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h4 className="step-title">Development & Staging QA</h4>
              <p className="step-desc">
                Set up your staging subdomain, develop the site or feature, and log daily sprint updates and revision notes.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h4 className="step-title">Client Review & Delivery</h4>
              <p className="step-desc">
                Deliver staging preview links, handle client feedback smoothly, and record your 5-star review rating.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <h4 className="step-title">Live Cutover & Net Profit</h4>
              <p className="step-desc">
                Point live domains, verify SSL, save cPanel backup links, and track your net earnings in MongoDB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" className="landing-section">
        <div className="landing-section-container">
          <div className="section-header">
            <span className="section-badge">Core Capabilities</span>
            <h2 className="section-title">Fast, Clean, and Built for Productivity</h2>
            <p className="section-subtitle">
              A high-density personal dashboard designed for developers who value speed and clarity.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <SlidersHorizontal size={18} />
              <div>
                <h4>High-Density Table View</h4>
                <p>Sticky header with smooth horizontal scrolling for viewing extensive project specifications.</p>
              </div>
            </div>

            <div className="feature-item">
              <Layers size={18} />
              <div>
                <h4>Drag & Drop Kanban</h4>
                <p>Visual pipeline across Assigned, In Progress, Issue, Delivered, and Done columns.</p>
              </div>
            </div>

            <div className="feature-item">
              <Calendar size={18} />
              <div>
                <h4>Auto-Synced Monthly Tabs</h4>
                <p>Assign dates automatically categorize each record into its correct calendar month.</p>
              </div>
            </div>

            <div className="feature-item">
              <Zap size={18} />
              <div>
                <h4>Instant Status Updates</h4>
                <p>Inline dropdowns with real-time saving spinners and immediate optimistic updates.</p>
              </div>
            </div>

            <div className="feature-item">
              <ShieldCheck size={18} />
              <div>
                <h4>MongoDB Cloud Sync</h4>
                <p>Your personal project data is safely stored in the cloud with instant persistence.</p>
              </div>
            </div>

            <div className="feature-item">
              <Code2 size={18} />
              <div>
                <h4>Secure Private Auth</h4>
                <p>Protected access with Google OAuth or Email/Password credentials.</p>
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

      {/* Bottom CTA Banner */}
      <section className="landing-cta-banner">
        <div className="landing-cta-box">
          <span className="section-badge">
            Personal Project Hub
          </span>
          <h2 className="landing-cta-title">
            Ready to Organize Your Personal Projects?
          </h2>
          <p className="landing-cta-desc">
            Sign in to access your personal dashboard, manage active deliverables, and monitor your monthly earnings.
          </p>
          <div className="landing-cta-group">
            <button className="landing-btn-hero primary" onClick={() => onOpenAuth('signin')}>
              <span>Sign In to Workspace</span>
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
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Workplace Hub • Personal Workspace</span>
          </div>

          <div className="landing-footer-links">
            <button type="button" onClick={() => onOpenAuth('signin')} className="footer-link-btn">Sign In</button>
            <button type="button" onClick={() => onOpenAuth('signup')} className="footer-link-btn">Sign Up</button>
            <a href="#features" className="footer-link-btn">Features</a>
            <a href="#workflow" className="footer-link-btn">Workflow</a>
            <a href="#capabilities" className="footer-link-btn">Capabilities</a>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--accents-5)' }}>
            © {new Date().getFullYear()} Workplace Hub. Built for Personal Project Management.
          </div>
        </div>
      </footer>
    </div>
  );
}
