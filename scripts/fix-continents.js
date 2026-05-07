#!/usr/bin/env node

/**
 * Fill missing cca2 and continent values in countries table.
 * Usage: node scripts/fix-continents.js [--apply]
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const idx = line.indexOf('=');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
} catch {
  // .env.local not found, rely on existing env
}

// Slug to ISO mapping (from src/lib/unsplash.ts)
const SLUG_TO_ISO = {
  afghanistan: 'af', albania: 'al', algeria: 'dz', andorra: 'ad', angola: 'ao',
  'antigua-and-barbuda': 'ag', argentina: 'ar', armenia: 'am', australia: 'au',
  austria: 'at', azerbaijan: 'az', bahamas: 'bs', bahrain: 'bh', bangladesh: 'bd',
  barbados: 'bb', belarus: 'by', belgium: 'be', belize: 'bz', benin: 'bj',
  bhutan: 'bt', bolivia: 'bo', 'bosnia-and-herzegovina': 'ba', botswana: 'bw',
  brazil: 'br', brunei: 'bn', bulgaria: 'bg', 'burkina-faso': 'bf', burundi: 'bi',
  cambodia: 'kh', cameroon: 'cm', canada: 'ca', 'cape-verde': 'cv',
  'central-african-republic': 'cf', chad: 'td', chile: 'cl', china: 'cn',
  colombia: 'co', comoros: 'km', 'republic-of-the-congo': 'cg',
  'costa-rica': 'cr', 'c-te-d-ivoire': 'ci', croatia: 'hr', cuba: 'cu', cyprus: 'cy',
  'czech-republic': 'cz', denmark: 'dk', djibouti: 'dj', dominica: 'dm',
  'dominican-republic': 'do', ecuador: 'ec', egypt: 'eg', 'el-salvador': 'sv',
  'equatorial-guinea': 'gq', eritrea: 'er', estonia: 'ee', eswatini: 'sz',
  ethiopia: 'et', fiji: 'fj', finland: 'fi', france: 'fr', gabon: 'ga', gambia: 'gm',
  georgia: 'ge', germany: 'de', ghana: 'gh', greece: 'gr', grenada: 'gd',
  guatemala: 'gt', guinea: 'gn', 'guinea-bissau': 'gw', guyana: 'gy', haiti: 'ht',
  honduras: 'hn', hungary: 'hu', iceland: 'is', india: 'in', indonesia: 'id',
  iran: 'ir', iraq: 'iq', ireland: 'ie', israel: 'il', italy: 'it', jamaica: 'jm',
  japan: 'jp', jordan: 'jo', kazakhstan: 'kz', kenya: 'ke', kiribati: 'ki',
  kuwait: 'kw', kyrgyzstan: 'kg', laos: 'la', latvia: 'lv', lebanon: 'lb',
  lesotho: 'ls', liberia: 'lr', libya: 'ly', liechtenstein: 'li', lithuania: 'lt',
  luxembourg: 'lu', madagascar: 'mg', malawi: 'mw', malaysia: 'my', mali: 'ml',
  malta: 'mt', 'marshall-islands': 'mh', mauritania: 'mr', mauritius: 'mu', mexico: 'mx',
  micronesia: 'fm', moldova: 'md', monaco: 'mc', montenegro: 'me', morocco: 'ma',
  mozambique: 'mz', myanmar: 'mm', namibia: 'na', nauru: 'nr', nepal: 'np',
  netherlands: 'nl', 'new-zealand': 'nz', nicaragua: 'ni', niger: 'ne', nigeria: 'ng',
  'north-korea': 'kp', 'north-macedonia': 'mk', norway: 'no', oman: 'om', pakistan: 'pk',
  palau: 'pw', panama: 'pa', paraguay: 'py', peru: 'pe', philippines: 'ph', poland: 'pl',
  portugal: 'pt', qatar: 'qa', romania: 'ro', russia: 'ru', rwanda: 'rw',
  'saint-kitts-and-nevis': 'kn', 'saint-lucia': 'lc',
  'saint-vincent-and-the-grenadines': 'vc', samoa: 'ws', 'san-marino': 'sm',
  'sao-tome-and-principe': 'st', 'saudi-arabia': 'sa', senegal: 'sn', serbia: 'rs',
  seychelles: 'sc', 'sierra-leone': 'sl', singapore: 'sg', slovakia: 'sk',
  slovenia: 'si', somalia: 'so', 'south-africa': 'za', 'south-korea': 'kr',
  'south-sudan': 'ss', spain: 'es', 'sri-lanka': 'lk', sudan: 'sd', suriname: 'sr',
  sweden: 'se', switzerland: 'ch', syria: 'sy', taiwan: 'tw', tajikistan: 'tj',
  tanzania: 'tz', thailand: 'th', 'timor-leste': 'tl', togo: 'tg', tonga: 'to',
  'trinidad-and-tobago': 'tt', tunisia: 'tn', turkey: 'tr', turkmenistan: 'tm',
  tuvalu: 'tv', uganda: 'ug', ukraine: 'ua', 'united-arab-emirates': 'ae',
  'united-kingdom': 'gb', 'united-states': 'us', uruguay: 'uy', uzbekistan: 'uz',
  vanuatu: 'vu', 'vatican-city': 'va', venezuela: 've', vietnam: 'vn', yemen: 'ye',
  zambia: 'zm', zimbabwe: 'zw',
  dubai: 'ae', bali: 'id', maldives: 'mv', usa: 'us',
};

// ISO 3166-1 alpha-2 to continent mapping
const ISO_TO_CONTINENT = {
  AF: 'asia', AL: 'europe', DZ: 'africa', AD: 'europe', AO: 'africa',
  AG: 'americas', AR: 'americas', AM: 'asia', AU: 'oceania', AT: 'europe',
  AZ: 'asia', BS: 'americas', BH: 'asia', BD: 'asia', BB: 'americas',
  BY: 'europe', BE: 'europe', BZ: 'americas', BJ: 'africa', BT: 'asia',
  BO: 'americas', BA: 'europe', BW: 'africa', BR: 'americas', BN: 'asia',
  BG: 'europe', BF: 'africa', BI: 'africa', KH: 'asia', CM: 'africa',
  CA: 'americas', CV: 'africa', CF: 'africa', TD: 'africa', CL: 'americas',
  CN: 'asia', CO: 'americas', KM: 'africa', CG: 'africa', CR: 'americas',
  CI: 'africa', HR: 'europe', CU: 'americas', CY: 'europe', CZ: 'europe',
  DK: 'europe', DJ: 'africa', DM: 'americas', DO: 'americas', EC: 'americas',
  EG: 'africa', SV: 'americas', GQ: 'africa', ER: 'africa', EE: 'europe',
  SZ: 'africa', ET: 'africa', FJ: 'oceania', FI: 'europe', FR: 'europe',
  GA: 'africa', GM: 'africa', GE: 'asia', DE: 'europe', GH: 'africa',
  GR: 'europe', GD: 'americas', GT: 'americas', GN: 'africa', GW: 'africa',
  GY: 'americas', HT: 'americas', HN: 'americas', HU: 'europe', IS: 'europe',
  IN: 'asia', ID: 'asia', IR: 'asia', IQ: 'asia', IE: 'europe', IL: 'asia',
  IT: 'europe', JM: 'americas', JP: 'asia', JO: 'asia', KZ: 'asia', KE: 'africa',
  KI: 'oceania', KW: 'asia', KG: 'asia', LA: 'asia', LV: 'europe', LB: 'asia',
  LS: 'africa', LR: 'africa', LY: 'africa', LI: 'europe', LT: 'europe',
  LU: 'europe', MG: 'africa', MW: 'africa', MY: 'asia', ML: 'africa',
  MT: 'europe', MH: 'oceania', MR: 'africa', MU: 'africa', MX: 'americas',
  FM: 'oceania', MD: 'europe', MC: 'europe', ME: 'europe', MA: 'africa',
  MZ: 'africa', MM: 'asia', NA: 'africa', NR: 'oceania', NP: 'asia',
  NL: 'europe', NZ: 'oceania', NI: 'americas', NE: 'africa', NG: 'africa',
  KP: 'asia', MK: 'europe', NO: 'europe', OM: 'asia', PK: 'asia', PW: 'oceania',
  PA: 'americas', PG: 'oceania', PY: 'americas', PE: 'americas', PH: 'asia',
  PL: 'europe', PT: 'europe', QA: 'asia', RO: 'europe', RU: 'europe',
  RW: 'africa', KN: 'americas', LC: 'americas', VC: 'americas', WS: 'oceania',
  SM: 'europe', ST: 'africa', SA: 'asia', SN: 'africa', RS: 'europe',
  SC: 'africa', SL: 'africa', SG: 'asia', SK: 'europe', SI: 'europe',
  SO: 'africa', ZA: 'africa', KR: 'asia', SS: 'africa', ES: 'europe',
  LK: 'asia', SD: 'africa', SR: 'americas', SE: 'europe', CH: 'europe',
  SY: 'asia', TW: 'asia', TJ: 'asia', TZ: 'africa', TH: 'asia', TL: 'asia',
  TG: 'africa', TO: 'oceania', TT: 'americas', TN: 'africa', TR: 'europe',
  TM: 'asia', TV: 'oceania', UG: 'africa', UA: 'europe', AE: 'asia',
  GB: 'europe', US: 'americas', UY: 'americas', UZ: 'asia', VU: 'oceania',
  VA: 'europe', VE: 'americas', VN: 'asia', YE: 'asia',   ZM: 'africa',
  ZW: 'africa', MN: 'asia', MV: 'asia',
};

async function main() {
  const apply = process.argv.includes('--apply');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = apply
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase URL and key required.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get all countries
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, slug, name_az, cca2, continent');

  if (error) {
    console.error('Error fetching countries:', error.message);
    process.exit(1);
  }

  const missingContinent = countries.filter(c => !c.continent);

  console.log(`Total countries: ${countries.length}`);
  console.log(`With continent: ${countries.filter(c => c.continent).length}`);
  console.log(`Missing continent: ${missingContinent.length}`);

  if (!apply) {
    console.log('\n--- DRY RUN ---\n');
  }

  let updatedCca2 = 0;
  let updatedContinent = 0;
  let skipped = 0;

  for (const country of missingContinent) {
    let cca2 = country.cca2;
    
    // If no cca2, try to get from slug mapping
    if (!cca2) {
      const mappedCca2 = SLUG_TO_ISO[country.slug];
      if (mappedCca2) {
        cca2 = mappedCca2.toUpperCase();
        if (apply) {
          const { error: cca2Error } = await supabase
            .from('countries')
            .update({ cca2: cca2.toLowerCase() })
            .eq('id', country.id);
          
          if (cca2Error) {
            console.error(`  [ERROR-CCA2] ${country.slug}: ${cca2Error.message}`);
          } else {
            console.log(`  [CCA2-ADDED] ${country.slug}: ${cca2.toLowerCase()}`);
            updatedCca2++;
          }
        } else {
          console.log(`  [DRY-CCA2] ${country.slug}: ${mappedCca2}`);
        }
      }
    }

    // Now determine continent
    if (cca2) {
      const continent = ISO_TO_CONTINENT[cca2.toUpperCase()];
      
      if (!continent) {
        console.log(`  [SKIP] ${country.slug}: no continent mapping for cca2=${cca2}`);
        skipped++;
        continue;
      }

      if (apply) {
        const { error: updateError } = await supabase
          .from('countries')
          .update({ continent })
          .eq('id', country.id);

        if (updateError) {
          console.error(`  [ERROR] ${country.slug}: ${updateError.message}`);
          skipped++;
        } else {
          console.log(`  [OK] ${country.slug}: ${continent}`);
          updatedContinent++;
        }
      } else {
        console.log(`  [DRY] ${country.slug}: ${continent}`);
        updatedContinent++;
      }
    } else {
      console.log(`  [NO-CCA2] ${country.slug}: ${country.name_az}`);
      skipped++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`  Cca2 added: ${updatedCca2}`);
  console.log(`  Continent updated: ${updatedContinent}`);
  console.log(`  Skipped: ${skipped}`);

  if (!apply && (updatedCca2 > 0 || updatedContinent > 0)) {
    console.log('\nRun with --apply to actually update the database.\n');
  }
}

main().catch(console.error);
