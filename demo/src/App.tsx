import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/de';

import Datetime, { DateTimeProps, DatetimeHandle } from 'replace-datetime';
import 'replace-datetime/css/react-datetime.css';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtDisplay = (v: moment.Moment | string | undefined): string => {
  if (!v) return '—';
  if (moment.isMoment(v)) return v.format('LLLL');
  return String(v);
};

// ─── reusable demo card ──────────────────────────────────────────────────────

interface CardProps {
  id: string;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
  output?: React.ReactNode;
}

function Card({ id, title, description, badge, children, output }: CardProps) {
  return (
    <section className="card" id={id} aria-labelledby={`${id}-title`}>
      <div className="card-header">
        <div className="card-title-row">
          <h2 id={`${id}-title`}>{title}</h2>
          {badge && <span className="badge">{badge}</span>}
        </div>
        <p className="card-desc">{description}</p>
      </div>
      <div className="card-body">
        <div className="picker-wrapper">{children}</div>
        {output !== undefined && (
          <div className="output-box" aria-live="polite">
            <span className="output-label">Selected value</span>
            <span className="output-value">{output}</span>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── code snippet ────────────────────────────────────────────────────────────

function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="code-snippet">
      <pre><code>{code}</code></pre>
      <button className="copy-btn" onClick={copy} aria-label="Copy code">
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

type Theme = 'dark' | 'light';

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  // Demo 1 — basic controlled date picker
  const [basicDate, setBasicDate] = useState<moment.Moment | string | undefined>();

  // Demo 2 — time only
  const [timeValue, setTimeValue] = useState<moment.Moment | string | undefined>();

  // Demo 3 — date + time with seconds
  const [datetimeValue, setDatetimeValue] = useState<moment.Moment | string | undefined>();

  // Demo 4 — inline (static) calendar
  const [inlineDate, setInlineDate] = useState<moment.Moment | string | undefined>();

  // Demo 5 — no past dates
  const [futureDate, setFutureDate] = useState<moment.Moment | string | undefined>();

  // Demo 6 — locale switcher
  const [locale, setLocale] = useState<string>('en');
  const [localizedDate, setLocalizedDate] = useState<moment.Moment | string | undefined>();

  // Demo 7 — custom renderDay (highlight weekends)
  const [weekendDate, setWeekendDate] = useState<moment.Moment | string | undefined>();

  // Demo 8 — imperative ref
  const dtRef = useRef<DatetimeHandle>(null);
  const [refDate, setRefDate] = useState<moment.Moment | string | undefined>();
  const jumpToToday = () => dtRef.current?.setViewDate(moment());
  const jumpToNextYear = () => dtRef.current?.setViewDate(moment().add(1, 'year'));

  const isNotPast: DateTimeProps['isValidDate'] = (d) =>
    d.isSameOrAfter(moment().startOf('day'));

  const renderWeekendDay: DateTimeProps['renderDay'] = (props, date, selected) => {
    const isWeekend = date.day() === 0 || date.day() === 6;
    return (
      <td
        {...props}
        className={`${props.className ?? ''}${isWeekend ? ' weekend-day' : ''}`}
      >
        {date.date()}
      </td>
    );
  };

  return (
    <div className="app">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-badge">⚡ React 18 &amp; 19 Ready</div>
          <h1>replace-datetime</h1>
          <p className="hero-sub">
            A lightweight, fully-featured datetime picker — drop-in replacement for{' '}
            <code>react-datetime</code>.
            <br />Zero legacy dependencies · TypeScript native · Moment.js powered.
          </p>
          <div className="hero-links">
            <a
              className="btn btn-primary"
              href="https://github.com/felipecarrillo100/replace-datetime"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-github-link"
            >
              GitHub
            </a>
            <a
              className="btn btn-secondary"
              href="https://www.npmjs.com/package/replace-datetime"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-npm-link"
            >
              npm
            </a>
            <a
              className="btn btn-secondary"
              href="../"
              id="hero-docs-link"
            >
              API Docs
            </a>
          </div>
          <CodeSnippet code="npm install replace-datetime moment" />
        </div>
      </header>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="demo-nav" aria-label="Demo sections">
        <a href="#demo-basic">Basic</a>
        <a href="#demo-time">Time Only</a>
        <a href="#demo-datetime">Date + Time</a>
        <a href="#demo-inline">Inline</a>
        <a href="#demo-future">Valid Dates</a>
        <a href="#demo-locale">Locale</a>
        <a href="#demo-weekend">Custom Render</a>
        <a href="#demo-ref">Imperative Ref</a>
        <button
          id="theme-toggle"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>

      {/* ── Demo grid ────────────────────────────────────────────────────── */}
      <main className="demo-grid">

        {/* 1 · Basic date picker */}
        <Card
          id="demo-basic"
          title="Basic Date Picker"
          description="Default configuration — date with locale format, time omitted."
          badge="Most common"
          output={fmtDisplay(basicDate)}
        >
          <Datetime
            timeFormat={false}
            closeOnSelect
            onChange={setBasicDate}
            inputProps={{ id: 'input-basic', placeholder: 'Pick a date…' }}
          />
          <CodeSnippet code={`<Datetime
  timeFormat={false}
  closeOnSelect
  onChange={(v) => setValue(v)}
/>`} />
        </Card>

        {/* 2 · Time only */}
        <Card
          id="demo-time"
          title="Time Only Picker"
          description="Set dateFormat={false} to show only the time spinner."
          output={fmtDisplay(timeValue)}
        >
          <Datetime
            dateFormat={false}
            timeFormat="HH:mm:ss"
            onChange={setTimeValue}
            inputProps={{ id: 'input-time', placeholder: 'Pick a time…' }}
          />
          <CodeSnippet code={`<Datetime
  dateFormat={false}
  timeFormat="HH:mm:ss"
  onChange={(v) => setValue(v)}
/>`} />
        </Card>

        {/* 3 · Date + time */}
        <Card
          id="demo-datetime"
          title="Date + Time"
          description="Show both the calendar and the time spinner together."
          output={fmtDisplay(datetimeValue)}
        >
          <Datetime
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            onChange={setDatetimeValue}
            inputProps={{ id: 'input-datetime', placeholder: 'Pick date & time…' }}
          />
          <CodeSnippet code={`<Datetime
  dateFormat="YYYY-MM-DD"
  timeFormat="HH:mm"
  onChange={(v) => setValue(v)}
/>`} />
        </Card>

        {/* 4 · Inline */}
        <Card
          id="demo-inline"
          title="Inline / Static Calendar"
          description="Pass input={false} to embed the calendar directly — no input field."
          output={fmtDisplay(inlineDate)}
        >
          <Datetime
            input={false}
            timeFormat={false}
            onChange={setInlineDate}
          />
          <CodeSnippet code={`<Datetime
  input={false}
  timeFormat={false}
  onChange={(v) => setValue(v)}
/>`} />
        </Card>

        {/* 5 · isValidDate — no past */}
        <Card
          id="demo-future"
          title="Restrict Valid Dates"
          description="Use isValidDate to disable past dates — only today and future are selectable."
          output={fmtDisplay(futureDate)}
        >
          <Datetime
            timeFormat={false}
            closeOnSelect
            isValidDate={isNotPast}
            onChange={setFutureDate}
            inputProps={{ id: 'input-future', placeholder: 'Future dates only…' }}
          />
          <CodeSnippet code={`<Datetime
  timeFormat={false}
  isValidDate={(d) => d.isSameOrAfter(moment(), 'day')}
  onChange={(v) => setValue(v)}
/>`} />
        </Card>

        {/* 6 · Locale */}
        <Card
          id="demo-locale"
          title="Locale Support"
          description="Switch locale dynamically — month/day names, first day of week, and format update immediately."
          output={fmtDisplay(localizedDate)}
        >
          <div className="locale-switcher" role="group" aria-label="Select locale">
            {['en', 'es', 'fr', 'de'].map((l) => (
              <button
                key={l}
                id={`locale-btn-${l}`}
                className={`locale-btn${locale === l ? ' active' : ''}`}
                onClick={() => setLocale(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Datetime
            key={locale}
            locale={locale}
            input={false}
            timeFormat={false}
            onChange={setLocalizedDate}
          />
          <CodeSnippet code={`<Datetime
  locale="es"
  timeFormat={false}
  onChange={(v) => setValue(v)}
/>`} />
        </Card>

        {/* 7 · Custom renderDay */}
        <Card
          id="demo-weekend"
          title="Custom Day Render"
          description="Use renderDay to add custom styling — here weekends are highlighted in coral."
          output={fmtDisplay(weekendDate)}
        >
          <Datetime
            timeFormat={false}
            closeOnSelect
            renderDay={renderWeekendDay}
            onChange={setWeekendDate}
            inputProps={{ id: 'input-weekend', placeholder: 'Pick a date…' }}
          />
          <CodeSnippet code={`<Datetime
  renderDay={(props, date) => (
    <td {...props} className={
      \`\${props.className} \${date.day() === 0 || date.day() === 6 ? 'weekend' : ''}\`
    }>
      {date.date()}
    </td>
  )}
/>`} />
        </Card>

        {/* 8 · Imperative ref */}
        <Card
          id="demo-ref"
          title="Imperative Ref"
          description="Attach a ref to programmatically navigate the calendar — click the buttons to see it jump."
          output={fmtDisplay(refDate)}
        >
          <Datetime
            ref={dtRef}
            input={false}
            timeFormat={false}
            onChange={setRefDate}
          />
          <div className="ref-buttons">
            <button id="btn-jump-today" className="btn btn-sm" onClick={jumpToToday}>
              Jump to Today
            </button>
            <button id="btn-jump-nextyear" className="btn btn-sm" onClick={jumpToNextYear}>
              Jump to Next Year
            </button>
          </div>
          <CodeSnippet code={`const ref = useRef<DatetimeHandle>(null);
<Datetime ref={ref} input={false} ... />
// later:
ref.current?.setViewDate(moment());
ref.current?.navigate('months');`} />
        </Card>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="footer">
        <p>
          <strong>replace-datetime</strong> — MIT License ·{' '}
          <a href="https://github.com/felipecarrillo100/replace-datetime" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{' '}
          ·{' '}
          <a href="https://www.npmjs.com/package/replace-datetime" target="_blank" rel="noopener noreferrer">
            npm
          </a>
        </p>
      </footer>
    </div>
  );
}
