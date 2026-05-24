#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const OFFICIAL_VISA_LINKS = {
  turkey: 'https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa',
  dubai: 'https://u.ae/en/information-and-services/visa-and-emirates-id/visit-visas',
  georgia: 'https://www.geoconsul.gov.ge/en/entering-georgia',
  france: 'https://france-visas.gouv.fr/en/azerbaidjan',
  italy: 'https://ambbaku.esteri.it/it/servizi-consolari-e-visti/servizi-per-il-cittadino-straniero/visti/',
  germany: 'https://baku.diplo.de/az-de/konsularservice/05-visaeinreise/2009392-2009392',
  spain: 'https://azerbaijan.blsspainvisa.com/',
  uk: 'https://www.gov.uk/check-uk-visa',
  'united-states': 'https://ais.usvisa-info.com/en-az/niv',
  canada: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/apply-visitor-visa.html',
  qatar: 'https://hayya.qa/en',
  'saudi-arabia': 'https://www.visitsaudi.com/en/about-e-visa',
  albania: 'https://e-visa.al/',
  argentina: 'https://cancilleria.gob.ar/en/services/visas/tourist-visa',
  australia: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder',
  austria: 'https://www.bmeia.gv.at/en/austrian-embassy-baku/travelling-to-austria/visa',
  azerbaijan: 'https://evisa.gov.az/en/',
  brazil: 'https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos',
  china: 'https://bio.visaforchina.cn/BAK3_EN/',
  egypt: 'https://www.visa2egypt.gov.eg/',
  greece: 'https://www.mfa.gr/en/visas/',
  hungary: 'https://baku.mfa.gov.hu/eng/page/visa-information',
  india: 'https://indianvisaonline.gov.in/evisa/tvoa.html',
  indonesia: 'https://evisa.imigrasi.go.id/',
  iran: 'https://evisa.mfa.ir/en/',
  japan: 'https://www.az.emb-japan.go.jp/itpr_en/visa.html',
  malaysia: 'https://malaysiavisa.imi.gov.my/evisa/evisa.jsp',
  maldives: 'https://immigration.gov.mv/tourist-visa/',
  mexico: 'https://www.gob.mx/tramites/ficha/visa-de-visitante-sin-permiso-para-realizar-actividades-remuneradas/SRE232',
  morocco: 'https://www.acces-maroc.ma/',
  netherlands: 'https://www.netherlandsworldwide.nl/visa-the-netherlands',
  'new-zealand': 'https://www.immigration.govt.nz/new-zealand-visas',
  poland: 'https://www.gov.pl/web/azerbaijan/visas',
  russia: 'https://evisa.kdmid.ru/',
  singapore: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements',
  'south-korea': 'https://www.visa.go.kr/',
  switzerland: 'https://www.eda.admin.ch/countries/azerbaijan/en/home/visa.html',
  thailand: 'https://www.thaievisa.go.th/',
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  return {
    apply: args.has('--apply'),
  };
}

async function main() {
  const { apply } = parseArgs();
  loadEnvFile(path.join(__dirname, '..', '.env.local'));
  const supabase = createSupabaseClient();

  const slugs = Object.keys(OFFICIAL_VISA_LINKS);
  const { data: countries, error: countriesError } = await supabase
    .from('countries')
    .select('id, slug, name_az')
    .in('slug', slugs);

  if (countriesError) throw countriesError;

  const countriesBySlug = new Map((countries || []).map((country) => [country.slug, country]));
  const now = new Date().toISOString();
  let updated = 0;

  for (const [slug, officialVisaUrl] of Object.entries(OFFICIAL_VISA_LINKS)) {
    const country = countriesBySlug.get(slug);
    if (!country) {
      console.log(`[missing-country] ${slug}`);
      continue;
    }

    console.log(`${apply ? '[apply]' : '[dry-run]'} ${slug} -> ${officialVisaUrl}`);
    if (!apply) continue;

    const { error } = await supabase
      .from('visa_info')
      .update({
        official_visa_url: officialVisaUrl,
        official_visa_url_verified_at: now,
      })
      .eq('country_id', country.id);

    if (error) throw error;
    updated += 1;
  }

  console.log(apply ? `Updated ${updated} visa rows.` : 'Dry-run complete. Re-run with --apply to write.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
