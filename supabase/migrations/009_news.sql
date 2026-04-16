-- Xəbərlər cədvəli
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_az TEXT NOT NULL,
  title_en TEXT,
  title_ru TEXT,
  content_az TEXT NOT NULL,
  content_en TEXT,
  content_ru TEXT,
  category TEXT DEFAULT 'general',
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published news is viewable" ON news FOR SELECT USING (is_published = true OR author_id = auth.uid());
CREATE POLICY "Users can create news" ON news FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own news" ON news FOR UPDATE USING (auth.uid() = author_id);

-- Seed xəbərlər
INSERT INTO news (title_az, title_en, title_ru, content_az, content_en, content_ru, category, is_published)
VALUES
  ('Yaponiya viza prosesi asanlaşdırıldı', 'Japan visa process simplified', 'Процесс получения визы в Японию упрощен', '2026-cı ilin aprel ayından etibarən Azərbaycan vətəndaşları üçün Yaponiya vizası ərizə prosesi onlayn platforma vasitəsilə həyata keçirilə bilər. Yeni sistemə əsasən, sənəd təqdimatı və randevu prosedurları sadələşdirilib.', 'From April 2026, Azerbaijani citizens can apply for Japan visa through an online platform. Document submission and appointment procedures have been simplified.', 'С апреля 2026 года граждане Азербайджана могут подавать заявку на визу в Японию через онлайн-платформу.', 'visa_change', true),

  ('Türkiyəyə vizasız səfər müddəti uzadıldı', 'Visa-free travel to Turkey extended', 'Безвизовый период в Турцию продлён', 'Azərbaycan vətəndaşları üçün Türkiyəyə vizasız səfər müddəti 90 gündən 180 günə qədər uzadılıb. Yeni qayda 2026-cı ilin may ayından qüvvəyə minəcək.', 'Visa-free travel period for Azerbaijani citizens to Turkey has been extended from 90 to 180 days. The new rule takes effect from May 2026.', 'Безвизовый период в Турцию продлён до 180 дней.', 'visa_change', true),

  ('Dubai yeni turizm proqramı başladı', 'Dubai launches new tourism program', 'Дубай запустил новую туристическую программу', 'Dubai əmirliyi yeni turizm proqramı çərçivəsində Azərbaycan vətəndaşlarına xüsusi endirimlər və eksklüziv təkliflər təqdim edir. Proqram otel, restoran və əyləncə məkanlarını əhatə edir.', 'Dubai offers special discounts and exclusive deals for Azerbaijani citizens under a new tourism program covering hotels, restaurants and entertainment.', 'Дубай предлагает спецпредложения для граждан Азербайджана.', 'general', true);
