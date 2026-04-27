// Seed values for the customer logo strip ("Trusted by" marquee).
// Used in two scenarios:
//   1. Marketing fallback when the customer_logos Firestore collection is empty
//   2. Seeded into Firestore by the admin's "Initialize from defaults" button

export interface DefaultCustomerLogo {
  name: string
  imageUrl: string
}

export const DEFAULT_CUSTOMER_LOGOS: DefaultCustomerLogo[] = [
  { name: 'Generali', imageUrl: '/images/customers/generali.jpg' },
  { name: 'Robeco', imageUrl: '/images/customers/robeco.jpg' },
  { name: 'FrieslandCampina', imageUrl: '/images/customers/frieslandcampina.png' },
  { name: 'Gemeente Amsterdam', imageUrl: '/images/customers/gemeente-amsterdam.jpg' },
  { name: 'BAT', imageUrl: '/images/customers/bat.jpg' },
  { name: 'Credit Europe', imageUrl: '/images/customers/credit-europe.jpg' },
  { name: 'Crocs', imageUrl: '/images/customers/crocs.jpg' },
  { name: 'Howden', imageUrl: '/images/customers/howden.jpg' },
  { name: 'Mediq', imageUrl: '/images/customers/mediq.png' },
  { name: 'Intrum', imageUrl: '/images/customers/intrum.png' },
  { name: 'BKR', imageUrl: '/images/customers/bkr.jpg' },
  { name: 'CAK', imageUrl: '/images/customers/cak.jpg' },
  { name: 'AAC', imageUrl: '/images/customers/aac.jpg' },
  { name: 'EMS', imageUrl: '/images/customers/ems.png' },
  { name: 'Erasmus Leven', imageUrl: '/images/customers/erasmus-leven.jpg' },
  { name: 'FCA Capital', imageUrl: '/images/customers/fca-capital.jpg' },
  { name: 'Harmony', imageUrl: '/images/customers/harmony.jpg' },
  { name: 'Infomedics', imageUrl: '/images/customers/infomedics.jpg' },
  { name: 'Tentoo', imageUrl: '/images/customers/tentoo.jpg' },
]
