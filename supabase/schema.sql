-- =========================================================
--  Comité des Fêtes de Limetz-Villez — schéma Supabase
--  À exécuter dans Supabase > SQL Editor
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- Utilitaire : updated_at ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Rôles admin ----------
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nom text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.id = auth.uid());
$$;

-- ---------- Réglages du site (clé/valeur JSON, une seule ligne) ----------
create table if not exists public.site_settings (
  id int primary key default 1,
  hero_kicker text not null default 'Saison 2026 · Limetz-Villez',
  hero_titre_1 text not null default 'Toute',
  hero_titre_accent text not null default 'l''année',
  hero_titre_2 text not null default 'on fait la fête',
  hero_texte text not null default 'Brocante, musique, battages, marché de Noël.',
  hero_couleur text not null default '#FF3D7F',
  logo_url text,
  email_contact text not null default 'comitedesfetes.limetzvillez@gmail.com',
  facebook_url text,
  adresse text not null default 'Mairie de Limetz-Villez, 78270',
  asso_titre text not null default 'L''association',
  asso_texte text not null default '',
  benevoles_titre text not null default 'Rejoignez le comité',
  benevoles_texte text not null default '',
  updated_at timestamptz not null default now(),
  constraint one_row check (id = 1)
);
insert into public.site_settings (id) values (1) on conflict do nothing;
create trigger trg_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------- Chiffres clés de l'association ----------
create table if not exists public.stats (
  id uuid primary key default gen_random_uuid(),
  valeur text not null,
  libelle text not null,
  position int not null default 0
);

-- ---------- Événements ----------
create table if not exists public.evenements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titre text not null,
  sous_titre text,
  chapo text,
  description text,
  couleur text not null default '#FF3D7F',
  couleur_sombre text not null default '#C42A5F',
  date_debut date not null,
  heure_debut text,
  heure_fin text,
  lieu text,
  adresse text,
  tarif text not null default 'Entrée libre',
  saison text not null default 'ete',      -- printemps | ete | automne | hiver
  image_url text,
  publie boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_evt_touch before update on public.evenements
  for each row execute function public.touch_updated_at();
create index if not exists idx_evt_publie on public.evenements(publie, date_debut);

-- ---------- Créneaux du programme d'un événement ----------
create table if not exists public.creneaux (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid not null references public.evenements(id) on delete cascade,
  heure text not null,
  titre text not null,
  description text,
  scene text,
  position int not null default 0
);
create index if not exists idx_creneaux_evt on public.creneaux(evenement_id, position);

-- ---------- Blocs d'infos pratiques ----------
create table if not exists public.infos (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid not null references public.evenements(id) on delete cascade,
  titre text not null,
  lignes text[] not null default '{}',
  position int not null default 0
);

-- ---------- FAQ ----------
create table if not exists public.faq (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid references public.evenements(id) on delete cascade,
  question text not null,
  reponse text not null,
  position int not null default 0
);

-- ---------- Demandes reçues via les formulaires ----------
create table if not exists public.demandes (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid references public.evenements(id) on delete set null,
  nom text not null,
  email text not null,
  telephone text,
  type text not null,          -- stand | scene | benevole | autre
  message text,
  statut text not null default 'nouveau',  -- nouveau | traite | refuse
  created_at timestamptz not null default now()
);
create index if not exists idx_demandes_statut on public.demandes(statut, created_at desc);

-- =========================================================
--  RLS
-- =========================================================
alter table public.admins        enable row level security;
alter table public.site_settings enable row level security;
alter table public.stats         enable row level security;
alter table public.evenements    enable row level security;
alter table public.creneaux      enable row level security;
alter table public.infos         enable row level security;
alter table public.faq           enable row level security;
alter table public.demandes      enable row level security;

-- Lecture publique du contenu du site
create policy "public lit settings" on public.site_settings for select using (true);
create policy "public lit stats"    on public.stats         for select using (true);
create policy "public lit evts"     on public.evenements    for select using (publie = true or public.is_admin());
create policy "public lit creneaux" on public.creneaux      for select using (true);
create policy "public lit infos"    on public.infos         for select using (true);
create policy "public lit faq"      on public.faq           for select using (true);

-- Écriture réservée aux admins
create policy "admin ecrit settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin ecrit stats"    on public.stats         for all using (public.is_admin()) with check (public.is_admin());
create policy "admin ecrit evts"     on public.evenements    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin ecrit creneaux" on public.creneaux      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin ecrit infos"    on public.infos         for all using (public.is_admin()) with check (public.is_admin());
create policy "admin ecrit faq"      on public.faq           for all using (public.is_admin()) with check (public.is_admin());

-- Demandes : tout le monde peut envoyer, seuls les admins lisent
create policy "public envoie demande" on public.demandes for insert with check (true);
create policy "admin lit demandes"    on public.demandes for select using (public.is_admin());
create policy "admin modifie demandes" on public.demandes for update using (public.is_admin()) with check (public.is_admin());
create policy "admin supprime demandes" on public.demandes for delete using (public.is_admin());

create policy "admin lit admins" on public.admins for select using (public.is_admin());

-- =========================================================
--  Storage : bucket public pour les images
-- =========================================================
insert into storage.buckets (id, name, public)
values ('medias', 'medias', true) on conflict do nothing;

create policy "public lit medias" on storage.objects
  for select using (bucket_id = 'medias');
create policy "admin ecrit medias" on storage.objects
  for insert with check (bucket_id = 'medias' and public.is_admin());
create policy "admin supprime medias" on storage.objects
  for delete using (bucket_id = 'medias' and public.is_admin());
