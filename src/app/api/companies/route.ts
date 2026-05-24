import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getIpFromHeaders, rateLimitResponse } from '@/lib/rate-limit';

const COMPANY_FIELDS = 'id, user_id, company_name, logo_url, license_number, description, phone, whatsapp, telegram, email, website, plan_type, plan_expires_at, is_verified, rating, review_count, status, created_at, updated_at';
const VALID_STATUSES = new Set(['pending', 'active', 'suspended']);
const VALID_PLANS = new Set(['starter', 'pro', 'premium']);

function cleanString(value: unknown, maxLength: number, required = false) {
  if (value === undefined || value === null) return required ? null : undefined;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return required ? null : undefined;
  return trimmed;
}

function isValidUrl(value: string | null | undefined) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const offset = (page - 1) * limit;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query = supabase
      .from('tour_companies')
      .select(COMPANY_FIELDS, { count: 'exact' })
      .order('rating', { ascending: false });

    if (userId) query = query.eq('user_id', userId);
    if (status && VALID_STATUSES.has(status)) query = query.eq('status', status);

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Companies query error:', error);
      return NextResponse.json({ error: 'Server xətası' }, { status: 500 });
    }

    return NextResponse.json({ companies: data, page, limit, total: count || 0, totalPages: count ? Math.ceil(count / limit) : 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIpFromHeaders(request);
    const rl = await checkRateLimit(ip, 'company-create', 3, 3_600_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, ...rateLimitResponse(rl.remaining, rl.resetAt) }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingCompany = await supabase
      .from('tour_companies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingCompany.data) {
      return NextResponse.json(
        { error: 'You already have a company registered' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Yanlış sorğu formatı' }, { status: 400 });
    }

    const record = body as Record<string, unknown>;
    const companyName = cleanString(record.companyName, 160, true);
    const licenseNumber = cleanString(record.licenseNumber, 100);
    const description = cleanString(record.description, 2000);
    const phone = cleanString(record.phone, 50);
    const whatsapp = cleanString(record.whatsapp, 50);
    const telegram = cleanString(record.telegram, 80);
    const email = cleanString(record.email, 160);
    const website = cleanString(record.website, 500);
    const planType = typeof record.planType === 'string' && VALID_PLANS.has(record.planType) ? record.planType : 'starter';

    if (
      !companyName ||
      [licenseNumber, description, phone, whatsapp, telegram, email, website].some((value) => value === null) ||
      !isValidUrl(website)
    ) {
      return NextResponse.json({ error: 'Şirkət məlumatları yanlışdır' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tour_companies')
      .insert({
        user_id: user.id,
        company_name: companyName,
        license_number: licenseNumber,
        description,
        phone,
        whatsapp,
        telegram,
        email,
        website,
        plan_type: planType,
        status: 'pending',
      })
      .select(COMPANY_FIELDS)
      .single();

    if (error) {
      console.error('Company create error:', error);
      return NextResponse.json({ error: 'Server xətası' }, { status: 500 });
    }

    return NextResponse.json({ company: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getIpFromHeaders(request);
    const rl = await checkRateLimit(ip, 'company-update', 10, 3_600_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, ...rateLimitResponse(rl.remaining, rl.resetAt) }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Yanlış sorğu formatı' }, { status: 400 });
    }

    const record = body as Record<string, unknown>;
    const id = cleanString(record.id, 80, true);
    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const website = cleanString(record.website, 500);
    if (website === null || !isValidUrl(website)) {
      return NextResponse.json({ error: 'Şirkət məlumatları yanlışdır' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    const companyName = cleanString(record.companyName, 160);
    const description = cleanString(record.description, 2000);
    const phone = cleanString(record.phone, 50);
    const whatsapp = cleanString(record.whatsapp, 50);
    const telegram = cleanString(record.telegram, 80);
    const email = cleanString(record.email, 160);

    if ([companyName, description, phone, whatsapp, telegram, email].some((value) => value === null)) {
      return NextResponse.json({ error: 'Şirkət məlumatları yanlışdır' }, { status: 400 });
    }

    if (companyName !== undefined) updates.company_name = companyName;
    if (description !== undefined) updates.description = description;
    if (phone !== undefined) updates.phone = phone;
    if (whatsapp !== undefined) updates.whatsapp = whatsapp;
    if (telegram !== undefined) updates.telegram = telegram;
    if (email !== undefined) updates.email = email;
    if (website !== undefined) updates.website = website;

    const { data, error } = await supabase
      .from('tour_companies')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(COMPANY_FIELDS)
      .single();

    if (error) {
      console.error('Company update error:', error);
      return NextResponse.json({ error: 'Server xətası' }, { status: 500 });
    }

    return NextResponse.json({ company: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
