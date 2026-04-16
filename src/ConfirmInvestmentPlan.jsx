/**
 * ConfirmInvestmentPlan.jsx
 * Stax Capital — DST Hub
 * "Confirm Your Investment Plan" step — pixel-faithful Figma implementation
 * Figma: XZNUjSzlORw0b3aFxzHHmP, node 4914:66518
 */
import { useState } from "react";

/* ─── Design tokens ─────────────────────────────────── */
const FONT   = "Inter, -apple-system, BlinkMacSystemFont, sans-serif";
const DARK   = "#111d2e";   // nav / section headers
const DEEPER = "#0c1520";   // deepest bg
const PAGE   = "#faf9f6";   // page background
const CARD   = "#ffffff";
const SEC    = "#f5f2ed";   // section / muted bg
const DIVIDER = "#E4E4E7";
const BORD   = "#e5e5e5";
const BORD2  = "#d4d4d4";
const TP     = "#1d2837";   // text primary
const TS     = "#57534e";   // text secondary
const TM     = "#8d9a94";   // text muted
const TW     = "#ffffff";   // text white
const GREEN  = "#326b52";
const MINT   = "#e8f0eb";
const RED    = "#DC2626";
const REDBG  = "#FEF2F2";
const REDBRD = "#fca5a5";
const AMB    = "#ca8a04";   // warning text (yellow)
const AMBBG  = "#fefce8";   // warning bg (soft yellow)
const AMBBRD = "#ca8a04";   // warning accent border
const CORAL  = "#ef6b51";
const SP = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
const TYPO = {
  stepTitle: { size: 16, weight: 700, color: TP },
  stepDescription: { size: 12, weight: 400, color: TS },
  sectionTitle: { size: 14, weight: 600, color: TP },
  sectionDescription: { size: 12, weight: 400, color: TS },
  inputLabel: { size: 12, weight: 600, color: TP },
  inputValue: { size: 14, weight: 500, color: TP },
  hint: { size: 11, weight: 400, color: TM },
};

/* ─── Helpers ────────────────────────────────────────── */
const fmt   = (v) => "$" + Math.round(v ?? 0).toLocaleString();
const fmt2  = (v) => "$" + (v ?? 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const pctFmt = (v, dp = 3) => (+(v ?? 0)).toFixed(dp) + "%";

/* ─── Mock data matching Figma screenshot ────────────── */
const DEFAULT_ITEMS = [
  {
    id: "passco-prism",
    name: "Passco Prism",
    sponsor: "Passco",
    location: "Moon Township, PA",
    propertyTypeShort: "Multifamily",
    offeringEquity: 59_200_000,
    loanAmount:    100_100_000,
    distributionRate: 4.30,
    ltv: 45.31,
    investorEquity: 100_000,
  },
  {
    id: "nextpoint-outlook",
    name: "NexPoint Outlook",
    sponsor: "NexPoint",
    location: "Birmingham, AL",
    propertyTypeShort: "Multifamily",
    offeringEquity: 32_900_000,
    loanAmount:     65_800_000,
    distributionRate: 4.44,
    ltv: 49.90,
    investorEquity: 100_000,
  },
  {
    id: "pg-manchester",
    name: "PG Manchester Industrial",
    sponsor: "Peachtree",
    location: "Londonderry, NH",
    propertyTypeShort: "Industrial",
    offeringEquity: 28_100_000,
    loanAmount:         0,
    distributionRate: 5.03,
    ltv: 0.00,
    investorEquity: 100_000,
  },
];

/* ══════════════════════════════════════════════════════
   TOP-LEVEL COMPONENT
   ══════════════════════════════════════════════════════ */
export default function ConfirmInvestmentPlan({
  /* exchange / 1031 props */
  exchangeProceeds    = 849_000,
  items               = DEFAULT_ITEMS,
  debtRetiredAtSale   = 185_000,
  /* relinquished property */
  rpAnnualIncome      = 36_000,
  rpAnnualExpenses    = 9_800,
  rpPurchasePrice     = 250_000,
  rpYearsOwned        = 27.5,
  /* tax */
  capitalGainsTax     = 169_800,
  depRecapture        = 0,
  /* callbacks */
  onAcknowledge       = undefined,
  initialAcknowledged = false,
}) {
  const [ack, setAck] = useState(initialAcknowledged);

  /* ── derived portfolio values ─────────────────────── */
  const rows = items.map((item) => {
    const eq   = item.investorEquity || 0;
    const prop = item.offeringEquity > 0 ? eq / item.offeringEquity : 0;
    const debt = prop * item.loanAmount;
    const tv   = eq + debt;
    const acf  = eq * (item.distributionRate / 100);
    return { ...item, eq, prop, debt, tv, acf, mo: acf / 12 };
  });

  const totals = rows.reduce(
    (a, r) => ({ eq: a.eq + r.eq, tv: a.tv + r.tv, acf: a.acf + r.acf }),
    { eq: 0, tv: 0, acf: 0 }
  );
  const totalMo = totals.acf / 12;

  const cartTotal   = totals.eq;
  const unallocated = Math.max(0, exchangeProceeds - cartTotal);
  const allocPct    = exchangeProceeds > 0 ? Math.min(100, (cartTotal / exchangeProceeds) * 100) : 100;
  const cashBootOk  = unallocated === 0;

  /* ── debt analysis ───────────────────────────────── */
  const dstDebtShare = rows.reduce((s, r) => s + r.debt, 0);
  const debtBootOk   = debtRetiredAtSale === 0 || dstDebtShare >= debtRetiredAtSale;
  const debtShortfall= debtBootOk ? 0 : debtRetiredAtSale - dstDebtShare;

  /* ── 1031 benefit calcs ──────────────────────────── */
  const oldNOI       = rpAnnualIncome - rpAnnualExpenses;
  const dstAnnualCF  = totals.acf;
  const cashFlowDelta= dstAnnualCF - oldNOI;

  const oldAnnualDep = rpYearsOwned > 0 ? (rpPurchasePrice * 0.8) / 27.5 : 0;
  // Estimate investor DST dep share (conservative 70% improvement ratio)
  const dstDepTotal  = rows.reduce((s, r) => {
    const tvProp = totals.tv > 0 ? r.tv / totals.tv : 0;
    return s + tvProp * r.tv * 0.7 / 27.5;
  }, 0);
  const investorDstDep = dstDepTotal;
  // Taxable income estimate
  const dstTaxableIncome = Math.max(0, dstAnnualCF - investorDstDep);
  const taxSheltered     = Math.max(0, dstAnnualCF - dstTaxableIncome);
  const taxDeferred      = capitalGainsTax + depRecapture;

  /* ── alert strings ───────────────────────────────── */
  const alerts = [
    !cashBootOk && `${fmt(unallocated)} not yet allocated — taxable cash boot may apply`,
    debtRetiredAtSale > 0 && !debtBootOk && `Debt shortfall of ${fmt(debtShortfall)} — mortgage boot may apply`,
    "Expired to identify properties (45-day IRS deadline)",
  ].filter(Boolean);

  /* equity retained pct */
  const equityRetainedPct =
    exchangeProceeds > 0 ? ((totals.tv / exchangeProceeds) * 100).toFixed(1) : "0.0";

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: PAGE, fontFamily: FONT }}>

      {/* ── Nav bar ───────────────────────────────────── */}
      <NavBar />

      {/* ── Page content ─────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 0 80px" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: "#1D2837", margin: "0 0 8px", lineHeight: 1.3 }}>
              Confirm Your Investment Plan
            </h1>
            <p style={{ fontSize: 14, fontWeight: 400, color: "#57534E", margin: 0, lineHeight: 1.5, maxWidth: 660 }}>
              Review the amounts invested in each DST below. To avoid taxable boot, your full
              exchange proceeds should be allocated.
            </p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 18px", borderRadius: 8,
            background: GREEN, border: "none",
            color: TW, fontSize: 13, fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.01em", flexShrink: 0, marginTop: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="M16 21l4-4-4-4"/><path d="M20 17H4"/>
            </svg>
            Split Evenly
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: SP.lg }}>

          {/* ── 1 · Exchange Proceeds Allocated ─────── */}
          <ExchangeProceedsCard
            exchangeProceeds={exchangeProceeds}
            cartTotal={cartTotal}
            allocPct={allocPct}
            cashBootOk={cashBootOk}
            alerts={alerts}
            unallocated={unallocated}
            estAnnualIncome={dstAnnualCF}
            itemCount={items.length}
          />

          {/* ── 2 · DST Property Cards ───────────────── */}
          {items.map((item, i) => (
            <DstPropertyCard
              key={item.id}
              item={item}
              row={rows[i]}
              exchangeProceeds={exchangeProceeds}
            />
          ))}

          {/* ── 3 · Portfolio Economics ──────────────── */}
          <PortfolioEconomicsCard rows={rows} totals={totals} totalMo={totalMo} />

          {/* ── 3 · Boot Analysis ────────────────────── */}
          <BootAnalysisCard
            exchangeProceeds={exchangeProceeds}
            cartTotal={cartTotal}
            unallocated={unallocated}
            cashBootOk={cashBootOk}
            debtRetiredAtSale={debtRetiredAtSale}
            dstDebtShare={dstDebtShare}
            debtBootOk={debtBootOk}
            debtShortfall={debtShortfall}
            equityRetainedPct={equityRetainedPct}
            ack={ack}
            onAck={(v) => {
              setAck(v);
              onAcknowledge?.(v);
            }}
          />

          {/* ── 4 · 1031 Exchange Benefit Analysis ───── */}
          <BenefitAnalysisCard
            oldNOI={oldNOI}
            rpAnnualIncome={rpAnnualIncome}
            rpAnnualExpenses={rpAnnualExpenses}
            dstAnnualCF={dstAnnualCF}
            cashFlowDelta={cashFlowDelta}
            oldAnnualDep={oldAnnualDep}
            investorDstDep={investorDstDep}
            taxSheltered={taxSheltered}
            capitalGainsTax={capitalGainsTax}
            depRecapture={depRecapture}
            taxDeferred={taxDeferred}
          />

        </div>
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <PageFooter />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NAV BAR
   ══════════════════════════════════════════════════════ */
function NavBar() {
  return (
    <div style={{
      background: DARK,
      height: 66,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 40px",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      {/* Logos */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* STAX AI wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "#4a7c6f",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 11L8 5l5 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: TW, letterSpacing: "0.02em" }}>STAX<span style={{ color: "#6ec6b5", marginLeft: 2 }}>AI</span></span>
        </div>
        {/* Separator */}
        <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.18)" }} />
        {/* Compliance logos */}
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em" }}>FINRA</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Broker</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>Check</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em" }}>SIPC</span>
      </div>
      {/* CTA */}
      <button style={{
        padding: "9px 20px",
        borderRadius: 8,
        background: "#c8b97a",
        border: "none",
        color: DEEPER,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: "0.01em",
      }}>
        Schedule Consultation
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 1 — EXCHANGE PROCEEDS ALLOCATED
   ══════════════════════════════════════════════════════ */
function ExchangeProceedsCard({
  exchangeProceeds, cartTotal, allocPct, cashBootOk, alerts, unallocated, estAnnualIncome, itemCount,
}) {
  const BANNER_COPY_GREEN = "#3E8669";
  const kpis = [
    { label: "Total Invested",     value: fmt(cartTotal),            sub: `Across ${itemCount} DSTs` },
    { label: "Not Yet Allocated",  value: fmt(unallocated),          sub: "Consider allocating" },
    { label: "Est. Year 1 Income", value: fmt(estAnnualIncome),      sub: "From DST distributions" },
    { label: "Est. Monthly Income",value: fmt(estAnnualIncome / 12), sub: "avg per month" },
  ];

  return (
    <div style={{
      background: CARD, borderRadius: 8, border: `1px solid ${BORD}`,
      overflow: "hidden", display: "flex", flexDirection: "column", gap: SP.lg,
    }}>
      {/* ── Header: title + progress bar ── */}
      <div style={{ padding: "16px 24px 0", display: "flex", flexDirection: "column", gap: SP.md }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: TYPO.sectionTitle.size, fontWeight: TYPO.sectionTitle.weight, color: TYPO.sectionTitle.color, lineHeight: "24px" }}>
            Exchange Proceeds Allocated
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: cashBootOk ? BANNER_COPY_GREEN : "#a3a3a3" }}>
            <span style={{ color: cashBootOk ? BANNER_COPY_GREEN : RED, fontWeight: 500 }}>{fmt(cartTotal)}</span>
            {` of ${fmt(exchangeProceeds)}`}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          height: 8, background: "#d4d4d4", borderRadius: 9999, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${allocPct}%`,
            background: cashBootOk ? BANNER_COPY_GREEN : RED,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* ── Body: alerts + KPI cards ── */}
      <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: SP.lg }}>

        {/* Alert box */}
        {alerts.length > 0 && (
          <div style={{
            borderLeft: `3px solid ${RED}`,
            background: REDBG,
            padding: 12,
            borderRadius: "0 8px 8px 0",
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: RED, lineHeight: "20px" }}>Exchange Alerts</div>
            {alerts.map((msg, i) => (
              <div key={i} style={{ fontSize: 12, fontWeight: 400, color: RED, lineHeight: "20px" }}>{msg}</div>
            ))}
          </div>
        )}

        {/* KPI cards row */}
        <div style={{ display: "flex", gap: SP.lg, alignItems: "center" }}>
          {kpis.map(({ label, value, sub }) => (
            <div key={label} style={{
              flex: 1, background: "#f4f4f5", borderRadius: 8,
              padding: "16px 12px",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: SP.sm, textAlign: "center",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0b111a", lineHeight: "24px" }}>{value}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#0b111a", lineHeight: "16px" }}>{sub}</div>
              </div>
              <div style={{ fontSize: TYPO.sectionDescription.size, fontWeight: TYPO.sectionDescription.weight, color: TYPO.sectionDescription.color, lineHeight: "20px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 1b — DST PROPERTY CARD
   ══════════════════════════════════════════════════════ */
function DstPropertyCard({ item, row, exchangeProceeds }) {
  const ltv = item.ltv != null
    ? item.ltv
    : item.loanAmount > 0
      ? (item.loanAmount / (item.offeringEquity + item.loanAmount)) * 100
      : 0;

  const isMultifamily = /multi/i.test(item.propertyTypeShort);
  const isIndustrial  = /industrial/i.test(item.propertyTypeShort);

  const badgeColor = isMultifamily ? "#2563eb"
    : isIndustrial  ? "#c2410c"
    : "#6b7280";
  const badgeBg    = isMultifamily ? "#eff6ff"
    : isIndustrial  ? "#fff7ed"
    : "#f3f4f6";
  const badgeBorder = isMultifamily ? "#bfdbfe"
    : isIndustrial   ? "#fed7aa"
    : "#e5e7eb";

  /* Gradient placeholder image per type */
  const imgGradient = isMultifamily
    ? "linear-gradient(160deg, #7fa3be 0%, #5e8aa8 45%, #8ca8c0 100%)"
    : isIndustrial
    ? "linear-gradient(160deg, #9aadaf 0%, #7a929b 45%, #8faaaf 100%)"
    : "linear-gradient(160deg, #9aa3c0 0%, #7080a0 45%, #8fa0c0 100%)";

  const displayName = item.name.endsWith("DST") ? item.name : `${item.name} DST`;
  const sponsor     = item.sponsor || item.name.split(" ")[0];

  return (
    <div style={{
      background: CARD, borderRadius: 8, border: `1px solid ${BORD}`,
      overflow: "hidden", display: "flex", alignItems: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      minHeight: 112,
    }}>
      {/* ── Left: property image placeholder ── */}
      <div style={{ width: 175, height: "100%", flexShrink: 0, position: "relative", background: imgGradient, alignSelf: "stretch" }}>
        {/* Decorative overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 55%)",
        }} />
        {/* Sponsor label */}
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 4, padding: "3px 8px",
          fontSize: 10, fontWeight: 700, color: TW, letterSpacing: "0.04em",
        }}>
          {sponsor}
        </div>
      </div>

      {/* ── Right: content area ── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "minmax(190px,1fr) 100px 100px minmax(180px,300px) 192px",
        alignItems: "center",
      }}>
        <div style={{ padding: "12px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, minWidth: 190 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: TP, lineHeight: "20px" }}>
            {displayName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{
              fontSize: 12, fontWeight: 600, lineHeight: "16px",
              color: badgeColor, background: badgeBg,
              border: `1px solid ${badgeBorder}`,
              borderRadius: 8, padding: "2px 8px", whiteSpace: "nowrap",
            }}>
              {item.propertyTypeShort}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", color: TS, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.location || "Location, ST"}
            </span>
          </div>
        </div>

        <div style={{ padding: "12px 12px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 100 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 400, color: TM, lineHeight: "16px" }}>Cash Flow</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TP, lineHeight: "20px" }}>{item.distributionRate.toFixed(2)}%</div>
          </div>
        </div>

        <div style={{ padding: "12px 12px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 100 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 400, color: TM, lineHeight: "16px" }}>LTV</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TP, lineHeight: "20px" }}>{ltv.toFixed(2)}%</div>
          </div>
        </div>

        <div style={{ padding: "12px 12px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 180, maxWidth: 300 }}>
          <div style={{ width: 166, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: TP, lineHeight: "16px" }}>Investment Amount</div>
            <div style={{
              height: 40, padding: "6px 12px", borderRadius: 8,
              border: `1px solid ${BORD2}`, background: "#ffffff",
              fontSize: 14, fontWeight: 600, color: TP, lineHeight: "20px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              display: "flex", alignItems: "center",
            }}>
              {fmt(item.investorEquity)}
            </div>
          </div>
        </div>

        <div style={{ width: 192, padding: "12px 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            height: 36, borderRadius: 8, padding: "8px 16px",
            border: `1px solid ${GREEN}`, background: GREEN,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: `1px solid #DDF9EB`, background: GREEN,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#DDF9EB" strokeWidth="2.2">
                <polyline points="2 6 5 9 10 3" />
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#DDF9EB", lineHeight: "20px", whiteSpace: "nowrap" }}>
              Added to Plan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 2 — PORTFOLIO ECONOMICS TABLE
   ══════════════════════════════════════════════════════ */
function PortfolioEconomicsCard({ rows, totals, totalMo }) {
  /* Local editable equity state, seeded from rows */
  const [equityValues, setEquityValues] = useState(
    () => Object.fromEntries(rows.map((r) => [r.id, r.eq]))
  );
  const [focusedId, setFocusedId] = useState(null);

  /* Recompute rows & totals from local equity state */
  const localRows = rows.map((r) => {
    const eq   = equityValues[r.id] ?? r.eq;
    const prop = r.offeringEquity > 0 ? eq / r.offeringEquity : 0;
    const debt = prop * r.loanAmount;
    const tv   = eq + debt;
    const acf  = eq * (r.distributionRate / 100);
    return { ...r, eq, prop, debt, tv, acf, mo: acf / 12 };
  });
  const totalTv  = localRows.reduce((s, r) => s + r.tv, 0);
  const totalAcf = localRows.reduce((s, r) => s + r.acf, 0);
  const totalEq  = localRows.reduce((s, r) => s + r.eq, 0);
  const totalMoI = totalAcf / 12;

  /* Figma design tokens */
  const HDR_BG      = "#1d2837";
  const HDR_LABEL   = "#6c7785";
  const HDR_FG      = "#fafafa";
  const TBL_HEAD_BG = "#f5f3f2";
  const TBL_HEAD_FG = "#57534e";
  const CELL_FG     = "#0b111a";
  const CELL_SUB    = "#57534e";
  const CELL_BORD   = DIVIDER;
  const INPUT_BORD  = "#e4e4e7";

  const thStyle = (align = "right") => ({
    height: 40,
    padding: "0 8px",
    fontSize: 14,
    fontWeight: 500,
    color: TBL_HEAD_FG,
    textAlign: align,
    whiteSpace: "nowrap",
    background: TBL_HEAD_BG,
    borderBottom: `1px solid ${CELL_BORD}`,
  });

  const tdStyle = (align = "right") => ({
    height: 72,
    padding: "16px 8px",
    textAlign: align,
    borderBottom: `1px solid ${CELL_BORD}`,
    verticalAlign: "middle",
  });

  const totalTdStyle = (align = "right") => ({
    height: 40,
    padding: "0 8px",
    textAlign: align,
    background: TBL_HEAD_BG,
    verticalAlign: "middle",
  });

  const inputStyle = {
    width: "100%",
    height: 44,
    background: "#ffffff",
    border: `1px solid ${INPUT_BORD}`,
    borderRadius: 8,
    padding: "6px 14px",
    boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.05)",
    fontSize: TYPO.inputValue.size,
    fontWeight: TYPO.inputValue.weight,
    fontFamily: FONT,
    color: CELL_FG,
    lineHeight: "20px",
    textAlign: "right",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ borderRadius: 8, overflow: "hidden" }}>
      {/* Dark header — flat #1d2837, no gradient */}
      <div style={{
        background: HDR_BG,
        padding: "16px 24px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: SP.md,
      }}>
        <div>
          <div style={{ fontSize: TYPO.hint.size, fontWeight: 500, color: HDR_LABEL, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: "16px", marginBottom: 4 }}>
            PORTFOLIO ECONOMICS
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: HDR_FG, lineHeight: "24px" }}>
            Investor Equity · Debt Allocation · Total Value · Cash Flow
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: TYPO.hint.size, fontWeight: 500, color: HDR_LABEL, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: "16px", marginBottom: 4, whiteSpace: "nowrap" }}>
            TOTAL RE VALUE CONTROLLED
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: HDR_FG, lineHeight: "24px" }}>
            {fmt(totalTv)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: CARD, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT, tableLayout: "fixed" }}>
          <colgroup>
            <col /><col /><col style={{ width: 180 }} /><col /><col /><col />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle("left")}>Offering</th>
              <th style={thStyle("right")}>Ownership</th>
              <th style={thStyle("right")}>Investor Equity</th>
              <th style={thStyle("right")}>Total Value</th>
              <th style={thStyle("right")}>Annual Cashflow</th>
              <th style={thStyle("right")}>Monthly Income</th>
            </tr>
          </thead>
          <tbody>
            {localRows.map((r) => (
              <tr key={r.id} style={{ background: CARD }}>
                {/* Offering */}
                <td style={tdStyle("left")}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: CELL_FG, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 400, color: CELL_SUB, lineHeight: 1, marginTop: 4 }}>{r.propertyTypeShort}</div>
                </td>
                {/* Ownership */}
                <td style={tdStyle("right")}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: CELL_FG, lineHeight: "20px" }}>{pctFmt(r.prop * 100)}</div>
                  <div style={{ fontSize: 12, fontWeight: 400, color: CELL_SUB, lineHeight: 1, marginTop: 4 }}>of {fmtM(r.offeringEquity)} equity</div>
                </td>
                {/* Investor Equity — editable input, 180px col, h-36, border #e4e4e7, radius 8 */}
                <td style={tdStyle("right")}>
                  <input
                    type="text"
                    style={inputStyle}
                    value={focusedId === r.id
                      ? String(equityValues[r.id] ?? r.eq)
                      : fmt(equityValues[r.id] ?? r.eq)
                    }
                    onFocus={() => setFocusedId(r.id)}
                    onBlur={() => setFocusedId(null)}
                    onChange={(e) => {
                      const raw = Number(e.target.value.replace(/[^0-9]/g, ""));
                      setEquityValues((prev) => ({ ...prev, [r.id]: isNaN(raw) ? 0 : raw }));
                    }}
                  />
                </td>
                {/* Total Value */}
                <td style={tdStyle("right")}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: CELL_FG, lineHeight: "20px" }}>{fmt(r.tv)}</div>
                </td>
                {/* Annual Cashflow */}
                <td style={tdStyle("right")}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: CELL_FG, lineHeight: "20px" }}>{fmt(r.acf)}</div>
                  <div style={{ fontSize: 12, fontWeight: 400, color: CELL_SUB, lineHeight: 1, marginTop: 4 }}>{r.distributionRate.toFixed(2)}% dist. rate</div>
                </td>
                {/* Monthly Income */}
                <td style={tdStyle("right")}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: CELL_FG, lineHeight: "20px" }}>{fmt(r.mo)}</div>
                </td>
              </tr>
            ))}
            {/* Portfolio Total row — bg #f5f3f2 on all cells, bold #0b111a text */}
            <tr>
              <td style={totalTdStyle("left")}>
                <div style={{ fontSize: 14, fontWeight: 700, color: CELL_FG }}>Portfolio Total</div>
              </td>
              <td style={totalTdStyle("right")} />
              <td style={totalTdStyle("right")}>
                <div style={{ fontSize: 14, fontWeight: 700, color: CELL_FG }}>{fmt(totalEq)}</div>
              </td>
              <td style={totalTdStyle("right")}>
                <div style={{ fontSize: 14, fontWeight: 700, color: CELL_FG }}>{fmt(totalTv)}</div>
              </td>
              <td style={totalTdStyle("right")}>
                <div style={{ fontSize: 14, fontWeight: 700, color: CELL_FG }}>{fmt(totalAcf)}</div>
              </td>
              <td style={totalTdStyle("right")}>
                <div style={{ fontSize: 14, fontWeight: 700, color: CELL_FG }}>{fmt(totalMoI)}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Helper: format millions/thousands ────────────────── */
function fmtM(v) {
  if (!v) return "$0";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

/* ══════════════════════════════════════════════════════
   SECTION 3 — BOOT ANALYSIS
   ══════════════════════════════════════════════════════ */
function BootAnalysisCard({
  exchangeProceeds, cartTotal, unallocated, cashBootOk,
  debtRetiredAtSale, dstDebtShare, debtBootOk, debtShortfall,
  equityRetainedPct, ack, onAck,
}) {
  const allGood = cashBootOk && debtBootOk;

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      {/* Dark header */}
      <div style={{
        background: `linear-gradient(135deg, ${DEEPER} 0%, ${DARK} 100%)`,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: SP.md,
      }}>
        {/* Triangle alert icon */}
        <span style={{ color: allGood ? GREEN : "#f6bc45", display: "flex", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {allGood
              ? <polyline points="20 6 9 17 4 12" />
              : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
            }
          </svg>
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: TW }}>
            Action Needed — Review Your Exchange Completion
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            Address the items below to minimize or eliminate taxable boot.
          </div>
        </div>
      </div>

      {/* Two-column panels */}
      <div style={{ padding: "24px", background: CARD }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SP.lg, marginBottom: SP.lg }}>

          {/* ── Left: Unallocated Equity (Cash Boot) ── */}
          <div style={{
            borderRadius: 10,
            background: cashBootOk ? MINT : "rgba(254,242,242,0.5)",
            border: `1px solid ${cashBootOk ? GREEN + "40" : REDBRD + "80"}`,
            padding: SP.lg,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: cashBootOk ? GREEN : TM,
              textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: SP.md,
            }}>
              {cashBootOk ? "✓ Equity Fully Reinvested" : "Unallocated Equity (Cash Boot)"}
            </div>
            {/* 3 metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SP.md, marginBottom: SP.md }}>
              {[
                { label: "Proceeds to Reinvest", value: fmt(exchangeProceeds) },
                { label: "Amount Allocated",     value: fmt(cartTotal) },
                { label: "Unallocated (Boot)",   value: fmt(unallocated), warn: !cashBootOk },
              ].map(({ label, value, warn }) => (
                <div key={label}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: warn ? RED : TP, marginBottom: 3 }}>{value}</div>
                  <div style={{ fontSize: 10, color: warn ? RED : TM }}>{label}</div>
                </div>
              ))}
            </div>
            {/* Warning text */}
            {!cashBootOk && (
              <div style={{
                background: AMBBG,
                borderLeft: `4px solid ${AMBBRD}`,
                borderRadius: 0,
                padding: 12,
                fontSize: 12,
                fontWeight: 400,
                color: AMB,
                lineHeight: 1.6,
              }}>
                The unallocated <strong>{fmt(unallocated)}</strong> will likely be treated as taxable
                cash boot. Increase your DST allocations to fully reinvest your proceeds.
              </div>
            )}
          </div>

          {/* ── Right: Debt Shortfall (Mortgage Boot) ── */}
          <div style={{
            borderRadius: 10,
            background: debtBootOk || debtRetiredAtSale === 0 ? MINT : "rgba(254,242,242,0.5)",
            border: `1px solid ${debtBootOk ? GREEN + "40" : REDBRD + "80"}`,
            padding: SP.lg,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: debtRetiredAtSale === 0 ? TM : debtBootOk ? GREEN : TM,
              textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: SP.md,
            }}>
              {debtRetiredAtSale === 0
                ? "No Debt Replacement Required"
                : debtBootOk
                  ? "✓ Debt Replacement Satisfied"
                  : "Debt Shortfall (Mortgage Boot)"}
            </div>
            {/* 3 metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: SP.md, marginBottom: SP.md }}>
              {[
                { label: "Debt Retired at Sale", value: debtRetiredAtSale > 0 ? fmt(debtRetiredAtSale) : "None" },
                { label: "DST Debt Share",        value: fmt(dstDebtShare) },
                { label: "Debt Shortfall",        value: fmt(debtShortfall), warn: !debtBootOk && debtRetiredAtSale > 0 },
              ].map(({ label, value, warn }) => (
                <div key={label}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: warn ? RED : TP, marginBottom: 3 }}>{value}</div>
                  <div style={{ fontSize: 10, color: warn ? RED : TM }}>{label}</div>
                </div>
              ))}
            </div>
            {/* Warning text */}
            {!debtBootOk && debtRetiredAtSale > 0 && (
              <div style={{
                background: AMBBG,
                borderLeft: `4px solid ${AMBBRD}`,
                borderRadius: 0,
                padding: 12,
                fontSize: 12,
                fontWeight: 400,
                color: AMB,
                lineHeight: 1.6,
              }}>
                Your DST debt share of {fmt(dstDebtShare)} is {fmt(debtShortfall)} less than your
                retired mortgage. This shortfall may be treated as taxable mortgage boot.{" "}
                <strong>Consult your tax advisor.</strong>
              </div>
            )}
          </div>
        </div>

        {/* Acknowledgment checkbox */}
        <CheckRow
          checked={ack}
          onChange={onAck}
          label="I understand the equity and debt replacement requirements for my 1031 exchange"
          description="Any unallocated equity or debt shortfall may be treated as taxable boot. I have reviewed this analysis with my tax advisor."
        />
      </div>
    </div>
  );
}

/* ── Checkbox row ─────────────────────────────────────── */
function CheckRow({ checked, onChange, label, description }) {
  return (
    <label style={{
      display: "flex",
      alignItems: "flex-start",
      gap: SP.md,
      cursor: "pointer",
      userSelect: "none",
      padding: "16px",
      borderRadius: 8,
      border: `1px solid ${checked ? "#3E8669" : BORD2}`,
      background: checked ? "#DDF9EB" : "#FFFFFF",
    }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <div
          onClick={() => onChange(!checked)}
          style={{
            width: 16, height: 16, borderRadius: 4,
            border: `1px solid ${checked ? "#3E8669" : BORD2}`,
            background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {checked && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#3E8669" strokeWidth="2">
              <polyline points="2 6 5 9 10 3" />
            </svg>
          )}
        </div>
      </div>
      <div>
        <div
          onClick={() => onChange(!checked)}
          style={{ fontSize: 14, fontWeight: 500, color: TYPO.inputLabel.color, lineHeight: "20px" }}
        >
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 12, fontWeight: 400, color: TYPO.hint.color, marginTop: SP.sm, lineHeight: "16px" }}>{description}</div>
        )}
      </div>
    </label>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION 4 — 1031 EXCHANGE BENEFIT ANALYSIS
   ══════════════════════════════════════════════════════ */
function BenefitAnalysisCard({
  oldNOI, rpAnnualIncome, rpAnnualExpenses,
  dstAnnualCF, cashFlowDelta,
  oldAnnualDep, investorDstDep,
  taxSheltered, capitalGainsTax, depRecapture, taxDeferred,
}) {
  const depDelta = investorDstDep - oldAnnualDep;
  const BENEFIT_GREEN = "#3e8669";
  const BENEFIT_GREEN_BG = "#ddf9eb";
  const BENEFIT_RED = RED;
  const BENEFIT_RED_BG = REDBG;

  const cashFlowPositive = cashFlowDelta >= 0;
  const depPositive = taxSheltered > 0 || depDelta >= 0;
  const taxDeferredPositive = taxDeferred > 0;

  const cardBase = (bg = "#f4f4f5") => ({
    flex: 1,
    minWidth: 0,
    background: bg,
    borderRadius: 8,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    textAlign: "center",
  });

  const StatCard = ({ value, label, color = "#0b111a", bg = "#f4f4f5", showInfo = false }) => (
    <div style={cardBase(bg)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%" }}>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: "24px", color }}>{value}</div>
        {showInfo && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color }}>{label}</div>
    </div>
  );

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{
        background: "#1d2837",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <span style={{ color: TW, display: "flex", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
        </span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TW, lineHeight: "24px" }}>1031 Exchange Benefit Analysis</div>
          <div style={{ fontSize: 14, fontWeight: 400, color: "#d4d4d4", marginTop: 2, lineHeight: 1 }}>
            Income, depreciation, and tax deferral comparison — before vs. after your exchange
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 28px", background: CARD, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: TP, lineHeight: "24px", marginBottom: 12 }}>Annual Cash Flow Comparison</div>
          <div style={{ display: "flex", gap: 16 }}>
            <StatCard value={fmt(oldNOI)} label="Relinquished Property NOI" showInfo />
            <StatCard value={fmt(dstAnnualCF)} label="DST Portfolio Cash Flow" showInfo />
            <StatCard
              value={`${cashFlowDelta >= 0 ? "+" : ""}${fmt(cashFlowDelta)}`}
              label={`Annual Cash Flow ${cashFlowPositive ? "Increase" : "Decrease"}`}
              color={cashFlowPositive ? BENEFIT_GREEN : BENEFIT_RED}
              bg={cashFlowPositive ? BENEFIT_GREEN_BG : BENEFIT_RED_BG}
            />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${DIVIDER}` }} />

        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TP, lineHeight: "24px", marginBottom: 12 }}>Depreciation Shelter</div>
          <div style={{ display: "flex", gap: 16 }}>
            <StatCard value={fmt(Math.round(oldAnnualDep))} label="Old Property (est.)" showInfo />
            <StatCard value={fmt(Math.round(investorDstDep))} label="DST Portfolio (est.)" showInfo />
            <StatCard
              value={fmt(taxSheltered)}
              label="Est. Tax-Sheltered Cash Flow"
              color={depPositive ? BENEFIT_GREEN : BENEFIT_RED}
              bg={depPositive ? BENEFIT_GREEN_BG : BENEFIT_RED_BG}
              showInfo
            />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${DIVIDER}` }} />

        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TP, lineHeight: "24px", marginBottom: 12 }}>Tax Deferral Benefit</div>
          <div style={{ display: "flex", gap: 16 }}>
            <StatCard value={fmt(capitalGainsTax)} label="Capital Gains Tax" />
            <StatCard value={fmt(depRecapture)} label="Depreciation Recapture" />
            <StatCard
              value={fmt(taxDeferred)}
              label={taxDeferredPositive ? "Total Tax Deferred" : "No Tax Deferred"}
              color={taxDeferredPositive ? BENEFIT_GREEN : BENEFIT_RED}
              bg={taxDeferredPositive ? BENEFIT_GREEN_BG : BENEFIT_RED_BG}
            />
          </div>
          <div style={{ fontSize: 14, fontWeight: 400, color: TS, lineHeight: "20px", marginTop: 12 }}>
            Deferred today — not eliminated. Tax becomes due when your DSTs are sold unless you do another 1031 or step-up at death.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small reusable pieces ────────────────────────────── */
function Metric({ label, value, sub, valueColor = TP }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: TM, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: valueColor, letterSpacing: "-0.01em" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: TM, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function DeltaBox({ value, label }) {
  const pos = value >= 0;
  return (
    <div style={{
      padding: "10px 12px",
      background: pos ? `${GREEN}08` : REDBG,
      border: `1px solid ${pos ? GREEN + "25" : REDBRD + "60"}`,
      borderRadius: 8,
    }}>
      <div style={{ fontSize: 10, color: pos ? GREEN : RED, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: pos ? GREEN : RED }}>
        {pos ? "+" : ""}{fmt(value)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════ */
function PageFooter() {
  const [activeTab, setActiveTab] = useState("general");

  const disclosureTabs = [
    { id: "general",    label: "General Disclosures" },
    { id: "dst",        label: "DST & Private Placements" },
    { id: "exchange",   label: "1031 Exchange" },
    { id: "regbi",      label: "Reg BI & Conflicts" },
    { id: "privacy",    label: "Privacy & Data" },
  ];

  const disclosureText = {
    general: "Broker-Dealer Registration. Stax Capital, Inc. is registered as a broker-dealer with the U.S. Securities and Exchange Commission (SEC) and is a member of FINRA and SIPC. Registration does not imply a certain level of skill or training. The DST Hub platform is operated solely by Stax Capital in its capacity as an introducing broker-dealer. We do not hold customer funds or securities; all assets are held through qualified custodians and product sponsors.\n\nNot Investment Advice. Nothing on this website, the DST Hub platform, or any associated materials constitutes investment advice, legal advice, tax advice, or accounting advice. Content displayed — including property descriptions, projected return illustrations, and sponsor information — is sourced from third-party offering documents and has not been independently verified by Stax Capital. All figures are projections only; actual results will differ materially. Consult your own qualified legal, tax, and financial advisors before making any investment decision.",
    dst: "DST & Private Placements. Delaware Statutory Trust (DST) interests are securities offered under Regulation D of the Securities Act of 1933 and have not been registered with the SEC or any state securities commission. These investments are available only to accredited investors as defined under Rule 501(a) of Regulation D. DST investments are illiquid, long-term in nature, and subject to significant risk including loss of principal.",
    exchange: "1031 Exchange. A 1031 exchange allows investors to defer capital gains taxes by reinvesting proceeds from the sale of a qualified property into like-kind replacement properties. IRS rules require identification of replacement properties within 45 days and closing within 180 days. Failure to meet these deadlines may result in taxable boot. Consult a qualified intermediary and tax advisor before initiating a 1031 exchange.",
    regbi: "Regulation Best Interest. Stax Capital, Inc. operates under the SEC's Regulation Best Interest (Reg BI) standard when making recommendations to retail customers. Our registered representatives are required to act in the best interest of the retail customer at the time a recommendation is made. Form CRS disclosures are available upon request and on our website.",
    privacy: "Privacy & Data. Stax Capital is committed to protecting the privacy and security of your personal information. We collect information necessary to provide our services and comply with applicable laws. We do not sell personal data to third parties. For our full Privacy Policy, please visit our website.",
  };

  const dstHubLinks = ["Open Account", "DST Marketplace", "1031 Exchange Tools", "Upload Documents"];
  const complianceLinks = ["Form CRS", "Reg BI Disclosure", "Privacy Notice", "Business Continuity", "Terms of Use"];
  const resourceLinks = ["About Stax Capital", "DST Education", "1031 Exchange Guide", "Contact Us"];

  return (
    <footer style={{ fontFamily: FONT }}>
      {/* Regulatory bar */}
      <div style={{
        background: DEEPER, borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "10px 40px",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        {[
          { dot: true, label: "Member FINRA" },
          { dot: true, label: "Member SIPC" },
          { dot: true, label: "SEC-Registered Broker-Dealer" },
          { dot: true, label: "CRD #315430" },
        ].map(({ label }, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {i > 0 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, marginRight: 3 }}>·</span>}
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6ec6b5", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Main footer */}
      <div style={{ background: DARK, padding: "40px 40px 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 40 }}>

          {/* Column 1: Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 5, background: "#4a7c6f",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 11L8 5l5 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: TW, letterSpacing: "0.02em" }}>
                STAX<span style={{ color: "#6ec6b5", marginLeft: 2 }}>AI</span>
              </span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 12 }}>
              DST &amp; 1031 Exchange Specialists
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, marginBottom: 4 }}>
              844-427-1031
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, marginBottom: 4 }}>
              info@staxai.com
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, marginBottom: 16 }}>
              2262 Carmel Valley Rd, Suite G · Del Mar, CA 92014
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: 5,
              padding: "5px 10px", cursor: "pointer",
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>FINRA</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>BrokerCheck</span>
            </div>
          </div>

          {/* Column 2: DST Hub */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
              DST Hub
            </div>
            {dstHubLinks.map((link) => (
              <div key={link} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1, marginBottom: 12, cursor: "pointer" }}>
                {link}
              </div>
            ))}
          </div>

          {/* Column 3: Compliance */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
              Compliance
            </div>
            {complianceLinks.map((link) => (
              <div key={link} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1, marginBottom: 12, cursor: "pointer" }}>
                {link}
              </div>
            ))}
          </div>

          {/* Column 4: Resources */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
              Resources
            </div>
            {resourceLinks.map((link) => (
              <div key={link} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1, marginBottom: 12, cursor: "pointer" }}>
                {link}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclosure tabs */}
      <div style={{ background: "#0e1828", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {disclosureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 14px", border: "none", cursor: "pointer",
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                  background: "transparent",
                  color: activeTab === tab.id ? TW : "rgba(255,255,255,0.35)",
                  borderBottom: activeTab === tab.id ? `1px solid ${GREEN}` : "1px solid transparent",
                  textTransform: "uppercase",
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "20px 0 32px" }}>
            {disclosureText[activeTab].split("\n\n").map((para, i) => (
              <p key={i} style={{
                fontSize: 10, color: "rgba(255,255,255,0.3)",
                lineHeight: 1.7, margin: i > 0 ? "12px 0 0" : 0,
              }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
