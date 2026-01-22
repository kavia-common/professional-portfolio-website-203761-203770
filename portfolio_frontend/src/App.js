import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/**
 * Centralized portfolio content.
 * In a real portfolio you’d likely load this from a CMS or JSON file, but keeping it
 * inline keeps the template lightweight and easy to modify.
 */
const PORTFOLIO = {
  name: "Your Name",
  role: "Software Engineer",
  location: "City, Country",
  tagline:
    "I build clean, accessible web experiences and reliable backend services.",
  about: [
    "I’m a software engineer focused on building thoughtful products with great UX and strong engineering foundations.",
    "I enjoy React, Node.js, APIs, performance tuning, and turning ambiguous requirements into shipped features.",
  ],
  highlights: [
    { label: "Years Experience", value: "5+" },
    { label: "Projects Shipped", value: "20+" },
    { label: "Focus", value: "Web + APIs" },
  ],
  projects: [
    {
      title: "Project One",
      description:
        "A production-grade web app with authentication, dashboards, and analytics.",
      tags: ["React", "Node.js", "REST"],
      links: [
        { label: "Live", href: "https://example.com" },
        { label: "Code", href: "https://github.com" },
      ],
    },
    {
      title: "Project Two",
      description:
        "A fast landing page + blog with strong SEO, performance, and accessibility.",
      tags: ["Frontend", "Performance", "A11y"],
      links: [{ label: "Case Study", href: "https://example.com" }],
    },
    {
      title: "Project Three",
      description:
        "An internal tool that reduced operational time via automation and workflows.",
      tags: ["Automation", "APIs", "DX"],
      links: [{ label: "Write-up", href: "https://example.com" }],
    },
  ],
  skills: {
    "Frontend": ["React", "Accessibility", "CSS", "Performance"],
    "Backend": ["Node.js", "Express", "REST", "Validation"],
    "Tooling": ["Git", "Testing", "CI/CD", "Observability"],
  },
  resume: {
    summary:
      "Download my resume or browse a quick overview of experience and education.",
    downloadHref: "#", // Replace with /assets/resume.pdf if you add one.
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Company Name",
        timeframe: "2022 — Present",
        bullets: [
          "Led delivery of key product initiatives with cross-functional teams.",
          "Improved performance and reliability of core user flows.",
          "Built reusable UI patterns and service contracts.",
        ],
      },
      {
        title: "Software Engineer",
        company: "Company Name",
        timeframe: "2019 — 2022",
        bullets: [
          "Shipped features across frontend and backend.",
          "Implemented APIs, background tasks, and test coverage improvements.",
        ],
      },
    ],
    education: [
      {
        school: "University",
        degree: "B.S. Computer Science",
        timeframe: "2015 — 2019",
      },
    ],
  },
};

function useApiBase() {
  // Prefer REACT_APP_API_BASE, fall back to REACT_APP_BACKEND_URL, else same-origin.
  const apiBase =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";
  return apiBase.replace(/\/+$/, "");
}

// PUBLIC_INTERFACE
function App() {
  const apiBase = useApiBase();

  const [activeSection, setActiveSection] = useState("about");

  const [contact, setContact] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [contactStatus, setContactStatus] = useState({
    state: "idle", // idle | loading | success | error
    message: "",
  });

  const sectionIds = useMemo(
    () => ["about", "projects", "skills", "resume", "contact"],
    []
  );

  // Keep active section updated while scrolling.
  useEffect(() => {
    const observers = [];
    const opts = { root: null, rootMargin: "-20% 0px -70% 0px", threshold: 0.01 };

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const ob = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(id);
        });
      }, opts);
      ob.observe(el);
      observers.push(ob);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  // PUBLIC_INTERFACE
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateContactForm(values) {
    const errors = {};
    if (!values.name.trim()) errors.name = "Please enter your name.";
    if (!values.email.trim()) errors.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      errors.email = "Please enter a valid email.";
    if (!values.subject.trim()) errors.subject = "Please enter a subject.";
    if (!values.message.trim()) errors.message = "Please enter a message.";
    else if (values.message.trim().length < 10)
      errors.message = "Message should be at least 10 characters.";
    return errors;
  }

  // PUBLIC_INTERFACE
  async function submitContact(e) {
    e.preventDefault();
    setContactStatus({ state: "idle", message: "" });

    const errors = validateContactForm(contact);
    const firstError = Object.values(errors)[0];
    if (firstError) {
      setContactStatus({ state: "error", message: firstError });
      return;
    }

    try {
      setContactStatus({ state: "loading", message: "Sending…" });

      const res = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.message ||
          "Could not send your message. Please try again later.";
        throw new Error(msg);
      }

      setContact({ name: "", email: "", subject: "", message: "" });
      setContactStatus({
        state: "success",
        message: data?.message || "Message sent successfully.",
      });
    } catch (err) {
      setContactStatus({
        state: "error",
        message: err?.message || "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className="App">
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand" role="banner">
            <div className="brand-mark" aria-hidden="true">
              {/* Minimal mark (no external assets) */}
              <span className="brand-dot" />
            </div>
            <div className="brand-text">
              <div className="brand-name">{PORTFOLIO.name}</div>
              <div className="brand-role">{PORTFOLIO.role}</div>
            </div>
          </div>

          <nav className="nav" aria-label="Primary">
            {sectionIds.map((id) => (
              <button
                key={id}
                type="button"
                className={`nav-link ${activeSection === id ? "active" : ""}`}
                onClick={() => scrollToSection(id)}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </nav>

          <div className="topbar-cta">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => scrollToSection("contact")}
            >
              Contact
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="pill">{PORTFOLIO.location}</p>
              <h1 id="hero-title" className="hero-title">
                {PORTFOLIO.tagline}
              </h1>
              <p className="hero-subtitle">
                I’m <strong>{PORTFOLIO.name}</strong>, a {PORTFOLIO.role}. I
                specialize in modern web applications and API-driven systems.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-large"
                  onClick={() => scrollToSection("projects")}
                >
                  View Projects
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-large"
                  onClick={() => scrollToSection("resume")}
                >
                  Resume
                </button>
              </div>
            </div>

            <div className="hero-card" aria-label="Highlights">
              <div className="card">
                <h2 className="card-title">Highlights</h2>
                <div className="stats">
                  {PORTFOLIO.highlights.map((h) => (
                    <div className="stat" key={h.label}>
                      <div className="stat-value">{h.value}</div>
                      <div className="stat-label">{h.label}</div>
                    </div>
                  ))}
                </div>
                <div className="card-footnote">
                  Built with a lightweight React template and a clean, modern
                  style system.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section" aria-labelledby="about-title">
          <div className="container">
            <div className="section-head">
              <h2 id="about-title" className="section-title">
                About Me
              </h2>
              <p className="section-subtitle">
                A quick introduction and what I like to work on.
              </p>
            </div>

            <div className="grid two">
              <div className="card">
                <h3 className="card-title">Who I am</h3>
                <div className="prose">
                  {PORTFOLIO.about.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">What I’m looking for</h3>
                <div className="prose">
                  <p>
                    Roles where I can ship meaningful features, collaborate
                    closely, and keep raising quality bars across UI, APIs, and
                    reliability.
                  </p>
                  <p>
                    If you’re hiring, the quickest path is sending a note with
                    the role, timeline, and what you’re building.
                  </p>
                </div>

                <div className="inline-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => scrollToSection("contact")}
                  >
                    Send a message
                  </button>
                  <a className="btn btn-ghost" href="#projects">
                    Browse projects
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="projects"
          className="section section-alt"
          aria-labelledby="projects-title"
        >
          <div className="container">
            <div className="section-head">
              <h2 id="projects-title" className="section-title">
                Projects
              </h2>
              <p className="section-subtitle">
                Selected work showcasing product thinking and execution.
              </p>
            </div>

            <div className="grid three">
              {PORTFOLIO.projects.map((p) => (
                <article className="card project" key={p.title}>
                  <h3 className="card-title">{p.title}</h3>
                  <p className="muted">{p.description}</p>
                  <div className="tags" aria-label="Project tags">
                    {p.tags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="project-links" aria-label="Project links">
                    {p.links.map((l) => (
                      <a
                        key={l.label}
                        className="link"
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="section" aria-labelledby="skills-title">
          <div className="container">
            <div className="section-head">
              <h2 id="skills-title" className="section-title">
                Skills
              </h2>
              <p className="section-subtitle">
                A practical toolkit across frontend, backend, and delivery.
              </p>
            </div>

            <div className="grid three">
              {Object.entries(PORTFOLIO.skills).map(([group, list]) => (
                <div className="card" key={group}>
                  <h3 className="card-title">{group}</h3>
                  <ul className="list">
                    {list.map((s) => (
                      <li key={s} className="list-item">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="resume"
          className="section section-alt"
          aria-labelledby="resume-title"
        >
          <div className="container">
            <div className="section-head">
              <h2 id="resume-title" className="section-title">
                Resume
              </h2>
              <p className="section-subtitle">{PORTFOLIO.resume.summary}</p>
            </div>

            <div className="grid two">
              <div className="card">
                <h3 className="card-title">Experience</h3>
                <div className="timeline">
                  {PORTFOLIO.resume.experience.map((e) => (
                    <div className="timeline-item" key={`${e.title}-${e.company}`}>
                      <div className="timeline-head">
                        <div className="timeline-title">{e.title}</div>
                        <div className="timeline-meta">
                          {e.company} • {e.timeframe}
                        </div>
                      </div>
                      <ul className="bullets">
                        {e.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="inline-actions">
                  <a className="btn btn-primary" href={PORTFOLIO.resume.downloadHref}>
                    Download Resume
                  </a>
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Education</h3>
                <div className="timeline">
                  {PORTFOLIO.resume.education.map((e) => (
                    <div className="timeline-item" key={e.school}>
                      <div className="timeline-head">
                        <div className="timeline-title">{e.degree}</div>
                        <div className="timeline-meta">
                          {e.school} • {e.timeframe}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="card-title" style={{ marginTop: 18 }}>
                  Quick Links
                </h3>
                <ul className="list">
                  <li className="list-item">
                    <a className="link" href="#projects">
                      Projects
                    </a>
                  </li>
                  <li className="list-item">
                    <a className="link" href="#contact">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="section"
          aria-labelledby="contact-title"
        >
          <div className="container">
            <div className="section-head">
              <h2 id="contact-title" className="section-title">
                Contact
              </h2>
              <p className="section-subtitle">
                Send a message—this form posts to the Express backend.
              </p>
            </div>

            <div className="grid two">
              <div className="card">
                <h3 className="card-title">Message me</h3>

                <form className="form" onSubmit={submitContact}>
                  <div className="form-row">
                    <label className="label" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      className="input"
                      value={contact.name}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, name: e.target.value }))
                      }
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label className="label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="input"
                      value={contact.email}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, email: e.target.value }))
                      }
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label className="label" htmlFor="subject">
                      Subject
                    </label>
                    <input
                      id="subject"
                      className="input"
                      value={contact.subject}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, subject: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label className="label" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      className="textarea"
                      value={contact.message}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, message: e.target.value }))
                      }
                      rows={5}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={contactStatus.state === "loading"}
                    >
                      {contactStatus.state === "loading" ? "Sending…" : "Send"}
                    </button>

                    <div
                      className={`form-status ${
                        contactStatus.state === "success"
                          ? "success"
                          : contactStatus.state === "error"
                          ? "error"
                          : ""
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      {contactStatus.message}
                    </div>
                  </div>
                </form>
              </div>

              <div className="card">
                <h3 className="card-title">Details</h3>
                <div className="prose">
                  <p>
                    Prefer email? Use the form and I’ll respond as soon as
                    possible.
                  </p>
                  <p className="muted">
                    API Base: <code>{apiBase || "(same-origin)"}</code>
                  </p>
                  <p className="muted">
                    Tip: Configure <code>REACT_APP_API_BASE</code> to point to
                    the backend (e.g. <code>http://localhost:3001</code>).
                  </p>
                </div>

                <div className="divider" />

                <div className="prose">
                  <p>
                    You can also link your socials here (GitHub, LinkedIn,
                    Twitter, etc.).
                  </p>
                </div>

                <div className="socials">
                  <a className="btn btn-ghost" href="https://github.com" target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a className="btn btn-ghost" href="https://linkedin.com" target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer" role="contentinfo">
          <div className="container footer-inner">
            <div className="muted">
              © {new Date().getFullYear()} {PORTFOLIO.name}. All rights reserved.
            </div>
            <div className="footer-links">
              <button className="link-button" onClick={() => scrollToSection("about")}>
                Back to top
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
