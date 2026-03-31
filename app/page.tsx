"use client";

import { useState, useMemo } from "react";

/* ─── Helpers ─── */

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}
function fmtCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

/* ─── Main Component ─── */

export default function ProjectionModel() {
  const [seoInvestment, setSeoInvestment] = useState(0);
  const [customerLTV, setCustomerLTV] = useState(0);
  const [keyEventCVR, setKeyEventCVR] = useState(0.5);
  const [sessionCVR, setSessionCVR] = useState(0.05);

  const calculated = useMemo(() => {
    if (!seoInvestment || !customerLTV || !keyEventCVR || !sessionCVR) {
      return null;
    }
    const customersNeeded = Math.ceil(seoInvestment / customerLTV);
    const keyEventsNeeded = Math.ceil(customersNeeded / keyEventCVR);
    const sessionsNeeded = Math.ceil(keyEventsNeeded / sessionCVR);
    return { customersNeeded, keyEventsNeeded, sessionsNeeded };
  }, [seoInvestment, customerLTV, keyEventCVR, sessionCVR]);

  return (
    <div className="flex flex-col flex-1">
      {/* Brand stripe */}
      <div
        className="h-[3px]"
        style={{ background: "var(--gradient-brand)" }}
      />

      {/* Header */}
      <header className="border-b bg-white" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto max-w-4xl px-6 py-6 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/daydream-logo.svg"
            alt="daydream"
            className="h-10 w-auto"
          />
          <div className="h-8 w-px bg-[var(--color-border)]" />
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-near-black)]">
              Projection Model
            </h1>
            <p className="text-sm text-[var(--color-subtle-gray)]">
              SEO traffic projection tool
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-6 space-y-8 fade-in">
          {/* Inputs */}
          <section
            className="rounded-xl p-6 shadow-sm"
            style={{ background: "var(--color-warm-cream)", border: "1px solid var(--color-border)" }}
          >
            <h2 className="text-lg font-semibold text-[var(--color-near-black)]">Inputs</h2>
            <p className="mt-1 text-sm text-[var(--color-subtle-gray)]">
              Enter your investment details and conversion rates.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <CurrencyInput
                label="Monthly SEO Investment"
                value={seoInvestment}
                onChange={setSeoInvestment}
                placeholder="e.g., 10,000"
              />
              <CurrencyInput
                label="Average Customer Lifetime Value"
                value={customerLTV}
                onChange={setCustomerLTV}
                placeholder="e.g., 5,000"
              />
              <PercentInput
                label="Key Event → Customer CVR"
                hint="default 50%"
                value={keyEventCVR}
                onChange={setKeyEventCVR}
                step={1}
                min={1}
                max={100}
              />
              <PercentInput
                label="Session → Key Event CVR"
                hint="default 5%"
                value={sessionCVR}
                onChange={setSessionCVR}
                step={0.1}
                min={0.1}
                max={100}
              />
            </div>

            {/* Industry Benchmarks */}
            <Benchmarks
              onApplyKeyEvent={(v) => setKeyEventCVR(v)}
              onApplySession={(v) => setSessionCVR(v)}
            />
          </section>

          {/* Results */}
          {calculated && (
            <section
              className="rounded-xl p-6 shadow-sm"
              style={{ background: "white", border: "1px solid var(--color-border)" }}
            >
              <h2 className="text-lg font-semibold text-[var(--color-near-black)]">
                Traffic Projection
              </h2>
              <p className="mt-1 text-sm text-[var(--color-subtle-gray)]">
                The organic traffic needed to generate a return on your SEO investment.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard
                  value={fmtCurrency(seoInvestment)}
                  label="Monthly Investment"
                  formula="Your stated budget"
                  color="var(--color-mint)"
                />
                <ResultCard
                  value={fmt(calculated.customersNeeded)}
                  label="Customers Needed"
                  formula={`${fmtCurrency(seoInvestment)} / ${fmtCurrency(customerLTV)} LTV`}
                  color="var(--color-blue-ice)"
                />
                <ResultCard
                  value={fmt(calculated.keyEventsNeeded)}
                  label="Key Events Needed"
                  formula={`${fmt(calculated.customersNeeded)} / ${Math.round(keyEventCVR * 100)}% CVR`}
                  color="var(--color-lavender-light)"
                />
                <ResultCard
                  value={fmt(calculated.sessionsNeeded)}
                  label="Sessions Needed"
                  formula={`${fmt(calculated.keyEventsNeeded)} / ${Math.round(sessionCVR * 1000) / 10}% CVR`}
                  color="var(--color-peach-light)"
                />
              </div>

              {/* Flow Visualization */}
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--color-subtle-gray)] flex-wrap">
                <FlowStep label="Investment" value={fmtCurrency(seoInvestment)} bg="var(--color-mint)" />
                <Arrow />
                <FlowStep label="Customers" value={fmt(calculated.customersNeeded)} bg="var(--color-blue-ice)" />
                <Arrow />
                <FlowStep label="Key Events" value={fmt(calculated.keyEventsNeeded)} bg="var(--color-lavender-light)" />
                <Arrow />
                <FlowStep label="Sessions" value={fmt(calculated.sessionsNeeded)} bg="var(--color-peach-light)" />
              </div>
            </section>
          )}

          {/* Empty State */}
          {!calculated && (
            <div
              className="rounded-xl p-12 text-center"
              style={{ border: "2px dashed var(--color-border)", background: "white" }}
            >
              <p className="text-sm text-[var(--color-subtle-gray)]">
                Fill in all four inputs above to see the break-even model.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--color-border)", background: "white" }}>
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/daydream-icon.svg" alt="" className="h-4 w-4 opacity-40" />
          <span className="text-xs text-[var(--color-subtle-gray)]/60 font-medium italic">
            daydream — projection model
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ─── Input Components ─── */

function CurrencyInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-near-black)]">{label}</label>
      <div className="mt-1 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-subtle-gray)]">$</span>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          placeholder={placeholder}
          className="w-full rounded-lg pl-7 pr-4 py-2.5 text-sm tabular-nums transition-all focus:outline-none"
          style={{
            border: "1px solid var(--color-border)",
            background: "white",
            color: "var(--color-near-black)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-blue-sky)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(183,235,255,0.45)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );
}

function PercentInput({
  label,
  hint,
  value,
  onChange,
  step,
  min,
  max,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
}) {
  const displayValue =
    step >= 1 ? Math.round(value * 100) : Math.round(value * 1000) / 10;

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-near-black)]">
        {label}
        <span className="ml-1 text-xs text-[var(--color-subtle-gray)]">({hint})</span>
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={displayValue || ""}
          onChange={(e) => onChange((parseFloat(e.target.value) || 0) / 100)}
          className="w-24 rounded-lg px-4 py-2.5 text-sm tabular-nums transition-all focus:outline-none"
          style={{
            border: "1px solid var(--color-border)",
            background: "white",
            color: "var(--color-near-black)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-blue-sky)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(183,235,255,0.45)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <span className="text-sm text-[var(--color-subtle-gray)]">%</span>
      </div>
    </div>
  );
}

/* ─── Result Components ─── */

function ResultCard({
  value,
  label,
  formula,
  color,
}: {
  value: string;
  label: string;
  formula: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg p-4 text-center"
      style={{ background: color, border: "1px solid var(--color-border)" }}
    >
      <p className="text-2xl font-bold tabular-nums text-[var(--color-near-black)]">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--color-near-black)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--color-subtle-gray)]">{formula}</p>
    </div>
  );
}

function FlowStep({
  label,
  value,
  bg,
}: {
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-center"
      style={{ background: bg, border: "1px solid var(--color-border)" }}
    >
      <p className="text-xs text-[var(--color-subtle-gray)]">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-[var(--color-near-black)]">
        {value}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      style={{ color: "var(--color-border)" }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ─── Industry Benchmarks ─── */

/**
 * INDUSTRY BENCHMARK CONVERSION RATES — ORGANIC SEARCH ONLY
 *
 * Sources cross-referenced (data collected Jan 2022 – Mar 2026):
 *   - FirstPageSage: 80+ client SEO campaigns, avg 2.4 yr duration (2025–2026 reports)
 *   - Ruler Analytics: 100M+ data points across 14 industries (2025)
 *   - M+R Benchmarks 2025: 155+ nonprofits
 *   - HubSpot / Salesforce State of Sales: funnel-stage close rates
 *   - Databox, Unbounce, WebFX, Speed Commerce, SerpSculpt
 *
 * Each row uses CONSERVATIVE estimates (low end of researched range)
 * suitable for setting client expectations. The "range" field shows
 * the full researched spread: [conservative, standard, aggressive].
 *
 * sessionCVR = Session → Key Event (form fill, demo request, add-to-cart, etc.)
 * keyEventCVR = Key Event → Customer (qualified conversion → paying customer)
 */
const BENCHMARK_DATA: {
  industry: string;
  keyEventCVR: number;
  sessionCVR: number;
  keyEventRange: [number, number, number];
  sessionRange: [number, number, number];
  notes: string;
}[] = [
  {
    industry: "B2B SaaS",
    keyEventCVR: 0.15,
    sessionCVR: 0.015,
    keyEventRange: [0.15, 0.20, 0.30],
    sessionRange: [0.015, 0.020, 0.028],
    notes: "Trial or demo request → paid subscription. Longer sales cycles with multiple touchpoints.",
  },
  {
    industry: "B2B Prof. Services",
    keyEventCVR: 0.15,
    sessionCVR: 0.025,
    keyEventRange: [0.15, 0.25, 0.35],
    sessionRange: [0.025, 0.035, 0.050],
    notes: "Contact form or consultation request → signed engagement. Relationship-driven close.",
  },
  {
    industry: "E-commerce",
    keyEventCVR: 0.35,
    sessionCVR: 0.015,
    keyEventRange: [0.35, 0.45, 0.55],
    sessionRange: [0.015, 0.022, 0.035],
    notes: "Add-to-cart → completed purchase. Higher intent, lower touch than B2B.",
  },
  {
    industry: "Healthcare / Medical",
    keyEventCVR: 0.55,
    sessionCVR: 0.020,
    keyEventRange: [0.55, 0.65, 0.75],
    sessionRange: [0.020, 0.027, 0.035],
    notes: "Appointment request → patient visit. High close rate once a lead is generated.",
  },
  {
    industry: "Legal Services",
    keyEventCVR: 0.25,
    sessionCVR: 0.030,
    keyEventRange: [0.25, 0.35, 0.45],
    sessionRange: [0.030, 0.050, 0.075],
    notes: "Free consultation request → retained client. Strong organic intent in legal search.",
  },
  {
    industry: "Financial Services",
    keyEventCVR: 0.15,
    sessionCVR: 0.018,
    keyEventRange: [0.15, 0.22, 0.30],
    sessionRange: [0.018, 0.022, 0.030],
    notes: "Application or inquiry → funded account. High scrutiny, compliance-heavy funnel.",
  },
  {
    industry: "Real Estate",
    keyEventCVR: 0.02,
    sessionCVR: 0.020,
    keyEventRange: [0.02, 0.04, 0.08],
    sessionRange: [0.020, 0.025, 0.032],
    notes: "Inquiry → closed transaction. Very long sales cycle, phone-dominant conversion.",
  },
  {
    industry: "Home Services",
    keyEventCVR: 0.35,
    sessionCVR: 0.025,
    keyEventRange: [0.35, 0.45, 0.60],
    sessionRange: [0.025, 0.035, 0.050],
    notes: "Quote request → booked job. Strong local intent, phone calls are a major channel.",
  },
  {
    industry: "Education / EdTech",
    keyEventCVR: 0.18,
    sessionCVR: 0.020,
    keyEventRange: [0.18, 0.25, 0.35],
    sessionRange: [0.020, 0.028, 0.040],
    notes: "Application or trial signup → enrolled student or paying user.",
  },
  {
    industry: "Travel / Hospitality",
    keyEventCVR: 0.40,
    sessionCVR: 0.012,
    keyEventRange: [0.40, 0.50, 0.60],
    sessionRange: [0.012, 0.018, 0.025],
    notes: "Booking start → completed reservation. High comparison shopping lowers session CVR.",
  },
  {
    industry: "Manufacturing / Industrial",
    keyEventCVR: 0.12,
    sessionCVR: 0.020,
    keyEventRange: [0.12, 0.18, 0.25],
    sessionRange: [0.020, 0.027, 0.040],
    notes: "RFQ or contact form → purchase order. Long procurement cycles, multiple stakeholders.",
  },
  {
    industry: "Nonprofit",
    keyEventCVR: 0.10,
    sessionCVR: 0.005,
    keyEventRange: [0.10, 0.15, 0.22],
    sessionRange: [0.005, 0.010, 0.020],
    notes: "Donation page visit → completed donation. Lower top-of-funnel conversion than commercial.",
  },
];

type BenchmarkTier = 0 | 1 | 2;
const TIER_LABELS: Record<BenchmarkTier, string> = {
  0: "Conservative",
  1: "Standard",
  2: "Optimistic",
};
const TIER_DESCRIPTIONS: Record<BenchmarkTier, string> = {
  0: "Lower end of industry range. A realistic starting point for projections.",
  1: "Typical performance across the industry.",
  2: "What strong performers in this space tend to achieve.",
};

function Benchmarks({
  onApplyKeyEvent,
  onApplySession,
}: {
  onApplyKeyEvent: (v: number) => void;
  onApplySession: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<BenchmarkTier>(0);

  return (
    <div className="mt-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: "var(--color-subtle-gray)" }}
      >
        <svg
          className="h-4 w-4 transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Don&apos;t have conversion rates? See industry benchmarks
      </button>

      {open && (
        <div className="mt-3 rounded-lg overflow-hidden fade-in" style={{ border: "1px solid var(--color-border)" }}>
          <div className="px-4 py-3" style={{ background: "var(--color-lavender-light)" }}>
            <p className="text-xs font-medium text-[var(--color-near-black)]">
              Industry Benchmark Conversion Rates — Organic Search
            </p>
            <p className="text-xs text-[var(--color-subtle-gray)] mt-0.5">
              Based on aggregated industry data from multiple research sources.
            </p>

            {/* Tier Selector */}
            <div className="mt-3 flex items-center gap-1">
              {([0, 1, 2] as BenchmarkTier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: tier === t ? "var(--color-near-black)" : "white",
                    color: tier === t ? "white" : "var(--color-near-black)",
                    border: `1px solid ${tier === t ? "var(--color-near-black)" : "var(--color-border)"}`,
                  }}
                >
                  {TIER_LABELS[t]}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-[var(--color-subtle-gray)]">
              {TIER_DESCRIPTIONS[tier]}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--color-off-white)" }}>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-near-black)]">Industry</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-[var(--color-near-black)]">Session → Key Event</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-[var(--color-near-black)]">Key Event → Customer</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--color-near-black)]">Context</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {BENCHMARK_DATA.map((row) => {
                  const sessionVal = row.sessionRange[tier];
                  const keyEventVal = row.keyEventRange[tier];
                  return (
                    <tr
                      key={row.industry}
                      className="transition-colors"
                      style={{ borderTop: "1px solid var(--color-border)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,214,185,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="px-4 py-2.5 font-medium text-[var(--color-near-black)] whitespace-nowrap">{row.industry}</td>
                      <td className="px-4 py-2.5 text-center tabular-nums text-[var(--color-near-black)]">{(sessionVal * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-center tabular-nums text-[var(--color-near-black)]">{Math.round(keyEventVal * 100)}%</td>
                      <td className="px-4 py-2.5 text-xs text-[var(--color-subtle-gray)] max-w-[280px]">{row.notes}</td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => {
                            onApplyKeyEvent(keyEventVal);
                            onApplySession(sessionVal);
                          }}
                          className="rounded-md px-3 py-1 text-xs font-semibold transition-all hover:brightness-[0.97]"
                          style={{
                            background: "var(--gradient-brand)",
                            color: "var(--color-near-black)",
                            border: "1px solid rgba(232,226,220,0.8)",
                          }}
                        >
                          Use
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
