export interface FilterTag {
  id: string;
  label: string;
  shortDesc: string;
  isHighIntent?: boolean;
}

export interface CategoryConfig {
  slug: string;
  name: string;
  singularName: string;
  shortName: string;
  iconSvgPath: string;
  avgJobValueGbp: string;
  fbMiningPainPoint: string;
  description: string;
  filterTags: FilterTag[];
  commonServices: string[];
  faqTemplates: {
    questionTemplate: string;
    answerTemplate: string;
  }[];
}

/**
 * UNIVERSAL FILTER GAP TAGS (Chris Koerner's "The Filter Gap Secret")
 * These filters solve the exact questions locals ask in Crewe/Nantwich/Sandbach Facebook groups
 * that Google Maps fails to filter cleanly.
 */
export const UNIVERSAL_FILTERS: FilterTag[] = [
  {
    id: 'emergency-24-7',
    label: '24/7 Emergency Callout',
    shortDesc: 'Available day or night for urgent callouts',
    isHighIntent: true,
  },
  {
    id: 'no-callout-fee',
    label: 'No Call-Out Fee',
    shortDesc: 'Pay only for work agreed – free arrival & diagnosis',
    isHighIntent: true,
  },
  {
    id: 'free-quotes',
    label: 'Free Written Quotes',
    shortDesc: 'Fixed upfront quote via visit or WhatsApp photos',
    isHighIntent: true,
  },
  {
    id: 'trade-accredited',
    label: 'Trade Accredited / Insured',
    shortDesc: 'Public liability insured & trade body registered',
  },
  {
    id: 'card-accepted',
    label: 'Accepts Card & Bank Transfer',
    shortDesc: 'No cash-only hassle; full invoice provided',
  },
  {
    id: 'family-local',
    label: 'Independent Local (CW Based)',
    shortDesc: 'Based locally in South Cheshire – not a national call centre',
  },
];

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'plumbers',
    name: 'Plumbers & Heating Engineers',
    singularName: 'Plumber & Heating Engineer',
    shortName: 'Plumbers & Boilers',
    iconSvgPath: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
    avgJobValueGbp: '£120 – £2,400',
    fbMiningPainPoint: '"Anyone know an emergency plumber in Crewe/Nantwich who actually answers the phone and is Gas Safe?"',
    description:
      'Gas Safe heating engineers, boiler repair specialists and emergency plumbers for burst pipes, radiator leaks and bathroom installations.',
    filterTags: [
      { id: 'gas-safe', label: 'Gas Safe Registered', shortDesc: 'Certified to work legally on gas boilers & appliances', isHighIntent: true },
      { id: 'emergency-24-7', label: '24/7 Emergency Callout', shortDesc: 'Rapid response for leaks & boiler breakdowns', isHighIntent: true },
      { id: 'no-callout-fee', label: 'No Call-Out Fee', shortDesc: 'Zero charge just to inspect the issue' },
      { id: 'free-quotes', label: 'Free Written Quotes', shortDesc: 'Upfront pricing before any work begins' },
      { id: 'landlord-certs', label: 'Landlord CP12 Certificates', shortDesc: 'Annual gas safety checks for landlords' },
    ],
    commonServices: [
      'Combi Boiler Servicing & Repair',
      '24/7 Burst Pipe & Leak Repair',
      'Radiator & Valve Replacement',
      'Landlord Gas Safety Certificates (CP12)',
      'Bathroom & Unvented Cylinder Fitting',
    ],
    faqTemplates: [
      {
        questionTemplate: 'How much does a plumber or boiler service cost in {town} ({postcodes})?',
        answerTemplate:
          'In {town}, a standard annual gas boiler service typically costs between £70 and £95. Emergency plumbing callouts in {postcodes} range from £85 to £140 depending on time of day, though several independent {town} plumbers listed above offer a No Call-Out Fee policy during daytime hours.',
      },
      {
        questionTemplate: 'Are heating engineers in {town} Gas Safe registered?',
        answerTemplate:
          'Any engineer working on a gas boiler, hob or flue in {town} and surrounding areas ({villages}) must by law be on the official Gas Safe Register. Use our "Gas Safe Registered" filter above to view verified engineers.',
      },
    ],
  },
  {
    slug: 'electricians',
    name: 'Electricians & EV Installers',
    singularName: 'Electrician',
    shortName: 'Electricians',
    iconSvgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    avgJobValueGbp: '£110 – £1,800',
    fbMiningPainPoint: '"Looking for a reliable NICEIC electrician in Crewe/Sandbach for a fuse board upgrade or EV charger?"',
    description:
      'NICEIC & NAPIT registered domestic electricians for fault finding, consumer unit upgrades, EICR landlord checks, and home EV charger installations.',
    filterTags: [
      { id: 'niceic-napit', label: 'NICEIC / NAPIT Approved', shortDesc: 'Part P certified for building regulations compliance', isHighIntent: true },
      { id: 'ev-chargers', label: 'EV Charger Installer', shortDesc: 'Home electric vehicle wallbox installation', isHighIntent: true },
      { id: 'eicr-testing', label: 'EICR Landlord Testing', shortDesc: 'Electrical safety certificates for rentals & homebuyers' },
      { id: 'emergency-24-7', label: '24/7 Power Fault Callout', shortDesc: 'Tripping RCDs & power loss diagnostics' },
      { id: 'free-quotes', label: 'Free Written Quotes', shortDesc: 'Transparent itemised quotes' },
    ],
    commonServices: [
      'Consumer Unit (Fuse Board) Upgrades',
      'EICR Electrical Safety Certificates',
      'Home EV Charger Installation',
      '24/7 Tripping Fuse & Fault Finding',
      'Full & Partial House Rewires',
    ],
    faqTemplates: [
      {
        questionTemplate: 'How much does an EICR or fuse board upgrade cost in {town}?',
        answerTemplate:
          'For a typical 3-bedroom property in {town} ({postcodes}), an EICR electrical safety inspection costs £130–£180, while upgrading to a modern metal consumer unit with RCBO surge protection averages £480–£680 including Part P certification.',
      },
      {
        questionTemplate: 'Do {town} electricians cover nearby villages like {villages}?',
        answerTemplate:
          'Yes — all electricians listed in our {town} directory cover the wider {postcodes} area including {villages} with no extra mileage surcharge.',
      },
    ],
  },
  {
    slug: 'roofers',
    name: 'Roofers & Guttering Specialists',
    singularName: 'Roofer',
    shortName: 'Roofers & Gutters',
    iconSvgPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    avgJobValueGbp: '£180 – £4,500',
    fbMiningPainPoint: '"Lost ridge tiles in the storm! Any honest roofers in Nantwich/Crewe who do small repairs without charging a fortune?"',
    description:
      'Trusted local roofers for slipped slates, storm damage, chimney repointing, EPDM flat roofs, and uPVC fascia, soffit and guttering repairs.',
    filterTags: [
      { id: 'storm-repairs', label: 'Rapid Storm & Leak Repair', shortDesc: 'Fast tarping & tile replacement after high winds', isHighIntent: true },
      { id: 'drone-inspection', label: 'Free Photo/Drone Roof Survey', shortDesc: 'See before & after photos of your roof from the ground', isHighIntent: true },
      { id: 'flat-roofs', label: 'GRP & EPDM Flat Roofs', shortDesc: '20-year guaranteed rubber & fibreglass flat roofs' },
      { id: 'gutter-fascia', label: 'Gutter Clearing & uPVC Fascias', shortDesc: 'Unblocking, repairs & replacement' },
      { id: 'free-quotes', label: 'Free Written Quotes', shortDesc: 'Written insurance-ready quotes' },
    ],
    commonServices: [
      'Slipped Tile & Storm Leak Repairs',
      'EPDM Rubber & GRP Fibreglass Flat Roofs',
      'Chimney Repointing & Lead Flashing',
      'uPVC Fascias, Soffits & Gutter Cleaning',
      'Full Roof Replacements & Re-roofing',
    ],
    faqTemplates: [
      {
        questionTemplate: 'Can I get a roofer in {town} for a small tile or gutter repair?',
        answerTemplate:
          'Yes! One of the biggest frustrations in {town} is finding a roofer willing to take on minor repairs. Use our filters to find independent {town} roofers who handle slipped tiles, leaking valleys and gutter joints across {postcodes}.',
      },
    ],
  },
  {
    slug: 'driveway-cleaning',
    name: 'Driveway Cleaning, Jet Washing & Paving',
    singularName: 'Driveway & Exterior Cleaning Specialist',
    shortName: 'Driveways & Jet Wash',
    iconSvgPath: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z',
    avgJobValueGbp: '£150 – £3,200',
    fbMiningPainPoint: '"Who does rotary pressure washing and kiln-dried resanding for block paving driveways in Crewe/Sandbach?"',
    description:
      'Commercial-grade rotary pressure washing, block paving re-sanding & sealing, patio black-spot removal, and resin/block driveway installations.',
    filterTags: [
      { id: 're-sanding-sealing', label: 'Block Paving Re-Sand & Seal', shortDesc: 'Includes kiln-dried sand & weed inhibitor', isHighIntent: true },
      { id: 'whatsapp-quote', label: 'Instant WhatsApp Photo Quote', shortDesc: 'Send a photo of your driveway for a same-day estimate', isHighIntent: true },
      { id: 'softwash-patio', label: 'Patio Black Spot & Algae Treatment', shortDesc: 'Safe biocide & sodium hypochlorite treatment' },
      { id: 'resin-block-install', label: 'New Resin & Block Driveways', shortDesc: 'Full groundwork & driveway installation' },
      { id: 'free-quotes', label: 'Free Written Quotes', shortDesc: 'Fixed per-square-metre pricing' },
    ],
    commonServices: [
      'Rotary Driveway Jet Washing & Re-Sanding',
      'Indian Stone Patio Black-Spot Removal',
      'Resin Bound & Block Paving Installations',
      'Roof Moss Softwashing & Gutter Vacuuming',
      'Driveway Sealing & Oil Stain Removal',
    ],
    faqTemplates: [
      {
        questionTemplate: 'How much does driveway pressure washing cost in {town}?',
        answerTemplate:
          'In {town} ({postcodes}), professional rotary jet washing for a standard 2-car driveway typically costs £140–£240, including chemical weed treatment and kiln-dried re-sanding for block paving.',
      },
    ],
  },
  {
    slug: 'landscapers',
    name: 'Landscapers, Fencing & Tree Surgeons',
    singularName: 'Landscaper & Tree Surgeon',
    shortName: 'Fencing & Gardens',
    iconSvgPath: 'M12 22v-7l-2-2m4 0l2-2m-2 2v-4m0 0L9 4l3-2 3 2-3 5z',
    avgJobValueGbp: '£220 – £5,000',
    fbMiningPainPoint: '"Fence panels blown down in Crewe! Anyone recommend a fencer or tree surgeon with a waste carriers licence?"',
    description:
      'Heavy-duty concrete post & gravel board fencing, porcelain & Indian stone patios, artificial grass, hedge reductions and NPTC qualified tree surgery.',
    filterTags: [
      { id: 'fencing-repairs', label: 'Fencing & Concrete Posts', shortDesc: 'Storm-proof fence panels, posts & gates', isHighIntent: true },
      { id: 'nptc-tree', label: 'NPTC Qualified Tree Surgeon', shortDesc: 'Insured crown reduction, felling & stump grinding', isHighIntent: true },
      { id: 'waste-licence', label: 'Licensed Green Waste Removal', shortDesc: 'Environment Agency registered waste carrier' },
      { id: 'patios-turf', label: 'Patios, Decking & Turfing', shortDesc: 'Full garden makeovers & porcelain paving' },
      { id: 'free-quotes', label: 'Free Site Survey & Quote', shortDesc: 'No-obligation garden measure-up' },
    ],
    commonServices: [
      'Concrete Post & Feather-Edge Fencing',
      'Porcelain & Indian Sandstone Patios',
      'NPTC Tree Felling, Pruning & Stump Grinding',
      'Artificial Grass & New Lawn Turfing',
      'Hedge Cutting & Garden Clearance',
    ],
    faqTemplates: [
      {
        questionTemplate: 'How much does new garden fencing cost per bay in {town}?',
        answerTemplate:
          'Supplying and fitting heavy-duty feather-edge fencing with concrete posts and concrete gravel boards in {town} ({postcodes}) typically ranges from £135 to £175 per bay including old fence disposal.',
      },
    ],
  },
  {
    slug: 'locksmiths',
    name: '24/7 Local Locksmiths & uPVC Door Repair',
    singularName: 'Locksmith',
    shortName: 'Locksmiths',
    iconSvgPath: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-7 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3-5V7a3 3 0 0 0-6 0v4',
    avgJobValueGbp: '£75 – £240',
    fbMiningPainPoint: '"Watch out for the £49 national scam locksmith ads! Who is an actual local locksmith living in Crewe/Nantwich?"',
    description:
      'Genuine local South Cheshire locksmiths (no national call-centre bait-and-switch). Non-destructive entry, jammed uPVC multipoint door mechanisms, and anti-snap cylinder upgrades.',
    filterTags: [
      { id: 'emergency-24-7', label: '30-Min Emergency Response', shortDesc: 'Fast lockout assistance across CW postcodes', isHighIntent: true },
      { id: 'upvc-specialist', label: 'uPVC Door Gearbox & Mechanism Repair', shortDesc: 'Fix stiff handles without replacing the whole door', isHighIntent: true },
      { id: 'no-callout-fee', label: 'No Call-Out Fee & Fixed Phone Quote', shortDesc: 'Genuine price agreed on the phone before arrival' },
      { id: 'dbs-checked', label: 'DBS Background Checked', shortDesc: 'Police-checked & ID carried on every job' },
      { id: 'anti-snap', label: '3-Star Anti-Snap Locks (TS007)', shortDesc: 'Insurance-approved Ultion & ABS lock upgrades' },
    ],
    commonServices: [
      '24/7 Non-Destructive Lockout Entry',
      'uPVC & Composite Door Multipoint Mechanism Repair',
      '3-Star Anti-Snap Euro Cylinder Upgrades',
      'New Homeowner Lock Changes',
      'Double Glazed Window Lock & Hinge Repairs',
    ],
    faqTemplates: [
      {
        questionTemplate: 'How do I avoid national call-centre locksmith scams in {town}?',
        answerTemplate:
          'Many top Google Ads in {town} advertise "From £39" but send out-of-area subcontractors who charge £300+. Every locksmith in our {town} directory is verified as a local South Cheshire business dialing on 01270 or local mobile numbers with fixed quotes.',
      },
    ],
  },
  {
    slug: 'pest-control',
    name: 'Pest Control & Wasp Nest Removal',
    singularName: 'Pest Control Technician',
    shortName: 'Pest Control',
    iconSvgPath: 'M12 2a4 4 0 0 1 4 4v2a6 6 0 0 1 6 6v2a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2H4a2 2 0 0 1-2-2v-2a6 6 0 0 1 6-6V6a4 4 0 0 1 4-4z',
    avgJobValueGbp: '£65 – £220',
    fbMiningPainPoint: '"Huge wasp nest in the loft in Sandbach/Crewe! Who can come out today with a guaranteed fixed price?"',
    description:
      'BPCA & RSPH trained local pest technicians for same-day wasp nest treatments, loft rodent proofing, ants, fleas, and humane wildlife management.',
    filterTags: [
      { id: 'same-day-wasp', label: 'Same-Day Wasp Nest Guarantee', shortDesc: 'Fixed fee £65–£85 wasp treatment with 100% guarantee', isHighIntent: true },
      { id: 'unmarked-van', label: 'Discreet Unmarked Van', shortDesc: 'No giant bug logos parked outside your home', isHighIntent: true },
      { id: 'bpca-rsph', label: 'BPCA / RSPH Certified', shortDesc: 'Qualified & child/pet-safe treatments' },
      { id: 'rodent-proofing', label: 'Loft & Drain Rodent Proofing', shortDesc: 'Finds & seals entry points permanently' },
    ],
    commonServices: [
      'Same-Day Wasp & Hornet Nest Eradication',
      'Loft & Kitchen Mouse / Rat Control',
      'Rural Mole Catching (Nantwich & Sandbach)',
      'Flea, Carpet Beetle & Bedbug Treatments',
      'Solar Panel Bird & Pigeon Proofing',
    ],
    faqTemplates: [
      {
        questionTemplate: 'How much does wasp nest removal cost in {town}?',
        answerTemplate:
          'Local independent pest controllers in {town} ({postcodes}) charge a fixed price of £65 to £85 for treating a wasp nest, usually with a free re-visit guarantee if activity continues after 48 hours.',
      },
    ],
  },
  {
    slug: 'cleaners',
    name: 'Domestic, Carpet & End-of-Tenancy Cleaners',
    singularName: 'Cleaning Specialist',
    shortName: 'Cleaners & Carpets',
    iconSvgPath: 'M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z',
    avgJobValueGbp: '£60 – £380',
    fbMiningPainPoint: '"Need a DBS-checked weekly cleaner or end-of-tenancy deep clean with oven & carpet cleaning in Crewe/Nantwich?"',
    description:
      'Vetted regular domestic cleaners, deposit-back guaranteed end-of-tenancy cleaning teams, and truck-mount hot water carpet & upholstery cleaners.',
    filterTags: [
      { id: 'dbs-checked', label: 'DBS Checked & Insured', shortDesc: 'Vetted, reference-checked cleaners safe with house keys', isHighIntent: true },
      { id: 'deposit-guarantee', label: 'End-of-Tenancy Deposit Guarantee', shortDesc: 'Estate-agent approved checklist for CW rentals', isHighIntent: true },
      { id: 'carpet-oven', label: 'Carpet & Oven Deep Clean Included', shortDesc: 'One-stop booking for carpets, sofas & ovens' },
      { id: 'eco-pet-safe', label: 'Pet & Child Safe Eco Products', shortDesc: 'Non-toxic cleaning supplies included' },
    ],
    commonServices: [
      'Weekly & Fortnightly Domestic Cleaning',
      'End-of-Tenancy Deep Cleans (Landlord Approved)',
      'Hot Water Extraction Carpet & Sofa Cleaning',
      'Dip-Tank Oven & AGA Deep Cleaning',
      'After-Builders & Move-In Deep Cleans',
    ],
    faqTemplates: [
      {
        questionTemplate: 'What is the average hourly rate for a domestic cleaner in {town}?',
        answerTemplate:
          'In {town} and surrounding areas ({villages}), insured independent cleaners charge between £16 and £21 per hour including their own supplies, while full End-of-Tenancy deep cleans start around £180 for a 2-bed property.',
      },
    ],
  },
  {
    slug: 'handyman',
    name: 'Handyman & Odd-Job Property Maintenance',
    singularName: 'Handyman',
    shortName: 'Handyman',
    iconSvgPath: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    avgJobValueGbp: '£60 – £350',
    fbMiningPainPoint: '"Need someone reliable in Crewe/Sandbach for 2 hours to wall-mount a TV, hang internal doors and reseal a bath!"',
    description:
      'Multi-skilled local handymen for small jobs big builders turn down: TV wall mounting, flatpack furniture assembly, curtain poles, door trimming and silicone resealing.',
    filterTags: [
      { id: 'fixed-hourly', label: 'Transparent Half-Day / Hourly Rate', shortDesc: 'Clear pricing for 1-hour, half-day or full-day lists', isHighIntent: true },
      { id: 'small-jobs', label: 'No Job Too Small Guarantee', shortDesc: 'Happy to tackle 30–60 minute odd jobs', isHighIntent: true },
      { id: 'dbs-checked', label: 'DBS Checked & Senior Friendly', shortDesc: 'Trusted by elderly residents & families' },
      { id: 'landlord-turnaround', label: 'Landlord Rental Repairs', shortDesc: 'Fast turnaround between tenants' },
    ],
    commonServices: [
      'TV Wall Mounting & Hidden Cable Trunking',
      'IKEA / Flatpack Furniture Assembly',
      'Internal Door Planing, Handles & Locks',
      'Bath & Shower Silicone Resealing',
      'Shelving, Blinds, Curtain Poles & Mirrors',
    ],
    faqTemplates: [
      {
        questionTemplate: 'How much does a local handyman charge in {town}?',
        answerTemplate:
          'Most handymen in {town} ({postcodes}) charge £45–£60 for the first hour and £30–£40 for subsequent hours, or offer a discounted half-day rate (£130–£160) to tick off a whole list of household jobs at once.',
      },
    ],
  },
  {
    slug: 'decorators',
    name: 'Painters, Decorators & Plasterers',
    singularName: 'Painter, Decorator & Plasterer',
    shortName: 'Painters & Plasterers',
    iconSvgPath: 'M19 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 10v8m-4 0h8',
    avgJobValueGbp: '£250 – £2,800',
    fbMiningPainPoint: '"Anyone know a clean, dust-free plasterer or decorator in Nantwich/Crewe who turns up when they say they will?"',
    description:
      'Clean, punctual interior & exterior painters, wallpaper specialists, and smooth skimming plasterers using dustless Festool/Mirka extraction systems.',
    filterTags: [
      { id: 'dustless-sanding', label: '99% Dust-Free Mirka/Festool Sanding', shortDesc: 'Vacuum-extracted sanding keeps your home spotless', isHighIntent: true },
      { id: 'plaster-skimming', label: 'Smooth Plastering & Artex Skimming', shortDesc: 'Flatten textured ceilings & patch damaged walls', isHighIntent: true },
      { id: 'exterior-masonry', label: 'Exterior Masonry & Render Painting', shortDesc: 'Weathershield exterior painting for Cheshire homes' },
      { id: 'free-quotes', label: 'Free Fixed-Price Room Quote', shortDesc: 'Includes trade paint discounts (Dulux / Johnstone\'s)' },
    ],
    commonServices: [
      'Full Room & Hall-Stairs-Landing Decorating',
      'Artex Ceiling Smoothing & Wall Skimming',
      'Feature Wall & Designer Wallpaper Hanging',
      'Kitchen Cabinet Spraying & Woodwork Satin',
      'Exterior Render & Fascia Weatherproof Painting',
    ],
    faqTemplates: [
      {
        questionTemplate: 'How much does it cost to plaster or decorate a room in {town}?',
        answerTemplate:
          'In {town} ({postcodes}), skimming a standard bedroom ceiling or walls typically costs £280–£480, while painting and decorating a standard room (ceiling, walls, skirting and door) ranges from £320 to £550 plus trade paint.',
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}
