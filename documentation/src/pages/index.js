import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import './home.css';

const signalCards = [
  {
    index: '01',
    title: 'Rules before prompts',
    text: 'Governor limits, security, and architecture become part of the reasoning loop.',
  },
  {
    index: '02',
    title: 'Agents with a job',
    text: 'Specialists handle Apex, LWC, SOQL, testing, deployment, and the edge cases between them.',
  },
  {
    index: '03',
    title: 'A memory that sticks',
    text: 'Persistent project context keeps every run closer to the codebase you actually own.',
  },
];

export default function Home() {
  return (
    <Layout
      title="Salesforce development, with guardrails"
      description="Apex AI Brain is a multi-agent Salesforce development system with architecture, security, and governor-limit guardrails."
    >
      <main className="arcade-home">
        <section className="arcade-hero">
          <div className="arcade-grid" aria-hidden="true" />
          <div className="arcade-hero__glow arcade-hero__glow--left" aria-hidden="true" />
          <div className="arcade-hero__glow arcade-hero__glow--right" aria-hidden="true" />

          <div className="arcade-shell arcade-hero__content">
            <p className="eyebrow"><span className="eyebrow__dot" /> Salesforce AI / online</p>
            <h1>Build Salesforce systems that <span>play by the rules.</span></h1>
            <p className="hero-copy">
              Apex AI Brain is the command center for production-minded Salesforce development:
              specialized agents, architectural memory, and guardrails that keep generated code shipshape.
            </p>
            <div className="hero-actions">
              <Link className="arcade-button arcade-button--primary" to="/docs/getting-started/installation">
                Enter the playbook <span aria-hidden="true">↗</span>
              </Link>
              <a className="arcade-button arcade-button--quiet" href="https://github.com/Yashraghuvans/Apex-ai-brain">
                View source <span aria-hidden="true">⌘</span>
              </a>
            </div>
            <div className="hero-status" aria-label="Project status">
              <span>16 specialist agents</span>
              <span>50+ enforced rules</span>
              <span>Claude + Gemini</span>
            </div>
          </div>

          <div className="arcade-shell hero-console" aria-label="Apex AI Brain console preview">
            <div className="hero-console__topline"><span>APEX_AI_BRAIN // CORE</span><span>SYS 01</span></div>
            <div className="hero-console__screen">
              <div className="console-line console-line--muted">&gt; scanning Salesforce project...</div>
              <div className="console-line">&gt; context loaded <strong>42 files</strong></div>
              <div className="console-line">&gt; rules armed <strong>50+ checks</strong></div>
              <div className="console-line console-line--accent">&gt; ready for your next move<span className="console-caret" /></div>
            </div>
            <div className="hero-console__controls"><span className="control-light" /><span className="control-light control-light--hot" /><span className="control-label">PRESS START</span></div>
          </div>
        </section>

        <section className="arcade-section arcade-section--signals">
          <div className="arcade-shell">
            <div className="section-heading">
              <p className="eyebrow">The loadout</p>
              <h2>Less guessing.<br /><span>More shipping.</span></h2>
            </div>
            <div className="signal-grid">
              {signalCards.map((card) => (
                <article className="signal-card" key={card.index}>
                  <span className="signal-card__index">{card.index}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="arcade-section arcade-section--cta">
          <div className="arcade-shell cta-panel">
            <div>
              <p className="eyebrow">Your next level starts here</p>
              <h2>Read the docs.<br /><span>Run the command.</span></h2>
            </div>
            <Link className="arcade-button arcade-button--primary" to="/docs">
              Open documentation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}