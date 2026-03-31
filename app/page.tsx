"use client";

import { useState, useMemo } from "react";

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

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
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <p className="text-xs font-medium tracking-widest text-indigo-500 uppercase">
            Daydream
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">
            Projection Model
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Work backward from your SEO investment to calculate the organic
            traffic needed to break even.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-6 space-y-8">
          {/* Inputs */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900">Inputs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the client&apos;s investment details and conversion rates.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField
                label="Monthly SEO Investment ($)"
                value={seoInvestment}
                onChange={setSeoInvestment}
                placeholder="e.g., 10000"
                type="currency"
              />
              <InputField
                label="Average Customer Lifetime Value ($)"
                value={customerLTV}
                onChange={setCustomerLTV}
                placeholder="e.g., 5000"
                type="currency"
              />
              <PercentField
                label="Key Event → Customer CVR"
                hint="default 50%"
                value={keyEventCVR}
                onChange={setKeyEventCVR}
                step={1}
                min={1}
                max={100}
              />
              <PercentField
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
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900">
                Break-Even Model
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Working backward from investment to required organic traffic.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard
                  value={fmtCurrency(seoInvestment)}
                  label="Monthly Investment"
                  formula="Your stated budget"
                  accent
                />
                <ResultCard
                  value={fmt(calculated.customersNeeded)}
                  label="Customers Needed"
                  formula={`${fmtCurrency(seoInvestment)} / ${fmtCurrency(customerLTV)} LTV`}
                />
                <ResultCard
                  value={fmt(calculated.keyEventsNeeded)}
                  label="Key Events Needed"
                  formula={`${fmt(calculated.customersNeeded)} / ${Math.round(keyEventCVR * 100)}% CVR`}
                />
                <ResultCard
                  value={fmt(calculated.sessionsNeeded)}
                  label="Sessions Needed"
                  formula={`${fmt(calculated.keyEventsNeeded)} / ${Math.round(sessionCVR * 1000) / 10}% CVR`}
                  accent
                />
              </div>

              {/* Flow Visualization */}
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                <FlowStep label="Investment" value={fmtCurrency(seoInvestment)} />
                <Arrow />
                <FlowStep label="Customers" value={fmt(calculated.customersNeeded)} />
                <Arrow />
                <FlowStep label="Key Events" value={fmt(calculated.keyEventsNeeded)} />
                <Arrow />
                <FlowStep label="Sessions" value={fmt(calculated.sessionsNeeded)} highlight />
              </div>
            </section>
          )}

          {/* Empty State */}
          {!calculated && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-sm text-gray-400">
                Fill in all four inputs above to see the break-even model.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4 text-center text-xs text-gray-400">
          Daydream — Projection Model
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 tabular-nums placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

function PercentField({
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
  const displayValue = step >= 1
    ? Math.round(value * 100)
    : Math.round(value * 1000) / 10;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="ml-1 text-xs text-gray-400">({hint})</span>
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={displayValue || ""}
          onChange={(e) => onChange((parseFloat(e.target.value) || 0) / 100)}
          className="w-24 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 tabular-nums focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-500">%</span>
      </div>
    </div>
  );
}

function ResultCard({
  value,
  label,
  formula,
  accent,
}: {
  value: string;
  label: string;
  formula: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
      <p
        className={`text-2xl font-bold tabular-nums ${
          accent ? "text-indigo-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-700">{label}</p>
      <p className="mt-1 text-xs text-gray-400">{formula}</p>
    </div>
  );
}

function FlowStep({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-2 text-center ${
        highlight
          ? "bg-indigo-50 border border-indigo-200"
          : "bg-gray-50 border border-gray-200"
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-sm font-semibold tabular-nums ${
          highlight ? "text-indigo-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
