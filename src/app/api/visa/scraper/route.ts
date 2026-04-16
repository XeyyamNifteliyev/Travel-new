import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const VISA_SOURCES: Record<string, { urls: string[]; embassy_az?: string }> = {
  turkey: { urls: ['https://baku.be.mfa.gov.tr'], embassy_az: 'https://baku.be.mfa.gov.tr/vize' },
  georgia: { urls: ['https://mfa.gov.ge'], embassy_az: 'https://mfa.gov.ge/Main/Consular' },
  dubai: { urls: ['https://www.emirates.com/az/azerbaijani/help/visa-passport-information/'] },
  russia: { urls: ['https://baku.mid.ru'], embassy_az: 'https://baku.mid.ru/viza' },
  japan: { urls: ['https://www.az.emb-japan.go.jp'] },
  italy: { urls: ['https://ambbaku.esteri.it'], embassy_az: 'https://visa.vfsglobal.com/aze/az/ita' },
  france: { urls: ['https://az.ambafrance.org'], embassy_az: 'https://visa.vfsglobal.com/aze/az/fra' },
  spain: { urls: ['https://www.exteriores.gob.es/Embajadas/baku'], embassy_az: 'https://blsspain-azerbaijan.com' },
  germany: { urls: ['https://baku.diplo.de'], embassy_az: 'https://baku.diplo.de/az-az/visum' },
  uk: { urls: ['https://www.gov.uk/standard-visitor'] },
  iran: { urls: ['https://baku.mfa.ir'] },
  thailand: { urls: ['https://thaiembassy.com/azerbaijan'] },
  usa: { urls: ['https://az.usembassy.gov/visas/'] },
  china: { urls: ['https://az.china-embassy.gov.cn'] },
  south_korea: { urls: ['https://overseas.mofa.go.kr/az-ko/index.do'] },
  india: { urls: ['https://www.indianembassy.gov.az'] },
  egypt: { urls: ['https://www.egyptian-embassy.com.az'] },
  greece: { urls: ['https://www.mfa.gr/en/missionsabroad/embassy-in-baku'] },
  netherlands: { urls: ['https://www.netherlandsandyou.nl/countries/azerbaijan'] },
  sweden: { urls: ['https://www.swedenabroad.se/en/embassies/azerbaijan-baku'] },
  norway: { urls: ['https://www.norway.no/en/azerbaijan'] },
  czech: { urls: ['https://www.mzv.cz/baku/en/index.html'] },
  poland: { urls: ['https://www.gov.pl/web/azerbaijan-en'] },
  hungary: { urls: ['https://baku.mfa.gov.hu'] },
  croatia: { urls: ['https://crovisa.mvep.hr'] },
  portugal: { urls: ['https://www.vistos.mne.pt'] },
  switzerland: { urls: ['https://www.eda.admin.ch/baku'] },
  brazil: { urls: ['https://www.gov.br/mre/pt-br/embaixada-bacu'] },
  canada: { urls: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html'] },
  australia: { urls: ['https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing'] },
  malaysia: { urls: ['https://www.kln.gov.my/web/aze_baku'] },
  singapore: { urls: ['https://www.mfa.gov.sg/overseas-mission/baku'] },
  indonesia: { urls: ['https://kemlu.go.id/baku'] },
  uzbekistan: { urls: ['https://mfa.uz/en'] },
  kazakhstan: { urls: ['https://www.gov.kz/memleket/entities/mfa-kz'] },
  belarus: { urls: ['https://belarus.by/travel/visas'] },
  armenia: { urls: ['https://www.mfa.am/en/visa'] },
  serbia: { urls: ['https://www.mfa.gov.rs'] },
  bulgaria: { urls: ['https://www.mfa.bg/embassies/azerbaijan'] },
  romania: { urls: ['https://baku.mae.ro'] },
  belgium: { urls: ['https://azerbaijan.diplomatie.belgium.be'] },
  austria: { urls: ['https://www.bmeia.gv.at/en/embassy/baku'] },
  denmark: { urls: ['https://denmark.dk/travel-and-residence'] },
  finland: { urls: ['https://finlandabroad.fi/web/aze/visiting-finland'] },
  ireland: { urls: ['https://www.dfa.ie/irish-embassy/azerbaijan/'] },
  iceland: { urls: ['https://www.government.is/embassy/reykjavik/'] },
  israel: { urls: ['https://embassies.gov.il/baku'] },
  saudi_arabia: { urls: ['https://www.mofa.gov.sa'] },
  qatar: { urls: ['https://portal.www.gov.qa'] },
  kuwait: { urls: ['https://www.mofa.gov.kw'] },
  bahrain: { urls: ['https://www.mofa.bh'] },
  oman: { urls: ['https://www.mofa.gov.om'] },
  morocco: { urls: ['https://www.maroc.ma/en'] },
  tunisia: { urls: ['https://www.diplomatie.tn'] },
  cuba: { urls: ['https://www.cubaminrex.cu'] },
  mexico: { urls: ['https://www.gob.mx/sre'] },
  argentina: { urls: ['https://www.cancilleria.gob.ar'] },
  colombia: { urls: ['https://www.cancilleria.gov.co'] },
  peru: { urls: ['https://www.gob.pe/rree'] },
  chile: { urls: ['https://www.minrel.gob.cl'] },
  south_africa: { urls: ['https://www.dha.gov.za'] },
  kenya: { urls: ['https://www.mfa.go.ke'] },
  tanzania: { urls: ['https://www.tanzania.go.tz'] },
  ethiopia: { urls: ['https://www.mfa.gov.et'] },
  nigeria: { urls: ['https://www.foreignaffairs.gov.ng'] },
  vietnam: { urls: ['https://xoayokhoaxahoi.gov.vn'] },
  philippines: { urls: ['https://www.dfa.gov.ph'] },
  cambodia: { urls: ['https://www.mfaic.gov.kh'] },
  myanmar: { urls: ['https://www.mofa.gov.mm'] },
  nepal: { urls: ['https://mofa.gov.np'] },
  sri_lanka: { urls: ['https://www.mfa.gov.lk'] },
  bangladesh: { urls: ['https://mofa.gov.bd'] },
  pakistan: { urls: ['https://mofa.gov.pk'] },
  afghanistan: { urls: ['https://mfa.gov.af'] },
  iraq: { urls: ['https://www.mofa.gov.iq'] },
  jordan: { urls: ['https://www.mfa.gov.jo'] },
  lebanon: { urls: ['https://www.mfa.gov.lb'] },
  syria: { urls: ['https://www.mfa.gov.sy'] },
  georgia_country: { urls: ['https://mfa.gov.ge'] },
  moldova: { urls: ['https://www.mfa.md'] },
  ukraine: { urls: ['https://mfa.gov.ua'] },
  lithuania: { urls: ['https://www.urm.lt'] },
  latvia: { urls: ['https://www.mfa.gov.lv'] },
  estonia: { urls: ['https://www.vm.ee'] },
  slovakia: { urls: ['https://www.mzv.sk'] },
  slovenia: { urls: ['https://www.gov.si/drzavni-organi/ministrstva/ministrstvo-za-zunanje-zadeve'] },
  malta: { urls: ['https://foreignaffairs.gov.mt'] },
  cyprus: { urls: ['https://www.mfa.gov.cy'] },
  luxembourg: { urls: ['https://maee.gouvernement.lu'] },
  monaco: { urls: ['https://www.gouv.mc'] },
  vatican: { urls: ['https://www.vatican.va'] },
  san_marino: { urls: ['https://www.esteri.sm'] },
  montenegro: { urls: ['https://www.mfa.gov.me'] },
  north_macedonia: { urls: ['https://www.mfa.gov.mk'] },
  albania: { urls: ['https://www.punetejashtme.gov.al'] },
  bosnia: { urls: ['https://www.mfa.ba'] },
  iceland_2: { urls: ['https://www.government.is'] },
  new_zealand: { urls: ['https://www.immigration.govt.nz'] },
  papua_new_guinea: { urls: ['https://www.mfa.gov.pg'] },
  mongolia: { urls: ['https://www.mfa.gov.mn'] },
};

const BATCH_SIZE = 25;

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const batchParam = searchParams.get('batch');
  const batch = batchParam ? parseInt(batchParam, 10) : 1;

  const supabase = await createClient();
  const allEntries = Object.entries(VISA_SOURCES);
  const totalBatches = Math.ceil(allEntries.length / BATCH_SIZE);

  const startIdx = (batch - 1) * BATCH_SIZE;
  const endIdx = Math.min(startIdx + BATCH_SIZE, allEntries.length);
  const batchEntries = allEntries.slice(startIdx, endIdx);

  const results: Record<string, string> = {};
  const promises = batchEntries.map(([slug, sources]) => scrapeCountry(supabase, slug, sources));
  const settled = await Promise.allSettled(promises);

  settled.forEach((result, i) => {
    const slug = batchEntries[i][0];
    results[slug] = result.status === 'fulfilled' ? result.value : `error: ${result.reason}`;
  });

  return NextResponse.json({
    success: true,
    batch,
    totalBatches,
    countriesInBatch: batchEntries.length,
    totalCountries: allEntries.length,
    results,
  });
}

async function scrapeCountry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  sources: { urls: string[]; embassy_az?: string }
): Promise<string> {
  const start = Date.now();
  const url = sources.embassy_az || sources.urls[0];

  try {
    const { data: country } = await supabase
      .from('countries')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!country) return 'no_country';

    const response = await fetch(url, {
      headers: { 'User-Agent': 'TravelAZ-Bot/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      await supabase.from('scraper_logs').insert({
        country_id: country.id,
        source_url: url,
        status: 'failed',
        error_message: `HTTP ${response.status}`,
        duration_ms: Date.now() - start,
      });
      return `http_${response.status}`;
    }

    const html = await response.text();
    const changes: Record<string, unknown> = {};

    const feeMatches = html.match(/(\d+)\s*(EUR|USD|AZN|€|\$)/gi);
    const daysMatches = html.match(/(\d+)\s*(gün|day|рабочих|working)/gi);
    const visaFreeMatch = html.match(/visa[- ]?free|vizasız|без визы/gi);
    const evisaMatch = html.match(/e[- ]?visa|e-viza|электронн.{0,5}виз/gi);

    if (feeMatches) changes.fees = feeMatches;
    if (daysMatches) changes.days = daysMatches;
    if (visaFreeMatch) changes.visa_free_mentioned = true;
    if (evisaMatch) changes.evisa_mentioned = true;

    const hasRelevantChanges = Object.keys(changes).length > 0;
    const significantChange = feeMatches && feeMatches.length > 0;

    if (significantChange) {
      const { data: currentVisa } = await supabase
        .from('visa_info')
        .select('fee_usd')
        .eq('country_id', country.id)
        .single();

      if (currentVisa) {
        await supabase.from('visa_updates').insert({
          country_id: country.id,
          field_changed: 'fee',
          old_value: `$${currentVisa.fee_usd}`,
          new_value: JSON.stringify(feeMatches),
          change_summary_az: `${slug} ölkəsində viza haqqı dəyişikliyi aşkarlandı`,
          change_severity: 'warning',
          source_url: url,
        });
      }

      const { data: countryData } = await supabase
        .from('countries')
        .select('name_az')
        .eq('id', country.id)
        .single();

      if (countryData) {
        await supabase.from('news').insert({
          title_az: `${countryData.name_az} viza haqqında dəyişiklik`,
          title_en: `Visa fee change in ${countryData.name_az}`,
          title_ru: `Изменение визового сбора в ${countryData.name_az}`,
          content_az: `${countryData.name_az} ölkəsinin rəsmi saytında viza haqqı ilə bağlı dəyişiklik aşkarlandı. Zəhmət olmasa rəsmi mənbədən yoxlayın: ${url}`,
          content_en: `A change in visa fee was detected on ${countryData.name_az}'s official website. Please verify: ${url}`,
          content_ru: `Обнаружено изменение визового сбора на официальном сайте ${countryData.name_az}. Проверьте: ${url}`,
          category: 'visa_change',
          is_published: true,
        });
      }
    }

    await supabase.from('scraper_logs').insert({
      country_id: country.id,
      source_url: url,
      status: hasRelevantChanges ? 'changed' : 'no_change',
      changes_detected: hasRelevantChanges ? changes : null,
      duration_ms: Date.now() - start,
    });

    await supabase
      .from('visa_info')
      .update({ last_verified_at: new Date().toISOString() })
      .eq('country_id', country.id);

    return hasRelevantChanges ? 'changed' : 'no_change';
  } catch (err) {
    const { data: country } = await supabase
      .from('countries')
      .select('id')
      .eq('slug', slug)
      .single();

    if (country) {
      await supabase.from('scraper_logs').insert({
        country_id: country.id,
        source_url: url,
        status: 'failed',
        error_message: String(err),
        duration_ms: Date.now() - start,
      });
    }
    return 'error';
  }
}
