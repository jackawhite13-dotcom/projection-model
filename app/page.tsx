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
              Break-even traffic calculator
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
              Enter the values from the sales conversation.
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
          </section>

          {/* Results */}
          {calculated && (
            <section
              className="rounded-xl p-6 shadow-sm"
              style={{ background: "white", border: "1px solid var(--color-border)" }}
            >
              <h2 className="text-lg font-semibold text-[var(--color-near-black)]">
                Break-Even Model
              </h2>
              <p className="mt-1 text-sm text-[var(--color-subtle-gray)]">
                Working backward from investment to required organic traffic.
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
