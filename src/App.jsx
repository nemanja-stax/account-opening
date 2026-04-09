/*
 * DST Onboarding Application - v1.2
 * Stax Capital, Inc. | FINRA Member & SEC Registered Broker-Dealer
 * Updated: 2026-03-11
 * Changes: Brand Guide v2.0 token alignment, QA scenario fixes,
 *          UX refinements across all steps, CSS + Rep-Initiated
 *          workflow improvements.
 * Bugs fixed: horizon-mismatch flag string comparison, controlPerson.name
 *             trim check, canProceed(3) hasTrustedContact evaluation,
 *             co-applicant SSN zeros block flag, parseDate calendar validation.
 */
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   STAX CAPITAL — DST ONBOARDING APPLICATION v1.0
   Production-Ready · Compliance-First · Investor-Grade UX
   Dual-Workflow (Rep-Initiated + Client Self-Service)
   Marketplace · Cart · Financial Statement · Account Opening
   Disclosures · Review & Sign · Compliance Review · Reg BI · QC · Audit
   ═══════════════════════════════════════════════════════════════════ */

/* --- STAX CAPITAL VANTAGE - Brand Guide v2.0 --- */
/* Phase 3: Full token replacement with backward-compat aliases */
const NAVY = { 950:"#0c1520", 900:"#111d2e", 700:"var(--secondary-foreground)", 600:"var(--primary)", 500:"#36455a" };
const GOLD = { 700:"var(--primary)", 800:"#5b5750", 600:"#9b958b", 500:"#a09a90" };
const GREEN = { 600:"var(--success)" };
const NEUTRAL = { white:"var(--primary-foreground)", offWhite:"#faf9f6", 100:"var(--muted)", 200:"var(--secondary)", 300:"var(--border)" };
const TEXT = { primary:"var(--foreground)", secondary:"var(--muted-foreground)", muted:"var(--text-muted)" };
const C = {
  pageBg:"#faf9f6", cardBg:"var(--card)", sectionBg:"var(--muted)", inputBg:"var(--secondary)",
  darkBg:"#111d2e", deepestBg:"#0c1520",
  textPrimary:"var(--foreground)", textSecondary:"var(--muted-foreground)", textMuted:"var(--text-muted)",
  textOnDark:"var(--primary-foreground)", textOnDarkMuted:"rgba(255,255,255,0.55)",
  border:"var(--border)", borderDark:"var(--card-foreground)",
  ctaBg:"var(--primary)", ctaBorder:"#5b5750", ctaHover:"#6b6560",
  categoryGreen:"var(--success)", categoryBg:"var(--success-background)",
  success:"var(--success)", successBg:"var(--success-background)",
  warning:"var(--warning)", warningBg:"var(--warning-background)", warningBorder:"var(--warning-border)",
  error:"var(--destructive-text)", errorBg:"var(--destructive-background)", errorBorder:"var(--destructive-border)",
  info:"var(--info)", infoBg:"var(--info-background)", infoBorder:"var(--info-border)",
  focusRing:"rgba(50, 107, 82, 0.20)",
};
/* Backward-Compatible Aliases - all existing G/N/T/A references continue to work */
const G = {
  primary:"#0c1520", darkest:"#0c1520", dark2:"#111d2e", deep:"var(--secondary-foreground)", light:"var(--card-foreground)",
  forest:"#326b52", medium:"#326b52", mint:"var(--success-background)", mintDark:"#d0edd9",
  tertiary:"#0B271B", accent:"#111d2e", deepest:"#0c1520", textDark:"var(--secondary-foreground)", card:"var(--secondary-foreground)",
};
const N = {
  bg:"#faf9f6", bgAlt:"var(--muted)", bgAlt2:"#ebebec", neutral:"var(--secondary)", card:"var(--card)",
  almostBlack:"#131313", darkBluGray:"var(--secondary-foreground)", darkBg:"#0c1520", medBluGray:"var(--card-foreground)",
  darkSec:"#111d2e", textGray:"var(--secondary-foreground)", secondaryText:"var(--muted-foreground)", mutedText:"var(--text-muted)",
  border:"var(--border)", section:"var(--muted)", divider:"var(--border)",
};
const T = { primary:"var(--foreground)", body:"var(--muted-foreground)", muted:"var(--text-muted)", light:"var(--text-light)", white:"var(--primary-foreground)", dim:"#d1d5dc" };
const A = {
  coral:"#ef6b51", gold:"#7c766e", goldDark:"#5b5750", red:"#dc2626", blue:"#2563eb",
  amber:"#f59e0b", teal:"#0d9488", green:"#059669", greenPill:"#326b52",
};
const OV = {
  whiteLt:"rgba(255,255,255,0.08)", whiteMed:"rgba(255,255,255,0.1)", darkGreen:"rgba(7,41,28,0.7)",
  greenTint:"rgba(62,77,70,0.2)", borderAccent:"rgba(239,107,81,0.38)", borderPrimary:"rgba(62,97,83,0.5)",
  borderSubtle:"rgba(18,38,23,0.06)", textMuted:"rgba(0,0,0,0.43)",
};
/* Typography - Inter only per Brand Guide v2.0 */
const FONT  = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const FONT2 = FONT; /* v1.2: FONT2 removed, aliased to FONT (Golos Text dropped) */
const TYPE = { xs:11, sm:12, base:13, md:14, lg:16, xl:20, xxl:26, normal:400, medium:500, semibold:600, bold:700, extrabold:600 };
const WIDGET_HDR = `linear-gradient(135deg, ${G.darkest} 0%, ${G.deep} 100%)`;

/* ─── Institutional SVG Icons (Feather-style, 16×16 stroke) ─── */
const mk = paths => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: paths }}/>;
const IC = {
  fileText:    mk('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>'),
  tag:         mk('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
  building:    mk('<rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><rect x="9" y="12" width="6" height="10"/><rect x="7" y="6" width="3" height="3"/><rect x="14" y="6" width="3" height="3"/><rect x="7" y="10" width="3" height="2"/><rect x="14" y="10" width="3" height="2"/>'),
  barChart:    mk('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>'),
  dollarSign:  mk('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  landmark:    mk('<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>'),
  home:        mk('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  briefcase:   mk('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/>'),
  alertTriangle: mk('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
  calendar:    mk('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  calculator:  mk('<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/>'),
  trendingUp:  mk('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
  shield:      mk('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  user:        mk('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  users:       mk('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  flag:        mk('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),
  file:        mk('<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>'),
  lock:        mk('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  refreshCw:   mk('<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'),
  creditCard:  mk('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),
  edit:        mk('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
  lightbulb:   mk('<line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>'),
  scale:       mk('<line x1="12" y1="1" x2="12" y2="3"/><path d="M17 5H7"/><path d="M3 5l4 8H3"/><path d="M17 5l4 8h-4"/><path d="M3 13c0 2.2 1.8 4 4 4s4-1.8 4-4"/><path d="M17 13c0 2.2 1.8 4 4 4s4-1.8 4-4"/><line x1="7" y1="21" x2="17" y2="21"/>'),
  exchange:    mk('<path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>'),
  info:        mk('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'),
  cart:        mk('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'),
  arrowRight:  mk('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
  phone:       mk('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>'),
};
const ValidationCtx = React.createContext(false);

/* ─── Brand Logo ─── */
const STAX_AI_LOGO = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTY1IiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTY1IDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGNsaXBQYXRoIGlkPSJjIj48cmVjdCB3aWR0aD0iMTY1IiBoZWlnaHQ9IjQwIiBmaWxsPSJ3aGl0ZSIvPjwvY2xpcFBhdGg+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImcxIiB4MT0iMCIgeTE9IjIwIiB4Mj0iNTQiIHkyPSIyMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIiBzdG9wLW9wYWNpdHk9IjAuMzgiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyBjbGlwLXBhdGg9InVybCgjYykiPgogICAgPHBhdGggZD0iTTEuMDY2OTYgOS43MDAyNUw3LjMwODY2IDMuNDU2MzZDNy44OTU0OSAyLjg2OTMzIDguODU1NzUgMi44NjkzMyA5LjQ0MjU4IDMuNDU2MzZMMjEuNDk5MiAxNS41MTcyQzIyLjA4NiAxNi4xMDQyIDIyLjA4NiAxNy4wNjQ4IDIxLjQ5OTIgMTcuNjUxOUwxNS4yNTc1IDIzLjg5NTdDMTQuNjcwNyAyNC40ODI4IDEzLjcxMDQgMjQuNDgyOCAxMy4xMjM2IDIzLjg5NTdMMS4wNjY5NiAxMS44MzQ5QzAuNDgwMTMxIDExLjI0NzkgMC40ODAxMzEgMTAuMjg3MyAxLjA2Njk2IDkuNzAwMjVaIiBmaWxsPSJ1cmwoI2cxKSIvPgogICAgPHBhdGggZD0iTTE2LjExMDkgMjQuNzUwMUwyMi4zNTI2IDE4LjUwNjJDMjIuOTM5NCAxNy45MTkxIDIzLjg5OTcgMTcuOTE5MSAyNC40ODY1IDE4LjUwNjJMMzYuNTQzMiAzMC41NjdDMzcuMTMgMzEuMTU0IDM3LjEzIDMyLjExNDYgMzYuNTQzMiAzMi43MDE3TDMwLjMwMTQgMzguOTQ1NkMyOS43MTQ2IDM5LjUzMjYgMjguNzU0NCAzOS41MzI2IDI4LjE2NzUgMzguOTQ1NkwxNi4xMTA5IDI2Ljg4NDdDMTUuNTI0MSAyNi4yOTc3IDE1LjUyNDEgMjUuMzM3MSAxNi4xMTA5IDI0Ljc1MDFaIiBmaWxsPSJ1cmwoI2cxKSIvPgogICAgPHBhdGggZD0iTTE3LjQ2OTMgNy4zMDc2N0wyMy43MTEgMS4wNjM3OEMyNC4yOTc4IDAuNDc2NzUxIDI1LjI1ODEgMC40NzY3NTEgMjUuODQ0OSAxLjA2Mzc4TDM3LjkwMTYgMTMuMTI0NkMzOC40ODg0IDEzLjcxMTcgMzguNDg4NCAxNC42NzIzIDM3LjkwMTYgMTUuMjU5M0wzMS42NTk4IDIxLjUwMzJDMzEuMDczIDIyLjA5MDIgMzAuMTEyOCAyMi4wOTAyIDI5LjUyNTkgMjEuNTAzMkwxNy40NjkzIDkuNDQyMzNDMTYuODgyNSA4Ljg1NTMgMTYuODgyNSA3Ljg5NDcgMTcuNDY5MyA3LjMwNzY3WiIgZmlsbD0idXJsKCNnMSkiLz4KICAgIDxwYXRoIGQ9Ik0zMi41MTMyIDIyLjM1NzVMMzguNzU1IDE2LjExMzZDMzkuMzQxOCAxNS41MjY2IDQwLjMwMiAxNS41MjY2IDQwLjg4ODkgMTYuMTEzNkw1Mi45NDU1IDI4LjE3NDRDNTMuNTMyMyAyOC43NjE1IDUzLjUzMjMgMjkuNzIyMSA1Mi45NDU1IDMwLjMwOTFMNDYuNzAzOCAzNi41NTNDNDYuMTE3IDM3LjE0IDQ1LjE1NjcgMzcuMTQgNDQuNTY5OSAzNi41NTNMMzIuNTEzMiAyNC40OTIxQzMxLjkyNjQgMjMuOTA1MSAzMS45MjY0IDIyLjk0NDUgMzIuNTEzMiAyMi4zNTc1WiIgZmlsbD0id2hpdGUiLz4KICAgIDwhLS0gU1RBWCBib2xkIHdoaXRlIC0tPgogICAgPHRleHQgeD0iNjQiIHk9IjI3LjUiCiAgICAgIGZvbnQtZmFtaWx5PSJJbnRlciwtYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCxzYW5zLXNlcmlmIgogICAgICBmb250LXNpemU9IjE3IiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMiIgZmlsbD0id2hpdGUiPlNUQVg8L3RleHQ+CiAgICA8IS0tIEFJIG11dGVkIHdhcm0sIGltbWVkaWF0ZWx5IGFmdGVyIFNUQVgg4oCUIG5vIGdhcCwgbm8gZGl2aWRlciAtLT4KICAgIDx0ZXh0IHg9IjExMiIgeT0iMjcuNSIKICAgICAgZm9udC1mYW1pbHk9IkludGVyLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LHNhbnMtc2VyaWYiCiAgICAgIGZvbnQtc2l6ZT0iMTciIGZvbnQtd2VpZ2h0PSI0MDAiIGxldHRlci1zcGFjaW5nPSIyIiBmaWxsPSIjYThhMjllIj5BSTwvdGV4dD4KICA8L2c+Cjwvc3ZnPg==";

/* ─── Formatters ─── */
const fmtM = n => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n}`;
const fmtFull = n => `$${Math.round(n).toLocaleString()}`;
const pct = n => `${n.toFixed(2)}%`;
const scoreColor = s => s >= 4.0 ? G.forest : s >= 3.5 ? A.teal : s >= 3.0 ? A.amber : A.red;
const fmtCurrency = val => { if (!val && val !== 0) return ""; return Math.round(Number(val)).toLocaleString(); };
const parseCurrency = str => parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;

/* ─── Input Mask Utilities ─── */
const fmtPhone = (raw = "") => {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
};
const fmtSSN = (raw = "") => {
  const d = raw.replace(/\D/g, "").slice(0, 9);
  if (d.length < 4) return d;
  if (d.length < 6) return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,5)}-${d.slice(5)}`;
};
const fmtZip = (raw = "") => raw.replace(/\D/g, "").slice(0, 5);
const fmtRouting = (raw = "") => raw.replace(/\D/g, "").slice(0, 9);
const fmtDate = (raw = "") => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0,2) + "/" + d.slice(2);
  return d.slice(0,2) + "/" + d.slice(2,4) + "/" + d.slice(4);
};
const fmtEIN = (raw = "") => {
  const d = raw.replace(/\D/g, "").slice(0, 9);
  if (d.length <= 2) return d;
  return d.slice(0,2) + "-" + d.slice(2);
};

/* ─── Date Helpers ─── */
/* v1.2 fix: validate actual calendar days (catches Feb 30, Apr 31, etc.) */
const parseDate = (str) => {
  const d = (str || "").replace(/\D/g, "");
  if (d.length !== 8) return null;
  const m = parseInt(d.slice(0,2),10), day = parseInt(d.slice(2,4),10), y = parseInt(d.slice(4),10);
  if (m < 1 || m > 12 || day < 1 || day > 31 || y < 1900 || y > 2099) return null;
  const _dt = new Date(y, m - 1, day);
  if (_dt.getMonth() !== m - 1 || _dt.getDate() !== day) return null;
  return _dt;
};
const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const fmtDateObj = (d) => `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()}`;
const calcAge = (dobStr) => {
  const d = parseDate(dobStr);
  if (!d) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  if (today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())) age--;
  return age;
};
const daysUntil = (dateStr) => {
  const d = parseDate(dateStr);
  if (!d) return null;
  return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
};

/* ─── State Tax Rates ─── */
const STATE_TAX_RATES = {
  "Alabama":5.0,"Alaska":0,"Arizona":2.5,"Arkansas":4.4,"California":13.3,"Colorado":4.4,
  "Connecticut":6.99,"Delaware":6.6,"Florida":0,"Georgia":5.49,"Hawaii":11.0,"Idaho":5.8,
  "Illinois":4.95,"Indiana":3.05,"Iowa":5.7,"Kansas":5.7,"Kentucky":4.5,"Louisiana":4.25,
  "Maine":7.15,"Maryland":5.75,"Massachusetts":5.0,"Michigan":4.25,"Minnesota":9.85,
  "Mississippi":5.0,"Missouri":4.95,"Montana":6.75,"Nebraska":6.64,"Nevada":0,
  "New Hampshire":0,"New Jersey":10.75,"New Mexico":5.9,"New York":10.9,
  "North Carolina":4.5,"North Dakota":2.5,"Ohio":0,"Oklahoma":4.75,"Oregon":9.9,
  "Pennsylvania":3.07,"Rhode Island":5.99,"South Carolina":6.5,"South Dakota":0,
  "Tennessee":0,"Texas":0,"Utah":4.65,"Vermont":8.75,"Virginia":5.75,
  "Washington":0,"West Virginia":6.5,"Wisconsin":7.65,"Wyoming":0,"District of Columbia":10.75,
};

/* ─── Data ─── */
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","District of Columbia"
];

const OCCUPATIONS = [
  "Accountant/CPA","Attorney/Legal","Business Owner","Clergy/Religious","Consultant",
  "Doctor/Physician","Educator/Professor","Engineer","Executive/C-Suite",
  "Financial Professional","Government Employee","Healthcare Professional","Homemaker",
  "IT/Technology","Manager/Director","Military/Veterans","Nurse/NP/PA","Pharmacist",
  "Real Estate Professional","Retired","Sales/Marketing","Scientist/Researcher",
  "Small Business Owner","Student","Other Professional",
];

const ACCOUNT_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "joint", label: "Joint (JTWROS)" },
  { value: "joint_tenants_common", label: "Joint (Tenants in Common)" },
  { value: "ira_traditional", label: "IRA — Traditional" },
  { value: "ira_roth", label: "IRA — Roth" },
  { value: "ira_sep", label: "IRA — SEP" },
  { value: "tod", label: "Transfer on Death (TOD)" },
  { value: "trust", label: "Trust" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation (C or S Corp)" },
  { value: "partnership", label: "Partnership (LP/GP)" },
];

const INVESTMENT_TYPES = [
  "Mutual Funds / ETFs","Individual Stocks","Bonds/Fixed Income",
  "Options/Derivatives","1031 Exchange/DSTs","Annuities",
  "Alternative Investments","Margin/Leveraged Products",
];

const INVESTMENT_OBJECTIVES = [
  "Generate income for current or future expenses",
  "Partially fund my retirement",
  "Wholly fund my retirement",
  "Steadily accumulate wealth over the long term",
  "Preserve wealth and pass it on to my heirs",
  "Pay for education",
  "Pay for a house",
  "Market speculation",
  "Benefit of Heirs",
];

/* ─── DST Offerings — Real PPM Data ─── */
const DST_OFFERINGS = [
  {
    id: "passco-prism", name: "Passco Prism DST", shortName: "Passco Prism",
    address: "1100 Prism Place, Moon Township, PA 15108", location: "Moon Township, PA",
    sponsor: "Passco", structure: "Private Placement",
    propertyType: "Multifamily — Class A", propertyTypeShort: "Multifamily",
    yearBuilt: "2023", units: 336, occupancy: 97.91,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    compositeScore: 3.80, ddScore: 76, recommendation: "Approve", reportDate: "Jul 7, 2025",
    totalOffering: 107874000, offeringEquity: 59000000, loanAmount: 48874000,
    loanTerms: "Fannie Mae | 5.08% | 10-Yr (7 Yr IO)", leverage: 45.31,
    goingInCap: 5.20, cashOnCash: 4.30, targetIRR: 8.0, totalReturn: 70.0,
    holdPeriod: "~10 Years", distributionRate: 4.30, dscr: 1.55,
    minInvestment: 100000, minCash: 25000,
    appraisedValue: 107874000, acquisitionCost: 102962055,
    strengths: [
      "336-unit Class A community, 2023 construction",
      "97.91% occupancy at closing — immediate cash flow",
      "Fannie Mae financing at 45.31% LTV, 7-yr interest only",
      "Pittsburgh MSA — 9 Fortune 500 HQs, top tech talent hub",
      "Median household income ~$114,400 within 1-mile radius",
    ],
    weaknesses: [
      "Selling commissions up to 5.0% + offering expenses",
      "Pittsburgh MSA shows slight population decline (-1.90% 2020–2025)",
      "Distributions may use reserves in early years",
    ],
    opportunities: [
      "Pittsburgh ranked #1 best place to live in PA (U.S. News 2024-25)",
      "UPMC/Highmark/CMU employer base drives stable rental demand",
      "Greystar property management — institutional-quality execution",
    ],
    threats: [
      "No public market for interests — illiquid investment",
      "Loan maturity risk if market rates remain elevated at refinance",
      "Real estate values may decline",
    ],
    riskFactors: [
      "Speculative, illiquid investment — potential loss of entire investment",
      "Distributions not guaranteed; may be funded from reserves",
      "Trust is inflexible vehicle — no voting rights for investors",
      "Leverage increases risk; loan must be refinanced or property sold",
      "Master Lease with Passco affiliate — conflicts of interest",
    ],
    fees: { acquisitionFee: "Advisory fee 2.4% of purchase price", assetMgmt: "Included in Master Lease", dispositionFee: "N/A", sellingCommission: "Up to 5.0%" },
    sponsorBackground: "Passco Companies is a vertically integrated real estate company with over $4B in AUM. Founded in 1998, Passco specializes in the acquisition, ownership, and management of multifamily and industrial real estate assets throughout the United States.",
    hardFlags: [],
    highlights: [
      "336 units · Class A · 2023 Build",
      "97.91% occupancy at closing",
      "Fannie Mae | 5.08% | 7-yr IO",
      "Pittsburgh MSA — 9 Fortune 500 HQs",
      "Min $25K cash / $100K 1031",
    ],
    status: "Open",
    cashFlows: [
      { yr: 1, egr: null, noi: null, ncf: 2537000, yld: 4.30 },
      { yr: 5, egr: null, noi: null, ncf: 2773300, yld: 4.70 },
      { yr: 10, egr: null, noi: null, ncf: 2831300, yld: 4.79 },
    ],
    dispositionScenarios: [
      { cap: "4.75%", totalReturn: "~90%" },
      { cap: "5.00%", totalReturn: "~80%" },
      { cap: "5.25% (base)", totalReturn: "~70%" },
      { cap: "5.50%", totalReturn: "~60%" },
    ],
    scoringModules: [
      { name: "Acquisition Analysis", weight: "20%", score: 4.00, rating: "Good", wtd: 0.800 },
      { name: "Disposition Analysis", weight: "10%", score: 3.50, rating: "Good", wtd: 0.350 },
      { name: "Fee Analysis", weight: "15%", score: 3.25, rating: "Average", wtd: 0.490 },
      { name: "Underwriting", weight: "10%", score: 3.80, rating: "Good", wtd: 0.380 },
      { name: "Risk Summary", weight: "10%", score: 3.75, rating: "Good", wtd: 0.375 },
      { name: "Location / Market", weight: "8%", score: 4.00, rating: "Good", wtd: 0.320 },
      { name: "Sponsor Track Record", weight: "12%", score: 4.25, rating: "Good", wtd: 0.510 },
    ],
  },
  {
    id: "nexpoint-outlook", name: "NexPoint Outlook DST", shortName: "NexPoint Outlook",
    address: "Outlook at Greystone, Birmingham, AL (SE Submarket)", location: "Birmingham, AL",
    sponsor: "NexPoint", structure: "Private Placement",
    propertyType: "Multifamily — Class A Value-Add", propertyTypeShort: "Multifamily",
    yearBuilt: "2008", units: 300, occupancy: 94.7,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    compositeScore: 3.65, ddScore: 73, recommendation: "Approve", reportDate: "Nov 2025",
    totalOffering: 65603006, offeringEquity: 32903006, loanAmount: 32700000,
    loanTerms: "Freddie Mac | 4.67% Fixed | 10-Yr IO", leverage: 49.9,
    goingInCap: 5.50, cashOnCash: 4.44, targetIRR: 7.5, totalReturn: 60.0,
    holdPeriod: "7–10 Years", distributionRate: 4.44, dscr: 1.48,
    minInvestment: 100000, minCash: 100000,
    appraisedValue: 65000000, acquisitionCost: 58100999,
    strengths: [
      "300-unit Class A, Greystone — Birmingham's most affluent submarket",
      "94.7% leased as of Nov 3, 2025",
      "Value-add program: 38 full renovations + 185 partial upgrades",
      "Highway 280 access (68,000 VPD) — exceptional connectivity",
      "Avg home value $615K, median HHI $128K within 1-mile radius",
    ],
    weaknesses: [
      "Built 2008 — value-add capex required (risk of budget overrun)",
      "49.9% leverage — higher debt service burden",
      "Birmingham MSA population growth modest",
    ],
    opportunities: [
      "3% rent premium achievable post-full renovation vs. partial",
      "W/D installation in 126 units drives $45/mo incremental rent",
      "UAB medical/healthcare employment base — recession-resilient demand",
    ],
    threats: [
      "No public market for interests — illiquid investment",
      "Renovation execution risk and cost overruns",
      "Single-market concentration in Birmingham, AL",
    ],
    riskFactors: [
      "Highly speculative, illiquid investment — potential full loss",
      "Distributions not guaranteed; dependent on Master Tenant performance",
      "Demand Note funding structure introduces sponsor-credit risk",
      "Rent Restricted Units required by lender limit revenue upside",
      "Conflicts of interest between Sponsor, Master Tenant, and Manager",
    ],
    fees: { acquisitionFee: "Facilitation Fee $817,500", assetMgmt: "Included in Master Lease", dispositionFee: "N/A", sellingCommission: "Per PPM distribution plan" },
    sponsorBackground: "NexPoint Real Estate Advisors IV, L.P. is an affiliate of NexPoint Advisors, a multi-billion dollar alternative asset manager managing $5.2B in multifamily assets as of September 30, 2025. NexPoint Securities, Inc. (FINRA member) serves as Managing Broker-Dealer.",
    hardFlags: [],
    highlights: [
      "300 units · Class A · Value-Add",
      "94.7% leased at acquisition",
      "Freddie Mac | 4.67% | 10-Yr IO",
      "SE Birmingham / Greystone submarket",
      "Min $100K cash or 1031",
    ],
    status: "Open",
    cashFlows: [
      { yr: 1, egr: null, noi: null, ncf: 1460893, yld: 4.44 },
      { yr: 3, egr: null, noi: null, ncf: 1519329, yld: 4.62 },
      { yr: 5, egr: null, noi: null, ncf: 1583004, yld: 4.81 },
    ],
    dispositionScenarios: [
      { cap: "5.00%", totalReturn: "~80%" },
      { cap: "5.50% (base)", totalReturn: "~60%" },
      { cap: "6.00%", totalReturn: "~42%" },
    ],
    scoringModules: [
      { name: "Acquisition Analysis", weight: "20%", score: 3.75, rating: "Good", wtd: 0.750 },
      { name: "Value-Add Execution", weight: "15%", score: 3.50, rating: "Good", wtd: 0.525 },
      { name: "Fee Analysis", weight: "15%", score: 3.25, rating: "Average", wtd: 0.490 },
      { name: "Underwriting", weight: "10%", score: 3.50, rating: "Good", wtd: 0.350 },
      { name: "Risk Summary", weight: "10%", score: 3.50, rating: "Good", wtd: 0.350 },
      { name: "Location / Market", weight: "8%", score: 3.75, rating: "Good", wtd: 0.300 },
      { name: "Sponsor Track Record", weight: "12%", score: 4.00, rating: "Good", wtd: 0.480 },
    ],
  },
  {
    id: "pg-manchester", name: "PG Manchester Industrial DST", shortName: "PG Manchester",
    address: "36 Industrial Drive, Londonderry, NH 03053", location: "Londonderry, NH",
    sponsor: "Peachtree", structure: "Private Placement",
    propertyType: "Industrial NNN — Tesla Service Center", propertyTypeShort: "Industrial",
    yearBuilt: "2025 (BTS)", units: null, occupancy: 100,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    compositeScore: 4.05, ddScore: 81, recommendation: "Approve", reportDate: "Dec 30, 2025",
    totalOffering: 28113527, offeringEquity: 28113527, loanAmount: 0,
    loanTerms: "No Institutional Mortgage | Sponsor Loan $2.06M (subordinate)", leverage: 0,
    goingInCap: 6.02, cashOnCash: 5.03, targetIRR: 7.5, totalReturn: 55.0,
    holdPeriod: "~15 Years (lease maturity 3/31/2040)", distributionRate: 5.03, dscr: null,
    minInvestment: 100000, minCash: 100000,
    appraisedValue: 23500000, acquisitionCost: 23500000,
    strengths: [
      "100% NNN lease — Tesla, Inc. (NASDAQ: TSLA) through March 31, 2040",
      "Investment-grade tenant; Tesla market cap >$1 trillion",
      "3% annual rent escalations built into 15-year lease",
      "Build-to-suit construction: 50,985 SF, latest-gen Tesla design",
      "Substantially debt-free — minimal leverage risk vs. typical DSTs",
    ],
    weaknesses: [
      "Single-tenant concentration — 100% dependent on Tesla",
      "Offering price $28.1M vs. acquisition $23.5M — ~20% premium/load",
      "Limited re-leasing alternatives given specialized build-out",
      "Tesla tariff risk and EV market uncertainty",
    ],
    opportunities: [
      "One of only two Tesla service centers in New Hampshire",
      "Regional service radius complements Boston-area sites",
      "EV adoption growth drives long-term Tesla service demand",
      "Londonderry, NH submarket: 93.8% industrial occupancy",
    ],
    threats: [
      "Tesla lease non-renewal at 2040 expiration",
      "Tesla financial deterioration or credit impairment",
      "Changes in US trade/tariff policy affecting Tesla operations",
      "Specialized build-out results in re-leasing costs if vacated",
    ],
    riskFactors: [
      "Single-tenant dependency — Tesla default terminates all income",
      "Speculative, illiquid investment — no public market for interests",
      "Offering premium vs. acquisition cost reduces equity cushion",
      "Tesla tariff exposure may adversely affect financial condition",
      "Various tax risks including Section 1031 qualification",
    ],
    fees: { acquisitionFee: "Embedded in offering premium", assetMgmt: "$2,500/yr (2.75% annual escalation)", dispositionFee: "N/A", sellingCommission: "Up to 6.0% + 1.0% MDDA + 1.80% MBD fee" },
    sponsorBackground: "Peachtree Group is a privately held real estate investment company that finances, owns, operates, manages, and develops hotel and commercial real estate assets throughout the US. Founded 2007; invested ~$4.4B of equity across acquisitions, originations, and developments with a cost basis >$13.9B.",
    hardFlags: [],
    highlights: [
      "50,985 SF · 100% NNN · Tesla, Inc.",
      "15-yr lease through March 31, 2040",
      "3% annual rent escalations",
      "Near-zero leverage — Sponsor Loan only",
      "Min $100K cash or 1031",
    ],
    status: "Open",
    cashFlows: [
      { yr: 1, egr: 1414632, noi: 1414632, ncf: 1414632, yld: 5.03 },
      { yr: 5, egr: 1592329, noi: 1592329, ncf: 1592329, yld: 5.66 },
      { yr: 10, egr: 1845889, noi: 1845889, ncf: 1845889, yld: 6.56 },
      { yr: 15, egr: 2139600, noi: 2139600, ncf: 2139600, yld: 7.61 },
    ],
    dispositionScenarios: [
      { cap: "5.25%", totalReturn: "~70%" },
      { cap: "5.52% (comp)", totalReturn: "~55%" },
      { cap: "6.00% (base)", totalReturn: "~40%" },
    ],
    scoringModules: [
      { name: "Acquisition Analysis", weight: "20%", score: 4.25, rating: "Good", wtd: 0.850 },
      { name: "Tenant Credit Quality", weight: "20%", score: 4.50, rating: "Excellent", wtd: 0.900 },
      { name: "Fee Analysis", weight: "15%", score: 2.75, rating: "Below Avg", wtd: 0.415 },
      { name: "Underwriting", weight: "10%", score: 4.25, rating: "Good", wtd: 0.425 },
      { name: "Risk Summary", weight: "10%", score: 4.00, rating: "Good", wtd: 0.400 },
      { name: "Location / Market", weight: "8%", score: 3.75, rating: "Good", wtd: 0.300 },
      { name: "Sponsor Track Record", weight: "12%", score: 3.75, rating: "Good", wtd: 0.450 },
    ],
  },
];

const STEPS = [
  { label: "Offerings", icon: "01" },
  { label: "1031 Setup", icon: "02" },
  { label: "Cart Review", icon: "03" },
  { label: "Financial Stmt.", icon: "04" },
  { label: "Account Opening", icon: "05" },
  { label: "Disclosures", icon: "06" },
  { label: "Review & Sign", icon: "07" },
];

const typeColor = (type) => {
  if (type.includes("Multi")) return { bg: "#EEF2FF", color: "#4338CA" };
  if (type.includes("Indust") || type.includes("NNN")) return { bg: "#FEF3C7", color: C.warning };
  if (type.includes("Medical")) return { bg: "#ECFDF5", color: "#065F46" };
  if (type.includes("Hospit")) return { bg: "#FDF2F8", color: "#9D174D" };
  return { bg: "#F3F4F6", color: "#374151" };
};

/* ─── Shared Input Styles (Brand Guide v2.0: 44px height) ─── */
const inputSt = {
  width: "100%", boxSizing: "border-box",
  padding: "0 14px", height: 44,
  borderRadius: 8, border: "1px solid var(--border)",
  fontSize: 14, fontFamily: FONT, color: "var(--foreground)",
  background: "var(--card)", outline: "none",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
  transition: "border-color 0.15s, box-shadow 0.15s",
  lineHeight: "1.5",
};
const selSt = {
  ...inputSt, appearance: "none", WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%236B7280' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  paddingRight: 32, cursor: "pointer",
};

/* ─── Focus Styles ─── */
if (typeof window !== "undefined" && !document.getElementById("stax-v1-styles")) {
  const s = document.createElement("style");
  s.id = "stax-v1-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .stax-input:focus { outline:none; background:var(--card) !important; border-color:var(--primary) !important; box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 10%, transparent) !important; }
    .stax-input::placeholder { color:var(--text-light); font-weight:400; }
    .stax-input.has-error { border-color:var(--destructive) !important; box-shadow:0 0 0 3px color-mix(in srgb, var(--destructive) 10%, transparent) !important; }
    .stax-input.is-valid { border-color:var(--success) !important; box-shadow:0 0 0 3px color-mix(in srgb, var(--success) 10%, transparent) !important; }
    .stax-select:focus { outline:none; background:var(--card) !important; border-color:var(--primary) !important; box-shadow:0 0 0 3px color-mix(in srgb, var(--primary) 10%, transparent) !important; }
    .stax-select.has-error { border-color:var(--destructive) !important; box-shadow:0 0 0 3px color-mix(in srgb, var(--destructive) 10%, transparent) !important; }
    .stax-card-hover:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(12,21,32,0.18) !important; }
    .stax-btn-primary:hover:not(:disabled) { background-color:var(--primary) !important; filter:brightness(0.9); }
    .stax-btn-secondary:hover { background-color:var(--secondary) !important; }
    @media (max-width:768px) { .desktop-only { display:none !important; } .mobile-full { grid-template-columns:1fr !important; } }
    @media (min-width:769px) { .mobile-only { display:none !important; } }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════════
   MICRO COMPONENTS (Module-Level — CAN use as JSX)
   ═══════════════════════════════════════════════════════ */

const ScoreRing = ({ score, size = 52 }) => {
  const col = scoreColor(score);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (score / 5) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"/>
      <text x={size/2} y={size/2+5} textAnchor="middle" fill={col}
        fontSize={13} fontWeight={700} fontFamily={FONT}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
        {score.toFixed(1)}
      </text>
    </svg>
  );
};

const Badge = ({ children, bg = C.infoBg, color = C.info, size = 10 }) => (
  <span style={{
    display: "inline-block", padding: "2px 7px", fontSize: size, fontWeight: 600,
    letterSpacing: "0.05em", textTransform: "uppercase", borderRadius: 4,
    color, background: bg, fontFamily: FONT
  }}>{children}</span>
);

const Pill = ({ label, value, sub }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 9, color: T.light, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: FONT, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: G.forest, fontFamily: FONT, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 9, color: T.muted, fontFamily: FONT, marginTop: 1 }}>{sub}</div>}
  </div>
);

const FlagAlert = ({ type, msg, detail }) => {
  const [expanded, setExpanded] = useState(false);
  const styles = {
    block: { bg: C.errorBg, border: C.errorBorder, icon: "\u{1F6AB}", text: C.error, label: "Must Resolve" },
    warn:  { bg: C.warningBg, border: C.warningBorder, icon: "\u26A0\uFE0F", text: C.warning, label: "Review Required" },
    flag:  { bg: N.bgAlt, border: N.border, icon: "\u2139\uFE0F", text: NAVY[600], label: "For Your Information" },
  };
  const s = styles[type] || styles.flag;
  return (
    <div role="alert" style={{ padding: "10px 14px", borderRadius: 8, background: s.bg,
      border: `1px solid ${s.border}`, marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: s.text, fontFamily: FONT }}>{s.label}</span>
          </div>
          <span style={{ fontSize: 12, color: s.text, fontFamily: FONT, lineHeight: 1.6 }}>{msg}</span>
          {detail && (
            <button onClick={() => setExpanded(!expanded)} style={{
              background: "none", border: "none", cursor: "pointer", fontSize: 10,
              color: s.text, fontFamily: FONT, fontWeight: 600, marginLeft: 4, textDecoration: "underline",
            }}>{expanded ? "Less" : "More"}</button>
          )}
          {expanded && detail && (
            <div style={{ fontSize: 11, color: s.text, fontFamily: FONT, marginTop: 6, lineHeight: 1.6, opacity: 0.85 }}>{detail}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon, children, noPad, collapsible = false, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const cardRef = useRef(null);
  const handleToggle = () => {
    const opening = !open;
    setOpen(opening);
    if (opening && cardRef.current) {
      setTimeout(() => {
        const el = cardRef.current;
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        }
      }, 50);
    }
  };
  return (
    <div ref={cardRef} style={{
      background: N.card, borderRadius: 12, border: `1px solid ${N.border}`,
      marginBottom: 24, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div
        onClick={collapsible ? handleToggle : undefined}
        style={{
          padding: "16px 20px",
          borderBottom: open ? `1px solid ${N.border}` : "none",
          display: "flex", alignItems: "center", gap: 10,
          background: N.section,
          cursor: collapsible ? "pointer" : "default", userSelect: "none",
        }}
      >
        {icon && <span style={{ color: T.muted, display:"flex", alignItems:"center", flexShrink:0 }}>{icon}</span>}
        <span style={{ fontSize: 14, fontWeight: 700, color: T.primary, fontFamily: FONT, flex: 1, letterSpacing: "-0.01em" }}>{title}</span>
        {collapsible && (
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
            <path d="M3 5L7 9L11 5" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          </svg>
        )}
      </div>
      {open && <div style={noPad ? {} : { padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>}
    </div>
  );
};

const StepSection = ({ step, title, subtitle, children }) => (
  <div style={{ background: N.card, borderRadius: 12, border: `1px solid ${N.border}`, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
    <div style={{ background: N.section, padding:"16px 20px", borderBottom:`1px solid ${N.border}`, display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:28, height:28, borderRadius:"50%", background:NAVY[700], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ fontSize:13, fontWeight:700, color:T.white, fontFamily:FONT }}>{step}</span>
      </div>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:T.primary, fontFamily:FONT, letterSpacing:"-0.01em", lineHeight:1.2 }}>{title}</div>
        <div style={{ fontSize:12, color:T.body, fontFamily:FONT, marginTop:2, lineHeight:1.3 }}>{subtitle}</div>
      </div>
    </div>
    <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>
      {children}
    </div>
  </div>
);

/* ─── Form Primitives ─── */
const FormField = ({ label, required, sublabel, tooltip, children, mb = 16 }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom: mb }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}>
      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T.primary, marginBottom: 6, letterSpacing: "0.01em" }}>
        <span>{label} {required && <span style={{ color: A.coral }}>*</span>}</span>
        {tooltip && (
          <span title={tooltip} style={{ display:"inline-flex", alignItems:"center", cursor:"help", color:T.light, flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
        )}
      </label>
      {children}
      {sublabel && (
        <div style={{
          fontSize: 11, color: T.muted, lineHeight: 1.5, fontFamily: FONT,
          marginTop: 4,
          maxHeight: focused ? 40 : 0,
          overflow: "hidden",
          opacity: focused ? 1 : 0,
          transition: "max-height 0.2s ease, opacity 0.15s ease",
        }}>
          {sublabel}
        </div>
      )}
    </div>
  );
};

const Hint = ({ text, error }) => text ? (
  <div role={error ? "alert" : undefined} style={{ fontSize: 11, marginTop: 4, fontFamily: FONT,
    color: error ? C.error : T.muted, display: "flex", alignItems: "center", gap: 4 }}>
    {error && <span>&#9888;</span>}{text}
  </div>
) : null;

const TInput = ({ label, value, onChange, placeholder, type = "text", required, disabled, sublabel, maxLength, style: extraStyle }) => {
  const validated = React.useContext(ValidationCtx);
  const hasErr = validated && required && !value;
  return (
    <FormField label={label} required={required} sublabel={sublabel}>
      <input className={"stax-input" + (hasErr ? " has-error" : "")} type={type} value={value || ""} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled} maxLength={maxLength}
        style={{ ...inputSt, background: disabled ? G.mint : "#ffffff", color: disabled ? G.forest : T.primary,
          fontWeight: disabled ? 700 : 400, border: disabled ? `1px solid ${G.forest}30` : `1px solid ${N.border}`, ...extraStyle }}
      />
    </FormField>
  );
};

const TSelect = ({ label, value, onChange, options, required, placeholder, sublabel }) => {
  const validated = React.useContext(ValidationCtx);
  const hasErr = validated && required && !value;
  return (
    <FormField label={label} required={required} sublabel={sublabel}>
      <select value={value || ""} onChange={e => onChange(e.target.value)} className={"stax-select" + (hasErr ? " has-error" : "")} style={selSt}>
        <option value="">{placeholder || "Select..."}</option>
        {options.map(o => (
          <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

const CheckBox = ({ checked, onChange, label, description, darkMode }) => (
  <label style={{
    display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
    marginBottom: 8, padding: "12px 16px", borderRadius: 8,
    background: darkMode
      ? (checked ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.08)")
      : (checked ? G.mint : N.bgAlt),
    border: darkMode
      ? `1px solid ${checked ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.18)"}`
      : `1px solid ${checked ? G.forest : N.border}`,
    transition: "all 0.15s",
    width: "100%", boxSizing: "border-box",
  }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}/>
    <span style={{
      width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: darkMode
        ? (checked ? G.forest : "rgba(255,255,255,0.12)")
        : (checked ? G.forest : N.card),
      border: darkMode
        ? `2px solid ${checked ? G.forest : "rgba(255,255,255,0.3)"}`
        : `2px solid ${checked ? G.forest : N.border}`,
      transition: "all 0.15s",
    }}>
      {checked && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17L4 12"/></svg>
      )}
    </span>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: darkMode ? "rgba(255,255,255,0.9)" : T.primary, fontFamily: FONT }}>{label}</div>
      {description && <div style={{ fontSize: 11, color: darkMode ? "rgba(255,255,255,0.55)" : T.muted, fontFamily: FONT, marginTop: 2, lineHeight: 1.5 }}>{description}</div>}
    </div>
  </label>
);

const RadioGroup = ({ label, name, value, onChange, options, required, sublabel }) => {
  const validated = React.useContext(ValidationCtx);
  const hasErr = validated && required && !value;
  return (
  <FormField label={label} required={required} sublabel={sublabel}>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }} data-field-error={hasErr ? "true" : undefined}>
      {options.map(o => {
        const val = typeof o === "string" ? o : o.value;
        const lbl = typeof o === "string" ? o : o.label;
        const desc = typeof o === "object" ? o.description : null;
        const selected = value === val;
        return (
          <label key={val} style={{
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            padding: "12px 16px", borderRadius: 8, width: "100%", boxSizing: "border-box",
            background: selected ? G.mint : N.bgAlt,
            border: `1px solid ${selected ? G.forest : N.border}`,
            transition: "all 0.15s",
          }}>
            <input type="radio" name={name || label} value={val} checked={selected}
              onChange={() => onChange(val)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}/>
            <span style={{
              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: selected ? G.forest : N.card,
              border: `2px solid ${selected ? G.forest : N.border}`,
              transition: "all 0.15s",
            }}>
              {selected && (
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: N.card, display: "block" }}/>
              )}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: selected ? 600 : 400, color: T.primary, fontFamily: FONT }}>{lbl}</div>
              {desc && <div style={{ fontSize: 12, color: T.muted, fontFamily: FONT, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>}
            </div>
          </label>
        );
      })}
    </div>
  </FormField>
  );
};

const CurrencyInput = ({ label, value, onChange, disabled, sublabel, required, mb }) => {
  const inputRef = useRef(null);
  const isFocused = useRef(false);
  const validated = React.useContext(ValidationCtx);
  const hasErr = validated && required && !(value > 0);
  useEffect(() => {
    if (!isFocused.current && inputRef.current) {
      inputRef.current.value = value > 0 ? value.toLocaleString() : "";
    }
  }, [value]);
  return (
    <FormField label={label} required={required} sublabel={sublabel} mb={mb}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          color: disabled ? G.forest : T.muted, fontSize: 13, fontWeight: 600, fontFamily: FONT }}>$</span>
        <input ref={inputRef} className={disabled ? "" : ("stax-input" + (hasErr ? " has-error" : ""))} inputMode="numeric"
          defaultValue={value > 0 ? value.toLocaleString() : ""}
          readOnly={disabled}
          onFocus={e => { isFocused.current = true; e.target.value = value > 0 ? String(value) : ""; }}
          onBlur={e => {
            isFocused.current = false;
            const n = parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0;
            onChange && onChange(n);
            e.target.value = n > 0 ? n.toLocaleString() : "";
          }}
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9.]/g, "");
            onChange && onChange(parseFloat(raw) || 0);
          }}
          placeholder="0"
          style={{ ...inputSt, paddingLeft: 22,
            background: disabled ? G.mint : "#ffffff",
            color: disabled ? G.forest : (value > 0 ? T.primary : T.muted),
            fontWeight: disabled ? 700 : (value > 0 ? 600 : 400),
            border: disabled ? `1px solid ${G.forest}30` : (value > 0 ? `1px solid ${N.border}` : `1px solid ${N.border}`) }}
        />
      </div>
    </FormField>
  );
};

const CartAmountInput = ({ value, onCommit }) => {
  const inputRef = useRef(null);
  const isFocused = useRef(false);
  useEffect(() => {
    if (!isFocused.current && inputRef.current) {
      inputRef.current.value = value > 0 ? value.toLocaleString() : "";
    }
  }, [value]);
  return (
    <input ref={inputRef} type="text" inputMode="numeric"
      defaultValue={value > 0 ? value.toLocaleString() : ""}
      onFocus={e => { isFocused.current = true; e.target.value = value > 0 ? String(value) : ""; }}
      onBlur={e => {
        isFocused.current = false;
        const n = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
        onCommit(n);
        e.target.value = n > 0 ? n.toLocaleString() : "";
      }}
      onChange={e => { const n = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0; onCommit(n); }}
      style={{ ...inputSt, width: 140, paddingLeft: 10, fontSize: 13, fontWeight: 600, color: G.forest, background: G.mint, border: `1px solid ${G.forest}30` }}/>
  );
};

/* ─── Specialized Masked Inputs ─── */
const PhoneInput = ({ label, value, onChange, required, sublabel }) => {
  const [touched, setTouched] = useState(false);
  const validated = React.useContext(ValidationCtx);
  const digits = (value || "").replace(/\D/g, "");
  const isValid = digits.length === 10;
  const showError = (touched && value && !isValid) || (validated && required && !value);
  return (
    <FormField label={label} required={required} sublabel={sublabel}>
      <input className={"stax-input" + (showError ? " has-error" : isValid && touched ? " is-valid" : "")}
        type="tel" value={value || ""} inputMode="numeric" placeholder="(___) ___-____" maxLength={14}
        onFocus={() => setTouched(false)} onBlur={() => setTouched(true)}
        onChange={e => { const r = e.target.value.replace(/\D/g, "").slice(0, 10); onChange(fmtPhone(r)); }}
        style={{ ...inputSt, letterSpacing: "0.02em" }}/>
      <Hint text={showError ? (value ? "Please enter a valid 10-digit phone number" : "This field is required") : null} error/>
    </FormField>
  );
};

const SSNInput = ({ label, value, onChange, required }) => {
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const digits = (value || "").replace(/\D/g, "");
  const isValid = digits.length === 9;
  const allZeros = digits === "000000000";
  const showError = touched && value && (!isValid || allZeros);
  return (
    <FormField label={label} required={required}>
      <div style={{ position: "relative" }}>
        <input className={"stax-input" + (showError ? " has-error" : isValid && touched ? " is-valid" : "")}
          type={show ? "text" : "password"} value={value || ""} inputMode="numeric"
          placeholder="___-__-____" maxLength={11} autoComplete="off"
          onFocus={() => setTouched(false)} onBlur={() => setTouched(true)}
          onChange={e => { const r = e.target.value.replace(/\D/g, "").slice(0, 9); onChange(fmtSSN(r)); }}
          style={{ ...inputSt, paddingRight: 36, letterSpacing: show ? "0.08em" : "0.1em" }}/>
        <button type="button" onClick={() => setShow(s => !s)}
          aria-label={show ? "Hide SSN" : "Show SSN"}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 2, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {show ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      <Hint text={showError ? (allZeros ? "SSN cannot be all zeros" : "Please enter a valid 9-digit SSN") : isValid && touched ? "Valid SSN format" : null} error={!!showError}/>
    </FormField>
  );
};

const DateInput = ({ label, value, onChange, required, sublabel, tooltip, placeholder }) => {
  const [touched, setTouched] = useState(false);
  const validated = React.useContext(ValidationCtx);
  const digits = (value || "").replace(/\D/g, "");
  const isValid = digits.length === 8 && (() => {
    const m = parseInt(digits.slice(0,2),10), d = parseInt(digits.slice(2,4),10), y = parseInt(digits.slice(4),10);
    return m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2099;
  })();
  const showError = (touched && value && !isValid) || (validated && required && !value);
  return (
    <FormField label={label} required={required} sublabel={sublabel} tooltip={tooltip}>
      <input className={"stax-input" + (showError ? " has-error" : isValid && touched ? " is-valid" : "")}
        type="text" value={value || ""} inputMode="numeric" placeholder={placeholder || "MM/DD/YYYY"} maxLength={10}
        onFocus={() => setTouched(false)} onBlur={() => setTouched(true)}
        onChange={e => onChange(fmtDate(e.target.value))}
        style={{ ...inputSt, letterSpacing: "0.05em" }}/>
      <Hint text={showError ? (value ? "Enter a valid date (MM/DD/YYYY)" : "This field is required") : null} error={!!showError}/>
    </FormField>
  );
};

const EINInput = ({ label, value, onChange, required, sublabel }) => {
  const [touched, setTouched] = useState(false);
  const digits = (value || "").replace(/\D/g, "");
  const isValid = digits.length === 9;
  const showError = touched && value && !isValid;
  return (
    <FormField label={label || "EIN / Tax ID"} required={required} sublabel={sublabel}>
      <input className={"stax-input" + (showError ? " has-error" : isValid && touched ? " is-valid" : "")}
        type="text" value={value || ""} inputMode="numeric" placeholder="XX-XXXXXXX" maxLength={10}
        onFocus={() => setTouched(false)} onBlur={() => setTouched(true)}
        onChange={e => onChange(fmtEIN(e.target.value))}
        style={{ ...inputSt, letterSpacing: "0.08em" }}/>
      <Hint text={showError ? "EIN must be 9 digits (XX-XXXXXXX)" : null} error={!!showError}/>
    </FormField>
  );
};

const RoutingInput = ({ label, value, onChange, required }) => {
  const [touched, setTouched] = useState(false);
  const isValid = (value || "").replace(/\D/g, "").length === 9;
  const showError = touched && value && !isValid;
  return (
    <FormField label={label || "ABA Routing Number"} required={required} sublabel="9-digit ABA routing number">
      <input className={"stax-input" + (showError ? " has-error" : isValid && touched ? " is-valid" : "")}
        type="text" value={value || ""} inputMode="numeric" placeholder="_________" maxLength={9}
        onFocus={() => setTouched(false)} onBlur={() => setTouched(true)}
        onChange={e => onChange(fmtRouting(e.target.value))}
        style={{ ...inputSt, letterSpacing: "0.15em", fontFamily: "monospace" }}/>
      <Hint text={showError ? "Routing number must be exactly 9 digits" : null} error={!!showError}/>
    </FormField>
  );
};

const EmailInput = ({ label, value, onChange, required, sublabel }) => {
  const [touched, setTouched] = useState(false);
  const validated = React.useContext(ValidationCtx);
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
  const showError = (touched && value && !isValid) || (validated && required && !value);
  return (
    <FormField label={label || "Email Address"} required={required} sublabel={sublabel}>
      <input className={"stax-input" + (showError ? " has-error" : isValid && touched ? " is-valid" : "")}
        type="email" value={value || ""} placeholder="name@example.com"
        onFocus={() => setTouched(false)} onBlur={() => setTouched(true)}
        onChange={e => onChange(e.target.value)} autoComplete="email" style={inputSt}/>
      <Hint text={showError ? (value ? "Please enter a valid email address" : "This field is required") : null} error/>
    </FormField>
  );
};

const ZipInput = ({ label, value, onChange, required }) => {
  const [touched, setTouched] = useState(false);
  const validated = React.useContext(ValidationCtx);
  const isValid = (value || "").length === 5;
  const showError = (touched && value && !isValid) || (validated && required && !value);
  return (
    <FormField label={label || "ZIP Code"} required={required}>
      <input className={"stax-input" + (showError ? " has-error" : isValid && touched ? " is-valid" : "")}
        type="text" value={value || ""} inputMode="numeric" placeholder="_____" maxLength={5}
        onFocus={() => setTouched(false)} onBlur={() => setTouched(true)}
        onChange={e => onChange(fmtZip(e.target.value))} style={inputSt}/>
      <Hint text={showError ? (value ? "ZIP must be 5 digits" : "This field is required") : null} error/>
    </FormField>
  );
};

/* ─── Layout Helpers ─── */
const Row2 = ({ children }) => (
  <div className="mobile-full" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>
);
const Row3 = ({ children }) => (
  <div className="mobile-full" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>{children}</div>
);

/* ─── Buttons ─── */
const BtnPrimary = ({ onClick, children, disabled, style = {} }) => (
  <button className="stax-btn-primary" onClick={onClick} disabled={disabled} style={{
    padding: "0 20px", border: `1px solid ${disabled ? "transparent" : NAVY[600]}`, borderRadius: 8,
    background: disabled ? N.neutral : NAVY[700],
    color: disabled ? T.light : "white",
    fontWeight: 600, fontSize: 14, fontFamily: FONT,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 1px 3px rgba(0,0,0,0.14)",
    transition: "background 0.15s, box-shadow 0.15s", height: 44, letterSpacing: "0.01em", ...style
  }}>{children}</button>
);

const BtnSecondary = ({ onClick, children, style = {} }) => (
  <button className="stax-btn-secondary" onClick={onClick} style={{
    padding: "0 20px", border: `1px solid ${N.border}`, borderRadius: 8,
    background: N.card, color: T.body, fontWeight: 500, fontSize: 14,
    fontFamily: FONT, cursor: "pointer", transition: "all 0.15s", height: 44,
    letterSpacing: "0.01em", ...style
  }}>{children}</button>
);

const BtnDark = ({ onClick, children, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: "12px 28px", border: "none", borderRadius: 10,
    background: disabled ? N.neutral : NAVY[700],
    color: disabled ? T.light : "white", fontWeight: 600, fontSize: 14, fontFamily: FONT,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 2px 8px rgba(29,40,55,0.25)",
    transition: "background 0.15s, box-shadow 0.15s", minHeight: 44, letterSpacing: "0.01em", ...style
  }}>{children}</button>
);

const InfoCallout = ({ children, type = "info", title }) => {
  const colors = {
    info:      { line: NAVY[600],  bg: "rgba(43,55,73,0.08)"  },
    success:   { line: G.forest,   bg: C.successBg       },
    warning:   { line: C.warning,  bg: C.warningBg       },
    important: { line: C.error,    bg: C.errorBg         },
  };
  const s = colors[type] || colors.info;
  return (
    <div style={{ borderLeft: `3px solid ${s.line}`, paddingLeft: 12, paddingRight: 12,
      paddingTop: 10, paddingBottom: 10, background: s.bg,
      borderRadius: "0 8px 8px 0", marginBottom: 12 }}>
      {title && <div style={{ fontSize: 13, fontWeight: 600, color: T.primary, fontFamily: FONT, marginBottom: 4 }}>{title}</div>}
      <div style={{ fontSize: 12, color: T.body, fontFamily: FONT, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
};

/* ─── Document Uploader ─── */
const DocumentUploader = ({ label, sublabel, required, accept = "image/*,application/pdf", maxFiles = 2, maxSizeMB = 10, docType = "document", onFilesChange, files = [] }) => {
  const validated = React.useContext(ValidationCtx);
  const hasFieldErr = validated && required && files.length === 0;
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const ACCEPTED = { "application/pdf":"PDF","image/jpeg":"JPG","image/jpg":"JPG","image/png":"PNG","image/heic":"HEIC","image/heif":"HEIC" };
  const validateFile = (file) => {
    const errs = [];
    if (file.size > maxSizeMB * 1024 * 1024) errs.push(`${file.name}: exceeds ${maxSizeMB}MB limit`);
    const ext = file.name.split(".").pop().toLowerCase();
    if (!Object.keys(ACCEPTED).includes(file.type) && !["pdf","jpg","jpeg","png","heic","heif"].includes(ext)) errs.push(`${file.name}: unsupported file type`);
    return errs;
  };
  const processFiles = (incoming) => {
    const newErrors = [];
    const validFiles = [];
    const remaining = maxFiles - files.length;
    if (remaining <= 0) { newErrors.push(`Maximum of ${maxFiles} file(s) allowed.`); setErrors(newErrors); return; }
    Array.from(incoming).slice(0, remaining).forEach(file => {
      const errs = validateFile(file);
      if (errs.length) newErrors.push(...errs);
      else {
        const id = `${docType}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        validFiles.push({ id, file, name: file.name, size: file.size, type: file.type, status: "pending", progress: 0,
          preview: file.type?.startsWith("image/") ? URL.createObjectURL(file) : null });
      }
    });
    setErrors(newErrors);
    if (validFiles.length > 0) {
      const updated = [...files, ...validFiles];
      onFilesChange(updated);
      validFiles.forEach(vf => {
        let progress = 0;
        const update = (fArr, fid, patch) => fArr.map(f => f.id === fid ? { ...f, ...patch } : f);
        onFilesChange(update(updated, vf.id, { status: "uploading", progress: 0 }));
        const iv = setInterval(() => {
          progress += Math.random() * 25 + 10;
          if (progress >= 100) { clearInterval(iv); onFilesChange(prev => update(prev, vf.id, { status: "uploaded", progress: 100 })); }
          else { onFilesChange(prev => update(prev, vf.id, { progress: Math.min(progress, 95) })); }
        }, 300);
      });
    }
  };
  const removeFile = (fileId) => { const f = files.find(x => x.id === fileId); if (f?.preview) URL.revokeObjectURL(f.preview); onFilesChange(files.filter(x => x.id !== fileId)); setErrors([]); };
  const fmtSize = (bytes) => bytes < 1024 ? `${bytes}B` : bytes < 1048576 ? `${(bytes/1024).toFixed(0)}KB` : `${(bytes/1048576).toFixed(1)}MB`;
  return (
    <div style={{ marginTop: 4, marginBottom: 4 }} data-field-error={hasFieldErr ? "true" : undefined}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.primary, marginBottom: 8, fontFamily: FONT, letterSpacing: "0.01em" }}>{label} {required && <span style={{ color: A.coral }}>*</span>}</div>
      {files.length < maxFiles && (
        <div onDrop={e => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? G.forest : N.border}`, borderRadius: 12, padding: "24px 16px", textAlign: "center", cursor: "pointer", background: dragOver ? `${G.forest}08` : N.section, transition: "all 0.2s" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: dragOver ? G.forest : T.body, fontFamily: FONT, marginBottom: 3 }}>
            {dragOver ? "Drop file here" : "Drag & drop file here, or click to browse"}
          </div>
          <div style={{ fontSize: 10, color: T.light, fontFamily: FONT }}>PDF, JPG, PNG, HEIC · Max {maxSizeMB}MB · {files.length}/{maxFiles} file{maxFiles > 1 ? "s" : ""}</div>
          <input ref={fileRef} type="file" accept={accept} multiple={maxFiles > 1} onChange={e => { processFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }}/>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
            <button type="button" onClick={e => { e.stopPropagation(); cameraRef.current?.click(); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", border: `1px solid ${N.border}`, borderRadius: 8, background: N.card, fontSize: 11, fontWeight: 600, color: T.body, fontFamily: FONT, cursor: "pointer" }}>
              Take Photo
            </button>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e => { processFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }}/>
        </div>
      )}
      {sublabel && <div style={{ fontSize: 11, color: T.light, marginTop: 6, fontFamily: FONT, lineHeight: 1.5 }}>{sublabel}</div>}
      {hasFieldErr && <div style={{ fontSize: 11, color: A.coral, fontFamily: FONT, marginTop: 4 }}>This upload is required</div>}
      {errors.length > 0 && <div style={{ marginTop: 6 }}>{errors.map((err, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: C.error, fontFamily: FONT }}>{err}</span>
        </div>
      ))}</div>}
      {files.length > 0 && <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        {files.map(f => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: N.card, borderRadius: 10, border: `1px solid ${f.status === "uploaded" ? G.forest + "30" : N.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: N.section, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${N.border}` }}>
              {f.preview ? <img src={f.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> :
                <span style={{ fontSize: 10, fontWeight: 700, color: A.red, fontFamily: FONT }}>PDF</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.primary, fontFamily: FONT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: T.light, fontFamily: FONT }}>{fmtSize(f.size)}</span>
                <Badge bg={f.status === "uploaded" ? G.mint : C.infoBg} color={f.status === "uploaded" ? G.forest : C.info} size={8}>
                  {f.status === "uploaded" ? "Uploaded" : f.status === "uploading" ? "Uploading" : "Pending"}
                </Badge>
              </div>
              {f.status === "uploading" && (
                <div style={{ marginTop: 4, height: 4, background: N.divider, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${G.forest}, ${G.light})`, width: `${f.progress}%`, transition: "width 0.3s ease" }}/>
                </div>
              )}
            </div>
            <button type="button" onClick={() => removeFile(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.light, fontSize: 16, padding: 4 }}>x</button>
          </div>
        ))}
      </div>}
      {files.length >= maxFiles && (
        <div style={{ marginTop: 6, padding: "6px 10px", background: G.mint, borderRadius: 6, border: `1px solid ${G.forest}20` }}>
          <span style={{ fontSize: 10, color: G.forest, fontFamily: FONT, fontWeight: 600 }}>{files.length}/{maxFiles} file{maxFiles > 1 ? "s" : ""} uploaded — remove to replace</span>
        </div>
      )}
    </div>
  );
};

/* ─── Financial Chart — SVG Donut ─── */
const FsDonutChart = ({ slices, nw, nwEx }) => {
  const total = slices.reduce((s, sl) => s + Math.max(0, sl.val), 0);
  const r = 60, cx = 80, cy = 80, sw = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const fmtShort = v => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={160} height={160} viewBox="0 0 160 160" style={{ margin: "0 auto", display: "block" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={N.divider} strokeWidth={sw}/>
        {total > 0 && slices.filter(sl => sl.val > 0).map((sl, i) => {
          const pctVal = sl.val / total;
          const dash = pctVal * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={sl.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dasharray 0.4s" }}/>
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={T.primary} fontSize={12} fontWeight={800} fontFamily={FONT}>
          {total > 0 ? fmtShort(total) : "—"}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill={T.muted} fontSize={8} fontFamily={FONT}>Total Assets</text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", marginTop: 8 }}>
        {slices.filter(sl => sl.val > 0).map((sl, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: sl.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 8, color: T.muted, fontFamily: FONT }}>{sl.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Financial Section Accordion ─── */
const FsSection = ({ id, icon, title, color, subtotal, children, open, onToggle, complete, onSave, onCancel, dirty }) => (
  <div
    id={`fs-section-${id}`}
    onFocus={() => { if (!open) onToggle(); }}
    style={{
      background: N.card,
      borderRadius: 12,
      border: `1px solid ${open ? color + "44" : N.border}`,
      overflow: "hidden",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: open ? `0 2px 12px rgba(0,0,0,0.07)` : "0 1px 3px rgba(0,0,0,0.04)",
    }}>
    <div
      onClick={onToggle}
      tabIndex={0}
      role="button"
      aria-expanded={open}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      style={{
        padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
        background: open ? `${color}08` : N.card,
        borderBottom: open ? `1px solid ${color}20` : "none",
        transition: "background 0.2s", userSelect: "none", outline: "none",
      }}>
      <span style={{ color: open ? color : T.muted, display:"flex", alignItems:"center", flexShrink:0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: open ? T.primary : T.body, fontFamily: FONT }}>{title}</span>
      {complete && <span style={{ fontSize:10, fontWeight:700, color:C.success, background:C.successBg, padding:"2px 6px", borderRadius:4, fontFamily:FONT, letterSpacing:"0.04em" }}>DONE</span>}
      <span style={{ fontSize: 13, fontWeight: 700, color: subtotal > 0 ? color : T.light, fontFamily: FONT, marginRight:4 }}>
        {subtotal > 0 ? fmtFull(subtotal) : "—"}
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
        <path d="M4 6L8 10L12 6" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
    </div>
    {open && (
      <div style={{ padding: "20px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {children}
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginTop:24, paddingTop:16, borderTop:`1px solid ${N.border}` }}>
          <button onClick={onCancel || onToggle} style={{
            padding:"8px 12px", height:32, borderRadius:8,
            border:`1px solid ${N.border}`, background: N.card,
            fontSize:12, fontWeight:500, color: T.body,
            fontFamily:FONT, cursor:"pointer",
            boxShadow:"0 1px 2px rgba(0,0,0,0.05)",
          }}>Cancel</button>
          <button onClick={dirty ? (onSave || onToggle) : undefined} disabled={!dirty} style={{
            padding:"8px 12px", height:32, borderRadius:8, border:"none",
            background: dirty ? NAVY[600] : N.neutral,
            fontSize:12, fontWeight:600, color:T.white,
            fontFamily:FONT, cursor: dirty ? "pointer" : "not-allowed",
            boxShadow: dirty ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
            transition:"background 0.15s",
          }}>Save</button>
        </div>
      </div>
    )}
  </div>
);

const FsSubtotal = ({ label, value, color, accent }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px",
    borderRadius: 8, background: accent ? `${color}10` : N.section, border: `1px solid ${accent ? color + "30" : N.border}`,
    marginTop: 8 }}>
    <span style={{ fontSize: 11, fontWeight: 600, color: T.body, fontFamily: FONT }}>{label}</span>
    <span style={{ fontSize: 15, fontWeight: 700, color: value > 0 ? color : T.light, fontFamily: FONT }}>
      {value > 0 ? fmtFull(value) : "$0"}
    </span>
  </div>
);

const MoneyField = ({ label, sublabel, hint, value, onChange }) => {
  const [focused, setFocused] = React.useState(false);
  const desc = hint || sublabel;
  return (
    <div onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.primary, marginBottom: 6, letterSpacing: "0.01em", fontFamily: FONT }}>
        {label}
      </label>
      <CurrencyInput label="" value={value} onChange={onChange} mb={desc ? 0 : 16}/>
      {desc && (
        <div style={{
          fontSize: 11, color: T.muted, fontFamily: FONT, lineHeight: 1.5,
          marginTop: 4,
          maxHeight: focused ? 40 : 0,
          overflow: "hidden",
          opacity: focused ? 1 : 0,
          transition: "max-height 0.2s ease, opacity 0.15s ease",
        }}>
          {desc}
        </div>
      )}
    </div>
  );
};

const TaxRateField = ({ value, onChange }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:T.primary, marginBottom:6, letterSpacing:"0.01em", fontFamily:FONT }}>
        Highest Marginal Tax Rate
      </label>
      <div style={{ position:"relative" }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}>
        <input className="stax-input" type="text" inputMode="decimal"
          value={value > 0 ? String(value) : ""} placeholder="32" maxLength={4}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ ...inputSt, paddingRight:28 }}/>
        <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:T.muted, fontFamily:FONT, fontWeight:600 }}>%</span>
      </div>
      <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.5,
        marginTop:4, maxHeight: focused ? 40 : 0, overflow:"hidden",
        opacity: focused ? 1 : 0, transition:"max-height 0.2s ease, opacity 0.15s ease" }}>
        Used for 1031 exchange tax benefit analysis
      </div>
    </div>
  );
};

/* ─── Detail Modal ─── */
const DetailModal = ({ dst, inCart, onToggle, onClose }) => {
  if (!dst) return null;
  const tc = typeColor(dst.propertyType);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}/>
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", width: "90%", maxWidth: 800, maxHeight: "90vh", overflow: "auto",
        background: N.card, borderRadius: 28, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      }}>
        <div style={{ padding: "24px 28px", borderBottom: `1px solid ${N.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: N.card, zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <Badge {...tc}>{dst.propertyTypeShort}</Badge>
              <Badge bg={N.bgAlt} color={T.muted}>{dst.structure}</Badge>
              <Badge bg={dst.recommendation === "Approve" ? G.mint : C.warningBg} color={dst.recommendation === "Approve" ? G.forest : C.warning}>
                {dst.recommendation}
              </Badge>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: T.primary, fontFamily: FONT }}>{dst.name}</div>
            <div style={{ fontSize: 13, color: T.muted, fontFamily: FONT, marginTop: 2 }}>{dst.address} | {dst.sponsor}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: T.muted, padding: 4 }}>x</button>
        </div>
        <div style={{ padding: "20px 28px" }}>
          {/* Key Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { l: "Going-in Cap", v: pct(dst.goingInCap) },
              { l: "Cash/Cash", v: pct(dst.cashOnCash) },
              { l: "Target IRR", v: `${dst.targetIRR}%` },
              { l: "DSCR", v: dst.dscr ? `${dst.dscr}x` : "N/A" },
              { l: "Leverage", v: `${dst.leverage}%` },
            ].map(({ l, v }) => (
              <div key={l} style={{ padding: "10px 8px", background: N.section, borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontSize: 8, color: T.light, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: FONT, marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: G.forest, fontFamily: FONT }}>{v}</div>
              </div>
            ))}
          </div>
          {/* SWOT */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { title: "Strengths", items: dst.strengths, color: G.forest },
              { title: "Weaknesses", items: dst.weaknesses, color: A.red },
              { title: "Opportunities", items: dst.opportunities, color: A.blue },
              { title: "Threats", items: dst.threats, color: A.amber },
            ].map(({ title, items, color }) => (
              <div key={title} style={{ padding: "14px 16px", borderRadius: 10, background: `${color}08`, border: `1px solid ${color}20` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: FONT, marginBottom: 8 }}>{title}</div>
                {items.map((item, i) => (
                  <div key={i} style={{ fontSize: 11, color: T.body, fontFamily: FONT, lineHeight: 1.6, marginBottom: 4, display: "flex", gap: 6 }}>
                    <span style={{ color, flexShrink: 0 }}>{title === "Strengths" ? "+" : title === "Weaknesses" ? "-" : title === "Opportunities" ? "\u2192" : "\u26A0"}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Risk Factors */}
          {dst.riskFactors && dst.riskFactors.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 8 }}>Key Risk Factors</div>
              {dst.riskFactors.map((r, i) => (
                <div key={i} style={{ fontSize: 11, color: T.body, fontFamily: FONT, lineHeight: 1.6, marginBottom: 4, paddingLeft: 12, borderLeft: `2px solid ${A.red}20` }}>{r}</div>
              ))}
            </div>
          )}
          {/* Cash Flows */}
          {dst.cashFlows && dst.cashFlows.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 8 }}>Projected Cash Flows</div>
              <div style={{ background: N.section, borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: FONT }}>
                  <thead><tr style={{ background: N.divider }}>
                    {["Year", "NCF", "Yield"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.muted }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{dst.cashFlows.map((cf, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${N.divider}` }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>Yr {cf.yr}</td>
                      <td style={{ padding: "8px 12px", color: G.forest, fontWeight: 600 }}>{fmtFull(cf.ncf)}</td>
                      <td style={{ padding: "8px 12px" }}>{pct(cf.yld)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          {/* Disposition Scenarios */}
          {dst.dispositionScenarios && dst.dispositionScenarios.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 8 }}>Disposition Scenarios</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${dst.dispositionScenarios.length}, 1fr)`, gap: 8 }}>
                {dst.dispositionScenarios.map((sc, i) => (
                  <div key={i} style={{ padding: "10px", background: sc.cap.includes("base") || sc.cap.includes("comp") ? G.mint : N.section, borderRadius: 8, textAlign: "center", border: `1px solid ${sc.cap.includes("base") || sc.cap.includes("comp") ? G.forest + "30" : N.border}` }}>
                    <div style={{ fontSize: 10, color: T.muted, fontFamily: FONT }}>Exit Cap: {sc.cap}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G.forest, fontFamily: FONT }}>{sc.totalReturn}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Scoring */}
          {dst.scoringModules && dst.scoringModules.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 8 }}>Due Diligence Scoring</div>
              <div style={{ background: N.section, borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: FONT }}>
                  <thead><tr style={{ background: N.divider }}>
                    {["Module", "Weight", "Score", "Rating", "Weighted"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, color: T.muted }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{dst.scoringModules.map((mod, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${N.divider}` }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{mod.name}</td>
                      <td style={{ padding: "8px 12px" }}>{mod.weight}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: scoreColor(mod.score) }}>{mod.score.toFixed(2)}</td>
                      <td style={{ padding: "8px 12px" }}>{mod.rating}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{mod.wtd.toFixed(3)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          {/* Fee Schedule */}
          {dst.fees && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 8 }}>Fee Schedule</div>
              {Object.entries(dst.fees).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${N.divider}`, fontSize: 11, fontFamily: FONT }}>
                  <span style={{ color: T.muted }}>{k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</span>
                  <span style={{ color: T.primary, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {/* Sponsor */}
          {dst.sponsorBackground && (
            <div style={{ marginBottom: 20, padding: "14px 16px", background: N.section, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 6 }}>Sponsor Background</div>
              <div style={{ fontSize: 11, color: T.body, fontFamily: FONT, lineHeight: 1.7 }}>{dst.sponsorBackground}</div>
            </div>
          )}
          {/* Action */}
          <div style={{ display: "flex", gap: 12 }}>
            <BtnPrimary onClick={onToggle} style={{ flex: 1 }}>
              {inCart ? "Remove from Cart" : "Add to Cart"}
            </BtnPrimary>
            <BtnSecondary onClick={onClose}>Close</BtnSecondary>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Auto-Save Hook ─── */
const useAutoSave = (state, key = "stax-dst-onboarding-v1") => {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(state)); setSaved(true); setTimeout(() => setSaved(false), 1500); } catch (e) {}
    }, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state, key]);
  return saved;
};

/* ─── Audit Log Helper ─── */
const createAuditEntry = (type, description, user = "Investor") => ({
  id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
  timestamp: new Date().toISOString(),
  type, description, user, ip: "192.168.1." + Math.floor(Math.random() * 255),
});

/* ════════════════════════════════════════════════════════
   FOOTER COMPONENT
   ════════════════════════════════════════════════════════ */
const CORAL = "#EF6B51";

const DISC_TABS = [
  { id:"general",  label:"General Disclosures" },
  { id:"dst",      label:"DST & Private Placements" },
  { id:"exchange", label:"1031 Exchange" },
  { id:"regbi",    label:"Reg BI & Conflicts" },
  { id:"privacy",  label:"Privacy & Data" },
];

const DISC_CONTENT = {
  general: [
    { title:"Broker-Dealer Registration.", body:`Stax Capital, Inc. is registered as a broker-dealer with the U.S. Securities and Exchange Commission (SEC) and is a member of FINRA and SIPC. Registration does not imply a certain level of skill or training. The DST Hub platform is operated solely by Stax Capital in its capacity as an introducing broker-dealer. We do not hold customer funds or securities; all assets are held through qualified custodians and product sponsors.` },
    { title:"Not Investment Advice.", body:`Nothing on this website, the DST Hub platform, or any associated materials constitutes investment advice, legal advice, tax advice, or accounting advice. Content displayed — including property descriptions, projected return illustrations, and sponsor information — is sourced from third-party offering documents and has not been independently verified by Stax Capital. All figures are projections only; actual results will differ materially. Consult your own qualified legal, tax, and financial advisors before making any investment decision.` },
    { title:"No Guarantee of Returns.", body:`Past performance of any DST sponsor, property, or prior investment is not indicative of future results. All investments involve risk of loss of principal. Projected distributions are not guaranteed and may be funded from sources other than operating cash flow, including return of capital, which would reduce your investment basis and future returns.` },
    { title:"Accredited Investors Only.", body:`The securities offered through this platform are offered exclusively to accredited investors as defined under Rule 501(a) of Regulation D under the Securities Act of 1933. These securities have not been registered with the SEC or any state securities commission and may not be resold or transferred without registration or an applicable exemption.` },
    { title:"FINRA BrokerCheck.", body:`You may obtain information about Stax Capital, Inc. and our registered representatives at no charge through FINRA BrokerCheck at finra.org/brokercheck or by calling FINRA at 1-800-289-9999. We encourage all investors to review the professional background of their Stax representative before transacting.` },
  ],
  dst: [
    { title:"Illiquidity Risk.", body:`Delaware Statutory Trust (DST) and DST 721 UPREIT private placement interests are highly illiquid investments. There is no established secondary market for these interests, and investors should expect to hold their investment for the full projected hold period, typically 5 to 10 years or more. Investors may be unable to access their capital prior to the end of the hold period, and there is no assurance that a liquidity event will occur at any particular time or at all.` },
    { title:"Private Placement Risk Factors.", body:`DST investments are subject to substantial risks including, without limitation: loss of all or a substantial portion of invested principal; declines in real estate market values; tenant default or vacancy; increases in interest rates; unforeseen capital expenditure requirements; environmental liability; changes in applicable tax laws; natural disasters; general economic downturns; and sponsor insolvency or operational failure. These risks are described in detail in the applicable Private Placement Memorandum (PPM), which you must read in its entirety before investing.` },
    { title:"Offering Documents Control.", body:`All DST investments presented through this platform are offered exclusively pursuant to the applicable PPM, Subscription Agreement, and Operating Agreement prepared by the respective sponsor. In the event of any conflict between information displayed on this platform and those offering documents, the offering documents control. Stax Capital makes no representation or warranty regarding the accuracy or completeness of information provided by DST sponsors.` },
    { title:"No Recommendation.", body:`The display of any DST offering on this platform does not constitute a recommendation, endorsement, or solicitation to invest. Product listings are provided for informational purposes to facilitate review by prospective investors working with a licensed Stax Capital representative. Investment decisions must be made in consultation with your registered representative following a complete suitability analysis under FINRA Rule 2111 and Regulation Best Interest.` },
    { title:"Debt and Leverage Risk.", body:`Many DST properties carry existing mortgage debt that is non-recourse to investors. While investors are not personally liable for this debt, leverage magnifies both potential returns and losses. In a 1031 exchange context, failure to replace an adequate amount of debt may result in taxable boot.` },
  ],
  exchange: [
    { title:"No Tax Advice.", body:`Stax Capital, Inc. is a registered broker-dealer and does not provide tax, legal, or accounting advice. All information and tools relating to 1031 exchanges are provided for general informational purposes only and do not constitute tax advice. The tax consequences of any 1031 exchange depend on your individual circumstances. You should consult a qualified tax professional, CPA, or tax attorney before initiating any 1031 exchange.` },
    { title:"IRS Challenge Risk.", body:`The IRS may challenge the validity of a 1031 exchange, including the use of DST interests as replacement property. The IRS issued Revenue Ruling 2004-86 recognizing DST interests as like-kind property; however, this ruling is subject to change or reinterpretation. A failed or disqualified exchange would result in immediate recognition of capital gains and depreciation recapture taxes.` },
    { title:"Strict Deadline Requirements.", body:`Section 1031 imposes strict, non-waivable deadlines: (i) the 45-Day Identification Rule, requiring identification of potential replacement properties within 45 calendar days of closing; and (ii) the 180-Day Exchange Period, requiring completion within 180 calendar days (or the due date of your tax return including extensions, if earlier). Failure to meet either deadline results in a failed exchange and full recognition of taxable gain.` },
    { title:"Boot and Partial Exchanges.", body:`Any exchange proceeds not reinvested in replacement property (cash boot), and any reduction in mortgage debt assumed in the replacement (mortgage boot), will result in taxable boot recognized in the year of the exchange. Tax calculators on this platform are estimates only and do not constitute a tax opinion. Actual boot and tax liability must be calculated by a qualified tax professional.` },
    { title:"Qualified Intermediary.", body:`A 1031 exchange requires the use of a qualified intermediary (QI) who is independent from the taxpayer and the transaction. Stax Capital does not serve as a qualified intermediary and does not recommend specific QI firms. Selection of a QI is your sole responsibility; failure of a QI to properly hold and transfer exchange funds may result in a failed exchange and recognition of taxable gain.` },
  ],
  regbi: [
    { title:"Regulation Best Interest.", body:`Stax Capital acts as a broker-dealer under SEC Regulation Best Interest (Reg BI), 17 C.F.R. § 240.15l-1. When making a recommendation to a retail customer, Stax Capital and its registered representatives are required to act in your best interest at the time of the recommendation, without placing the financial or other interest of the Firm ahead of your interests. Reg BI does not establish a fiduciary duty; Stax Capital does not provide ongoing investment monitoring or advisory services.` },
    { title:"Compensation and Conflicts of Interest.", body:`Stax Capital and its registered representatives receive compensation in connection with DST private placements, which may include selling commissions, dealer manager fees, placement fees, and ongoing trail commissions paid by the DST sponsor from offering proceeds. Because compensation amounts vary by offering, representatives have a financial incentive to recommend offerings that pay higher compensation. We mitigate this conflict through a documented due diligence process and supervisory review under FINRA Rule 3110.` },
    { title:"Form CRS.", body:`Our Customer Relationship Summary (Form CRS) describes our brokerage services, fees, conflicts of interest, disciplinary history, and how to obtain additional information. Form CRS is available at staxai.com/formcrs and is provided to you at the initiation of our relationship. You have the right to request a copy at any time by contacting us at 844-427-1031.` },
    { title:"Suitability Analysis.", body:`Pursuant to FINRA Rule 2111, Stax Capital performs a suitability analysis before recommending any DST investment. This analysis considers your investment objectives, risk tolerance, time horizon, liquidity needs, tax status, and financial situation. The DST Hub application collects financial information from you for this purpose. Providing inaccurate or incomplete information may result in an unsuitable recommendation.` },
  ],
  privacy: [
    { title:"Regulation S-P Privacy Notice.", body:`In accordance with SEC Regulation S-P, Stax Capital provides the following privacy notice. We collect nonpublic personal information (NPI) from: information you provide on account opening applications; information about your transactions with us; information from consumer reporting agencies in connection with identity verification; and information from other sources as permitted by law. Full Privacy Policy available at staxai.com/privacy.` },
    { title:"Information Sharing.", body:`We do not sell your NPI to third parties. We may share NPI with: service providers who assist us in processing applications and performing compliance functions; DST sponsors and issuers to the extent necessary to process your investment subscription; FINRA, the SEC, the IRS, and other regulatory agencies as required by law; and other parties with your written consent.` },
    { title:"Data Security.", body:`We maintain physical, electronic, and procedural safeguards that comply with applicable federal standards to protect your NPI from unauthorized access, use, or disclosure. Data transmitted through the DST Hub is encrypted using industry-standard TLS protocols. However, no method of electronic transmission or storage is 100% secure.` },
    { title:"USA PATRIOT Act / AML.", body:`Federal law requires financial institutions to obtain, verify, and record information that identifies each person who opens an account. When you open an account, we will ask for your name, address, date of birth, Social Security Number, and other identifying information. This information is required under the USA PATRIOT Act and FinCEN's Customer Due Diligence Rule.` },
  ],
};

function AppFooter() {
  const [activeTab, setActiveTab] = React.useState("general");
  const coral = CORAL;
  const borderColor = `rgba(37,83,64,0.45)`;

  return (
    <div style={{ background:`linear-gradient(to bottom, ${G.deep}, ${G.darkest})`, borderTop:`1px solid ${borderColor}` }}>

      {/* ── Regulatory strip ── */}
      <div style={{ background:G.darkest, borderBottom:`1px solid ${borderColor}`, padding:"12px 40px", display:"flex", alignItems:"center", gap:28, flexWrap:"wrap" }}>
        {[
          { label:"Member FINRA" },
          { label:"Member SIPC" },
          { label:"SEC-Registered Broker-Dealer" },
          { label:"CRD #315430", muted:true },
        ].map(({ label, muted }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div style={{ width:1, height:20, background:borderColor }}/>}
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background: muted ? "#a09a90" : coral, flexShrink:0 }}/>
              <span style={{ fontSize:10, fontWeight:600, color: muted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)", fontFamily:FONT, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                {muted ? "CRD " : ""}<strong style={{ color: muted ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)", fontWeight:700 }}>{muted ? "#315430" : label}</strong>
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Footer body: brand + links ── */}
      <div style={{ padding:"44px 40px 32px", display:"grid", gridTemplateColumns:"260px 1fr", gap:56 }}>

        {/* Brand / Contact */}
        <div>
          <div style={{ marginBottom:16 }}>
            <img src={STAX_AI_LOGO} alt="StaxAI" style={{ width:120, height:30, objectFit:"contain" }}/>
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.38)", fontFamily:FONT, marginBottom:20, letterSpacing:"0.02em" }}>
            DST &amp; 1031 Exchange Specialists
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:20 }}>
            {[
              { text:"844-427-1031", href:"tel:8444271031" },
              { text:"info@staxai.com", href:"mailto:info@staxai.com" },
              { text:"2262 Carmel Valley Rd, Suite G · Del Mar, CA 92014" },
            ].map(({ text, href }) => (
              href
                ? <a key={text} href={href} style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontFamily:FONT, textDecoration:"none" }}>{text}</a>
                : <span key={text} style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontFamily:FONT }}>{text}</span>
            ))}
          </div>
          <a href="https://brokercheck.finra.org" target="_blank" rel="noopener noreferrer" style={{
            display:"inline-flex", alignItems:"center", gap:7,
            padding:"7px 14px", background:"rgba(255,255,255,0.06)",
            border:`1px solid ${borderColor}`, borderRadius:8,
            fontSize:11, fontWeight:600, color:coral,
            textDecoration:"none", letterSpacing:"0.04em", fontFamily:FONT,
          }}>
            ↗ FINRA BrokerCheck
          </a>
        </div>

        {/* Links grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:32 }}>
          {[
            { heading:"DST Hub", links:["Open Account","DST Marketplace","1031 Exchange Tools","Upload Documents"] },
            { heading:"Compliance", links:["Form CRS","Reg BI Disclosure","Privacy Notice","Business Continuity","Terms of Use"] },
            { heading:"Resources", links:["About Stax Capital","DST Education","1031 Exchange Guide","Contact Us"] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", fontFamily:FONT, marginBottom:14 }}>{heading}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {links.map(link => (
                  <a key={link} href="#" style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontFamily:FONT, textDecoration:"none" }}>{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Legal disclosure block ── */}
      <div style={{ borderTop:`1px solid ${borderColor}`, padding:"28px 40px" }}>
        {/* Tabs */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:20 }}>
          {DISC_TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding:"5px 14px", borderRadius:50, fontFamily:FONT,
              fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.15s",
              background: activeTab === id ? "rgba(255,255,255,0.1)" : "transparent",
              border: `1px solid ${activeTab === id ? "rgba(37,83,64,0.8)" : borderColor}`,
              color: activeTab === id ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
            }}>
              {label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div style={{ columns:2, columnGap:40, fontSize:11, lineHeight:1.75, color:"rgba(255,255,255,0.4)", fontFamily:FONT }}>
          {(DISC_CONTENT[activeTab] || []).map(({ title, body }) => (
            <p key={title} style={{ marginBottom:10, breakInside:"avoid" }}>
              <strong style={{ color:"rgba(255,255,255,0.6)", fontWeight:600 }}>{title}</strong>{" "}{body}
            </p>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ background:G.darkest, borderTop:`1px solid ${borderColor}`, padding:"16px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:FONT }}>
          © {new Date().getFullYear()} Stax Capital, Inc. All rights reserved. &nbsp;|&nbsp; 2262 Carmel Valley Road, Suite G, Del Mar, CA 92014 &nbsp;|&nbsp; CRD #315430
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {["Terms of Use","Privacy Policy","Form CRS","Reg BI Disclosure","BCP Disclosure"].map(link => (
            <a key={link} href="#" style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontFamily:FONT, textDecoration:"none" }}>{link}</a>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DEV: AUTOFILL UTILITY — enabled in development only.
   import.meta.env.DEV is true in `vite dev`, false in
   `vite build` — the dead-code eliminator strips the
   entire button + quickFill() from production bundles.
   ════════════════════════════════════════════════════════ */
const QUICK_FILL_ENABLED = import.meta.env.DEV;

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
export default function DSTOnboarding() {
  /* ── Top-level app state ── */
  const [workflowType, setWorkflowType] = useState(null);
  const [step, setStep] = useState(0);
  const [validationOn, setValidationOn] = useState(false);
  const [subStep, setSubStep] = useState(0);
  const [view, setView] = useState("entry");
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState("All");
  const topRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [showComplianceReview, setShowComplianceReview] = useState(false);
  const [showRegBI, setShowRegBI] = useState(false);
  const [showQC, setShowQC] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [subStepValidation, setSubStepValidation] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [editValidation, setEditValidation] = useState(false);
  const confRef = useRef("STAX-2026-" + Math.random().toString(36).slice(2,8).toUpperCase());
  const nowStr = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });

  /* ── REP Context (rep-initiated workflow) ── */
  const [repCtx, setRepCtx] = useState({
    clientName: "", exchangeAmount: 0, relinquishedAddress: "",
    relinquishedClose: "", crd: "", branchCode: "", repCode: "",
    selectedOfferings: {}, offeringRationale: {},
  });
  const updRep = (k, v) => setRepCtx(p => ({ ...p, [k]: v }));

  /* ── CSS Entry (client self-service) ── */
  const [cssEntry, setCssEntry] = useState({ intent: "", amount: 0, referral: "" });

  /* ── Cart State ── */
  const [cart, setCart] = useState(() => {
    const defaults = {};
    ["passco-prism","nexpoint-outlook","pg-manchester"].forEach(id => {
      const dst = DST_OFFERINGS.find(d => d.id === id);
      if (dst) defaults[id] = dst.minInvestment;
    });
    return defaults;
  });

  /* ── Financial Statement State ── */
  const [fs, setFs] = useState({
    name: "", coName: "",
    cash: 0, savings: 0, stocks: 0, annuities: 0, lifeIns: 0,
    retStocks: 0, retPension: 0,
    primary: 0, investRE: 0, reSec: 0, nonReAlts: 0, intervalFunds: 0,
    business: 0, exchange1031: 0, notes: 0,
    curLiab: 0, notesPayable: 0, taxRate: 0,
    stateOfResidence: "", stateTaxRate: 0, federalBracket: 0,
    adjustedBasis: 0, depreciationRecapture: 0,
    empInc: 0, invInc: 0, retInc: 0, expenses: 0,
    agreed: false,
  });
  const setFsField = (k, v) => setFs(p => ({ ...p, [k]: v }));
  const [sectionSnapshot, setSectionSnapshot] = useState(null);
  const [savedSections, setSavedSections] = useState({ liquid: false, retire: false, realty: false, alts: false, income: false, liabs: false });

  /* ── Full Account Opening (NAF) State ── */
  const [acct, setAcct] = useState({
    // Account Status / Type
    accountStatus: "", exchangeBusiness: false, directBusiness: false, brokenBusiness: false,
    registrationCategory: "", individualType: "", entityType: "", entityName: "",
    accountType: "", investmentTitle: "", iraOwner: "", iraCustodian: "", iraCustodianEIN: "",
    // Personal Info
    title: "", firstName: "", middleName: "", lastName: "", phone: "", email: "",
    dob: "", ssn: "", citizenship: "United States", residence: "United States",
    maritalStatus: "", dependents: "",
    // Address
    street: "", city: "", state: "", zip: "", country: "United States",
    lessThanOneYear: false, prevStreet: "", prevCity: "", prevState: "", prevZip: "",
    hasDiffMailing: false, mailingSame: true,
    mailingStreet: "", mailingCity: "", mailingState: "", mailingZip: "", mailingCountry: "United States",
    mailStreet: "", mailCity: "", mailState: "", mailZip: "",
    // Employment
    employmentStatus: "", occupation: "", employer: "", employerAddress: "", incomeSource: "",
    // PATRIOT Act / CIP
    idType: "", idNumber: "", idState: "", idExpiry: "",
    householdStatus: "",
    // Co-Applicant
    hasCoApplicant: false, coTitle: "", coFirstName: "", coMiddleName: "", coLastName: "",
    coPhone: "", coEmail: "", coStreet: "", coCity: "", coState: "", coZip: "", coCountry: "United States",
    coDob: "", coSsn: "", coCitizenship: "United States", coEmploymentStatus: "", coOccupation: "", coEmployer: "",
    coHouseholdStatus: "", coDependents: "",
    // Distributions / Banking
    distributionMethod: "", bankName: "", bankCity: "", bankState: "", bankZip: "", bankCountry: "United States",
    bankAccountType: "", routingNumber: "", accountNumber: "",
    bankRouting: "", bankAccount: "", bankTitle: "", bankSameOwner: true,
    // Trusted Contact
    hasTrustedContact: "", tcTitle: "", tcFirstName: "", tcMiddleName: "", tcLastName: "",
    tcWorkPhone: "", tcMobilePhone: "", tcEmail: "", tcFirst: "", tcLast: "", tcPhone: "",
    tcRelationship: "", tcDecline: false,
    // Beneficiaries
    beneficiaries: [], contingentBeneficiaries: [],
    // Suitability
    fundingSource: "", liquidityNeeds: "", specialExpenses: "", specialExpensesTimeframe: "",
    investmentObjectives: [], investObjectives: [], timeHorizon: "", riskTolerance: "",
    // Experience
    primaryExperience: {}, coExperience: {},
    investExp: { stocks: "", bonds: "", mutualFunds: "", annuities: "", options: "", reits: "", privatePlacements: "", realEstate: "" },
    // Disclosures / Affiliations
    emergencyFunds: "", concentrationAcknowledged: false,
    seniorAck1: false, seniorAck2: false, seniorAck3: false,
    industryAffiliated: "", affiliatedEntity: "", affiliatedRelationship: "",
    finraAffiliated: false, finraFirm: "", finraAck: false,
    isPoliticalOfficial: "", publicOfficer: false, publicCompany: "", publicTicker: "", rule144Ack: false,
    tenPctShareholder: false, tenPctDisclosure: "",
    taxStatus: "", backupWithholding: false,
    // 1031 Exchange
    estimatedTaxLiability: "", knowsTaxLiab: "", taxImpactOnRisk: "", exchange1031Acknowledged: false,
    qiContactName: "", qiCompany: "", qiAddress: "", qiCity: "", qiState: "",
    qiZip: "", qiCountry: "United States", qiCell: "", qiBusiness: "", qiEmail: "", qiExchangeNumber: "",
    escrowClosed: "", hasQI: "", qiReferralConsent: false, propertyStatus: "",
    estimatedListingDate: "", estimatedEscrowOpenDate: "",
    // 1031 Exchange — Relinquished Property Details
    rp_address: "", rp_city: "", rp_state: "", rp_zip: "",
    rp_propertyType: "", rp_originalPurchaseDate: "", rp_dateOfSale: "", rp_salePrice: 0, rp_originalPurchasePrice: 0,
    rp_improvementRatio: 70, rp_depreciationOverridden: false, rp_depEstExpanded: false,
    rp_improvements: 0, rp_accumulatedDepreciation: 0, rp_sellingExpenses: 0,
    rp_existingMortgage: 0, rp_annualIncome: 0, rp_annualExpenses: 0,
    // 1031 Exchange — Timeline
    exchangeStartDate: "",
    identificationDeadline: "",
    closingDeadline: "",
    propertiesIdentified: false,
    // 1031 Exchange — Tax Calculator
    showTaxCalculator: false,
    tc_filingStatus: "", tc_stateOfResidence: "",
    tc_federalCapGainRate: 20, tc_stateIncomeRate: 0, tc_depreciationRecaptureRate: 25,
    tc_niitRate: 3.8, tc_niitApplies: false,
    tc_yearsHeld: 0,
    // 1031 Exchange — Debt Replacement
    rp_debtRetired: 0,
    replacementDebt: 0,
    // 1031 Exchange — Acknowledgments
    taxCalcDisclosureAck: false, noTaxAdviceAck: false,
    exchangeTimelineAck: false, debtReplacementAck: false,
    // Accredited Investor Certification
    accredited: "", accreditedBasis: "",
    accreditedSubBasis: "",
    accreditedVerifyMethod: "",
    accreditedThirdPartyType: "",
    accreditedThirdPartyName: "",
    accreditedThirdPartyFirm: "",
    accreditedThirdPartyDate: "",
    accreditedLicenseType: "",
    accreditedLicenseCRD: "",
    accreditedNoFinancing: false,
    accreditedSelfCert: false,
    accreditedMeetsMinInvest: false,
    accreditedCertDate: "",
    accreditedCertSig: "",
    accreditedCertSigned: false,
    // Entity / Beneficial Ownership
    controlName: "", controlTitle: "", controlDob: "", controlSsn: "", controlAddress: "",
    controlOwnership: "",
    noBeneficialOwner: false, trusteeName: "", trustDate: "", trustState: "",
  });
  const updAcct = (k, v) => setAcct(p => ({ ...p, [k]: v }));

  /* ── Entity Details & Beneficial Owners (FinCEN CDD Rule / FINRA Rule 4512) ── */
  const EMPTY_BO = { name:"", dob:"", ssn:"", ownershipPct:"", street:"", city:"", state:"", zip:"", country:"United States" };
  const EMPTY_SIGNER = { name:"", title:"", phone:"", email:"" };
  const [entityInfo, setEntityInfo] = useState({
    ein: "", ssnAlt: "", dateOfFormation: "", stateOfFormation: "",
    primaryPhone: "", email: "",
    primaryAuthorized: "", coAuthorized: "",
  });
  const updEntity = (k, v) => setEntityInfo(p => ({ ...p, [k]: v }));
  const updCtrl = (k, v) => setControlPerson(p => ({ ...p, [k]: v }));
  const [controlPerson, setControlPerson] = useState({ name:"", title:"", dob:"", ssn:"", street:"", city:"", state:"", zip:"", country:"United States" });
  const updControl = (k, v) => setControlPerson(p => ({ ...p, [k]: v }));
  const [beneficialOwners, setBeneficialOwners] = useState([]);
  const addBO = () => setBeneficialOwners(p => [...p, { ...EMPTY_BO }]);
  const updBO = (i, k, v) => setBeneficialOwners(p => p.map((o, idx) => idx === i ? { ...o, [k]: v } : o));
  const rmBO = i => setBeneficialOwners(p => p.filter((_, idx) => idx !== i));
  const [accountSigners, setAccountSigners] = useState([]);
  const addSigner = () => setAccountSigners(p => [...p, { ...EMPTY_SIGNER }]);
  const updSigner = (i, k, v) => setAccountSigners(p => p.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  const rmSigner = i => setAccountSigners(p => p.filter((_, idx) => idx !== i));

  /* ── Document Uploads State ── */
  const [docs, setDocs] = useState({
    primaryId: [], coApplicantId: [], entityDocs: [],
    govId: [], voidedCheck: [], trustDocs: [], iraDocs: [], accreditedDocs: [], closingStatement: [], ownerAccreditedDocs: [],
  });
  const setDocFiles = (key, files) => setDocs(p => ({
    ...p,
    [key]: typeof files === "function" ? files(p[key]) : files,
  }));

  /* ── Disclosures State (15 items) ── */
  const [disc, setDisc] = useState({
    materialReviewed: false, offering: false, illiquidity: false,
    risk: false, noGuarantee: false, exchange1031: false,
    concentration: false, additionalDebt: false, arbitration: false, independentAdvice: false,
    formCRS: false, regBI: false, privacy: false, brokerCheck: false, esign: false,
  });
  const updDisc = (k, v) => setDisc(p => ({ ...p, [k]: v }));
  const allDiscChecked = Object.values(disc).every(Boolean);

  /* ── Signatures ── */
  const [sig, setSig] = useState({ primary: "", co: "", typed: "", agree: false });
  const [regBISig, setRegBISig] = useState({ typed: "", care: "", conflicts: "", narrative: "" });

  /* ── Financial Step State ── */
  const [openSection, setOpenSection] = useState("liquid");

  /* ── Compliance Flag Acceptance State ── */
  const [flagAcks, setFlagAcks] = useState({});
  const [flagHoldHarmless, setFlagHoldHarmless] = useState(false);
  const [flagSig, setFlagSig] = useState("");
  const [noTelAuth, setNoTelAuth] = useState(false);
  const [noElecDel, setNoElecDel] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);

  /* ── Audit Log ── */
  const [auditLog, setAuditLog] = useState([createAuditEntry("system", "Application initialized")]);
  const addAudit = useCallback((type, desc, user) => {
    setAuditLog(p => [...p, createAuditEntry(type, desc, user)]);
  }, []);

  /* ── Auto-save ── */
  const appState = useMemo(() => ({ workflowType, step, subStep, repCtx, cart, fs, acct, disc, docs, sig }), [workflowType, step, subStep, repCtx, cart, fs, acct, disc, docs, sig]);
  const saved = useAutoSave(appState);

  /* ── Derived: Cart ── */
  const cartItems = useMemo(() =>
    DST_OFFERINGS.filter(d => (cart[d.id] || 0) > 0).map(d => ({ ...d, amount: cart[d.id] }))
  , [cart]);
  const cartTotal = useMemo(() => cartItems.reduce((s, i) => s + (cart[i.id] || 0), 0), [cartItems, cart]);
  const cartCount = cartItems.length;

  /* ── Derived: Financial Calculations ── */
  const fsCalcs = useMemo(() => {
    const cashEquiv   = fs.cash + fs.savings + fs.exchange1031;
    const mktSec      = fs.stocks + fs.annuities + fs.lifeIns;
    const retAccounts = fs.retStocks + fs.retPension;
    const illiquid    = fs.primary + fs.investRE + fs.reSec + fs.nonReAlts
                      + fs.intervalFunds + fs.business + fs.notes;
    const totalLiab   = fs.curLiab + fs.notesPayable;
    const grossInc    = fs.empInc + fs.invInc + fs.retInc;
    const netInc      = grossInc - fs.expenses;
    const totalAssets  = cashEquiv + mktSec + retAccounts + illiquid;
    const netWorth     = totalAssets - totalLiab;
    const netWorthExRes = netWorth - fs.primary;
    const totalLiquid  = cashEquiv + mktSec;

    const safe = (n, d) => d > 0 ? (n / d * 100) : 0;

    // Concentration (pre / post)
    const postReSec    = fs.reSec + cartTotal;
    const postIlliquid = illiquid + cartTotal;
    const preConReSec  = safe(fs.reSec, netWorthExRes);
    const postConReSec = safe(postReSec, netWorthExRes + cartTotal);
    const preConAlts   = safe(illiquid - fs.primary, netWorthExRes);
    const postConAlts  = safe(postIlliquid - fs.primary, netWorthExRes + cartTotal);

    // Liquidity
    const liquidityPct     = safe(totalLiquid, netWorthExRes);
    const liquidityPostPct = safe(totalLiquid - cartTotal, netWorthExRes + cartTotal);
    const cashLiquidityPct = safe(cashEquiv, netWorthExRes);

    // Investment as % of NW / Liquid
    const investAsNwPct     = safe(cartTotal, netWorthExRes);
    const investAsLiquidPct = safe(cartTotal, totalLiquid);

    // Debt-to-Asset
    const debtToAsset = safe(totalLiab, totalAssets);

    // Emergency Reserve
    const monthlyExp      = fs.expenses > 0 ? fs.expenses / 12 : 0;
    const emergencyMonths = monthlyExp > 0 ? cashEquiv / monthlyExp : null;

    // Income Coverage
    const incomeCoverage = fs.expenses > 0 ? grossInc / fs.expenses : null;

    // Accredited thresholds
    const meetsIncomeTest = grossInc >= 200000;
    const meetsNwTest     = netWorthExRes >= 1000000;

    // Illiquid post
    const totalIlliquidPost = illiquid - fs.primary + cartTotal;
    const illiquidPctPost   = safe(totalIlliquidPost, netWorthExRes + cartTotal);

    // Detailed concentration table
    const preReSecPct     = safe(fs.reSec, netWorthExRes);
    const preNonReAltsPct = safe(fs.nonReAlts, netWorthExRes);
    const preIntervalPct  = safe(fs.intervalFunds, netWorthExRes);
    const preAllIlliqPct  = safe(illiquid - fs.primary, netWorthExRes);
    const postReSec2      = fs.reSec + cartTotal;
    const postAllIlliq    = illiquid - fs.primary + cartTotal;
    const postReSecPct    = safe(postReSec2, netWorthExRes);
    const postNonReAltsPct = safe(fs.nonReAlts, netWorthExRes);
    const postIntervalPct = safe(fs.intervalFunds, netWorthExRes);
    const postAllIlliqPct = safe(postAllIlliq, netWorthExRes);
    const deltaReSec      = postReSecPct - preReSecPct;
    const deltaAllIlliq   = postAllIlliqPct - preAllIlliqPct;

    // 1031 Tax calculations
    const exchangeAmount = workflowType === "rep-initiated" ? repCtx.exchangeAmount : (acct.exchangeBusiness ? fs.exchange1031 : cartTotal);
    const unallocated = Math.max(0, exchangeAmount - cartTotal);
    const capitalGains = exchangeAmount > fs.adjustedBasis ? exchangeAmount - fs.adjustedBasis : 0;
    const federalTax = capitalGains * (fs.federalBracket / 100);
    const stateTax = capitalGains * (fs.stateTaxRate / 100);
    const depRecapture = fs.depreciationRecapture * 0.25;
    const totalDeferredTax = federalTax + stateTax + depRecapture;
    const bootTax = unallocated > 0 ? unallocated * ((fs.federalBracket + fs.stateTaxRate) / 100) : 0;

    return {
      cashEquiv, mktSec, retAccounts, illiquid, totalLiab, grossInc, netInc,
      totalAssets, netWorth, netWorthExRes, totalLiquid,
      preConReSec, postConReSec, preConAlts, postConAlts,
      liquidityPct, liquidityPostPct, cashLiquidityPct,
      investAsNwPct, investAsLiquidPct,
      debtToAsset, emergencyMonths, monthlyExp,
      incomeCoverage, meetsIncomeTest, meetsNwTest,
      illiquidPctPost,
      preReSecPct, preNonReAltsPct, preIntervalPct, preAllIlliqPct,
      postReSecPct, postNonReAltsPct, postIntervalPct, postAllIlliqPct,
      postReSec2, postAllIlliq, deltaReSec, deltaAllIlliq,
      exchangeAmount, unallocated, capitalGains, federalTax, stateTax,
      depRecapture, totalDeferredTax, bootTax,
    };
  }, [fs, cartTotal, workflowType, repCtx.exchangeAmount, cssEntry.amount]);

  /* ── Minimum Investment Threshold Auto-Select / Block ── */
  useEffect(() => {
    const threshold = acct.registrationCategory === "entity" ? 1000000 : 200000;
    const qualifies = cartTotal >= threshold;
    if (qualifies && !acct.accreditedVerifyMethod) {
      updAcct("accreditedVerifyMethod", "min_investment");
    } else if (!qualifies && acct.accreditedVerifyMethod === "min_investment") {
      updAcct("accreditedVerifyMethod", "");
    }
  }, [cartTotal, acct.registrationCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Sub-step reset on outer step change ── */
  useEffect(() => {
    setSubStep(0);
    setSubStepValidation(false);
    setValidationOn(false);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Senior Investor Auto-Detection (FINRA Rule 2165 / NASAA Model Rule) ── */
  const isSeniorDetected = useMemo(() => {
    const dobDigits = (acct.dob || "").replace(/\D/g, "");
    let primaryAge = null;
    if (dobDigits.length === 8) {
      const m = parseInt(dobDigits.slice(0,2),10), d = parseInt(dobDigits.slice(2,4),10), y = parseInt(dobDigits.slice(4),10);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900) {
        const today = new Date();
        const bday = new Date(y, m - 1, d);
        primaryAge = Math.floor((today - bday) / (365.25 * 24 * 60 * 60 * 1000));
      }
    }
    const coDobDigits = (acct.coDob || "").replace(/\D/g, "");
    let coAge = null;
    if (acct.hasCoApplicant && coDobDigits.length === 8) {
      const m = parseInt(coDobDigits.slice(0,2),10), d = parseInt(coDobDigits.slice(2,4),10), y = parseInt(coDobDigits.slice(4),10);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900) {
        const today = new Date();
        const bday = new Date(y, m - 1, d);
        coAge = Math.floor((today - bday) / (365.25 * 24 * 60 * 60 * 1000));
      }
    }
    const ageTriggered = (primaryAge !== null && primaryAge >= 60) || (coAge !== null && coAge >= 60);
    const retiredTriggered = acct.employmentStatus === "Retired" || (acct.hasCoApplicant && acct.coEmploymentStatus === "Retired");
    return { detected: ageTriggered || retiredTriggered, primaryAge, coAge, ageTriggered, retiredTriggered };
  }, [acct.dob, acct.coDob, acct.employmentStatus, acct.coEmploymentStatus, acct.hasCoApplicant]);

  /* ── Age / derived flags ── */
  const primaryAge = calcAge(acct.dob);
  const isSenior = primaryAge !== null && primaryAge >= 65;
  const isMinor = primaryAge !== null && primaryAge < 18;
  const isEntity = acct.registrationCategory === "entity" || ["llc","corporation","trust","partnership","other_entity"].includes(acct.entityType || acct.accountType);
  const isBizEntity = isEntity && ["llc","corporation","partnership","other_entity"].includes(acct.entityType || acct.accountType);
  const isIRA = ["trad_ira","roth_ira","sep_ira"].includes(acct.accountType);
  const isJoint = (acct.accountType || "").startsWith("joint_");
  const idDaysLeft = daysUntil(acct.idExpiry);

  /* ── REP Deadlines ── */
  const closeDate = parseDate(repCtx.relinquishedClose);
  const deadline45 = closeDate ? fmtDateObj(addDays(closeDate, 45)) : "";
  const deadline180 = closeDate ? fmtDateObj(addDays(closeDate, 180)) : "";
  const daysTo45 = closeDate ? daysUntil(fmtDateObj(addDays(closeDate, 45))) : null;

  /* ══════════════════════════════════════════════════════
     COMPLIANCE FLAGS — 24+ flags with full detail text
     ══════════════════════════════════════════════════════ */
  const compFlags = useMemo(() => {
    const f = [];

    // Accredited Investor — Block
    if (acct.accredited === "No") f.push({ id:"acc-block", type:"block", msg:"Investor must be an accredited investor. DST investments require accredited investor status per SEC Regulation D.",
      detail:"Under SEC Regulation D, Rule 506(b) and 506(c), DST investments are offered exclusively to accredited investors as defined in Rule 501 of Regulation D. Accredited investor status requires either (a) individual income exceeding $200,000 (or $300,000 jointly with spouse) in each of the two most recent years with a reasonable expectation of the same in the current year, or (b) individual net worth (or joint net worth with spouse) exceeding $1,000,000, excluding the value of primary residence. This is a non-waivable regulatory requirement." });

    // Accredited Investor Cross-Validation Flags
    if (acct.accredited === "Yes" && acct.accreditedBasis === "income_200k" && fsCalcs.totalAssets > 0 && !fsCalcs.meetsIncomeTest)
      f.push({ id:"acc-income-mismatch", type:"warn", msg:"Accredited basis is income ($200K+) but Financial Statement shows gross income of " + fmtFull(fsCalcs.grossInc) + ". Enhanced verification required.",
        detail:"The investor has self-certified accredited investor status based on the income threshold under Rule 501(a)(6), but the Financial Statement submitted shows gross annual income below $200,000. This discrepancy requires enhanced review by the supervising principal. The investor may still qualify if: (a) the Financial Statement is incomplete, (b) prior-year income met the threshold, or (c) joint income with spouse/spousal equivalent exceeds $300,000. Additional documentation may be required per FINRA Regulation Best Interest." });
    if (acct.accredited === "Yes" && acct.accreditedBasis === "net_worth_1m" && fsCalcs.totalAssets > 0 && !fsCalcs.meetsNwTest)
      f.push({ id:"acc-nw-mismatch", type:"warn", msg:"Accredited basis is net worth ($1M+ ex-primary) but Financial Statement shows NW ex-primary of " + fmtFull(fsCalcs.netWorthExRes) + ". Enhanced verification required.",
        detail:"The investor has self-certified accredited investor status based on the net worth threshold under Rule 501(a)(5), but the Financial Statement submitted shows Net Worth excluding Primary Residence below $1,000,000. This discrepancy requires enhanced review by the supervising principal." });
    if (acct.accredited === "Yes" && !acct.accreditedSelfCert)
      f.push({ id:"acc-cert-incomplete", type:"warn", msg:"Accredited Investor Certification has not been signed. Certification is required before investment.",
        detail:"The investor has indicated accredited investor status but has not completed the formal Accredited Investor Certification including the required representations and electronic signature. Per SEC Regulation D and FINRA Rule 5123, proper documentation of accredited investor status is required prior to the sale of securities in a Rule 506 offering." });

    // Minor — Block
    if (isMinor) f.push({ id:"minor-block", type:"block", msg:"Applicant is under 18. Investment not permitted." });

    // Non-US residence — Block
    if (acct.residence && acct.residence !== "United States") f.push({ id:"non-us-block", type:"block", msg:"Non-US residents cannot open accounts — jurisdictional limitation." });

    // Non-US citizenship — Warn
    if (acct.citizenship && acct.citizenship !== "United States" && acct.citizenship !== "") f.push({ id:"non-us-cit", type:"warn", msg:"Non-US citizenship — enhanced due diligence may be required." });

    // ID expired — Block
    if (idDaysLeft !== null && idDaysLeft < 0) f.push({ id:"id-expired", type:"block", msg:"Government ID is expired." });
    if (idDaysLeft !== null && idDaysLeft >= 0 && idDaysLeft < 90) f.push({ id:"id-expiring", type:"warn", msg:`Government ID expires in ${idDaysLeft} days — consider requesting renewal.` });

    // SSN all zeros — Block
    if (acct.ssn && acct.ssn.replace(/\D/g, "") === "000000000") f.push({ id:"ssn-zeros", type:"block", msg:"SSN cannot be all zeros." });
    /* v1.2 fix: co-applicant SSN zeros block flag */
    if (acct.hasCoApplicant && acct.coSsn && acct.coSsn.replace(/\D/g,"") === "000000000")
      f.push({ id:"co-ssn-zeros", type:"block", msg:"Co-Applicant SSN cannot be all zeros.",
        detail:"A Social Security Number of 000-00-0000 is not a valid tax identification number. Please verify and re-enter the co-applicant's correct SSN. This is a blocking compliance issue per USA PATRIOT Act Customer Identification Program requirements." });

    // Emergency funds
    if (acct.emergencyFunds === "No") f.push({ id:"emerg-warn", type:"warn", msg:"Investor does not confirm adequate emergency funds. Please discuss liquidity reserve requirements.",
      detail:"FINRA Regulation Best Interest requires that broker-dealers have a reasonable basis to believe that a recommended investment is suitable for the customer. DST investments are illiquid, with no established secondary market and hold periods of 7–10+ years. Without adequate emergency reserves (recommended minimum of 3–6 months of living expenses in liquid assets), an investor's ability to meet unforeseen financial obligations may be materially compromised." });

    // Liquidity needs
    if (acct.liquidityNeeds === "Very Important" || acct.liquidityNeeds === "Significant") f.push({ id:"liq-warn", type:"warn", msg:"DST investments are illiquid with no secondary market. Investor has indicated liquidity is very important.",
      detail:"The investor has indicated that liquidity is important to their overall investment strategy. DST interests are illiquid private placement securities with no established secondary market. Investors must be prepared to hold these investments for the entire projected hold period (typically 7–10 years)." });

    // Senior investor detection
    if (isSeniorDetected.detected && (!acct.seniorAck1 || !acct.seniorAck2 || !acct.seniorAck3)) {
      const reasons = [];
      if (isSeniorDetected.ageTriggered) reasons.push(`age ${isSeniorDetected.primaryAge || isSeniorDetected.coAge}+`);
      if (isSeniorDetected.retiredTriggered) reasons.push("retired status");
      f.push({ id:"senior-warn", type:"warn", msg:`Senior investor detected (${reasons.join(", ")}). All three acknowledgments are required.`,
        detail:"FINRA Rule 2165 and NASAA Model Rule provide heightened protections for senior investors (age 60+, retired, or within five years of retirement). Regulators have heightened scrutiny of suitability issues as they relate to senior investors." });
    }
    if (isSenior) f.push({ id:"senior-flag", type:"flag", msg:"Senior investor (age 65+). Consider additional suitability documentation." });

    // FINRA affiliation
    if (acct.finraAffiliated) f.push({ id:"finra-aff", type:"flag", msg:"FINRA affiliation disclosed — acknowledgment required." });

    // Public officer
    if (acct.publicOfficer) f.push({ id:"public-officer", type:"flag", msg:"Public company director/officer — Rule 144 restrictions apply." });

    // Time horizon mismatch
    if ((/* v1.2: timeHorizon is "0-3 Years" from TSelect */ acct.timeHorizon === "0-3 Years" || acct.timeHorizon === "Short" || acct.timeHorizon === "1-3") && cartItems.some(i => parseInt(i.holdPeriod) > 3)) f.push({ id:"horizon-mismatch", type:"warn", msg:"Investment hold period exceeds stated short time horizon." });

    // Risk/objective mismatch
    if ((acct.investmentObjectives || []).includes("Preservation") && acct.riskTolerance === "Speculative") f.push({ id:"obj-risk-mismatch", type:"warn", msg:"Risk tolerance inconsistent with preservation objective." });

    // Property hard flags
    cartItems.forEach(item => {
      if (item.hardFlags && item.hardFlags.length > 0) f.push({ id:`prop-${item.id}`, type:"flag", msg:`${item.shortName}: ${item.hardFlags[0]}`,
        detail:`The Stax Capital Scoring Model has identified a potential concern with the ${item.name} offering: "${item.hardFlags[0]}". This flag was generated during the due diligence review process.` });
    });

    // Concentration — RE Securities
    if (fsCalcs.postConReSec > 50) f.push({ id:"conc-resec", type:"warn", msg:`RE Securities concentration post-investment is ${fsCalcs.postConReSec.toFixed(1)}% — exceeds 50% guideline. Enhanced disclosure required.`,
      detail:`Post-investment, the investor's equity invested in Real Estate Securities will represent approximately ${fsCalcs.postConReSec.toFixed(1)}% of Net Worth excluding Primary Residence. This exceeds the 50% concentration guideline. Pre-investment RE Securities: ${fsCalcs.preReSecPct.toFixed(1)}% → Post-investment: ${fsCalcs.postReSecPct.toFixed(1)}% (+${fsCalcs.deltaReSec.toFixed(1)}pp).` });

    // Concentration — All alternatives
    if (fsCalcs.postConAlts > 60) f.push({ id:"conc-alts", type:"warn", msg:`All alternative investments post-investment is ${fsCalcs.postConAlts.toFixed(1)}% of NW ex-res — exceeds 60% guideline.`,
      detail:`Post-investment, the investor's total allocation to alternative and illiquid investments will represent approximately ${fsCalcs.postConAlts.toFixed(1)}% of Net Worth excluding Primary Residence. Pre-investment: ${fsCalcs.preAllIlliqPct.toFixed(1)}% → Post-investment: ${fsCalcs.postAllIlliqPct.toFixed(1)}% (+${fsCalcs.deltaAllIlliq.toFixed(1)}pp).` });

    // Document upload flags
    if (docs.primaryId.length === 0 && docs.govId.length === 0)
      f.push({ id:"doc-primary-id", type:"block", msg:"Government-issued photo ID required — upload in PATRIOT Act section.",
        detail:"Federal law under the USA PATRIOT Act requires that broker-dealers obtain, verify, and record information that identifies each account holder, including a copy of current government-issued photo identification." });
    if (acct.hasCoApplicant && docs.coApplicantId.length === 0)
      f.push({ id:"doc-co-id", type:"block", msg:"Co-applicant photo ID required — upload in Co-Applicant section." });
    if (isEntity && acct.entityType && docs.entityDocs.length === 0)
      f.push({ id:"doc-entity", type:"block", msg:"Entity formation documents required — upload in Account Registration section." });

    // Beneficial Ownership / CDD
    if (isEntity && acct.entityType) {
      if (!entityInfo.ein)
        f.push({ id:"entity-ein", type:"block", msg:"Entity EIN / Tax ID is required for all entity accounts.",
          detail:"FINRA Rule 4512 and the FinCEN CDD Rule require broker-dealers to collect the taxpayer identification number for all legal entity customers." });
      /* v1.2 fix: trim whitespace before empty check */
      if (!controlPerson.name || !controlPerson.name.trim())
        f.push({ id:"entity-control", type:"block", msg:"A control person is required per FinCEN Customer Due Diligence (CDD) Rule.",
          detail:"Under 31 CFR § 1010.230, broker-dealers must identify a single individual with significant responsibility to control, manage, or direct the legal entity customer." });
      if (isBizEntity && beneficialOwners.length === 0)
        f.push({ id:"entity-bo", type:"warn", msg:"No beneficial owners listed. CDD Rule requires identification of all individuals owning 25%+ equity." });
      if (accountSigners.length === 0 && !entityInfo.primaryAuthorized)
        f.push({ id:"entity-signers", type:"warn", msg:"No authorized signers identified for entity account." });
    }

    // Negative net worth ex-primary
    if (fsCalcs.netWorth > 0 && fsCalcs.netWorthExRes < 0)
      f.push({ id:"nw-neg", type:"warn", msg:"Net Worth ex-Primary Residence is negative. Suitability of illiquid investment requires enhanced review.",
        detail:"The investor's Net Worth excluding Primary Residence is negative. This raises significant suitability concerns for illiquid private placement investments." });

    // Liquidity checks
    if (fsCalcs.totalAssets > 0) {
      if (fsCalcs.liquidityPostPct < 5 && fsCalcs.liquidityPostPct >= 0)
        f.push({ id:"liq-block", type:"block", msg:`Post-investment liquidity would be ${fsCalcs.liquidityPostPct.toFixed(1)}% of NW ex-res — critically below the 5% minimum threshold.`,
          detail:`Post-investment liquidity of ${fsCalcs.liquidityPostPct.toFixed(1)}% is critically below the 5% minimum. Current liquid assets: ${fmtFull(fsCalcs.totalLiquid)}. Proposed investment: ${fmtFull(cartTotal)}.` });
      else if (fsCalcs.liquidityPostPct < 10)
        f.push({ id:"liq-low", type:"warn", msg:`Post-investment liquidity is projected at ${fsCalcs.liquidityPostPct.toFixed(1)}% of NW ex-res — below the 10% guideline.` });
      else if (fsCalcs.liquidityPostPct < 15)
        f.push({ id:"liq-note", type:"flag", msg:`Post-investment liquidity of ${fsCalcs.liquidityPostPct.toFixed(1)}% is below the 15% best-practice guideline.` });
    }

    // Investment as % of liquid assets
    if (fsCalcs.totalLiquid > 0 && cartTotal > 0) {
      if (fsCalcs.investAsLiquidPct > 75)
        f.push({ id:"inv-liq-high", type:"warn", msg:`This investment represents ${fsCalcs.investAsLiquidPct.toFixed(1)}% of total liquid assets — exceeds 75% guideline.`,
          detail:`The proposed investment of ${fmtFull(cartTotal)} represents ${fsCalcs.investAsLiquidPct.toFixed(1)}% of total liquid assets (${fmtFull(fsCalcs.totalLiquid)}). After this investment, remaining liquid assets would be approximately ${fmtFull(fsCalcs.totalLiquid - cartTotal)}.` });
      else if (fsCalcs.investAsLiquidPct > 50)
        f.push({ id:"inv-liq-mod", type:"flag", msg:`This investment represents ${fsCalcs.investAsLiquidPct.toFixed(1)}% of liquid assets — monitor post-investment liquidity position.` });
    }

    // Single offering concentration
    if (fsCalcs.netWorthExRes > 0 && cartTotal > 0 && fsCalcs.investAsNwPct > 25)
      f.push({ id:"conc-single", type:"flag", msg:`This DST investment represents ${fsCalcs.investAsNwPct.toFixed(1)}% of NW ex-res — exceeds 25% single-offering concentration guideline.` });

    // Debt-to-asset
    if (fsCalcs.totalAssets > 0) {
      if (fsCalcs.debtToAsset > 50)
        f.push({ id:"da-high", type:"warn", msg:`Debt-to-asset ratio is ${fsCalcs.debtToAsset.toFixed(1)}% — elevated leverage may affect suitability for illiquid investments.` });
      else if (fsCalcs.debtToAsset > 35)
        f.push({ id:"da-mod", type:"flag", msg:`Debt-to-asset ratio is ${fsCalcs.debtToAsset.toFixed(1)}% — above the 35% guideline.` });
    }

    // Emergency reserve
    if (fsCalcs.emergencyMonths !== null && fsCalcs.monthlyExp > 0) {
      if (fsCalcs.emergencyMonths < 1)
        f.push({ id:"er-crit", type:"warn", msg:`Cash reserve covers only ${fsCalcs.emergencyMonths.toFixed(1)} months of expenses — critically below the 3-month minimum.` });
      else if (fsCalcs.emergencyMonths < 3)
        f.push({ id:"er-low", type:"warn", msg:`Cash reserve covers ${fsCalcs.emergencyMonths.toFixed(1)} months of expenses — below the 3-month minimum guideline.` });
    }

    // Income coverage
    if (fsCalcs.incomeCoverage !== null && fsCalcs.incomeCoverage < 1.0 && fsCalcs.grossInc > 0)
      f.push({ id:"inc-neg", type:"warn", msg:`Annual expenses exceed gross income (coverage ratio: ${fsCalcs.incomeCoverage.toFixed(2)}x) — negative cash flow may affect ability to meet obligations.` });

    // Boot tax
    if (fsCalcs.bootTax > 50000) f.push({ id:"boot-high", type:"warn", msg:`Boot tax liability of ${fmtFull(fsCalcs.bootTax)} exceeds $50,000 — review with tax advisor.` });

    // IRA / 721 UPREIT check
    if (isIRA && cartItems.some(i => i.name.includes("721"))) f.push({ id:"ira-721", type:"block", msg:"DST 721 UPREIT investments not permitted in IRA accounts." });

    return f;
  }, [acct, cartItems, fsCalcs, cartTotal, fs.expenses, fs.reSec, fs.nonReAlts, fs.intervalFunds, docs, entityInfo, controlPerson, beneficialOwners, accountSigners, isSeniorDetected, isMinor, isSenior, isEntity, isBizEntity, isIRA, idDaysLeft]);

  const blockFlags = compFlags.filter(f => f.type === "block");
  const warningFlags = compFlags.filter(f => f.type === "warn");
  const infoFlags = compFlags.filter(f => f.type === "flag");
  const nonBlockFlags = compFlags.filter(f => f.type !== "block");
  const requiresFlagAcceptance = nonBlockFlags.length > 0;
  const allFlagsAcked = nonBlockFlags.every(f => flagAcks[f.id]);

  /* ══════════════════════════════════════════════════════
     buildComplianceData — 26 checks across 8 categories
     ══════════════════════════════════════════════════════ */
  const buildComplianceData = () => {
    const fmtA = v => v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;
    const adjBasis   = (acct.rp_originalPurchasePrice || 0) + (acct.rp_improvements || 0) - (acct.rp_accumulatedDepreciation || 0);
    const realizedGain = Math.max(0, ((acct.rp_salePrice || 0) - (acct.rp_sellingExpenses || 0)) - adjBasis);
    const allChecks = [
      /* ── Accreditation ── */
      { cat:"Accreditation", rule:"SEC Reg D §501(a)", check:"Accredited investor status confirmed",
        status: acct.accredited === "Yes" ? "PASS" : acct.accredited === "No" ? "FAIL" : "INCOMPLETE",
        detail: acct.accredited === "Yes" ? `Basis: ${(acct.accreditedBasis||"Not specified").replace(/_/g," ")}` : "Investor does not meet accredited investor requirements",
        remedy: acct.accredited !== "Yes" ? "Investment cannot proceed. DST offerings require accredited investor status per SEC Regulation D." : null },
      { cat:"Accreditation", rule:"SEC Reg D §501(a)", check:"Income threshold cross-validation",
        status: acct.accreditedBasis === "income_200k" ? (fsCalcs.meetsIncomeTest ? "PASS" : "FLAG") : "N/A",
        detail: acct.accreditedBasis === "income_200k" ? `Stated income: ${fmtA(fsCalcs.grossInc)} vs. $200,000 threshold` : "Not income-based accreditation",
        remedy: acct.accreditedBasis === "income_200k" && !fsCalcs.meetsIncomeTest ? "Enhanced verification required. Obtain third-party income verification letter or tax returns." : null },
      { cat:"Accreditation", rule:"SEC Reg D §501(a)", check:"Net worth threshold cross-validation",
        status: acct.accreditedBasis === "net_worth_1m" ? (fsCalcs.meetsNwTest ? "PASS" : "FLAG") : "N/A",
        detail: acct.accreditedBasis === "net_worth_1m" ? `NW ex-primary: ${fmtA(fsCalcs.netWorthExRes)} vs. $1,000,000 threshold` : "Not net worth-based accreditation",
        remedy: acct.accreditedBasis === "net_worth_1m" && !fsCalcs.meetsNwTest ? "Enhanced verification required. Financial statement does not support stated net worth basis." : null },
      { cat:"Accreditation", rule:"SEC Reg D", check:"Accredited investor certification signed",
        status: acct.accreditedCertSigned || acct.accreditedSelfCert ? "PASS" : "INCOMPLETE",
        detail: acct.accreditedCertSigned || acct.accreditedSelfCert ? "Certification acknowledged" : "Certification not yet signed",
        remedy: !(acct.accreditedCertSigned || acct.accreditedSelfCert) ? "Obtain signed accredited investor certification before trade execution." : null },
      /* ── AML / KYC ── */
      { cat:"AML / KYC", rule:"USA PATRIOT Act §326", check:"Government-issued photo ID uploaded",
        status: docs.primaryId.length > 0 || docs.govId.length > 0 ? "PASS" : "FAIL",
        detail: "Customer Identification Program (CIP) requirement",
        remedy: docs.primaryId.length === 0 && docs.govId.length === 0 ? "BLOCKING: Obtain current government-issued photo ID before account opening." : null },
      { cat:"AML / KYC", rule:"USA PATRIOT Act §326", check:"Name, DOB, Address, SSN/TIN collected",
        status: acct.firstName && acct.lastName && acct.dob && acct.ssn && acct.street ? "PASS" : "INCOMPLETE",
        detail: `Name: ${acct.firstName?"✓":"✗"} | DOB: ${acct.dob?"✓":"✗"} | SSN: ${acct.ssn?"✓":"✗"} | Address: ${acct.street?"✓":"✗"}`,
        remedy: !(acct.firstName && acct.lastName && acct.dob && acct.ssn && acct.street) ? "Complete all CIP data fields before submission." : null },
      { cat:"AML / KYC", rule:"USA PATRIOT Act §326", check:"Government-issued ID expiration valid",
        status: idDaysLeft === null ? "INCOMPLETE" : idDaysLeft >= 90 ? "PASS" : idDaysLeft >= 0 ? "WARN" : "FAIL",
        detail: idDaysLeft !== null ? `${idDaysLeft} days remaining until expiration` : "Expiration date not provided",
        remedy: idDaysLeft !== null && idDaysLeft < 0 ? "ID is expired. A current, valid government-issued photo ID is required." : null },
      { cat:"AML / KYC", rule:"FinCEN CDD Rule", check:"Entity beneficial ownership (25%+ owners identified)",
        status: !isEntity ? "N/A" : (beneficialOwners.length > 0 || acct.noBeneficialOwner) ? "PASS" : "FLAG",
        detail: isEntity ? `${beneficialOwners.length} beneficial owner(s) identified` : "Individual account — not applicable",
        remedy: isEntity && beneficialOwners.length === 0 && !acct.noBeneficialOwner ? "CDD Rule requires identification of all individuals owning 25%+ of the entity." : null },
      { cat:"AML / KYC", rule:"FinCEN CDD Rule", check:"Entity control person identified",
        status: !isEntity ? "N/A" : (controlPerson.name ? "PASS" : "FAIL"),
        detail: isEntity ? (controlPerson.name || "Not identified") : "N/A",
        remedy: isEntity && !controlPerson.name ? "BLOCKING: A control person must be identified per FinCEN CDD Rule 31 CFR § 1010.230." : null },
      /* ── Suitability ── */
      { cat:"Suitability", rule:"FINRA Rule 2111 / Reg BI", check:"Risk tolerance consistent with investment",
        status: acct.riskTolerance ? (["Conservative"].includes(acct.riskTolerance) ? "FAIL" : "PASS") : "INCOMPLETE",
        detail: `Stated risk tolerance: ${(acct.riskTolerance||"Not provided").replace(/_/g," ")}`,
        remedy: acct.riskTolerance === "Conservative" ? "Conservative risk tolerance conflicts with speculative alternative investment." : !acct.riskTolerance ? "Obtain risk tolerance assessment before suitability determination." : null },
      { cat:"Suitability", rule:"FINRA Rule 2111 / Reg BI", check:"Time horizon consistent with DST hold period",
        status: acct.timeHorizon ? (/* v1.2 fix */ ["0-3 Years","Short","1-3"].includes(acct.timeHorizon) ? "FAIL" : "PASS") : "INCOMPLETE",
        detail: `Horizon: ${acct.timeHorizon || "N/A"}; typical DST hold: 7–10 years`,
        remedy: /* v1.2 fix */ ["0-3 Years","Short","1-3"].includes(acct.timeHorizon) ? "Investment hold period exceeds stated time horizon. Document enhanced suitability rationale." : !acct.timeHorizon ? "Investment time horizon must be documented." : null },
      { cat:"Suitability", rule:"FINRA Rule 2111 / Reg BI", check:"Investment objectives documented",
        status: (acct.investmentObjectives||[]).length > 0 ? "PASS" : "INCOMPLETE",
        detail: `${(acct.investmentObjectives||[]).length} objective(s) selected`,
        remedy: (acct.investmentObjectives||[]).length === 0 ? "Investment objectives must be documented before suitability determination." : null },
      { cat:"Suitability", rule:"FINRA Rule 2111 / Reg BI", check:"Emergency funds adequacy confirmed",
        status: acct.emergencyFunds === "Yes" ? "PASS" : acct.emergencyFunds === "No" ? "FLAG" : "INCOMPLETE",
        detail: `Investor confirms adequate emergency funds: ${acct.emergencyFunds || "Not answered"}`,
        remedy: acct.emergencyFunds === "No" ? "Discuss liquidity reserve requirements. Document rationale if proceeding." : null },
      { cat:"Suitability", rule:"FINRA Rule 2111 / Reg BI", check:"Liquidity needs compatible with illiquid investment",
        status: acct.liquidityNeeds ? (["Very Important","Significant"].includes(acct.liquidityNeeds) ? "FAIL" : "PASS") : "INCOMPLETE",
        detail: `Stated liquidity importance: ${(acct.liquidityNeeds||"Not provided").replace(/_/g," ")}`,
        remedy: ["Very Important","Significant"].includes(acct.liquidityNeeds) ? "DST investments are illiquid. Document enhanced suitability basis with detailed rationale." : null },
      /* ── Financial Analysis ── */
      { cat:"Financial Analysis", rule:"FINRA Rule 4512", check:"Financial statement completed and attested",
        status: fs.agreed ? "PASS" : "INCOMPLETE",
        detail: `Total assets: ${fmtA(fsCalcs.totalAssets)} | Net worth: ${fmtA(fsCalcs.netWorth)} | NW ex-res: ${fmtA(fsCalcs.netWorthExRes)}`,
        remedy: !fs.agreed ? "Financial statement must be completed, reviewed, and attested by the investor." : null },
      { cat:"Financial Analysis", rule:"Best Practice / Stax Guideline", check:"Post-investment liquidity ratio ≥ 15%",
        status: fsCalcs.liquidityPostPct >= 15 || fsCalcs.totalAssets === 0 ? "PASS" : fsCalcs.liquidityPostPct >= 10 ? "FLAG" : fsCalcs.liquidityPostPct >= 5 ? "WARNING" : "FAIL",
        detail: `Post-investment: ${fsCalcs.liquidityPostPct.toFixed(1)}% of NW ex-res (guideline: ≥15%)`,
        remedy: fsCalcs.liquidityPostPct < 10 && fsCalcs.totalAssets > 0 ? `Post-investment liquidity of ${fsCalcs.liquidityPostPct.toFixed(1)}% is below the 10% minimum guideline. Document rationale.` : null },
      { cat:"Financial Analysis", rule:"Best Practice", check:"Investment as % of liquid assets ≤ 50%",
        status: fsCalcs.investAsLiquidPct <= 50 || fsCalcs.totalLiquid === 0 ? "PASS" : fsCalcs.investAsLiquidPct <= 75 ? "FLAG" : "WARNING",
        detail: `Investment = ${fsCalcs.investAsLiquidPct.toFixed(1)}% of liquid assets (guideline: ≤50%)`,
        remedy: fsCalcs.investAsLiquidPct > 75 ? "Investment exceeds 75% of liquid assets. Enhanced suitability review and documentation required." : null },
      { cat:"Financial Analysis", rule:"Best Practice", check:"Debt-to-asset ratio ≤ 35%",
        status: fsCalcs.debtToAsset <= 35 ? "PASS" : fsCalcs.debtToAsset <= 50 ? "FLAG" : "WARNING",
        detail: `D/A ratio: ${fsCalcs.debtToAsset.toFixed(1)}% (guideline: ≤35%)`,
        remedy: fsCalcs.debtToAsset > 50 ? "Elevated leverage ratio may affect suitability for illiquid alternative investments." : null },
      { cat:"Financial Analysis", rule:"Best Practice", check:"Emergency reserve ≥ 3 months expenses",
        status: fsCalcs.emergencyMonths === null ? "N/A" : fsCalcs.emergencyMonths >= 3 ? "PASS" : fsCalcs.emergencyMonths >= 1 ? "WARNING" : "FAIL",
        detail: fsCalcs.emergencyMonths !== null ? `${fsCalcs.emergencyMonths.toFixed(1)} months coverage (guideline: ≥3 months)` : "Monthly expenses not provided",
        remedy: fsCalcs.emergencyMonths !== null && fsCalcs.emergencyMonths < 3 ? "Cash reserves below 3-month minimum. Discuss emergency liquidity adequacy with client." : null },
      { cat:"Financial Analysis", rule:"Best Practice", check:"Income coverage ratio ≥ 1.25×",
        status: fsCalcs.incomeCoverage === null ? "N/A" : fsCalcs.incomeCoverage >= 1.25 ? "PASS" : fsCalcs.incomeCoverage >= 1.0 ? "FLAG" : "WARNING",
        detail: fsCalcs.incomeCoverage !== null ? `${fsCalcs.incomeCoverage.toFixed(2)}x (guideline: ≥1.25x)` : "Income and/or expenses not provided",
        remedy: fsCalcs.incomeCoverage !== null && fsCalcs.incomeCoverage < 1.0 ? "Monthly expenses exceed income. Negative cash flow may affect ability to meet ongoing obligations." : null },
      /* ── Concentration ── */
      { cat:"Concentration", rule:"FINRA Notice 12-03 / Reg BI", check:"RE Securities concentration ≤ 50% of NW ex-res",
        status: fsCalcs.postConReSec <= 30 ? "PASS" : fsCalcs.postConReSec <= 50 ? "FLAG" : "WARNING",
        detail: `Pre: ${fsCalcs.preReSecPct.toFixed(1)}% → Post: ${fsCalcs.postReSecPct.toFixed(1)}% of NW ex-res (guideline: ≤30%)`,
        remedy: fsCalcs.postConReSec > 50 ? "Exceeds 50% RE Securities concentration guideline. Enhanced disclosure and supervisory approval required." : fsCalcs.postConReSec > 30 ? "Over-concentration detected (≥30%). Document enhanced suitability rationale and concentration acknowledgment." : null },
      { cat:"Concentration", rule:"FINRA Notice 12-03 / Reg BI", check:"Total alternative / illiquid concentration ≤ 60%",
        status: fsCalcs.postConAlts <= 40 ? "PASS" : fsCalcs.postConAlts <= 60 ? "FLAG" : "WARNING",
        detail: `Pre: ${fsCalcs.preAllIlliqPct.toFixed(1)}% → Post: ${fsCalcs.postAllIlliqPct.toFixed(1)}% of NW ex-res (guideline: ≤40%)`,
        remedy: fsCalcs.postConAlts > 60 ? "Total illiquid exposure exceeds 60% of NW ex-res. Enhanced supervisory review and documentation required." : null },
      { cat:"Concentration", rule:"Best Practice / Stax Guideline", check:"Single investment ≤ 25% of NW ex-res",
        status: fsCalcs.investAsNwPct <= 25 ? "PASS" : "FLAG",
        detail: `This investment = ${fsCalcs.investAsNwPct.toFixed(1)}% of NW ex-res (guideline: ≤25%)`,
        remedy: fsCalcs.investAsNwPct > 25 ? "Single investment exceeds 25% of NW ex-res. Document diversification discussion and rationale for concentration." : null },
      /* ── Senior Investor ── */
      { cat:"Senior Investor", rule:"FINRA Rule 2165 / NASAA Model Rule", check:"Senior investor screening & acknowledgments",
        status: !isSeniorDetected.detected ? "PASS" : (acct.seniorAck1 && acct.seniorAck2 && acct.seniorAck3) ? "PASS" : "FLAG",
        detail: isSeniorDetected.detected ? `Triggered: ${[isSeniorDetected.ageTriggered ? "Age ≥60" : null, isSeniorDetected.retiredTriggered ? "Retired" : null].filter(Boolean).join(", ")}` : "Not detected — standard suitability review applies",
        remedy: isSeniorDetected.detected && !(acct.seniorAck1 && acct.seniorAck2 && acct.seniorAck3) ? "Enhanced suitability review required. All three senior investor acknowledgments must be obtained." : null },
      { cat:"Senior Investor", rule:"FINRA Rule 4512(b)", check:"Trusted contact person designation",
        status: (acct.tcFirst && acct.tcLast) || acct.tcDecline || (acct.hasTrustedContact === "Yes" && acct.tcFirstName) ? "PASS" : "INCOMPLETE",
        detail: acct.tcDecline ? "Investor declined to provide trusted contact" : (acct.tcFirst && acct.tcLast) ? `Contact: ${acct.tcFirst} ${acct.tcLast}` : "Trusted contact not yet provided",
        remedy: !((acct.tcFirst && acct.tcLast) || acct.tcDecline || (acct.hasTrustedContact === "Yes" && acct.tcFirstName)) ? "Trusted contact collection is required per FINRA Rule 4512(b). Obtain or document decline." : null },
      /* ── 1031 Exchange ── */
      { cat:"1031 Exchange", rule:"IRC §1031", check:"Exchange election documented",
        status: acct.exchangeBusiness ? "ACTIVE" : "N/A",
        detail: acct.exchangeBusiness ? "Investor electing 1031 tax-deferred exchange — heightened documentation standards apply" : "Direct investment — no exchange election",
        remedy: null },
      { cat:"1031 Exchange", rule:"IRC §1031", check:"Qualified Intermediary (QI) information complete",
        status: !acct.exchangeBusiness ? "N/A" : (acct.qiCompany && acct.qiEmail ? "PASS" : "INCOMPLETE"),
        detail: acct.exchangeBusiness ? `QI: ${acct.qiCompany || "Not provided"} | Exchange #: ${acct.qiExchangeNumber || "—"}` : "N/A",
        remedy: acct.exchangeBusiness && !(acct.qiCompany && acct.qiEmail) ? "QI name and contact details are required before the exchange can proceed to closing." : null },
      { cat:"1031 Exchange", rule:"IRC §1031", check:"Debt replacement analysis reviewed",
        status: !acct.exchangeBusiness ? "N/A" : ((acct.replacementDebt||0) >= (acct.rp_debtRetired||acct.rp_existingMortgage||0) ? "PASS" : "FLAG"),
        detail: acct.exchangeBusiness ? `Debt retired: ${fmtA(acct.rp_debtRetired||acct.rp_existingMortgage||0)} | Replaced: ${fmtA(acct.replacementDebt||0)}` : "N/A",
        remedy: acct.exchangeBusiness && (acct.replacementDebt||0) < (acct.rp_debtRetired||acct.rp_existingMortgage||0) ? "Mortgage boot detected — potential taxable event. Document client acknowledgment and tax advisor consultation." : null },
      /* ── Disclosures ── */
      { cat:"Disclosures", rule:"FINRA Rule 5123 / Reg BI", check:"All required disclosures acknowledged",
        status: Object.values(disc).every(Boolean) ? "PASS" : "INCOMPLETE",
        detail: `${Object.values(disc).filter(Boolean).length} of ${Object.keys(disc).length} disclosures acknowledged`,
        remedy: !Object.values(disc).every(Boolean) ? "All required disclosures must be individually acknowledged before submission." : null },
      /* ── E-SIGN ── */
      { cat:"E-SIGN", rule:"E-SIGN Act / UETA", check:"Electronic signature obtained and recorded",
        status: sig.primary.trim().length >= 3 ? "PASS" : "INCOMPLETE",
        detail: sig.primary.trim().length >= 3 ? `Signed by: ${sig.primary}` : "Electronic signature not yet provided",
        remedy: sig.primary.trim().length < 3 ? "Electronic signature required. Investor must type full legal name to complete submission." : null },
    ];
    const passCount  = allChecks.filter(c => c.status === "PASS" || c.status === "ACTIVE").length;
    const failCount  = allChecks.filter(c => c.status === "FAIL").length;
    const flagCount  = allChecks.filter(c => c.status === "WARN" || c.status === "FLAG" || c.status === "WARNING").length;
    const incCount   = allChecks.filter(c => c.status === "INCOMPLETE").length;
    const naCount    = allChecks.filter(c => c.status === "N/A").length;
    const categories = [...new Set(allChecks.map(c => c.cat))];
    const avgYield   = cartTotal > 0 ? cartItems.reduce((s, item) => s + item.cashOnCash * (cart[item.id] || 0), 0) / cartTotal : 0;
    const fullName   = `${acct.firstName || ""} ${acct.lastName || ""}`.trim() || "—";
    return { allChecks, passCount, failCount, flagCount, incCount, naCount, totalChecks: allChecks.length - naCount, categories, avgYield, fullName, adjBasis, realizedGain, fmtA };
  };

  /* ── QC Checks ── */
  const qcChecks = useMemo(() => [
    { name: "All required fields populated",
      rule: "FINRA Rule 4512 / USA PATRIOT Act",
      pass: !!(acct.firstName && acct.lastName && acct.email && acct.ssn && acct.dob) },
    { name: "No blocking compliance flags",
      rule: "Stax Capital Pre-Trade Gate",
      pass: blockFlags.length === 0 },
    { name: "Accreditation documented",
      rule: "SEC Reg D §501(a) / Rule 506",
      pass: acct.accredited === "Yes" || disc.esign },
    { name: "SSN format valid (9 digits, non-zero)",
      rule: "IRS / USA PATRIOT Act CIP",
      pass: acct.ssn && acct.ssn.replace(/\D/g, "").length === 9 && acct.ssn.replace(/\D/g, "") !== "000000000" },
    { name: "Government-issued ID not expired",
      rule: "USA PATRIOT Act §326 CIP",
      pass: idDaysLeft === null || idDaysLeft >= 0 },
    { name: "US residence or citizenship confirmed",
      rule: "OFAC / AML Policy",
      pass: !acct.residence || acct.residence === "United States" },
    { name: "Investment concentration within limits",
      rule: "FINRA Notice 12-03 / Stax Guideline",
      pass: fsCalcs.investAsLiquidPct <= 50 || fsCalcs.totalLiquid === 0 },
    { name: "Post-investment liquidity ratio adequate",
      rule: "Stax Capital Suitability Guideline",
      pass: fsCalcs.liquidityPostPct >= 10 || fsCalcs.totalAssets === 0 },
    { name: "Boot tax addressed (1031 exchange)",
      rule: "IRC §1031 / Tax Advisor Confirmation",
      pass: fsCalcs.unallocated === 0 || fsCalcs.bootTax <= 50000 },
    { name: "All required disclosures acknowledged",
      rule: "FINRA Rule 5123 / Reg BI",
      pass: allDiscChecked },
    { name: "E-signature matches applicant name",
      rule: "E-SIGN Act / UETA",
      pass: ((sig.primary || sig.typed || "").toLowerCase().trim() === `${acct.firstName} ${acct.lastName}`.toLowerCase().trim() && (sig.primary || sig.typed || "").length > 0) },
    { name: "Beneficial ownership complete (entity)",
      rule: "FinCEN CDD Rule 31 CFR § 1010.230",
      pass: !isEntity || beneficialOwners.length > 0 || acct.noBeneficialOwner },
    { name: "Trusted contact collected or declined",
      rule: "FINRA Rule 4512(b)",
      pass: !!((acct.tcFirst && acct.tcLast) || acct.tcDecline || (acct.hasTrustedContact === "Yes" && acct.tcFirstName)) },
    { name: "Reg BI questionnaire completed by REP",
      rule: "SEC Regulation Best Interest",
      pass: !!(regBISig.typed && regBISig.care) || workflowType !== "rep-initiated" },
    { name: "Required identity documents uploaded",
      rule: "USA PATRIOT Act Customer Identification Program",
      pass: docs.primaryId.length > 0 || docs.govId.length > 0 },
  ], [acct, disc, sig, fsCalcs, blockFlags, allDiscChecked, isEntity, docs, regBISig, idDaysLeft, beneficialOwners, workflowType]);
  const qcScore = qcChecks.filter(c => c.pass).length;

  /* ── canProceed() step gate ── */
  const canProceed = (s) => {
    if (s === 0) return cartCount > 0;
    if (s === 1) return (acct.exchangeBusiness === true || acct.directBusiness === true || acct.brokenBusiness === true) && (!acct.exchangeBusiness || !!acct.taxDisclaimerAck);
    if (s === 2) return cartCount > 0 && cartItems.every(i => cart[i.id] >= i.minCash);
    if (s === 3) return fs.agreed && fs.name.trim().length > 0;
    /* v1.2 fix: hasTrustedContact is "yes"/"no" string, not boolean */
    if (s === 4) return !!(acct.firstName && acct.lastName && acct.email && acct.registrationCategory && acct.distributionMethod && (acct.hasTrustedContact === "yes" || acct.hasTrustedContact === "no" || acct.hasTrustedContact === "Yes" || acct.hasTrustedContact === "No")) && subStep >= 5;
    if (s === 5) return allDiscChecked;
    return true;
  };

  /* ── DEV: Quick Fill ── */
  const quickFill = () => {
    /* ── Step 0: Offerings — fill cart with min investments ── */
    if (step === 0) {
      const newCart = {};
      ["passco-prism","nexpoint-outlook","pg-manchester"].forEach(id => {
        const dst = DST_OFFERINGS.find(d => d.id === id);
        if (dst) newCart[id] = dst.minInvestment;
      });
      setCart(p => ({ ...p, ...newCart }));
    }

    /* ── Step 1: 1031 Exchange Setup ── */
    if (step === 1) {
      setAcct(p => ({ ...p,
        exchangeBusiness: true, directBusiness: false, brokenBusiness: false,
        taxDisclaimerAck: true,
        propertyStatus: "closed",
        /* Relinquished property */
        rp_address: "1847 Ridgewood Drive",
        rp_city: "Austin", rp_state: "TX", rp_zip: "78731",
        rp_propertyType: "Residential",
        rp_originalPurchaseDate: "03/15/2008",
        rp_originalPurchasePrice: 380000,
        rp_improvements: 45000,
        rp_accumulatedDepreciation: 112000,
        rp_salePrice: 1100000,
        rp_sellingExpenses: 66000,
        rp_existingMortgage: 185000,
        rp_annualIncome: 36000,
        rp_annualExpenses: 9800,
        rp_dateOfSale: "01/10/2026",
        /* Exchange timeline */
        exchangeStartDate: "01/10/2026",
        identificationDeadline: "02/24/2026",
        closingDeadline: "07/09/2026",
        /* QI */
        hasQI: "yes",
        qiName: "Asset Preservation, Inc.",
        qiContact: "Michael Chen",
        qiPhone: fmtPhone("8004686208"),
        qiCell: fmtPhone("8004686208"),
        qiBusiness: fmtPhone("8004686208"),
        qiEmail: "mchen@api1031.com",
        qiCompany: "Asset Preservation, Inc.",
        qiAddress: "4125 Hopyard Road, Suite 225",
        qiCity: "Pleasanton", qiState: "CA", qiZip: "94588",
        qiCountry: "United States",
        qiExchangeNumber: "EX-2026-00417",
        escrowClosed: "yes",
        /* Tax */
        knowsTaxLiab: "yes",
        totalTaxLiab: 165000,
        estimatedTaxLiability: 165000,
        taxImpactOnRisk: "somewhat",
        exchange1031Acknowledged: true,
        taxCalcDisclosureAck: true,
        noTaxAdviceAck: true,
        exchangeTimelineAck: true,
        debtReplacementAck: true,
        /* Tax calculator */
        tc_filingStatus: "Married Filing Jointly",
        tc_stateOfResidence: "TX",
        tc_federalCapGainRate: 20,
        tc_stateIncomeRate: 0,
        tc_depreciationRecaptureRate: 25,
        tc_niitApplies: true,
        tc_niitRate: 3.8,
        tc_yearsHeld: 18,
      }));
      setFs(p => ({ ...p,
        exchange1031: 849000,
        stateOfResidence: "TX",
        stateTaxRate: 0,
        federalBracket: 20,
      }));
    }

    /* ── Step 2: Cart Review — allocate proceeds across DSTs ── */
    if (step === 2) {
      const proceeds = fs.exchange1031 || 849000;
      const activeItems = cartItems.length > 0 ? cartItems : DST_OFFERINGS.filter(d => ["passco-prism","nexpoint-outlook","pg-manchester"].includes(d.id));
      if (activeItems.length > 0) {
        const perItem = Math.floor(proceeds / activeItems.length / 1000) * 1000;
        const newCart = {};
        activeItems.forEach((item, i) => {
          newCart[item.id] = i === activeItems.length - 1
            ? Math.max(proceeds - perItem * (activeItems.length - 1), item.minInvestment)
            : Math.max(perItem, item.minInvestment);
        });
        setCart(p => ({ ...p, ...newCart }));
      }
    }

    /* ── Step 3: Financial Statement ── */
    if (step === 3) {
      setFs(p => ({ ...p,
        name: "Jonathan A. Smith",
        /* Liquid assets */
        cash: 125000,
        savings: 80000,
        stocks: 210000,
        annuities: 45000,
        lifeIns: 30000,
        /* Retirement */
        retStocks: 480000,
        retPension: 120000,
        /* Real estate */
        primary: 920000,
        investRE: 0,
        /* Alternatives */
        reSec: 95000,
        nonReAlts: 40000,
        intervalFunds: 0,
        /* Other */
        business: 350000,
        notes: 25000,
        /* Income */
        empInc: 165000,
        invInc: 22000,
        retInc: 0,
        expenses: 78000,
        /* Liabilities */
        curLiab: 18000,
        notesPayable: 185000,
        /* Tax */
        taxRate: 32,
        stateOfResidence: "TX",
        stateTaxRate: 0,
        federalBracket: 20,
        agreed: true,
      }));
      setSavedSections({ liquid: true, retire: true, realty: true, alts: true, income: true, liabs: true });
      setOpenSection(null);
    }

    /* ── Step 4: Account Opening — fill ALL sub-steps ── */
    if (step === 4) {
      /* Build full primaryExperience map for all INVESTMENT_TYPES */
      const expMap = {};
      INVESTMENT_TYPES.forEach((t, i) => { expMap[t] = i < 3 ? "5+" : i < 6 ? "1-5" : "0"; });

      setAcct(p => ({ ...p,
        /* Sub-step 0: Account type */
        accountStatus: "open",
        registrationCategory: "individual",
        individualType: "individual",
        accredited: "Yes",

        /* Sub-step 1: Accreditation */
        accreditedBasis: "net_worth_1m",
        accreditedVerifyMethod: "min_investment",
        accreditedNoFinancing: true,
        accreditedMeetsMinInvest: true,
        accreditedSelfCert: true,
        accreditedCertSigned: true,
        accreditedCertDate: "04/06/2026",
        accreditedCertSig: "Jonathan A. Smith",

        /* Sub-step 2: Personal info */
        title: "Mr.",
        firstName: "Jonathan",
        middleName: "A.",
        lastName: "Smith",
        phone: fmtPhone("5125550192"),
        email: "j.smith@smithcapitalpartners.com",
        /* Address */
        street: "2204 Barton Creek Blvd",
        city: "Austin",
        state: "TX",
        zip: "78735",
        country: "United States",
        lessThanOneYear: false,
        hasDiffMailing: false,
        /* Employment */
        employmentStatus: "Self-Employed",
        occupation: "Business Owner",
        employer: "Smith Capital Partners",
        employerAddress: "500 W 2nd Street, Suite 1900, Austin, TX 78701",

        /* Sub-step 3: Identity / PATRIOT Act */
        dob: "06/22/1963",
        ssn: fmtSSN("521884412"),
        citizenship: "United States",
        idType: "Driver's License",
        idNumber: "TX-98231047",
        idState: "TX",
        idExpiry: "06/22/2028",
        householdStatus: "Married",
        dependents: "2",

        /* Sub-step 4: Distribution & Contacts */
        distributionMethod: "direct_deposit",
        bankName: "Frost Bank",
        bankCity: "Austin",
        bankState: "TX",
        bankZip: "78701",
        bankCountry: "United States",
        bankAccountType: "Checking Account",
        routingNumber: "314972853",
        accountNumber: "4471882930",
        hasTrustedContact: "no",

        /* Sub-step 5: Suitability & Experience */
        fundingSource: "1031 Exchange Proceeds",
        liquidityNeeds: "Not Important",
        specialExpenses: "0",
        specialExpensesTimeframe: "Over 10 Years",
        investmentObjectives: [
          "Generate income for current or future expenses",
          "Partially fund my retirement",
          "Steadily accumulate wealth over the long term",
        ],
        timeHorizon: "5-10 Years",
        riskTolerance: "moderate_aggressive",
        primaryExperience: expMap,

        /* Financial affiliations */
        industryAffiliated: "no",
        isPoliticalOfficial: "no",
        finraAffiliated: false,
        tenPctShareholder: false,
        backupWithholding: false,
        concentrationAcknowledged: true,
        emergencyFunds: "6+ months",
      }));
      setSubStep(5);

      /* ── Mock document uploads — marks all relevant doc slots as uploaded ── */
      const mockDoc = (name, type = "application/pdf") => ({
        id: `dev-${Math.random().toString(36).slice(2, 9)}`,
        file: null,
        name,
        size: 48200,
        type,
        status: "uploaded",
        progress: 100,
        preview: null,
      });
      setDocs({
        primaryId:          [mockDoc("drivers-license.jpg", "image/jpeg")],
        govId:              [mockDoc("drivers-license.jpg", "image/jpeg")],
        accreditedDocs:     [mockDoc("accreditation-letter.pdf")],
        voidedCheck:        [mockDoc("voided-check.pdf")],
        coApplicantId:      [],
        entityDocs:         [],
        trustDocs:          [],
        iraDocs:            [],
        closingStatement:   [],
        ownerAccreditedDocs:[],
      });
    }

    /* ── Step 5: Disclosures — check every box ── */
    if (step === 5) {
      setDisc({
        materialReviewed: true, offering: true, illiquidity: true,
        risk: true, noGuarantee: true, exchange1031: true,
        concentration: true, additionalDebt: true, arbitration: true,
        independentAdvice: true, formCRS: true, regBI: true,
        privacy: true, brokerCheck: true, esign: true,
      });
    }
  };

  /* ── Navigation ── */
  /* Centralized: find first error field in DOM order, scroll to it, focus, highlight.
     Fallback for non-input steps (Step 0: empty cart, Step 1: no investment type selected)
     scrolls to the relevant container so the user always gets a scroll target. */
  const scrollToFirstError = () => {
    // Gather all error targets: input errors, select errors, and field-level errors (radio/upload)
    const inputErr = document.querySelector(".stax-input.has-error, .stax-select.has-error");
    const fieldErr = document.querySelector("[data-field-error='true']");
    // Pick whichever appears higher in the page
    let firstErr = null;
    if (inputErr && fieldErr) {
      const inputTop = inputErr.getBoundingClientRect().top;
      const fieldTop = fieldErr.getBoundingClientRect().top;
      firstErr = inputTop <= fieldTop ? inputErr : fieldErr;
    } else {
      firstErr = inputErr || fieldErr;
    }
    if (firstErr) {
      const top = firstErr.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      // Focus input/select elements directly; make radio/upload containers programmatically focusable
      if (firstErr.classList.contains("stax-input") || firstErr.classList.contains("stax-select")) {
        firstErr.focus({ preventScroll: true });
      } else {
        // [data-field-error] containers (RadioGroup, DocumentUploader) — set tabindex transiently and focus
        if (!firstErr.hasAttribute("tabindex")) firstErr.setAttribute("tabindex", "-1");
        firstErr.focus({ preventScroll: true });
      }
      firstErr.classList.add("stax-field-highlight");
      setTimeout(() => firstErr.classList.remove("stax-field-highlight"), 900);
      return;
    }
    // Fallback for steps with no inputs at all (empty cart, no investment type)
    const fallbackId = step === 0 ? "stax-cart-grid" : step === 1 ? "stax-investment-type" : null;
    if (fallbackId) {
      const el = document.getElementById(fallbackId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 110;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        el.classList.add("stax-field-highlight");
        setTimeout(() => el.classList.remove("stax-field-highlight"), 900);
      }
    }
  };
  const goNext = () => {
    if (!canProceed(step)) {
      setValidationOn(true);
      setTimeout(scrollToFirstError, 50);
      return;
    }
    setValidationOn(false);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
      addAudit("navigation", `Navigated to step ${step + 2}`);
    }
  };
  const goBack = () => { setStep(s => Math.max(0, s - 1)); setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth" }), 50); };
  const toggleCart = (id, minAmt) => {
    const is1031Investor = acct.exchangeBusiness === true;
    const proceeds = fs.exchange1031 || 0;
    setCart(p => {
      const removing = p[id] > 0;
      const newCart = { ...p, [id]: removing ? 0 : (minAmt || 100000) };
      if (is1031Investor && proceeds > 0) {
        const selectedIds = Object.keys(newCart).filter(k => newCart[k] > 0);
        if (selectedIds.length === 0) return newCart;
        const perItem = Math.floor(proceeds / selectedIds.length / 1000) * 1000;
        selectedIds.forEach((sid, i) => {
          const offering = DST_OFFERINGS.find(d => d.id === sid);
          const floor = offering ? offering.minInvestment : 100000;
          newCart[sid] = i === selectedIds.length - 1
            ? Math.max(proceeds - perItem * (selectedIds.length - 1), floor)
            : Math.max(perItem, floor);
        });
      }
      return newCart;
    });
  };
  const filterTypes = ["All", "Multifamily", "Industrial", "Medical Office", "Hospitality"];
  // curatedOfferings and filtered defined in MarketplaceStep

  const canSubmit = allDiscChecked && blockFlags.length === 0
    && (sig.primary || sig.typed || "").trim().length >= 3
    && (!requiresFlagAcceptance || allFlagsAcked);

  /* ── PDF generation lives inside ReviewStep (full HTML implementation) ── */

  /* ══════════════════════════════════════════════════════
     ENTRY ROUTER — called as function, not JSX
     ══════════════════════════════════════════════════════ */
  const EntryRouter = () => (
    <div style={{ maxWidth: 700, margin: "80px auto", textAlign: "center" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
          <div style={{ background:`linear-gradient(135deg, ${G.darkest} 0%, ${G.deep} 100%)`, borderRadius:16, padding:"18px 32px", display:"inline-flex", alignItems:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
            <img src={STAX_AI_LOGO} alt="StaxAI" style={{ width:148, height:36, objectFit:"contain" }}/>
          </div>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 8 }}>Investor Account Opening</h1>
        <p style={{ fontSize: 14, color: T.muted, fontFamily: FONT }}>Select your workflow to begin the account opening process.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[
          { type: "rep-initiated", title: "Rep-Initiated Workflow", desc: "Stax representative creates and pre-configures the application for their client.", caption: "FINRA Registered Representatives Only", icon: IC.briefcase },
          { type: "css", title: "Client Self-Service", desc: "Investor completes the application independently with Stax Capital support.", caption: "Secure · Encrypted · FINRA Supervised", icon: IC.user },
        ].map(w => (
          <button key={w.type} onClick={() => { setWorkflowType(w.type); setView(w.type === "rep-initiated" ? "rep-console" : "app"); addAudit("workflow", `Workflow selected: ${w.type}`); }}
            style={{ padding: "32px 24px", background: N.card, border: `2px solid ${N.border}`, borderRadius: 28, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
            <div style={{ marginBottom: 16, color: G.forest, display:"flex" }}>{React.cloneElement(w.icon, { width:28, height:28, strokeWidth:1.5 })}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 6 }}>{w.title}</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: FONT, lineHeight: 1.6 }}>{w.desc}</div>
            {w.caption && <div style={{ fontSize: 10, fontWeight: 600, color: G.forest, fontFamily: FONT, marginTop: 8, letterSpacing: "0.5px", textTransform: "uppercase" }}>{w.caption}</div>}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24, padding:"14px 20px", background:N.card, borderRadius:14, border:"1px solid " + N.border, display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
        {["256-bit Encryption","FINRA Member","SEC Registered","SIPC Member"].map(item => (
          <span key={item} style={{ fontSize:10, fontWeight:600, color:T.muted, fontFamily:FONT, display:"flex", alignItems:"center", gap:4 }}>{item}</span>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 10, color: T.light, fontFamily: FONT }}>
        Securities offered through Stax Capital, Inc. Member FINRA &amp; SIPC | 844-427-1031
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
     REP CONSOLE — called as function
     ══════════════════════════════════════════════════════ */
  const RepConsole = () => {

    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 4 }}>REP Console — Application Setup</h2>
        <p style={{ fontSize: 13, color: T.muted, fontFamily: FONT, marginBottom: 20 }}>Configure the client application before generating their invite link.</p>
        <SectionCard title="Investor Workflow Type" icon={IC.exchange}>
          {[
            { val: "1031", label: "1031 Exchange", desc: "Tax-deferred reinvestment of proceeds under IRC §1031", key: "exchangeBusiness" },
            { val: "direct", label: "Direct Cash Investment", desc: "Standard direct purchase with after-tax dollars", key: "directBusiness" },
            { val: "broken", label: "Broken Exchange", desc: "Failed or incomplete 1031 — direct investment fallback", key: "brokenBusiness" },
          ].map(opt => (
            <CheckBox key={opt.val}
              checked={acct[opt.key] === true}
              onChange={() => {
                updAcct("exchangeBusiness", opt.val === "1031");
                updAcct("directBusiness", opt.val === "direct");
                updAcct("brokenBusiness", opt.val === "broken");
              }}
              label={opt.label}
              description={opt.desc}
            />
          ))}
        </SectionCard>
        <SectionCard title="Client & Exchange Information" icon={IC.fileText}>
          <Row2>
            <TInput label="Client Name" value={repCtx.clientName} onChange={v => updRep("clientName", v)} required placeholder="Full legal name"/>
            {(acct.exchangeBusiness || acct.brokenBusiness) && (
              <CurrencyInput label="Estimated Exchange Amount" value={repCtx.exchangeAmount} onChange={v => updRep("exchangeAmount", v)}/>
            )}
          </Row2>
          {(acct.exchangeBusiness || acct.brokenBusiness) && (<>
            <TInput label="Relinquished Property Address" value={repCtx.relinquishedAddress} onChange={v => updRep("relinquishedAddress", v)} placeholder="Full property address"/>
            <Row3>
              <DateInput label="Relinquished Property Close Date" value={repCtx.relinquishedClose} onChange={v => updRep("relinquishedClose", v)} required/>
              <TInput label="45-Day Deadline" value={deadline45} onChange={() => {}} disabled/>
              <TInput label="180-Day Deadline" value={deadline180} onChange={() => {}} disabled/>
            </Row3>
          </>)}
        </SectionCard>
        <SectionCard title="REP Information" icon={IC.tag}>
          <Row3>
            <TInput label="REP CRD #" value={repCtx.crd} onChange={v => updRep("crd", v)} required placeholder="CRD number"/>
            <TInput label="Branch Code" value={repCtx.branchCode} onChange={v => updRep("branchCode", v)}/>
            <TInput label="Account Rep Code" value={repCtx.repCode} onChange={v => updRep("repCode", v)}/>
          </Row3>
        </SectionCard>
        <SectionCard title="Offering Pre-Selection" icon={IC.building}>
          {DST_OFFERINGS.map(o => (
            <div key={o.id}>
              <CheckBox
                checked={!!repCtx.selectedOfferings[o.id]}
                onChange={v => {
                  updRep("selectedOfferings", { ...repCtx.selectedOfferings, [o.id]: v });
                  if (v) setCart(p => ({ ...p, [o.id]: o.minInvestment }));
                  else setCart(p => ({ ...p, [o.id]: 0 }));
                }}
                label={o.name}
                description={`${o.location} | ${pct(o.cashOnCash)} C/C | Min ${fmtFull(o.minInvestment)}`}
              />
              {repCtx.selectedOfferings[o.id] && (
                <textarea value={repCtx.offeringRationale[o.id] || ""} onChange={e => updRep("offeringRationale", { ...repCtx.offeringRationale, [o.id]: e.target.value })}
                  placeholder="Why this offering? (rationale for client)" rows={2}
                  style={{ ...inputSt, marginTop: 4, marginBottom: 6, resize: "vertical", minHeight: 50, height: "auto", padding: "10px 16px" }}/>
              )}
            </div>
          ))}
        </SectionCard>
        {!linkGenerated ? (
          <BtnPrimary onClick={() => { setLinkGenerated(true); addAudit("rep", "Client application link generated", "REP"); }}
            disabled={!repCtx.clientName || !repCtx.crd} style={{ width: "100%", marginTop: 12 }}>
            Generate Client Application Link
          </BtnPrimary>
        ) : (
          <div style={{ padding: "20px 24px", background: G.mint, border: `2px solid ${G.forest}40`, borderRadius: 12, textAlign: "center", marginTop: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: G.forest, fontFamily: FONT, marginBottom: 6 }}>Link Generated Successfully</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: FONT, marginBottom: 12 }}>Session token created for {repCtx.clientName}.</div>
            <BtnPrimary onClick={() => { setView("app"); addAudit("navigation", "Entered investor workflow from REP console"); }}>
              Continue to Investor Workflow &rarr;
            </BtnPrimary>
          </div>
        )}
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     CSS ENTRY — called as function
     ══════════════════════════════════════════════════════ */
  const CSSEntry = () => (
    <div style={{ maxWidth: 560, margin: "60px auto" }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ display:"inline-flex", background:`linear-gradient(135deg, ${G.darkest} 0%, ${G.deep} 100%)`, borderRadius:14, padding:"16px 28px", marginBottom:16, boxShadow:"0 6px 24px rgba(0,0,0,0.15)" }}>
          <img src={STAX_AI_LOGO} alt="StaxAI" style={{ width:132, height:32, objectFit:"contain" }}/>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 4 }}>DST Account Application</h2>
        <p style={{ fontSize: 13, color: T.muted, fontFamily: FONT }}>Tell us a little about your investment goals to get started.</p>
      </div>
      <SectionCard title="Investment Intent">
        <RadioGroup label="What type of investment are you considering?" name="cssIntent" value={cssEntry.intent}
          onChange={v => setCssEntry(p => ({ ...p, intent: v }))}
          options={[
            { value: "1031", label: "1031 Exchange" }, { value: "cash", label: "Direct Cash Investment" },
            { value: "ira", label: "IRA" }, { value: "unsure", label: "Not Sure Yet" },
          ]} required/>
        <CurrencyInput label="Estimated Investment Amount (optional)" value={cssEntry.amount} onChange={v => setCssEntry(p => ({ ...p, amount: v }))}/>
      </SectionCard>
      <InfoCallout>A Stax Capital representative will be available to assist you. Questions? Call 844-427-1031.</InfoCallout>
      <BtnPrimary onClick={() => { setView("app"); addAudit("navigation", "Started application from CSS entry"); }} style={{ width: "100%", marginTop: 16 }}>
        Start Application &rarr;
      </BtnPrimary>
    </div>
  );

  /* ══════════════════════════════════════════════════════
     REP BANNER — called as function
     ══════════════════════════════════════════════════════ */
  const RepBanner = () => {
    if (!workflowType) return null;
    const exAmt = workflowType === "rep-initiated" ? repCtx.exchangeAmount : cssEntry.amount;
    return (
      <div style={{ background: `linear-gradient(135deg, ${G.darkest}, ${G.deep})`, borderRadius: 10, padding: "10px 18px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        {workflowType === "rep-initiated" && repCtx.clientName && (
          <div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontFamily: FONT }}>Advisor</div><div style={{ fontSize: 12, fontWeight: 700, color: T.white, fontFamily: FONT }}>{repCtx.clientName}</div></div>
        )}
        {repCtx.crd && <div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontFamily: FONT }}>CRD#</div><div style={{ fontSize: 12, fontWeight: 600, color: T.white, fontFamily: FONT }}>{repCtx.crd}</div></div>}
        {exAmt > 0 && <div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontFamily: FONT }}>Exchange Amount</div><div style={{ fontSize: 12, fontWeight: 700, color: T.white, fontFamily: FONT }}>{fmtFull(exAmt)}</div></div>}
        {deadline45 && <div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontFamily: FONT }}>45-Day</div><div style={{ fontSize: 12, fontWeight: 600, color: A.amber, fontFamily: FONT }}>{deadline45}</div></div>}
        {exAmt > 0 && <div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontFamily: FONT }}>Remaining</div><div style={{ fontSize: 12, fontWeight: 700, color: fsCalcs.unallocated > 0 ? A.coral : G.light, fontFamily: FONT }}>{fmtFull(Math.max(0, exAmt - cartTotal))}</div></div>}
        {saved && <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: FONT }}>Auto-saved ✓</div>}
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     STEP 0 — YOUR RECOMMENDED OFFERINGS (Curated Marketplace)
     ══════════════════════════════════════════════════════ */
  const CURATED_IDS = ["passco-prism","nexpoint-outlook","pg-manchester"];
  const curatedOfferings = DST_OFFERINGS.filter(d => CURATED_IDS.includes(d.id));
  const filtered = DST_OFFERINGS.filter(d => filter === "All" || d.propertyTypeShort === filter);

  const MarketplaceStep = () => {
    const selectedCount = curatedOfferings.filter(d => (cart[d.id] || 0) > 0).length;

    return (
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize:24, fontWeight:700, color:T.primary, fontFamily:FONT, lineHeight:1.2, marginBottom:8, letterSpacing:"-0.02em" }}>
            Selected DST Investments
          </h1>
          <p style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.6, maxWidth:560, margin:0 }}>
            Review and adjust your investment selections before beginning the account opening process. Once you proceed, your selections will be locked for this application.
          </p>
        </div>

        {/* ── Reg D Callout ── */}
        <div style={{ marginBottom:24 }}>
          <InfoCallout type="warning" title="Accredited Investors Only — Private Placements">
            These securities have not been registered under the Securities Act of 1933. They are offered exclusively to accredited investors and are subject to restrictions on transfer. You must qualify as an accredited investor under SEC Rule 501(a) to participate. These investments involve substantial risk including the possible loss of your entire investment.
          </InfoCallout>
        </div>

        {/* ── 1031 deadline reminder (if exchange setup done) ── */}
        {acct.exchangeBusiness === true && acct.exchangeStartDate && (() => {
          const sd = parseDate(acct.exchangeStartDate);
          const d45 = sd ? daysUntil(fmtDateObj(addDays(sd, 45))) : null;
          const d180 = sd ? daysUntil(fmtDateObj(addDays(sd, 180))) : null;
          if (d45 === null) return null;
          const urgent = d45 < 15;
          return (
            <div style={{ marginBottom:16 }}>
              <InfoCallout
                type={d45 < 0 ? "important" : "warning"}
                title={d45 < 0 ? "45-Day ID Period Expired" : `45-Day Identification Deadline — ${d45} days remaining`}
              >
                {d45 < 0
                  ? "Consult your tax advisor immediately — a failed exchange triggers full capital gains recognition."
                  : `Select your DSTs now to ensure they can be identified with your QI. 180-day closing deadline: ${d180} days remaining.`}
                {fs.exchange1031 > 0 && <span style={{ marginLeft:8, fontWeight:600, color:G.forest }}>{fmtFull(fs.exchange1031)} exchange proceeds</span>}
              </InfoCallout>
            </div>
          );
        })()}

        {/* ── Offering Cards ── */}
        <div id="stax-cart-grid" style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {curatedOfferings.map((dst) => {
            const isSelected = (cart[dst.id] || 0) > 0;
            const typeColorMap = { Multifamily:"#3B82F6", Industrial:"#F59E0B", Office:"#8B5CF6", Retail:"#EF4444", "Net Lease":"#10B981", Mixed:"#6366F1" };
            const tColor = typeColorMap[dst.propertyTypeShort] || "#6B7280";
            const belowMin = isSelected && cart[dst.id] < dst.minInvestment;

            return (
              <div key={dst.id} style={{
                display:"flex", alignItems:"stretch",
                background: N.card, borderRadius: 12,
                border: `1px solid ${N.border}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s",
                minHeight: 96,
              }}>

                {/* ── Property image + sponsor overlay ── */}
                <div style={{ position:"relative", width:168, minWidth:168, flexShrink:0, overflow:"hidden" }}>
                  <img src={dst.image} alt={dst.name}
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                  {/* Gradient overlay */}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0) 100%)" }}/>
                  {/* Sponsor badge */}
                  <div style={{ position:"absolute", bottom:8, left:8 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:T.white, fontFamily:FONT,
                      background:"rgba(255,255,255,0.18)", backdropFilter:"blur(4px)",
                      padding:"3px 8px", borderRadius:4, letterSpacing:"0.04em" }}>
                      {dst.sponsor}
                    </span>
                  </div>
                </div>

                {/* ── Product info ── */}
                <div style={{ flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", justifyContent:"center", minWidth:0 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", letterSpacing:"-0.01em" }}>
                    {dst.name}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    {/* Property type pill */}
                    <span style={{ fontSize:10, fontWeight:700, color:tColor, fontFamily:FONT,
                      background:tColor+"18", padding:"2px 8px", borderRadius:4, letterSpacing:"0.03em" }}>
                      {dst.propertyTypeShort.toUpperCase()}
                    </span>
                    {/* Location */}
                    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.body} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span style={{ fontSize:11, color:T.body, fontFamily:FONT }}>{dst.location}</span>
                    </div>
                  </div>
                </div>

                {/* ── Cash Flow ── */}
                <div style={{ width:90, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px 10px" }}>
                  <div style={{ fontSize:9, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Cash Flow</div>
                  <div style={{ fontSize:17, fontWeight:700, color:G.forest, fontFamily:FONT }}>{pct(dst.cashOnCash)}</div>
                </div>

                {/* ── LTV ── */}
                <div style={{ width:80, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px 10px" }}>
                  <div style={{ fontSize:9, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>LTV</div>
                  <div style={{ fontSize:17, fontWeight:700, color:T.primary, fontFamily:FONT }}>{dst.leverage.toFixed(2)}%</div>
                </div>

                {/* ── Amount input ── */}
                <div style={{ width:190, flexShrink:0, display:"flex", flexDirection:"column", justifyContent:"center", padding:"12px 14px" }}>
                  <div style={{ fontSize:9, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Investment Amount</div>
                  <CartAmountInput
                    value={cart[dst.id] || 0}
                    onCommit={v => setCart(p => ({ ...p, [dst.id]: v }))}
                  />
                  {belowMin && (
                    <div style={{ fontSize:10, color:A.red, fontFamily:FONT, marginTop:4 }}>
                      Min. {fmtFull(dst.minInvestment)}
                    </div>
                  )}
                  {!isSelected && (
                    <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:4 }}>
                      Min. {fmtFull(dst.minInvestment)}
                    </div>
                  )}
                </div>

                {/* ── Add / Added button ── */}
                <div style={{ width:148, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"12px 14px" }}>
                  <button
                    onClick={() => toggleCart(dst.id, dst.minInvestment)}
                    style={{
                      display:"flex", alignItems:"center", gap:7,
                      padding:"9px 16px", borderRadius:8, cursor:"pointer",
                      width:"100%", justifyContent:"center",
                      background: isSelected ? G.forest : N.card,
                      border: `1.5px solid ${isSelected ? G.forest : N.border}`,
                      color: isSelected ? "white" : T.body,
                      fontWeight:600, fontSize:12, fontFamily:FONT,
                      transition:"all 0.15s",
                      boxShadow: isSelected ? `0 2px 8px ${G.forest}35` : "none",
                    }}
                  >
                    <span style={{
                      width:14, height:14, borderRadius:3, flexShrink:0,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: isSelected ? "rgba(255,255,255,0.22)" : "white",
                      border: `1.5px solid ${isSelected ? "rgba(255,255,255,0.4)" : N.border}`,
                    }}>
                      {isSelected && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path d="M20 6L9 17L4 12"/></svg>}
                    </span>
                    {isSelected ? "Added to Plan" : "Add to Plan"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>


      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     STEP 1 — 1031 EXCHANGE SETUP
     ══════════════════════════════════════════════════════ */
  const ExchangeSetupStep = () => {
    const is1031 = acct.exchangeBusiness === true;
    const isDirect = acct.directBusiness === true;
    const exchangeProceeds = fs.exchange1031 || 0;
    const startDate = parseDate(acct.exchangeStartDate);
    const deadline45Date = startDate ? addDays(startDate, 45) : null;
    const deadline180Date = startDate ? addDays(startDate, 180) : null;
    const days45Left = deadline45Date ? daysUntil(fmtDateObj(deadline45Date)) : null;
    const days180Left = deadline180Date ? daysUntil(fmtDateObj(deadline180Date)) : null;
    const totalAllocatable = exchangeProceeds > 0 ? exchangeProceeds : 0;
    const estDeferral = exchangeProceeds > 0 ? Math.round(exchangeProceeds * 0.238) : 0;
    const estAnnualIncome = cartItems.reduce((s, i) => s + exchangeProceeds / cartItems.length * (i.distributionRate / 100), 0);
    const adjBasis1031 = (acct.rp_originalPurchasePrice || 0) + (acct.rp_improvements || 0) - (acct.rp_accumulatedDepreciation || 0);
    const netProceeds1031 = (acct.rp_salePrice || 0) > 0 ? Math.max(0, (acct.rp_salePrice || 0) - (acct.rp_sellingExpenses || 0) - (acct.rp_existingMortgage || 0)) : null;
    const realizedGain1031 = (acct.rp_salePrice || 0) > 0 ? (acct.rp_salePrice || 0) - (acct.rp_sellingExpenses || 0) - adjBasis1031 : null;

    const timelineProgress = () => {
      if (!startDate || !deadline180Date) return 0;
      const total = deadline180Date - startDate;
      const elapsed = Date.now() - startDate;
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    return (
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.02em" }}>How Are You Investing?</h1>
          <p style={{ fontSize:15, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6, maxWidth:640 }}>
            If you're completing a 1031 exchange, we'll walk you through each step. If you're investing cash directly, just confirm below and move on — it only takes a moment.
          </p>
        </div>

        {/* ── Investment type selector ── */}
        <div id="stax-investment-type" style={{ background: N.card, borderRadius: 14, border: `1px solid ${N.border}`, padding: "24px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.body, fontFamily: FONT, marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>Investment Funding</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { val: "yes_1031", label: "1031 Exchange", desc: "Tax-deferred reinvestment of relinquished property proceeds under IRC §1031", icon: IC.exchange },
              { val: "no_direct", label: "Direct Cash Investment", desc: "Standard direct purchase of DST interests with after-tax dollars", icon: IC.dollarSign },
            ].map(opt => {
              const selected = opt.val === "yes_1031" ? is1031 : isDirect;
              return (
                <button key={opt.val}
                  onClick={() => { updAcct("exchangeBusiness", opt.val === "yes_1031"); updAcct("directBusiness", opt.val === "no_direct"); }}
                  style={{
                    padding: "20px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    background: selected ? `${G.forest}08` : N.section,
                    border: `2px solid ${selected ? G.forest : N.border}`,
                    transition: "all 0.15s",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ color: selected ? G.forest : T.muted, display:"flex", alignItems:"center" }}>{opt.icon}</span>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: selected ? G.forest : N.card,
                      border: `2px solid ${selected ? G.forest : N.border}`,
                    }}>
                      {selected && <span style={{ width: 7, height: 7, borderRadius: "50%", background: N.card, display: "block" }}/>}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.primary, fontFamily: FONT }}>{opt.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, fontFamily: FONT, lineHeight: 1.6, paddingLeft: 32 }}>{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 1031 Exchange Details ── */}
        {is1031 && (
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

            {/* LEFT COLUMN — input forms */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Important Disclosures — acknowledgment before forms */}
            <SectionCard title="Before We Begin — Important Notice" icon={IC.alertTriangle}>
              <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:12 }}>
                <div style={{ fontSize:14, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:6 }}>Stax Capital Does Not Provide Tax Advice</div>
                <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                  The information and tools on this page are for general guidance only — not tax, legal, or accounting advice. Your situation is unique. Please consult your own CPA, tax attorney, and/or estate planning advisor before completing or relying on any 1031 exchange transaction.
                </div>
              </div>
              <CheckBox checked={acct.taxDisclaimerAck} onChange={v => updAcct("taxDisclaimerAck", v)}
                label="I understand that Stax Capital does not provide tax or legal advice. I have consulted, or will consult, my own independent advisors."/>
            </SectionCard>

            {/* STEP 1 — Sale Logistics */}
            <StepSection step={1} title="Sale Logistics" subtitle="Closing dates, escrow status, and your Qualified Intermediary">

                {/* ── Property Status ── */}
                <div style={{ fontSize:14, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Property Status</div>
                <div style={{ fontSize:13, color:T.muted, fontFamily:FONT, lineHeight:1.6, marginBottom:14 }}>
                  Where are you in the sale process? Your answer determines what information we need right now.
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:20 }}>
                  {[
                    { value:"considering", label:"Considering Listing", icon:IC.home,     sub:"Planning to sell" },
                    { value:"listed",      label:"Listed",              icon:IC.tag,      sub:"On the market" },
                    { value:"in_escrow",   label:"In Escrow",           icon:IC.fileText, sub:"Under contract" },
                    { value:"closed",      label:"Closed",              icon:IC.lock,     sub:"Sale complete" },
                  ].map(opt => {
                    const sel = acct.propertyStatus === opt.value;
                    return (
                      <button key={opt.value} onClick={() => updAcct("propertyStatus", opt.value)} style={{
                        padding:"16px 12px", borderRadius:10, cursor:"pointer", textAlign:"center", border:`2px solid ${sel ? G.forest : N.border}`,
                        background: sel ? `${G.forest}08` : N.section, transition:"all 0.15s",
                      }}>
                        <div style={{ display:"flex", justifyContent:"center", marginBottom:8, color: sel ? G.forest : T.muted }}>
                          {React.cloneElement(opt.icon, { width:20, height:20, strokeWidth:1.5 })}
                        </div>
                        <div style={{ fontSize:12, fontWeight:700, color: sel ? G.forest : T.primary, fontFamily:FONT, lineHeight:1.3 }}>{opt.label}</div>
                        <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, marginTop:3 }}>{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>

                {/* ── shared date-reference helper ── */}
                {(() => {
                  const fromToday = (dateObj) => {
                    if (!dateObj) return null;
                    const d = Math.ceil((dateObj - new Date()) / (1000*60*60*24));
                    if (d < 0)  return `${Math.abs(d)}d ago`;
                    if (d === 0) return "today";
                    if (d < 14)  return `in ${d} days`;
                    if (d < 60)  return `in ${Math.round(d/7)} weeks`;
                    if (d < 365) return `in ~${Math.round(d/30)} months`;
                    return `in ~${(d/365).toFixed(1)} years`;
                  };

                  const MilestoneCard = ({ label, dateObj, tag, urgent, dim }) => {
                    const ref = fromToday(dateObj);
                    const bg  = urgent ? C.errorBg : dim ? N.section : `${G.forest}06`;
                    const bc  = urgent ? C.errorBorder : dim ? N.border  : `${G.forest}25`;
                    const tc  = urgent ? C.error : dim ? T.muted   : G.forest;
                    return (
                      <div style={{ padding:"12px 14px", background:bg, borderRadius:10, border:`1px solid ${bc}`, textAlign:"center" }}>
                        <div style={{ fontSize:10, color: dim ? T.muted : G.forest, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4, fontWeight:600 }}>{label}</div>
                        <div style={{ fontSize:13, fontWeight:700, color: urgent ? C.error : T.primary, fontFamily:FONT }}>{dateObj ? fmtDateObj(dateObj) : "—"}</div>
                        {ref && <div style={{ fontSize:11, fontWeight:600, color:tc, fontFamily:FONT, marginTop:3 }}>{ref}</div>}
                        {tag && <div style={{ fontSize:10, color:tc, fontFamily:FONT, marginTop:2, opacity:0.8 }}>{tag}</div>}
                      </div>
                    );
                  };

                  /* ── Considering Listing ── */
                  if (acct.propertyStatus === "considering") {
                    const listDate   = parseDate(acct.estimatedListingDate);
                    const escrowOpen = parseDate(acct.estimatedEscrowOpenDate) || (listDate ? addDays(listDate, 45) : null);
                    const closeDate  = escrowOpen ? addDays(escrowOpen, 30) : null;
                    const day45      = closeDate  ? addDays(closeDate, 45)  : null;
                    const day180     = closeDate  ? addDays(closeDate, 180) : null;
                    if (closeDate && fmtDateObj(closeDate) !== acct.exchangeStartDate) {
                      setTimeout(() => { updAcct("rp_dateOfSale", fmtDateObj(closeDate)); updAcct("exchangeStartDate", fmtDateObj(closeDate)); }, 0);
                    }
                    return (
                      <>
                        <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>You're Planning Ahead — That's Smart</div>
                          <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                            The best time to start your 1031 exchange planning is <strong>before you list</strong>. Enter your estimated listing date below and we'll map out your full exchange timeline so you know exactly what to expect.
                          </div>
                        </div>
                        <Row2>
                          <DateInput label="Estimated Listing Date" value={acct.estimatedListingDate}
                            onChange={v => updAcct("estimatedListingDate", v)}
                            placeholder="MM/DD/YYYY" sublabel="When you plan to put the property on the market"/>
                          <DateInput label="Estimated Escrow Open Date" value={acct.estimatedEscrowOpenDate}
                            onChange={v => updAcct("estimatedEscrowOpenDate", v)}
                            placeholder="MM/DD/YYYY" sublabel={listDate ? `Defaults to ~45 days after listing (${fmtDateObj(addDays(listDate,45))})` : "When you expect to accept an offer and open escrow"}/>
                        </Row2>
                        {listDate && (
                          <div style={{ marginTop:16 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>Your Estimated Exchange Timeline</div>
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                              <MilestoneCard label="Est. Listing"     dateObj={listDate}   tag="You go live"      dim />
                              <MilestoneCard label="Est. Escrow Open" dateObj={escrowOpen} tag="Offer accepted"   dim />
                              <MilestoneCard label="Est. Close · Day 0" dateObj={closeDate} tag="30-day escrow assumption" />
                              <MilestoneCard label="Est. Day 45"      dateObj={day45}      tag="ID deadline" />
                              <MilestoneCard label="Est. Day 180"     dateObj={day180}     tag="Close deadline" />
                            </div>
                            <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, marginTop:8 }}>
                              All dates are estimates assuming a 30-day escrow. Your actual Day 0 is set when escrow closes.
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  /* ── Listed ── */
                  if (acct.propertyStatus === "listed") {
                    const escrowOpen = parseDate(acct.estimatedEscrowOpenDate);
                    const closeDate  = escrowOpen ? addDays(escrowOpen, 30) : null;
                    const day45      = closeDate  ? addDays(closeDate, 45)  : null;
                    const day180     = closeDate  ? addDays(closeDate, 180) : null;
                    if (closeDate && fmtDateObj(closeDate) !== acct.exchangeStartDate) {
                      setTimeout(() => { updAcct("rp_dateOfSale", fmtDateObj(closeDate)); updAcct("exchangeStartDate", fmtDateObj(closeDate)); }, 0);
                    }
                    return (
                      <>
                        <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Select Your QI Before You Accept an Offer</div>
                          <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                            Enter when you expect to open escrow and we'll calculate your full exchange timeline. Your QI <strong>must be engaged before closing</strong> — not after.
                          </div>
                        </div>
                        <DateInput label="Estimated Escrow Opening Date" required value={acct.estimatedEscrowOpenDate}
                          onChange={v => updAcct("estimatedEscrowOpenDate", v)}
                          placeholder="MM/DD/YYYY" sublabel="When you expect to accept an offer and open escrow"/>
                        {escrowOpen && (
                          <div style={{ marginTop:16 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>Your Estimated Exchange Timeline</div>
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                              <MilestoneCard label="Est. Escrow Open" dateObj={escrowOpen} tag="Offer accepted"   dim />
                              <MilestoneCard label="Est. Close · Day 0" dateObj={closeDate} tag="30-day escrow assumption" />
                              <MilestoneCard label="Est. Day 45"      dateObj={day45}      tag="ID deadline" />
                              <MilestoneCard label="Est. Day 180"     dateObj={day180}     tag="Close deadline" />
                            </div>
                            <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, marginTop:8 }}>
                              Estimated based on a 30-day escrow. Day 0 is confirmed when escrow actually closes.
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  /* ── In Escrow ── */
                  if (acct.propertyStatus === "in_escrow") {
                    const closeDate = parseDate(acct.rp_dateOfSale);
                    const day45     = closeDate ? addDays(closeDate, 45)  : null;
                    const day180    = closeDate ? addDays(closeDate, 180) : null;
                    const d45left   = day45  ? Math.ceil((day45  - new Date()) / (1000*60*60*24)) : null;
                    const d180left  = day180 ? Math.ceil((day180 - new Date()) / (1000*60*60*24)) : null;
                    return (
                      <>
                        <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Your QI Must Be in Place Before Closing</div>
                          <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                            Enter your expected closing date — that becomes Day 0 and starts your IRS clocks. If you don't have a QI yet, contact one <strong>today</strong>.
                          </div>
                        </div>
                        <DateInput label="Expected Close Date" required value={acct.rp_dateOfSale}
                          onChange={v => { updAcct("rp_dateOfSale", v); updAcct("exchangeStartDate", v); }}
                          placeholder="MM/DD/YYYY" sublabel="Day 0 (estimated) — your 45 and 180-day IRS clocks start here"/>
                        {closeDate && (
                          <div style={{ marginTop:16 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>Your Exchange Timeline</div>
                            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                              <MilestoneCard label="Est. Close · Day 0" dateObj={closeDate} tag="Your Day 0" />
                              <MilestoneCard label="Day 45 — ID Deadline" dateObj={day45} tag="Identify properties in writing" urgent={d45left !== null && d45left < 15} />
                              <MilestoneCard label="Day 180 — Close Deadline" dateObj={day180} tag="Must close on replacement" urgent={d180left !== null && d180left < 30} />
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  /* ── Closed ── */
                  if (acct.propertyStatus === "closed") {
                    const closeDate = parseDate(acct.rp_dateOfSale);
                    const day45     = closeDate ? addDays(closeDate, 45)  : null;
                    const day180    = closeDate ? addDays(closeDate, 180) : null;
                    const d45left   = day45  ? Math.ceil((day45  - new Date()) / (1000*60*60*24)) : null;
                    const d180left  = day180 ? Math.ceil((day180 - new Date()) / (1000*60*60*24)) : null;
                    const expired45 = d45left !== null && d45left < 0;
                    const urgent45  = d45left !== null && d45left >= 0 && d45left < 15;
                    return (
                      <>
                        <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Your Closing Date Is Day 0</div>
                          <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                            Your 45-day and 180-day IRS deadlines started the day escrow closed. Enter that date below — we'll calculate exactly where you stand.
                          </div>
                        </div>
                        <DateInput label="Close / Escrow Date" required value={acct.rp_dateOfSale}
                          onChange={v => { updAcct("rp_dateOfSale", v); updAcct("exchangeStartDate", v); }}
                          placeholder="MM/DD/YYYY" sublabel="Day 0 — the date your exchange clocks started"/>
                        {closeDate && (
                          <>
                            {expired45 && (
                              <div style={{ marginTop:16 }}>
                                <InfoCallout type="important" title="DO NOT PROCEED — 45-Day Identification Period Has Expired">
                                  The IRS 45-day identification deadline has passed. A failed exchange may result in the <strong>full capital gains tax bill becoming due immediately</strong>. Please stop and contact your CPA and tax attorney before taking any further action.
                                </InfoCallout>
                              </div>
                            )}
                            {urgent45 && (
                              <div style={{ marginTop:16 }}>
                                <InfoCallout type="important" title={`Urgent — Only ${d45left} Day${d45left !== 1 ? "s" : ""} Left to Identify Properties`}>
                                  You must submit a written identification list to your QI <strong>by {fmtDateObj(day45)}</strong>. The 45-day deadline cannot be extended for any reason. Contact your exchange coordinator immediately.
                                </InfoCallout>
                              </div>
                            )}
                            <div style={{ marginTop:16 }}>
                              <div style={{ fontSize:12, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>Your Exchange Timeline</div>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                                <MilestoneCard label="Closed · Day 0" dateObj={closeDate} tag="Exchange started" />
                                <MilestoneCard label="Day 45 — ID Deadline" dateObj={day45}
                                  tag={expired45 ? "EXPIRED" : urgent45 ? `${d45left} days left — act now` : `${d45left} days left`}
                                  urgent={expired45 || urgent45} />
                                <MilestoneCard label="Day 180 — Close Deadline" dateObj={day180}
                                  tag={d180left !== null ? (d180left < 0 ? "EXPIRED" : `${d180left} days left`) : null}
                                  urgent={d180left !== null && d180left < 0} />
                              </div>
                            </div>
                          </>
                        )}
                        <div style={{ marginTop:20, padding:"14px 16px", background:N.section, borderRadius:10, border:`1px solid ${N.border}` }}>
                          <div style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:2 }}>
                            Closing Statement <span style={{ color:A.red }}>*</span>
                          </div>
                          <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.6, marginBottom:10 }}>
                            Upload the HUD-1 or ALTA Settlement Statement from your property closing. This document confirms
                            the sale price, closing costs, and net proceeds transferred to your Qualified Intermediary.
                          </div>
                          <DocumentUploader
                            label="Upload Closing Statement"
                            sublabel="HUD-1 or ALTA Settlement Statement — PDF, JPG, or PNG · Max 10MB"
                            required
                            accept="image/*,application/pdf"
                            maxFiles={5}
                            maxSizeMB={10}
                            docType="closing-statement"
                            files={docs.closingStatement}
                            onFilesChange={f => setDocFiles("closingStatement", f)}
                          />
                          {docs.closingStatement.length > 0 && docs.closingStatement.every(f => f.status === "uploaded") && (
                            <div style={{ marginTop:8, padding:"8px 10px", background:G.mint, borderRadius:8, border:`1px solid ${G.forest}30` }}>
                              <span style={{ fontSize:11, fontWeight:600, color:G.forest, fontFamily:FONT }}>
                                ✓ {docs.closingStatement.length} closing statement document{docs.closingStatement.length !== 1 ? "s" : ""} uploaded
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  }

                  return null;
                })()}

                {/* ── QI Section (shown once status is selected) ── */}
                {acct.propertyStatus && (
                  <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:20, marginTop:16 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Your Qualified Intermediary (QI)</div>

                    {/* Urgency callout varies by status */}
                    {acct.propertyStatus === "considering" && (
                      <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Good Time to Start Thinking About Your QI</div>
                        <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                          A Qualified Intermediary is a neutral third party — required by IRS rules — that holds your sale proceeds during the exchange. You don't need one yet, but selecting your QI early is a best practice.
                        </div>
                      </div>
                    )}
                    {(acct.propertyStatus === "listed" || acct.propertyStatus === "in_escrow") && (
                      <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>
                          {acct.propertyStatus === "in_escrow" ? "Action Required — Engage Your QI Before Closing" : "Select Your QI Now — Before You Accept an Offer"}
                        </div>
                        <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                          A Qualified Intermediary holds your sale proceeds during the exchange. They <strong>must be engaged before closing</strong> — you cannot receive the funds yourself or the exchange is disqualified.
                        </div>
                      </div>
                    )}
                    {acct.propertyStatus === "closed" && (
                      <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Who Is Holding Your Proceeds?</div>
                        <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                          Your Qualified Intermediary (QI) should currently be holding your sale proceeds in a separate exchange account. Enter their contact information below so we can coordinate the purchase of your DST interests.
                        </div>
                      </div>
                    )}

                    <RadioGroup label="Do you already have a Qualified Intermediary set up?" name="hasQI" required
                      value={acct.hasQI} onChange={v => updAcct("hasQI", v)}
                      options={[
                        { value:"yes", label:"Yes — I have a QI and their contact information", description:"Enter their details below so we can coordinate with them." },
                        { value:"no", label:"No — I still need to find one", description:"No problem — we can introduce you to one of our trusted QI partners at no cost." },
                      ]}
                    />
                    {acct.hasQI === "yes" && (
                      <>
                        <Row2>
                          <TInput label="QI Contact Person Name" required value={acct.qiContactName} onChange={v => updAcct("qiContactName", v)} placeholder="Contact name at QI firm"/>
                          <TInput label="QI Company Name" required value={acct.qiCompany} onChange={v => updAcct("qiCompany", v)} placeholder="Company name"/>
                        </Row2>
                        <Row2>
                          <PhoneInput label="QI Direct Phone" value={acct.qiCell} onChange={v => updAcct("qiCell", v)}/>
                          <EmailInput label="QI Email Address" required value={acct.qiEmail} onChange={v => updAcct("qiEmail", v)}/>
                        </Row2>
                        <TInput label="Exchange Reference Number (optional)" value={acct.qiExchangeNumber} onChange={v => updAcct("qiExchangeNumber", v)} placeholder="Exchange reference number from your QI" sublabel="Provided by your QI when your exchange account was opened"/>
                      </>
                    )}
                    {acct.hasQI === "no" && acct.propertyStatus === "closed" && (
                      <div style={{ padding:"20px 22px", background:C.errorBg, borderRadius:12, border:`2px solid ${C.errorBorder}`, marginTop:8 }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                          <span style={{ color:C.error, display:"flex", alignItems:"center", flexShrink:0, marginTop:1 }}>{React.cloneElement(IC.alertTriangle, { width:20, height:20, strokeWidth:2 })}</span>
                          <div>
                            <div style={{ fontSize:15, fontWeight:600, color:C.error, fontFamily:FONT, marginBottom:6 }}>
                              Do Not Proceed — A Qualified Intermediary Is Required
                            </div>
                            <div style={{ fontSize:13, color:C.error, fontFamily:FONT, lineHeight:1.8, marginBottom:12 }}>
                              You have indicated that your property has <strong>already closed</strong> and that you do not have a Qualified Intermediary in place. <strong>A QI must be engaged before the sale closes</strong> — IRS rules do not permit a retroactive appointment after funds have been received by the seller.
                            </div>
                            <div style={{ fontSize:13, color:C.error, fontFamily:FONT, lineHeight:1.8, marginBottom:16 }}>
                              If your QI was engaged prior to closing and you simply haven't entered their information yet, please update your answer above and provide their contact details. Otherwise, <strong>contact your CPA or tax attorney immediately</strong> before taking any further action — a failed exchange may result in the full capital gains tax liability becoming due.
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                              <button onClick={() => updAcct("hasQI", "yes")} style={{
                                padding:"11px 16px", borderRadius:8, cursor:"pointer", fontFamily:FONT,
                                background:C.error, border:"none", color:T.white, fontSize:13, fontWeight:700,
                                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                              }}>
                                {React.cloneElement(IC.edit, { width:14, height:14, strokeWidth:2 })}
                                I have a QI — Enter Their Info
                              </button>
                              <div style={{ padding:"11px 16px", borderRadius:8, background:"rgba(153,27,27,0.08)", border:`1px solid ${C.errorBorder}`, fontSize:12, color:C.error, fontFamily:FONT, lineHeight:1.5, display:"flex", alignItems:"center", gap:8 }}>
                                {React.cloneElement(IC.phone, { width:14, height:14, strokeWidth:2 })}
                                Contact your CPA or tax attorney before proceeding further.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {acct.hasQI === "no" && acct.propertyStatus !== "closed" && (
                      <div style={{ padding:"18px 20px", background:`${G.forest}06`, borderRadius:12, border:`1px solid ${G.forest}25`, marginTop:8 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:6 }}>We Can Help You Get Set Up</div>
                        <div style={{ fontSize:13, color:T.muted, fontFamily:FONT, lineHeight:1.8, marginBottom:16 }}>
                          Stax Capital works with several nationally-recognized, bonded QI firms. We're happy to make an introduction at no charge to you.
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
                          {[
                            { name:"Asset Preservation, Inc.", note:"National leader · 30+ years experience" },
                            { name:"IPX1031", note:"Fidelity National affiliate · high-volume specialist" },
                            { name:"Accruit", note:"Tech-forward · institutional-grade platform" },
                          ].map(v => (
                            <div key={v.name} style={{ padding:"12px 14px", background:N.card, borderRadius:10, border:`1px solid ${N.border}` }}>
                              <div style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT }}>{v.name}</div>
                              <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, marginTop:3, lineHeight:1.5 }}>{v.note}</div>
                            </div>
                          ))}
                        </div>
                        <CheckBox checked={acct.qiReferralConsent} onChange={v => updAcct("qiReferralConsent", v)}
                          label="I authorize Stax Capital to share my name and contact information with our preferred QI partners for the sole purpose of setting up my 1031 exchange."
                          description="Your information will only be used for this introduction. You are under no obligation to use any referred firm, and this authorization may be revoked at any time."/>
                      </div>
                    )}
                  </div>
                )}

            </StepSection>

            {/* STEP 2 — Sale Property Details */}
            <StepSection step={2} title="Sale Property Details" subtitle="Tell us about the property you're exchanging out of">
                <TInput label="Property Address" required value={acct.rp_address} onChange={v => updAcct("rp_address", v)} placeholder="Street address of the property you sold"/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                  <TInput label="City" required value={acct.rp_city} onChange={v => updAcct("rp_city", v)} placeholder="City"/>
                  <TSelect label="State" required value={acct.rp_state} onChange={v => updAcct("rp_state", v)} options={US_STATES}/>
                  <ZipInput label="ZIP Code" required value={acct.rp_zip} onChange={v => updAcct("rp_zip", v)}/>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <TSelect label="What type of property was it?" required value={acct.rp_propertyType} onChange={v => updAcct("rp_propertyType", v)}
                    options={[
                      { value:"sfr", label:"Single Family Rental" },
                      { value:"mfr", label:"Multi-Family (2–4 units)" },
                      { value:"apartment", label:"Apartment (5+ units)" },
                      { value:"commercial", label:"Commercial" },
                      { value:"industrial", label:"Industrial / Warehouse" },
                      { value:"retail", label:"Retail" },
                      { value:"office", label:"Office" },
                      { value:"mixed_use", label:"Mixed Use" },
                      { value:"land", label:"Land (improved)" },
                      { value:"other", label:"Other" },
                    ]}/>
                  <DateInput label="Original Purchase Date" required value={acct.rp_originalPurchaseDate}
                    onChange={v => updAcct("rp_originalPurchaseDate", v)}
                    placeholder="MM/DD/YYYY" tooltip="The date you originally acquired this property — used to estimate depreciation claimed over your holding period"/>
                </div>

                {/* ── Depreciation Estimator ── */}
                {acct.rp_originalPurchaseDate && acct.rp_originalPurchasePrice > 0 && acct.rp_propertyType && acct.rp_propertyType !== "land" && (() => {
                  const residentialTypes = ["sfr","mfr","apartment"];
                  const scheduleYears = residentialTypes.includes(acct.rp_propertyType) ? 27.5 : 39;
                  const scheduleLabel = residentialTypes.includes(acct.rp_propertyType) ? "27.5-yr residential" : "39-yr nonresidential";
                  const purchaseDate = parseDate(acct.rp_originalPurchaseDate);
                  const yearsHeld = purchaseDate ? Math.max(0, (new Date() - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25)) : 0;
                  const ratio = (acct.rp_improvementRatio ?? 70) / 100;
                  const depBasis = acct.rp_originalPurchasePrice * ratio;
                  const annualDep = depBasis / scheduleYears;
                  const estDep = Math.min(Math.round(annualDep * yearsHeld), depBasis);
                  if (!acct.rp_depreciationOverridden && estDep > 0 && estDep !== acct.rp_accumulatedDepreciation) {
                    setTimeout(() => updAcct("rp_accumulatedDepreciation", estDep), 0);
                  }
                  return (
                    <div style={{ marginTop:12, borderRadius:10, overflow:"hidden", border:`1px solid ${N.border}` }}>
                      {/* ── Dark header ── */}
                      <div style={{ background: WIDGET_HDR, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ color:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center" }}>{React.cloneElement(IC.calculator, { width:14, height:14 })}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:T.white, letterSpacing:"1px", textTransform:"uppercase", fontFamily:FONT }}>Estimated Depreciation</span>
                          {acct.rp_depreciationOverridden && <span style={{ fontSize:10, color:A.amber, fontFamily:FONT }}>(overridden)</span>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:18, fontWeight:700, color:T.white, fontFamily:FONT }}>{fmtFull(estDep)}</span>
                          {acct.rp_depreciationOverridden && (
                            <button onClick={() => { updAcct("rp_depreciationOverridden", false); updAcct("rp_accumulatedDepreciation", estDep); }}
                              style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.8)", fontFamily:FONT, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:6, padding:"3px 10px", cursor:"pointer" }}>
                              Reset
                            </button>
                          )}
                          <button onClick={() => updAcct("rp_depEstExpanded", !acct.rp_depEstExpanded)}
                            style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.8)", fontFamily:FONT, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:6, padding:"3px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                            {acct.rp_depEstExpanded ? "Hide" : "How was this calculated?"}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points={acct.rp_depEstExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* ── Expanded details ── */}
                      {acct.rp_depEstExpanded && (
                        <div style={{ padding:"14px 16px", background:N.card }}>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:14 }}>
                            {[
                              { label:"Depreciable Basis", value:fmtFull(depBasis), sub:`${acct.rp_improvementRatio ?? 70}% of purchase price` },
                              { label:"Schedule", value:scheduleLabel, sub:"IRS straight-line" },
                              { label:"Annual Depreciation", value:fmtFull(Math.round(annualDep)), sub:"per year" },
                              { label:"Years Held", value:`${yearsHeld.toFixed(1)} yrs`, sub:"to today" },
                            ].map(({ label, value, sub }) => (
                              <div key={label} style={{ padding:"10px 12px", background:N.section, borderRadius:8, border:`1px solid ${N.border}` }}>
                                <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>{label}</div>
                                <div style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT }}>{value}</div>
                                <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:1 }}>{sub}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                            <div style={{ fontSize:13, color:T.body, fontFamily:FONT }}>Improvement ratio:</div>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <input type="number" min="0" max="100" step="1"
                                value={acct.rp_improvementRatio ?? 70}
                                onChange={e => { updAcct("rp_improvementRatio", Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))); updAcct("rp_depreciationOverridden", false); }}
                                style={{ ...inputSt, width:64, textAlign:"center", background:N.card, border:`1px solid ${N.border}`, height:32, padding:"0 8px" }}/>
                              <span style={{ fontSize:13, color:T.muted, fontFamily:FONT }}>%</span>
                            </div>
                            <div style={{ fontSize:12, color:T.muted, fontFamily:FONT }}>(land is not depreciable — default 70% improvements / 30% land)</div>
                          </div>
                          <InfoCallout type="warning">
                            <strong>Disclosure:</strong> This estimate uses IRS straight-line depreciation ({scheduleLabel}) applied to {acct.rp_improvementRatio ?? 70}% of your original purchase price as the depreciable basis. Actual depreciation depends on your specific improvements, prior-year deductions, cost segregation studies, and land value allocation. <strong>Your CPA can provide the exact figure from your prior tax returns.</strong>
                          </InfoCallout>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:18, marginTop:12 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Financial Details of the Sale</div>
                  <div style={{ fontSize:12, color:T.muted, fontFamily:FONT, lineHeight:1.6, marginBottom:14 }}>
                    Enter the numbers from your closing statement. Your CPA can help if you're unsure about any of these — estimates are fine at this stage.
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
                    <CurrencyInput label="What did you sell the property for?" required value={acct.rp_salePrice} onChange={v => updAcct("rp_salePrice", v)} sublabel="The gross selling price"/>
                    <CurrencyInput label="What did you pay in selling costs?" value={acct.rp_sellingExpenses} onChange={v => updAcct("rp_sellingExpenses", v)} sublabel="Agent commissions, closing costs, fees"/>
                    <CurrencyInput label="How much was left on your mortgage?" value={acct.rp_existingMortgage} onChange={v => updAcct("rp_existingMortgage", v)} sublabel="Debt paid off at closing"/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
                    <CurrencyInput label="What did you originally pay for it?" value={acct.rp_originalPurchasePrice} onChange={v => updAcct("rp_originalPurchasePrice", v)} sublabel="Your original purchase price"/>
                    <CurrencyInput label="What did you spend improving it?" value={acct.rp_improvements} onChange={v => updAcct("rp_improvements", v)} sublabel="Renovations, additions, capital improvements"/>
                    <CurrencyInput label="Total depreciation you've claimed" value={acct.rp_accumulatedDepreciation} onChange={v => { updAcct("rp_accumulatedDepreciation", v); updAcct("rp_depreciationOverridden", true); }} sublabel="Auto-estimated above"/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <CurrencyInput label="Annual Gross Income (optional)" value={acct.rp_annualIncome} onChange={v => updAcct("rp_annualIncome", v)} sublabel="Rental income collected — used for benefit comparison in cart review"/>
                    <CurrencyInput label="Annual Operating Expenses (optional)" value={acct.rp_annualExpenses} onChange={v => updAcct("rp_annualExpenses", v)} sublabel="Taxes, insurance, maintenance, management fees"/>
                  </div>
                  {acct.rp_salePrice > 0 && (() => {
                    const _netProceeds = acct.rp_salePrice - acct.rp_sellingExpenses - acct.rp_existingMortgage;
                    if (_netProceeds > 0 && _netProceeds !== fs.exchange1031) { setTimeout(() => setFsField("exchange1031", _netProceeds), 0); }
                    return null;
                  })()}
                </div>
            </StepSection>

            {/* STEP 3 — Exchange Timeline (visual + SectionCard combined) */}
            <StepSection step={3} title="Your Exchange Deadlines" subtitle="The IRS gives you two strict, non-waivable deadlines">
                <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Two Deadlines to Know</div>
                  <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                    <strong>45 days:</strong> You must tell your exchange coordinator (QI) which replacement properties you want — in writing.<br/>
                    <strong>180 days:</strong> You must close on those replacement properties. Missing either deadline means the exchange fails and the full tax bill comes due.
                  </div>
                </div>
                {startDate ? (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
                      <div style={{ padding:"14px", background:N.section, borderRadius:10, border:`1px solid ${N.border}`, textAlign:"center" }}>
                        <div style={{ fontSize:10, color:T.light, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Exchange Started</div>
                        <div style={{ fontSize:14, fontWeight:700, color:T.primary, fontFamily:FONT }}>{fmtDateObj(startDate)}</div>
                        <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, marginTop:2 }}>Day 0</div>
                      </div>
                      <div style={{ padding:"14px", borderRadius:10, textAlign:"center",
                        background: days45Left !== null && days45Left < 0 ? C.errorBg : days45Left !== null && days45Left <= 10 ? C.warningBg : G.mint,
                        border:`1px solid ${days45Left !== null && days45Left < 0 ? C.errorBorder : days45Left !== null && days45Left <= 10 ? C.warningBorder : G.forest+"30"}` }}>
                        <div style={{ fontSize:10, color: days45Left !== null && days45Left < 0 ? C.error : T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>45-Day ID Deadline</div>
                        <div style={{ fontSize:14, fontWeight:700, color: days45Left !== null && days45Left < 0 ? C.error : T.primary, fontFamily:FONT }}>{deadline45Date ? fmtDateObj(deadline45Date) : "—"}</div>
                        <div style={{ fontSize:12, fontWeight:700, color: days45Left !== null && days45Left < 0 ? C.error : days45Left !== null && days45Left <= 10 ? C.warning : G.forest, fontFamily:FONT, marginTop:2 }}>
                          {days45Left !== null ? (days45Left < 0 ? "EXPIRED" : `${days45Left} days left`) : "—"}
                        </div>
                      </div>
                      <div style={{ padding:"14px", borderRadius:10, textAlign:"center",
                        background: days180Left !== null && days180Left < 0 ? C.errorBg : days180Left !== null && days180Left <= 30 ? C.warningBg : N.section,
                        border:`1px solid ${days180Left !== null && days180Left < 0 ? C.errorBorder : days180Left !== null && days180Left <= 30 ? C.warningBorder : N.border}` }}>
                        <div style={{ fontSize:10, color: days180Left !== null && days180Left < 0 ? C.error : T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>180-Day Close Deadline</div>
                        <div style={{ fontSize:14, fontWeight:700, color: days180Left !== null && days180Left < 0 ? C.error : T.primary, fontFamily:FONT }}>{deadline180Date ? fmtDateObj(deadline180Date) : "—"}</div>
                        <div style={{ fontSize:12, fontWeight:700, color: days180Left !== null && days180Left < 0 ? C.error : days180Left !== null && days180Left <= 30 ? C.warning : T.body, fontFamily:FONT, marginTop:2 }}>
                          {days180Left !== null ? (days180Left < 0 ? "EXPIRED" : `${days180Left} days left`) : "—"}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <div style={{ height:10, background:N.border, borderRadius:5, overflow:"hidden", position:"relative" }}>
                        <div style={{ position:"absolute", left:"25%", top:0, bottom:0, width:2, background:C.warningBorder, zIndex:1 }}/>
                        <div style={{ height:"100%", width:`${Math.min(100, timelineProgress())}%`,
                          background: timelineProgress() > 100 ? A.red : timelineProgress() > 25 ? A.amber : `linear-gradient(90deg,${G.forest},${G.light})`,
                          borderRadius:5, transition:"width 0.3s" }}/>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                        <span style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>Day 0 — Sale closes</span>
                        <span style={{ fontSize:10, color:C.warning, fontFamily:FONT, fontWeight:600 }}>Day 45 — ID deadline</span>
                        <span style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>Day 180 — Close deadline</span>
                      </div>
                    </div>
                    {days45Left !== null && days45Left >= 0 && days45Left <= 15 && (
                      <InfoCallout type="warning" title={`Action Required — Only ${days45Left} Days to Identify Properties`}>
                        Contact your exchange coordinator today and confirm that these DST properties are on your written identification list. The 45-day deadline is firm — it cannot be extended.
                      </InfoCallout>
                    )}
                    {days45Left !== null && days45Left < 0 && (
                      <InfoCallout type="important" title="45-Day Identification Period Has Expired">
                        Please consult your tax advisor immediately. A failed exchange may result in the full capital gains tax bill coming due.
                      </InfoCallout>
                    )}
                  </>
                ) : (
                  <div style={{ padding:"14px 16px", background:N.section, borderRadius:10, textAlign:"center" }}>
                    <div style={{ fontSize:13, color:T.muted, fontFamily:FONT }}>Enter the date your QI received proceeds in Step 1 (Sale Logistics) to see your exchange deadlines here.</div>
                  </div>
                )}
                <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:14, marginTop:12 }}>
                  <CheckBox checked={acct.propertiesIdentified} onChange={v => updAcct("propertiesIdentified", v)}
                    label="I have identified replacement properties in writing to my exchange coordinator"/>
                  <CheckBox checked={acct.exchangeTimelineAck} onChange={v => updAcct("exchangeTimelineAck", v)}
                    label="I understand the 45-day and 180-day deadlines and the consequences of missing them"
                    description="Missing either deadline will result in a failed exchange and the full capital gains tax bill becoming due."/>
                </div>
            </StepSection>

            {/* STEP 4 — Tax Savings Estimate */}
            <StepSection step={4} title="Your Tax Deferral" subtitle="Understand what you're deferring by completing this exchange">
                <div style={{ borderLeft:`3px solid ${N.border}`, paddingLeft:14, marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Why This Matters</div>
                  <div style={{ fontSize:13, color:T.body, fontFamily:FONT, lineHeight:1.8 }}>
                    I have fully assessed the tax liabilities from the sale of my investment property — including federal capital gains, state income tax, depreciation recapture, and net investment income tax. I have decided these are unacceptable at this time, and I have elected to complete a 1031 exchange.
                  </div>
                </div>
                <RadioGroup label="Do you already know how much tax you would owe without the exchange?" name="knowsTaxLiab"
                  value={acct.knowsTaxLiab}
                  onChange={v => { updAcct("knowsTaxLiab", v); updAcct("showTaxCalculator", v === "no"); }}
                  options={[
                    { value:"yes", label:"Yes — my CPA gave me the number", description:"Enter the amount your tax professional provided." },
                    { value:"no", label:"No — help me estimate it", description:"Use our rough calculator. Remember, this is NOT tax advice." },
                  ]}
                />
                {acct.knowsTaxLiab === "yes" && (
                  <CurrencyInput label="Estimated Total Tax Liability" value={typeof acct.estimatedTaxLiability === "number" ? acct.estimatedTaxLiability : 0}
                    onChange={v => updAcct("estimatedTaxLiability", v)} sublabel="The amount your CPA or tax professional provided"/>
                )}
                {acct.showTaxCalculator === true && (() => {
                  const adjBasis = acct.rp_originalPurchasePrice + acct.rp_improvements - acct.rp_accumulatedDepreciation;
                  const realizedGain = Math.max(0, (acct.rp_salePrice - acct.rp_sellingExpenses) - adjBasis);
                  const depRecapture = Math.min(acct.rp_accumulatedDepreciation, realizedGain);
                  const capGain = Math.max(0, realizedGain - depRecapture);
                  const fedCapGainTax = capGain * (acct.tc_federalCapGainRate / 100);
                  const depRecaptureTax = depRecapture * (acct.tc_depreciationRecaptureRate / 100);
                  const stateTax = realizedGain * (acct.tc_stateIncomeRate / 100);
                  const niitTax = acct.tc_niitApplies ? realizedGain * (acct.tc_niitRate / 100) : 0;
                  const totalEstTax = fedCapGainTax + depRecaptureTax + stateTax + niitTax;
                  if (acct.estimatedTaxLiability !== totalEstTax && totalEstTax > 0) { setTimeout(() => updAcct("estimatedTaxLiability", totalEstTax), 0); }
                  return (
                    <div style={{ padding:"16px 18px", background:N.section, borderRadius:12, border:`1px solid ${N.border}` }}>
                      <div style={{ padding:"10px 14px", background:C.errorBg, borderRadius:8, border:`1px solid ${C.errorBorder}`, marginBottom:14 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:C.error, fontFamily:FONT }}>Rough Estimate Only — Not Tax Advice. Consult your CPA for your actual figures.</div>
                      </div>
                      <Row2>
                        <TSelect label="Filing Status" value={acct.tc_filingStatus} onChange={v => updAcct("tc_filingStatus", v)}
                          options={[{value:"single",label:"Single"},{value:"mfj",label:"Married Filing Jointly"},{value:"mfs",label:"Married Filing Separately"},{value:"hoh",label:"Head of Household"}]}/>
                        <TSelect label="State of Residence" value={acct.tc_stateOfResidence} onChange={v => {
                          updAcct("tc_stateOfResidence", v);
                          const stRates = {"California":13.3,"New York":10.9,"New Jersey":10.75,"Oregon":9.9,"Minnesota":9.85,"Vermont":8.75,"Iowa":8.53,"Wisconsin":7.65,"Maine":7.15,"South Carolina":6.5,"Idaho":5.8,"Colorado":4.4,"Illinois":4.95,"Massachusetts":5.0,"Pennsylvania":3.07,"Arizona":2.5,"North Dakota":2.5,"Texas":0,"Florida":0,"Nevada":0,"Washington":0,"Wyoming":0,"Tennessee":0,"South Dakota":0,"Alaska":0,"New Hampshire":0};
                          updAcct("tc_stateIncomeRate", stRates[v] || 5.0);
                        }} options={US_STATES}/>
                      </Row2>
                      <Row2>
                        <FormField label="Federal Capital Gains Rate" sublabel="Typically 15% or 20% for long-term gains">
                          <select value={acct.tc_federalCapGainRate} onChange={e => updAcct("tc_federalCapGainRate", parseFloat(e.target.value))} className="stax-select" style={selSt}>
                            <option value={0}>0%</option><option value={15}>15%</option><option value={20}>20%</option>
                          </select>
                        </FormField>
                        <FormField label="State Income Tax Rate" sublabel={`${acct.tc_stateIncomeRate}% — auto-filled from state selection`}>
                          <input className="stax-input" type="number" step="0.1" min="0" max="15" value={acct.tc_stateIncomeRate} onChange={e => updAcct("tc_stateIncomeRate", parseFloat(e.target.value) || 0)} style={inputSt}/>
                        </FormField>
                      </Row2>
                      <CheckBox checked={acct.tc_niitApplies} onChange={v => updAcct("tc_niitApplies", v)}
                        label="Apply Net Investment Income Tax (NIIT) — 3.8%"
                        description="This applies if your adjusted gross income exceeds $200,000 (single) or $250,000 (married filing jointly). Ask your CPA if unsure."/>
                      {realizedGain > 0 && (
                        <div style={{ marginTop:14, padding:"16px 18px", background:N.card, borderRadius:10, border:`1px solid ${N.border}` }}>
                          <div style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:12 }}>Estimated Tax if You Don't Exchange</div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"8px 16px", fontSize:13, fontFamily:FONT }}>
                            <span style={{ color:T.muted }}>Capital Gain (excluding recapture)</span><span style={{ color:T.primary, fontWeight:600, textAlign:"right" }}>{fmtFull(capGain)}</span>
                            <span style={{ color:T.muted }}>Federal Capital Gains Tax ({acct.tc_federalCapGainRate}%)</span><span style={{ color:T.primary, fontWeight:600, textAlign:"right" }}>{fmtFull(fedCapGainTax)}</span>
                            <span style={{ color:T.muted }}>Depreciation Recapture Tax (25%)</span><span style={{ color:T.primary, fontWeight:600, textAlign:"right" }}>{fmtFull(depRecaptureTax)}</span>
                            <span style={{ color:T.muted }}>State Income Tax ({acct.tc_stateIncomeRate}%)</span><span style={{ color:T.primary, fontWeight:600, textAlign:"right" }}>{fmtFull(stateTax)}</span>
                            {acct.tc_niitApplies && <><span style={{ color:T.muted }}>Net Investment Income Tax (3.8%)</span><span style={{ color:T.primary, fontWeight:600, textAlign:"right" }}>{fmtFull(niitTax)}</span></>}
                            <div style={{ gridColumn:"1/-1", height:1, background:N.border, margin:"4px 0" }}/>
                            <span style={{ color:T.primary, fontWeight:700, fontSize:14 }}>Total Tax You'd Owe</span><span style={{ color:A.red, fontWeight:600, fontSize:16, textAlign:"right" }}>{fmtFull(totalEstTax)}</span>
                            <span style={{ color:G.forest, fontWeight:700, fontSize:14 }}>Amount Saved by Exchanging</span><span style={{ color:G.forest, fontWeight:600, fontSize:16, textAlign:"right" }}>{fmtFull(totalEstTax)}</span>
                          </div>
                        </div>
                      )}
                      <CheckBox checked={acct.taxCalcDisclosureAck} onChange={v => updAcct("taxCalcDisclosureAck", v)}
                        label="I understand this is a rough estimate and not tax advice. I will verify my actual tax liability with my CPA."/>
                    </div>
                  );
                })()}
                <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:14, marginTop:12 }}>
                  <RadioGroup label="How much are tax savings influencing your decision to invest?" name="taxImpact" required
                    value={acct.taxImpactOnRisk} onChange={v => updAcct("taxImpactOnRisk", v)}
                    options={[
                      { value:"not_at_all", label:"Not at all — I'd invest regardless" },
                      { value:"somewhat", label:"Somewhat — taxes are a factor" },
                      { value:"significantly", label:"Significantly — taxes are a major reason" },
                      { value:"primarily", label:"Primarily — I'm mainly doing this for the tax savings" },
                    ]}/>
                  <CheckBox checked={acct.exchange1031Acknowledged} onChange={v => updAcct("exchange1031Acknowledged", v)}
                    label="I acknowledge the risks of DST investments and confirm I am not making decisions based solely on tax savings"
                    description="I have reviewed or will review the offering documents and understand the fees, illiquidity, and investment risks involved."/>
                </div>
            </StepSection>

            </div>{/* end left column */}

            {/* RIGHT COLUMN — sticky results widget */}
            <div style={{ width: 308, flexShrink: 0, position: "sticky", top: 90, alignSelf: "flex-start" }}>
              <div style={{ background: N.card, borderRadius: 14, border: `1px solid ${N.border}`, overflow: "hidden" }}>
                {/* Widget header */}
                <div style={{ background: WIDGET_HDR, padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>1031 Exchange</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.white, fontFamily: FONT, letterSpacing: "-0.01em" }}>Tax Deferral Overview</div>
                </div>
                {/* Three key highlights */}
                <div style={{ padding: "18px 20px", background: `${G.forest}06`, borderBottom: `1px solid ${N.border}` }}>
                  {[
                    { label: "Exchange Proceeds", value: exchangeProceeds > 0 ? fmtFull(exchangeProceeds) : "—" },
                    { label: "Estimated Tax Deferred", value: estDeferral > 0 ? `~${fmtFull(estDeferral)}` : "—" },
                    { label: "45-Day Deadline", value: days45Left !== null ? `${days45Left} days left` : "Starts at close" },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} style={{ paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${N.divider}` : "none" }}>
                      <div style={{ fontSize: 12, color: G.forest, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3, fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: T.primary, fontFamily: FONT, letterSpacing: "-0.02em" }}>{value}</div>
                    </div>
                  ))}
                </div>
                {/* Detailed results */}
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, fontFamily: FONT, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Sale Details</div>
                  {[
                    { label: "Adjusted Basis", value: (acct.rp_originalPurchasePrice || 0) > 0 ? fmtFull(Math.max(0, adjBasis1031)) : "—", valueColor: T.primary, hint: null },
                    { label: "Estimated Taxable Gain", value: realizedGain1031 !== null ? fmtFull(realizedGain1031) : "—", valueColor: realizedGain1031 !== null ? (realizedGain1031 >= 0 ? G.forest : A.red) : T.primary, hint: null },
                    { label: "Net Sale Proceeds", value: netProceeds1031 !== null ? fmtFull(netProceeds1031) : "—", valueColor: G.forest, hint: null },
                    { label: "Amount to Reinvest", value: exchangeProceeds > 0 ? fmtFull(exchangeProceeds) : (netProceeds1031 !== null ? fmtFull(netProceeds1031) : "—"), valueColor: G.forest, hint: "Auto-allocated to your DSTs" },
                  ].map(({ label, value, valueColor, hint }, i, arr) => (
                    <div key={label} style={{ paddingBottom: i < arr.length - 1 ? 12 : 0, marginBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${N.divider}` : "none" }}>
                      <div style={{ fontSize: 12, color: T.muted, fontFamily: FONT, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: valueColor, fontFamily: FONT }}>{value}</div>
                      {hint && <div style={{ fontSize: 12, color: T.muted, fontFamily: FONT, marginTop: 2 }}>{hint}</div>}
                    </div>
                  ))}
                </div>
                {!exchangeProceeds && (
                  <div style={{ padding: "0 20px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: T.muted, fontFamily: FONT, lineHeight: 1.6 }}>Fill in your sale details to see your exchange overview</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── Direct investment confirmation ── */}
        {isDirect && (
          <div style={{ background: N.card, borderRadius: 14, border: `1px solid ${N.border}`, padding: "24px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0, color: G.forest, display:"flex", alignItems:"center" }}>{IC.dollarSign}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.primary, fontFamily: FONT, marginBottom: 4 }}>Direct Cash Investment</div>
                <div style={{ fontSize: 13, color: T.muted, fontFamily: FONT, lineHeight: 1.7 }}>
                  You will invest after-tax dollars directly into your selected DST interests. You can set your investment amounts in the next step.
                  DST investments still offer <strong>passive monthly income</strong>, <strong>professional management</strong>, and <strong>portfolio diversification</strong> across institutional real estate.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     STEP 2 — CART REVIEW + PORTFOLIO ECONOMICS
     ══════════════════════════════════════════════════════ */
  const CartStep = () => {
    const is1031 = acct.exchangeBusiness === true;
    const exchangeProceeds = fs.exchange1031 || 0;
    const startDate = parseDate(acct.exchangeStartDate);
    const deadline45Date = startDate ? addDays(startDate, 45) : null;
    const days45Left = deadline45Date ? daysUntil(fmtDateObj(deadline45Date)) : null;

    const autoAllocate = () => {
      if (!exchangeProceeds || cartItems.length === 0) return;
      const perItem = Math.floor(exchangeProceeds / cartItems.length / 1000) * 1000;
      const newCart = {};
      cartItems.forEach((item, i) => {
        const amt = i === cartItems.length - 1
          ? exchangeProceeds - perItem * (cartItems.length - 1)
          : perItem;
        newCart[item.id] = Math.max(amt, item.minInvestment);
      });
      setCart(p => ({ ...p, ...newCart }));
    };

    const debtRetired = acct.rp_existingMortgage || 0;
    const dstDebt = cartItems.reduce((s, item) => {
      const eq = cart[item.id] || 0;
      const prop = item.offeringEquity > 0 ? eq / item.offeringEquity : 0;
      return s + prop * item.loanAmount;
    }, 0);
    const debtBootOk = debtRetired === 0 || dstDebt >= debtRetired;
    const debtDelta = debtBootOk ? Math.max(0, dstDebt - debtRetired) : Math.max(0, debtRetired - dstDebt);
    const cashBootOk = fsCalcs.unallocated === 0 || !is1031;
    const allocPct = is1031 && exchangeProceeds > 0 ? Math.min(100, (cartTotal / exchangeProceeds) * 100) : 100;
    const estAnnualIncome = cartItems.reduce((s, i) => s + (cart[i.id] || 0) * (i.distributionRate / 100), 0);

    return (
    <div style={{ maxWidth:900, margin:"0 auto" }}>


      {/* ── Page header ── */}
      <div style={{ marginBottom:20, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:600, color:T.primary, fontFamily:FONT, margin:"0 0 6px", letterSpacing:"-0.01em" }}>
            Confirm Your Investment Plan
          </h1>
          <p style={{ fontSize:14, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6 }}>
            {is1031 && exchangeProceeds > 0
              ? "Review the amounts invested in each DST below. To avoid taxable boot, your full exchange proceeds should be allocated."
              : "Review and adjust your investment details before continuing."}
          </p>
        </div>
        {is1031 && exchangeProceeds > 0 && (
          <button onClick={autoAllocate} style={{
            padding:"8px 16px", borderRadius:8, cursor:"pointer",
            background:G.forest, border:`1px solid ${G.medium || G.forest}`,
            color:T.white, fontWeight:600, fontSize:12, fontFamily:FONT,
            display:"flex", alignItems:"center", gap:6, flexShrink:0, marginTop:4,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            Split Evenly
          </button>
        )}
      </div>

      {/* Single-column main content */}
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

        {/* ── 1031 proceeds bar ── */}
        {is1031 && exchangeProceeds > 0 && (
          <div style={{ padding:"16px 18px", background:N.card, borderRadius:12, border:`1px solid ${N.border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT }}>Exchange Proceeds Allocated</span>
              <span style={{ fontSize:15, fontWeight:600, color: cashBootOk ? G.forest : A.red, fontFamily:FONT }}>
                {fmtFull(cartTotal)}
                <span style={{ fontSize:13, fontWeight:500, color:T.muted }}> of {fmtFull(exchangeProceeds)}</span>
              </span>
            </div>
            <div style={{ height:8, background:N.neutral, borderRadius:5, overflow:"hidden", marginBottom:12 }}>
              <div style={{ height:"100%", width:`${allocPct}%`, borderRadius:5, transition:"width 0.4s ease",
                background: cashBootOk ? G.forest : A.red }}/>
            </div>
            {(() => {
              const warnings = [
                ...(!cashBootOk ? [`${fmtFull(fsCalcs.unallocated)} not yet allocated — taxable cash boot may apply`] : []),
                ...(debtRetired > 0 && !debtBootOk ? [`Debt shortfall of ${fmtFull(debtDelta)} — mortgage boot may apply`] : []),
                ...(days45Left !== null && days45Left < 20 ? [`${days45Left < 0 ? "Expired" : `${days45Left} days remaining`} to identify properties (45-day IRS deadline)`] : []),
              ];
              const successes = [
                ...(cashBootOk ? ["All proceeds fully invested — no cash boot"] : []),
                ...(debtRetired > 0 && debtBootOk ? [`Debt replacement satisfied — DST debt exceeds retired mortgage by ${fmtFull(debtDelta)}`] : []),
                ...(days45Left !== null && days45Left >= 20 ? [`${days45Left} days remaining on 45-day IRS identification deadline`] : []),
              ];
              if (warnings.length === 0 && successes.length === 0) return null;
              if (warnings.length === 0) {
                return (
                  <div style={{ borderLeft:`3px solid ${G.forest}`, paddingLeft:12, paddingRight:12, paddingTop:10, paddingBottom:10, background:`${G.forest}06`, borderRadius:"0 6px 6px 0", marginBottom:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:G.forest, fontFamily:FONT, marginBottom:successes.length > 1 ? 6 : 0 }}>Exchange Status</div>
                    {successes.map((msg, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6, marginTop: i > 0 ? 4 : (successes.length > 1 ? 0 : 0) }}>
                        <span style={{ color:G.forest, fontSize:11, marginTop:1, flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:12, color:G.forest, fontFamily:FONT }}>{msg}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div style={{ borderLeft:`3px solid ${A.coral}`, paddingLeft:12, paddingRight:12, paddingTop:10, paddingBottom:10, background:C.errorBg, borderRadius:"0 6px 6px 0", marginBottom:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.error, fontFamily:FONT, marginBottom:6 }}>Exchange Alerts</div>
                  {warnings.map((msg, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6, marginTop: i > 0 ? 4 : 0 }}>
                      <span style={{ color:A.coral, fontSize:11, marginTop:1, flexShrink:0 }}>!</span>
                      <span style={{ fontSize:12, color:C.error, fontFamily:FONT }}>{msg}</span>
                    </div>
                  ))}
                  {successes.length > 0 && (
                    <div style={{ borderTop:`1px solid #fca5a530`, marginTop:8, paddingTop:8 }}>
                      {successes.map((msg, i) => (
                        <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6, marginTop: i > 0 ? 4 : 0 }}>
                          <span style={{ color:G.forest, fontSize:11, marginTop:1, flexShrink:0 }}>✓</span>
                          <span style={{ fontSize:12, color:G.forest, fontFamily:FONT }}>{msg}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            {/* KPI cards inside the allocation card */}
            <div style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" }}>
              {[
                { label:"Total Invested", value:fmtFull(cartTotal), sub:`across ${cartItems.length} DST${cartItems.length !== 1 ? "s" : ""}`, color:T.primary },
                ...(is1031 && exchangeProceeds > 0 ? [{
                  label: cashBootOk ? "Nothing Left Over" : "Not Yet Allocated",
                  value: fmtFull(fsCalcs.unallocated),
                  sub: cashBootOk ? "No taxable boot" : "Consider allocating",
                  color: cashBootOk ? G.forest : A.red,
                }] : []),
                { label:"Est. Year 1 Income", value:fmtFull(estAnnualIncome), sub:"from DST distributions", color:G.forest },
                { label:"Est. Monthly Income", value:fmtFull(estAnnualIncome / 12), sub:"avg per month", color:G.forest },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ flex:"1 1 140px", padding:"12px 14px", borderRadius:8, background:N.section, border:`1px solid ${N.border}` }}>
                  <div style={{ fontSize:9, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:18, fontWeight:700, color, fontFamily:FONT, letterSpacing:"-0.02em", marginBottom:2 }}>{value}</div>
                  <div style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      {cartItems.length === 0 ? (
        <div style={{ padding:60, textAlign:"center", background:N.section, borderRadius:14, border:`1px dashed ${N.border}` }}>
          <div style={{ marginBottom:12, color: T.muted, display:"flex", justifyContent:"center" }}>{React.cloneElement(IC.cart, {width:36, height:36, strokeWidth:1.5})}</div>
          <div style={{ fontSize:15, fontWeight:600, color:T.body, fontFamily:FONT }}>Cart is empty</div>
          <BtnSecondary onClick={goBack} style={{ marginTop:16 }}>← Back to Marketplace</BtnSecondary>
        </div>
      ) : (
        <>
          {/* ── Cart Item Cards ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {cartItems.map(item => {
              const concPct = cartTotal > 0 ? ((cart[item.id] / cartTotal) * 100) : 0;
              const belowMin = cart[item.id] > 0 && cart[item.id] < item.minInvestment;
              // Derive property type color
              const typeColorMap = { Multifamily:"#3B82F6", Industrial:"#F59E0B", Office:"#8B5CF6", Retail:"#EF4444", "Net Lease":"#10B981", Mixed:"#6366F1" };
              const typeColor = typeColorMap[item.propertyTypeShort] || "#6B7280";
              return (
                <div key={item.id} style={{
                  display:"flex", alignItems:"stretch",
                  background:N.card, borderRadius:10,
                  border:`1.5px solid ${belowMin ? A.red+"50" : N.border}`,
                  overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
                  minHeight:96,
                }}>
                  {/* ── Property image + sponsor overlay ── */}
                  <div style={{ position:"relative", width:168, minWidth:168, flexShrink:0, overflow:"hidden" }}>
                    <img src={item.image} alt={item.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                    {/* Gradient overlay */}
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 60%, rgba(0,0,0,0) 100%)" }}/>
                    {/* Sponsor badge bottom-left */}
                    <div style={{ position:"absolute", bottom:8, left:8 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:T.white, fontFamily:FONT,
                        background:"rgba(255,255,255,0.18)", backdropFilter:"blur(4px)",
                        padding:"3px 8px", borderRadius:4, letterSpacing:"0.04em" }}>
                        {item.sponsor}
                      </span>
                    </div>
                  </div>

                  {/* ── Product info ── */}
                  <div style={{ flex:1, padding:"12px 14px", display:"flex", flexDirection:"column", justifyContent:"center", minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {item.name}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      {/* Location */}
                      <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.body} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style={{ fontSize:11, color:T.body, fontFamily:FONT, whiteSpace:"nowrap" }}>{item.location}</span>
                      </div>
                      {/* Property type pill */}
                      <span style={{ fontSize:10, fontWeight:600, color:typeColor, fontFamily:FONT,
                        background:typeColor+"18", padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap" }}>
                        {item.propertyTypeShort.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* ── Cash Flow ── */}
                  <div style={{ width:90, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px 10px" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Cash Flow</div>
                    <div style={{ fontSize:16, fontWeight:700, color:G.forest, fontFamily:FONT }}>{pct(item.cashOnCash)}</div>
                  </div>

                  {/* ── LTV ── */}
                  <div style={{ width:80, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px 10px" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>LTV</div>
                    <div style={{ fontSize:16, fontWeight:700, color:T.primary, fontFamily:FONT }}>{item.leverage.toFixed(2)}%</div>
                  </div>

                  {/* ── Amount input ── */}
                  <div style={{ width:190, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px 14px" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6, alignSelf:"flex-start" }}>Investment Amount</div>
                    <CartAmountInput value={cart[item.id]} onCommit={v => setCart(p => ({ ...p, [item.id]: v }))}/>
                    {belowMin && (
                      <div style={{ fontSize:10, color:A.red, fontFamily:FONT, marginTop:4, alignSelf:"flex-start" }}>
                        Min. {fmtFull(item.minInvestment)}
                      </div>
                    )}
                    {cartTotal > 0 && (
                      <div style={{ fontSize:10, color: concPct > 50 ? A.red : concPct > 30 ? A.amber : T.muted, fontFamily:FONT, marginTop:3, alignSelf:"flex-start" }}>
                        {concPct.toFixed(1)}% of total
                      </div>
                    )}
                  </div>

                  {/* ── Remove ── */}
                  <div style={{ width:48, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <button onClick={() => setCart(p => ({ ...p, [item.id]: 0 }))}
                      title="Remove from plan"
                      style={{ background:"none", border:"none", cursor:"pointer", color:T.light, padding:8, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center",
                        transition:"color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = A.red}
                      onMouseLeave={e => e.currentTarget.style.color = "#9CA3AF"}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>


          {/* ── Portfolio Economics ── */}
          {(() => {
            const portfolioItems = cartItems.map(item => {
              const investorEquity = cart[item.id] || 0;
              const equityProportion = item.offeringEquity > 0 ? investorEquity / item.offeringEquity : 0;
              const investorDebtShare = equityProportion * item.loanAmount;
              const investorTotalValue = investorEquity + investorDebtShare;
              const annualCashFlow = investorEquity * (item.distributionRate / 100);
              const monthlyCashFlow = annualCashFlow / 12;
              const ownershipPct = equityProportion * 100;
              return { item, investorEquity, equityProportion, investorDebtShare, investorTotalValue, annualCashFlow, monthlyCashFlow, ownershipPct };
            });
            const totals = portfolioItems.reduce((acc, r) => ({
              equity: acc.equity + r.investorEquity,
              debt: acc.debt + r.investorDebtShare,
              totalValue: acc.totalValue + r.investorTotalValue,
              cashFlow: acc.cashFlow + r.annualCashFlow,
            }), { equity: 0, debt: 0, totalValue: 0, cashFlow: 0 });
            const blendedLTV = totals.equity > 0 ? (totals.debt / totals.totalValue) * 100 : 0;
            const blendedYield = totals.equity > 0 ? (totals.cashFlow / totals.equity) * 100 : 0;

            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ background:`linear-gradient(135deg, ${G.darkest} 0%, ${G.deep} 100%)`, borderRadius: "12px 12px 0 0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color:"rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: FONT, marginBottom: 2 }}>Portfolio Economics</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color:T.white, fontFamily: FONT }}>Investor Equity · Debt Allocation · Total Value · Cash Flow</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color:"rgba(255,255,255,0.45)", fontFamily: FONT, textTransform: "uppercase", letterSpacing: 1 }}>Total RE Value Controlled</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color:T.white, fontFamily: FONT }}>{fmtFull(totals.totalValue)}</div>
                  </div>
                </div>

                <div style={{ background: N.card, border: `1px solid ${N.border}`, borderTop: "none", borderRadius: "0 0 12px 12px", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT }}>
                    <thead>
                      <tr style={{ background: N.section }}>
                        {[
                          { label: "Offering", align: "left", color: T.muted },
                          { label: "Ownership %", align: "right", color: T.muted },
                          { label: "Investor Equity", align: "right", color: G.forest },
                          { label: "Total Value", align: "right", color: T.muted },
                          { label: "Annual Cash Flow", align: "right", color: G.forest },
                          { label: "Monthly Income", align: "right", color: G.medium || G.forest },
                        ].map(h => (
                          <th key={h.label} style={{ padding: "10px 14px", fontSize: 9, fontWeight: 700, color: h.color, textTransform: "uppercase", letterSpacing: "1px", textAlign: h.align, whiteSpace: "nowrap" }}>{h.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioItems.map(({ item, investorEquity, investorDebtShare, investorTotalValue, annualCashFlow, monthlyCashFlow, ownershipPct }) => (
                        <tr key={item.id}>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>{item.shortName || item.name}</div>
                            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{item.propertyTypeShort}</div>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: T.body }}>{ownershipPct.toFixed(3)}%</div>
                            <div style={{ fontSize: 9, color: T.muted }}>of {fmtM(item.offeringEquity)} equity</div>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: G.forest }}>{fmtFull(investorEquity)}</div>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{fmtFull(investorTotalValue)}</div>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: G.forest }}>{fmtFull(annualCashFlow)}</div>
                            <div style={{ fontSize: 9, color: T.muted }}>{pct(item.distributionRate)} dist. rate</div>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: G.light }}>{fmtFull(monthlyCashFlow)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background:N.section, borderTop:`1px solid ${N.border}` }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color:T.muted, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: FONT }}>Portfolio Total</div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <div style={{ fontSize: 9, color:T.light, textTransform: "uppercase" }}>—</div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color:G.forest, fontFamily: FONT }}>{fmtFull(totals.equity)}</div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color:T.primary, fontFamily: FONT }}>{fmtFull(totals.totalValue)}</div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color:G.forest, fontFamily: FONT }}>{fmtFull(totals.cashFlow)}</div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color:G.forest, fontFamily: FONT }}>{fmtFull(totals.cashFlow / 12)}</div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ── 1031 Exchange Completion Analysis ── */}
          {is1031 && (() => {
            const debtRetired = acct.rp_debtRetired || acct.rp_existingMortgage || 0;
            const dstDebtTotal = cartItems.reduce((s, item) => {
              const eq = cart[item.id] || 0;
              const prop = item.offeringEquity > 0 ? eq / item.offeringEquity : 0;
              return s + prop * item.loanAmount;
            }, 0);
            const equityAllocated = cartTotal;
            const equityNeeded = exchangeProceeds;
            const equityShortfall = Math.max(0, equityNeeded - equityAllocated);
            const debtShortfall = Math.max(0, debtRetired - dstDebtTotal);
            const equityOk = equityShortfall === 0 && equityNeeded > 0;
            const debtOk = debtRetired === 0 || dstDebtTotal >= debtRetired;
            const allGood = equityOk && debtOk;

            return (
              <div style={{ background: N.card, borderRadius: 14, border: `1px solid ${N.border}`, overflow:"hidden", marginBottom:16 }}>
                <div style={{ background:`linear-gradient(135deg, ${G.darkest} 0%, ${G.deep} 100%)`, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ color:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center" }}>{allGood ? React.cloneElement(IC.shield, {width:18,height:18,strokeWidth:2}) : React.cloneElement(IC.alertTriangle, {width:18,height:18,strokeWidth:2})}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:T.white, fontFamily:FONT }}>
                      {allGood ? "Your 1031 Exchange Is On Track" : "Action Needed — Review Your Exchange Completion"}
                    </div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontFamily:FONT, marginTop:1 }}>
                      {allGood
                        ? "All exchange proceeds are allocated and debt replacement is satisfied. You're in good shape."
                        : "Address the items below to minimize or eliminate taxable boot."}
                    </div>
                  </div>
                </div>
                <div style={{ padding:"20px 24px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>

                    {/* Equity check */}
                    <div style={{ padding:"16px", borderRadius:10, background: equityOk ? G.mint : C.warningBg, border:`1px solid ${equityOk ? G.forest+"30" : C.warningBorder}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color: equityOk ? G.forest : C.warning, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>
                        {equityOk ? "✓ Equity Fully Reinvested" : "⚠ Unallocated Equity (Cash Boot)"}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                        {[
                          { label:"Proceeds to Reinvest", value:fmtFull(equityNeeded) },
                          { label:"Amount Allocated", value:fmtFull(equityAllocated) },
                          { label: equityOk ? "Excess Equity" : "Unallocated (Boot)", value:fmtFull(Math.abs(equityNeeded - equityAllocated)), warn:!equityOk },
                        ].map(({ label, value, warn }) => (
                          <div key={label}>
                            <div style={{ fontSize:10, color: warn ? C.warning : T.muted, fontFamily:FONT, marginBottom:2 }}>{label}</div>
                            <div style={{ fontSize:15, fontWeight:700, color: warn ? A.red : G.forest, fontFamily:FONT }}>{value}</div>
                          </div>
                        ))}
                      </div>
                      {!equityOk && equityShortfall > 0 && (
                        <div style={{ marginTop:10, fontSize:12, color:C.warning, fontFamily:FONT, lineHeight:1.7 }}>
                          The unallocated <strong>{fmtFull(equityShortfall)}</strong> will likely be treated as taxable cash boot. Increase your DST allocations to fully reinvest your proceeds.
                        </div>
                      )}
                    </div>

                    {/* Debt check */}
                    <div style={{ padding:"16px", borderRadius:10, background: debtOk ? G.mint : C.warningBg, border:`1px solid ${debtOk ? G.forest+"30" : C.warningBorder}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color: debtOk ? G.forest : C.warning, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>
                        {debtRetired === 0 ? "No Debt Replacement Required" : debtOk ? "✓ Debt Replacement Satisfied" : "⚠ Debt Shortfall (Mortgage Boot)"}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                        {[
                          { label:"Debt Retired at Sale", value: debtRetired > 0 ? fmtFull(debtRetired) : "None" },
                          { label:"DST Debt Share", value:fmtFull(dstDebtTotal) },
                          { label: debtOk ? "Debt Surplus" : "Debt Shortfall", value:fmtFull(Math.abs(dstDebtTotal - debtRetired)), warn: !debtOk && debtRetired > 0 },
                        ].map(({ label, value, warn }) => (
                          <div key={label}>
                            <div style={{ fontSize:10, color: warn ? C.warning : T.muted, fontFamily:FONT, marginBottom:2 }}>{label}</div>
                            <div style={{ fontSize:15, fontWeight:700, color: warn ? A.red : G.forest, fontFamily:FONT }}>{value}</div>
                          </div>
                        ))}
                      </div>
                      {!debtOk && debtShortfall > 0 && (
                        <div style={{ marginTop:10, fontSize:12, color:C.warning, fontFamily:FONT, lineHeight:1.7 }}>
                          Your DST debt share of {fmtFull(dstDebtTotal)} is {fmtFull(debtShortfall)} less than your retired mortgage. This shortfall may be treated as taxable mortgage boot. Consult your tax advisor.
                        </div>
                      )}
                      {debtRetired === 0 && (
                        <div style={{ marginTop:10, fontSize:12, color:T.muted, fontFamily:FONT, lineHeight:1.7 }}>
                          You had no mortgage on the sold property, so there is no debt replacement requirement for your exchange.
                        </div>
                      )}
                    </div>
                  </div>
                  <CheckBox checked={acct.debtReplacementAck} onChange={v => updAcct("debtReplacementAck", v)}
                    label="I understand the equity and debt replacement requirements for my 1031 exchange"
                    description="Any unallocated equity or debt shortfall may be treated as taxable boot. I have reviewed this analysis with my tax advisor."/>
                </div>
              </div>
            );
          })()}

          {/* ── 1031 Benefit Analysis ── */}
          {is1031 && (() => {
            const oldNOI         = (acct.rp_annualIncome || 0) - (acct.rp_annualExpenses || 0);
            const dstAnnualCF    = cartItems.reduce((s, item) => s + (cart[item.id] || 0) * (item.distributionRate / 100), 0);
            const dstTotalValue  = cartItems.reduce((s, item) => {
              const eq = cart[item.id] || 0;
              const prop = item.offeringEquity > 0 ? eq / item.offeringEquity : 0;
              return s + eq + prop * item.loanAmount;
            }, 0);
            // Estimate DST depreciation: conservative 70% improvement / 39-yr schedule
            const estDstAnnualDep  = dstTotalValue * 0.70 / 39;
            const investorDstDep   = cartItems.reduce((s, item) => {
              const eq = cart[item.id] || 0;
              const prop = item.offeringEquity > 0 ? eq / item.offeringEquity : 0;
              const tv = eq + prop * item.loanAmount;
              return s + tv * 0.70 / 39;
            }, 0);
            // Old property annual depreciation (if we have the data)
            const residentialTypes = ["sfr","mfr","apartment"];
            const isRes = residentialTypes.includes(acct.rp_propertyType);
            const oldAnnualDep = acct.rp_originalPurchasePrice > 0
              ? acct.rp_originalPurchasePrice * 0.70 / (isRes ? 27.5 : 39)
              : 0;
            // Tax-sheltered income (cash flow minus depreciation)
            const dstTaxableIncome = Math.max(0, dstAnnualCF - investorDstDep);
            // Tax deferral from exchange
            const taxDeferred = fsCalcs.totalDeferredTax;
            const hasIncomeData  = acct.rp_annualIncome > 0;
            const hasSaleData    = acct.rp_salePrice > 0;
            if (!hasSaleData && !hasIncomeData && dstAnnualCF === 0) return null;
            const cashFlowDelta = dstAnnualCF - oldNOI;
            return (
              <div style={{ background: N.card, borderRadius: 14, border: `1px solid ${N.border}`, overflow:"hidden", marginBottom:16 }}>
                <div style={{ background:`linear-gradient(135deg, ${G.darkest} 0%, ${G.deep} 100%)`, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ color:"rgba(255,255,255,0.7)", display:"flex", alignItems:"center" }}>{React.cloneElement(IC.trendingUp, { width:16, height:16, strokeWidth:2 })}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:T.white, fontFamily:FONT }}>1031 Exchange Benefit Analysis</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontFamily:FONT, marginTop:1 }}>
                      Income, depreciation, and tax deferral comparison — before vs. after your exchange
                    </div>
                  </div>
                </div>
                <div style={{ padding:"20px 24px" }}>

                  {/* ── Row 1: Cash Flow + Depreciation ── */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>

                    {/* Cash Flow Comparison */}
                    <div style={{ padding:"16px 18px", background: N.section, borderRadius:10, border:`1px solid ${N.border}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>Annual Cash Flow Comparison</div>
                      {hasIncomeData ? (
                        <>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                            <div>
                              <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginBottom:2 }}>Relinquished Property NOI</div>
                              <div style={{ fontSize:18, fontWeight:600, color: oldNOI >= 0 ? T.primary : A.red, fontFamily:FONT }}>{fmtFull(oldNOI)}</div>
                              <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:1 }}>{fmtFull(acct.rp_annualIncome)} income · {fmtFull(acct.rp_annualExpenses)} expenses</div>
                            </div>
                            <div>
                              <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginBottom:2 }}>DST Portfolio Cash Flow</div>
                              <div style={{ fontSize:18, fontWeight:600, color:G.forest, fontFamily:FONT }}>{fmtFull(dstAnnualCF)}</div>
                              <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:1 }}>distributions from {cartItems.length} DST{cartItems.length !== 1 ? "s" : ""}</div>
                            </div>
                          </div>
                          <div style={{ padding:"10px 12px", background: cashFlowDelta >= 0 ? `${G.forest}08` : C.errorBg, borderRadius:8, border:`1px solid ${cashFlowDelta >= 0 ? G.forest+"25" : C.errorBorder}` }}>
                            <div style={{ fontSize:10, color: cashFlowDelta >= 0 ? G.forest : A.red, fontFamily:FONT, marginBottom:2 }}>{cashFlowDelta >= 0 ? "Annual Cash Flow Increase" : "Annual Cash Flow Decrease"}</div>
                            <div style={{ fontSize:16, fontWeight:600, color: cashFlowDelta >= 0 ? G.forest : A.red, fontFamily:FONT }}>
                              {cashFlowDelta >= 0 ? "+" : ""}{fmtFull(cashFlowDelta)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginBottom:2 }}>DST Portfolio Annual Cash Flow</div>
                            <div style={{ fontSize:22, fontWeight:600, color:G.forest, fontFamily:FONT }}>{fmtFull(dstAnnualCF)}</div>
                            <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, marginTop:2 }}>{fmtFull(dstAnnualCF / 12)} / month estimated</div>
                          </div>
                          <div style={{ fontSize:11, color:T.light, fontFamily:FONT }}>
                            Add Annual Gross Income and Expenses in Sale Property Details for a full comparison.
                          </div>
                        </>
                      )}
                    </div>

                    {/* Depreciation Shelter */}
                    <div style={{ padding:"16px 18px", background: N.section, borderRadius:10, border:`1px solid ${N.border}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>Depreciation Shelter</div>
                      <div style={{ display:"grid", gridTemplateColumns: oldAnnualDep > 0 ? "1fr 1fr" : "1fr", gap:12, marginBottom:12 }}>
                        {oldAnnualDep > 0 && (
                          <div>
                            <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginBottom:2 }}>Old Property (est.)</div>
                            <div style={{ fontSize:18, fontWeight:600, color:T.primary, fontFamily:FONT }}>{fmtFull(Math.round(oldAnnualDep))}</div>
                            <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:1 }}>annual straight-line dep.</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginBottom:2 }}>DST Portfolio (est.)</div>
                          <div style={{ fontSize:18, fontWeight:600, color:G.forest, fontFamily:FONT }}>{fmtFull(Math.round(investorDstDep))}</div>
                          <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:1 }}>your pro-rata dep. share</div>
                        </div>
                      </div>
                      <div style={{ padding:"10px 12px", background:`${G.forest}08`, borderRadius:8, border:`1px solid ${G.forest}25` }}>
                        <div style={{ fontSize:10, color:G.forest, fontFamily:FONT, marginBottom:2 }}>Est. Tax-Sheltered Cash Flow</div>
                        <div style={{ fontSize:16, fontWeight:600, color:G.forest, fontFamily:FONT }}>{fmtFull(Math.max(0, dstAnnualCF - dstTaxableIncome))}</div>
                        <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:1 }}>of {fmtFull(dstAnnualCF)} annual distributions may be tax-deferred</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Row 2: Tax Deferral + Net Cash Flow ── */}
                  <div style={{ display:"grid", gridTemplateColumns: taxDeferred > 0 ? "1fr 1fr" : "1fr", gap:12 }}>

                    {/* Tax Deferral */}
                    {taxDeferred > 0 && (
                      <div style={{ padding:"16px 18px", background:`${G.forest}06`, borderRadius:10, border:`1px solid ${G.forest}25` }}>
                        <div style={{ fontSize:11, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>Tax Deferral Benefit</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                          {[
                            { label:"Capital Gains Tax", value: fmtFull(fsCalcs.federalTax + fsCalcs.stateTax) },
                            { label:"Depreciation Recapture", value: fmtFull(fsCalcs.depRecapture) },
                            { label:"Total Tax Deferred", value: fmtFull(taxDeferred), highlight: true },
                          ].map(({ label, value, highlight }) => (
                            <div key={label} style={{ padding:"10px 12px", background: highlight ? `${G.forest}10` : "white", borderRadius:8, border:`1px solid ${G.forest}${highlight ? "30" : "15"}` }}>
                              <div style={{ fontSize:9, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:3 }}>{label}</div>
                              <div style={{ fontSize:14, fontWeight:600, color: highlight ? G.forest : T.primary, fontFamily:FONT }}>{value}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.7 }}>
                          Deferred today — not eliminated. Tax becomes due when your DSTs are sold unless you do another 1031 or step-up at death.
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            );
          })()}


        </>
      )}
      </div>{/* end single-column content */}
    </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     STEP 3 — FINANCIAL STATEMENT
     ══════════════════════════════════════════════════════ */
  const FinancialStep = () => {
    const toggle = id => {
      const isOpening = openSection !== id;
      if (isOpening) setSectionSnapshot({...fs});
      setOpenSection(p => p === id ? null : id);
    };
    const SECTION_ORDER = ["liquid", "retire", "realty", "alts", "income", "liabs"];
    const handleSectionSave = () => {
      if (openSection) {
        setSavedSections(p => ({...p, [openSection]: true}));
        const currentIdx = SECTION_ORDER.indexOf(openSection);
        const nextId = currentIdx >= 0 && currentIdx < SECTION_ORDER.length - 1 ? SECTION_ORDER[currentIdx + 1] : null;
        setSectionSnapshot(null);
        setOpenSection(nextId);
        if (nextId) {
          setTimeout(() => {
            const el = document.getElementById(`fs-section-${nextId}`);
            if (el) {
              const top = el.getBoundingClientRect().top + window.pageYOffset - 90;
              window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
            }
          }, 80);
        }
      }
    };
    const handleSectionCancel = () => {
      if (sectionSnapshot) setFs(sectionSnapshot);
      setSectionSnapshot(null);
      setOpenSection(null);
    };
    const isDirty = sectionSnapshot !== null && JSON.stringify(fs) !== JSON.stringify(sectionSnapshot);
    // Save is enabled if user changed something (isDirty), OR if section has valid data but was never explicitly saved
    const isSaveable = (id, hasData) => openSection === id && (isDirty || (!savedSections[id] && hasData));
    const SC = { liquid:"#0d9488", retire:"#7c3aed", realty:"#c9a94e", alts:"#ef6b51", income:"#2563eb", liabs:"#6b7280" };
    const done = {
      liquid: savedSections.liquid && (fsCalcs.cashEquiv > 0 || fsCalcs.mktSec > 0),
      retire: savedSections.retire && fsCalcs.retAccounts > 0,
      realty: savedSections.realty && (fs.primary > 0 || fs.investRE > 0),
      alts: savedSections.alts && (fs.reSec > 0 || fs.nonReAlts > 0 || fs.intervalFunds > 0 || fs.business > 0 || fs.notes > 0),
      income: savedSections.income && fsCalcs.grossInc > 0,
      liabs: savedSections.liabs && (fs.curLiab > 0 || fs.notesPayable > 0),
    };
    const incTotal = fsCalcs.grossInc || 1;
    const fmtShort = v => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${Math.round(v).toLocaleString()}`;
    const donutSlices = [
      { label:"Cash & 1031", val:fsCalcs.cashEquiv, color:SC.liquid },
      { label:"Marketable Sec.", val:fsCalcs.mktSec, color:"#2563EB" },
      { label:"Retirement", val:fsCalcs.retAccounts, color:SC.retire },
      { label:"Primary Res.", val:fs.primary, color:SC.realty },
      { label:"Investment RE", val:fs.investRE, color:"#A16207" },
      { label:"Alts & Illiquid", val:fsCalcs.illiquid - fs.primary - fs.investRE, color:SC.alts },
    ];
    const completedCount = Object.values(done).filter(Boolean).length;
    const totalSections = Object.keys(done).length;

    return (
      <div style={{ maxWidth:1320, margin:"0 auto" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:24, fontWeight:600, color:T.primary, fontFamily:FONT, margin:"0 0 6px" }}>Your Financial Picture</h1>
          <p style={{ fontSize:14, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6 }}>
            To recommend investments that are right for you, federal law requires us to understand your overall financial situation. Rough estimates are fine — this isn't a tax return. Everything you share is strictly confidential and used only to confirm this investment is appropriate for you.
          </p>
        </div>

        {/* ── Two-column: sections + sticky sidebar ── */}
        <div style={{ display:"flex", gap:28, alignItems:"flex-start" }}>

          {/* Left: purchaser names + accordion sections */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>

            {/* ── Purchaser names ── */}
            <div style={{ background:N.card, borderRadius:12, border:`1px solid ${N.border}`, padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16, fontFamily:FONT }}>Purchaser(s)</div>
              <Row2>
                <TInput label="Primary Purchaser — Full Legal Name" required value={fs.name} onChange={v => setFsField("name", v)} placeholder="Full legal name"/>
                <TInput label="Co-Purchaser Name (if applicable)" value={fs.coName} onChange={v => setFsField("coName", v)} placeholder="Full legal name"/>
              </Row2>
            </div>

            {/* ─── 1. LIQUID ASSETS ─── */}
            <FsSection id="liquid" icon={IC.dollarSign} title="Cash & Liquid Assets" color={SC.liquid}
              subtotal={fsCalcs.cashEquiv + fsCalcs.mktSec} open={openSection === "liquid"} onToggle={() => toggle("liquid")} complete={done.liquid}
              onSave={handleSectionSave} onCancel={handleSectionCancel} dirty={isSaveable("liquid", fsCalcs.cashEquiv + fsCalcs.mktSec > 0)}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MoneyField label="Cash & Checking Accounts" hint="All bank checking accounts combined" value={fs.cash} onChange={v => setFsField("cash", v)}/>
                <MoneyField label="Savings / Money Market / CDs" hint="High-yield savings, money market, certificates of deposit" value={fs.savings} onChange={v => setFsField("savings", v)}/>
                <MoneyField label="Stocks, Bonds & ETFs" sublabel="Publicly traded, marketable securities" hint="Brokerage accounts — current market value" value={fs.stocks} onChange={v => setFsField("stocks", v)}/>
                <MoneyField label="Annuities" hint="Surrender value or accumulated value of annuity contracts" value={fs.annuities} onChange={v => setFsField("annuities", v)}/>
                <MoneyField label="Life Insurance Cash Value" sublabel="Surrender value only — not death benefit" value={fs.lifeIns} onChange={v => setFsField("lifeIns", v)}/>
                <MoneyField label="Available 1031 Exchange Proceeds" sublabel="Proceeds held with Qualified Intermediary" hint={acct.exchangeBusiness && fs.exchange1031 > 0 ? `✓ Pre-filled from your 1031 Setup — ${fmtFull(fs.exchange1031)} on deposit with QI` : "Funds already placed with your QI for reinvestment"} value={fs.exchange1031} onChange={v => setFsField("exchange1031", v)}/>
              </div>
              <FsSubtotal label="Total Liquid Assets" value={fsCalcs.cashEquiv + fsCalcs.mktSec} accent color={SC.liquid}/>
            </FsSection>

            {/* ─── 2. RETIREMENT ─── */}
            <FsSection id="retire" icon={IC.landmark} title="Retirement Accounts" color={SC.retire}
              subtotal={fsCalcs.retAccounts} open={openSection === "retire"} onToggle={() => toggle("retire")} complete={done.retire}
              onSave={handleSectionSave} onCancel={handleSectionCancel} dirty={isSaveable("retire", fsCalcs.retAccounts > 0)}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MoneyField label="401(k) / 403(b) / IRA / Roth IRA" sublabel="Tax-advantaged retirement investment accounts" hint="Combined current market value across all accounts" value={fs.retStocks} onChange={v => setFsField("retStocks", v)}/>
                <MoneyField label="Pension — Lump Sum Value" sublabel="Estimated present value of defined benefit pensions" hint="If you receive monthly pension, multiply by 200–250× for rough lump-sum equivalent" value={fs.retPension} onChange={v => setFsField("retPension", v)}/>
              </div>
              <FsSubtotal label="Retirement Accounts Total" value={fsCalcs.retAccounts} color={SC.retire}/>
            </FsSection>

            {/* ─── 3. REAL ESTATE ─── */}
            <FsSection id="realty" icon={IC.home} title="Real Estate" color={SC.realty}
              subtotal={fs.primary + fs.investRE} open={openSection === "realty"} onToggle={() => toggle("realty")} complete={done.realty}
              onSave={handleSectionSave} onCancel={handleSectionCancel} dirty={isSaveable("realty", fs.primary > 0 || fs.investRE > 0)}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MoneyField label="Primary Residence" sublabel="Current market value" hint="Excluded from NW for FINRA suitability — enter your best estimate" value={fs.primary} onChange={v => setFsField("primary", v)}/>
                <MoneyField label="Investment Real Estate" sublabel="Rental properties, vacant land, commercial real estate" hint="Current fair market value — not original purchase price" value={fs.investRE} onChange={v => setFsField("investRE", v)}/>
              </div>
              {(fs.primary > 0 || fs.investRE > 0) && (
                <div style={{ marginTop:14, padding:"10px 14px", borderRadius:8, background:`${SC.realty}0D`, border:`1px solid ${SC.realty}25` }}>
                  <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginBottom:6 }}>Note: Primary residence equity is excluded from Net Worth for FINRA suitability calculations</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[["Total Real Estate", fs.primary + fs.investRE],["Ex-Primary Residence", fs.investRE]].map(([l,v]) => (
                      <div key={l}>
                        <div style={{ fontSize:9, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</div>
                        <div style={{ fontSize:15, fontWeight:700, color:SC.realty, fontFamily:FONT }}>{fmtFull(v)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FsSection>

            {/* ─── 4. ALTERNATIVE INVESTMENTS ─── */}
            <FsSection id="alts" icon={IC.barChart} title="Alternative & Illiquid Investments" color={SC.alts}
              subtotal={fs.reSec + fs.nonReAlts + fs.intervalFunds + fs.business + fs.notes} open={openSection === "alts"} onToggle={() => toggle("alts")} complete={done.alts}
              onSave={handleSectionSave} onCancel={handleSectionCancel} dirty={isSaveable("alts", fs.reSec > 0 || fs.nonReAlts > 0 || fs.intervalFunds > 0 || fs.business > 0 || fs.notes > 0)}>
              <InfoCallout type="warning" title="Concentration sensitivity">
                These holdings are used to calculate your illiquid asset concentration. DSTs will add to this total.
              </InfoCallout>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MoneyField label="Real Estate Securities" sublabel="DSTs, non-traded REITs, LPs, LLCs" hint="Current estimated value of all existing illiquid RE holdings" value={fs.reSec} onChange={v => setFsField("reSec", v)}/>
                <MoneyField label="Non-Real Estate Alternatives" sublabel="Private equity, hedge funds, BDCs, venture capital" value={fs.nonReAlts} onChange={v => setFsField("nonReAlts", v)}/>
                <MoneyField label="Interval Funds" sublabel="Semi-liquid, limited quarterly redemption funds" value={fs.intervalFunds} onChange={v => setFsField("intervalFunds", v)}/>
                <MoneyField label="Business Interests" sublabel="Ownership in private businesses or partnerships" value={fs.business} onChange={v => setFsField("business", v)}/>
                <MoneyField label="Notes Receivable" sublabel="Loans you have made to others" value={fs.notes} onChange={v => setFsField("notes", v)}/>
              </div>
              <FsSubtotal label="Alternative Investments Total" value={fs.reSec + fs.nonReAlts + fs.intervalFunds + fs.business + fs.notes} color={SC.alts}/>
              {fsCalcs.netWorthExRes > 0 && (
                <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { label:"RE Securities — Pre", val:fsCalcs.preConReSec || fsCalcs.preReSecPct, limit:50 },
                    { label:"RE Securities — Post", val:fsCalcs.postConReSec || fsCalcs.postReSecPct, limit:50 },
                  ].map(({ label, val, limit }) => (
                    <div key={label} style={{ padding:"8px 12px", borderRadius:8,
                        background: val > limit ? C.errorBg : val > 35 ? C.warningBg : G.mint,
                        border:`1px solid ${val > limit ? C.errorBorder : val > 35 ? C.warningBorder : G.forest+"20"}` }}>
                      <div style={{ fontSize:9, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.4px" }}>{label}</div>
                      <div style={{ fontSize:18, fontWeight:700, fontFamily:FONT, color: val > limit ? A.red : val > 35 ? C.warning : G.forest }}>
                        {val.toFixed(1)}%
                      </div>
                      <div style={{ fontSize:9, color:T.muted, fontFamily:FONT }}>Limit: {limit}% of NW ex-res</div>
                    </div>
                  ))}
                </div>
              )}
            </FsSection>

            {/* ─── 5. INCOME ─── */}
            <FsSection id="income" icon={IC.briefcase} title="Annual Income" color={SC.income}
              subtotal={fsCalcs.grossInc} open={openSection === "income"} onToggle={() => toggle("income")} complete={done.income}
              onSave={handleSectionSave} onCancel={handleSectionCancel} dirty={isSaveable("income", fsCalcs.grossInc > 0)}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                <MoneyField label="Employment / Business Income" sublabel="Salary, wages, self-employment net income" hint="Annual gross — before taxes" value={fs.empInc} onChange={v => setFsField("empInc", v)}/>
                <MoneyField label="Investment & Dividend Income" sublabel="Dividends, interest, rental income received" value={fs.invInc} onChange={v => setFsField("invInc", v)}/>
                <MoneyField label="Retirement / Pension Income" sublabel="Social Security, pension distributions, annuity payments" value={fs.retInc} onChange={v => setFsField("retInc", v)}/>
                <TaxRateField value={fs.taxRate} onChange={v => setFsField("taxRate", v)}/>
              </div>

              {/* Income bar visualization */}
              {fsCalcs.grossInc > 0 && (
                <div style={{ padding:"14px 16px", borderRadius:10, background:N.section, border:`1px solid ${N.border}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.body, fontFamily:FONT, marginBottom:8 }}>Income Breakdown</div>
                  <div style={{ display:"flex", height:10, borderRadius:5, overflow:"hidden", marginBottom:10, gap:1 }}>
                    {[{ val:fs.empInc, color:SC.income },{ val:fs.invInc, color:SC.liquid },{ val:fs.retInc, color:SC.retire }].filter(s => s.val > 0).map((s, i) => (
                      <div key={i} style={{ height:"100%", borderRadius:2, width:`${s.val / incTotal * 100}%`, background:s.color, transition:"width 0.4s" }}/>
                    ))}
                  </div>
                  <FsSubtotal label="Gross Annual Income" value={fsCalcs.grossInc} accent color={SC.income}/>
                </div>
              )}

              <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <MoneyField label="Annual Living Expenses" sublabel="Mortgage / rent, food, transport, healthcare, insurance" value={fs.expenses} onChange={v => setFsField("expenses", v)}/>
                {fsCalcs.grossInc > 0 && fs.expenses > 0 && (
                  <div style={{ padding:"12px 14px", borderRadius:10,
                      background: fsCalcs.incomeCoverage >= 1.25 ? G.mint : fsCalcs.incomeCoverage >= 1.0 ? C.warningBg : C.errorBg,
                      border:`1px solid ${fsCalcs.incomeCoverage >= 1.25 ? G.forest+"30" : fsCalcs.incomeCoverage >= 1.0 ? C.warningBorder : C.errorBorder}` }}>
                    <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginBottom:4 }}>Income Coverage Ratio</div>
                    <div style={{ fontSize:28, fontWeight:700, fontFamily:FONT,
                        color: fsCalcs.incomeCoverage >= 1.25 ? G.forest : fsCalcs.incomeCoverage >= 1.0 ? C.warning : A.red }}>
                      {fsCalcs.incomeCoverage.toFixed(2)}×
                    </div>
                    <div style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>
                      {fsCalcs.incomeCoverage >= 1.25 ? "✓ Guideline ≥ 1.25×" : "⚠ Below 1.25× guideline"}
                    </div>
                    <div style={{ marginTop:6, fontSize:11, fontWeight:600, fontFamily:FONT, color: fsCalcs.netInc >= 0 ? G.forest : A.red }}>
                      Net: {fmtFull(fsCalcs.netInc)} / yr
                    </div>
                  </div>
                )}
              </div>
            </FsSection>

            {/* ─── 6. LIABILITIES ─── */}
            <FsSection id="liabs" icon={IC.fileText} title="Liabilities & Obligations" color={SC.liabs}
              subtotal={fsCalcs.totalLiab} open={openSection === "liabs"} onToggle={() => toggle("liabs")} complete={done.liabs}
              onSave={handleSectionSave} onCancel={handleSectionCancel} dirty={isSaveable("liabs", fs.curLiab > 0 || fs.notesPayable > 0)}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <MoneyField label="Current Liabilities" sublabel="Due within 12 months" hint="Credit card balances, short-term loans, outstanding bills" value={fs.curLiab} onChange={v => setFsField("curLiab", v)}/>
                <MoneyField label="Notes Payable / Long-Term Debt" sublabel="Mortgage balances, business loans, student loans" hint="Remaining balance — not monthly payment" value={fs.notesPayable} onChange={v => setFsField("notesPayable", v)}/>
              </div>
              <FsSubtotal label="Total Liabilities" value={fsCalcs.totalLiab} color={SC.liabs}/>

              {/* Balance sheet snapshot */}
              {fsCalcs.totalAssets > 0 && (
                <div style={{ marginTop:12, padding:"14px 16px", borderRadius:10, background:N.section, border:`1px solid ${N.border}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.body, fontFamily:FONT, marginBottom:10 }}>Balance Sheet Snapshot</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
                    {[
                      { l:"Total Assets", v:fsCalcs.totalAssets, c:T.primary },
                      { l:"Total Liabilities", v:fsCalcs.totalLiab, c: fsCalcs.totalLiab > 0 ? A.coral : T.muted },
                      { l:"Net Worth", v:fsCalcs.netWorth, c: fsCalcs.netWorth >= 0 ? G.forest : A.red },
                    ].map(({ l, v, c }) => (
                      <div key={l} style={{ textAlign:"center", padding:"10px 6px", background:N.card, borderRadius:8, border:`1px solid ${N.divider}` }}>
                        <div style={{ fontSize:9, color:T.light, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{l}</div>
                        <div style={{ fontSize:14, fontWeight:700, color:c, fontFamily:FONT }}>{fmtShort(v)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:T.body, fontFamily:FONT }}>Debt-to-Asset Ratio</span>
                    <span style={{ fontSize:12, fontWeight:700, fontFamily:FONT, color: fsCalcs.debtToAsset <= 25 ? G.forest : fsCalcs.debtToAsset <= 35 ? C.warning : A.red }}>
                      {fsCalcs.debtToAsset.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height:8, background:N.divider, borderRadius:4, overflow:"hidden", marginBottom:5 }}>
                    <div style={{ height:"100%", borderRadius:4, transition:"width 0.4s",
                        width:`${Math.min(fsCalcs.debtToAsset / 50 * 100, 100)}%`,
                        background: fsCalcs.debtToAsset <= 25 ? G.forest : fsCalcs.debtToAsset <= 35 ? A.amber : A.red }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:9, color:G.forest, fontFamily:FONT }}>Optimal: ≤ 25%</span>
                    <span style={{ fontSize:9, color:A.amber, fontFamily:FONT }}>Guideline: ≤ 35%</span>
                    <span style={{ fontSize:9, color:A.red, fontFamily:FONT }}>Elevated: &gt; 50%</span>
                  </div>
                </div>
              )}
            </FsSection>

            {/* ── Attestation ── */}
            <div style={{ padding:"16px 20px", background:N.card, borderRadius:12, border:`1px solid ${N.border}` }}>
              <CheckBox
                checked={fs.agreed}
                onChange={v => setFsField("agreed", v)}
                label="I verify this Financial Statement is true and correct to the best of my knowledge"
                description="This information may be relied upon by Stax Capital for suitability review as required by FINRA Regulation Best Interest. All data is strictly confidential."
              />
            </div>

          </div>{/* end left column */}

          {/* ── Right: Sticky summary panel ── */}
          <div style={{ width:308, flexShrink:0, position:"sticky", top:90, alignSelf:"flex-start" }}>
            <div style={{ background:N.card, borderRadius:14, border:`1px solid ${N.border}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
              <div style={{ background: WIDGET_HDR, padding:"16px 18px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.white, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:FONT }}>Live Summary</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontFamily:FONT, marginTop:2 }}>Updates as you type</div>
              </div>

              <div style={{ padding:"20px 18px 12px" }}>
                <FsDonutChart slices={donutSlices} nw={fsCalcs.netWorth} nwEx={fsCalcs.netWorthExRes}/>
              </div>

              {/* ── Metrics table ── */}
              <div style={{ padding:"8px 18px 4px" }}>
                {[
                  { label:"Total Assets",      val:fsCalcs.totalAssets,    color:T.primary },
                  { label:"Total Liabilities", val:fsCalcs.totalLiab,      color: fsCalcs.totalLiab > 0 ? A.coral : T.muted },
                  { label:"Net Worth",         val:fsCalcs.netWorth,       color: fsCalcs.netWorth >= 0 ? G.forest : A.red, bold:true },
                  { label:"NW ex-Primary",     val:fsCalcs.netWorthExRes,  color: fsCalcs.netWorthExRes >= 0 ? G.forest : A.red },
                  { label:"Total Liquid",      val:fsCalcs.totalLiquid,    color:SC.liquid },
                  { label:"Gross Income",      val:fsCalcs.grossInc,       color:SC.income },
                ].map(({ label, val, color, bold }, i, arr) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"9px 0",
                      borderBottom: i < arr.length - 1 ? `1px solid ${N.divider}` : "none" }}>
                    <span style={{ fontSize:12, color:T.muted, fontFamily:FONT }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight: bold ? 700 : 500, color, fontFamily:FONT }}>
                      {val > 0 || (label.includes("Worth") && val !== 0)
                        ? (Math.abs(val) >= 1e6 ? `${val < 0 ? "-" : ""}$${(Math.abs(val)/1e6).toFixed(2)}M`
                           : Math.abs(val) >= 1e3 ? `${val < 0 ? "-" : ""}$${(Math.abs(val)/1e3).toFixed(0)}K`
                           : `$${Math.round(val).toLocaleString()}`)
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── Liquidity badge ── */}
              <div style={{ margin:"12px 18px 0", padding:"12px 14px", borderRadius:10,
                  background: fsCalcs.totalAssets === 0 ? N.section : fsCalcs.liquidityPct >= 15 ? G.mint : fsCalcs.liquidityPct >= 10 ? C.warningBg : C.errorBg,
                  border:`1px solid ${fsCalcs.totalAssets === 0 ? N.border : fsCalcs.liquidityPct >= 15 ? G.forest+"30" : fsCalcs.liquidityPct >= 10 ? C.warningBorder : C.errorBorder}` }}>
                <div style={{ fontSize:12, fontWeight:600, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>Liquidity vs NW ex-Res.</div>
                <div style={{ fontSize:24, fontWeight:700, fontFamily:FONT, lineHeight:1,
                    color: fsCalcs.totalAssets === 0 ? T.muted : fsCalcs.liquidityPct >= 15 ? G.forest : fsCalcs.liquidityPct >= 10 ? C.warning : A.red }}>
                  {fsCalcs.totalAssets > 0 ? fsCalcs.liquidityPct.toFixed(1) + "%" : "—"}
                </div>
                <div style={{ fontSize:12, color:T.muted, fontFamily:FONT, marginTop:4 }}>
                  {fsCalcs.totalAssets === 0 ? "Enter values above" : fsCalcs.liquidityPct >= 15 ? "✓ Guideline met (≥ 15%)" : fsCalcs.liquidityPct >= 10 ? "⚡ Below 15% guideline" : "⚠ Below 10% — flag for review"}
                </div>
              </div>

              {/* ── Proposed Investment ── */}
              {cartTotal > 0 && (
                <div style={{ margin:"8px 18px 0", padding:"12px 14px", borderRadius:10, background:`${G.forest}08`, border:`1px solid ${G.forest}20` }}>
                  <div style={{ fontSize:12, fontWeight:600, color:G.forest, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>Proposed Investment</div>
                  <div style={{ fontSize:18, fontWeight:700, color:G.deep, fontFamily:FONT }}>{fmtFull(cartTotal)}</div>
                  {fsCalcs.netWorthExRes > 0 && (
                    <div style={{ fontSize:12, color:T.muted, fontFamily:FONT, marginTop:3 }}>= {(cartTotal / fsCalcs.netWorthExRes * 100).toFixed(1)}% of NW ex-res</div>
                  )}
                  {fsCalcs.totalLiquid > 0 && (
                    <div style={{ fontSize:12, color:T.muted, fontFamily:FONT }}>= {(cartTotal / fsCalcs.totalLiquid * 100).toFixed(1)}% of liquid assets</div>
                  )}
                </div>
              )}

              {/* ── Concentration Analysis ── */}
              {fsCalcs.totalAssets > 0 && fsCalcs.netWorthExRes > 0 && (
                <>
                  {/* Section divider */}
                  <div style={{ margin:"16px 18px 0", borderTop:`1px solid ${N.divider}`, paddingTop:14 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"1px", marginBottom:12 }}>Concentration Analysis</div>

                    {/* §04 Pre-Investment */}
                    <div style={{ fontSize:12, fontWeight:700, color:T.light, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>§04 Pre-Investment</div>
                    {[
                      { l:"RE Securities",  val:fs.reSec,         pct:fsCalcs.preReSecPct,     thresh:50 },
                      { l:"Non-RE Alts",    val:fs.nonReAlts,     pct:fsCalcs.preNonReAltsPct, thresh:null },
                      { l:"Interval Funds", val:fs.intervalFunds, pct:fsCalcs.preIntervalPct,  thresh:null },
                      { l:"All Illiquid",   val:fsCalcs.illiquid - fs.primary, pct:fsCalcs.preAllIlliqPct, thresh:60 },
                    ].map(({ l, val, pct: p, thresh }) => (
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${N.divider}` }}>
                        <span style={{ fontSize:12, color:T.body, fontFamily:FONT }}>{l}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:12, color:T.muted, fontFamily:FONT }}>{val > 0 ? (val >= 1e6 ? `$${(val/1e6).toFixed(1)}M` : val >= 1e3 ? `$${(val/1e3).toFixed(0)}K` : `$${Math.round(val).toLocaleString()}`) : "—"}</span>
                          <span style={{ fontSize:12, fontWeight:700, fontFamily:FONT, minWidth:36, textAlign:"right",
                              color: thresh && p > thresh ? A.red : p > 30 ? C.warning : T.body }}>
                            {p.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* §05 Post-Investment */}
                    <div style={{ fontSize:12, fontWeight:700, color:G.forest, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.6px", marginTop:12, marginBottom:6 }}>§05 Post-Investment</div>
                    {[
                      { l:"RE Securities",  pct:fsCalcs.postReSecPct,     thresh:50 },
                      { l:"Non-RE Alts",    pct:fsCalcs.postNonReAltsPct, thresh:null },
                      { l:"Interval Funds", pct:fsCalcs.postIntervalPct,  thresh:null },
                      { l:"All Illiquid",   pct:fsCalcs.postAllIlliqPct,  thresh:60 },
                    ].map(({ l, pct: p, thresh }) => (
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${N.divider}` }}>
                        <span style={{ fontSize:12, color:T.body, fontFamily:FONT }}>{l}</span>
                        <span style={{ fontSize:12, fontWeight:700, fontFamily:FONT,
                            color: thresh && p > thresh ? A.red : G.forest }}>
                          {p.toFixed(1)}%
                        </span>
                      </div>
                    ))}

                    {/* Accreditation status pills */}
                    <div style={{ marginTop:12, display:"flex", gap:8 }}>
                      <div style={{ flex:1, padding:"8px 10px", borderRadius:8, textAlign:"center",
                          background: fsCalcs.meetsIncomeTest ? G.mint : N.section,
                          border:`1px solid ${fsCalcs.meetsIncomeTest ? G.forest+"30" : N.border}` }}>
                        <div style={{ fontSize:12, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:2 }}>Income</div>
                        <div style={{ fontSize:12, fontWeight:700, fontFamily:FONT, color: fsCalcs.meetsIncomeTest ? G.forest : T.muted }}>
                          {fsCalcs.meetsIncomeTest ? "✓ $200K+" : "Below"}
                        </div>
                      </div>
                      <div style={{ flex:1, padding:"8px 10px", borderRadius:8, textAlign:"center",
                          background: fsCalcs.meetsNwTest ? G.mint : N.section,
                          border:`1px solid ${fsCalcs.meetsNwTest ? G.forest+"30" : N.border}` }}>
                        <div style={{ fontSize:12, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:2 }}>NW ex-Res</div>
                        <div style={{ fontSize:12, fontWeight:700, fontFamily:FONT, color: fsCalcs.meetsNwTest ? G.forest : T.muted }}>
                          {fsCalcs.meetsNwTest ? "✓ $1M+" : "Below"}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div style={{ height:16 }}/>
            </div>
          </div>

        </div>{/* end two-col */}

      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     STEP 3 — FULL ACCOUNT OPENING (NAF)
     12 scrolling SectionCards — compliance depth from v3
     ══════════════════════════════════════════════════════ */
  const AccountStep = () => {
    const isJoint = ["jtwros","tenants_common","tenants_entirety","community_property"].includes(acct.individualType);
    const isIRA = ["traditional_ira","roth_ira","sep_ira","simple_ira"].includes(acct.individualType);
    const isEntity = acct.registrationCategory === "entity";

    const getSubStepErrors = (ss) => {
      const errs = [];
      if (ss === 0) {
        if (!acct.accountStatus) errs.push("Account status selection is required");
        if (!acct.registrationCategory) errs.push("Registration category is required");
        if (acct.registrationCategory === "individual" && !acct.individualType) errs.push("Registration type is required");
        if (isIRA && !acct.iraOwner) errs.push("IRA beneficial account owner is required");
        if (isIRA && !acct.iraCustodian) errs.push("IRA custodian is required");
        if (isEntity && !acct.entityType) errs.push("Entity type is required");
        if (isEntity && acct.entityType && !acct.entityName) errs.push("Legal entity name is required");
        if (isEntity && acct.entityType && !entityInfo.stateOfFormation) errs.push("State of formation is required");
        if (isEntity && acct.entityType && !entityInfo.primaryAuthorized) errs.push("Primary authorized individual is required");
        if (isEntity && acct.entityType && !controlPerson.name) errs.push("Control person name is required");
        if (isEntity && acct.entityType && !controlPerson.title) errs.push("Control person title/role is required");
        if (!acct.accredited) errs.push("Accredited investor status is required");
      }
      if (ss === 1) {
        if (acct.accredited === "Yes") {
          if (!acct.accreditedBasis) errs.push("Qualification basis is required");
          if (!acct.accreditedVerifyMethod) errs.push("Verification method is required");
          if (acct.accreditedVerifyMethod === "third_party") {
            if (!acct.accreditedThirdPartyType) errs.push("Verifying professional type is required");
            if (!acct.accreditedThirdPartyName) errs.push("Verifier name is required");
            if (!acct.accreditedThirdPartyFirm) errs.push("Verifier firm is required");
            if (!acct.accreditedThirdPartyDate) errs.push("Verification letter date is required");
          }
        }
      }
      if (ss === 2) {
        if (!acct.firstName) errs.push("First name is required");
        if (!acct.lastName) errs.push("Last name is required");
        if (!acct.phone) errs.push("Phone number is required");
        if (!acct.email) errs.push("Email address is required");
        if (!acct.street) errs.push("Street address is required");
        if (!acct.city) errs.push("City is required");
        if (!acct.state) errs.push("State is required");
        if (!acct.zip) errs.push("ZIP code is required");
        if (!acct.employmentStatus) errs.push("Employment status is required");
      }
      if (ss === 3) {
        if (!acct.dob) errs.push("Date of birth is required");
        if (!acct.ssn) errs.push("Social Security Number is required");
        if (!acct.citizenship) errs.push("Country of citizenship is required");
        if (!acct.idType) errs.push("Form of identification is required");
        if (!acct.idNumber) errs.push("ID number is required");
        if (!acct.idExpiry) errs.push("ID expiration date is required");
        if ((docs.primaryId || []).length === 0) errs.push("Government-issued photo ID upload is required");
        if (!acct.householdStatus) errs.push("Household status is required");
      }
      if (ss === 4) {
        if (!acct.distributionMethod) errs.push("Distribution method is required");
        if ((acct.distributionMethod === "direct_deposit" || acct.distributionMethod === "check_institution") && !acct.bankName) errs.push("Bank name is required");
        if (acct.distributionMethod === "direct_deposit" && !acct.bankAccountType) errs.push("Bank account type is required");
        if (acct.distributionMethod === "direct_deposit" && !acct.routingNumber) errs.push("Routing number is required");
        if (acct.distributionMethod === "direct_deposit" && !acct.accountNumber) errs.push("Account number is required");
        if (!acct.hasTrustedContact) errs.push("Trusted contact preference is required");
        if (acct.hasTrustedContact === "yes" && !acct.tcFirstName) errs.push("Trusted contact first name is required");
        if (acct.hasTrustedContact === "yes" && !acct.tcLastName) errs.push("Trusted contact last name is required");
      }
      if (ss === 5) {
        if (!acct.liquidityNeeds) errs.push("Liquidity needs is required");
        if (!acct.timeHorizon) errs.push("Investment time horizon is required");
        if (!acct.riskTolerance) errs.push("Risk tolerance is required");
        if (!acct.emergencyFunds) errs.push("Emergency funds question is required");
        if (!acct.industryAffiliated) errs.push("Industry affiliation question is required");
        if (!acct.isPoliticalOfficial) errs.push("Political official question is required");
        if (!acct.taxStatus) errs.push("Tax status is required");
      }
      return errs;
    };

    const handleSubNext = () => {
      setSubStepValidation(true);
      setValidationOn(true);
      setTimeout(() => {
        const errs = getSubStepErrors(subStep);
        const domErr = document.querySelector(".stax-input.has-error, .stax-select.has-error, [data-field-error='true']");
        if (errs.length === 0 && !domErr) {
          setSubStepValidation(false);
          setValidationOn(false);
          const next = subStep === 0 && acct.accredited !== "Yes" ? 2 : subStep + 1;
          setSubStep(next);
          setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
        } else {
          scrollToFirstError();
        }
      }, 50);
    };

    const handleSubBack = () => {
      setSubStepValidation(false);
      setValidationOn(false);
      const prev = subStep === 2 && acct.accredited !== "Yes" ? 0 : subStep - 1;
      setSubStep(Math.max(0, prev));
      setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    };

    const SUBSTEP_LABELS = ["Account Type","Accreditation","Personal Info","Identity","Account Setup","Suitability"];
    const currentErrors = subStepValidation ? getSubStepErrors(subStep) : [];
    const isLastSubStep = subStep === 5;

    return (
      <div style={{ maxWidth:1320, margin:"0 auto" }}>

        {/* ── Secondary nav (Account Opening only) ── */}
        <div style={{ background:"var(--card-foreground)", borderRadius:12, padding:"20px", marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:600, color:T.white, fontFamily:FONT, marginBottom:16 }}>Account Opening</div>
          <div style={{ display:"flex", gap:8 }}>
            {SUBSTEP_LABELS.map((label, i) => {
              const isSkipped = i === 1 && acct.accredited !== "Yes" && subStep > 1;
              const isCurrent = i === subStep;
              const isDone = i < subStep && !isSkipped;
              return (
                <div key={i} style={{
                  flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                  padding:"12px 8px",
                  background: isCurrent ? "#ffffff" : "#151e2a",
                  borderRadius:8, cursor: isDone ? "pointer" : "default",
                  transition:"background 0.2s",
                }} onClick={() => { if (isDone) { setSubStepValidation(false); setSubStep(i); } }}>
                  <div style={{
                    width:32, height:32, borderRadius:8,
                    background: isCurrent ? "#eaeef7" : "#1d2837",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14, fontWeight:600, fontFamily:FONT,
                    color: isCurrent ? "#2b3749" : isDone ? "#a3a3a3" : "#a3a3a3",
                    flexShrink:0,
                  }}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span style={{
                    fontSize:12, fontWeight: isCurrent ? 600 : 400, fontFamily:FONT,
                    color: isCurrent ? T.primary : isSkipped ? "#555" : "#d4d4d4",
                    textAlign:"center", lineHeight:1,
                  }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Two-column: form + sidebar ── */}
        <div style={{ display:"flex", gap:28, alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0 }}>


        {/* ══ SUB-STEP 0: Account Type ══ */}
        {subStep === 0 && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.02em" }}>Who is opening this account?</h1>
              <p style={{ fontSize:15, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6 }}>Select your account type and tell us a little about how you'll be investing.</p>
            </div>

        {/* ── SECTION 1: Account Status ── */}
        <SectionCard title="Account Status" icon={IC.fileText}>
          <RadioGroup label="What would you like to do?" name="accountStatus" required
            value={acct.accountStatus} onChange={v => updAcct("accountStatus", v)}
            options={[{ value:"open", label:"Open New Account" }, { value:"update", label:"Update Existing Account" }]}/>
        </SectionCard>

        {/* ── SECTION 2: Registration ── */}
        <SectionCard title="Account Registration" icon={IC.landmark}>
          <RadioGroup label="Registration Category" name="regCat" required
            value={acct.registrationCategory} onChange={v => updAcct("registrationCategory", v)}
            options={[
              { value:"individual", label:"Individual / Joint" },
              { value:"entity", label:"Entity (LLC, Trust, Corp, Partnership)" },
            ]}/>

          {acct.registrationCategory === "individual" && (
            <TSelect label="Individual Registration Type" required value={acct.individualType} onChange={v => updAcct("individualType", v)}
              options={[
                { value:"individual", label:"Individual" },
                { value:"jtwros", label:"Joint Tenants With Rights of Survivorship" },
                { value:"tenants_common", label:"Tenants in Common" },
                { value:"tenants_entirety", label:"Tenants by the Entirety" },
                { value:"community_property", label:"Community Property" },
                { value:"traditional_ira", label:"Traditional IRA" },
                { value:"roth_ira", label:"Roth IRA" },
                { value:"sep_ira", label:"SEP IRA" },
                { value:"simple_ira", label:"SIMPLE IRA" },
              ]}/>
          )}

          {isIRA && (
            <div style={{ padding:"12px", background:N.section, borderRadius:8, border:`1px solid ${N.border}`, display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT }}>Self-Directed IRA Details</div>
              <TInput label="Beneficial Account Owner" required value={acct.iraOwner} onChange={v => updAcct("iraOwner", v)}/>
              <TInput label="Self-Directed IRA Custodian" required value={acct.iraCustodian} onChange={v => updAcct("iraCustodian", v)}/>
              <EINInput label="Custodian EIN" value={acct.iraCustodianEIN} onChange={v => updAcct("iraCustodianEIN", v)}/>
            </div>
          )}

          {isEntity && (
            <>
              <RadioGroup label="Entity Account Type" name="entType"
                value={acct.entityType} onChange={v => updAcct("entityType", v)}
                options={[
                  { value:"revocable_trust", label:"Revocable Trust / Estate", description:"Provide Trust Documents" },
                  { value:"irrevocable_trust", label:"Irrevocable Trust / Estate", description:"Provide Trust Documents" },
                  { value:"other_trust", label:"Other Non-Grantor Trust", description:"Provide Trust Documents" },
                  { value:"llc", label:"Limited Liability Company (LLC)", description:"Provide Articles of Organization & Operating Agreement" },
                  { value:"corporation", label:"Corporation", description:"Provide Corporate Resolution & Articles of Incorporation" },
                  { value:"partnership", label:"Partnership", description:"Provide Partnership Agreement" },
                  { value:"retirement_plan", label:"Retirement Plan", description:"Provide Plan Documents" },
                  { value:"other_entity", label:"Other" },
                ]}
              />
              {acct.entityType && (
                <>
                  <TInput label="Legal Entity Name" required value={acct.entityName} onChange={v => updAcct("entityName", v)} placeholder="Exact legal entity name"/>
                  <Row2>
                    <EINInput label="EIN / Tax Identification Number" required value={entityInfo.ein} onChange={v => updEntity("ein", v)} sublabel="Federal Employer Identification Number"/>
                    <DateInput label="Date of Formation" value={entityInfo.dateOfFormation} onChange={v => updEntity("dateOfFormation", v)}/>
                  </Row2>
                  <Row2>
                    <TSelect label="State of Formation" required value={entityInfo.stateOfFormation} onChange={v => updEntity("stateOfFormation", v)} options={US_STATES}/>
                    <PhoneInput label="Entity Phone" value={entityInfo.primaryPhone} onChange={v => updEntity("primaryPhone", v)}/>
                  </Row2>
                  <EmailInput label="Entity Email" value={entityInfo.email} onChange={v => updEntity("email", v)}/>
                  <InfoCallout type="warning">You will need to upload supporting documents for this entity type before submission.</InfoCallout>

                  {/* Conditional Document Uploaders */}
                  {["revocable_trust","irrevocable_trust","other_trust"].includes(acct.entityType) && (
                    <DocumentUploader label="Upload Trust Documents"
                      sublabel="Include the complete trust agreement, certificate of trust, and all relevant amendments."
                      required={true} accept="application/pdf" maxFiles={5} maxSizeMB={10}
                      docType="entity-trust" files={docs.entityDocs} onFilesChange={f => setDocFiles("entityDocs", f)}/>
                  )}
                  {acct.entityType === "llc" && (
                    <DocumentUploader label="Upload Articles of Organization & Operating Agreement"
                      sublabel="Include state-filed Articles of Organization and the current Operating Agreement."
                      required={true} accept="application/pdf" maxFiles={5} maxSizeMB={10}
                      docType="entity-llc" files={docs.entityDocs} onFilesChange={f => setDocFiles("entityDocs", f)}/>
                  )}
                  {acct.entityType === "corporation" && (
                    <DocumentUploader label="Upload Corporate Resolution & Articles of Incorporation"
                      sublabel="Include board resolution authorizing the investment and state-filed Articles of Incorporation."
                      required={true} accept="application/pdf" maxFiles={5} maxSizeMB={10}
                      docType="entity-corp" files={docs.entityDocs} onFilesChange={f => setDocFiles("entityDocs", f)}/>
                  )}
                  {acct.entityType === "partnership" && (
                    <DocumentUploader label="Upload Partnership Agreement"
                      sublabel="Include the executed Partnership Agreement and any relevant amendments."
                      required={true} accept="application/pdf" maxFiles={5} maxSizeMB={10}
                      docType="entity-partnership" files={docs.entityDocs} onFilesChange={f => setDocFiles("entityDocs", f)}/>
                  )}
                  {acct.entityType === "retirement_plan" && (
                    <DocumentUploader label="Upload Plan Documents"
                      sublabel="Include the Plan Document, Summary Plan Description, and trustee designation."
                      required={true} accept="application/pdf" maxFiles={5} maxSizeMB={10}
                      docType="entity-plan" files={docs.entityDocs} onFilesChange={f => setDocFiles("entityDocs", f)}/>
                  )}

                  {/* ── Authorized Individuals (FINRA Rule 4512) ── */}
                  <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:14, marginTop:8 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:2 }}>Authorized Individuals</div>
                    <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.6, marginBottom:10 }}>
                      Per FINRA Rule 4512, identify all individuals authorized to transact business on behalf of this entity.
                    </div>
                    <Row2>
                      <TInput label="Primary Authorized Individual" required value={entityInfo.primaryAuthorized} onChange={v => updEntity("primaryAuthorized", v)} placeholder="Full name of primary authorized person"/>
                      <TInput label="Co-Authorized Individual" value={entityInfo.coAuthorized} onChange={v => updEntity("coAuthorized", v)} placeholder="Full name (if applicable)"/>
                    </Row2>
                    {accountSigners.map((s, i) => (
                      <div key={i} style={{ padding:12, background:N.bgAlt, borderRadius:8, border:`1px solid ${N.border}`, marginTop:8 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:G.forest, fontFamily:FONT }}>Additional Authorized Signer #{i+1}</div>
                          <button type="button" onClick={() => rmSigner(i)} style={{ background:"none", border:"none", cursor:"pointer", color:A.red, fontSize:11, fontWeight:600, fontFamily:FONT }}>✕ Remove</button>
                        </div>
                        <Row2>
                          <TInput label="Full Name" required value={s.name} onChange={v => updSigner(i,"name",v)} placeholder="Full legal name"/>
                          <TInput label="Title / Role" value={s.title} onChange={v => updSigner(i,"title",v)} placeholder="e.g., Member, Officer, Trustee"/>
                        </Row2>
                        <Row2>
                          <PhoneInput label="Phone" value={s.phone} onChange={v => updSigner(i,"phone",v)}/>
                          <EmailInput label="Email" value={s.email} onChange={v => updSigner(i,"email",v)}/>
                        </Row2>
                      </div>
                    ))}
                    {accountSigners.length < 4 && (
                      <button type="button" onClick={addSigner} style={{
                        display:"flex", alignItems:"center", gap:6, padding:"8px 14px", marginTop:8,
                        background:G.mint, border:`1px dashed ${G.forest}40`, borderRadius:8, cursor:"pointer",
                        fontSize:12, fontWeight:600, color:G.forest, fontFamily:FONT,
                      }}>
                        <span style={{ fontSize:16, lineHeight:1 }}>+</span> Add Additional Authorized Signer
                      </button>
                    )}
                  </div>

                  {/* ── Control Person (FinCEN CDD Rule — Control Prong) ── */}
                  <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:14, marginTop:8 }}>
                    <InfoCallout type="info" title="Control Person — FinCEN CDD Rule">
                      Identify one individual with significant responsibility to control, manage, or direct the entity (e.g., CEO, CFO, Managing Member, General Partner, Trustee). Required under 31 CFR §1010.230(d)(2).
                    </InfoCallout>
                    <Row2>
                      <TInput label="Control Person Name" required value={controlPerson.name} onChange={v => updCtrl("name", v)} placeholder="Full legal name"/>
                      <TInput label="Title / Role" required value={controlPerson.title} onChange={v => updCtrl("title", v)} placeholder="e.g., CEO, Managing Member, Trustee"/>
                    </Row2>
                    <Row2>
                      <DateInput label="Date of Birth" required value={controlPerson.dob} onChange={v => updCtrl("dob", v)}/>
                      <SSNInput label="SSN" required value={controlPerson.ssn} onChange={v => updCtrl("ssn", v)}/>
                    </Row2>
                    <TInput label="Residential Address" required value={controlPerson.street} onChange={v => updCtrl("street", v)} placeholder="Street address (cannot be PO Box)"/>
                    <Row2>
                      <TInput label="City" value={controlPerson.city} onChange={v => updCtrl("city", v)} placeholder="City"/>
                      <TSelect label="State" value={controlPerson.state} onChange={v => updCtrl("state", v)} options={US_STATES}/>
                    </Row2>
                    <Row2>
                      <ZipInput label="ZIP" value={controlPerson.zip} onChange={v => updCtrl("zip", v)}/>
                      <TSelect label="Country" value={controlPerson.country} onChange={v => updCtrl("country", v)} options={["United States","Canada","Other"]}/>
                    </Row2>
                  </div>

                  {/* ── Beneficial Owners (FinCEN CDD Rule — Ownership Prong) ── */}
                  {["llc","corporation","partnership","other_entity"].includes(acct.entityType) && (
                    <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:14, marginTop:8 }}>
                      <InfoCallout type="warning" title="Beneficial Owners — FinCEN CDD Rule">
                        List each individual who directly or indirectly owns 25% or more of the equity interests. Up to 4 beneficial owners may need to be identified per 31 CFR §1010.230(d)(1).
                      </InfoCallout>
                      {beneficialOwners.map((bo, i) => (
                        <div key={i} style={{ padding:"14px 16px", background:N.bgAlt, borderRadius:10, border:`1px solid ${N.border}`, marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:G.forest, fontFamily:FONT }}>Beneficial Owner #{i+1}</div>
                            <button type="button" onClick={() => rmBO(i)} style={{ background:"none", border:"none", cursor:"pointer", color:A.red, fontSize:11, fontWeight:600, fontFamily:FONT }}>✕ Remove</button>
                          </div>
                          <TInput label="Full Legal Name" required value={bo.name} onChange={v => updBO(i,"name",v)} placeholder="Full legal name"/>
                          <Row2>
                            <DateInput label="Date of Birth" required value={bo.dob} onChange={v => updBO(i,"dob",v)}/>
                            <SSNInput label="SSN" required value={bo.ssn} onChange={v => updBO(i,"ssn",v)}/>
                          </Row2>
                          <TInput label="Ownership Percentage" value={bo.ownershipPct} onChange={v => updBO(i,"ownershipPct",v.replace(/[^\d.]/g,"").slice(0,5))} placeholder="e.g., 25" sublabel="Percentage of equity interest (25% minimum to report)"/>
                          <TInput label="Residential Address" required value={bo.street} onChange={v => updBO(i,"street",v)} placeholder="Street address (cannot be PO Box)"/>
                          <Row2>
                            <TInput label="City" value={bo.city} onChange={v => updBO(i,"city",v)} placeholder="City"/>
                            <TSelect label="State" value={bo.state} onChange={v => updBO(i,"state",v)} options={US_STATES}/>
                          </Row2>
                          <Row2>
                            <ZipInput label="ZIP" value={bo.zip} onChange={v => updBO(i,"zip",v)}/>
                            <TSelect label="Country" value={bo.country} onChange={v => updBO(i,"country",v)} options={["United States","Canada","Other"]}/>
                          </Row2>
                        </div>
                      ))}
                      {beneficialOwners.length < 4 && (
                        <button type="button" onClick={addBO} style={{
                          display:"flex", alignItems:"center", gap:6, padding:"10px 16px",
                          background:G.mint, border:`1px dashed ${G.forest}40`, borderRadius:8, cursor:"pointer",
                          fontSize:12, fontWeight:600, color:G.forest, fontFamily:FONT, width:"100%", justifyContent:"center",
                        }}>
                          <span style={{ fontSize:16, lineHeight:1 }}>+</span> Add Beneficial Owner (25%+ equity)
                        </button>
                      )}
                      {beneficialOwners.length > 0 && (() => {
                        const totalPct = beneficialOwners.reduce((s, bo) => s + (parseFloat(bo.ownershipPct) || 0), 0);
                        return (
                          <div style={{ marginTop:8, padding:"8px 12px", borderRadius:8, fontSize:11, fontFamily:FONT,
                            background: totalPct > 100 ? C.errorBg : totalPct === 100 ? "#F0FDF4" : C.warningBg,
                            border: `1px solid ${totalPct > 100 ? A.red+"30" : totalPct === 100 ? G.forest+"30" : C.warningBorder}`,
                            color: totalPct > 100 ? A.red : totalPct === 100 ? G.forest : C.warning,
                            fontWeight:600,
                          }}>
                            Total beneficial ownership reported: {totalPct.toFixed(1)}%
                            {totalPct > 100 && " — exceeds 100%"}
                            {totalPct === 100 && " ✓"}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Accredited Investor Status */}
          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <RadioGroup label="Are you an Accredited Investor?" name="accredited" required
              value={acct.accredited} onChange={v => updAcct("accredited",v)}
              options={[{ value:"Yes", label:"Yes, I am an Accredited Investor" },{ value:"No", label:"No" }]}/>
            {acct.accredited === "No" && (
              <FlagAlert type="block" msg="DST investments require accredited investor status per SEC Regulation D. You may not be eligible to proceed."/>
            )}
          </div>
        </SectionCard>
          </>
        )}

        {/* ══ SUB-STEP 1: Accreditation ══ */}
        {subStep === 1 && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.02em" }}>Investor Accreditation</h1>
              <p style={{ fontSize:15, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6 }}>DST investments are available exclusively to accredited investors under SEC Regulation D.</p>
            </div>

        {/* ── ACCREDITED INVESTOR CERTIFICATION ── */}
        {acct.accredited === "Yes" && (
          <SectionCard title="Accredited Investor Certification" icon={IC.shield}>
            <InfoCallout type="success" title="SEC Regulation D — Accredited Investor Verification">
              Under Rule 506(b) and 506(c) of Regulation D, DST private placements are offered exclusively to accredited investors as defined in <strong>Rule 501(a)</strong> of the Securities Act of 1933.
            </InfoCallout>

            {/* Qualification Basis — Natural Person */}
            {acct.registrationCategory !== "entity" && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:10 }}>Qualification Basis <span style={{ color:A.red }}>*</span></div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {[
                    { value:"income_200k", rule:"501(a)(6)", label:"Income Threshold", desc:"Individual income exceeding $200,000 (or $300,000 with spouse) in each of the two most recent years." },
                    { value:"net_worth_1m", rule:"501(a)(5)", label:"Net Worth Threshold", desc:"Individual net worth (or joint) exceeding $1,000,000 excluding primary residence." },
                    { value:"securities_license", rule:"501(a)(10)", label:"Professional Certification", desc:"Holder of Series 7, Series 65, or Series 82 license in good standing." },
                    { value:"director_officer", rule:"501(a)(4)", label:"Director, Executive Officer, or General Partner", desc:"Director, executive officer, or general partner of the issuer." },
                    { value:"knowledgeable_employee", rule:"501(a)(11)", label:"Knowledgeable Employee of Private Fund", desc:"Knowledgeable employee as defined in Rule 3c-5(a)(4)." },
                    { value:"family_client", rule:"501(a)(13)", label:"Family Client of Qualified Family Office", desc:"Family client of a family office that qualifies as an accredited investor." },
                  ].map(opt => {
                    const hasFsData = fsCalcs.totalAssets > 0;
                    const fails = hasFsData && (
                      (opt.value === "income_200k" && !fsCalcs.meetsIncomeTest) ||
                      (opt.value === "net_worth_1m" && !fsCalcs.meetsNwTest)
                    );
                    const isSelected = acct.accreditedBasis === opt.value;
                    return (
                      <label key={opt.value} style={{
                        display:"flex", gap:10, padding:"12px 14px", borderRadius:10,
                        cursor: fails ? "not-allowed" : "pointer",
                        border:`1.5px solid ${fails ? N.border : isSelected ? G.forest : N.border}`,
                        background: fails ? N.section : isSelected ? G.mint : N.card,
                        opacity: fails ? 0.55 : 1, transition:"all 0.15s",
                      }} onClick={() => !fails && updAcct("accreditedBasis", opt.value)}>
                        <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1,
                            border:`2px solid ${fails ? N.border : isSelected ? G.forest : N.border}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            background: isSelected ? G.forest : "transparent" }}>
                          {isSelected && <div style={{ width:6, height:6, borderRadius:"50%", background:N.card }}/>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                            <span style={{ fontSize:12, fontWeight:600, color: fails ? T.light : T.primary, fontFamily:FONT }}>{opt.label}</span>
                            <span style={{ fontSize:10, fontWeight:600, color:G.forest, fontFamily:FONT, padding:"1px 6px", background:G.mint, borderRadius:4, border:`1px solid ${G.forest}20` }}>Rule {opt.rule}</span>
                            {fails && <span style={{ fontSize:10, fontWeight:600, color:T.muted, padding:"1px 6px", background:N.divider, borderRadius:4 }}>Not available — below threshold</span>}
                          </div>
                          <div style={{ fontSize:11, color: fails ? T.light : T.muted, fontFamily:FONT, lineHeight:1.6 }}>{opt.desc}</div>
                          {fails && <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:3 }}>
                            Financial statements show {opt.value === "income_200k" ? `income of ${fmtFull(fsCalcs.grossInc)} — below the $200,000 threshold` : `net worth of ${fmtFull(fsCalcs.netWorthExRes)} — below the $1,000,000 threshold`}.
                          </div>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qualification Basis — Entity */}
            {acct.registrationCategory === "entity" && (() => {
              const hasFsData = fsCalcs.totalAssets > 0;
              const totalInvestments = fsCalcs.mktSec + fsCalcs.retAccounts + fsCalcs.illiquid;
              const entityOpts = [
                { value:"entity_5m_assets",           rule:"501(a)(3)",  label:"Entity with Assets > $5M",                        desc:"Corporation, partnership, LLC, trust with total assets exceeding $5M.",        threshold:5000000, metric:() => fsCalcs.totalAssets,    metricLabel:"Total Assets" },
                { value:"entity_5m_investments",      rule:"501(a)(7)",  label:"Entity with Investments > $5M",                   desc:"Entity that owns investments exceeding $5M.",                                 threshold:5000000, metric:() => totalInvestments,      metricLabel:"Total Investments" },
                { value:"entity_all_owners_accredited",rule:"501(a)(8)", label:"All Equity Owners Accredited",                   desc:"All equity owners independently qualify as accredited investors.",             threshold:null },
                { value:"entity_family_office",       rule:"501(a)(12)", label:"Qualified Family Office",                         desc:"Family office with AUM exceeding $5M.",                                       threshold:5000000, metric:() => fsCalcs.totalAssets,    metricLabel:"Total Assets (AUM)" },
                { value:"entity_ria_bd",              rule:"501(a)(1)",  label:"Registered Investment Adviser or Broker-Dealer",  desc:"SEC/state-registered investment adviser or broker-dealer.",                   threshold:null },
                { value:"entity_bank_insurance",      rule:"501(a)(1)",  label:"Bank, Insurance Co., or Registered Investment Co.",desc:"Bank, savings association, insurance company, or registered investment company.", threshold:null },
                { value:"entity_erisa_plan",          rule:"501(a)(1)",  label:"Employee Benefit Plan (ERISA)",                   desc:"ERISA plan with total assets exceeding $5M.",                                 threshold:5000000, metric:() => fsCalcs.totalAssets,    metricLabel:"Total Assets" },
              ];
              const selectedOpt = entityOpts.find(o => o.value === acct.accreditedBasis);
              const selectedMetricValue = selectedOpt?.metric ? selectedOpt.metric() : null;
              const selectedPasses = !selectedOpt?.threshold || !hasFsData || selectedMetricValue >= selectedOpt.threshold;
              return (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:10 }}>Entity Qualification Basis <span style={{ color:A.red }}>*</span></div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {entityOpts.map(opt => {
                      const fails = hasFsData && opt.threshold !== null && opt.metric && opt.metric() < opt.threshold;
                      const isSelected = acct.accreditedBasis === opt.value;
                      return (
                        <label key={opt.value} style={{
                          display:"flex", gap:10, padding:"12px 14px", borderRadius:10,
                          cursor: fails ? "not-allowed" : "pointer",
                          border:`1.5px solid ${fails ? N.border : isSelected ? G.forest : N.border}`,
                          background: fails ? N.section : isSelected ? G.mint : N.card,
                          opacity: fails ? 0.55 : 1, transition:"all 0.15s",
                        }} onClick={() => !fails && updAcct("accreditedBasis", opt.value)}>
                          <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1,
                              border:`2px solid ${fails ? N.border : isSelected ? G.forest : N.border}`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              background: isSelected ? G.forest : "transparent" }}>
                            {isSelected && <div style={{ width:6, height:6, borderRadius:"50%", background:N.card }}/>}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                              <span style={{ fontSize:12, fontWeight:600, color: fails ? T.light : T.primary, fontFamily:FONT }}>{opt.label}</span>
                              <span style={{ fontSize:10, fontWeight:600, color:G.forest, fontFamily:FONT, padding:"1px 6px", background:G.mint, borderRadius:4, border:`1px solid ${G.forest}20` }}>Rule {opt.rule}</span>
                              {fails && <span style={{ fontSize:10, fontWeight:600, color:T.muted, padding:"1px 6px", background:N.divider, borderRadius:4 }}>Not available — below threshold</span>}
                            </div>
                            <div style={{ fontSize:11, color: fails ? T.light : T.muted, fontFamily:FONT, lineHeight:1.6 }}>{opt.desc}</div>
                            {fails && <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:3 }}>
                              Financial statements show {opt.metricLabel.toLowerCase()} of {fmtFull(opt.metric())} — below the $5,000,000 threshold.
                            </div>}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Entity Financial Statement Cross-Validation panel */}
                  {acct.accreditedBasis && selectedOpt?.threshold && hasFsData && (
                    <div style={{ marginTop:12, padding:"14px 16px", borderRadius:10,
                        background: selectedPasses ? "#F0FDF4" : C.errorBg,
                        border:`1px solid ${selectedPasses ? G.forest+"30" : A.red+"30"}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span style={{ display:"flex", alignItems:"center", color: selectedPasses ? G.forest : A.red }}>
                          {React.cloneElement(selectedPasses ? IC.shield : IC.alertTriangle, { width:14, height:14, strokeWidth:2 })}
                        </span>
                        <span style={{ fontSize:12, fontWeight:700, fontFamily:FONT, color: selectedPasses ? G.forest : A.red }}>
                          Financial Statement Cross-Validation
                        </span>
                      </div>
                      <div style={{ display:"flex", gap:12 }}>
                        <div style={{ flex:1, padding:"8px 10px", background:N.card, borderRadius:8, border:`1px solid ${N.border}` }}>
                          <div style={{ fontSize:9, color:T.light, fontFamily:FONT, textTransform:"uppercase", marginBottom:2 }}>{selectedOpt.metricLabel}</div>
                          <div style={{ fontSize:14, fontWeight:700, fontFamily:FONT, color: selectedPasses ? G.forest : A.red }}>
                            {fmtFull(selectedMetricValue)}
                          </div>
                        </div>
                        <div style={{ flex:1, padding:"8px 10px", background:N.card, borderRadius:8, border:`1px solid ${N.border}` }}>
                          <div style={{ fontSize:9, color:T.light, fontFamily:FONT, textTransform:"uppercase", marginBottom:2 }}>Threshold</div>
                          <div style={{ fontSize:14, fontWeight:700, fontFamily:FONT, color:T.primary }}>$5,000,000</div>
                        </div>
                        <div style={{ flex:1, padding:"8px 10px", background:N.card, borderRadius:8, border:`1px solid ${N.border}` }}>
                          <div style={{ fontSize:9, color:T.light, fontFamily:FONT, textTransform:"uppercase", marginBottom:2 }}>Status</div>
                          <div style={{ fontSize:12, fontWeight:700, fontFamily:FONT, color: selectedPasses ? G.forest : A.red }}>
                            {selectedPasses ? "✓ Meets" : "✗ Below"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* All Equity Owners Accredited — owner financial statement uploads */}
            {acct.registrationCategory === "entity" && acct.accreditedBasis === "entity_all_owners_accredited" && (() => {
              const qualifyingOwners = beneficialOwners.filter(bo => (parseFloat(bo.ownershipPct) || 0) >= 25);
              return (
                <div style={{ padding:"14px 16px", background:N.section, borderRadius:10, border:`1px solid ${N.border}`, marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    {React.cloneElement(IC.shield, { width:14, height:14, strokeWidth:2, style:{ color:G.forest } })}
                    <span style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT }}>
                      Owner Accreditation — Financial Statements Required
                    </span>
                  </div>
                  <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, marginBottom:12, lineHeight:1.6 }}>
                    Under Rule 501(a)(8), each equity owner with ≥ 25% interest must independently qualify as an accredited investor.
                    Upload a signed financial statement or accreditation letter for each qualifying owner.
                  </div>

                  {qualifyingOwners.length > 0 && (
                    <div style={{ marginBottom:12, padding:"10px 12px", background:N.card, borderRadius:8, border:`1px solid ${N.border}` }}>
                      <div style={{ fontSize:10, fontWeight:700, color:T.muted, fontFamily:FONT, textTransform:"uppercase", marginBottom:6 }}>Identified Owners ≥ 25%</div>
                      {qualifyingOwners.map((bo, i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", borderBottom: i < qualifyingOwners.length - 1 ? `1px solid ${N.border}` : "none" }}>
                          <span style={{ width:22, height:22, borderRadius:"50%", background:G.mint, display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:10, fontWeight:700, color:G.forest, fontFamily:FONT, flexShrink:0 }}>{i + 1}</span>
                          <span style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:FONT, flex:1 }}>{bo.name || "Unnamed Owner"}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:G.forest, fontFamily:FONT, padding:"2px 8px", background:G.mint, borderRadius:4 }}>
                            {bo.ownershipPct || "?"}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {qualifyingOwners.length === 0 && (
                    <InfoCallout type="important">
                      No beneficial owners with ≥ 25% interest have been entered yet. Please complete the Beneficial Owners section first, then return here to upload documentation.
                    </InfoCallout>
                  )}

                  <DocumentUploader
                    label="Upload Signed Financial Statements / Accreditation Letters"
                    sublabel={`One document per qualifying owner (${qualifyingOwners.length > 0 ? qualifyingOwners.length : "TBD"} required)`}
                    maxFiles={10} maxSizeMB={10}
                    docType="owner-accredited-docs"
                    files={docs.ownerAccreditedDocs}
                    onFilesChange={f => setDocFiles("ownerAccreditedDocs", f)}
                  />

                  {docs.ownerAccreditedDocs.length > 0 && qualifyingOwners.length > 0 && docs.ownerAccreditedDocs.length >= qualifyingOwners.length && (
                    <InfoCallout type="success">
                      ✓ {docs.ownerAccreditedDocs.length} document{docs.ownerAccreditedDocs.length !== 1 ? "s" : ""} uploaded — all qualifying owners covered
                    </InfoCallout>
                  )}
                </div>
              );
            })()}

            {/* Spousal Equivalent Inclusion — individual only */}
            {acct.registrationCategory !== "entity" && (acct.accreditedBasis === "income_200k" || acct.accreditedBasis === "net_worth_1m") && (
              <div style={{ padding:"12px 14px", background:N.section, borderRadius:10, border:`1px solid ${N.border}`, marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:8 }}>
                  Spousal / Spousal Equivalent Inclusion <span style={{ fontSize:9, fontWeight:500, color:G.forest, marginLeft:6, padding:"1px 5px", background:G.mint, borderRadius:3 }}>2020 Amendment</span>
                </div>
                <TSelect label="Are you qualifying jointly with a spouse or spousal equivalent?" value={acct.accreditedSubBasis} onChange={v => updAcct("accreditedSubBasis",v)}
                  options={[{ value:"individual_only", label:"Individual qualification only" },{ value:"with_spouse", label:"Joint with spouse" },{ value:"with_spousal_equiv", label:"Joint with spousal equivalent" }]}/>
              </div>
            )}

            {/* Financial Statement Cross-Validation */}
            {(acct.accreditedBasis === "income_200k" || acct.accreditedBasis === "net_worth_1m") && fsCalcs.totalAssets > 0 && (
              <div style={{ padding:"14px 16px", borderRadius:10, marginBottom:16,
                  background: (acct.accreditedBasis === "income_200k" && fsCalcs.meetsIncomeTest) || (acct.accreditedBasis === "net_worth_1m" && fsCalcs.meetsNwTest) ? "#F0FDF4" : C.errorBg,
                  border: `1px solid ${(acct.accreditedBasis === "income_200k" && fsCalcs.meetsIncomeTest) || (acct.accreditedBasis === "net_worth_1m" && fsCalcs.meetsNwTest) ? G.forest+"30" : A.red+"30"}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ display:"flex", alignItems:"center", color:(acct.accreditedBasis === "income_200k" && fsCalcs.meetsIncomeTest) || (acct.accreditedBasis === "net_worth_1m" && fsCalcs.meetsNwTest) ? G.forest : A.red }}>{React.cloneElement((acct.accreditedBasis === "income_200k" && fsCalcs.meetsIncomeTest) || (acct.accreditedBasis === "net_worth_1m" && fsCalcs.meetsNwTest) ? IC.shield : IC.alertTriangle, { width:14, height:14, strokeWidth:2 })}</span>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:FONT,
                      color: (acct.accreditedBasis === "income_200k" && fsCalcs.meetsIncomeTest) || (acct.accreditedBasis === "net_worth_1m" && fsCalcs.meetsNwTest) ? G.forest : A.red }}>
                    Financial Statement Cross-Validation
                  </span>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <div style={{ flex:1, padding:"8px 10px", background:N.card, borderRadius:8, border:`1px solid ${N.border}` }}>
                    <div style={{ fontSize:9, color:T.light, fontFamily:FONT, textTransform:"uppercase", marginBottom:2 }}>
                      {acct.accreditedBasis === "income_200k" ? "Gross Income" : "NW ex-Primary"}
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:FONT,
                        color: (acct.accreditedBasis === "income_200k" ? fsCalcs.meetsIncomeTest : fsCalcs.meetsNwTest) ? G.forest : A.red }}>
                      {fmtFull(acct.accreditedBasis === "income_200k" ? fsCalcs.grossInc : fsCalcs.netWorthExRes)}
                    </div>
                  </div>
                  <div style={{ flex:1, padding:"8px 10px", background:N.card, borderRadius:8, border:`1px solid ${N.border}` }}>
                    <div style={{ fontSize:9, color:T.light, fontFamily:FONT, textTransform:"uppercase", marginBottom:2 }}>Threshold</div>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:FONT, color:T.primary }}>
                      {acct.accreditedBasis === "income_200k" ? "$200,000" : "$1,000,000"}
                    </div>
                  </div>
                  <div style={{ flex:1, padding:"8px 10px", background:N.card, borderRadius:8, border:`1px solid ${N.border}` }}>
                    <div style={{ fontSize:9, color:T.light, fontFamily:FONT, textTransform:"uppercase", marginBottom:2 }}>Status</div>
                    <div style={{ fontSize:12, fontWeight:700, fontFamily:FONT,
                        color: (acct.accreditedBasis === "income_200k" ? fsCalcs.meetsIncomeTest : fsCalcs.meetsNwTest) ? G.forest : A.red }}>
                      {(acct.accreditedBasis === "income_200k" ? fsCalcs.meetsIncomeTest : fsCalcs.meetsNwTest) ? "✓ Meets" : "✗ Below"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Method */}
            {(() => {
              const minThreshold = acct.registrationCategory === "entity" ? 1000000 : 200000;
              const meetsMinInvest = cartTotal >= minThreshold;
              return (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:10 }}>Verification Method <span style={{ color:A.red }}>*</span></div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {[
                      { value:"min_investment", label:"Minimum Investment Threshold (March 2025)", desc:`Per SEC No-Action Letter: $200K (natural persons) or $1M (entities) with self-cert.`, tag:"NEW" },
                      { value:"third_party", label:"Third-Party Verification Letter", desc:"Written confirmation from attorney, CPA, RIA, or broker-dealer." },
                      { value:"documentation", label:"Financial Documentation Review", desc:"IRS forms or financial statements review within prior 3 months." },
                    ].map(opt => {
                      const isMinInvest = opt.value === "min_investment";
                      const blocked = isMinInvest && !meetsMinInvest;
                      const autoSelected = isMinInvest && meetsMinInvest;
                      const isSelected = acct.accreditedVerifyMethod === opt.value;
                      return (
                        <label key={opt.value} style={{
                          display:"flex", gap:10, padding:"12px 14px", borderRadius:10,
                          cursor: blocked ? "not-allowed" : "pointer",
                          border:`1.5px solid ${blocked ? A.red+"40" : isSelected ? G.forest : N.border}`,
                          background: blocked ? C.errorBg : isSelected ? G.mint : N.card,
                          opacity: blocked ? 0.7 : 1, transition:"all 0.15s",
                        }} onClick={() => !blocked && updAcct("accreditedVerifyMethod", opt.value)}>
                          <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1,
                              border:`2px solid ${blocked ? A.red+"60" : isSelected ? G.forest : N.border}`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              background: isSelected ? G.forest : "transparent" }}>
                            {isSelected && <div style={{ width:6, height:6, borderRadius:"50%", background:N.card }}/>}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                              <span style={{ fontSize:12, fontWeight:600, color: blocked ? C.error : T.primary, fontFamily:FONT }}>{opt.label}</span>
                              {opt.tag && <span style={{ fontSize:8, fontWeight:700, color:T.white, padding:"2px 6px", background:A.blue, borderRadius:4 }}>{opt.tag}</span>}
                              {autoSelected && <span style={{ fontSize:8, fontWeight:700, color:T.white, padding:"2px 6px", background:G.forest, borderRadius:4 }}>✓ Auto-Qualified</span>}
                              {blocked && <span style={{ fontSize:8, fontWeight:700, color:T.white, padding:"2px 6px", background:A.red, borderRadius:4 }}>✗ Investment Too Low</span>}
                            </div>
                            <div style={{ fontSize:11, color: blocked ? "#7F1D1D" : T.muted, fontFamily:FONT, lineHeight:1.6 }}>{opt.desc}</div>
                            {isMinInvest && (
                              <div style={{ marginTop:5, display:"flex", gap:8 }}>
                                <div style={{ padding:"4px 8px", background: meetsMinInvest ? G.mint : C.errorBg, borderRadius:6, border:`1px solid ${meetsMinInvest ? G.forest+"30" : A.red+"30"}` }}>
                                  <span style={{ fontSize:10, fontWeight:600, fontFamily:FONT, color: meetsMinInvest ? G.forest : C.error }}>
                                    Proposed: {fmtFull(cartTotal)}
                                  </span>
                                </div>
                                <div style={{ padding:"4px 8px", background:N.section, borderRadius:6, border:`1px solid ${N.border}` }}>
                                  <span style={{ fontSize:10, fontWeight:600, fontFamily:FONT, color:T.muted }}>
                                    Required: {fmtFull(minThreshold)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── Third-Party Verification Details ── */}
            {acct.accreditedVerifyMethod === "third_party" && (
              <div style={{ padding:"12px 14px", background:N.section, borderRadius:10,
                  border:`1px solid ${N.border}`, marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:8 }}>
                  Third-Party Verification Details
                </div>
                <TSelect label="Verifying Professional Type" required
                  value={acct.accreditedThirdPartyType} onChange={v => updAcct("accreditedThirdPartyType",v)}
                  options={[
                    { value:"attorney", label:"Licensed Attorney" },
                    { value:"cpa", label:"Certified Public Accountant (CPA)" },
                    { value:"ria", label:"SEC- or State-Registered Investment Adviser" },
                    { value:"bd", label:"SEC-Registered Broker-Dealer" },
                  ]}
                />
                <Row2>
                  <TInput label="Verifier Name" required
                    value={acct.accreditedThirdPartyName}
                    onChange={v => updAcct("accreditedThirdPartyName",v)}
                    placeholder="Full name of verifying professional"
                  />
                  <TInput label="Firm / Organization" required
                    value={acct.accreditedThirdPartyFirm}
                    onChange={v => updAcct("accreditedThirdPartyFirm",v)}
                    placeholder="Firm name"
                  />
                </Row2>
                <DateInput label="Date of Verification Letter" required
                  value={acct.accreditedThirdPartyDate}
                  onChange={v => updAcct("accreditedThirdPartyDate",v)}
                />
                <InfoCallout>
                  Verification letters must be dated within 90 days of the investment transaction.
                  The letter must be on the verifier's firm letterhead and include a statement that the verifier
                  has taken reasonable steps to verify the investor's accredited status.
                </InfoCallout>
              </div>
            )}

            {/* ── Minimum Investment Threshold (March 2025 No-Action) ── */}
            {acct.accreditedVerifyMethod === "min_investment" && (
              <div style={{ padding:"16px 18px", background:`linear-gradient(135deg, ${G.darkest} 0%, ${G.deep} 100%)`, borderRadius:10,
                  border:"none", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.9)", fontFamily:FONT,
                      padding:"3px 8px", background:"rgba(255,255,255,0.15)", borderRadius:4, letterSpacing:"0.04em" }}>
                    SEC NO-ACTION LETTER — MARCH 12, 2025
                  </span>
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", fontFamily:FONT, lineHeight:1.7, marginBottom:14 }}>
                  The SEC Division of Corporation Finance (Latham &amp; Watkins No-Action Letter, March 12, 2025) confirmed
                  that issuers may rely on minimum investment amounts as a "reasonable step" to verify accredited investor
                  status under Rule 506(c), provided the following conditions are met:
                </div>
                <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                  <div style={{ flex:1, padding:"10px 12px", background:"rgba(255,255,255,0.10)", borderRadius:8,
                      border:"1px solid rgba(255,255,255,0.15)", textAlign:"center" }}>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.55)", fontFamily:FONT, textTransform:"uppercase", marginBottom:3 }}>Natural Persons</div>
                    <div style={{ fontSize:18, fontWeight:600, color:T.white, fontFamily:FONT }}>$200,000</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.55)", fontFamily:FONT }}>Minimum Investment</div>
                  </div>
                  <div style={{ flex:1, padding:"10px 12px", background:"rgba(255,255,255,0.10)", borderRadius:8,
                      border:"1px solid rgba(255,255,255,0.15)", textAlign:"center" }}>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.55)", fontFamily:FONT, textTransform:"uppercase", marginBottom:3 }}>Legal Entities</div>
                    <div style={{ fontSize:18, fontWeight:600, color:T.white, fontFamily:FONT }}>$1,000,000</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.55)", fontFamily:FONT }}>Minimum Investment</div>
                  </div>
                </div>
                {cartTotal > 0 && (() => {
                  const meetsMin = (acct.registrationCategory !== "entity" && cartTotal >= 200000) ||
                                   (acct.registrationCategory === "entity" && cartTotal >= 1000000);
                  return (
                    <div style={{ padding:"8px 12px", borderRadius:6, marginBottom:12,
                        background: meetsMin ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.08)",
                        border: `1px solid ${meetsMin ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.15)"}` }}>
                      <div style={{ fontSize:11, fontFamily:FONT, lineHeight:1.5, color:"rgba(255,255,255,0.85)" }}>
                        <strong style={{ color:T.white }}>Your Total Investment:</strong> {fmtFull(cartTotal)} —{" "}
                        {meetsMin
                          ? <span style={{ color:"#6EE7B7", fontWeight:700 }}>✓ Meets minimum threshold</span>
                          : <span style={{ color:"rgba(255,255,255,0.55)", fontWeight:600 }}>✗ Below minimum — this method may not be available</span>
                        }
                      </div>
                    </div>
                  );
                })()}
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.12)", paddingTop:12 }}>
                  <CheckBox
                    checked={acct.accreditedNoFinancing}
                    onChange={v => updAcct("accreditedNoFinancing",v)}
                    label="I represent that my investment is not financed by any third party"
                    description="Per the No-Action Letter conditions, the investor must represent that the minimum investment amount is not financed by any third party for the purpose of meeting the accredited investor threshold."
                    darkMode
                  />
                  <div style={{ marginTop:8 }}>
                    <CheckBox
                      checked={acct.accreditedMeetsMinInvest}
                      onChange={v => updAcct("accreditedMeetsMinInvest",v)}
                      label="I confirm my investment meets the applicable minimum investment amount"
                      description="$200,000 for natural persons or $1,000,000 for entities (or $200,000 per equity owner if entity has fewer than 5 natural person owners)."
                      darkMode
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Financial Documentation Upload ── */}
            {acct.accreditedVerifyMethod === "documentation" && (
              <div style={{ padding:"12px 14px", background:N.section, borderRadius:10,
                  border:`1px solid ${N.border}`, marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:4 }}>
                  Financial Documentation Upload
                </div>
                <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.6, marginBottom:12 }}>
                  Upload supporting documents demonstrating accredited investor status. Acceptable documents include
                  IRS Form W-2, tax returns (Form 1040/1040-SR), brokerage or bank account statements, K-1s, or
                  a letter from a licensed CPA or attorney. All documents must be dated within the prior 3 months
                  or be the most recent tax year filing.
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
                  {[
                    { label:"Tax Returns / W-2 / K-1", sub:"IRS Form 1040, W-2, or K-1 — most recent tax year" },
                    { label:"Brokerage or Bank Statements", sub:"Account statements dated within the prior 3 months" },
                    { label:"CPA / Attorney Letter", sub:"Written verification on firm letterhead" },
                    { label:"Other Supporting Documents", sub:"Any additional documentation supporting accredited status" },
                  ].map(item => (
                    <div key={item.label} style={{ padding:"8px 10px", background:N.card, borderRadius:8, border:`1px solid ${N.divider}` }}>
                      <div style={{ fontSize:11, fontWeight:600, color:T.primary, fontFamily:FONT }}>{item.label}</div>
                      <div style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
                <DocumentUploader
                  label="Upload Financial Documents"
                  sublabel="PDF, JPG, or PNG — Max 10MB per file"
                  required
                  accept="image/*,application/pdf"
                  maxFiles={10}
                  maxSizeMB={10}
                  docType="accredited-docs"
                  files={docs.accreditedDocs}
                  onFilesChange={f => setDocFiles("accreditedDocs", f)}
                />
                {docs.accreditedDocs.length > 0 && (
                  <div style={{ marginTop:8, padding:"8px 10px", background:G.mint, borderRadius:8, border:`1px solid ${G.forest}30` }}>
                    <span style={{ fontSize:11, fontWeight:600, color:G.forest, fontFamily:FONT }}>
                      ✓ {docs.accreditedDocs.filter(f => f.status === "uploaded").length} of {docs.accreditedDocs.length} document{docs.accreditedDocs.length !== 1 ? "s" : ""} uploaded
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Investor Representations & Certification ── */}
            <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:16, marginTop:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:8 }}>
                Investor Certification &amp; Representations
              </div>
              <div style={{ padding:"16px 18px", background:N.section, borderRadius:10,
                  border:`1px solid ${N.border}`, marginBottom:12, maxHeight:280, overflowY:"auto" }}>
                <div style={{ fontSize:11, color:T.body, fontFamily:FONT, lineHeight:1.75 }}>
                  <p style={{ margin:"0 0 10px" }}>
                    <strong>1. Accredited Investor Status.</strong> I hereby certify, represent, and warrant that I am an
                    "accredited investor" as defined in Rule 501(a) of Regulation D promulgated under the Securities Act of
                    1933, as amended, and that I meet the qualification criteria indicated above. I understand that this
                    representation is being relied upon by Stax Capital, Inc. ("Stax Capital"), the issuer, and their respective
                    affiliates in determining my eligibility to invest in securities offered pursuant to Rule 506(b) and/or
                    Rule 506(c) of Regulation D.
                  </p>
                  <p style={{ margin:"0 0 10px" }}>
                    <strong>2. Knowledge and Experience.</strong> I have such knowledge and experience in financial and
                    business matters that I am capable of evaluating the merits and risks of the prospective investment,
                    or I am relying on the advice of a qualified representative or advisor who possesses such knowledge
                    and experience. I understand that DST interests are complex, illiquid, private placement securities.
                  </p>
                  <p style={{ margin:"0 0 10px" }}>
                    <strong>3. Financial Capacity.</strong> I am not financially dependent upon receiving distributions
                    from this investment and I am able, without impairing my financial condition or standard of living,
                    to hold the investment for an indefinite period, to withstand a complete loss of my investment, and/or
                    to make additional capital contributions if necessary. My overall commitment to investments that are
                    not readily marketable is not disproportionate to my net worth and my investment in these securities
                    will not cause such overall commitment to become excessive.
                  </p>
                  <p style={{ margin:"0 0 10px" }}>
                    <strong>4. Investment Purpose.</strong> I am acquiring the securities for my own account (or for
                    a trust account if I am a trustee) for investment purposes only and not with a view to or for sale
                    in connection with any distribution thereof. I understand that the securities have not been registered
                    under the Securities Act and cannot be resold unless registered or an exemption from registration
                    is available.
                  </p>
                  <p style={{ margin:"0 0 10px" }}>
                    <strong>5. Information Accuracy.</strong> All information I have provided in this certification,
                    including the Financial Statement, is true, correct, and complete to the best of my knowledge. I
                    understand that providing materially false or misleading information may constitute a violation of
                    federal securities laws. I agree to promptly notify Stax Capital of any material changes to my
                    financial condition or accredited investor status prior to closing.
                  </p>
                  <p style={{ margin:"0 0 10px" }}>
                    <strong>6. Verification Consent.</strong> I consent to Stax Capital and/or its agents taking
                    reasonable steps to verify my accredited investor status as required under applicable securities
                    laws, including but not limited to reviewing financial documentation, contacting third-party
                    verifiers, or verifying professional credentials through FINRA BrokerCheck or other regulatory
                    databases.
                  </p>
                  <p style={{ margin:0 }}>
                    <strong>7. Ongoing Obligation.</strong> I understand that I must be an accredited investor at the
                    time of sale of the securities. If my status changes prior to the consummation of my investment,
                    I agree to promptly notify Stax Capital so that my eligibility may be reassessed.
                  </p>
                </div>
              </div>
              <CheckBox
                checked={acct.accreditedSelfCert}
                onChange={v => updAcct("accreditedSelfCert",v)}
                label="I certify under penalty of perjury that the above representations are true and correct"
                description="This certification is made in connection with the purchase of securities pursuant to SEC Regulation D, Rule 506(b) and/or Rule 506(c), and FINRA Rule 5123."
              />
              {acct.accreditedSelfCert && (
                <div style={{ marginTop:12 }}>
                  <Row2>
                    <TInput label="Electronic Signature — Full Legal Name" required
                      value={acct.accreditedCertSig}
                      onChange={v => updAcct("accreditedCertSig",v)}
                      placeholder="Type your full legal name as your electronic signature"
                    />
                    <DateInput label="Date of Certification"
                      value={acct.accreditedCertDate || new Date().toLocaleDateString("en-US")}
                      onChange={v => updAcct("accreditedCertDate",v)}
                    />
                  </Row2>
                </div>
              )}
            </div>

            {/* ── Regulatory Reference Panel ── */}
            <div style={{ marginTop:16, padding:"12px 14px", background:N.bgAlt, borderRadius:10,
                border:`1px solid ${N.border}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:T.muted, fontFamily:FONT, marginBottom:6,
                  textTransform:"uppercase", letterSpacing:0.5 }}>
                Regulatory References
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {[
                  "SEC Rule 501(a) — Accredited Investor Definition",
                  "SEC Rule 506(b) — Private Placement Exemption",
                  "SEC Rule 506(c) — General Solicitation Verification",
                  "SEC Release 33-10824 (Aug. 2020) — Expanded AI Definition",
                  "SEC No-Action Letter (March 12, 2025) — Min. Investment Verification",
                  "SEC Accredited Investor Review (2023) — Dodd-Frank §413(b)",
                  "FINRA Rule 5123 — Private Placement Filing Requirements",
                  "FINRA Reg BI — Best Interest Obligation",
                  "Securities Act of 1933, §4(a)(2)",
                ].map((ref, i) => (
                  <span key={i} style={{
                    fontSize:9, color:T.muted, fontFamily:FONT,
                    padding:"3px 8px", background:N.card, borderRadius:4,
                    border:`1px solid ${N.border}`, lineHeight:1.4,
                  }}>
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
        )}
          </>
        )}

        {/* ══ SUB-STEP 2: Personal Info ══ */}
        {subStep === 2 && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.02em" }}>Your Personal Details</h1>
              <p style={{ fontSize:15, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6 }}>Basic contact and address information.</p>
            </div>

        {/* ── SECTION 3: Personal Information ── */}
        <SectionCard title="Personal Information" icon={IC.user}>
          <Row2>
            <TSelect label="Title" value={acct.title} onChange={v => updAcct("title",v)} options={["Mr.","Mrs.","Ms.","Dr.","Other"]}/>
            <div/>
          </Row2>
          <Row3>
            <TInput label="First Name" required value={acct.firstName} onChange={v => updAcct("firstName",v)} placeholder="First name"/>
            <TInput label="Middle Name" value={acct.middleName} onChange={v => updAcct("middleName",v)} placeholder="Middle name"/>
            <TInput label="Last Name" required value={acct.lastName} onChange={v => updAcct("lastName",v)} placeholder="Last name"/>
          </Row3>
          <Row2>
            <PhoneInput label="Primary Phone" required value={acct.phone} onChange={v => updAcct("phone",v)}/>
            <EmailInput label="Email Address" required value={acct.email} onChange={v => updAcct("email",v)}/>
          </Row2>
        </SectionCard>

        {/* ── SECTION 4: Address ── */}
        <SectionCard title="Primary Address" icon={IC.home}>
          <InfoCallout type="warning">Primary address cannot be a PO Box.</InfoCallout>
          <TInput label="Street Address" required value={acct.street} onChange={v => updAcct("street",v)} placeholder="123 Main Street"/>
          <Row2>
            <TInput label="City" required value={acct.city} onChange={v => updAcct("city",v)} placeholder="City"/>
            <TSelect label="State" required value={acct.state} onChange={v => updAcct("state",v)} options={US_STATES}/>
          </Row2>
          <Row2>
            <ZipInput label="ZIP Code" required value={acct.zip} onChange={v => updAcct("zip",v)}/>
            <TSelect label="Country" required value={acct.country} onChange={v => updAcct("country",v)} options={["United States","Canada","Other"]}/>
          </Row2>
          <CheckBox checked={acct.lessThanOneYear} onChange={v => updAcct("lessThanOneYear",v)} label="I have been at my current home address for less than one year"/>
          <CheckBox checked={acct.hasDiffMailing} onChange={v => updAcct("hasDiffMailing",v)} label="My mailing address is different from my primary address"/>
          {acct.hasDiffMailing && (
            <div style={{ padding:14, background:N.bgAlt, borderRadius:8, border:`1px solid ${N.border}`, display:"flex", flexDirection:"column", gap:10 }}>
              <TInput label="Mailing Street Address" value={acct.mailingStreet} onChange={v => updAcct("mailingStreet",v)} placeholder="Mailing address"/>
              <Row2>
                <TInput label="City" value={acct.mailingCity} onChange={v => updAcct("mailingCity",v)}/>
                <TSelect label="State" value={acct.mailingState} onChange={v => updAcct("mailingState",v)} options={US_STATES}/>
              </Row2>
              <Row2>
                <ZipInput label="ZIP" value={acct.mailingZip} onChange={v => updAcct("mailingZip",v)}/>
                <TSelect label="Country" value={acct.mailingCountry} onChange={v => updAcct("mailingCountry",v)} options={["United States","Canada","Other"]}/>
              </Row2>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 5: Employment ── */}
        <SectionCard title="Employment Status" icon={IC.building}>
          <TSelect label="Are you currently..." required value={acct.employmentStatus} onChange={v => updAcct("employmentStatus",v)}
            options={["Employed","Self-Employed","Retired","Not Employed"]}/>
          {(acct.employmentStatus === "Employed" || acct.employmentStatus === "Self-Employed") && (
            <>
              <Row2>
                <TSelect label="Occupation" required value={acct.occupation} onChange={v => updAcct("occupation",v)} options={OCCUPATIONS}/>
                <TInput label="Employer Name" value={acct.employer} onChange={v => updAcct("employer",v)} placeholder="Leave blank if self-employed"/>
              </Row2>
              <TInput label="Employer Address" value={acct.employerAddress} onChange={v => updAcct("employerAddress",v)} placeholder="Employer address"/>
            </>
          )}
          {acct.employmentStatus === "Retired" && (
            <TInput label="Source of Income" value={acct.incomeSource} onChange={v => updAcct("incomeSource",v)} placeholder="Pension, investments, spouse, etc."/>
          )}
        </SectionCard>
          </>
        )}

        {/* ══ SUB-STEP 3: Identity ══ */}
        {subStep === 3 && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.02em" }}>Verify Your Identity</h1>
              <p style={{ fontSize:15, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6 }}>Required by federal law to verify and record identifying information for all applicants.</p>
            </div>

        {/* ── SECTION 6: USA PATRIOT Act ── */}
        <SectionCard title="USA PATRIOT Act Information" icon={IC.flag}>
          <InfoCallout>Required by Federal Law — We must obtain, verify, and record information that identifies each applicant.</InfoCallout>
          <Row2>
            <DateInput label="Date of Birth" required value={acct.dob} onChange={v => updAcct("dob",v)}/>
            <SSNInput label="Social Security Number" required value={acct.ssn} onChange={v => updAcct("ssn",v)}/>
          </Row2>
          <TSelect label="Country of Citizenship" required value={acct.citizenship} onChange={v => updAcct("citizenship",v)} options={["United States","Canada","United Kingdom","Other"]}/>
          <RadioGroup label="Form of Identification" name="idType" required value={acct.idType} onChange={v => updAcct("idType",v)}
            options={["Driver's License","Passport","State ID","Other Government-Issued"]}/>
          <InfoCallout type="warning">Identification must be current (not expired). Upload your document below.</InfoCallout>
          <Row2>
            <TInput label="ID Number" required value={acct.idNumber} onChange={v => updAcct("idNumber",v)} placeholder="ID number"/>
            <DateInput label="ID Expiration Date" required value={acct.idExpiry} onChange={v => updAcct("idExpiry",v)}/>
          </Row2>
          <DocumentUploader label="Upload Government-Issued Photo ID" sublabel="Must be current. Driver's License, Passport, or State ID." required={true}
            accept="image/*,application/pdf" maxFiles={2} maxSizeMB={10} docType="primary-id" files={docs.primaryId} onFilesChange={f => setDocFiles("primaryId", f)}/>
          <Row2>
            <TSelect label="Household Status" required value={acct.householdStatus} onChange={v => updAcct("householdStatus",v)} options={["Single","Married","Divorced","Widowed","Domestic Partnership"]}/>
            <TInput label="Number of Dependents" value={acct.dependents} onChange={v => updAcct("dependents",v)} placeholder="#" type="number"/>
          </Row2>
        </SectionCard>

        {/* ── SECTION 7: Co-Applicant ── */}
        <SectionCard title="Co-Applicant" icon={IC.users} collapsible defaultOpen={true}>
          {isIRA && <InfoCallout type="warning">IRA accounts should not have a Co-Applicant.</InfoCallout>}
          <CheckBox checked={acct.hasCoApplicant} onChange={v => updAcct("hasCoApplicant",v)} label="Add a Co-Applicant to this account" description="Required for joint account registrations"/>
          {acct.hasCoApplicant && (
            <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"12px", background:N.bgAlt, borderRadius:8, border:`1px solid ${N.border}` }}>
              <Row3>
                <TInput label="First Name" required value={acct.coFirstName} onChange={v => updAcct("coFirstName",v)}/>
                <TInput label="Middle Name" value={acct.coMiddleName} onChange={v => updAcct("coMiddleName",v)}/>
                <TInput label="Last Name" required value={acct.coLastName} onChange={v => updAcct("coLastName",v)}/>
              </Row3>
              <Row2>
                <PhoneInput label="Phone" value={acct.coPhone} onChange={v => updAcct("coPhone",v)}/>
                <EmailInput label="Email" value={acct.coEmail} onChange={v => updAcct("coEmail",v)}/>
              </Row2>
              <TInput label="Street Address" value={acct.coStreet} onChange={v => updAcct("coStreet",v)}/>
              <Row2>
                <TInput label="City" value={acct.coCity} onChange={v => updAcct("coCity",v)}/>
                <TSelect label="State" value={acct.coState} onChange={v => updAcct("coState",v)} options={US_STATES}/>
              </Row2>
              <div style={{ borderTop:`1px solid ${N.border}`, paddingTop:10 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8, fontFamily:FONT }}>Co-Applicant USA PATRIOT Act</div>
                <Row2>
                  <DateInput label="Date of Birth" value={acct.coDob} onChange={v => updAcct("coDob",v)}/>
                  <SSNInput label="SSN" value={acct.coSsn} onChange={v => updAcct("coSsn",v)}/>
                </Row2>
                <TSelect label="Country of Citizenship" value={acct.coCitizenship} onChange={v => updAcct("coCitizenship",v)} options={["United States","Canada","United Kingdom","Other"]}/>
                <TSelect label="Employment Status" value={acct.coEmploymentStatus} onChange={v => updAcct("coEmploymentStatus",v)} options={["Employed","Self-Employed","Retired","Not Employed"]}/>
                {(acct.coEmploymentStatus === "Employed" || acct.coEmploymentStatus === "Self-Employed") && (
                  <Row2>
                    <TSelect label="Occupation" value={acct.coOccupation} onChange={v => updAcct("coOccupation",v)} options={OCCUPATIONS}/>
                    <TInput label="Employer" value={acct.coEmployer} onChange={v => updAcct("coEmployer",v)}/>
                  </Row2>
                )}
                <DocumentUploader label="Upload Co-Applicant Photo ID" sublabel="Must be current." required={true}
                  accept="image/*,application/pdf" maxFiles={2} maxSizeMB={10} docType="co-applicant-id" files={docs.coApplicantId} onFilesChange={f => setDocFiles("coApplicantId", f)}/>
              </div>
            </div>
          )}
        </SectionCard>
          </>
        )}

        {/* ══ SUB-STEP 4: Account Setup ══ */}
        {subStep === 4 && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.02em" }}>Distribution &amp; Contacts</h1>
              <p style={{ fontSize:15, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6 }}>Tell us where to send distributions and who to contact in an emergency.</p>
            </div>

        {/* ── SECTION 8: Distribution Instructions ── */}
        <SectionCard title="Distribution Instructions" icon={IC.landmark}>
          <RadioGroup label="Distribution Method" name="distMethod" required value={acct.distributionMethod} onChange={v => updAcct("distributionMethod",v)}
            options={[
              { value:"direct_deposit", label:"Direct Deposit", description:"Deposited directly into my bank account" },
              { value:"check_institution", label:"Check to Financial Institution", description:"Sent to my financial institution" },
              { value:"check_investor", label:"Check to Investor", description:"Sent to my address on file" },
            ]}/>
          <InfoCallout>Some sponsors do not issue checks. A representative may contact you if needed.</InfoCallout>
          {(acct.distributionMethod === "direct_deposit" || acct.distributionMethod === "check_institution") && (
            <div style={{ padding:"12px", background:N.bgAlt, borderRadius:8, border:`1px solid ${N.border}`, display:"flex", flexDirection:"column", gap:10 }}>
              <TInput label="Name of Financial Institution" required value={acct.bankName} onChange={v => updAcct("bankName",v)} placeholder="Bank name"/>
              <Row2>
                <TInput label="City" value={acct.bankCity} onChange={v => updAcct("bankCity",v)}/>
                <TSelect label="State" value={acct.bankState} onChange={v => updAcct("bankState",v)} options={US_STATES}/>
              </Row2>
              {acct.distributionMethod === "direct_deposit" && (
                <>
                  <RadioGroup label="Account Type" name="bankAcctType" required value={acct.bankAccountType} onChange={v => updAcct("bankAccountType",v)} options={["Checking Account","Savings Account"]}/>
                  <Row2>
                    <RoutingInput label="Routing / ABA Number" required value={acct.routingNumber} onChange={v => updAcct("routingNumber",v)}/>
                    <TInput label="Account Number" required value={acct.accountNumber} onChange={v => updAcct("accountNumber",v)} placeholder="Account number"/>
                  </Row2>
                </>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 9: Trusted Contact ── */}
        <SectionCard title="Trusted Contact Person (FINRA Rule 2165)" icon={IC.shield}>
          <InfoCallout>By providing a trusted contact, you authorize us to contact them to address possible financial exploitation, confirm your contact information, health status, or legal guardian identity.</InfoCallout>
          <RadioGroup label="Would you like to add a Trusted Contact?" name="tcChoice" required
            value={acct.hasTrustedContact} onChange={v => updAcct("hasTrustedContact",v)}
            options={[{ value:"yes", label:"Yes, I would like to provide a Trusted Contact" },{ value:"no", label:"No, I decline" }]}/>
          {acct.hasTrustedContact === "yes" && (
            <div style={{ padding:"12px", background:N.bgAlt, borderRadius:8, border:`1px solid ${N.border}`, display:"flex", flexDirection:"column", gap:10 }}>
              <Row3>
                <TInput label="First Name" required value={acct.tcFirstName} onChange={v => updAcct("tcFirstName",v)}/>
                <TInput label="Middle Name" value={acct.tcMiddleName} onChange={v => updAcct("tcMiddleName",v)}/>
                <TInput label="Last Name" required value={acct.tcLastName} onChange={v => updAcct("tcLastName",v)}/>
              </Row3>
              <Row2>
                <PhoneInput label="Phone" value={acct.tcMobilePhone} onChange={v => updAcct("tcMobilePhone",v)}/>
                <EmailInput label="Email" value={acct.tcEmail} onChange={v => updAcct("tcEmail",v)}/>
              </Row2>
            </div>
          )}
          {acct.hasTrustedContact === "no" && (
            <InfoCallout type="important">You acknowledge you understand the purpose of this provision and decline to provide such information.</InfoCallout>
          )}
        </SectionCard>
          </>
        )}

        {/* ══ SUB-STEP 5: Suitability ══ */}
        {subStep === 5 && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.02em" }}>Suitability &amp; Experience</h1>
              <p style={{ fontSize:15, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6 }}>A few questions required by FINRA to confirm this investment is appropriate for your situation.</p>
            </div>

        {/* ── SECTION 10: Suitability ── */}
        <SectionCard title="Suitability Information" icon={IC.barChart}>
          {(() => {
            const autoFunding = acct.exchangeBusiness ? "1031 Exchange Proceeds" : "Cash/Savings";
            if (acct.fundingSource !== autoFunding) setTimeout(() => updAcct("fundingSource", autoFunding), 0);
            return (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, fontFamily: FONT, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>How will you fund this account?</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: N.section, borderRadius: 8, border: `1px solid ${N.border}` }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.primary, fontFamily: FONT }}>{autoFunding}</span>
                  <span style={{ fontSize: 10, color: T.muted, fontFamily: FONT }}>· Auto-selected based on your investment type</span>
                </div>
              </div>
            );
          })()}

          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <InfoCallout>
              <strong>Liquidity Needs</strong> — The ability to quickly and easily convert to cash all or a portion of investments without experiencing significant loss in value, lack of a ready market, or significant costs or penalties.
            </InfoCallout>
            <div style={{ marginTop:8 }}>
              <TSelect label="How important is liquidity to you?" required value={acct.liquidityNeeds} onChange={v => updAcct("liquidityNeeds",v)}
                options={["Very Important","Somewhat Important","Not Important"]}/>
            </div>
            <Row2>
              <TInput label="Special Expenses (Large one-time)" value={acct.specialExpenses} onChange={v => updAcct("specialExpenses",v)} placeholder="$0.00" sublabel="Home renovation, medical, education, etc."/>
              <TSelect label="Timeframe for Special Expenses" value={acct.specialExpensesTimeframe} onChange={v => updAcct("specialExpensesTimeframe",v)}
                options={["Less than 1 Year","1-3 Years","3-5 Years","5-10 Years","Over 10 Years"]}/>
            </Row2>
          </div>

          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <FormField label="Investment Objectives (Select all that apply)">
              {INVESTMENT_OBJECTIVES.map(obj => (
                <CheckBox key={obj}
                  checked={(acct.investmentObjectives || []).includes(obj)}
                  onChange={v => {
                    const cur = acct.investmentObjectives || [];
                    updAcct("investmentObjectives", v ? [...cur, obj] : cur.filter(x => x !== obj));
                  }}
                  label={obj}
                />
              ))}
            </FormField>
          </div>

          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <TSelect label="Investment Time Horizon" required value={acct.timeHorizon} onChange={v => updAcct("timeHorizon",v)}
              options={["0-3 Years","3-5 Years","5-10 Years","11-20 Years","Over 20 Years"]}
              sublabel="Expected investment period to achieve your financial goals"
            />
          </div>

          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <InfoCallout>Investing involves risk. The higher the expected returns, the greater the risk that you could lose most of your investment.</InfoCallout>
            <div style={{ marginTop:8 }}>
              <RadioGroup label="Investment Risk Tolerance" name="riskTol" required
                value={acct.riskTolerance} onChange={v => updAcct("riskTolerance",v)}
                options={[
                  { value:"moderate_aggressive", label:"Moderate Aggressive", description:"I am willing to accept high risk to my initial principal, including high volatility, to seek high returns over time, and understand I could lose a substantial amount of money invested." },
                  { value:"significant", label:"Significant Risk", description:"I am willing to accept maximum risk to my initial principal to aggressively seek maximum returns, and understand I could lose most, or all, of the money invested." },
                ]}
              />
              <InfoCallout type="warning">
                Conservative, Moderately Conservative, or Moderate — Due to the limited nature of our business, we do not offer investments that fall into these categories. Please discuss with your registered representative.
              </InfoCallout>
            </div>
          </div>
        </SectionCard>

        {/* ── SECTION 11: Investment Experience ── */}
        <SectionCard title="Investment Experience" icon={IC.lightbulb} collapsible defaultOpen={true}>
          <div style={{ marginBottom:4 }}>
            <div style={{ fontSize:12, fontWeight:700, color:T.body, fontFamily:FONT, marginBottom:10 }}>Primary Applicant — Investment Experience</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign:"left", fontSize:11, fontWeight:700, color:T.muted, padding:"6px 8px", borderBottom:`1px solid ${N.border}`, fontFamily:FONT }}>Investment Type</th>
                    {["0 yrs","1–5 yrs","5+ yrs"].map(h => (
                      <th key={h} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:T.muted, padding:"6px 12px", borderBottom:`1px solid ${N.border}`, fontFamily:FONT, width:80 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVESTMENT_TYPES.map(inv => {
                    const val = (acct.primaryExperience || {})[inv] || "";
                    return (
                      <tr key={inv} style={{ borderBottom:`1px solid ${N.divider}` }}>
                        <td style={{ fontSize:13, color:T.primary, padding:"8px 8px", fontFamily:FONT }}>{inv}</td>
                        {["0","1-5","5+"].map(opt => (
                          <td key={opt} style={{ textAlign:"center", padding:"8px 12px" }}>
                            <div onClick={() => { const cur = acct.primaryExperience || {}; updAcct("primaryExperience", { ...cur, [inv]: opt }); }} style={{
                              width:56, height:30, margin:"0 auto", borderRadius:6, cursor:"pointer",
                              border:`1.5px solid ${val === opt ? G.forest : N.border}`,
                              background: val === opt ? G.mint : N.section,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:11, fontWeight: val === opt ? 700 : 400,
                              color: val === opt ? G.forest : T.muted, transition:"all 0.15s",
                            }}>{opt}</div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {acct.hasCoApplicant && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:T.body, fontFamily:FONT, marginBottom:10 }}>Co-Applicant — Investment Experience</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign:"left", fontSize:11, fontWeight:700, color:T.muted, padding:"6px 8px", borderBottom:`1px solid ${N.border}`, fontFamily:FONT }}>Investment Type</th>
                      {["0 yrs","1–5 yrs","5+ yrs"].map(h => (
                        <th key={h} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:T.muted, padding:"6px 12px", borderBottom:`1px solid ${N.border}`, fontFamily:FONT, width:80 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INVESTMENT_TYPES.map(inv => {
                      const val = (acct.coExperience || {})[inv] || "";
                      return (
                        <tr key={inv} style={{ borderBottom:`1px solid ${N.divider}` }}>
                          <td style={{ fontSize:13, color:T.primary, padding:"8px 8px", fontFamily:FONT }}>{inv}</td>
                          {["0","1-5","5+"].map(opt => (
                            <td key={opt} style={{ textAlign:"center", padding:"8px 12px" }}>
                              <div onClick={() => { const cur = acct.coExperience || {}; updAcct("coExperience", { ...cur, [inv]: opt }); }} style={{
                                width:56, height:30, margin:"0 auto", borderRadius:6, cursor:"pointer",
                                border:`1.5px solid ${val === opt ? G.forest : N.border}`,
                                background: val === opt ? G.mint : N.section,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:11, fontWeight: val === opt ? 700 : 400,
                                color: val === opt ? G.forest : T.muted, transition:"all 0.15s",
                              }}>{opt}</div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── SECTION 12: Disclosures & Affiliations ── */}
        <SectionCard title="Disclosures & Affiliations" icon={IC.scale}>
          <RadioGroup label="In the event of disability or emergency, do you have enough insurance and readily available funds (excluding this investment) to take care of all your medical, health-related, and living expenses for a period of one year or more?"
            name="emergencyFunds" required value={acct.emergencyFunds} onChange={v => updAcct("emergencyFunds",v)}
            options={["Yes","No"]}
          />

          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <InfoCallout type="important">
              Investors are cautioned about holding high concentration of net worth in illiquid investments and private placements.
            </InfoCallout>
            <CheckBox checked={acct.concentrationAcknowledged} onChange={v => updAcct("concentrationAcknowledged",v)}
              label="I acknowledge my understanding of the implications of holding private placements and other illiquid investments"
              description="I acknowledge Stax Capital has advised me to consider diversification as opposed to over-concentration."
            />
          </div>

          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            {isSeniorDetected.detected ? (
              <>
                <InfoCallout type="warning" title="Senior Investor Disclosure Required">
                  {isSeniorDetected.ageTriggered && isSeniorDetected.primaryAge !== null && `Primary applicant age: ${isSeniorDetected.primaryAge}. `}
                  {isSeniorDetected.ageTriggered && isSeniorDetected.coAge !== null && isSeniorDetected.coAge >= 60 && `Co-applicant age: ${isSeniorDetected.coAge}. `}
                  {isSeniorDetected.retiredTriggered && "Employment status: Retired. "}
                  FINRA Rule 2165 and NASAA Model Rule require heightened suitability review for investors age 60+, retired, or within five years of retirement.
                </InfoCallout>
                <InfoCallout type="warning">Regulators have heightened scrutiny of suitability issues for senior investors. Please acknowledge all statements below.</InfoCallout>
                <CheckBox checked={acct.seniorAck1} onChange={v => updAcct("seniorAck1",v)}
                  label="I am purchasing this investment for my own account, and I acknowledge that this investment is not liquid. I may not be able to sell this investment and, if I am able to sell, I may receive less than my purchase price."
                />
                <CheckBox checked={acct.seniorAck2} onChange={v => updAcct("seniorAck2",v)}
                  label="I have considered the implications of this investment, should it become part of my estate at my death."
                />
                <CheckBox checked={acct.seniorAck3} onChange={v => updAcct("seniorAck3",v)}
                  label="Regardless of whether I am currently employed or retired, I have adequate sources of income from investments, pensions, savings, and salary to take care of all medical, health-related and living expenses for an extended period."
                />
              </>
            ) : (
              <div style={{ padding:"10px 14px", background:N.section, borderRadius:8, border:`1px solid ${N.border}` }}>
                <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.5 }}>
                  <strong>Senior Investor Disclosure:</strong> This section will automatically appear if any applicant is age 60+ or has employment status of "Retired." No action needed at this time.
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <RadioGroup label="Are you, your spouse, or any immediate family members employed by or associated with the securities industry or a financial services regulator?"
              name="industryAff" required value={acct.industryAffiliated} onChange={v => updAcct("industryAffiliated",v)}
              options={["Yes","No"]}
            />
            {acct.industryAffiliated === "Yes" && (
              <Row2>
                <TInput label="Name of Entity" required value={acct.affiliatedEntity} onChange={v => updAcct("affiliatedEntity",v)} placeholder="Employing entity name"/>
                <TInput label="Relationship" required value={acct.affiliatedRelationship} onChange={v => updAcct("affiliatedRelationship",v)} placeholder="Your relationship to the employed person"/>
              </Row2>
            )}
            <RadioGroup label="Are you, your spouse, or any immediate family members a senior military, governmental, or political official in a non-US country?"
              name="polOff" required value={acct.isPoliticalOfficial} onChange={v => updAcct("isPoliticalOfficial",v)}
              options={["Yes","No"]}
            />
          </div>

          <div style={{ borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <RadioGroup label="Tax Status" name="taxStatus" required
              value={acct.taxStatus} onChange={v => updAcct("taxStatus",v)}
              options={[
                { value:"us_person", label:"U.S. Person", description:"I certify that my taxpayer identification number is correct and I am not subject to backup withholding." },
                { value:"non_resident", label:"Non-Resident Alien", description:"I certify I am not a U.S. person and will submit applicable Form W-8." },
              ]}
            />
            <CheckBox checked={acct.backupWithholding} onChange={v => updAcct("backupWithholding",v)}
              label="I have been notified by the IRS that I am currently subject to backup withholding"
              description="Check this box only if you have been notified by the IRS that you are currently subject to backup withholding."
            />
          </div>
        </SectionCard>
          </>
        )}

        {/* ── Sub-step navigation ── */}
        <div style={{ display:"flex", gap:16, alignItems:"center", marginTop:28 }}>
          <button onClick={handleSubBack} disabled={subStep === 0} style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"8px 16px", height:36, borderRadius:8,
            border:`1px solid ${N.border}`, background:N.card,
            fontSize:14, fontWeight:500, color:T.primary, fontFamily:FONT,
            cursor: subStep === 0 ? "not-allowed" : "pointer",
            opacity: subStep === 0 ? 0.5 : 1,
            boxShadow:"0 1px 2px rgba(0,0,0,0.05)",
          }}>
            ← Back
          </button>
          {!isLastSubStep && (
            <button onClick={handleSubNext} style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"8px 16px", height:36, borderRadius:8,
              border:"none", background:NAVY[600],
              fontSize:14, fontWeight:500, color:T.white, fontFamily:FONT,
              cursor:"pointer",
              boxShadow:"0 1px 2px rgba(0,0,0,0.05)",
            }}>
              Next →
            </button>
          )}
        </div>

          </div>{/* end left col */}

          {/* ── Right: Step summary sidebar ── */}
          {(() => {
            const stepTitle = SUBSTEP_LABELS[subStep];
            const SR = ({ label, value, color }) => (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom:`1px solid ${N.divider}`, gap:8, minHeight:40 }}>
                <span style={{ fontSize:12, color:T.muted, fontFamily:FONT, flexShrink:0 }}>{label}</span>
                <span style={{ fontSize:12, fontWeight:600, color: color || T.primary, fontFamily:FONT, textAlign:"right" }}>{value || "—"}</span>
              </div>
            );
            const SBadge = ({ label, ok }) => (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${N.divider}`, minHeight:40 }}>
                <span style={{ fontSize:12, color:T.muted, fontFamily:FONT }}>{label}</span>
                <span style={{ fontSize:11, fontWeight:700, fontFamily:FONT, padding:"2px 8px", borderRadius:10, marginLeft:8,
                  background: ok ? G.mint : C.errorBg, color: ok ? G.forest : A.red }}>
                  {ok ? "✓ Set" : "Pending"}
                </span>
              </div>
            );

            const registrationLabel = {
              individual:"Individual", jtwros:"Joint (JTWROS)", tenants_common:"Tenants in Common",
              tenants_entirety:"Tenants by Entirety", community_property:"Community Property",
              traditional_ira:"Traditional IRA", roth_ira:"Roth IRA", sep_ira:"SEP IRA", simple_ira:"SIMPLE IRA",
            }[acct.individualType];
            const entityLabel = {
              revocable_trust:"Revocable Trust", irrevocable_trust:"Irrevocable Trust", other_trust:"Other Trust",
              llc:"LLC", corporation:"Corporation", partnership:"Partnership", retirement_plan:"Retirement Plan", other_entity:"Other Entity",
            }[acct.entityType];
            const distLabel = {
              direct_deposit:"Direct Deposit", check_mail:"Check by Mail", check_institution:"Check to Institution", reinvest:"Reinvest",
            }[acct.distributionMethod];

            return (
              <div style={{ width:308, flexShrink:0, position:"sticky", top:90, alignSelf:"flex-start" }}>
                <div style={{ background:N.card, borderRadius:14, border:`1px solid ${N.border}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
                  <div style={{ background: WIDGET_HDR, padding:"16px 18px" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.white, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:FONT }}>{stepTitle}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontFamily:FONT, marginTop:4 }}>Account Opening · Step {subStep + 1} of 6</div>
                  </div>

                  <div style={{ padding:"16px 16px" }}>

                    {subStep === 0 && (<>
                      <SR label="Account Action" value={acct.accountStatus === "open" ? "Open New" : acct.accountStatus === "update" ? "Update Existing" : null}/>
                      <SR label="Registration" value={acct.registrationCategory === "individual" ? "Individual / Joint" : acct.registrationCategory === "entity" ? "Entity" : null}/>
                      <SR label="Type" value={acct.registrationCategory === "individual" ? registrationLabel : entityLabel}/>
                      {acct.registrationCategory === "entity" && acct.entityName && <SR label="Entity Name" value={acct.entityName}/>}
                      <SR label="Accredited" value={acct.accredited} color={acct.accredited === "Yes" ? G.forest : acct.accredited === "No" ? A.red : null}/>
                    </>)}

                    {subStep === 1 && (<>
                      <SR label="Status" value="Accredited Investor" color={G.forest}/>
                      <SR label="Basis" value={acct.accreditedBasis?.replace(/_/g," ")}/>
                      <SR label="Verification" value={acct.accreditedVerifyMethod === "self_cert" ? "Self-Certification" : acct.accreditedVerifyMethod === "third_party" ? "Third Party" : null}/>
                      {fsCalcs.grossInc > 0 && <SR label="Gross Income" value={`$${Math.round(fsCalcs.grossInc / 1000)}K`} color={fsCalcs.meetsIncomeTest ? G.forest : A.red}/>}
                      {fsCalcs.netWorthExRes > 0 && <SR label="NW ex-Res" value={`$${Math.round(fsCalcs.netWorthExRes / 1000)}K`} color={fsCalcs.meetsNwTest ? G.forest : A.red}/>}
                    </>)}

                    {subStep === 2 && (<>
                      <SR label="Name" value={[acct.firstName, acct.lastName].filter(Boolean).join(" ")}/>
                      <SR label="Email" value={acct.email}/>
                      <SR label="Phone" value={acct.phone}/>
                      <SR label="City / State" value={[acct.city, acct.state].filter(Boolean).join(", ")}/>
                      <SR label="Employment" value={acct.employmentStatus}/>
                      {acct.occupation && <SR label="Occupation" value={acct.occupation}/>}
                    </>)}

                    {subStep === 3 && (<>
                      <SR label="Date of Birth" value={acct.dob}/>
                      <SR label="SSN" value={acct.ssn ? "••• - •• - " + String(acct.ssn).replace(/\D/g,"").slice(-4) : null}/>
                      <SR label="Citizenship" value={acct.citizenship}/>
                      <SR label="ID Type" value={acct.idType}/>
                      <SR label="ID Expiry" value={acct.idExpiry}/>
                      <SBadge label="Photo ID Uploaded" ok={(docs.primaryId || []).length > 0}/>
                      <SR label="Household" value={acct.householdStatus}/>
                      {acct.hasCoApplicant && <SR label="Co-Applicant" value={[acct.coFirstName, acct.coLastName].filter(Boolean).join(" ")}/>}
                    </>)}

                    {subStep === 4 && (<>
                      <SR label="Distribution" value={distLabel}/>
                      {acct.bankName && <SR label="Bank" value={acct.bankName}/>}
                      {acct.bankAccountType && <SR label="Account Type" value={acct.bankAccountType}/>}
                      <SR label="Trusted Contact" value={acct.hasTrustedContact === "yes" ? [acct.tcFirstName, acct.tcLastName].filter(Boolean).join(" ") : acct.hasTrustedContact === "no" ? "Declined" : null}/>
                    </>)}

                    {subStep === 5 && (<>
                      <SR label="Risk Tolerance" value={acct.riskTolerance?.replace(/_/g," ")}/>
                      <SR label="Time Horizon" value={acct.timeHorizon}/>
                      <SR label="Liquidity Needs" value={acct.liquidityNeeds}/>
                      <SR label="Tax Status" value={acct.taxStatus === "us_person" ? "U.S. Person" : acct.taxStatus === "non_resident" ? "Non-Resident Alien" : null}/>
                      <SR label="Emergency Funds" value={acct.emergencyFunds}/>
                      <SR label="Industry Affiliation" value={acct.industryAffiliated}/>
                    </>)}

                  </div>
                </div>
              </div>
            );
          })()}

        </div>{/* end two-col */}

      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     STEP 4 — DISCLOSURE & ACKNOWLEDGMENT
     ══════════════════════════════════════════════════════ */
  const DisclosureStep = () => {
    const isAllAcked = allDiscChecked;
    const handleBulkAck = (v) => {
      if (v) { Object.keys(disc).forEach(k => updDisc(k, true)); }
      else    { Object.keys(disc).forEach(k => updDisc(k, false)); }
    };

    /* Interactive checkbox row — clicking anywhere toggles the disc key */
    const DiscItem = ({ discKey, label, description }) => {
      const checked = disc[discKey];
      return (
        <div
          onClick={() => updDisc(discKey, !checked)}
          style={{
            display:"flex", alignItems:"flex-start", gap:12,
            padding:"14px 16px",
            background:N.bgAlt,
            border:`1px solid ${N.border}`,
            borderRadius:14,
            cursor:"pointer",
            userSelect:"none",
          }}
        >
          <div style={{
            width:18, height:18, borderRadius:4, flexShrink:0, marginTop:2,
            border:`1.5px solid ${checked ? "#326b52" : "#c4c9d4"}`,
            background: checked ? "#326b52" : "#ffffff",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.15s",
            boxShadow:"0 1px 2px rgba(0,0,0,0.07)",
          }}>
            {checked && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L3.8 7.5L8.5 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, lineHeight:1.4 }}>{label}</div>
            {description && <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.5, marginTop:3 }}>{description}</div>}
          </div>
        </div>
      );
    };

    return (
      <div style={{ maxWidth:820, margin:"0 auto" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:24, fontWeight:600, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.01em" }}>Almost There — A Few Important Acknowledgements</h1>
          <p style={{ fontSize:14, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6, maxWidth:640 }}>
            These disclosures are required by federal securities law and help ensure you understand key risks and considerations. Review each section, then confirm all acknowledgements with a single action at the bottom of this page.
          </p>
        </div>

        <SectionCard title="Investor Representations & Agreements" icon={IC.file}>
          <p style={{ fontSize:12, color:T.primary, fontFamily:FONT, lineHeight:1.8, margin:"0 0 12px" }}>
            As Purchaser, I have reviewed all Offering Materials, fully understand the terms and conditions including that the Investment is highly speculative and involves substantial risks. I have discussed the Investment with my independent legal, tax and investment advisors. I fully understand Stax Capital cannot make any guarantees regarding the security or safety of my principal, cash flow distributions or other performance factors.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <DiscItem discKey="materialReviewed" label="I have reviewed all Offering Materials and consulted independent advisors"
              description="I acknowledge all inquiries have been answered satisfactorily and I am prepared to invest based on my own due diligence."/>
            <DiscItem discKey="offering" label="I understand the Investment is highly speculative"
              description="The Investment involves substantial risks including the possible loss of my entire invested capital."/>
          </div>
        </SectionCard>

        <SectionCard title="Illiquidity & Risk Acknowledgment" icon={IC.lock}>
          <p style={{ fontSize:12, color:T.primary, fontFamily:FONT, lineHeight:1.8, margin:"0 0 12px" }}>
            DST investments are illiquid with no secondary market. Investors may not be able to sell their investment and, if able to sell, may receive less than the purchase price. There is no guarantee of distributions, return of principal, or investment performance.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <DiscItem discKey="illiquidity" label="I understand this investment is illiquid with limited or no opportunity to sell"
              description="If I am able to sell, such sale may be at a substantial discount to the purchase price."/>
            <DiscItem discKey="risk" label="I am not financially dependent on receiving distributions from this investment"
              description="I can hold for an indefinite period, withstand reductions in distributions, and withstand a complete loss."/>
            <DiscItem discKey="noGuarantee" label="I understand Stax Capital makes no guarantees regarding investment performance"
              description="Due diligence efforts by Stax Capital do not guarantee performance. Red flags or risks may have gone undiscovered."/>
          </div>
        </SectionCard>

        <SectionCard title="1031 Exchange Transaction Acknowledgment" icon={IC.refreshCw}>
          <p style={{ fontSize:12, color:T.primary, fontFamily:FONT, lineHeight:1.8, margin:"0 0 12px" }}>
            1031 Exchange Investors acknowledge that the IRS or state authorities may challenge the ability to defer taxes, and in the event of foreclosure or other sale, the Purchaser may be subject to additional taxation.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <DiscItem discKey="exchange1031" label="I acknowledge 1031 exchange tax deferral may be challenged by the IRS"
              description="I have knowledge and experience in financial and business matters to evaluate the merits and risks of this transaction."/>
          </div>
        </SectionCard>

        <SectionCard title="Concentration Understanding & Acceptance" icon={IC.scale}>
          <p style={{ fontSize:12, color:T.primary, fontFamily:FONT, lineHeight:1.8, margin:"0 0 12px" }}>
            Investors are cautioned about holding high concentration of net worth in illiquid investments and private placements. I have discussed the concept of over-concentration risk with Stax Capital and have been advised of the additional risk.
          </p>
          {fsCalcs.postConReSec > 50 && (
            <div style={{ marginBottom:10 }}>
              <FlagAlert type="warn" msg={`Your post-investment RE securities concentration is ${fsCalcs.postConReSec.toFixed(1)}% — exceeds the 50% concentration threshold. Enhanced review required.`}/>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <DiscItem discKey="concentration" label="I have reviewed my pre and post-investment concentration and accept the risk"
              description="I acknowledge Stax Capital has advised me to consider diversification. I am electing to proceed based on my own determination of suitability."/>
          </div>
        </SectionCard>

        <SectionCard title="Additional Debt Considerations" icon={IC.creditCard}>
          <p style={{ fontSize:12, color:T.primary, fontFamily:FONT, lineHeight:1.8, margin:"0 0 12px" }}>
            The contemplated investment may have debt that exceeds the amount of debt retired at sale. I understand additional debt risk and have discussed these risks with Stax Capital and my own independent advisors.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <DiscItem discKey="additionalDebt" label="I understand and accept the additional debt considerations"
              description="I acknowledge debt replacement requirements under IRC Section 1031 and accept the financing-related risk."/>
          </div>
        </SectionCard>

        <SectionCard title="Customer Acknowledgments" icon={IC.edit}>
          <p style={{ fontSize:12, color:T.primary, fontFamily:FONT, lineHeight:1.8, margin:"0 0 12px" }}>
            All investments carry risk of loss of principal and/or purchasing power. Neither Stax Capital, Inc. nor its Registered Representative can make or fulfill a guarantee of a return on or of my principal. Historical performance data is not indicative of future results. Stax Capital and its Representative receive commissions and/or fees as a result of the business I conduct with my Representative.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <DiscItem discKey="arbitration" label="I acknowledge and accept all customer terms, disclosures, and the pre-dispute arbitration agreement"
              description="I recognize that this Agreement contains a Pre-Dispute Arbitration Agreement and other provisions affecting my rights. I may contact Stax Capital Compliance at 844-427-1031."/>
            <DiscItem discKey="independentAdvice" label="I have sought independent legal, tax, and investment advice"
              description="I expected my representative to present investment alternatives, but reserve the right to decide whether to proceed with any investment."/>
          </div>
        </SectionCard>

        <SectionCard title="Regulatory Documents & E-SIGN Consent" icon={IC.fileText}>
          <p style={{ fontSize:12, color:T.primary, fontFamily:FONT, lineHeight:1.8, margin:"0 0 12px" }}>
            Federal and state securities regulations require that you acknowledge receipt of certain regulatory documents before investing. These documents describe Stax Capital's services, conflicts of interest, fees, and your rights as an investor. You must also consent to electronic signatures and electronic delivery of documents.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <DiscItem discKey="formCRS" label="I acknowledge receipt of Stax Capital's Form CRS (Customer Relationship Summary)"
              description="Form CRS is a brief summary of the services offered, fees and costs, conflicts of interest, legal standard of conduct, and disciplinary history of Stax Capital, Inc. as required by SEC Rule 17a-14."/>
            <DiscItem discKey="regBI" label="I acknowledge receipt of the Regulation Best Interest Disclosure Document"
              description="The Reg BI Disclosure describes Stax Capital's obligation to act in your best interest when making a recommendation and the scope of services provided."/>
            <DiscItem discKey="privacy" label="I have received and reviewed Stax Capital's Privacy Policy"
              description="Stax Capital collects personal information necessary to open and service your account. We do not disclose nonpublic personal information except as required or permitted by law."/>
            <DiscItem discKey="brokerCheck" label="I acknowledge that I may verify my representative's background via FINRA BrokerCheck"
              description="FINRA BrokerCheck (brokercheck.finra.org) allows you to review the professional background, registration status, and disciplinary history of your registered representative."/>
            <DiscItem discKey="esign" label="I consent to electronic signatures and electronic delivery of all account documents"
              description="Per the E-SIGN Act and UETA, I consent to receive all account-related documents electronically. My electronic signature has the same legal effect as a handwritten signature."/>
          </div>
        </SectionCard>

        {/* ── Bulk Acknowledgment Card ── */}
        <div
          onClick={() => handleBulkAck(!isAllAcked)}
          style={{
            marginTop:8,
            padding:"18px 20px",
            background: isAllAcked ? "#f0fdf4" : "#ffffff",
            borderRadius:10,
            border:`2px solid ${isAllAcked ? "#326b52" : "#2b3749"}`,
            cursor:"pointer",
            userSelect:"none",
          }}
        >
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {/* Checkbox */}
              <div style={{
                width:22, height:22, borderRadius:6, flexShrink:0,
                border:`2px solid ${isAllAcked ? "#326b52" : "#2b3749"}`,
                background: isAllAcked ? "#326b52" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.15s",
              }}>
                {isAllAcked && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5L5.2 10L11 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:T.primary, fontFamily:FONT }}>
                All Disclosures Acknowledged
              </div>
            </div>
            {isAllAcked && (
              <div style={{
                fontSize:11, fontWeight:700, fontFamily:FONT,
                color:C.success,
                background:"rgba(50,107,82,0.1)",
                padding:"2px 10px", borderRadius:20,
              }}>
                100%
              </div>
            )}
          </div>
          <div style={{ fontSize:12, color: isAllAcked ? "#326b52" : T.body, fontFamily:FONT, lineHeight:1.5, marginTop:10, paddingLeft:36 }}>
            {isAllAcked
              ? "You have completed all required disclosures. You may now proceed to the Review & Sign step to finalize your subscription."
              : "By checking this box, I confirm that I have read, understood, and agree to all disclosures and acknowledgements listed above. All acknowledgments are mandatory per FINRA Rule 5123 and Regulation Best Interest."}
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     STEP 5 — REVIEW & SIGN (Comprehensive Final Review)
     ══════════════════════════════════════════════════════ */
  const ReviewStep = () => {
    const blockFlags = compFlags.filter(f => f.type === "block");
    const warnFlags  = compFlags.filter(f => f.type === "warn");
    const infoFlags  = compFlags.filter(f => f.type === "flag");
    const allDiscAcked = Object.values(disc).every(Boolean);
    const nowStr     = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" });

    /* ── Compliance Flag Acceptance Logic ── */
    const nonBlockFlags = [...warnFlags, ...infoFlags];
    const requiresFlagAcceptance = nonBlockFlags.length > 0;
    const allFlagsAcked = requiresFlagAcceptance
      ? nonBlockFlags.every(f => flagAcks[f.id]) && flagHoldHarmless && flagSig.trim().length > 2
      : true;
    const canSubmit = !blockFlags.length && sig.primary.trim().length > 2 && allDiscAcked && allFlagsAcked;

    /* Handle "agree all" toggle */
    const handleAgreeAll = (val) => {
      setAgreeAll(val);
      if (val) { Object.keys(disc).forEach(k => updDisc(k, true)); }
    };

    /* ═══════════════════════════════════════════
       PDF Generation — Account Opening Package
       ═══════════════════════════════════════════ */
    const generatePDF = () => {
      const fullName = [acct.title, acct.firstName, acct.middleName, acct.lastName].filter(Boolean).join(" ") || "—";
      const fullAddr = [acct.street, acct.city, acct.state && acct.zip ? `${acct.state} ${acct.zip}` : (acct.state || acct.zip), acct.country].filter(Boolean).join(", ") || "—";
      const mailingAddr = acct.hasDiffMailing ? [acct.mailingStreet, acct.mailingCity, acct.mailingState, acct.mailingZip].filter(Boolean).join(", ") : "Same as residential";
      const fmtA = n => `$${Math.round(n).toLocaleString()}`;
      const adjBasis = acct.rp_originalPurchasePrice + acct.rp_improvements - acct.rp_accumulatedDepreciation;
      const realizedGain = Math.max(0, (acct.rp_salePrice - acct.rp_sellingExpenses) - adjBasis);
      const nowDate = new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});
      const acctTypeLabel = acct.registrationCategory === "entity" ? `Entity — ${(acct.entityType||"").replace(/_/g," ")}` : `Individual — ${(acct.individualType||"individual").replace(/_/g," ")}`;
      const avgYield = cartTotal > 0 ? cartItems.reduce((s,item) => s + item.cashOnCash * cart[item.id], 0) / cartTotal : 0;

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Stax Capital — Account Opening Package</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', sans-serif;
  color: #0A0A0A;
  font-size: 10px;
  line-height: 1.5;
  background: #fff;
}
.page {
  max-width: 820px;
  margin: 0 auto;
  padding: 36px 44px;
}
.hdr {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 3px solid #1B5E3B;
  margin-bottom: 20px;
}
.logo { display: flex; align-items: center; gap: 10px; }
.hdr-r { text-align: right; font-size: 9px; color: #6B7280; }
.hdr-r strong { color: #0F3D25; }
h1 { font-size: 17px; font-weight: 700; color: #0F3D25; margin-bottom: 3px; }
h2 {
  font-size: 12px; font-weight: 700; color: #0F3D25;
  margin: 22px 0 8px; padding: 5px 10px;
  background: #F0FDF4; border-left: 3px solid #1B5E3B;
  border-radius: 0 4px 4px 0;
}
h3 { font-size: 11px; font-weight: 700; color: #374151; margin: 12px 0 5px; }
.sub { font-size: 10px; color: #6B7280; margin-bottom: 16px; line-height: 1.7; }
table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 9.5px; }
td { padding: 4px 8px; border-bottom: 1px solid #F3F4F6; }
td.l { color: #6B7280; width: 36%; }
td.v { color: #0A0A0A; font-weight: 500; }
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
.g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.cb { padding: 10px 14px; border-radius: 8px; font-size: 9.5px; line-height: 1.7; margin: 6px 0; }
.cb-r { background: #FEF2F2; border: 1px solid #FECACA; color: #7F1D1D; }
.cb-a { background: #FFFBEB; border: 1px solid #FDE68A; color: #78350F; }
.cb-g { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; }
.cb-b { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; }
.inv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; }
.inv-c { padding: 10px 14px; border-radius: 8px; border: 1px solid #E5E7EB; }
.inv-n { font-size: 10px; font-weight: 600; color: #374151; }
.inv-a { font-size: 14px; font-weight: 700; color: #1B5E3B; margin-top: 2px; }
.inv-d { font-size: 8px; color: #6B7280; margin-top: 2px; }
.metric-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0; }
.metric { text-align: center; padding: 10px; background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB; }
.metric-l { font-size: 7.5px; color: #6B7280; text-transform: uppercase; letter-spacing: .5px; }
.metric-v { font-size: 15px; font-weight: 700; margin-top: 2px; }
.disc-row { display: flex; gap: 8px; padding: 5px 0; border-bottom: 1px solid #F3F4F6; font-size: 9.5px; line-height: 1.5; }
.disc-chk { color: #1B5E3B; font-weight: 700; flex-shrink: 0; }
.agr {
  padding: 12px 16px; background: #FAFBFC;
  border: 1px solid #E5E7EB; border-radius: 8px;
  margin: 8px 0; font-size: 9px; line-height: 1.8; color: #374151;
}
.agr-title { font-size: 10px; font-weight: 700; color: #0F3D25; margin-bottom: 4px; }
.sig-b {
  margin-top: 16px; padding: 14px 18px;
  background: #F9FAFB; border-radius: 10px;
  border: 1px solid #E5E7EB;
}
.sig-l {
  border-bottom: 2px solid #1B5E3B;
  padding: 8px 0;
  font-family: Georgia, serif;
  font-size: 22px; font-style: italic;
  color: #0F3D25; min-height: 36px;
}
.sig-d { text-align: right; font-size: 8px; color: #9CA3AF; margin-top: 3px; }
.ftr {
  margin-top: 24px; padding-top: 14px;
  border-top: 2px solid #1B5E3B;
  text-align: center;
}
.ftr-b { font-size: 8px; font-weight: 600; letter-spacing: 3px; color: #0F3D25; text-transform: uppercase; margin-bottom: 3px; }
.ftr-a { font-size: 8.5px; color: #6B7280; margin-bottom: 3px; }
.ftr-l { font-size: 7.5px; color: #9CA3AF; line-height: 1.6; }
.pb { page-break-before: always; }
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { padding: 20px 28px; }
  h2 { break-after: avoid; }
  .sig-b { break-inside: avoid; }
}
</style></head><body>
<div class="page">
<div class="hdr">
  <div class="logo" style="align-items:center;">
    <div style="background:linear-gradient(135deg,#0F3D25 0%,#1B5E3B 100%);border-radius:9px;padding:7px 18px;display:flex;align-items:center;">
      <img src="${STAX_AI_LOGO}" alt="Stax AI" style="width:110px;height:27px;object-fit:contain;display:block;"/>
    </div>
    <div style="margin-left:10px;">
      <div style="font-size:7px;color:#6B7280;letter-spacing:1px;text-transform:uppercase;">Member FINRA &amp; SIPC</div>
    </div>
  </div>
  <div class="hdr-r">
    <div><strong>DST Investment Account Opening Package</strong></div>
    <div>Application Ref: <strong>${confRef.current}</strong></div>
    <div>${nowDate}</div>
  </div>
</div>
<h1>Account Opening Package</h1>
<p class="sub">This document constitutes the complete account opening package for the investor(s) identified below. It contains a summary of all information submitted, investment selections, financial profile, applicable agreements and disclosures, and electronically obtained signatures. Retain this document for your records.</p>
<h2>I. Investment Selections</h2>
<div class="inv-grid">
  ${cartItems.map(item => `<div class="inv-c"><div class="inv-n">${item.name}</div><div class="inv-a">${fmtA(cart[item.id])}</div><div class="inv-d">${item.location} · ${item.propertyTypeShort} · ${item.cashOnCash}% Cash-on-Cash</div></div>`).join("")}
</div>
<div class="metric-row">
  <div class="metric"><div class="metric-l">Total Investment</div><div class="metric-v" style="color:#1B5E3B">${fmtA(cartTotal)}</div></div>
  <div class="metric"><div class="metric-l">Properties</div><div class="metric-v" style="color:#0F3D25">${cartCount}</div></div>
  <div class="metric"><div class="metric-l">Wtd Avg Yield</div><div class="metric-v" style="color:#0F3D25">${avgYield.toFixed(2)}%</div></div>
  <div class="metric"><div class="metric-l">Est. Annual Cash Flow</div><div class="metric-v" style="color:#1B5E3B">${fmtA(Math.round(cartTotal * avgYield / 100))}</div></div>
</div>
<h2>II. Account Information</h2>
<div class="g2">
  <table>
    <tr><td class="l">Account Status</td><td class="v">${acct.accountStatus === "open" ? "New Account" : "Update Existing"}</td></tr>
    <tr><td class="l">Transaction Type</td><td class="v">${acct.exchangeBusiness ? "1031 Exchange" : "Direct Investment"}</td></tr>
    <tr><td class="l">Registration</td><td class="v">${acctTypeLabel}</td></tr>
    <tr><td class="l">Account Holder</td><td class="v">${fullName}</td></tr>
    <tr><td class="l">Date of Birth</td><td class="v">${acct.dob || "—"}</td></tr>
    <tr><td class="l">SSN / TIN</td><td class="v">${acct.ssn ? "●●●-●●-" + acct.ssn.slice(-4) : "—"}</td></tr>
    <tr><td class="l">Citizenship</td><td class="v">${acct.citizenship || "U.S. Citizen"}</td></tr>
  </table>
  <table>
    <tr><td class="l">Email</td><td class="v">${acct.email || "—"}</td></tr>
    <tr><td class="l">Phone</td><td class="v">${acct.phone || "—"}</td></tr>
    <tr><td class="l">Residential Address</td><td class="v">${fullAddr}</td></tr>
    <tr><td class="l">Mailing Address</td><td class="v">${mailingAddr}</td></tr>
    <tr><td class="l">Employment</td><td class="v">${acct.employmentStatus || "—"} ${acct.employer ? "— " + acct.employer : ""}</td></tr>
    <tr><td class="l">Accredited Investor</td><td class="v">${acct.accredited || "—"} ${acct.accreditedBasis ? "(" + acct.accreditedBasis.replace(/_/g," ") + ")" : ""}</td></tr>
    <tr><td class="l">Risk Tolerance</td><td class="v">${(acct.riskTolerance||"—").replace(/_/g," ")}</td></tr>
  </table>
</div>
${acct.registrationCategory === "entity" ? `
<h3>Entity Details</h3>
<div class="g2">
  <table>
    <tr><td class="l">Entity Name</td><td class="v">${acct.entityName || "—"}</td></tr>
    <tr><td class="l">Entity Type</td><td class="v">${(acct.entityType||"—").replace(/_/g," ")}</td></tr>
  </table>
  <table>
    <tr><td class="l">State of Formation</td><td class="v">${acct.entityStateOfFormation || "—"}</td></tr>
    <tr><td class="l">EIN</td><td class="v">${acct.entityEin ? "●●-●●●" + acct.entityEin.slice(-4) : "—"}</td></tr>
  </table>
</div>` : ""}

<!-- ═══ FINANCIAL SUMMARY ═══ -->
<h2>III. Financial Summary</h2>
<div class="g2">
  <table>
    <tr><td class="l">Total Assets</td><td class="v">${fmtA(fsCalcs.totalAssets)}</td></tr>
    <tr><td class="l">Total Liabilities</td><td class="v">${fmtA(fsCalcs.totalLiab)}</td></tr>
    <tr><td class="l">Net Worth</td><td class="v" style="font-weight:700">${fmtA(fsCalcs.netWorth)}</td></tr>
    <tr><td class="l">NW ex-Primary Residence</td><td class="v" style="font-weight:700;color:#1B5E3B">${fmtA(fsCalcs.netWorthExRes)}</td></tr>
  </table>
  <table>
    <tr><td class="l">Liquid Assets</td><td class="v">${fmtA(fsCalcs.totalLiquid)}</td></tr>
    <tr><td class="l">Gross Annual Income</td><td class="v">${fmtA(fsCalcs.grossInc)}</td></tr>
    <tr><td class="l">Time Horizon</td><td class="v">${(acct.timeHorizon||"—").replace(/_/g," ")}</td></tr>
    <tr><td class="l">Investment Objectives</td><td class="v">${(acct.investmentObjectives||[]).map(o => o.replace(/_/g," ")).join(", ") || "—"}</td></tr>
  </table>
</div>
${acct.exchangeBusiness ? `
<!-- ═══ 1031 EXCHANGE ═══ -->
<h2>IV. 1031 Exchange Information</h2>
<div class="cb cb-r"><strong>TAX ADVICE DISCLAIMER:</strong> Stax Capital, Inc. does not provide tax, legal, or accounting advice. Any tax liability estimates herein are for informational purposes only. Consult a qualified tax professional for advice specific to your situation.</div>
<h3>Relinquished Property</h3>
<div class="g2">
  <table>
    <tr><td class="l">Property Address</td><td class="v">${[acct.rp_address, acct.rp_city, acct.rp_state, acct.rp_zip].filter(Boolean).join(", ") || "—"}</td></tr>
    <tr><td class="l">Property Type</td><td class="v">${(acct.rp_propertyType||"—").replace(/_/g," ")}</td></tr>
    <tr><td class="l">Date of Sale</td><td class="v">${acct.rp_dateOfSale || "—"}</td></tr>
    <tr><td class="l">Sale Price</td><td class="v">${acct.rp_salePrice ? fmtA(acct.rp_salePrice) : "—"}</td></tr>
    <tr><td class="l">Adjusted Cost Basis</td><td class="v">${fmtA(adjBasis)}</td></tr>
  </table>
  <table>
    <tr><td class="l">Original Purchase Price</td><td class="v">${acct.rp_originalPurchasePrice ? fmtA(acct.rp_originalPurchasePrice) : "—"}</td></tr>
    <tr><td class="l">Accum. Depreciation</td><td class="v">${acct.rp_accumulatedDepreciation ? fmtA(acct.rp_accumulatedDepreciation) : "—"}</td></tr>
    <tr><td class="l">Estimated Taxable Gain</td><td class="v" style="color:#DC2626">${realizedGain > 0 ? fmtA(realizedGain) : "—"}</td></tr>
    <tr><td class="l">Est. Tax Liability</td><td class="v" style="color:#DC2626;font-weight:700">${typeof acct.estimatedTaxLiability === "number" && acct.estimatedTaxLiability > 0 ? fmtA(acct.estimatedTaxLiability) : "—"}</td></tr>
    <tr><td class="l">Tax Impact on Risk</td><td class="v">${(acct.taxImpactOnRisk||"—").replace(/_/g," ")}</td></tr>
  </table>
</div>
<h3>Debt Replacement Analysis</h3>
<table>
  <tr><td class="l">Debt Retired at Sale</td><td class="v">${fmtA(acct.rp_debtRetired||acct.rp_existingMortgage||0)}</td></tr>
  <tr><td class="l">Replacement Debt (DST)</td><td class="v">${fmtA(acct.replacementDebt||0)}</td></tr>
  <tr><td class="l">Boot / Shortfall</td><td class="v" style="color:${(acct.replacementDebt||0) >= (acct.rp_debtRetired||acct.rp_existingMortgage||0) ? '#059669' : '#DC2626'}">${(acct.replacementDebt||0) >= (acct.rp_debtRetired||acct.rp_existingMortgage||0) ? "None — Debt fully replaced" : fmtA(Math.max(0, (acct.rp_debtRetired||acct.rp_existingMortgage||0) - (acct.replacementDebt||0))) + " (potential taxable mortgage boot)"}</td></tr>
</table>
<h3>Qualified Intermediary</h3>
<div class="g2">
  <table>
    <tr><td class="l">QI Contact</td><td class="v">${acct.qiContactName || "—"}</td></tr>
    <tr><td class="l">QI Company</td><td class="v">${acct.qiCompany || "—"}</td></tr>
  </table>
  <table>
    <tr><td class="l">QI Email</td><td class="v">${acct.qiEmail || "—"}</td></tr>
    <tr><td class="l">Exchange #</td><td class="v">${acct.qiExchangeNumber || "—"}</td></tr>
  </table>
</div>
` : ""}
<!-- ═══ DISTRIBUTION INSTRUCTIONS ═══ -->
<h2>${acct.exchangeBusiness ? "V" : "IV"}. Distribution Instructions</h2>
<table>
  <tr><td class="l">Bank Name</td><td class="v">${acct.bankName || "—"}</td></tr>
  <tr><td class="l">Routing Number</td><td class="v">${acct.routingNumber ? "●●●●" + acct.routingNumber.slice(-4) : "—"}</td></tr>
  <tr><td class="l">Account Number</td><td class="v">${acct.bankAccountNumber ? "●●●●" + acct.bankAccountNumber.slice(-4) : "—"}</td></tr>
  <tr><td class="l">Account Type</td><td class="v">${acct.bankAccountType || "—"}</td></tr>
</table>

<!-- ═══ DISCLOSURES & ACKNOWLEDGMENTS ═══ -->
<h2 class="pb">${acct.exchangeBusiness ? "VI" : "V"}. Disclosure Acknowledgments</h2>
<p style="font-size:9px;color:#6B7280;margin-bottom:10px;line-height:1.7">The investor has reviewed and electronically acknowledged each of the following required disclosures. A checkmark (✓) indicates the disclosure was acknowledged; a cross (✗) indicates it was not acknowledged at the time of submission.</p>
<div>
  ${Object.entries(disc).map(([k,v]) => {
    const labels = {
      materialReviewed:"I have reviewed all Offering Materials (Private Placement Memorandum, Subscription Agreement, Limited Partnership Agreement, and/or Trust Agreement) and consulted with my own independent legal, tax, and financial advisors.",
      offering:"I understand that this investment is highly speculative and involves a substantial degree of risk, including the possible loss of my entire investment.",
      illiquidity:"I understand that this investment is illiquid, there is no public market for the securities, and I may not be able to sell or transfer my interest.",
      risk:"I am not financially dependent on the distributions from this investment and have adequate liquid reserves to meet my obligations.",
      noGuarantee:"I understand that there are no guarantees regarding investment performance, cash distributions, or tax benefits, and that past performance is not indicative of future results.",
      exchange1031:"I understand that 1031 exchange tax deferral treatment may be challenged by the IRS, and that I should consult with a qualified tax advisor regarding the tax consequences of this investment.",
      concentration:"I have reviewed the concentration levels of alternative investments in my portfolio and accept the associated risks of investing in illiquid securities.",
      additionalDebt:"I understand the additional debt considerations, including the risks associated with leveraged investments and the potential for capital calls.",
      arbitration:"I have read and agree to the Client Account Agreement, including the Pre-Dispute Arbitration clause, and understand that by agreeing to arbitration I am waiving my right to seek remedies in court.",
      independentAdvice:"I have been advised to seek independent legal, tax, and investment advice before making this investment decision.",
      formCRS:"I acknowledge receipt of Stax Capital's Form CRS (Customer Relationship Summary) as required by SEC Rule 17a-14.",
      regBI:"I acknowledge receipt of Stax Capital's Regulation Best Interest Disclosure Document.",
      privacy:"I have received and reviewed Stax Capital's Privacy Policy and understand how my personal information is used.",
      brokerCheck:"I acknowledge that I may verify my representative's background via FINRA BrokerCheck at brokercheck.finra.org.",
      esign:"I consent to electronic signatures and electronic delivery of account documents per the E-SIGN Act and UETA.",
    };
    return '<div class="disc-row"><span class="disc-chk">' + (v ? "✓" : "✗") + '</span><span>' + (labels[k] || k) + '</span></div>';
  }).join("")}
</div>
<!-- ═══ AGREEMENTS ═══ -->
<h2>${acct.exchangeBusiness ? "VII" : "VI"}. Agreements & Representations</h2>

<div class="agr">
  <div class="agr-title">A. Investor Representations</div>
  By signing this application, I (the undersigned investor) represent and warrant that: (i) I am an "accredited investor" as defined in Rule 501(a) of Regulation D under the Securities Act of 1933, as amended; (ii) I have such knowledge and experience in financial and business matters that I am capable of evaluating the merits and risks of a prospective investment in the securities offered; (iii) I am purchasing the securities for my own account, for investment purposes only, and not with a view to or for resale or distribution; (iv) I understand that the securities are being offered pursuant to an exemption from registration under the Securities Act and have not been registered with the SEC or any state securities commission; (v) I have been given the opportunity to ask questions of, and receive answers from, the issuer and its representatives concerning the terms and conditions of this offering.
</div>
<div class="agr">
  <div class="agr-title">B. Client Account Agreement</div>
  I agree that my account at Stax Capital, Inc. ("Stax") shall be subject to and governed by the terms and conditions set forth in the Client Account Agreement provided to me, including but not limited to: (i) Stax's authority to act as my introducing broker-dealer; (ii) my obligation to maintain accurate and current account information; (iii) Stax's right to restrict, freeze, or close my account in the event of suspected fraud, regulatory violation, or other material breach; and (iv) the applicable fee schedule disclosed in Stax's Form CRS and Regulation Best Interest Disclosure. I acknowledge receipt of Stax Capital's Form CRS (Customer Relationship Summary) and the Regulation Best Interest Disclosure Document.
</div>
<div class="agr">
  <div class="agr-title">C. Pre-Dispute Arbitration Agreement</div>
  This agreement contains a pre-dispute arbitration clause. By signing an arbitration agreement, the parties agree as follows: (a) All parties to this agreement are giving up the right to sue each other in court, including the right to a trial by jury, except as provided by the rules of the arbitration forum in which a claim is filed; (b) Arbitration awards are generally final and binding; a party's ability to have a court reverse or modify an arbitration award is very limited; (c) The ability of the parties to obtain documents, witness statements, and other discovery is generally more limited in arbitration than in court proceedings; (d) The arbitrators do not have to explain the reason(s) for their award unless, in an eligible case, a joint request for an explained decision has been submitted by all parties to the panel at least 20 days prior to the first scheduled hearing date; (e) The panel of arbitrators will typically include a minority of arbitrators who were or are affiliated with the securities industry; (f) The rules of some arbitration forums may impose time limits for bringing a claim in arbitration; in some cases, a claim that is ineligible for arbitration may be brought in court; (g) The rules of the arbitration forum in which the claim is filed, and any amendments thereto, shall be incorporated into this agreement. Any controversy between Stax Capital and the undersigned arising out of or relating to this account shall be settled by arbitration before the Financial Industry Regulatory Authority (FINRA).
</div>
<div class="agr">
  <div class="agr-title">D. Electronic Delivery &amp; E-SIGN Consent</div>
  I consent to receive all account-related documents, communications, disclosures, and notices electronically in accordance with the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic Transactions Act (UETA). I understand that I may withdraw this consent at any time by contacting Stax Capital in writing and that I have the right to receive paper copies of any documents upon request. I acknowledge that my electronic signature on this application has the same legal effect as a handwritten signature.
</div>
<div class="agr">
  <div class="agr-title">E. Privacy Notice</div>
  Stax Capital, Inc. respects the privacy of its clients and is committed to safeguarding nonpublic personal information. We collect personal information necessary to open and service your account, comply with regulatory obligations, and provide you with investment recommendations. We do not disclose nonpublic personal information about our clients or former clients to any third parties except as required or permitted by law. We maintain physical, electronic, and procedural safeguards to protect client information in accordance with federal and state regulations.
</div>
${acct.exchangeBusiness ? `<div class="agr">
  <div class="agr-title">F. 1031 Exchange Acknowledgments</div>
  I acknowledge that: (i) Stax Capital does not provide tax, legal, or accounting advice; (ii) any tax estimates are for informational purposes only; (iii) I have consulted or will consult with a qualified tax professional; (iv) 1031 exchange tax deferral treatment may be challenged by the IRS; (v) I understand the 45-day identification and 180-day closing deadlines; (vi) failure to meet these deadlines may result in a failed exchange and full capital gains taxation; (vii) I authorize the Qualified Intermediary to furnish exchange information to Stax Capital; (viii) I understand debt replacement requirements under IRC §1031.
</div>` : ""}
<div class="sig-b">
  <h3 style="margin:0 0 6px;color:#0F3D25">Electronic Signature &amp; Certification</h3>
  <p style="font-size:9px;color:#6B7280;margin-bottom:12px;line-height:1.7">By signing below, I certify that: (1) all information provided in this application is true, correct, and complete; (2) I have read, understand, and agree to all disclosures, agreements, and representations set forth herein; (3) I acknowledge that my typed electronic signature constitutes a legally binding signature under the E-SIGN Act and UETA; (4) I understand the risks of investing in DST securities as described in the offering materials; (5) I meet all eligibility requirements for this investment; and (6) I authorize Stax Capital to process this account opening application.</p>
  <div class="sig-l">${sig.primary || "—"}</div>
  <div class="sig-d">Primary Account Holder · ${fullName} · Electronically signed ${nowDate}</div>
  ${acct.hasCoApplicant && sig.co ? `<div class="sig-l" style="margin-top:14px">${sig.co}</div><div class="sig-d">Co-Applicant · Electronically signed ${nowDate}</div>` : ""}
</div>
<div class="ftr">
  <div class="ftr-b">STAX CAPITAL</div>
  <div class="ftr-a">7960 Entrada Lazanja, San Diego, CA 92127 · 844-427-1031 · staxai.com</div>
  <div class="ftr-l">
    Member FINRA &amp; SIPC · Securities offered through Stax Capital, Inc. · CRD# [pending]<br/>
    Application Ref: ${confRef.current} · Generated ${nowDate} · DST Onboarding v1.2<br/>
    These securities are offered pursuant to an exemption from registration under the Securities Act of 1933. They are speculative, involve substantial risk, and are suitable only for accredited investors who can bear the loss of their entire investment. This is not an offer to sell or a solicitation of an offer to buy securities.<br/>
    Stax Capital, Inc. does not provide tax, legal, or accounting advice. Any tax-related estimates or information provided are for informational purposes only. Consult your own qualified professionals.
  </div>
</div>
</div></body></html>`;

      const downloadHtml = (htmlContent, filename) => {
        const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
        const a = document.createElement("a");
        a.href = dataUri; a.download = filename; a.style.display = "none";
        document.body.appendChild(a); a.click();
        setTimeout(() => document.body.removeChild(a), 200);
      };
      downloadHtml(html, `Stax_Account_Opening_Package_${confRef.current}_${new Date().toISOString().slice(0,10)}.html`);
    };

    const handlePrint = generatePDF;

    /* ═══════════════════════════════════════════════════════════
       COMPLIANCE PDF — Supervisory Review & Audit Record
       ═══════════════════════════════════════════════════════════ */
    const generateCompliancePDF = () => {
      const fullName = [acct.title, acct.firstName, acct.middleName, acct.lastName].filter(Boolean).join(" ") || "—";
      const fmtA = n => `$${Math.round(n).toLocaleString()}`;
      const nowDate = new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});
      const adjBasis = acct.rp_originalPurchasePrice + acct.rp_improvements - acct.rp_accumulatedDepreciation;
      const realizedGain = Math.max(0, (acct.rp_salePrice - acct.rp_sellingExpenses) - adjBasis);
      const cd = buildComplianceData();
      const statusColor = (s) => ({ PASS:"#059669", ACTIVE:"#059669", FAIL:"#DC2626", FLAG:"#D97706", WARNING:"#DC2626", INCOMPLETE:"#6B7280", "N/A":"#9CA3AF" }[s] || "#6B7280");
      const statusBg = (s) => ({ PASS:"#ECFDF5", ACTIVE:"#ECFDF5", FAIL:C.errorBg, FLAG:C.warningBg, WARNING:C.errorBg, INCOMPLETE:"#F9FAFB", "N/A":"#F9FAFB" }[s] || "#F9FAFB");
      const statusBdr = (s) => ({ PASS:"#A7F3D0", ACTIVE:"#A7F3D0", FAIL:"#FECACA", FLAG:C.warningBorder, WARNING:"#FECACA", INCOMPLETE:"#E5E7EB", "N/A":"#E5E7EB" }[s] || "#E5E7EB");

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Stax Capital — Compliance Review</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', sans-serif;
  color: #0A0A0A;
  font-size: 10px;
  line-height: 1.5;
  background: #fff;
}
.page {
  max-width: 850px;
  margin: 0 auto;
  padding: 32px 40px;
}
.hdr {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 3px solid #1B5E3B;
  margin-bottom: 20px;
}
.logo { display: flex; align-items: center; gap: 10px; }
.hdr-right { text-align: right; font-size: 9px; color: #6B7280; }
.hdr-right strong { color: #0F3D25; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 700; }
h1 { font-size: 16px; font-weight: 700; color: #0F3D25; margin-bottom: 2px; }
h2 {
  font-size: 12px; font-weight: 700; color: #0F3D25;
  margin: 18px 0 8px; padding: 6px 10px;
  background: #F0FDF4; border-left: 3px solid #1B5E3B;
  border-radius: 0 4px 4px 0;
}
h3 { font-size: 11px; font-weight: 700; color: #374151; margin: 10px 0 4px; }
.sub { font-size: 10px; color: #6B7280; margin-bottom: 14px; }
.conf {
  font-size: 9px; color: #DC2626; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
}
table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 9.5px; }
th {
  text-align: left; padding: 5px 8px;
  background: #F9FAFB; border-bottom: 2px solid #E5E7EB;
  font-weight: 700; color: #374151;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px;
}
td { padding: 5px 8px; border-bottom: 1px solid #F3F4F6; vertical-align: top; }
td.lbl { color: #6B7280; width: 30%; }
td.val { color: #0A0A0A; font-weight: 500; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0 16px; }
.metric {
  text-align: center; padding: 10px;
  background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;
}
.metric-lbl { font-size: 8px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
.metric-val { font-size: 16px; font-weight: 600; margin-top: 2px; }
.callout { padding: 8px 12px; border-radius: 6px; font-size: 9.5px; line-height: 1.6; margin: 6px 0; }
.c-red { background: #FEF2F2; border: 1px solid #FECACA; color: #7F1D1D; }
.c-amber { background: #FFFBEB; border: 1px solid #FDE68A; color: #78350F; }
.c-green { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; }
.c-blue { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; }
.sts {
  display: inline-block; padding: 1px 6px;
  border-radius: 3px; font-size: 8px; font-weight: 700;
  letter-spacing: 0.3px; text-align: center; min-width: 65px;
}
.remedy { font-size: 9px; color: #991B1B; line-height: 1.4; font-style: italic; }
.conc-bar { height: 12px; border-radius: 3px; position: relative; overflow: visible; margin: 2px 0; }
.conc-fill { height: 100%; border-radius: 3px; }
.conc-mark { position: absolute; top: -2px; bottom: -2px; width: 2px; background: #DC2626; }
.sig-block {
  margin-top: 16px; padding: 14px;
  background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;
}
.sig-area { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; }
.sig-line { border-bottom: 2px solid #1B5E3B; padding: 24px 0 4px; min-height: 44px; }
.sig-label { font-size: 8px; color: #9CA3AF; margin-top: 2px; }
.footer {
  margin-top: 24px; padding-top: 12px;
  border-top: 2px solid #1B5E3B;
  text-align: center; font-size: 8px; color: #9CA3AF; line-height: 1.6;
}
.footer strong { color: #0F3D25; }
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { padding: 20px 28px; }
  h2 { break-after: avoid; }
  .sig-block { break-inside: avoid; }
  table { break-inside: auto; }
  tr { break-inside: avoid; break-after: auto; }
}
</style></head><body>
<div class="page">
<div class="conf">CONFIDENTIAL — FOR COMPLIANCE & SUPERVISORY USE ONLY</div>
<div class="hdr">
  <div class="logo" style="align-items:center;">
    <div style="background:linear-gradient(135deg,#0F3D25 0%,#1B5E3B 100%);border-radius:9px;padding:7px 18px;display:flex;align-items:center;">
      <img src="${STAX_AI_LOGO}" alt="Stax AI" style="width:110px;height:27px;object-fit:contain;display:block;"/>
    </div>
    <div style="margin-left:10px;">
      <div style="font-size:7px;color:#6B7280;letter-spacing:1px;text-transform:uppercase;">Compliance Review Report</div>
    </div>
  </div>
  <div class="hdr-right"><div><strong>Application Ref: ${confRef.current}</strong></div><div>Generated: ${nowDate}</div><div>Account: ${fullName}</div></div>
</div>
<h1>Compliance Review & Supervisory Approval Package</h1>
<p class="sub">Automated pre-trade compliance analysis for supervisory review. This document contains all compliance checks executed during the account opening process, flagged areas requiring attention, and recommended remediation steps. Maintain per FINRA Rule 3110 and SEC Books & Records requirements.</p>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px">
  <div class="metric"><div class="metric-lbl">Total Checks</div><div class="metric-val" style="color:#0F3D25">${cd.totalChecks}</div></div>
  <div class="metric" style="background:#ECFDF5;border-color:#A7F3D0"><div class="metric-lbl">Passed</div><div class="metric-val" style="color:#059669">${cd.passCount}</div></div>
  <div class="metric" style="background:#FFFBEB;border-color:#FDE68A"><div class="metric-lbl">Flagged</div><div class="metric-val" style="color:#D97706">${cd.flagCount}</div></div>
  <div class="metric" style="background:#FEF2F2;border-color:#FECACA"><div class="metric-lbl">Failed</div><div class="metric-val" style="color:#DC2626">${cd.failCount}</div></div>
  <div class="metric"><div class="metric-lbl">Incomplete</div><div class="metric-val" style="color:#6B7280">${cd.incCount}</div></div>
</div>
${cd.failCount > 0 ? '<div class="callout c-red"><strong>🚫 BLOCKING ISSUES DETECTED:</strong> This application has ' + cd.failCount + ' blocking compliance failure(s) that must be resolved before trade execution. See remediation details below.</div>' : ''}
${cd.flagCount > 0 ? '<div class="callout c-amber"><strong>⚠️ FLAGS REQUIRING REVIEW:</strong> ' + cd.flagCount + ' item(s) flagged for enhanced supervisory review. Document rationale if electing to proceed.</div>' : ''}
${cd.failCount === 0 && cd.flagCount === 0 ? '<div class="callout c-green"><strong>✅ ALL CHECKS PASSED:</strong> No blocking issues or compliance flags detected. Application is eligible for standard processing.</div>' : ''}
<h2>Client Account & Trade Overview</h2>
<div class="grid2">
  <table>
    <tr><td class="lbl">Account Holder</td><td class="val">${fullName}</td></tr>
    <tr><td class="lbl">Account Type</td><td class="val">${acct.registrationCategory === "entity" ? "Entity — " + (acct.entityType||"").replace(/_/g," ") : "Individual — " + (acct.individualType||"individual").replace(/_/g," ")}</td></tr>
    <tr><td class="lbl">Transaction Type</td><td class="val">${acct.exchangeBusiness ? "1031 Exchange" : "Direct Investment"}</td></tr>
    <tr><td class="lbl">SSN / TIN</td><td class="val">${acct.ssn ? "●●●-●●-" + acct.ssn.slice(-4) : "—"}</td></tr>
    <tr><td class="lbl">Accredited Status</td><td class="val">${acct.accredited || "—"} ${acct.accreditedBasis ? "(" + acct.accreditedBasis.replace(/_/g," ") + ")" : ""}</td></tr>
  </table>
  <table>
    <tr><td class="lbl">Risk Tolerance</td><td class="val">${(acct.riskTolerance||"—").replace(/_/g," ")}</td></tr>
    <tr><td class="lbl">Time Horizon</td><td class="val">${(acct.timeHorizon||"—").replace(/_/g," ")}</td></tr>
    <tr><td class="lbl">Employment</td><td class="val">${acct.employmentStatus || "—"}</td></tr>
    <tr><td class="lbl">Senior Investor</td><td class="val">${isSeniorDetected.detected ? "YES — Enhanced review" : "No"}</td></tr>
    <tr><td class="lbl">Trusted Contact</td><td class="val">${acct.hasTrustedContact === "Yes" ? (acct.tcName || "Provided") : "Declined"}</td></tr>
  </table>
</div>
<!-- ── Trade Details ── -->
<h2>Investment / Trade Details</h2>
<table>
  <thead><tr><th>DST Property</th><th>Type</th><th>Sponsor</th><th>Investment</th><th>% of Total</th><th>Cash-on-Cash</th></tr></thead>
  <tbody>
    ${cartItems.map(item => `<tr>
      <td style="font-weight:600">${item.shortName}</td>
      <td>${item.propertyTypeShort}</td>
      <td>${item.sponsor || "—"}</td>
      <td style="font-weight:600;color:#1B5E3B">${fmtA(cart[item.id])}</td>
      <td>${(cart[item.id]/cartTotal*100).toFixed(1)}%</td>
      <td>${item.cashOnCash}%</td>
    </tr>`).join("")}
    <tr style="background:#F0FDF4;font-weight:700">
      <td>TOTAL</td><td></td><td></td>
      <td style="color:#1B5E3B;font-size:12px">${fmtA(cartTotal)}</td>
      <td>100%</td>
      <td>${cartTotal > 0 ? (cartItems.reduce((s,item) => s + item.cashOnCash * cart[item.id], 0) / cartTotal).toFixed(2) : "0.00"}% wtd</td>
    </tr>
  </tbody>
</table>

<!-- ── Financial Summary ── -->
<h2>Financial Position Summary</h2>
<div class="grid2">
  <table>
    <tr><td class="lbl">Total Assets</td><td class="val">${fmtA(fsCalcs.totalAssets)}</td></tr>
    <tr><td class="lbl">Total Liabilities</td><td class="val">${fmtA(fsCalcs.totalLiab)}</td></tr>
    <tr><td class="lbl">Net Worth</td><td class="val" style="font-weight:700">${fmtA(fsCalcs.netWorth)}</td></tr>
    <tr><td class="lbl">NW ex-Primary Residence</td><td class="val" style="font-weight:700;color:#1B5E3B">${fmtA(fsCalcs.netWorthExRes)}</td></tr>
    <tr><td class="lbl">Total Liquid Assets</td><td class="val">${fmtA(fsCalcs.totalLiquid)}</td></tr>
  </table>
  <table>
    <tr><td class="lbl">Gross Annual Income</td><td class="val">${fmtA(fsCalcs.grossInc)}</td></tr>
    <tr><td class="lbl">Debt-to-Asset Ratio</td><td class="val">${fsCalcs.debtToAsset.toFixed(1)}%</td></tr>
    <tr><td class="lbl">Emergency Reserve</td><td class="val">${fsCalcs.emergencyMonths !== null ? fsCalcs.emergencyMonths.toFixed(1) + " months" : "N/A"}</td></tr>
    <tr><td class="lbl">Income Coverage</td><td class="val">${fsCalcs.incomeCoverage !== null ? fsCalcs.incomeCoverage.toFixed(2) + "x" : "N/A"}</td></tr>
    <tr><td class="lbl">Investment % of Liquid</td><td class="val">${fsCalcs.investAsLiquidPct.toFixed(1)}%</td></tr>
  </table>
</div>
<h2>Concentration Analysis Matrix</h2>
<p class="sub">All percentages calculated as % of Net Worth excluding Primary Residence (${fmtA(fsCalcs.netWorthExRes)}). Concentration guidelines per FINRA Regulatory Notice 12-03 and Stax Capital internal policy.</p>

<h3>Portfolio-Level Concentration</h3>
<table>
  <thead><tr><th>Category</th><th>Pre-Inv ($)</th><th>Pre (%)</th><th>Post-Inv ($)</th><th>Post (%)</th><th>Δ</th><th>Limit</th><th>Status</th></tr></thead>
  <tbody>
    <tr>
      <td>RE Securities (DSTs, REITs, etc.)</td>
      <td>${fmtA(fs.reSec)}</td><td>${fsCalcs.preReSecPct.toFixed(1)}%</td>
      <td>${fmtA(fsCalcs.postReSec2)}</td><td>${fsCalcs.postReSecPct.toFixed(1)}%</td>
      <td style="color:${fsCalcs.deltaReSec > 0 ? '#DC2626' : '#059669'}">+${fsCalcs.deltaReSec.toFixed(1)}pp</td>
      <td>≤30%</td>
      <td><span class="sts" style="background:${fsCalcs.postConReSec <= 30 ? '#ECFDF5' : fsCalcs.postConReSec <= 50 ? '#FFFBEB' : '#FEF2F2'};color:${fsCalcs.postConReSec <= 30 ? '#059669' : fsCalcs.postConReSec <= 50 ? '#D97706' : '#DC2626'};border:1px solid ${fsCalcs.postConReSec <= 30 ? '#A7F3D0' : fsCalcs.postConReSec <= 50 ? '#FDE68A' : '#FECACA'}">${fsCalcs.postConReSec <= 30 ? 'OK' : fsCalcs.postConReSec <= 50 ? 'ELEVATED' : 'OVER'}</span></td>
    </tr>
    <tr>
      <td>Non-RE Alternatives</td>
      <td>${fmtA(fs.nonReAlts)}</td><td>${fsCalcs.preNonReAltsPct.toFixed(1)}%</td>
      <td>${fmtA(fs.nonReAlts)}</td><td>${fsCalcs.postNonReAltsPct.toFixed(1)}%</td>
      <td>—</td><td>Monitor</td>
      <td><span class="sts" style="background:#ECFDF5;color:#059669;border:1px solid #A7F3D0">OK</span></td>
    </tr>
    <tr>
      <td>Interval Funds</td>
      <td>${fmtA(fs.intervalFunds)}</td><td>${fsCalcs.preIntervalPct.toFixed(1)}%</td>
      <td>${fmtA(fs.intervalFunds)}</td><td>${fsCalcs.postIntervalPct.toFixed(1)}%</td>
      <td>—</td><td>Monitor</td>
      <td><span class="sts" style="background:#ECFDF5;color:#059669;border:1px solid #A7F3D0">OK</span></td>
    </tr>
    <tr style="font-weight:700;background:#F9FAFB">
      <td>Total Illiquid / Alternatives</td>
      <td>${fmtA(fsCalcs.illiquid - fs.primary)}</td><td>${fsCalcs.preAllIlliqPct.toFixed(1)}%</td>
      <td>${fmtA(fsCalcs.postAllIlliq)}</td><td>${fsCalcs.postAllIlliqPct.toFixed(1)}%</td>
      <td style="color:${fsCalcs.deltaAllIlliq > 0 ? '#DC2626' : '#059669'}">+${fsCalcs.deltaAllIlliq.toFixed(1)}pp</td>
      <td>≤40%</td>
      <td><span class="sts" style="background:${fsCalcs.postConAlts <= 40 ? '#ECFDF5' : fsCalcs.postConAlts <= 60 ? '#FFFBEB' : '#FEF2F2'};color:${fsCalcs.postConAlts <= 40 ? '#059669' : fsCalcs.postConAlts <= 60 ? '#D97706' : '#DC2626'};border:1px solid ${fsCalcs.postConAlts <= 40 ? '#A7F3D0' : fsCalcs.postConAlts <= 60 ? '#FDE68A' : '#FECACA'}">${fsCalcs.postConAlts <= 40 ? 'OK' : fsCalcs.postConAlts <= 60 ? 'ELEVATED' : 'OVER'}</span></td>
    </tr>
    <tr>
      <td>Single Offering (this trade)</td>
      <td>—</td><td>—</td>
      <td>${fmtA(cartTotal)}</td><td>${fsCalcs.investAsNwPct.toFixed(1)}%</td>
      <td>—</td><td>≤25%</td>
      <td><span class="sts" style="background:${fsCalcs.investAsNwPct <= 25 ? '#ECFDF5' : '#FFFBEB'};color:${fsCalcs.investAsNwPct <= 25 ? '#059669' : '#D97706'};border:1px solid ${fsCalcs.investAsNwPct <= 25 ? '#A7F3D0' : '#FDE68A'}">${fsCalcs.investAsNwPct <= 25 ? 'OK' : 'ELEVATED'}</span></td>
    </tr>
  </tbody>
</table>

<h3>Per-Property Concentration Breakdown</h3>
<table>
  <thead><tr><th>DST Property</th><th>Sponsor</th><th>Property Type</th><th>Location</th><th>Investment</th><th>% of NW ex-Res</th><th>% of Total Inv</th><th>Cash-on-Cash</th></tr></thead>
  <tbody>
    ${cartItems.map(item => {
      const pctNW = fsCalcs.netWorthExRes > 0 ? (cart[item.id] / fsCalcs.netWorthExRes * 100) : 0;
      const pctTotal = cartTotal > 0 ? (cart[item.id] / cartTotal * 100) : 0;
      return '<tr>' +
        '<td style="font-weight:600">' + item.shortName + '</td>' +
        '<td>' + (item.sponsor || "—") + '</td>' +
        '<td>' + item.propertyTypeShort + '</td>' +
        '<td>' + (item.location || "—") + '</td>' +
        '<td style="font-weight:600;color:#1B5E3B">' + fmtA(cart[item.id]) + '</td>' +
        '<td style="color:' + (pctNW > 15 ? '#DC2626' : pctNW > 10 ? '#D97706' : '#059669') + ';font-weight:600">' + pctNW.toFixed(1) + '%</td>' +
        '<td>' + pctTotal.toFixed(1) + '%</td>' +
        '<td>' + item.cashOnCash + '%</td>' +
        '</tr>';
    }).join("")}
    <tr style="background:#F0FDF4;font-weight:700">
      <td colspan="4">TOTAL</td>
      <td style="color:#1B5E3B;font-size:11px">${fmtA(cartTotal)}</td>
      <td>${fsCalcs.investAsNwPct.toFixed(1)}%</td>
      <td>100%</td>
      <td>${cartTotal > 0 ? (cartItems.reduce((s,i) => s + i.cashOnCash * cart[i.id], 0) / cartTotal).toFixed(2) : "0.00"}% wtd</td>
    </tr>
  </tbody>
</table>

<h3>Sponsor Concentration</h3>
<table>
  <thead><tr><th>Sponsor</th><th>Properties</th><th>Total Invested</th><th>% of Trade</th><th>% of NW ex-Res</th><th>Status</th></tr></thead>
  <tbody>
    ${(() => {
      const sponsorMap = {};
      cartItems.forEach(item => {
        const sp = item.sponsor || "Unknown";
        if (!sponsorMap[sp]) sponsorMap[sp] = { count:0, total:0 };
        sponsorMap[sp].count++;
        sponsorMap[sp].total += cart[item.id];
      });
      return Object.entries(sponsorMap).map(([sp, data]) => {
        const pctTrade = (data.total / cartTotal * 100);
        const pctNW = fsCalcs.netWorthExRes > 0 ? (data.total / fsCalcs.netWorthExRes * 100) : 0;
        return '<tr><td style="font-weight:600">' + sp + '</td><td>' + data.count + '</td><td style="font-weight:600;color:#1B5E3B">' + fmtA(data.total) + '</td><td>' + pctTrade.toFixed(1) + '%</td><td>' + pctNW.toFixed(1) + '%</td><td><span class="sts" style="background:' + (pctTrade > 60 ? '#FEF2F2' : pctTrade > 40 ? '#FFFBEB' : '#ECFDF5') + ';color:' + (pctTrade > 60 ? '#DC2626' : pctTrade > 40 ? '#D97706' : '#059669') + ';border:1px solid ' + (pctTrade > 60 ? '#FECACA' : pctTrade > 40 ? '#FDE68A' : '#A7F3D0') + '">' + (pctTrade > 60 ? 'HIGH' : pctTrade > 40 ? 'MODERATE' : 'OK') + '</span></td></tr>';
      }).join('');
    })()}
  </tbody>
</table>

<div class="grid2">
<div>
<h3>Property Type Concentration</h3>
<table>
  <thead><tr><th>Type</th><th>Amount</th><th>% of Trade</th></tr></thead>
  <tbody>
    ${(() => {
      const typeMap = {};
      cartItems.forEach(item => {
        const t = item.propertyTypeShort || "Other";
        if (!typeMap[t]) typeMap[t] = 0;
        typeMap[t] += cart[item.id];
      });
      return Object.entries(typeMap).map(([t, amt]) => '<tr><td>' + t + '</td><td>' + fmtA(amt) + '</td><td>' + (amt/cartTotal*100).toFixed(1) + '%</td></tr>').join('');
    })()}
  </tbody>
</table>
</div>
<div>
<h3>Geographic Concentration</h3>
<table>
  <thead><tr><th>Location</th><th>Amount</th><th>% of Trade</th></tr></thead>
  <tbody>
    ${(() => {
      const geoMap = {};
      cartItems.forEach(item => {
        const loc = item.location || "Unknown";
        if (!geoMap[loc]) geoMap[loc] = 0;
        geoMap[loc] += cart[item.id];
      });
      return Object.entries(geoMap).map(([loc, amt]) => '<tr><td>' + loc + '</td><td>' + fmtA(amt) + '</td><td>' + (amt/cartTotal*100).toFixed(1) + '%</td></tr>').join('');
    })()}
  </tbody>
</table>
</div>
</div>
${acct.exchangeBusiness ? `<h2>1031 Exchange Summary</h2>
<div class="callout c-red"><strong>TAX DISCLAIMER:</strong> Stax Capital does not provide tax, legal, or accounting advice. All tax estimates are for informational purposes only.</div>
<div class="grid2">
  <table>
    <tr><td class="lbl">Relinquished Property</td><td class="val">${[acct.rp_address, acct.rp_city, acct.rp_state].filter(Boolean).join(", ") || "—"}</td></tr>
    <tr><td class="lbl">Property Type</td><td class="val">${(acct.rp_propertyType||"—").replace(/_/g," ")}</td></tr>
    <tr><td class="lbl">Sale Price</td><td class="val">${fmtA(acct.rp_salePrice||0)}</td></tr>
    <tr><td class="lbl">Adjusted Cost Basis</td><td class="val">${fmtA(adjBasis)}</td></tr>
    <tr><td class="lbl">Estimated Taxable Gain</td><td class="val" style="color:#DC2626">${fmtA(realizedGain)}</td></tr>
  </table>
  <table>
    <tr><td class="lbl">Est. Tax Liability</td><td class="val" style="color:#DC2626;font-weight:700">${typeof acct.estimatedTaxLiability === "number" ? fmtA(acct.estimatedTaxLiability) : "—"}</td></tr>
    <tr><td class="lbl">Debt Retired</td><td class="val">${fmtA(acct.rp_debtRetired||acct.rp_existingMortgage||0)}</td></tr>
    <tr><td class="lbl">Debt Replaced (DST)</td><td class="val">${fmtA(acct.replacementDebt||0)}</td></tr>
    <tr><td class="lbl">QI Company</td><td class="val">${acct.qiCompany || "—"}</td></tr>
    <tr><td class="lbl">Exchange #</td><td class="val">${acct.qiExchangeNumber || "—"}</td></tr>
  </table>
</div>` : ''}
<!-- ── All Compliance Checks ── -->
<h2>Detailed Compliance Check Results</h2>
${cd.categories.map(cat => `
<h3>${cat}</h3>
<table>
  <thead><tr><th style="width:60px">Status</th><th>Check</th><th>Rule</th><th>Detail</th></tr></thead>
  <tbody>
  ${cd.allChecks.filter(c => c.cat === cat).map(c => `
    <tr style="background:${c.status === 'FAIL' || c.status === 'WARNING' ? '#FEF2F2' : c.status === 'FLAG' ? '#FFFBEB' : 'transparent'}">
      <td><span class="sts" style="background:${statusBg(c.status)};color:${statusColor(c.status)};border:1px solid ${statusBdr(c.status)}">${c.status}</span></td>
      <td style="font-weight:500">${c.check}</td>
      <td style="font-size:8px;color:#6B7280">${c.rule}</td>
      <td>${c.detail}${c.remedy ? '<br/><span class="remedy">↳ ' + c.remedy + '</span>' : ''}</td>
    </tr>
  `).join('')}
  </tbody>
</table>
`).join('')}

<!-- ── Active Compliance Flags from Application ── -->
${compFlags.length > 0 ? `
<h2>Runtime Compliance Flags (${compFlags.length})</h2>
<table>
  <thead><tr><th style="width:60px">Level</th><th>Flag</th><th>Detail</th></tr></thead>
  <tbody>
  ${compFlags.map(f => `
    <tr style="background:${f.type === 'block' ? '#FEF2F2' : f.type === 'warn' ? '#FFFBEB' : '#F9FAFB'}">
      <td><span class="sts" style="background:${f.type === 'block' ? '#FEF2F2' : f.type === 'warn' ? '#FFFBEB' : '#F9FAFB'};color:${f.type === 'block' ? '#DC2626' : f.type === 'warn' ? '#D97706' : '#6B7280'};border:1px solid ${f.type === 'block' ? '#FECACA' : f.type === 'warn' ? '#FDE68A' : '#E5E7EB'}">${f.type === 'block' ? 'BLOCK' : f.type === 'warn' ? 'WARN' : 'INFO'}</span></td>
      <td style="font-weight:500">${f.msg}</td>
      <td style="font-size:9px;color:#4B5563">${f.detail || "—"}</td>
    </tr>
  `).join('')}
  </tbody>
</table>` : '<div class="callout c-green"><strong>No active compliance flags.</strong> All runtime checks passed without exception.</div>'}

<!-- ── Disclosure Acknowledgment Audit ── -->
<h2>Disclosure & Acknowledgment Audit Trail</h2>
<table>
  <thead><tr><th style="width:60px">Status</th><th>Disclosure</th><th>Timestamp</th></tr></thead>
  <tbody>
  ${Object.entries(disc).map(([k,v]) => {
    const labels = {
      materialReviewed:"Reviewed all Offering Materials and consulted independent advisors",
      offering:"Investment is highly speculative with substantial risk",
      illiquidity:"Investment is illiquid with no secondary market",
      risk:"Not financially dependent on distributions",
      noGuarantee:"No guarantees on investment performance",
      exchange1031:"1031 exchange tax deferral may be challenged by IRS",
      concentration:"Reviewed concentration levels and accepted risk",
      additionalDebt:"Understands additional debt considerations",
      arbitration:"Client Account Agreement and Pre-Dispute Arbitration",
      independentAdvice:"Sought independent legal, tax, and investment advice",
    };
    return '<tr><td><span class="sts" style="background:' + (v ? '#ECFDF5' : '#FEF2F2') + ';color:' + (v ? '#059669' : '#DC2626') + ';border:1px solid ' + (v ? '#A7F3D0' : '#FECACA') + '">' + (v ? 'ACK' : 'PENDING') + '</span></td><td>' + (labels[k]||k) + '</td><td style="font-size:8px;color:#9CA3AF">' + (v ? nowDate : '—') + '</td></tr>';
  }).join('')}
  </tbody>
</table>

<!-- ── Supervisory Approval Block ── -->
<div class="sig-block">
  <h3 style="margin:0 0 4px;color:#0F3D25">Supervisory Review & Approval</h3>
  <p style="font-size:9px;color:#6B7280;line-height:1.6;margin-bottom:8px">
    I have reviewed this account opening application, the associated compliance checks, concentration analysis, and all flagged items. I have determined that this investment is suitable for the investor based on the information provided and the investor's stated financial situation, investment objectives, risk tolerance, and time horizon. All flagged items have been reviewed and appropriate documentation has been obtained.
  </p>
  <div class="sig-area">
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Registered Representative Signature</div>
      <div class="sig-line" style="margin-top:12px"></div>
      <div class="sig-label">Print Name / CRD #</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Supervisory Principal Signature</div>
      <div class="sig-line" style="margin-top:12px"></div>
      <div class="sig-label">Print Name / CRD # / Date</div>
    </div>
  </div>
</div>

<div class="footer">
  <div><strong>STAX CAPITAL, INC.</strong> — CONFIDENTIAL COMPLIANCE DOCUMENT</div>
  <div>7960 Entrada Lazanja, San Diego, CA 92127 · Member FINRA &amp; SIPC</div>
  <div>Retain per FINRA Rule 4511 / SEC Rule 17a-4. Minimum retention: 6 years from account close.</div>
  <div>Generated by DST Onboarding v1.2 Compliance Engine · ${nowDate} · Ref: ${confRef.current}</div>
</div>
</div></body></html>`;

      const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
      const a = document.createElement("a");
      a.href = dataUri; a.download = `Stax_Compliance_Review_${confRef.current}_${new Date().toISOString().slice(0,10)}.html`;
      a.style.display = "none"; document.body.appendChild(a); a.click();
      setTimeout(() => document.body.removeChild(a), 200);
    };

    /* ── Row helper for detail tables ── */
    const DR = ({ label, value }) => (
      <tr>
        <td style={{ padding:"7px 14px 7px 0", verticalAlign:"top", width:"40%", fontSize:12, color:T.muted, fontFamily:FONT, borderBottom:`1px solid ${N.divider}`, whiteSpace:"nowrap" }}>{label}</td>
        <td style={{ padding:"7px 0 7px 8px", verticalAlign:"top", fontSize:12, color:T.primary, fontFamily:FONT, fontWeight:500, borderBottom:`1px solid ${N.divider}` }}>{value || "—"}</td>
      </tr>
    );

    /* ── Section header with optional edit button ── */
    const ReviewSection = ({ title, onEdit, children }) => (
      <div style={{ marginBottom:24, borderRadius:12, border:`1px solid ${N.border}`, overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          background: N.section, padding:"16px 20px", borderBottom:`1px solid ${N.border}` }}>
          <div style={{ fontSize:15, fontWeight:600, color:T.primary, fontFamily:FONT, letterSpacing:"-0.01em" }}>{title}</div>
          {onEdit && (
            <button type="button" onClick={onEdit} style={{ background:"none", border:`1px solid ${N.border}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:G.forest, fontFamily:FONT, cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontWeight:600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
          )}
        </div>
        <div style={{ padding:"16px 20px" }}>{children}</div>
      </div>
    );

    /* ── Disclosure check row ── */
    const DiscRow = ({ id, label, docRef }) => (
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom:`1px solid ${N.divider}` }}>
        <input type="checkbox" checked={disc[id] || false}
          onChange={e => { updDisc(id, e.target.checked); if (!e.target.checked) setAgreeAll(false); }}
          style={{ marginTop:2, width:14, height:14, accentColor:G.forest, cursor:"pointer", flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:12, color:T.body, fontFamily:FONT, lineHeight:1.5 }}>{label}</span>
          {docRef && <span style={{ marginLeft:6, fontSize:10, color:T.light, fontFamily:FONT }}>{docRef}</span>}
        </div>
      </div>
    );

    /* ═══════════════════════════════════════════════════════
       IN-APP COMPLIANCE REVIEW SCREEN (post-submit)
       ═══════════════════════════════════════════════════════ */
    if (submitted && showComplianceReview) {
      const cd = buildComplianceData();
      const fmtA = n => `$${Math.round(n).toLocaleString()}`;
      const nowDate = new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});
      const statusColors = { PASS:"#059669", ACTIVE:"#059669", FAIL:"#DC2626", FLAG:"#D97706", WARNING:"#DC2626", INCOMPLETE:"#6B7280", "N/A":"#9CA3AF" };
      const statusBgs    = { PASS:"#ECFDF5", ACTIVE:"#ECFDF5", FAIL:C.errorBg, FLAG:C.warningBg, WARNING:C.errorBg, INCOMPLETE:"#F9FAFB", "N/A":"#F9FAFB" };
      const StatusBadge = ({ status }) => (
        <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:700, letterSpacing:"0.3px",
          background: statusBgs[status] || "#F9FAFB", color: statusColors[status] || "#6B7280",
          border:`1px solid ${status === "PASS" || status === "ACTIVE" ? "#A7F3D0" : status === "FAIL" || status === "WARNING" ? "#FECACA" : status === "FLAG" ? C.warningBorder : "#E5E7EB"}` }}>
          {status}
        </span>
      );

      return (
        <div style={{ maxWidth:920, margin:"0 auto", padding:"20px 24px 80px" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:C.error, letterSpacing:"1.5px", textTransform:"uppercase", fontFamily:FONT, marginBottom:6 }}>CONFIDENTIAL — COMPLIANCE & SUPERVISORY USE ONLY</div>
              <h2 style={{ fontSize:24, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Compliance Review & Supervisory Approval</h2>
              <p style={{ fontSize:12, color:T.muted, fontFamily:FONT, lineHeight:1.6 }}>
                Ref: <strong style={{ color:G.forest }}>{confRef.current}</strong> · {nowDate} · Account: <strong>{cd.fullName}</strong>
              </p>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={() => setShowComplianceReview(false)} style={{
                display:"flex", alignItems:"center", gap:5, padding:"9px 14px",
                border:`1px solid ${N.border}`, borderRadius:8, background:N.card,
                fontSize:11, fontWeight:600, color:T.body, fontFamily:FONT, cursor:"pointer",
              }}>← Back</button>
              <button onClick={generateCompliancePDF} style={{
                display:"flex", alignItems:"center", gap:5, padding:"9px 14px",
                border:`1px solid ${NAVY[600]}`, borderRadius:8, background:NAVY[700],
                fontSize:11, fontWeight:600, color:T.white, fontFamily:FONT, cursor:"pointer",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Compliance PDF
              </button>
            </div>
          </div>

          {/* Summary Scorecard */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
            {[
              { label:"Total Checks", val:cd.totalChecks, color:G.deep, bg:N.section },
              { label:"Passed", val:cd.passCount, color:C.success, bg:C.successBg },
              { label:"Flagged", val:cd.flagCount, color:C.warning, bg:C.warningBg },
              { label:"Failed", val:cd.failCount, color:C.error, bg:C.errorBg },
              { label:"Incomplete", val:cd.incCount, color:T.muted, bg:N.section },
            ].map((m,i) => (
              <div key={i} style={{ textAlign:"center", padding:"14px 8px", background:m.bg, borderRadius:10, border:`1px solid ${N.border}` }}>
                <div style={{ fontSize:8, color:T.muted, textTransform:"uppercase", letterSpacing:"0.5px", fontFamily:FONT }}>{m.label}</div>
                <div style={{ fontSize:24, fontWeight:600, color:m.color, fontFamily:FONT, marginTop:2 }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Alert Banners */}
          {cd.failCount > 0 && (
            <div style={{ padding:"12px 16px", background:C.errorBg, borderRadius:10, border:`1px solid ${C.errorBorder}`, marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.error, fontFamily:FONT }}>🚫 BLOCKING ISSUES DETECTED: {cd.failCount} failure(s) must be resolved before trade execution.</div>
            </div>
          )}
          {cd.flagCount > 0 && (
            <div style={{ padding:"12px 16px", background:C.warningBg, borderRadius:10, border:`1px solid ${C.warningBorder}`, marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.warning, fontFamily:FONT }}>⚠️ FLAGS REQUIRING REVIEW: {cd.flagCount} item(s) flagged for enhanced supervisory review.</div>
            </div>
          )}
          {cd.failCount === 0 && cd.flagCount === 0 && (
            <div style={{ padding:"12px 16px", background:C.successBg, borderRadius:10, border:`1px solid ${C.success}30`, marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.success, fontFamily:FONT }}>✅ ALL CHECKS PASSED: No blocking issues or compliance flags. Eligible for standard processing.</div>
            </div>
          )}

          {/* ── Client Account & Trade Overview ── */}
          <div style={{ marginTop:18, marginBottom:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.deep, fontFamily:FONT, padding:"8px 12px", background:C.successBg, borderLeft:`3px solid ${G.forest}`, borderRadius:"0 6px 6px 0", marginBottom:10 }}>Client Account & Trade Overview</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, fontFamily:FONT }}>
                  <tbody>
                    {[
                      ["Account Holder", cd.fullName],
                      ["Account Type", acct.registrationCategory === "entity" ? `Entity — ${(acct.entityType||"").replace(/_/g," ")}` : `Individual — ${(acct.individualType||"individual").replace(/_/g," ")}`],
                      ["Transaction", acct.exchangeBusiness ? "1031 Exchange" : "Direct Investment"],
                      ["SSN / TIN", acct.ssn ? `●●●-●●-${acct.ssn.slice(-4)}` : "—"],
                      ["Accredited", `${acct.accredited || "—"} ${acct.accreditedBasis ? `(${acct.accreditedBasis.replace(/_/g," ")})` : ""}`],
                    ].map(([l,v],i) => (
                      <tr key={i}>
                        <td style={{ padding:"6px 10px", color:T.muted, borderBottom:`1px solid ${N.divider}`, width:"42%" }}>{l}</td>
                        <td style={{ padding:"6px 10px", fontWeight:500, borderBottom:`1px solid ${N.divider}` }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, fontFamily:FONT }}>
                  <tbody>
                    {[
                      ["Risk Tolerance", (acct.riskTolerance||"—").replace(/_/g," ")],
                      ["Time Horizon", (acct.timeHorizon||"—").replace(/_/g," ")],
                      ["Employment", acct.employmentStatus || "—"],
                      ["Senior Investor", isSeniorDetected.detected ? "YES — Enhanced review" : "No"],
                      ["Trusted Contact", acct.hasTrustedContact === "Yes" ? (acct.tcName || "Provided") : "Declined"],
                    ].map(([l,v],i) => (
                      <tr key={i}>
                        <td style={{ padding:"6px 10px", color:T.muted, borderBottom:`1px solid ${N.divider}`, width:"42%" }}>{l}</td>
                        <td style={{ padding:"6px 10px", fontWeight:500, borderBottom:`1px solid ${N.divider}` }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.deep, fontFamily:FONT, padding:"8px 12px", background:C.successBg, borderLeft:`3px solid ${G.forest}`, borderRadius:"0 6px 6px 0", marginBottom:10 }}>Investment / Trade Details</div>
            <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, fontFamily:FONT }}>
                <thead>
                  <tr style={{ background:N.section }}>
                    {["DST Property","Type","Sponsor","Investment","% of Total","Cash-on-Cash"].map((h,i) => (
                      <th key={i} style={{ padding:"8px 10px", textAlign:"left", fontWeight:700, fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:"0.3px", borderBottom:`2px solid ${N.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding:"7px 10px", fontWeight:600, borderBottom:`1px solid ${N.divider}` }}>{item.shortName}</td>
                      <td style={{ padding:"7px 10px", borderBottom:`1px solid ${N.divider}` }}>{item.propertyTypeShort}</td>
                      <td style={{ padding:"7px 10px", borderBottom:`1px solid ${N.divider}` }}>{item.sponsor || "—"}</td>
                      <td style={{ padding:"7px 10px", fontWeight:600, color:G.forest, borderBottom:`1px solid ${N.divider}` }}>{fmtFull(cart[item.id])}</td>
                      <td style={{ padding:"7px 10px", borderBottom:`1px solid ${N.divider}` }}>{(cart[item.id]/cartTotal*100).toFixed(1)}%</td>
                      <td style={{ padding:"7px 10px", borderBottom:`1px solid ${N.divider}` }}>{item.cashOnCash}%</td>
                    </tr>
                  ))}
                  <tr style={{ background:C.successBg, fontWeight:700 }}>
                    <td style={{ padding:"8px 10px" }}>TOTAL</td><td/><td/>
                    <td style={{ padding:"8px 10px", color:G.forest, fontSize:13 }}>{fmtFull(cartTotal)}</td>
                    <td style={{ padding:"8px 10px" }}>100%</td>
                    <td style={{ padding:"8px 10px" }}>{cd.avgYield.toFixed(2)}% wtd</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Position Summary */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.deep, fontFamily:FONT, padding:"8px 12px", background:C.successBg, borderLeft:`3px solid ${G.forest}`, borderRadius:"0 6px 6px 0", marginBottom:10 }}>Financial Position Summary</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, fontFamily:FONT }}>
                  <tbody>
                    {[
                      ["Total Assets", fmtFull(fsCalcs.totalAssets)],
                      ["Total Liabilities", fmtFull(fsCalcs.totalLiab)],
                      ["Net Worth", fmtFull(fsCalcs.netWorth)],
                      ["NW ex-Primary Residence", fmtFull(fsCalcs.netWorthExRes)],
                      ["Total Liquid Assets", fmtFull(fsCalcs.totalLiquid)],
                    ].map(([l,v],i) => (
                      <tr key={i}>
                        <td style={{ padding:"6px 10px", color:T.muted, borderBottom:`1px solid ${N.divider}`, width:"48%" }}>{l}</td>
                        <td style={{ padding:"6px 10px", fontWeight: i >= 2 ? 700 : 500, color: i === 3 ? G.forest : T.primary, borderBottom:`1px solid ${N.divider}` }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, fontFamily:FONT }}>
                  <tbody>
                    {[
                      ["Gross Annual Income", fmtFull(fsCalcs.grossInc)],
                      ["Debt-to-Asset Ratio", `${fsCalcs.debtToAsset.toFixed(1)}%`],
                      ["Emergency Reserve", fsCalcs.emergencyMonths !== null ? `${fsCalcs.emergencyMonths.toFixed(1)} months` : "N/A"],
                      ["Income Coverage", fsCalcs.incomeCoverage !== null ? `${fsCalcs.incomeCoverage.toFixed(2)}x` : "N/A"],
                      ["Investment % of Liquid", `${fsCalcs.investAsLiquidPct.toFixed(1)}%`],
                    ].map(([l,v],i) => (
                      <tr key={i}>
                        <td style={{ padding:"6px 10px", color:T.muted, borderBottom:`1px solid ${N.divider}`, width:"48%" }}>{l}</td>
                        <td style={{ padding:"6px 10px", fontWeight:500, borderBottom:`1px solid ${N.divider}` }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Concentration Analysis Matrix */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.deep, fontFamily:FONT, padding:"8px 12px", background:C.successBg, borderLeft:`3px solid ${G.forest}`, borderRadius:"0 6px 6px 0", marginBottom:10 }}>Concentration Analysis Matrix</div>
            <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10, fontFamily:FONT }}>
                <thead>
                  <tr style={{ background:N.section }}>{["Category","Pre ($)","Pre %","Post ($)","Post %","Δ","Limit","Status"].map((h,i) => (
                    <th key={i} style={{ padding:"7px 8px", textAlign:"left", fontWeight:700, fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:"0.2px", borderBottom:`2px solid ${N.border}` }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[
                    { label:"RE Securities", pre: fs.reSec, prePct: fsCalcs.preReSecPct, post: fsCalcs.postReSec2, postPct: fsCalcs.postReSecPct, delta: fsCalcs.deltaReSec, limit:"≤30%", check: fsCalcs.postConReSec, thresh:30 },
                    { label:"Non-RE Alts", pre: fs.nonReAlts, prePct: fsCalcs.preNonReAltsPct, post: fs.nonReAlts, postPct: fsCalcs.postNonReAltsPct, delta: 0, limit:"Monitor", check: 0, thresh:100 },
                    { label:"Interval Funds", pre: fs.intervalFunds, prePct: fsCalcs.preIntervalPct, post: fs.intervalFunds, postPct: fsCalcs.postIntervalPct, delta: 0, limit:"Monitor", check: 0, thresh:100 },
                    { label:"Total Illiquid", pre: fsCalcs.illiquid - fs.primary, prePct: fsCalcs.preAllIlliqPct, post: fsCalcs.postAllIlliq, postPct: fsCalcs.postAllIlliqPct, delta: fsCalcs.deltaAllIlliq, limit:"≤40%", check: fsCalcs.postConAlts, thresh:40, bold:true },
                    { label:"Single Offering", pre: null, prePct: null, post: cartTotal, postPct: fsCalcs.investAsNwPct, delta: null, limit:"≤25%", check: fsCalcs.investAsNwPct, thresh:25 },
                  ].map((r,i) => (
                    <tr key={i} style={{ background: r.bold ? N.section : "transparent", fontWeight: r.bold ? 700 : 400 }}>
                      <td style={{ padding:"6px 8px", borderBottom:`1px solid ${N.divider}` }}>{r.label}</td>
                      <td style={{ padding:"6px 8px", borderBottom:`1px solid ${N.divider}` }}>{r.pre !== null ? fmtA(r.pre) : "—"}</td>
                      <td style={{ padding:"6px 8px", borderBottom:`1px solid ${N.divider}` }}>{r.prePct !== null ? `${r.prePct.toFixed(1)}%` : "—"}</td>
                      <td style={{ padding:"6px 8px", borderBottom:`1px solid ${N.divider}` }}>{fmtA(r.post)}</td>
                      <td style={{ padding:"6px 8px", borderBottom:`1px solid ${N.divider}` }}>{r.postPct.toFixed(1)}%</td>
                      <td style={{ padding:"6px 8px", borderBottom:`1px solid ${N.divider}`, color: r.delta !== null && r.delta > 0 ? "#DC2626" : "#059669" }}>{r.delta !== null ? `+${r.delta.toFixed(1)}pp` : "—"}</td>
                      <td style={{ padding:"6px 8px", borderBottom:`1px solid ${N.divider}` }}>{r.limit}</td>
                      <td style={{ padding:"6px 8px", borderBottom:`1px solid ${N.divider}` }}><StatusBadge status={r.check <= r.thresh ? "PASS" : r.check <= r.thresh*1.5 ? "FLAG" : "WARNING"}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize:9, color:T.light, fontFamily:FONT, marginTop:4, lineHeight:1.5 }}>All percentages as % of Net Worth excluding Primary Residence ({fmtFull(fsCalcs.netWorthExRes)}). Per FINRA Regulatory Notice 12-03 and Stax Capital internal policy.</div>
          </div>

          {/* Detailed Compliance Checks */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.deep, fontFamily:FONT, padding:"8px 12px", background:C.successBg, borderLeft:`3px solid ${G.forest}`, borderRadius:"0 6px 6px 0", marginBottom:10 }}>Detailed Compliance Check Results</div>
            {cd.categories.map(cat => (
              <div key={cat} style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:6, paddingBottom:4, borderBottom:`1px solid ${N.divider}` }}>{cat}</div>
                <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
                  {cd.allChecks.filter(c => c.cat === cat).map((c,i) => (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"72px 1fr 180px auto", gap:8, padding:"8px 10px", alignItems:"flex-start",
                      borderBottom:`1px solid ${N.divider}`,
                      background: c.status === "FAIL" || c.status === "WARNING" ? C.errorBg : c.status === "FLAG" ? C.warningBg : "transparent" }}>
                      <StatusBadge status={c.status}/>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:T.primary, fontFamily:FONT }}>{c.check}</div>
                        <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:2, lineHeight:1.5 }}>{c.detail}</div>
                        {c.remedy && <div style={{ fontSize:10, color:C.error, fontFamily:FONT, marginTop:3, lineHeight:1.5 }}>↳ {c.remedy}</div>}
                      </div>
                      <div style={{ fontSize:9, color:T.light, fontFamily:FONT }}>{c.rule}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Runtime Compliance Flags */}
          {compFlags.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:13, fontWeight:700, color:G.deep, fontFamily:FONT, padding:"8px 12px", background:C.successBg, borderLeft:`3px solid ${G.forest}`, borderRadius:"0 6px 6px 0", marginBottom:10 }}>Runtime Compliance Flags ({compFlags.length})</div>
              <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
                {compFlags.map((f,i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"72px 1fr", gap:8, padding:"8px 10px", borderBottom:`1px solid ${N.divider}`,
                    background: f.type === "block" ? C.errorBg : f.type === "warn" ? C.warningBg : "transparent" }}>
                    <StatusBadge status={f.type === "block" ? "FAIL" : f.type === "warn" ? "FLAG" : "N/A"}/>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:T.primary, fontFamily:FONT }}>{f.msg}</div>
                      {f.detail && <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:2 }}>{f.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclosure & Acknowledgment Audit Trail */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:G.deep, fontFamily:FONT, padding:"8px 12px", background:C.successBg, borderLeft:`3px solid ${G.forest}`, borderRadius:"0 6px 6px 0", marginBottom:10 }}>Disclosure & Acknowledgment Audit Trail</div>
            <div style={{ background:N.card, borderRadius:10, border:`1px solid ${N.border}`, overflow:"hidden" }}>
              {Object.entries(disc).map(([k,v],i) => {
                const labels = { materialReviewed:"Reviewed all Offering Materials", offering:"Investment is highly speculative", illiquidity:"Investment is illiquid", risk:"Not financially dependent on distributions", noGuarantee:"No guarantees on performance", exchange1031:"1031 tax deferral may be challenged", concentration:"Reviewed concentration levels", additionalDebt:"Understands debt considerations", arbitration:"Pre-Dispute Arbitration Agreement", independentAdvice:"Sought independent advice", formCRS:"Receipt of Form CRS", regBI:"Receipt of Reg BI Disclosure", privacy:"Privacy Policy received", brokerCheck:"FINRA BrokerCheck acknowledgment", esign:"E-SIGN Act consent" };
                return (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderBottom:`1px solid ${N.divider}` }}>
                    <StatusBadge status={v ? "PASS" : "INCOMPLETE"}/>
                    <span style={{ flex:1, fontSize:11, color:T.body, fontFamily:FONT }}>{labels[k] || k}</span>
                    <span style={{ fontSize:9, color:T.light, fontFamily:FONT }}>{v ? nowDate : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Supervisory Approval Block ── */}
          <div style={{ padding:"20px 24px", background:N.section, borderRadius:12, border:`1px solid ${N.border}`, marginBottom:24 }}>
            <div style={{ fontSize:14, fontWeight:700, color:G.deep, fontFamily:FONT, marginBottom:6 }}>Supervisory Review & Approval</div>
            <p style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.7, marginBottom:16 }}>
              I have reviewed this account opening application, the associated compliance checks, concentration analysis, and all flagged items. I have determined that this investment is suitable for the investor based on the information provided and the investor's stated financial situation, investment objectives, risk tolerance, and time horizon. All flagged items have been reviewed and appropriate documentation has been obtained.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              {[
                { title:"Registered Representative", sub:"Print Name / CRD #" },
                { title:"Supervisory Principal", sub:"Print Name / CRD # / Date" },
              ].map((s,i) => (
                <div key={i}>
                  <div style={{ borderBottom:`2px solid ${G.forest}`, padding:"20px 0 4px", minHeight:44 }}/>
                  <div style={{ fontSize:9, color:T.light, fontFamily:FONT, marginTop:4 }}>{s.title}</div>
                  <div style={{ borderBottom:`2px solid ${G.forest}`, padding:"16px 0 4px", minHeight:36, marginTop:10 }}/>
                  <div style={{ fontSize:9, color:T.light, fontFamily:FONT, marginTop:4 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign:"center", padding:"16px 0", borderTop:`2px solid ${G.forest}` }}>
            <div style={{ fontSize:9, fontWeight:700, color:G.deep, fontFamily:FONT, letterSpacing:"2px", textTransform:"uppercase" }}>STAX CAPITAL, INC. — CONFIDENTIAL COMPLIANCE DOCUMENT</div>
            <div style={{ fontSize:9, color:T.muted, fontFamily:FONT, marginTop:4 }}>Retain per FINRA Rule 4511 / SEC Rule 17a-4. Minimum retention: 6 years from account close.</div>
          </div>
        </div>
      );
    }

    /* ═══════════════════════════════════════════════════════
       POST-SUBMIT CONFIRMATION SCREEN
       ═══════════════════════════════════════════════════════ */
    if (submitted) return (
      <div style={{ textAlign:"center", padding:"80px 20px", maxWidth:560, margin:"0 auto" }}>
        <div style={{ width:88, height:88, borderRadius:"50%", background:G.mint,
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 20px", fontSize:40, border:`3px solid ${G.forest}40` }}>✅</div>
        <h2 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:8 }}>Application Submitted</h2>
        <p style={{ fontSize:14, color:T.body, fontFamily:FONT, lineHeight:1.8, marginBottom:24 }}>
          Your DST investment application has been submitted to Stax Capital for review.
          A registered representative will contact you within 1–2 business days to finalize
          your subscription documents via DocuSign.
        </p>
        <div style={{ padding:"20px 24px", background:N.section, borderRadius:12, border:`1px solid ${N.border}`, marginBottom:16 }}>
          <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Confirmation Reference</div>
          <div style={{ fontSize:24, fontWeight:700, color:G.forest, fontFamily:FONT }}>{confRef.current}</div>
          <div style={{ fontSize:12, color:T.muted, fontFamily:FONT, marginTop:4 }}>{nowStr}</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, textAlign:"left", marginBottom:16 }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ padding:"12px 16px", background:N.card, borderRadius:10, border:`1px solid ${N.border}` }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:FONT }}>{item.shortName}</div>
              <div style={{ fontSize:15, fontWeight:700, color:G.forest, fontFamily:FONT, marginTop:2 }}>{fmtFull(cart[item.id])}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"12px 16px", background:C.infoBg, borderRadius:10, border:`1px solid ${C.infoBorder}`, marginBottom:20 }}>
          <div style={{ fontSize:12, color:C.info, fontFamily:FONT, lineHeight:1.5 }}>
            📧 A confirmation has been sent to <strong>{acct.email || "your email"}</strong>.
            Your Stax Capital representative will reach out within 1–2 business days.
          </div>
        </div>
        <button onClick={generatePDF} style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%",
          background:`linear-gradient(135deg, ${G.deep} 0%, ${G.forest} 100%)`, border:"none",
          borderRadius:10, padding:"14px 24px", fontSize:14, fontWeight:600, color:T.white,
          fontFamily:FONT, cursor:"pointer", marginBottom:6, boxShadow:"0 4px 12px rgba(27,94,59,0.3)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Application Package
        </button>
        <div style={{ fontSize:10, color:T.light, fontFamily:FONT, lineHeight:1.5, marginBottom:16 }}>Client-facing account opening package with all details, signatures, and representations.</div>
        <button onClick={() => setShowComplianceReview(true)} style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%",
          background:NAVY[700], border:"none", borderRadius:10, padding:"14px 24px", fontSize:14, fontWeight:600, color:T.white,
          fontFamily:FONT, cursor:"pointer", marginBottom:6, boxShadow:"0 4px 12px rgba(0,0,0,0.2)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>
          View Compliance Review
        </button>
        <div style={{ fontSize:10, color:T.light, fontFamily:FONT, lineHeight:1.5, marginBottom:12 }}>Supervisory review with all compliance checks, concentration matrix, and approval blocks.</div>
        {/* ── Next Steps ── */}
        <div style={{ marginTop:8, padding:"20px 24px", background:N.section, borderRadius:12, border:`1px solid ${N.border}`, textAlign:"left", marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:12 }}>What Happens Next?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { step:"1", title:"Application Review", desc:"Stax Capital will review your application and conduct its final suitability and compliance review within 1–2 business days." },
              { step:"2", title:"DocuSign Subscription Documents", desc:"Your registered representative will send you subscription documents via DocuSign for electronic signature." },
              { step:"3", title:"Fund Clearing", desc:"Upon execution, your investment funds will be directed to the QI or directly to the DST sponsor per your distribution instructions." },
              { step:"4", title:"Investor Portal Access", desc:"You will receive access to your investor portal to monitor distributions, tax documents (K-1), and portfolio performance." },
            ].map(({ step: s, title, desc }) => (
              <div key={s} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:G.forest, color:T.white, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:FONT }}>{s}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:FONT }}>{title}</div>
                  <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.5, marginTop:2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:8, fontSize:12, color:T.muted, fontFamily:FONT, textAlign:"center", paddingTop:8, borderTop:`1px solid ${N.border}` }}>
          Questions? Call <strong>844-427-1031</strong> · Email <strong>invest@staxai.com</strong> · Visit <strong>staxai.com</strong>
        </div>
      </div>
    );

    /* ═══════════════════════════════════════════
       MAIN REVIEW & SIGN FORM (pre-submit)
       ═══════════════════════════════════════════ */

    const fullName   = [acct.title, acct.firstName, acct.middleName, acct.lastName].filter(Boolean).join(" ") || "—";
    const fullAddr   = [acct.street, acct.city, acct.state && acct.zip ? `${acct.state} ${acct.zip}` : (acct.state || acct.zip), acct.country].filter(Boolean).join(", ") || "—";
    const mailingAddr= acct.hasDiffMailing ? [acct.mailingStreet, acct.mailingCity, acct.mailingState, acct.mailingZip].filter(Boolean).join(", ") : "Same as residential";
    const acctTypeLabel = acct.registrationCategory === "individual"
      ? (acct.individualType || "Individual").replace(/_/g," ")
      : (acct.entityType || acct.registrationCategory || "—").replace(/_/g," ");
    const fmtA = n => `$${Math.round(n).toLocaleString()}`;

    /* ── Inline edit save handler — validates required fields before dismissing ── */
    const handleEditSave = () => {
      setEditValidation(true);
      setTimeout(() => {
        const firstErr = document.querySelector(".stax-input.has-error, .stax-select.has-error, [data-field-error='true']");
        if (!firstErr) {
          setEditSection(null);
          setEditValidation(false);
        } else {
          // Scroll to the first inline error
          const top = firstErr.getBoundingClientRect().top + window.pageYOffset - 110;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
          if (firstErr.classList.contains("stax-input") || firstErr.classList.contains("stax-select")) {
            firstErr.focus({ preventScroll: true });
          } else {
            if (!firstErr.hasAttribute("tabindex")) firstErr.setAttribute("tabindex", "-1");
            firstErr.focus({ preventScroll: true });
          }
          firstErr.classList.add("stax-field-highlight");
          setTimeout(() => firstErr.classList.remove("stax-field-highlight"), 900);
        }
      }, 50);
    };

    /* ── Inline edit save/cancel row ── */
    const EditActions = ({ sectionKey }) => (
      <div style={{ display:"flex", gap:8, marginTop:16, paddingTop:14, borderTop:`1px solid ${N.border}` }}>
        <button type="button" onClick={handleEditSave}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:8, border:`1px solid ${G.forest}`, background:G.forest, color:T.white, fontSize:12, fontWeight:600, fontFamily:FONT, cursor:"pointer" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17L4 12"/></svg>
          Save Changes
        </button>
        <button type="button" onClick={() => { setEditSection(null); setEditValidation(false); }}
          style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${N.border}`, background:N.card, color:T.body, fontSize:12, fontWeight:500, fontFamily:FONT, cursor:"pointer" }}>
          Cancel
        </button>
      </div>
    );

    return (
      <div style={{ maxWidth:860, margin:"0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom:28, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20 }}>
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:28, fontWeight:700, color:T.primary, fontFamily:FONT, margin:"0 0 8px", letterSpacing:"-0.02em" }}>You're Almost Done — Let's Review Everything</h1>
            <p style={{ fontSize:15, color:T.body, fontFamily:FONT, margin:0, lineHeight:1.6, maxWidth:580 }}>
              This is the final step. Please take your time and review your information below — if anything looks wrong, you can go back and correct it. When everything looks good, sign at the bottom and submit your application.
            </p>
          </div>
          <div style={{ flexShrink:0, marginTop:4 }}>
            <button onClick={generatePDF} style={{
              display:"flex", alignItems:"center", gap:6, padding:"10px 16px",
              border:`1px solid ${N.border}`, borderRadius:8, background:N.card,
              fontSize:12, fontWeight:600, color:T.body, fontFamily:FONT, cursor:"pointer",
              boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Client PDF
            </button>
          </div>
        </div>

        {/* ── Compliance Banners ── */}
        {blockFlags.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.error, fontFamily:FONT, marginBottom:8 }}>Blocking Compliance Issues — Must Resolve Before Submission</div>
            {blockFlags.map((f,i) => <FlagAlert key={`b${i}`} type="block" msg={f.msg} detail={f.detail}/>)}
          </div>
        )}
        {warnFlags.length > 0 && (
          <div style={{ marginBottom:16 }}>
            {warnFlags.map((f,i) => <FlagAlert key={`w${i}`} type="warn" msg={f.msg} detail={f.detail}/>)}
          </div>
        )}
        {infoFlags.length > 0 && (
          <div style={{ marginBottom:16 }}>
            {infoFlags.map((f,i) => <FlagAlert key={`f${i}`} type="flag" msg={f.msg} detail={f.detail}/>)}
          </div>
        )}
        {blockFlags.length === 0 && nonBlockFlags.length === 0 && (
          <div style={{ padding:"11px 16px", background:G.mint, borderRadius:10, border:`1px solid ${G.forest}30`, marginBottom:22, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>✅</span>
            <span style={{ fontSize:12, fontWeight:600, color:G.forest, fontFamily:FONT }}>No compliance issues detected. Application is eligible for processing.</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
           COMPLIANCE FLAG ACCEPTANCE AGREEMENT
           ══════════════════════════════════════════════════ */}
        {requiresFlagAcceptance && blockFlags.length === 0 && (
          <div style={{ marginBottom:24, background:N.card, borderRadius:14,
              border: allFlagsAcked ? `2px solid ${G.forest}40` : `2px solid ${A.amber}60`,
              boxShadow: allFlagsAcked ? `0 0 0 3px ${G.forest}10` : `0 0 0 3px ${A.amber}10`,
              overflow:"hidden" }}>

            {/* Agreement Header */}
            <div style={{
              background: allFlagsAcked ? `linear-gradient(135deg, ${G.darkest}, ${G.deep})` : `linear-gradient(135deg, #78350F, #92400E)`,
              padding:"20px 28px", display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:T.white, fontFamily:FONT, letterSpacing:"-0.3px" }}>
                  {allFlagsAcked ? "✓ Compliance Disclosure Accepted" : "Compliance Disclosure & Acceptance Required"}
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontFamily:FONT, marginTop:3 }}>
                  Stax Capital, Inc. — Concentration Acknowledgement, Understanding & Acceptance Agreement
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px" }}>Flags</div>
                <div style={{ fontSize:22, fontWeight:600, color:T.white, fontFamily:FONT }}>{nonBlockFlags.filter(f => flagAcks[f.id]).length} / {nonBlockFlags.length}</div>
              </div>
            </div>

            <div style={{ padding:"24px 28px" }}>

              {/* Preamble */}
              <div style={{ fontSize:12, color:T.body, fontFamily:FONT, lineHeight:1.8, marginBottom:20,
                  padding:"16px 20px", background:C.warningBg, borderRadius:10, border:`1px solid ${C.warningBorder}` }}>
                <div style={{ fontWeight:700, color:C.warning, marginBottom:6, fontSize:13 }}>NOTICE TO INVESTOR</div>
                During the review of your investment application, the following compliance flag(s) have been identified
                that require your specific acknowledgment, understanding, and acceptance before Stax Capital can process
                your investment. Each flag below represents a condition, risk factor, or suitability consideration that
                has been identified based on the information you have provided. You are required to read, understand,
                and individually acknowledge each item. By signing this agreement, you confirm you have been advised
                of these matters and are voluntarily electing to proceed with your investment(s).
              </div>

              {/* Progress */}
              <div style={{ padding:"12px 16px", background:N.section, borderRadius:10,
                  border:`1px solid ${N.border}`, marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:FONT }}>
                    Flag Acknowledgment Progress
                  </span>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:FONT,
                      color: nonBlockFlags.every(f => flagAcks[f.id]) ? G.forest : A.amber }}>
                    {nonBlockFlags.filter(f => flagAcks[f.id]).length} of {nonBlockFlags.length} acknowledged
                  </span>
                </div>
                <div style={{ height:6, background:N.border, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, transition:"width 0.3s",
                      width:`${nonBlockFlags.length > 0 ? nonBlockFlags.filter(f => flagAcks[f.id]).length / nonBlockFlags.length * 100 : 0}%`,
                      background: nonBlockFlags.every(f => flagAcks[f.id])
                        ? `linear-gradient(90deg, ${G.forest}, ${G.light})`
                        : `linear-gradient(90deg, ${A.amber}, #F59E0B)` }}/>
                </div>
              </div>

              {/* Individual Flag Items */}
              {nonBlockFlags.map((flag, idx) => {
                const isAcked = flagAcks[flag.id] || false;
                const typeLabel = flag.type === "warn" ? "WARNING" : "NOTICE";
                const typeBg    = flag.type === "warn" ? C.errorBg : C.warningBg;
                const typeBorder= flag.type === "warn" ? C.errorBorder : C.warningBorder;
                const typeColor = flag.type === "warn" ? C.error : C.warning;
                return (
                  <div key={flag.id} style={{ marginBottom:16, borderRadius:12, overflow:"hidden",
                    border: isAcked ? `2px solid ${G.forest}40` : `2px solid ${typeBorder}`,
                    background: isAcked ? `${G.mint}40` : N.card, transition:"all 0.3s" }}>
                    <div style={{ padding:"12px 18px", display:"flex", alignItems:"center", gap:10,
                      background: isAcked ? `${G.forest}10` : typeBg, borderBottom: isAcked ? `1px solid ${G.forest}20` : `1px solid ${typeBorder}` }}>
                      <span style={{ display:"flex", alignItems:"center", color: isAcked ? G.forest : typeColor }}>{React.cloneElement(isAcked ? IC.shield : flag.type === "warn" ? IC.alertTriangle : IC.info, { width:15, height:15, strokeWidth:1.75 })}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:9, fontWeight:700, color: isAcked ? G.forest : typeColor, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"1px", marginBottom:2 }}>
                          {isAcked ? "ACKNOWLEDGED" : `FLAG ${idx + 1} — ${typeLabel}`}
                        </div>
                        <div style={{ fontSize:12, fontWeight:600, color: isAcked ? G.deep : T.primary, fontFamily:FONT, lineHeight:1.4 }}>{flag.msg}</div>
                      </div>
                    </div>
                    <div style={{ padding:"14px 18px" }}>
                      <div style={{ fontSize:11, color:T.body, fontFamily:FONT, lineHeight:1.7, padding:"12px 16px", background:N.section, borderRadius:8, border:`1px solid ${N.border}`, marginBottom:14 }}>
                        {flag.detail || flag.msg}
                      </div>
                      <CheckBox
                        checked={isAcked}
                        onChange={v => setFlagAcks(prev => ({ ...prev, [flag.id]: v }))}
                        label="I acknowledge and accept this risk"
                        description="I have reviewed the above disclosure, understand the associated risk, and am voluntarily electing to proceed."
                      />
                    </div>
                  </div>
                );
              })}

              {/* ── HOLD HARMLESS AGREEMENT ── */}
              <div style={{ marginTop:8, borderRadius:12, overflow:"hidden",
                border: flagHoldHarmless ? `2px solid ${G.forest}40` : `2px solid ${N.border}`,
                background: flagHoldHarmless ? `${G.mint}30` : N.card }}>
                <div style={{ padding:"14px 18px",
                  background: flagHoldHarmless ? `linear-gradient(135deg, ${G.darkest}, ${G.deep})` : "linear-gradient(135deg, #1E293B, #334155)" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:T.white, fontFamily:FONT }}>
                    {flagHoldHarmless ? "✓ Hold Harmless Agreement Accepted" : "Hold Harmless Agreement"}
                  </div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontFamily:FONT, marginTop:2 }}>Required for benefit of Stax Capital, Inc. and its Representatives</div>
                </div>
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ fontSize:11, color:T.body, fontFamily:FONT, lineHeight:1.85, padding:"16px 20px", background:N.bgAlt, borderRadius:10, border:`1px solid ${N.border}`, marginBottom:16, maxHeight:280, overflowY:"auto" }}>
                    <div style={{ fontWeight:700, color:T.primary, marginBottom:10, fontSize:12 }}>CONCENTRATION ACKNOWLEDGEMENT, UNDERSTANDING AND ACCEPTANCE</div>
                    <p style={{ margin:"0 0 10px" }}>
                      I, as Purchaser and signee in this agreement (which term includes myself or any other related party with
                      signatory powers on behalf of the Purchaser), agree that I am voluntarily seeking to purchase an investment
                      through Stax Capital. In connection with such voluntary intent, I hereby agree, in favor of <strong>Stax Capital,
                      Inc., a California corporation, and each of its registered representatives</strong> (collectively, "Stax Capital"), as follows:
                    </p>
                    <p style={{ margin:"0 0 10px", paddingLeft:16 }}>
                      <strong>1.</strong> I have thoroughly reviewed the investment concentration summary pertaining to my personal
                      circumstances and am comfortable with the proposed concentration levels and additional risks that will
                      result from this and other purchases being made at this time.
                    </p>
                    <p style={{ margin:"0 0 10px", paddingLeft:16 }}>
                      <strong>2.</strong> I have <strong>discussed the concept of over-concentration risk</strong> with Stax Capital and have been advised
                      of the additional risk that over-concentration may have on my overall portfolio of investments. I further
                      accept and acknowledge that I have had ample opportunity to discuss such over-concentration risk with my
                      own independent legal, tax, or other advisors. I further acknowledge that I have had all questions related to
                      over-concentration risk addressed and resolved and I am satisfied and comfortable with any current
                      over-concentration risk.
                    </p>
                    <p style={{ margin:"0 0 10px", paddingLeft:16 }}>
                      <strong>3.</strong> I acknowledge and understand that, despite any potential benefits of the Investment (including
                      and without limitation, certain tax benefits), as advised by Stax Capital, <strong>I should consider a diversification
                      of my investments as opposed to an over-concentration</strong>. I further acknowledge that it may be advisable to
                      acquire investments which are not concentrated in a specific asset type, directly correlated to one another
                      through similar investment type, geographic locations, management, asset class or type, etc.
                    </p>
                    <p style={{ margin:"0 0 10px", paddingLeft:16 }}>
                      <strong>4.</strong> I have been advised by Stax Capital of a <strong>material increase in the total level of risk</strong> in
                      connection with the purchase of the contemplated Investment, taking into consideration the associated
                      over-concentration, paired with the other risks as disclosed in the Offering Materials related to the Investment.
                    </p>
                    <p style={{ margin:"0 0 10px", paddingLeft:16 }}>
                      <strong>5.</strong> I have reviewed my pre and post investment concentration figures and percentages and I am
                      <strong> electing to proceed with the current investments based on my own determination of the suitability</strong> of
                      the investments given my personal circumstances.
                    </p>
                    <p style={{ margin:"0 0 10px", paddingLeft:16 }}>
                      <strong>6.</strong> If I exceed the 30% concentration level in alternative investments, I am doing so at my own
                      discretion (unsolicited) and <strong>will hold Stax Capital, Inc. and any of its registered or other representatives
                      harmless</strong> should I realize losses associated with the proposed investments. I will only move forward with
                      said investments if they are suitable for my given circumstances specifically related to risk tolerance,
                      liquidity needs, investment product type or strategy and all other areas of suitability.
                    </p>
                    <p style={{ margin:"0 0 10px", paddingLeft:16 }}>
                      <strong>7.</strong> In order to process the Purchaser's acquisition of the Investment, Stax Capital intends to and
                      shall rely upon the information contained in this agreement and related documents, particularly the figures
                      which disclose the investor's overall concentration in real estate securities, conventional real estate holdings,
                      and 1031 information gathered and contained in this document, as the same being unique to the purchaser.
                    </p>
                    <div style={{ marginTop:14, padding:"10px 14px", background:C.errorBg, borderRadius:8, border:`1px solid ${C.errorBorder}` }}>
                      <div style={{ fontWeight:700, fontSize:11, color:C.error, marginBottom:4 }}>HOLD HARMLESS PROVISION</div>
                      <div style={{ fontSize:11, color:C.error, lineHeight:1.6 }}>
                        The Purchaser agrees to hold Stax Capital, Inc., a California Corporation, and all of its registered
                        representatives, officers, directors, affiliates, and associated persons (collectively "Released Parties")
                        harmless from and against any and all claims, damages, losses, liabilities, costs, and expenses arising
                        from or related to the Purchaser's voluntary election to proceed with the contemplated investment(s),
                        including but not limited to any losses resulting from over-concentration, additional debt assumption,
                        illiquidity, market conditions, or any of the specific risk factors identified and acknowledged in this
                        Compliance Disclosure and Acceptance Agreement.
                      </div>
                    </div>
                  </div>

                  {/* Concentration Summary Table */}
                  {/* ── Concentration Summary Table (inline in agreement) ── */}
                  {fsCalcs.totalAssets > 0 && fsCalcs.netWorthExRes > 0 && (
                    <div style={{ marginBottom:16, padding:"14px 16px", background:N.section, borderRadius:10, border:`1px solid ${N.border}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:10 }}>
                        Investment Concentration Summary
                      </div>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, fontFamily:FONT }}>
                        <thead>
                          <tr style={{ borderBottom:`2px solid ${N.border}` }}>
                            <th style={{ textAlign:"left", padding:"6px 8px", color:T.muted, fontWeight:600, fontSize:10 }}>Allocation Category</th>
                            <th style={{ textAlign:"right", padding:"6px 8px", color:T.muted, fontWeight:600, fontSize:10 }}>Pre-Investment</th>
                            <th style={{ textAlign:"right", padding:"6px 8px", color:T.muted, fontWeight:600, fontSize:10 }}>Post-Investment</th>
                            <th style={{ textAlign:"right", padding:"6px 8px", color:T.muted, fontWeight:600, fontSize:10 }}>Change</th>
                            <th style={{ textAlign:"center", padding:"6px 8px", color:T.muted, fontWeight:600, fontSize:10 }}>Guideline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { cat:"Equity in RE Securities", pre:fsCalcs.preReSecPct, post:fsCalcs.postReSecPct, preAmt:fs.reSec, postAmt:fsCalcs.postReSec2, thresh:50 },
                            { cat:"Non-RE Alternative Inv.", pre:fsCalcs.preNonReAltsPct, post:fsCalcs.postNonReAltsPct, preAmt:fs.nonReAlts, postAmt:fs.nonReAlts, thresh:null },
                            { cat:"Interval Funds", pre:fsCalcs.preIntervalPct, post:fsCalcs.postIntervalPct, preAmt:fs.intervalFunds, postAmt:fs.intervalFunds, thresh:null },
                            { cat:"All Illiquid Securities", pre:fsCalcs.preAllIlliqPct, post:fsCalcs.postAllIlliqPct, preAmt:fsCalcs.illiquid - fs.primary, postAmt:fsCalcs.postAllIlliq, thresh:60 },
                          ].map(({ cat, pre, post, preAmt, postAmt, thresh }) => {
                            const exceeds = thresh && post > thresh;
                            return (
                              <tr key={cat} style={{ borderBottom:`1px solid ${N.divider}`, background: exceeds ? "#FEF2F210" : "transparent" }}>
                                <td style={{ padding:"8px 8px", color:T.body, fontWeight:500 }}>
                                  {cat}
                                  {exceeds && <span style={{ color:A.red, marginLeft:4, fontSize:10 }}>⚠</span>}
                                </td>
                                <td style={{ padding:"8px 8px", textAlign:"right", color:T.body }}>
                                  <div>{pre.toFixed(1)}%</div>
                                  <div style={{ fontSize:9, color:T.muted }}>{preAmt > 0 ? fmtFull(preAmt) : "—"}</div>
                                </td>
                                <td style={{ padding:"8px 8px", textAlign:"right", fontWeight:700, color: exceeds ? A.red : G.forest }}>
                                  <div>{post.toFixed(1)}%</div>
                                  <div style={{ fontSize:9, color:T.muted, fontWeight:400 }}>{postAmt > 0 ? fmtFull(postAmt) : "—"}</div>
                                </td>
                                <td style={{ padding:"8px 8px", textAlign:"right", color: post > pre ? A.amber : T.muted, fontWeight:600 }}>
                                  {post > pre ? `+${(post - pre).toFixed(1)}pp` : "—"}
                                </td>
                                <td style={{ padding:"8px 8px", textAlign:"center", color: exceeds ? A.red : T.muted }}>
                                  {thresh ? `≤${thresh}%` : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div style={{ marginTop:8, display:"flex", justifyContent:"space-between", fontSize:10, color:T.muted, fontFamily:FONT }}>
                        <span>Net Worth ex-Primary Residence: <strong style={{ color:G.forest }}>{fmtFull(fsCalcs.netWorthExRes)}</strong></span>
                        <span>Proposed Investment: <strong style={{ color:G.deep }}>{fmtFull(cartTotal)}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Hold Harmless Acceptance Checkbox */}
                  <CheckBox
                    checked={flagHoldHarmless}
                    onChange={v => setFlagHoldHarmless(v)}
                    label="I Accept the Hold Harmless Agreement & All Compliance Disclosures"
                    description="I hereby agree, for the benefit of Stax Capital, Inc. and all of its registered representatives, officers, directors, and affiliates, that I have thoroughly reviewed the compliance flags, concentration figures, and risk disclosures above. I accept all identified risks and hold all Released Parties harmless from any claims, losses, or liabilities arising from my voluntary election to proceed with the contemplated investment(s). I acknowledge that Stax Capital intends to rely upon this acceptance in processing my acquisition."
                  />

                  {/* Digital Signature for Flag Agreement */}
                  <div style={{ marginTop:16, padding:"16px 18px", background:N.section, borderRadius:10, border:`1px solid ${N.border}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:10 }}>
                      Electronic Signature — Compliance Disclosure Acceptance
                    </div>
                    <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, lineHeight:1.5, marginBottom:12 }}>
                      By typing your full legal name below, you are electronically signing this Compliance Disclosure
                      &amp; Acceptance Agreement and Hold Harmless provision, equivalent to a handwritten signature
                      per the Electronic Signatures in Global and National Commerce Act (E-SIGN).
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <div>
                        <label style={{ display:"block", fontSize:10, fontWeight:600, color:T.body, fontFamily:FONT, marginBottom:4 }}>Full Legal Name *</label>
                        <input type="text" value={flagSig} onChange={e => setFlagSig(e.target.value)} placeholder="Type full legal name"
                          style={{ width:"100%", padding:"10px 14px", borderRadius:8, border: flagSig.trim().length > 2 ? `2px solid ${G.forest}` : `1px solid ${N.border}`, fontSize:14, fontFamily:"'Georgia', serif", fontStyle:"italic", color:G.deep, background: flagSig.trim().length > 2 ? `${G.mint}40` : N.card, outline:"none", boxSizing:"border-box" }}/>
                        {flagSig.trim().length > 2 && <div style={{ fontSize:9, color:G.forest, fontFamily:FONT, marginTop:4 }}>✓ Signed as "{flagSig}" — {nowStr}</div>}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", justifyContent:"center" }}>
                        <div style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>Date of Acceptance</div>
                        <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT }}>{nowStr}</div>
                        <div style={{ fontSize:9, color:T.light, fontFamily:FONT, marginTop:2 }}>Ref: {confRef.current}</div>
                      </div>
                    </div>
                  </div>

                  {/* Completion Status */}
                  <div style={{ marginTop:14, padding:"12px 16px", borderRadius:10, display:"flex", alignItems:"center", gap:10,
                    background: allFlagsAcked ? G.mint : C.warningBg, border: allFlagsAcked ? `1px solid ${G.forest}40` : "1px solid #FDE68A" }}>
                    <span style={{ display:"flex", alignItems:"center", color: allFlagsAcked ? G.forest : "#78350F" }}>{React.cloneElement(allFlagsAcked ? IC.shield : IC.refreshCw, { width:16, height:16, strokeWidth:1.75 })}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, fontFamily:FONT, color: allFlagsAcked ? G.forest : "#78350F" }}>
                        {allFlagsAcked ? "Compliance Disclosure Complete" : "Compliance Disclosure Incomplete"}
                      </div>
                      <div style={{ fontSize:10, color: allFlagsAcked ? G.deep : T.body, fontFamily:FONT }}>
                        {allFlagsAcked ? "All flags acknowledged, hold harmless accepted, and signature provided."
                          : `${nonBlockFlags.filter(f => flagAcks[f.id]).length}/${nonBlockFlags.length} flags acknowledged${!flagHoldHarmless ? " · Hold harmless not accepted" : ""}${flagSig.trim().length < 3 ? " · Signature required" : ""}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Review Card ── */}
        <div style={{ background:N.card, borderRadius:14, border:`1px solid ${N.border}`, boxShadow:"0 2px 16px rgba(0,0,0,0.05)", overflow:"hidden", marginBottom:20 }}>
          <div style={{ padding:"28px 32px" }}>
            {/* Account Information */}
            <ReviewSection title="Account Information">
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <tbody>
                  <DR label="Customer Type" value={acct.registrationCategory === "entity" ? "Entity" : "Individual"}/>
                  <DR label="Account Title" value={acct.registrationCategory === "entity" ? (acct.entityName || "—") : fullName}/>
                  <DR label="Account Type" value={acctTypeLabel}/>
                  <DR label="Co-Applicant" value={acct.hasCoApplicant ? `${acct.coFirstName || ""} ${acct.coLastName || ""}`.trim() || "—" : "None"}/>
                  <DR label="1031 Exchange" value={acct.exchangeBusiness ? "Yes — 1031 Exchange Designation" : "No — Direct Investment"}/>
                </tbody>
              </table>
            </ReviewSection>

            {/* 1031 Exchange Details (conditional) */}
            {acct.exchangeBusiness && (<>
              <div style={{ height:1, background:N.divider, margin:"4px 0 24px" }}/>
              <ReviewSection title="1031 Exchange Details" onEdit={() => setEditSection(editSection === "1031" ? null : "1031")}>
                {editSection === "1031" ? (
                  <ValidationCtx.Provider value={editValidation}>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <TInput label="Street Address" value={acct.rp_address||""} onChange={v => updAcct("rp_address",v)} placeholder="Street address"/>
                      <TInput label="City" value={acct.rp_city||""} onChange={v => updAcct("rp_city",v)} placeholder="City"/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <TSelect label="State" value={acct.rp_state||""} onChange={v => updAcct("rp_state",v)} options={US_STATES}/>
                      <TSelect label="Property Type" value={acct.rp_propertyType||""} onChange={v => updAcct("rp_propertyType",v)}
                        options={["single_family","multi_family","commercial","industrial","mixed_use","land","other"].map(v=>({value:v,label:v.replace(/_/g," ")}))}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <DateInput label="Date of Sale" value={acct.rp_dateOfSale||""} onChange={v => updAcct("rp_dateOfSale",v)}/>
                      <DateInput label="Exchange Start Date" value={acct.exchangeStartDate||""} onChange={v => updAcct("exchangeStartDate",v)}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      <CurrencyInput label="Sale Price" value={acct.rp_salePrice} onChange={v => updAcct("rp_salePrice",v)}/>
                      <CurrencyInput label="Accumulated Depreciation" value={acct.rp_accumulatedDepreciation} onChange={v => updAcct("rp_accumulatedDepreciation",v)}/>
                    </div>
                    <div style={{ borderTop:`1px solid ${N.border}`, paddingTop:14 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:10 }}>Qualified Intermediary</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                        <TInput label="Contact Name" value={acct.qiContactName||""} onChange={v => updAcct("qiContactName",v)}/>
                        <TInput label="Company" value={acct.qiCompany||""} onChange={v => updAcct("qiCompany",v)}/>
                        <TInput label="Email" value={acct.qiEmail||""} onChange={v => updAcct("qiEmail",v)}/>
                        <TInput label="Exchange Number" value={acct.qiExchangeNumber||""} onChange={v => updAcct("qiExchangeNumber",v)}/>
                      </div>
                    </div>
                    <EditActions sectionKey="1031"/>
                  </div>
                  </ValidationCtx.Provider>
                ) : (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <tbody>
                          <DR label="Relinquished Property" value={[acct.rp_address, acct.rp_city, acct.rp_state, acct.rp_zip].filter(Boolean).join(", ") || "—"}/>
                          <DR label="Property Type" value={(acct.rp_propertyType || "—").replace(/_/g," ")}/>
                          <DR label="Date of Sale" value={acct.rp_dateOfSale || "—"}/>
                          <DR label="Sale Price" value={acct.rp_salePrice ? fmtFull(acct.rp_salePrice) : "—"}/>
                          <DR label="Adjusted Cost Basis" value={acct.rp_originalPurchasePrice ? fmtFull(acct.rp_originalPurchasePrice + acct.rp_improvements - acct.rp_accumulatedDepreciation) : "—"}/>
                          <DR label="Accum. Depreciation" value={acct.rp_accumulatedDepreciation ? fmtFull(acct.rp_accumulatedDepreciation) : "—"}/>
                        </tbody>
                      </table>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <tbody>
                          <DR label="Est. Tax Liability" value={typeof acct.estimatedTaxLiability === "number" && acct.estimatedTaxLiability > 0 ? fmtFull(acct.estimatedTaxLiability) : (acct.estimatedTaxLiability || "—")}/>
                          <DR label="Tax Impact on Risk" value={(acct.taxImpactOnRisk || "—").replace(/_/g," ")}/>
                          <DR label="Debt Retired" value={acct.rp_debtRetired || acct.rp_existingMortgage ? fmtFull(acct.rp_debtRetired || acct.rp_existingMortgage) : "—"}/>
                          <DR label="Replacement Debt" value={acct.replacementDebt ? fmtFull(acct.replacementDebt) : "—"}/>
                          <DR label="Exchange Start Date" value={acct.exchangeStartDate || "—"}/>
                          <DR label="Escrow Closed" value={acct.escrowClosed || "—"}/>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${N.divider}` }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.body, fontFamily:FONT, marginBottom:8 }}>Qualified Intermediary</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                          <tbody>
                            <DR label="Contact Name" value={acct.qiContactName || "—"}/>
                            <DR label="Company" value={acct.qiCompany || "—"}/>
                            <DR label="Address" value={[acct.qiAddress, acct.qiCity, acct.qiState, acct.qiZip].filter(Boolean).join(", ") || "—"}/>
                          </tbody>
                        </table>
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                          <tbody>
                            <DR label="Phone" value={acct.qiCell || acct.qiBusiness || "—"}/>
                            <DR label="Email" value={acct.qiEmail || "—"}/>
                            <DR label="Exchange Number" value={acct.qiExchangeNumber || "—"}/>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </ReviewSection>
            </>)}

            <div style={{ height:1, background:N.divider, margin:"4px 0 24px" }}/>

            {/* Primary Account Holder */}
            <ReviewSection title="Primary Account Holder Information" onEdit={() => setEditSection(editSection === "holder" ? null : "holder")}>
              {editSection === "holder" ? (
                <ValidationCtx.Provider value={editValidation}>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                    <TInput label="First Name" required value={acct.firstName||""} onChange={v => updAcct("firstName",v)}/>
                    <TInput label="Middle Name" value={acct.middleName||""} onChange={v => updAcct("middleName",v)}/>
                    <TInput label="Last Name" required value={acct.lastName||""} onChange={v => updAcct("lastName",v)}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <DateInput label="Date of Birth" required value={acct.dob||""} onChange={v => updAcct("dob",v)}/>
                    <TSelect label="Country of Citizenship" value={acct.citizenship||""} onChange={v => updAcct("citizenship",v)} options={["United States","Canada","United Kingdom","Other"]}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <PhoneInput label="Primary Phone" required value={acct.phone||""} onChange={v => updAcct("phone",v)}/>
                    <EmailInput label="Email Address" required value={acct.email||""} onChange={v => updAcct("email",v)}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <TInput label="Street Address" required value={acct.street||""} onChange={v => updAcct("street",v)} placeholder="Street address"/>
                    <TInput label="City" required value={acct.city||""} onChange={v => updAcct("city",v)}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                    <TSelect label="State" required value={acct.state||""} onChange={v => updAcct("state",v)} options={US_STATES}/>
                    <ZipInput label="ZIP Code" required value={acct.zip||""} onChange={v => updAcct("zip",v)}/>
                    <TSelect label="Country" value={acct.country||""} onChange={v => updAcct("country",v)} options={["United States","Canada","Other"]}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <TSelect label="Employment Status" required value={acct.employmentStatus||""} onChange={v => updAcct("employmentStatus",v)} options={["Employed","Self-Employed","Retired","Not Employed"]}/>
                    <TSelect label="Household Status" value={acct.householdStatus||""} onChange={v => updAcct("householdStatus",v)} options={["Single","Married","Divorced","Widowed","Domestic Partnership"]}/>
                  </div>
                  <EditActions sectionKey="holder"/>
                </div>
                </ValidationCtx.Provider>
              ) : (
              <React.Fragment>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <tbody>
                      <DR label="Full Name" value={fullName}/>
                      <DR label="Date of Birth" value={acct.dob || "—"}/>
                      <DR label="Citizenship" value={acct.citizenship || "United States"}/>
                      <DR label="ID Type" value={acct.idType || "—"}/>
                      <DR label="ID Number" value={acct.idNumber ? `●●●●${acct.idNumber.slice(-4)}` : "—"}/>
                      <DR label="SSN / TIN" value={acct.ssn ? `●●●-●●-${acct.ssn.slice(-4)}` : "—"}/>
                      <DR label="Marital Status" value={acct.householdStatus || "—"}/>
                      <DR label="Dependents" value={acct.dependents || "0"}/>
                    </tbody>
                  </table>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <tbody>
                      <DR label="Email Address" value={acct.email || "—"}/>
                      <DR label="Phone (Mobile)" value={acct.phone || "—"}/>
                      <DR label="Residential Addr." value={fullAddr}/>
                      <DR label="Mailing Address" value={mailingAddr}/>
                      <DR label="Employment Status" value={acct.employmentStatus || "—"}/>
                      <DR label="Occupation" value={acct.occupation || "—"}/>
                      <DR label="Employer" value={acct.employer || "—"}/>
                      <DR label="Risk Tolerance" value={(acct.riskTolerance || "—").replace(/_/g," ")}/>
                    </tbody>
                  </table>
                </div>
                {acct.hasCoApplicant && (
                  <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${N.divider}` }}>
                    <div style={{ fontSize:12, fontWeight:700, color:T.body, fontFamily:FONT, marginBottom:10 }}>Co-Applicant</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <tbody>
                          <DR label="Full Name" value={[acct.coTitle, acct.coFirstName, acct.coMiddleName, acct.coLastName].filter(Boolean).join(" ") || "—"}/>
                          <DR label="Date of Birth" value={acct.coDob || "—"}/>
                          <DR label="SSN / TIN" value={acct.coSsn ? `●●●-●●-${acct.coSsn.slice(-4)}` : "—"}/>
                          <DR label="Citizenship" value={acct.coCitizenship || "United States"}/>
                        </tbody>
                      </table>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <tbody>
                          <DR label="Email" value={acct.coEmail || "—"}/>
                          <DR label="Phone" value={acct.coPhone || "—"}/>
                          <DR label="Employment" value={acct.coEmploymentStatus || "—"}/>
                          <DR label="Occupation" value={acct.coOccupation || "—"}/>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </React.Fragment>
            )}
            </ReviewSection>

            {/* Entity Info (conditional) */}
            {acct.registrationCategory === "entity" && acct.entityType && (<>
              <div style={{ height:1, background:N.divider, margin:"4px 0 24px" }}/>
              <ReviewSection title="Entity Information & Beneficial Ownership" onEdit={() => setStep(3)}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <tbody>
                      <DR label="Entity Name" value={acct.entityName || "—"}/>
                      <DR label="Entity Type" value={(acct.entityType || "—").replace(/_/g," ")}/>
                      <DR label="EIN / Tax ID" value={entityInfo.ein ? `●●-●●●${entityInfo.ein.slice(-4)}` : "—"}/>
                      <DR label="Date of Formation" value={entityInfo.dateOfFormation || "—"}/>
                      <DR label="State of Formation" value={entityInfo.stateOfFormation || acct.entityStateOfFormation || "—"}/>
                    </tbody>
                  </table>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <tbody>
                      <DR label="Primary Authorized" value={entityInfo.primaryAuthorized || "—"}/>
                      <DR label="Co-Authorized" value={entityInfo.coAuthorized || "—"}/>
                      <DR label="Control Person" value={controlPerson.name ? `${controlPerson.name} (${controlPerson.title || "—"})` : "—"}/>
                      <DR label="Beneficial Owners" value={beneficialOwners.length > 0 ? beneficialOwners.map(bo => `${bo.name} (${bo.ownershipPct||"?"}%)`).join(", ") : "None reported"}/>
                    </tbody>
                  </table>
                </div>
              </ReviewSection>
            </>)}

            <div style={{ height:1, background:N.divider, margin:"4px 0 24px" }}/>

            {/* Source of Funds */}
            <ReviewSection title="Source of Funds" onEdit={() => setStep(3)}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <tbody>
                  <DR label="Primary Income Source" value={acct.incomeSource || acct.employmentStatus || "—"}/>
                  <DR label="Funding Source" value={(acct.fundingSource || "—").replace(/_/g," ")}/>
                  <DR label="Employment Income" value={fs.empInc ? fmtFull(fs.empInc) + " / yr" : "—"}/>
                  <DR label="Investment / Div. Income" value={fs.invInc ? fmtFull(fs.invInc) + " / yr" : "—"}/>
                  <DR label="Retirement Income" value={fs.retInc ? fmtFull(fs.retInc) + " / yr" : "—"}/>
                  <DR label="Gross Annual Income" value={fsCalcs.grossInc ? fmtFull(fsCalcs.grossInc) + " / yr" : "—"}/>
                </tbody>
              </table>
            </ReviewSection>

            <div style={{ height:1, background:N.divider, margin:"4px 0 24px" }}/>

            {/* Financial Information */}
            <ReviewSection title="Financial Information" onEdit={() => setStep(2)}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <tbody>
                    <DR label="Total Assets" value={fmtFull(fsCalcs.totalAssets)}/>
                    <DR label="Total Liabilities" value={fmtFull(fsCalcs.totalLiab)}/>
                    <DR label="Net Worth" value={fmtFull(fsCalcs.netWorth)}/>
                    <DR label="Net Worth (ex. Res.)" value={fmtFull(fsCalcs.netWorthExRes)}/>
                    <DR label="Liquid Assets" value={fmtFull(fsCalcs.totalLiquid)}/>
                    <DR label="Cash, Savings & 1031" value={fmtFull(fsCalcs.cashEquiv)}/>
                  </tbody>
                </table>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <tbody>
                    <DR label="Market Securities" value={fmtFull(fsCalcs.mktSec)}/>
                    <DR label="Retirement Accounts" value={fmtFull(fsCalcs.retAccounts)}/>
                    <DR label="Illiquid Assets" value={fmtFull(fsCalcs.illiquid)}/>
                    <DR label="Gross Annual Income" value={fmtFull(fsCalcs.grossInc)}/>
                    <DR label="Debt-to-Asset Ratio" value={fsCalcs.totalAssets > 0 ? `${fsCalcs.debtToAsset.toFixed(1)}%` : "—"}/>
                    <DR label="Investment Objectives" value={(acct.investmentObjectives || []).map(o => o.replace(/_/g," ")).join(", ") || "—"}/>
                  </tbody>
                </table>
              </div>

              {/* Detailed Concentration Analysis */}
              {fsCalcs.totalAssets > 0 && fsCalcs.netWorthExRes > 0 && (
                <div style={{ marginTop:16, padding:"16px 20px", background:N.section, borderRadius:12, border:`1px solid ${N.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT }}>Investment Concentration Analysis</div>
                      <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:2 }}>Per Stax DST Disclosure §04/§05 — as % of Net Worth ex-Primary Residence ({fmtFull(fsCalcs.netWorthExRes)})</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>Proposed Investment</div>
                      <div style={{ fontSize:16, fontWeight:700, color:G.deep, fontFamily:FONT }}>{fmtFull(cartTotal)}</div>
                    </div>
                  </div>

                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:FONT }}>
                    <thead>
                      <tr style={{ borderBottom:`2px solid ${G.forest}30` }}>
                        <th style={{ textAlign:"left", padding:"8px 10px", color:T.primary, fontWeight:700, fontSize:11 }}>Allocation</th>
                        <th style={{ textAlign:"right", padding:"8px 10px", color:T.muted, fontWeight:600, fontSize:10, borderLeft:`1px solid ${N.divider}` }}>Pre $</th>
                        <th style={{ textAlign:"right", padding:"8px 10px", color:T.muted, fontWeight:600, fontSize:10 }}>Pre %</th>
                        <th style={{ textAlign:"right", padding:"8px 10px", color:T.muted, fontWeight:600, fontSize:10, borderLeft:`1px solid ${N.divider}` }}>Post $</th>
                        <th style={{ textAlign:"right", padding:"8px 10px", color:T.muted, fontWeight:600, fontSize:10 }}>Post %</th>
                        <th style={{ textAlign:"center", padding:"8px 10px", color:T.muted, fontWeight:600, fontSize:10, borderLeft:`1px solid ${N.divider}` }}>Δ</th>
                        <th style={{ textAlign:"center", padding:"8px 10px", color:T.muted, fontWeight:600, fontSize:10 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { cat:"Equity in RE Securities", preAmt:fs.reSec, pre:fsCalcs.preReSecPct, postAmt:fsCalcs.postReSec2, post:fsCalcs.postReSecPct, thresh:50, key:"resec" },
                        { cat:"Non-RE Alternative Inv.", preAmt:fs.nonReAlts, pre:fsCalcs.preNonReAltsPct, postAmt:fs.nonReAlts, post:fsCalcs.postNonReAltsPct, thresh:null, key:"nralt" },
                        { cat:"Interval Funds", preAmt:fs.intervalFunds, pre:fsCalcs.preIntervalPct, postAmt:fs.intervalFunds, post:fsCalcs.postIntervalPct, thresh:null, key:"intfund" },
                        { cat:"All Illiquid Securities", preAmt:(fsCalcs.illiquid - fs.primary), pre:fsCalcs.preAllIlliqPct, postAmt:fsCalcs.postAllIlliq, post:fsCalcs.postAllIlliqPct, thresh:60, key:"illiq" },
                      ].map(({ cat, preAmt, pre, postAmt, post, thresh, key }) => {
                        const exceeds = thresh && post > thresh;
                        const elevated = thresh && post > (thresh * 0.6) && !exceeds;
                        const delta = post - pre;
                        return (
                          <tr key={key} style={{ borderBottom:`1px solid ${N.divider}`, background: exceeds ? "#FEF2F208" : "transparent" }}>
                            <td style={{ padding:"10px 10px", color:T.body, fontWeight:600, fontSize:12 }}>{cat}</td>
                            <td style={{ padding:"10px 10px", textAlign:"right", color:T.body, fontSize:12, borderLeft:`1px solid ${N.divider}` }}>{preAmt > 0 ? fmtFull(preAmt) : "—"}</td>
                            <td style={{ padding:"10px 10px", textAlign:"right", color:T.body, fontSize:12, fontWeight:600 }}>{pre.toFixed(1)}%</td>
                            <td style={{ padding:"10px 10px", textAlign:"right", fontSize:12, fontWeight:700, borderLeft:`1px solid ${N.divider}`, color: exceeds ? A.red : G.forest }}>{postAmt > 0 ? fmtFull(postAmt) : "—"}</td>
                            <td style={{ padding:"10px 10px", textAlign:"right", fontSize:13, fontWeight:700, color: exceeds ? A.red : elevated ? C.warning : G.forest }}>{post.toFixed(1)}%{exceeds && " ⚠"}</td>
                            <td style={{ padding:"10px 10px", textAlign:"center", fontSize:11, fontWeight:600, borderLeft:`1px solid ${N.divider}`, color: delta > 0 ? A.amber : T.muted }}>{delta > 0.05 ? `+${delta.toFixed(1)}pp` : "—"}</td>
                            <td style={{ padding:"10px 10px", textAlign:"center" }}>
                              {exceeds ? <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:4, fontSize:9, fontWeight:700, background:C.errorBg, color:C.error, fontFamily:FONT }}>EXCEEDS</span>
                               : elevated ? <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:4, fontSize:9, fontWeight:700, background:C.warningBg, color:C.warning, fontFamily:FONT }}>ELEVATED</span>
                               : thresh ? <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:4, fontSize:9, fontWeight:700, background:G.mint, color:G.forest, fontFamily:FONT }}>OK</span>
                               : <span style={{ fontSize:10, color:T.light }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Visual concentration bars */}
                  <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {[
                      { label:"RE Securities", pre:fsCalcs.preReSecPct, post:fsCalcs.postReSecPct, thresh:50 },
                      { label:"All Illiquid", pre:fsCalcs.preAllIlliqPct, post:fsCalcs.postAllIlliqPct, thresh:60 },
                    ].map(({ label, pre, post, thresh }) => {
                      const exceeds = post > thresh;
                      return (
                        <div key={label} style={{ padding:"10px 14px", background:N.card, borderRadius:8, border:`1px solid ${exceeds ? C.errorBorder : N.border}` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                            <span style={{ fontSize:11, fontWeight:600, color:T.body, fontFamily:FONT }}>{label}</span>
                            <span style={{ fontSize:11, fontWeight:700, fontFamily:FONT, color: exceeds ? A.red : G.forest }}>{pre.toFixed(1)}% → {post.toFixed(1)}%</span>
                          </div>
                          <div style={{ position:"relative", height:16, background:N.divider, borderRadius:4, overflow:"hidden" }}>
                            <div style={{ position:"absolute", top:0, left:0, height:"50%", width:`${Math.min(pre / (thresh * 1.5) * 100, 100)}%`, background:`${T.muted}40`, borderRadius:"4px 0 0 0", transition:"width 0.4s" }}/>
                            <div style={{ position:"absolute", bottom:0, left:0, height:"50%", width:`${Math.min(post / (thresh * 1.5) * 100, 100)}%`, background: exceeds ? A.red : post > thresh * 0.6 ? A.amber : G.forest, borderRadius:"0 0 0 4px", transition:"width 0.4s" }}/>
                            <div style={{ position:"absolute", top:0, bottom:0, left:`${thresh / (thresh * 1.5) * 100}%`, width:2, background:C.error, opacity:0.4 }}/>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                            <span style={{ fontSize:8, color:T.light, fontFamily:FONT }}>0%</span>
                            <span style={{ fontSize:8, color:C.error, fontFamily:FONT, opacity:0.6 }}>Guideline: {thresh}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Key ratios row */}
                  <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                    {[
                      { l:"Liquidity Ratio", v:`${fsCalcs.liquidityPct.toFixed(1)}%`, ok:fsCalcs.liquidityPct >= 15 },
                      { l:"Debt-to-Asset", v:`${fsCalcs.debtToAsset.toFixed(1)}%`, ok:fsCalcs.debtToAsset <= 35 },
                      { l:"Income Coverage", v: fsCalcs.incomeCoverage ? `${fsCalcs.incomeCoverage.toFixed(2)}×` : "—", ok: !fsCalcs.incomeCoverage || fsCalcs.incomeCoverage >= 1.25 },
                      { l:"Invest/NW ex-Res", v:`${fsCalcs.investAsNwPct.toFixed(1)}%`, ok:fsCalcs.investAsNwPct <= 25 },
                    ].map(({ l, v, ok }) => (
                      <div key={l} style={{ textAlign:"center", padding:"8px 6px", borderRadius:6, background: ok ? G.mint : C.warningBg, border:`1px solid ${ok ? G.forest+"30" : C.warningBorder}` }}>
                        <div style={{ fontSize:8, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.3px" }}>{l}</div>
                        <div style={{ fontSize:14, fontWeight:700, color: ok ? G.forest : C.warning, fontFamily:FONT }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ReviewSection>

            <div style={{ height:1, background:N.divider, margin:"4px 0 24px" }}/>

            {/* Selected Investments */}
            <ReviewSection title="Selected DST Investments" onEdit={() => setStep(1)}>
              {cartItems.map((item, idx) => (
                <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom: idx < cartItems.length - 1 ? `1px solid ${N.divider}` : "none" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:T.primary, fontFamily:FONT }}>{item.name}</div>
                    <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, marginTop:2 }}>{item.sponsor} · {item.propertyType} · {item.location}</div>
                    <div style={{ display:"flex", gap:10, marginTop:4, flexWrap:"wrap" }}>
                      {[["Cap Rate", pct(item.goingInCap)], ["Cash/Cash", pct(item.cashOnCash)], ["DSCR", `${item.dscr}x`]].map(([l,v]) => <span key={l} style={{ fontSize:11, color:T.body, fontFamily:FONT }}><span style={{ color:T.light }}>{l}: </span>{v}</span>)}
                      <span style={{ fontSize:11, fontFamily:FONT, fontWeight:600, color:scoreColor(item.compositeScore) }}>Score: {item.compositeScore.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", marginLeft:16 }}>
                    <div style={{ fontSize:20, fontWeight:700, color:G.forest, fontFamily:FONT }}>{fmtFull(cart[item.id])}</div>
                    <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:2 }}>{pct(cart[item.id] / cartTotal * 100)} of portfolio</div>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:`2px solid ${N.border}`, marginTop:4 }}>
                <span style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT }}>Total Investment</span>
                <span style={{ fontSize:22, fontWeight:700, color:G.forest, fontFamily:FONT }}>{fmtFull(cartTotal)}</span>
              </div>
            </ReviewSection>

            <div style={{ height:1, background:N.divider, margin:"4px 0 24px" }}/>

            {/* Experience & Suitability */}
            <ReviewSection title="Investment Experience &amp; Suitability" onEdit={() => setStep(3)}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <tbody>
                    <DR label="Accredited Investor" value={acct.accredited || "—"}/>
                    <DR label="Accredited Basis" value={(acct.accreditedBasis || "—").replace(/_/g," ")}/>
                    <DR label="Time Horizon" value={(acct.timeHorizon || "—").replace(/_/g," ")}/>
                    <DR label="Liquidity Needs" value={acct.liquidityNeeds || "—"}/>
                  </tbody>
                </table>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <tbody>
                    <DR label="Emergency Funds" value={acct.emergencyFunds || "—"}/>
                    <DR label="Distribution Method" value={(acct.distributionMethod || "—").replace(/_/g," ")}/>
                    <DR label="Tax Status" value={acct.taxStatus || "—"}/>
                    <DR label="Senior Investor" value={isSeniorDetected.detected ? `Yes — ${[isSeniorDetected.ageTriggered ? "Age 60+" : "", isSeniorDetected.retiredTriggered ? "Retired" : ""].filter(Boolean).join(", ")}` : "No"}/>
                  </tbody>
                </table>
              </div>
            </ReviewSection>
          </div>
        </div>

        {/* ── Uploaded Documents Summary ── */}
        <div style={{ background:N.card, borderRadius:14, border:`1px solid ${N.border}`, boxShadow:"0 2px 16px rgba(0,0,0,0.05)", overflow:"hidden", marginBottom:20 }}>
          <div style={{ padding:"28px 32px" }}>
            <ReviewSection title="Uploaded Documents" onEdit={() => setStep(3)}>
              {/* Primary ID */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8, fontFamily:FONT }}>Primary Applicant — Government Photo ID</div>
                {(docs.primaryId || []).length > 0 ? (
                  (docs.primaryId || []).map(f => (
                    <div key={f.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:N.section, borderRadius:8, border:`1px solid ${N.border}`, marginBottom:4 }}>
                      <div style={{ width:28, height:28, borderRadius:6, background:G.mint, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.forest} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:500, color:T.primary, fontFamily:FONT, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.name}</div>
                        <div style={{ fontSize:10, color:T.light, fontFamily:FONT }}>{f.size ? `${(f.size/1024).toFixed(0)}KB · ` : ""}{f.type?.includes("pdf") ? "PDF" : "Image"}</div>
                      </div>
                      <span style={{ display:"inline-block", padding:"2px 7px", fontSize:9, fontWeight:700, borderRadius:4, color:G.forest, background:G.mint, fontFamily:FONT }}>Uploaded</span>
                    </div>
                  ))
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:C.errorBg, borderRadius:8, border:`1px solid ${C.errorBorder}` }}>
                    <span style={{ fontSize:11, color:C.error, fontWeight:600, fontFamily:FONT }}>Required: Government-issued photo ID not uploaded</span>
                  </div>
                )}
              </div>

              {/* Co-Applicant ID */}
              {acct.hasCoApplicant && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8, fontFamily:FONT }}>Co-Applicant — Government Photo ID</div>
                  {(docs.coApplicantId || []).length > 0 ? (
                    (docs.coApplicantId || []).map(f => (
                      <div key={f.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:N.section, borderRadius:8, border:`1px solid ${N.border}`, marginBottom:4 }}>
                        <div style={{ width:28, height:28, borderRadius:6, background:G.mint, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.forest} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:500, color:T.primary, fontFamily:FONT }}>{f.name}</div>
                          <div style={{ fontSize:10, color:T.light, fontFamily:FONT }}>{f.type?.includes("pdf") ? "PDF" : "Image"}</div>
                        </div>
                        <span style={{ display:"inline-block", padding:"2px 7px", fontSize:9, fontWeight:700, borderRadius:4, color:G.forest, background:G.mint, fontFamily:FONT }}>Uploaded</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:C.errorBg, borderRadius:8, border:`1px solid ${C.errorBorder}` }}>
                      <span style={{ fontSize:11, color:C.error, fontWeight:600, fontFamily:FONT }}>Required: Co-applicant photo ID not uploaded</span>
                    </div>
                  )}
                </div>
              )}

              {/* Entity Docs */}
              {acct.registrationCategory === "entity" && acct.entityType && (
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8, fontFamily:FONT }}>Entity Formation Documents</div>
                  {(docs.entityDocs || []).length > 0 ? (
                    (docs.entityDocs || []).map(f => (
                      <div key={f.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:N.section, borderRadius:8, border:`1px solid ${N.border}`, marginBottom:4 }}>
                        <div style={{ width:28, height:28, borderRadius:6, background:C.infoBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={A.blue} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:500, color:T.primary, fontFamily:FONT }}>{f.name}</div>
                          <div style={{ fontSize:10, color:T.light, fontFamily:FONT }}>PDF</div>
                        </div>
                        <span style={{ display:"inline-block", padding:"2px 7px", fontSize:9, fontWeight:700, borderRadius:4, color:G.forest, background:G.mint, fontFamily:FONT }}>Uploaded</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:C.errorBg, borderRadius:8, border:`1px solid ${C.errorBorder}` }}>
                      <span style={{ fontSize:11, color:C.error, fontWeight:600, fontFamily:FONT }}>Required: Entity formation documents not uploaded</span>
                    </div>
                  )}
                </div>
              )}

              {/* Document count summary */}
              {(() => {
                const allFiles = [...(docs.primaryId||[]), ...(docs.coApplicantId||[]), ...(docs.entityDocs||[]), ...(docs.govId||[]), ...(docs.voidedCheck||[]), ...(docs.trustDocs||[]), ...(docs.iraDocs||[])];
                const total = allFiles.length;
                const primaryIdCount = (docs.primaryId || []).length;
                return (
                  <div style={{ marginTop:8, padding:"10px 14px", background: primaryIdCount > 0 ? G.mint : N.section, borderRadius:8, border:`1px solid ${primaryIdCount > 0 ? G.forest+"30" : N.border}` }}>
                    <span style={{ fontSize:11, fontWeight:600, fontFamily:FONT, color: primaryIdCount > 0 ? G.forest : T.muted }}>
                      {primaryIdCount > 0 ? `✓ ${total} document${total !== 1 ? "s" : ""} uploaded` : "No documents uploaded — Government-issued photo ID required"}
                    </span>
                  </div>
                );
              })()}
            </ReviewSection>
          </div>
        </div>

        {/* ── Agreements and Disclosures ── */}
        <div style={{ background:N.card, borderRadius:14, border:`1px solid ${N.border}`, boxShadow:"0 2px 16px rgba(0,0,0,0.05)", overflow:"hidden", marginBottom:20 }}>
          <div style={{ display:"flex", gap:0 }}>
            {/* Left: checklist */}
            <div style={{ flex:1, padding:"28px 28px" }}>
              <div style={{ fontSize:15, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Agreements and Disclosures</div>
              <p style={{ fontSize:12, color:T.muted, fontFamily:FONT, lineHeight:1.6, marginBottom:16 }}>Review the following agreements and disclosures carefully. By checking each box, you confirm you have read and agree to the terms of each document.</p>

              {/* Master toggle */}
              <div style={{ padding:"10px 14px", background: allDiscAcked ? G.mint : N.section, borderRadius:8, border:`1px solid ${allDiscAcked ? G.forest+"40" : N.border}`, marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
                <input type="checkbox" checked={agreeAll} onChange={e => handleAgreeAll(e.target.checked)} style={{ width:15, height:15, accentColor:G.forest, cursor:"pointer" }}/>
                <span style={{ fontSize:12, fontWeight:600, color: allDiscAcked ? G.forest : T.body, fontFamily:FONT }}>I agree to all listed below</span>
                {allDiscAcked && <span style={{ fontSize:11, color:G.forest, fontFamily:FONT, marginLeft:"auto" }}>✓ All acknowledged</span>}
              </div>

              <div style={{ fontSize:11, fontWeight:600, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", margin:"14px 0 4px" }}>Investor Representations &amp; Agreements</div>
              {DiscRow({ id:"materialReviewed", label:"I have reviewed all Offering Materials and consulted independent legal, tax, and investment advisors prior to investing.", docRef:"[Stax DST Disclosure · §06 Item 1–4]" })}
              {DiscRow({ id:"offering", label:"I understand the investment is highly speculative and involves substantial risk, including possible loss of entire invested capital.", docRef:"[Stax DST Disclosure · §06 Item 1]" })}
              <div style={{ fontSize:11, fontWeight:600, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", margin:"14px 0 4px" }}>Illiquidity &amp; Risk</div>
              {DiscRow({ id:"illiquidity", label:"I understand this investment is illiquid with no established secondary market. Any sale, if possible, may be at a substantial discount.", docRef:"[Stax DST Disclosure · §06 Item 7]" })}
              {DiscRow({ id:"risk", label:"I am not financially dependent on receiving distributions. I can hold the investment indefinitely and withstand a complete loss.", docRef:"[Stax DST Disclosure · §06 Item 3]" })}
              {DiscRow({ id:"noGuarantee", label:"I understand Stax Capital makes no guarantees regarding investment performance. Due diligence does not guarantee any specific outcome.", docRef:"[Stax DST Disclosure · §06 Item 8–9]" })}
              <div style={{ fontSize:11, fontWeight:600, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", margin:"14px 0 4px" }}>1031 Exchange</div>
              {DiscRow({ id:"exchange1031", label:"I acknowledge that 1031 exchange tax deferral may be challenged by the IRS or state authorities, and in the event of foreclosure, I may be subject to additional taxation.", docRef:"[Stax DST Disclosure · §06 Item 5]" })}
              <div style={{ fontSize:11, fontWeight:600, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", margin:"14px 0 4px" }}>Concentration &amp; Debt</div>
              {DiscRow({ id:"concentration", label:"I have reviewed my pre- and post-investment concentration levels and accept the over-concentration risk as discussed with Stax Capital.", docRef:"[Stax DST Disclosure · §05]" })}
              {DiscRow({ id:"additionalDebt", label:"I understand the investment may have debt that exceeds the amount retired at sale, and I accept all related financing and tax risks.", docRef:"[Stax DST Disclosure · §06 Item 6]" })}
              <div style={{ fontSize:11, fontWeight:600, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", margin:"14px 0 4px" }}>Customer Acknowledgments &amp; Account Agreement</div>
              {DiscRow({ id:"arbitration", label:"I acknowledge and accept the Stax Capital Client Account Agreement, Privacy Policy, and the Pre-Dispute Arbitration Agreement. All investments carry risk of loss.", docRef:"[NAF · pp. 12–15]" })}
              {DiscRow({ id:"independentAdvice", label:"I have sought independent legal, tax, and investment advice. I reserve the right to decide whether to proceed. I may contact compliance at 844-427-1031.", docRef:"[Stax Customer Acknowledgments · §11]" })}
              <div style={{ fontSize:11, fontWeight:600, color:T.muted, fontFamily:FONT, textTransform:"uppercase", letterSpacing:"0.5px", margin:"14px 0 4px" }}>Regulatory Documents &amp; E-SIGN</div>
              {DiscRow({ id:"formCRS", label:"I acknowledge receipt of Stax Capital's Form CRS (Customer Relationship Summary) as required by SEC Rule 17a-14.", docRef:"[SEC 17a-14]" })}
              {DiscRow({ id:"regBI", label:"I acknowledge receipt of the Regulation Best Interest Disclosure Document and understand Stax Capital acts in my best interest.", docRef:"[SEC Reg BI]" })}
              {DiscRow({ id:"privacy", label:"I have received and reviewed Stax Capital's Privacy Policy and understand how my nonpublic personal information is collected and protected.", docRef:"[Reg S-P]" })}
              {DiscRow({ id:"brokerCheck", label:"I acknowledge that I may verify my representative's background, registration, and disciplinary history via FINRA BrokerCheck at brokercheck.finra.org.", docRef:"[FINRA Rule 2267]" })}
              {DiscRow({ id:"esign", label:"I consent to the use of electronic signatures and electronic delivery of account documents per the E-SIGN Act and Uniform Electronic Transactions Act (UETA).", docRef:"[E-SIGN Act]" })}
            </div>

            {/* Right: info panel */}
            <div style={{ width:220, flexShrink:0, borderLeft:`1px solid ${N.border}`, padding:"28px 20px", background:N.section }}>
              <div style={{ marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:G.mint, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, border:`1px solid ${G.forest}20` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G.forest} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:6 }}>About Agreements and Disclosures</div>
                <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.7 }}>
                  We are required to provide you with certain disclosures mandated by SEC and FINRA regulations. Please review and acknowledge each item.
                </div>
              </div>
              <div style={{ padding:"10px 12px", background:N.card, borderRadius:8, border:`1px solid ${N.border}`, marginBottom:10 }}>
                <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginBottom:4 }}>REGULATORY COMPLIANCE</div>
                <div style={{ fontSize:11, color:T.body, fontFamily:FONT, lineHeight:1.6 }}>Subject to FINRA Rule 2165, SEC Regulation Best Interest, and USA PATRIOT Act requirements.</div>
              </div>
              <div style={{ padding:"10px 12px", background:C.infoBg, borderRadius:8, border:`1px solid ${C.infoBorder}`, marginBottom:10 }}>
                <div style={{ fontSize:10, color:C.info, fontFamily:FONT, marginBottom:4 }}>DOCUMENT DOWNLOAD</div>
                <div style={{ fontSize:11, color:C.info, fontFamily:FONT, lineHeight:1.6 }}>Full disclosure documents are available from your representative or at staxai.com.</div>
              </div>
              <div style={{ padding:"10px 12px", background:C.warningBg, borderRadius:8, border:`1px solid ${C.warningBorder}`, marginBottom:10 }}>
                <div style={{ fontSize:10, color:C.warning, fontFamily:FONT, marginBottom:4 }}>FOR ACCREDITED INVESTORS</div>
                <div style={{ fontSize:11, color:C.warning, fontFamily:FONT, lineHeight:1.6 }}>DST investments under Private Placement are offered exclusively to accredited investors per SEC Rule 501.</div>
              </div>
              {requiresFlagAcceptance && (
                <div style={{ padding:"10px 12px", borderRadius:8, background: allFlagsAcked ? G.mint : C.errorBg, border:`1px solid ${allFlagsAcked ? G.forest+"30" : C.errorBorder}` }}>
                  <div style={{ fontSize:10, fontFamily:FONT, marginBottom:4, color: allFlagsAcked ? G.forest : C.error }}>COMPLIANCE FLAGS</div>
                  <div style={{ fontSize:11, fontFamily:FONT, lineHeight:1.6, color: allFlagsAcked ? G.deep : C.error }}>
                    {allFlagsAcked ? "All compliance flags acknowledged." : `${nonBlockFlags.length} flag(s) require acknowledgment and signature.`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Communication Preferences ── */}
        <div style={{ background:N.card, borderRadius:14, border:`1px solid ${N.border}`, padding:"20px 24px", marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:10 }}>Communication Preferences</div>
          <div style={{ fontSize:12, color:T.muted, fontFamily:FONT, lineHeight:1.6, marginBottom:12, padding:"10px 14px", background:N.section, borderRadius:8, border:`1px solid ${N.border}` }}>
            By default, you have telephone authorization and electronic delivery of documents. To revoke either privilege, check the applicable box below.
          </div>
          <CheckBox checked={noTelAuth} onChange={v => setNoTelAuth(v)} label="I do NOT authorize telephone transactions on my account"/>
          <CheckBox checked={noElecDel} onChange={v => setNoElecDel(v)} label="I do NOT consent to electronic delivery of account documents"/>
        </div>

        {/* ── Signature ── */}
        <div style={{ background:N.card, borderRadius:14, border:`1px solid ${N.border}`, padding:"28px 32px", marginBottom:20 }}>
          <div style={{ fontSize:15, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:14 }}>Signature</div>
          <div style={{ fontSize:12, color:T.body, fontFamily:FONT, lineHeight:1.9, marginBottom:20, padding:"14px 16px", background:`${G.forest}06`, borderRadius:8, border:`1px solid ${G.forest}20` }}>
            By typing my name and clicking to proceed, I confirm that: <strong>(1)</strong> all information is accurate, complete, and up-to-date; <strong>(2)</strong> I have read and understood all agreements and disclosures; and <strong>(3)</strong> my electronic signature is the legal equivalent of a manually written signature.
          </div>

          {/* Primary Applicant */}
          <div style={{ marginBottom:20 }}>
            <FormField label="Primary Applicant — Full Legal Name (type to sign)" required>
              <input value={sig.primary} onChange={e => setSig(p => ({ ...p, primary: e.target.value }))} placeholder="Type your full legal name" style={inputSt}/>
            </FormField>
            {sig.primary.trim().length > 2 && (
              <div style={{ marginTop:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", padding:"12px 20px", background:N.section, borderRadius:8, border:`1px solid ${N.border}`, borderBottom:`2px solid ${G.forest}` }}>
                  <span style={{ fontFamily:"Georgia, 'Times New Roman', serif", fontSize:32, color:G.deep, fontStyle:"italic" }}>{sig.primary}</span>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:T.light, fontFamily:FONT }}>Dated</div>
                    <div style={{ fontSize:11, color:T.muted, fontFamily:FONT }}>{nowStr}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Co-Applicant */}
          {acct.hasCoApplicant && (
            <div style={{ paddingTop:16, borderTop:`1px solid ${N.divider}`, marginTop:4 }}>
              <FormField label="Co-Applicant — Full Legal Name (type to sign)" required={acct.hasCoApplicant}>
                <input value={sig.co} onChange={e => setSig(p => ({ ...p, co: e.target.value }))} placeholder="Co-applicant's full legal name" style={inputSt}/>
              </FormField>
              {sig.co.trim().length > 2 && (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", padding:"12px 20px", background:N.section, borderRadius:8, border:`1px solid ${N.border}`, borderBottom:`2px solid ${G.forest}` }}>
                    <span style={{ fontFamily:"Georgia, serif", fontSize:32, color:G.deep, fontStyle:"italic" }}>{sig.co}</span>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:T.light, fontFamily:FONT }}>Dated</div>
                      <div style={{ fontSize:11, color:T.muted, fontFamily:FONT }}>{nowStr}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status hints */}
          {!allDiscAcked && (
            <div style={{
              padding:"12px 16px", background:C.warningBg, borderRadius:8,
              border:`1px solid ${C.warningBorder}`, marginTop:16,
              display:"flex", alignItems:"flex-start", gap:10,
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:C.warning, fontFamily:FONT, marginBottom:2 }}>
                  Disclosures Incomplete
                </div>
                <div style={{ fontSize:11, color:C.warning, fontFamily:FONT, lineHeight:1.5 }}>
                  Please scroll up and acknowledge all required disclosures before submitting.
                  All acknowledgments are mandatory per FINRA Rule 5123 and Regulation Best Interest.
                </div>
              </div>
            </div>
          )}
          {allDiscAcked && requiresFlagAcceptance && !allFlagsAcked && (
            <div style={{
              padding:"12px 16px", background:C.errorBg, borderRadius:8,
              border:`1px solid ${C.errorBorder}`, marginTop:16,
              display:"flex", alignItems:"flex-start", gap:10,
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>🚫</span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:C.error, fontFamily:FONT, marginBottom:2 }}>
                  Compliance Acceptance Required
                </div>
                <div style={{ fontSize:11, color:C.error, fontFamily:FONT, lineHeight:1.5 }}>
                  This application has compliance flags that require individual acknowledgment.
                  Scroll up to the Compliance Flag Acceptance section, acknowledge each flag,
                  accept the Hold Harmless Agreement, and provide your electronic signature.
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div style={{ display:"flex", gap:12, marginTop:20, justifyContent:"space-between", alignItems:"center" }}>
            <button onClick={generatePDF} style={{ display:"flex", alignItems:"center", gap:5, padding:"10px 14px", border:`1px solid ${G.forest}30`, borderRadius:8, background:G.mint, fontSize:11, fontWeight:600, color:G.deep, fontFamily:FONT, cursor:"pointer" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Client PDF
            </button>
            <BtnPrimary onClick={() => { createAuditEntry("APPLICATION_SUBMITTED", { ref: confRef.current, total: cartTotal, items: cartCount }); setSubmitted(true); }} disabled={!canSubmit} style={{ padding:"13px 32px", fontSize:14 }}>
              {blockFlags.length ? "Resolve Compliance Issues to Submit"
                : !allDiscAcked ? "Acknowledge All Disclosures to Submit"
                : requiresFlagAcceptance && !allFlagsAcked ? "Complete Compliance Acceptance to Submit"
                : sig.primary.trim().length < 3 ? "Add Signature to Submit"
                : "Submit Application & Execute Electronically →"}
            </BtnPrimary>
          </div>

          <div style={{ marginTop:12, borderTop:`1px solid ${N.divider}`, paddingTop:12 }}>
            <div style={{ fontSize:10, color:T.light, fontFamily:FONT, lineHeight:1.7 }}>
              Member FINRA &amp; SIPC · Securities offered through Stax Capital, Inc.
            </div>
            <div style={{ fontSize:10, color:T.light, fontFamily:FONT, lineHeight:1.7 }}>
              7960 Entrada Lazanja, San Diego, CA 92127 · 844-427-1031 · staxai.com
            </div>
            <div style={{ fontSize:9, color:T.light, fontFamily:FONT, lineHeight:1.7, marginTop:2 }}>
              By submitting, you affirm that all information is accurate and you are electronically
              signing per the E-SIGN Act. Retain your confirmation reference for your records.
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════
     POST-SUBMIT VIEWS (from v4)
     ══════════════════════════════════════════════════════ */

  /* ── Reg BI Questionnaire View ── */
  const RegBIView = () => {
    const questions = [
      { q:"Has the investor been provided with a copy of Stax Capital's Form CRS (Customer Relationship Summary)?", field:"crsProvided" },
      { q:"Has the investor been provided with Stax Capital's Regulation Best Interest Disclosure Document?", field:"regBIDisclosure" },
      { q:"Have you discussed the material facts relating to the scope and terms of the relationship with the investor, including capacity in which you are acting?", field:"materialFacts" },
      { q:"Have you disclosed all material fees and costs associated with this investment, including commissions, load, and platform fees?", field:"feesDisclosed" },
      { q:"Have you disclosed any material limitations on the securities or investment strategies you are able to recommend?", field:"limitationsDisclosed" },
      { q:"Have all material conflicts of interest associated with this recommendation been disclosed to the investor?", field:"conflictsDisclosed" },
      { q:"Have you exercised reasonable diligence, care, and skill in making this recommendation?", field:"dueDiligence" },
      { q:"Does this recommendation reflect the investor's investment profile, including their financial situation, investment objectives, time horizon, risk tolerance, and liquidity needs?", field:"profileMatch" },
      { q:"Have you considered reasonably available alternatives to this recommendation?", field:"alternativesConsidered" },
      { q:"Have you placed the interest of the investor ahead of your own financial or other interest?", field:"clientFirst" },
    ];
    return (
      <div style={{ maxWidth:780, margin:"0 auto", padding:"20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Regulation Best Interest Questionnaire</h2>
            <p style={{ fontSize:12, color:T.muted, fontFamily:FONT }}>SEC Regulation Best Interest — Registered Representative Compliance Attestation</p>
          </div>
          <button onClick={() => setView("app")} style={{
            padding:"8px 16px", border:`1px solid ${N.border}`, borderRadius:8,
            background:N.card, fontSize:11, fontWeight:600, color:T.body,
            fontFamily:FONT, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
          }}>← Back to Application</button>
        </div>
        <div style={{ padding:"14px 18px", background:C.infoBg, borderRadius:10, border:`1px solid ${C.infoBorder}`, marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.info, fontFamily:FONT, marginBottom:4 }}>
            SEC Regulation Best Interest — Required Attestation
          </div>
          <div style={{ fontSize:12, color:C.info, fontFamily:FONT, lineHeight:1.6 }}>
            This questionnaire is required per SEC Regulation Best Interest (Reg BI) effective June 30, 2020.
            All questions must be answered "Yes" to confirm compliance with the Care Obligation, Disclosure
            Obligation, and Conflict of Interest Obligation. Document any "No" answers with a detailed
            written explanation before proceeding with the recommendation.
          </div>
        </div>
        {questions.map((item, idx) => (
          <div key={idx} style={{ padding:"14px 18px", background:N.card, borderRadius:10, border:`1px solid ${N.border}`, marginBottom:10 }}>
            <div style={{ fontSize:12, color:T.body, fontFamily:FONT, lineHeight:1.6, marginBottom:10 }}>
              <span style={{ fontWeight:700, color:T.primary }}>{idx + 1}.</span> {item.q}
            </div>
            <RadioGroup name={`regbi_${item.field}`} value={regBISig[item.field] || ""} onChange={v => setRegBISig(p => ({ ...p, [item.field]: v }))} options={["Yes","No"]}/>
          </div>
        ))}
        {/* Completion Progress */}
        {(() => {
          const answered = questions.filter(item => regBISig[item.field]).length;
          const allYes = questions.every(item => regBISig[item.field] === "Yes");
          return (
            <div style={{ padding:"12px 16px", background: allYes ? G.mint : N.section, borderRadius:10, border:`1px solid ${allYes ? G.forest+"30" : N.border}`, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:FONT }}>Questionnaire Progress</span>
                <span style={{ fontSize:12, fontWeight:700, fontFamily:FONT, color: allYes ? G.forest : A.amber }}>
                  {answered} of {questions.length} answered{allYes ? " — All Yes ✓" : ""}
                </span>
              </div>
              <div style={{ height:5, background:N.border, borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:3, transition:"width 0.3s",
                  width:`${answered / questions.length * 100}%`,
                  background: allYes ? `linear-gradient(90deg, ${G.forest}, ${G.light})` : `linear-gradient(90deg, ${A.amber}, #F59E0B)` }}/>
              </div>
            </div>
          );
        })()}

        <div style={{ marginTop:4, padding:"16px 20px", background:N.section, borderRadius:10, border:`1px solid ${N.border}` }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:10 }}>
            Registered Representative Electronic Signature
          </div>
          <div style={{ fontSize:11, color:T.muted, fontFamily:FONT, lineHeight:1.6, marginBottom:12 }}>
            By signing below, I certify that I have completed this Regulation Best Interest questionnaire
            truthfully and to the best of my knowledge. I attest that I have met my obligations under
            SEC Regulation Best Interest in connection with this recommendation.
          </div>
          <FormField label="Full Legal Name (type to sign)" required>
            <input value={regBISig.repSignature || ""} onChange={e => setRegBISig(p => ({ ...p, repSignature: e.target.value }))} placeholder="Type your full legal name" style={inputSt}/>
          </FormField>
          {regBISig.repSignature && regBISig.repSignature.trim().length > 2 && (
            <div style={{ marginTop:8, padding:"10px 18px", background:N.card, borderRadius:8,
              border:`1px solid ${N.border}`, borderBottom:`2px solid ${G.forest}`,
              display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
              <span style={{ fontFamily:"Georgia, 'Times New Roman', serif", fontSize:26, color:G.deep, fontStyle:"italic" }}>
                {regBISig.repSignature}
              </span>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:9, color:T.light, fontFamily:FONT }}>Date Signed</div>
                <div style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>{new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── QC Gate Dashboard View ── */
  const QCGateView = () => {
    const gates = qcChecks.map(c => ({
      ...c,
      status: c.pass ? "PASS" : "FAIL",
    }));
    const passCount = gates.filter(g => g.status === "PASS").length;
    const failCount = gates.filter(g => g.status === "FAIL").length;

    return (
      <div style={{ maxWidth:780, margin:"0 auto", padding:"20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:4 }}>QC Gate Dashboard</h2>
            <p style={{ fontSize:12, color:T.muted, fontFamily:FONT }}>Pre-submission quality control — all gates must pass</p>
          </div>
          <button onClick={() => setView("app")} style={{
            padding:"8px 16px", border:`1px solid ${N.border}`, borderRadius:8,
            background:N.card, fontSize:11, fontWeight:600, color:T.body,
            fontFamily:FONT, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
          }}>← Back to Application</button>
        </div>

        {/* Scorecard */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
          <div style={{ textAlign:"center", padding:"14px", background:N.section, borderRadius:10, border:`1px solid ${N.border}` }}>
            <div style={{ fontSize:8, color:T.muted, textTransform:"uppercase", fontFamily:FONT }}>Total Gates</div>
            <div style={{ fontSize:28, fontWeight:600, color:T.primary, fontFamily:FONT }}>{gates.length}</div>
          </div>
          <div style={{ textAlign:"center", padding:"14px", background:C.successBg, borderRadius:10, border:`1px solid ${C.success}30` }}>
            <div style={{ fontSize:8, color:T.muted, textTransform:"uppercase", fontFamily:FONT }}>Passed</div>
            <div style={{ fontSize:28, fontWeight:600, color:C.success, fontFamily:FONT }}>{passCount}</div>
          </div>
          <div style={{ textAlign:"center", padding:"14px", background: failCount > 0 ? C.errorBg : C.successBg, borderRadius:10, border: failCount > 0 ? `1px solid ${C.errorBorder}` : `1px solid ${C.success}30` }}>
            <div style={{ fontSize:8, color:T.muted, textTransform:"uppercase", fontFamily:FONT }}>Failed</div>
            <div style={{ fontSize:28, fontWeight:600, color: failCount > 0 ? C.error : C.success, fontFamily:FONT }}>{failCount}</div>
          </div>
        </div>

        {/* Gate Rows */}
        {gates.map((g, i) => (
          <div key={i} style={{
            display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
            background: g.status === "FAIL" ? "#FEF9F9" : N.card,
            borderRadius:10, border:`1px solid ${g.status === "FAIL" ? "#FECACA" : N.border}`,
            marginBottom:8, transition:"all 0.2s",
          }}>
            <div style={{
              width:30, height:30, borderRadius:8, flexShrink:0,
              background: g.status === "PASS" ? "#ECFDF5" : C.errorBg,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, fontWeight:600,
              color: g.status === "PASS" ? "#059669" : "#DC2626",
              border: `1px solid ${g.status === "PASS" ? "#A7F3D0" : "#FECACA"}`,
            }}>
              {g.status === "PASS" ? "✓" : "✗"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:FONT, marginBottom:2 }}>{g.name}</div>
              {g.rule && (
                <div style={{ fontSize:9, color:T.light, fontFamily:FONT, letterSpacing:"0.2px" }}>
                  Rule basis: {g.rule}
                </div>
              )}
            </div>
            <span style={{
              display:"inline-block", padding:"3px 10px", borderRadius:5,
              fontSize:9, fontWeight:700, letterSpacing:"0.5px", flexShrink:0,
              background: g.status === "PASS" ? "#ECFDF5" : C.errorBg,
              color: g.status === "PASS" ? "#059669" : "#DC2626",
              border: `1px solid ${g.status === "PASS" ? "#A7F3D0" : "#FECACA"}`,
            }}>{g.status}</span>
          </div>
        ))}

        {/* Overall Status */}
        <div style={{ marginTop:20, padding:"16px 20px", borderRadius:10,
          background: failCount === 0 ? G.mint : C.errorBg,
          border: failCount === 0 ? `1px solid ${G.forest}40` : "1px solid #FECACA" }}>
          <div style={{ fontSize:13, fontWeight:700, fontFamily:FONT, color: failCount === 0 ? G.forest : C.error, marginBottom:4, display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ display:"flex", alignItems:"center", color: failCount === 0 ? G.forest : C.error }}>{React.cloneElement(failCount === 0 ? IC.shield : IC.alertTriangle, { width:14, height:14, strokeWidth:2 })}</span>
            {failCount === 0 ? "All QC gates passed — application is ready for submission" : `${failCount} gate(s) failing — resolve before submission`}
          </div>
          <div style={{ fontSize:11, color: failCount === 0 ? G.forest : C.error, fontFamily:FONT, opacity:0.8 }}>
            {failCount === 0
              ? `All ${gates.length} pre-submission quality control checks have been satisfied. The application may proceed to submission.`
              : `${failCount} of ${gates.length} QC gate(s) are failing. Review the failing items above and correct them before submitting the application.`}
          </div>
        </div>
      </div>
    );
  };

  /* ── Audit Trail View ── */
  const AuditTrailView = () => (
    <div style={{ maxWidth:780, margin:"0 auto", padding:"20px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, color:T.primary, fontFamily:FONT, marginBottom:4 }}>Audit Trail</h2>
          <p style={{ fontSize:12, color:T.muted, fontFamily:FONT }}>Chronological record of all application events</p>
        </div>
        <button onClick={() => setView("app")} style={{
          padding:"8px 16px", border:`1px solid ${N.border}`, borderRadius:8,
          background:N.card, fontSize:11, fontWeight:600, color:T.body,
          fontFamily:FONT, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
        }}>← Back to Application</button>
      </div>

      <div style={{ padding:"10px 14px", background:C.infoBg, borderRadius:8, border:`1px solid ${C.infoBorder}`, marginBottom:16, fontSize:11, color:C.info, fontFamily:FONT, lineHeight:1.6 }}>
        All application events are recorded in this audit trail. Required for supervisory review
        and regulatory recordkeeping per FINRA Rule 4511 / SEC Rule 17a-4.
      </div>

      {auditLog.length === 0 ? (
        <div style={{ textAlign:"center", padding:"48px 20px", color:T.muted, fontFamily:FONT }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>No Events Recorded Yet</div>
          <div style={{ fontSize:11 }}>Audit entries are created as you interact with the application.</div>
        </div>
      ) : (
        <div style={{ background:N.card, borderRadius:12, border:`1px solid ${N.border}`, overflow:"hidden" }}>
          <div style={{ padding:"10px 16px", background:N.section, borderBottom:`1px solid ${N.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, fontWeight:700, color:T.primary, fontFamily:FONT }}>Event Log</span>
            <span style={{ fontSize:10, color:T.muted, fontFamily:FONT }}>{auditLog.length} event{auditLog.length !== 1 ? "s" : ""}</span>
          </div>
          {auditLog.map((entry, i) => (
            <div key={i} style={{ display:"flex", gap:12, padding:"12px 16px", borderBottom:`1px solid ${N.divider}`, alignItems:"flex-start" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:G.forest, marginTop:5, flexShrink:0, boxShadow:`0 0 0 3px ${G.mint}` }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:T.primary, fontFamily:FONT }}>{entry.action}</div>
                {entry.details && (
                  <div style={{ fontSize:10, color:T.muted, fontFamily:FONT, marginTop:2, lineHeight:1.5 }}>
                    {typeof entry.details === "object" ? JSON.stringify(entry.details) : entry.details}
                  </div>
                )}
              </div>
              <div style={{ fontSize:10, color:T.light, fontFamily:FONT, flexShrink:0, whiteSpace:"nowrap", textAlign:"right" }}>
                {entry.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════════════════════
     RENDER — Main component render
     ══════════════════════════════════════════════════════ */

  /* NOTE: Steps are called as plain functions (not JSX <Component/>)
     to prevent React from treating redefined functions as new component
     types on each render, which would unmount/remount inputs and lose
     focus after every keystroke. THIS IS THE MOST IMPORTANT RULE. */
  const renderStep = () => {
    switch(step) {
      case 0: return MarketplaceStep();
      case 1: return ExchangeSetupStep();
      case 2: return CartStep();
      case 3: return FinancialStep();
      case 4: return AccountStep();
      case 5: return DisclosureStep();
      case 6: return ReviewStep();
      default: return MarketplaceStep();
    }
  };

  /* ── View Router ── */
  if (view === "entry") return EntryRouter();
  if (view === "rep-console") return RepConsole();
  if (view === "css-entry") return CSSEntry();
  if (view === "regbi") return RegBIView();
  if (view === "qc-gate") return QCGateView();
  if (view === "audit") return AuditTrailView();

  /* ── Main App View ── */
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(to bottom, #f9fafb, #e5e7eb)", fontFamily:FONT }} ref={topRef}>
      {/* ─── Global Form Focus Styles ─── */}
      <style>{`
        .stax-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .stax-input:focus {
          outline: none;
          border-color: #1B5E3B !important;
          box-shadow: 0 0 0 3px rgba(27,94,59,0.10) !important;
        }
        .stax-input::placeholder {
          color: #B0B8C4;
        }
        .stax-input:hover:not(:focus) {
          border-color: #9CA3AF;
        }
        .stax-input.has-error {
          border-color: #EF6B51 !important;
        }
        .stax-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(239,107,81,0.12) !important;
        }
        .stax-input.is-valid {
          border-color: #1B5E3B !important;
        }
        .stax-select {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          appearance: none;
          -webkit-appearance: none;
        }
        .stax-select:focus {
          outline: none;
          border-color: #1B5E3B !important;
          box-shadow: 0 0 0 3px rgba(27,94,59,0.10) !important;
        }
        .stax-select:hover:not(:focus) {
          border-color: #9CA3AF;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        button:active { transform: scale(0.98); }
        button:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        @media (max-width: 640px) {
          .stax-mobile-stack { flex-direction: column !important; }
          .stax-mobile-full { width: 100% !important; }
        }
        * { -webkit-tap-highlight-color: transparent; }
        @keyframes stax-highlight-fade {
          0%   { box-shadow: 0 0 0 3px rgba(239,107,81,0.40); }
          100% { box-shadow: 0 0 0 3px rgba(239,107,81,0); }
        }
        .stax-field-highlight {
          animation: stax-highlight-fade 0.9s ease-out forwards;
        }
      `}</style>

      {/* ─── Top Nav ─── */}
      <div style={{ padding:"12px 24px 0", position:"sticky", top:0, zIndex:200 }}>
        <div style={{
          background:NAVY[700],
          borderRadius:20,
          padding:"0 24px", display:"flex", justifyContent:"space-between",
          alignItems:"center", height:62,
          boxShadow:"0 4px 24px rgba(0,0,0,0.18)",
        }}>
          {/* Left: Logo + divider + regulatory logos */}
          <div style={{ display:"flex", alignItems:"center", gap:32, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
              <svg width="30" height="22" viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="navLg" x1="0" y1="20" x2="54" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38"/>
                    <stop offset="100%" stopColor="#ffffff"/>
                  </linearGradient>
                </defs>
                <path d="M1.067 9.700L7.309 3.456C7.895 2.869 8.856 2.869 9.443 3.456L21.499 15.517C22.086 16.104 22.086 17.065 21.499 17.652L15.258 23.896C14.671 24.483 13.710 24.483 13.124 23.896L1.067 11.835C0.480 11.248 0.480 10.287 1.067 9.700Z" fill="url(#navLg)"/>
                <path d="M16.111 24.750L22.353 18.506C22.939 17.919 23.900 17.919 24.487 18.506L36.543 30.567C37.130 31.154 37.130 32.115 36.543 32.702L30.301 38.946C29.715 39.533 28.754 39.533 28.168 38.946L16.111 26.885C15.524 26.298 15.524 25.337 16.111 24.750Z" fill="url(#navLg)"/>
                <path d="M17.469 7.308L23.711 1.064C24.298 0.477 25.258 0.477 25.845 1.064L37.902 13.125C38.488 13.712 38.488 14.672 37.902 15.259L31.660 21.503C31.073 22.090 30.113 22.090 29.526 21.503L17.469 9.442C16.883 8.855 16.883 7.895 17.469 7.308Z" fill="url(#navLg)"/>
                <path d="M32.513 22.358L38.755 16.114C39.342 15.527 40.302 15.527 40.889 16.114L52.946 28.174C53.532 28.762 53.532 29.722 52.946 30.309L46.704 36.553C46.117 37.140 45.157 37.140 44.570 36.553L32.513 24.492C31.926 23.905 31.926 22.945 32.513 22.358Z" fill="white"/>
              </svg>
              <div style={{ display:"flex", alignItems:"baseline", letterSpacing:"0.14em", lineHeight:1 }}>
                <span style={{ fontFamily:FONT, fontSize:15, fontWeight:700, color:T.white }}>STAX</span>
                <span style={{ fontFamily:FONT, fontSize:15, fontWeight:400, color:"rgba(168,162,158,0.9)" }}>AI</span>
              </div>
            </div>
            <div style={{ width:1, height:33, background:"rgba(255,255,255,0.15)" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:20, opacity:0.7 }}>

              {/* FINRA — 720×320 PNG, natural 2.25:1 ratio → 45×20 */}
              <img src="/finra-logo-v2.png" alt="FINRA"
                style={{ height:20, width:"auto", filter:"brightness(0) invert(1)", flexShrink:0 }}/>

              {/* BrokerCheck — large PNG cropped to show center logo area (matches Figma crop) */}
              <div style={{ width:79, height:20, overflow:"hidden", position:"relative", flexShrink:0 }}>
                <img src="/brokercheck-logo-v2.png" alt="BrokerCheck" style={{
                  position:"absolute",
                  width:"145.35%",
                  height:"323.6%",
                  left:"-23%",
                  top:"-113.76%",
                  filter:"brightness(0) invert(1)",
                }}/>
              </div>

              {/* SIPC — 36×20 SVG, flip vertically per Figma */}
              <img src="/sipc-logo-v2.svg" alt="SIPC"
                style={{ width:36, height:20, filter:"brightness(0) invert(1)", transform:"scaleY(-1)", flexShrink:0 }}/>

            </div>
          </div>

          {/* Right: CTA + rep tools */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            {workflowType === "rep-initiated" && (
              <div style={{ display:"flex", gap:6 }}>
                {[
                  { label:"Reg BI", view:"regbi" },
                  { label:"QC Gate", view:"qc-gate" },
                  { label:"Audit", view:"audit" },
                ].map(btn => (
                  <button key={btn.view} onClick={() => setView(btn.view)} style={{
                    padding:"5px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.12)",
                    background:"rgba(255,255,255,0.06)", fontSize:10, fontWeight:600,
                    color:"rgba(255,255,255,0.6)", fontFamily:FONT, cursor:"pointer",
                  }}>{btn.label}</button>
                ))}
              </div>
            )}
            <button style={{
              padding:"8px 12px", borderRadius:8, height:32,
              border:"none",
              background:GOLD[700],
              fontSize:12, fontWeight:500, color:T.white,
              fontFamily:FONT, cursor:"pointer",
              transition:"background 0.15s",
              boxShadow:"0 1px 2px rgba(0,0,0,0.05)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="#6b6560"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#7c766e"; }}
            >Schedule Consultation</button>
          </div>
        </div>
      </div>

      {/* ─── Rep Banner (if rep-initiated workflow) ─── */}
      {workflowType === "rep-initiated" && RepBanner()}

      {/* ─── Stepper ─── */}
      {/* ─── Content ─── */}
      <div style={{ maxWidth: 1200, margin:"0 auto", padding:"28px 24px 80px" }}>
        <ValidationCtx.Provider value={validationOn}>
          {renderStep()}
        </ValidationCtx.Provider>
      </div>

      {/* ─── DEV: Autofill Button (development only — stripped in prod builds) ─── */}
      {QUICK_FILL_ENABLED && view === "app" && step <= 5 && (
        <button
          onClick={quickFill}
          title={`Autofill Step ${step + 1} — populate all fields with mock data`}
          style={{
            position: "fixed", bottom: 88, right: 20, zIndex: 300,
            height: 36, borderRadius: 18,
            background: N.card, border: `1px solid ${N.border}`,
            cursor: "pointer", padding: "0 14px 0 10px",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            transition: "box-shadow 0.15s, border-color 0.15s",
            fontFamily: FONT, fontSize: 11, fontWeight: 600, color: T.muted,
            letterSpacing: "0.02em",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.14)"; e.currentTarget.style.borderColor = N.divider; e.currentTarget.style.color = T.primary; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = N.border; e.currentTarget.style.color = T.muted; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          Autofill
        </button>
      )}

      {/* ─── Sticky Bottom Navigation ─── */}
      {step >= 0 && step < STEPS.length && (() => {
        const pctComplete = Math.round((step / (STEPS.length - 1)) * 100);
        const r = 20, circ = 2 * Math.PI * r;
        const dash = circ * (1 - pctComplete / 100);
        const nextStep = STEPS[step + 1];
        const isLast = step === STEPS.length - 1;
        const ctaLabel = isLast ? "Complete" : `Proceed to ${nextStep?.label}`;
        const canGo = canProceed(step);
        return (
          <div style={{
            position:"fixed", bottom:0, left:0, right:0, zIndex:190,
            background: N.card,
            borderTop: `1px solid ${N.neutral}`,
            padding:"10px 64px", display:"flex", alignItems:"center",
            justifyContent:"space-between",
            boxShadow:"0 -2px 16px rgba(0,0,0,0.06)",
          }}>
            {/* Left: progress circle + step info */}
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ position:"relative", width:48, height:48, flexShrink:0 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform:"rotate(-90deg)" }}>
                  <circle cx="24" cy="24" r={r} fill="none" stroke={N.neutral} strokeWidth="3"/>
                  <circle cx="24" cy="24" r={r} fill="none" stroke={NAVY[600]} strokeWidth="3"
                    strokeDasharray={circ} strokeDashoffset={dash}
                    strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.5s ease" }}/>
                </svg>
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:600, color: T.primary, fontFamily:FONT,
                }}>{pctComplete}%</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ fontSize:14, fontWeight:600, color: NAVY[600], fontFamily:FONT, lineHeight:1 }}>{STEPS[step].label}</div>
                {nextStep && (
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    <span style={{ fontSize:12, color: T.muted, fontFamily:FONT, lineHeight:1 }}>Next Step:</span>
                    <span style={{ fontSize:12, fontWeight:600, color: T.muted, fontFamily:FONT, lineHeight:1 }}>{nextStep.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Back + CTA grouped */}
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {step > 0 && (
                <button onClick={goBack} style={{
                  padding:"8px 18px", height:36, borderRadius:8,
                  border: `1px solid ${N.border}`, background: N.card,
                  fontSize:14, fontWeight:500, color: T.primary,
                  fontFamily:FONT, cursor:"pointer",
                  boxShadow:"0 1px 2px rgba(0,0,0,0.05)",
                  display:"flex", alignItems:"center", gap:6,
                }}>
                  ‹ Back
                </button>
              )}
              {!isLast && (
                <button onClick={goNext} style={{
                  padding:"8px 18px", height:36, borderRadius:8,
                  background: GOLD[700], border: `1px solid ${GOLD[800]}`, color:T.white,
                  fontSize:14, fontWeight:600, fontFamily:FONT,
                  cursor: canGo ? "pointer" : "not-allowed",
                  opacity: canGo ? 1 : 0.5,
                  transition:"background 0.15s",
                  display:"flex", alignItems:"center", gap:6,
                  boxShadow: canGo ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  letterSpacing:"0.01em",
                }}
                  onMouseEnter={e => { if (canGo) e.currentTarget.style.background = C.ctaHover; }}
                  onMouseLeave={e => { if (canGo) e.currentTarget.style.background = GOLD[700]; }}
                >{ctaLabel} ›</button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ─── Footer ─── */}
      <AppFooter />

      {/* ─── Detail Modal ─── */}
      {detail && (
        <DetailModal
          dst={DST_OFFERINGS.find(d => d.id === detail)}
          inCart={(cart[detail] || 0) > 0}
          onToggle={toggleCart}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}
