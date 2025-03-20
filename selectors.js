export const selectors = {
  // Car listing details
  listingContainer: '.sc-1nre5ec-1.crKvIr.listing a.sc-1jge648-0',
  title: '.sc-1x0vz2r-0.iHApav',
  price: '.sc-1x0vz2r-0.dJAfqm',
  location: '.sc-b57yxx-11.kclCPb p.sc-1x0vz2r-0.layWaX',
  year: '[title="Année-Modèle"] span',
  transmission: '[title="Boite de vitesses"] span',
  fuel: '[title="Type de carburant"] span',
  image: 'img.sc-bsm2tm-3',

  // Cookie consent button
  consentButtonSelectors: [
    'button.fc-cta-consent.fc-primary-button',
    'button[aria-label="Autoriser"]',
    'button.fc-button',
  ],
};
