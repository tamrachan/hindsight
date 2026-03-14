export const EVENTS = [
  {
    id: "dotcom",
    name: "Dot-com Bubble Burst",
    date: "2000-03-10",
    category: "market crash",
    description:
      "The NASDAQ peaked and began a prolonged collapse, wiping out trillions in tech valuations and triggering a broader recession.",
  },
  {
    id: "911",
    name: "9/11 Attacks",
    date: "2001-09-11",
    category: "geopolitical shock",
    description:
      "Terrorist attacks triggered immediate market sell-offs, with stocks plunging ~15% in the following week.",
  },
  {
    id: "gfc",
    name: "Global Financial Crisis",
    date: "2008-09-15",
    category: "banking crisis",
    description:
      "Lehman Brothers collapse sparked a global recession. Equities fell ~50%, while gold surged as a safe haven.",
  },
  {
    id: "covid",
    name: "COVID-19 Pandemic",
    date: "2020-03-16",
    category: "pandemic",
    description:
      "Global lockdowns caused the fastest market crash in history, followed by a rapid ESG-led recovery.",
  },
  {
    id: "russia-ukraine-war",
    name: "Russia-Ukraine War",
    date: "2022-02-24",
    category: "geopolitical shock",
    description:
      "Energy commodity prices surged. European clean energy indices also rose on energy security concerns.",
  },
  {
    id: "paris",
    name: "Paris Agreement",
    date: "2015-12-12",
    category: "policy agreement",
    description:
      "Global climate accord boosted ESG and clean energy funds. Fossil fuel stocks began long-term repricing.",
  },
];

export const EVENTS_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
