-- Faza 2.5: Profil Dashboard - sosial media sütunları
alter table profiles add column if not exists instagram text;
alter table profiles add column if not exists youtube text;
alter table profiles add column if not exists tiktok text;
alter table profiles add column if not exists facebook text;
