-- Correctifs sécurité du Challenge Cardio NRV (à appliquer avec le feu vert d'Ilam, AVANT le 30/11).

-- 1) Récupération d'accès : le lien ne s'affiche plus sur la page. Il part par email (fonction send-access-link).
alter table public.participants add column if not exists access_link_sent_at timestamptz;
revoke execute on function public.recover_access(text, text) from anon, authenticated, public;

-- 2) Saisie des km : uniquement les jours du défi, jamais un jour futur (heure de Paris), 0 à 100 km.
create or replace function public.log_km(p_token uuid, p_day date, p_km numeric)
returns void language plpgsql security definer set search_path to 'public' as $$
declare pid uuid;
begin
  select id into pid from participants where token = p_token;
  if pid is null then raise exception 'inconnue'; end if;
  if p_day < date '2026-11-30' or p_day > date '2026-12-06' then raise exception 'jour hors défi'; end if;
  if p_day > (now() at time zone 'Europe/Paris')::date then raise exception 'jour à venir'; end if;
  if p_km is null or p_km < 0 or p_km > 100 then raise exception 'km invalides'; end if;
  insert into km_logs(participant_id, day, km) values (pid, p_day, p_km)
  on conflict (participant_id, day) do update set km = excluded.km;
end $$;

-- 3) Classement : seulement les participantes qui ont au moins 1 km.
create or replace function public.leaderboard()
returns table(first_name text, total_km numeric) language sql security definer set search_path to 'public' as $$
  select p.first_name, sum(l.km)
  from participants p join km_logs l on l.participant_id = p.id
  group by p.id, p.first_name
  having sum(l.km) > 0
  order by 2 desc, 1 limit 100;
$$;
