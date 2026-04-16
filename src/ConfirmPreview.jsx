/**
 * ConfirmPreview.jsx  — dev preview entry point
 * Renders ConfirmInvestmentPlan with Figma-matching mock data.
 * Usage: temporarily swap main.jsx to import this, or open alongside existing app.
 */
import ConfirmInvestmentPlan from "./ConfirmInvestmentPlan";

const MOCK_ITEMS = [
  {
    id: "passco-prism",
    name: "Passco Prism",
    sponsor: "Passco",
    location: "Moon Township, PA",
    propertyTypeShort: "Multifamily",
    offeringEquity:  59_200_000,
    loanAmount:     100_250_000,
    distributionRate: 4.30,
    ltv: 45.31,
    investorEquity:   100_000,
  },
  {
    id: "nextpoint-outlook",
    name: "NexPoint Outlook",
    sponsor: "NexPoint",
    location: "Birmingham, AL",
    propertyTypeShort: "Multifamily",
    offeringEquity:  32_900_000,
    loanAmount:      66_000_000,
    distributionRate: 4.44,
    ltv: 49.90,
    investorEquity:   100_000,
  },
  {
    id: "pg-manchester",
    name: "PG Manchester Industrial",
    sponsor: "Peachtree",
    location: "Londonderry, NH",
    propertyTypeShort: "Industrial",
    offeringEquity:  28_100_000,
    loanAmount:           0,
    distributionRate: 5.03,
    ltv: 0.00,
    investorEquity:   100_000,
  },
];

export default function ConfirmPreview() {
  return (
    <ConfirmInvestmentPlan
      exchangeProceeds={849_000}
      items={MOCK_ITEMS}
      debtRetiredAtSale={185_000}
      rpAnnualIncome={36_000}
      rpAnnualExpenses={9_800}
      rpPurchasePrice={250_000}
      rpYearsOwned={27.5}
      capitalGainsTax={169_800}
      depRecapture={0}
      initialAcknowledged={false}
    />
  );
}
