"use client";

import { useState, useMemo, useRef, useCallback } from "react";

/* ─── Helpers ─── */

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}
function fmtCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
function fmtPercent(n: number): string {
  return `${Math.round(n * 1000) / 10}%`;
}

/* ─── Input mode definitions ─── */

type InputMode =
  | "standard"        // knows LTV + key event CVR + session CVR
  | "no-ltv"          // knows deal size + retention but not LTV
  | "revenue-target"  // thinks in revenue terms, not customer terms
  | "simple";         // only knows investment + rough cost-per-customer

const INPUT_MODES: { key: InputMode; label: string; description: string }[] = [
  {
    key: "standard",
    label: "Full Funnel",
    description: "Client knows their LTV, key event CVR, and session CVR",
  },
  {
    key: "no-ltv",
    label: "No LTV",
    description:
      "Client knows average deal size and retention but hasn't calculated LTV",
  },
  {
    key: "revenue-target",
    label: "Revenue Target",
    description: "Client has a monthly revenue goal and average deal size",
  },
  {
    key: "simple",
    label: "Simple",
    description:
      "Client only knows their investment and approximate cost per customer",
  },
];

/* ─── Main Component ─── */

export default function ProjectionModel() {
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Mode
  const [mode, setMode] = useState<InputMode>("standard");

  // Client name (optional, for PDF labeling)
  const [clientName, setClientName] = useState("");

  // Standard inputs
  const [seoInvestment, setSeoInvestment] = useState(0);
  const [customerLTV, setCustomerLTV] = useState(0);
  const [keyEventCVR, setKeyEventCVR] = useState(0.5);
  const [sessionCVR, setSessionCVR] = useState(0.05);

  // No-LTV inputs
  const [avgDealSize, setAvgDealSize] = useState(0);
  const [avgCustomerLifespan, setAvgCustomerLifespan] = useState(0); // months
  const [purchaseFrequency, setPurchaseFrequency] = useState(1); // per lifespan

  // Revenue target inputs
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState(0);
  const [avgRevenuePerCustomer, setAvgRevenuePerCustomer] = useState(0);

  // Simple inputs
  const [costPerCustomer, setCostPerCustomer] = useState(0);

  // Derive effective values based on mode
  const effectiveLTV = useMemo(() => {
    switch (mode) {
      case "standard":
        return customerLTV;
      case "no-ltv":
        return avgDealSize * purchaseFrequency;
      case "revenue-target":
        return avgRevenuePerCustomer || 1;
      case "simple":
        return costPerCustomer || 1;
    }
  }, [
    mode,
    customerLTV,
    avgDealSize,
    purchaseFrequency,
    avgRevenuePerCustomer,
    costPerCustomer,
  ]);

  const effectiveInvestment = useMemo(() => {
    if (mode === "revenue-target") {
      return monthlyRevenueTarget;
    }
    return seoInvestment;
  }, [mode, seoInvestment, monthlyRevenueTarget]);

  const calculated = useMemo(() => {
    if (!effectiveInvestment || !effectiveLTV || !keyEventCVR || !sessionCVR) {
      return null;
    }
    const customersNeeded = Math.ceil(effectiveInvestment / effectiveLTV);
    const keyEventsNeeded = Math.ceil(customersNeeded / keyEventCVR);
    const sessionsNeeded = Math.ceil(keyEventsNeeded / sessionCVR);
    return { customersNeeded, keyEventsNeeded, sessionsNeeded };
  }, [effectiveInvestment, effectiveLTV, keyEventCVR, sessionCVR]);

  // PDF export
  const handleExport = useCallback(async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFB",
      });

      const imgWidth = 210; // A4 mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight
      );

      const filename = clientName
        ? `projection-model-${clientName.toLowerCase().replace(/\s+/g, "-")}.pdf`
        : "projection-model.pdf";
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [clientName]);

  return (
    <div className="flex flex-col flex-1">
      {/* Brand stripe */}
      <div
        className="h-[3px]"
        style={{ background: "var(--gradient-brand)" }}
      />

      {/* Header */}
      <header className="border-b bg-white" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
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
          {calculated && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="no-print flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--color-near-black)] transition-all hover:brightness-[0.97] hover:saturate-[1.05] disabled:opacity-50"
              style={{
                background: "var(--gradient-brand)",
                border: "1px solid rgba(232,226,220,0.8)",
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exporting ? "Exporting..." : "Export PDF"}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div ref={printRef} className="mx-auto max-w-5xl px-6 space-y-8 fade-in">
          {/* Client Name + Mode Selector */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-[var(--color-near-black)]">
                Client Name
                <span className="ml-1 text-xs text-[var(--color-subtle-gray)]">(optional)</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="mt-1 w-full rounded-lg px-4 py-2.5 text-sm text-[var(--color-near-black)] placeholder-[var(--color-subtle-gray)]/60 transition-all focus:outline-none"
                style={{
                  border: "1px solid var(--color-border)",
                  background: "white",
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

            {/* Mode Tabs */}
            <div className="no-print flex gap-1 rounded-lg p-1" style={{ background: "var(--color-warm-cream)", border: "1px solid var(--color-border)" }}>
              {INPUT_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: mode === m.key ? "white" : "transparent",
                    color: "var(--color-near-black)",
                    boxShadow: mode === m.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                  title={m.description}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Description */}
          <p className="text-sm text-[var(--color-subtle-gray)] -mt-4">
            {INPUT_MODES.find((m) => m.key === mode)?.description}
          </p>

          {/* Inputs */}
          <section
            className="rounded-xl p-6 shadow-sm"
            style={{ background: "var(--color-warm-cream)", border: "1px solid var(--color-border)" }}
          >
            <h2 className="text-lg font-semibold text-[var(--color-near-black)]">Inputs</h2>
            <p className="mt-1 text-sm text-[var(--color-subtle-gray)]">
              {mode === "standard" && "Enter the client's investment details and conversion rates."}
              {mode === "no-ltv" && "We'll calculate LTV from deal size and purchase frequency."}
              {mode === "revenue-target" && "Set the revenue goal and we'll work backward to traffic."}
              {mode === "simple" && "Just the investment and your rough cost to acquire a customer."}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* ── Standard Mode ── */}
              {mode === "standard" && (
                <>
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
                </>
              )}

              {/* ── No LTV Mode ── */}
              {mode === "no-ltv" && (
                <>
                  <CurrencyInput
                    label="Monthly SEO Investment"
                    value={seoInvestment}
                    onChange={setSeoInvestment}
                    placeholder="e.g., 10,000"
                  />
                  <CurrencyInput
                    label="Average Deal Size"
                    value={avgDealSize}
                    onChange={setAvgDealSize}
                    placeholder="e.g., 2,000"
                  />
                  <NumberInput
                    label="Purchases Per Customer Lifespan"
                    value={purchaseFrequency}
                    onChange={setPurchaseFrequency}
                    placeholder="e.g., 3"
                    hint="how many times they buy"
                  />
                  <NumberInput
                    label="Avg Customer Lifespan (months)"
                    value={avgCustomerLifespan}
                    onChange={setAvgCustomerLifespan}
                    placeholder="e.g., 24"
                    hint="for context only"
                  />
                  <div className="sm:col-span-2 rounded-lg px-4 py-3 text-sm" style={{ background: "var(--color-lavender-light)" }}>
                    <span className="font-medium">Calculated LTV:</span>{" "}
                    {avgDealSize && purchaseFrequency
                      ? fmtCurrency(avgDealSize * purchaseFrequency)
                      : "—"}
                    <span className="ml-2 text-xs text-[var(--color-subtle-gray)]">
                      (deal size x purchase frequency)
                    </span>
                  </div>
                </>
              )}

              {/* ── Revenue Target Mode ── */}
              {mode === "revenue-target" && (
                <>
                  <CurrencyInput
                    label="Monthly Revenue Target"
                    value={monthlyRevenueTarget}
                    onChange={setMonthlyRevenueTarget}
                    placeholder="e.g., 50,000"
                  />
                  <CurrencyInput
                    label="Avg Revenue Per Customer (monthly)"
                    value={avgRevenuePerCustomer}
                    onChange={setAvgRevenuePerCustomer}
                    placeholder="e.g., 500"
                  />
                </>
              )}

              {/* ── Simple Mode ── */}
              {mode === "simple" && (
                <>
                  <CurrencyInput
                    label="Monthly SEO Investment"
                    value={seoInvestment}
                    onChange={setSeoInvestment}
                    placeholder="e.g., 10,000"
                  />
                  <CurrencyInput
                    label="Approx. Cost Per Customer"
                    value={costPerCustomer}
                    onChange={setCostPerCustomer}
                    placeholder="e.g., 200"
                  />
                </>
              )}

              {/* ── Conversion rates (all modes) ── */}
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-near-black)]">
                    Break-Even Model
                    {clientName && (
                      <span className="ml-2 text-sm font-medium text-[var(--color-subtle-gray)]">
                        — {clientName}
                      </span>
                    )}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-subtle-gray)]">
                    {mode === "revenue-target"
                      ? "Working backward from revenue target to required organic traffic."
                      : "Working backward from investment to required organic traffic."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ResultCard
                  value={fmtCurrency(effectiveInvestment)}
                  label={mode === "revenue-target" ? "Revenue Target" : "Monthly Investment"}
                  formula={mode === "revenue-target" ? "Your stated target" : "Your stated budget"}
                  color="var(--color-mint)"
                />
                <ResultCard
                  value={fmt(calculated.customersNeeded)}
                  label="Customers Needed"
                  formula={`${fmtCurrency(effectiveInvestment)} / ${fmtCurrency(effectiveLTV)} ${mode === "no-ltv" ? "calc. LTV" : mode === "simple" ? "CPA" : "LTV"}`}
                  color="var(--color-blue-ice)"
                />
                <ResultCard
                  value={fmt(calculated.keyEventsNeeded)}
                  label="Key Events Needed"
                  formula={`${fmt(calculated.customersNeeded)} / ${fmtPercent(keyEventCVR)} CVR`}
                  color="var(--color-lavender-light)"
                />
                <ResultCard
                  value={fmt(calculated.sessionsNeeded)}
                  label="Sessions Needed"
                  formula={`${fmt(calculated.keyEventsNeeded)} / ${fmtPercent(sessionCVR)} CVR`}
                  color="var(--color-peach-light)"
                />
              </div>

              {/* Flow Visualization */}
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--color-subtle-gray)] flex-wrap">
                <FlowStep
                  label={mode === "revenue-target" ? "Revenue" : "Investment"}
                  value={fmtCurrency(effectiveInvestment)}
                  bg="var(--color-mint)"
                />
                <Arrow />
                <FlowStep
                  label="Customers"
                  value={fmt(calculated.customersNeeded)}
                  bg="var(--color-blue-ice)"
                />
                <Arrow />
                <FlowStep
                  label="Key Events"
                  value={fmt(calculated.keyEventsNeeded)}
                  bg="var(--color-lavender-light)"
                />
                <Arrow />
                <FlowStep
                  label="Sessions"
                  value={fmt(calculated.sessionsNeeded)}
                  bg="var(--color-peach-light)"
                />
              </div>

              {/* Assumptions summary for PDF */}
              <div
                className="mt-6 rounded-lg px-4 py-3 text-xs text-[var(--color-subtle-gray)]"
                style={{ background: "var(--color-off-white)", border: "1px solid var(--color-border)" }}
              >
                <span className="font-medium text-[var(--color-near-black)]">Assumptions:</span>{" "}
                {mode === "no-ltv" && `Deal size ${fmtCurrency(avgDealSize)} x ${purchaseFrequency} purchases = ${fmtCurrency(effectiveLTV)} LTV · `}
                {mode === "revenue-target" && `Revenue per customer ${fmtCurrency(avgRevenuePerCustomer)}/mo · `}
                {mode === "simple" && `Cost per customer ${fmtCurrency(costPerCustomer)} · `}
                {mode === "standard" && `LTV ${fmtCurrency(customerLTV)} · `}
                Key Event → Customer CVR {fmtPercent(keyEventCVR)} · Session → Key Event CVR {fmtPercent(sessionCVR)}
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
                Fill in the inputs above to see the break-even model.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--color-border)", background: "white" }}>
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-center gap-2">
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

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-near-black)]">
        {label}
        {hint && <span className="ml-1 text-xs text-[var(--color-subtle-gray)]">({hint})</span>}
      </label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg px-4 py-2.5 text-sm tabular-nums transition-all focus:outline-none"
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
