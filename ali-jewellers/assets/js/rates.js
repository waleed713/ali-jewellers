/* rates.js : today's rates shown in the moving bar at the top of every page.
   Edit the numbers and the date every morning. Rates are per tola in PKR. */
window.AJ = window.AJ || {};
AJ.rates = {
  updated: "2026-11-05",
  gold24Tola: 436000, // number used by the size chart to estimate prices (keep it the same as the 24K selling rate below)
  items: [
    { label: "Gold 24K", type: "Selling", value: "PKR 436,000" },
    { label: "Gold 24K", type: "Buying", value: "PKR 433,000" },
    { label: "Gold 22K", type: "Selling", value: "PKR 399,500" },
    { label: "Silver", type: "Per tola", value: "PKR 5,900" },
    { label: "Diamond", type: "From, per carat", value: "PKR 450,000" },
  ],
  note: "Open 7 days a week",
};
