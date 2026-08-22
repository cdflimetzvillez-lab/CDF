-- Jeu de données initial — à lancer après schema.sql

update public.site_settings set
  hero_texte = 'Brocante, fête de la musique, battages, marché de Noël. Quatre rendez-vous montés par les habitants du village, pour les habitants du village.',
  asso_texte = 'Le Comité des Fêtes de Limetz-Villez est une association loi 1901 animée par des habitants bénévoles. On monte les chapiteaux, on tient la buvette, on range les tables tard le soir. Et on recommence la saison suivante.',
  benevoles_texte = 'Une soirée, un week-end ou toute la saison : chaque coup de main compte pour faire tourner les fêtes du village.'
where id = 1;

insert into public.stats (valeur, libelle, position) values
  ('4', 'Événements par an', 1),
  ('60+', 'Bénévoles actifs', 2),
  ('1962', 'Année de création', 3)
on conflict do nothing;

insert into public.evenements
  (slug, titre, sous_titre, chapo, couleur, couleur_sombre, date_debut, heure_debut, heure_fin, lieu, tarif, saison, publie, position)
values
  ('brocante-vide-greniers','Brocante & vide-greniers',null,
   'Place du village dès 7h. Exposants sur réservation, buvette et restauration sur place.',
   '#9BD44F','#5E8F27','2026-04-12','7h','18h','Place du village','Entrée libre','printemps',true,1),
  ('fete-de-la-musique','Fête de la musique',null,
   'Trois scènes, un marché nocturne et un bal sous le lavoir. Une soirée entière au bord de l''Epte.',
   '#FF3D7F','#C42A5F','2026-06-14','18h','minuit','Place de l''Église','Entrée libre','ete',true,2),
  ('fete-des-battages','Fête des battages',null,
   'Machines agricoles anciennes en démonstration, animations et repas champêtre sous chapiteau.',
   '#00C2D1','#00808A','2026-10-04','10h','19h','Prairie communale','Repas 8 €','automne',true,3),
  ('marche-de-noel','Marché de Noël',null,
   'Chalets d''artisans, chorale du village, vin chaud et illuminations place de l''église.',
   '#5B2A86','#3D1B5C','2026-12-13','15h','21h','Place de l''Église','Entrée libre','hiver',true,4)
on conflict (slug) do nothing;

-- Programme de la fête de la musique
insert into public.creneaux (evenement_id, heure, titre, description, scene, position)
select id, x.heure, x.titre, x.descr, x.scene, x.pos
from public.evenements e,
lateral (values
  ('18h00','Ouverture du marché nocturne','Une vingtaine d''artisans et producteurs du canton, food-trucks et buvette du comité.','Place de l''Église',1),
  ('19h30','Les Berges','Quatuor folk de Vernon. Reprises et compositions.','Scène du lavoir',2),
  ('21h00','Kanto Trio','Jazz manouche.','Scène du lavoir',3),
  ('22h30','Bal populaire','DJ set du comité, du musette aux tubes de l''été.','Parvis de la mairie',4),
  ('00h00','Fin de la soirée','Démontage dès 00h15, les bras sont bienvenus.',null,5)
) as x(heure,titre,descr,scene,pos)
where e.slug = 'fete-de-la-musique';

insert into public.infos (evenement_id, titre, lignes, position)
select id, x.titre, x.lignes, x.pos
from public.evenements e,
lateral (values
  ('Accès & parking', array['Place de l''Église, 78270 Limetz-Villez','Parking gratuit rue de la Mairie','Place fermée à la circulation dès 16h','Gare de Bonnières à 8 km'], 1),
  ('Sur place', array['Buvette et restauration jusqu''à 23h','Toilettes derrière la salle des fêtes','Espace assis et tables couvertes','Éthylotests gratuits à la buvette'], 2),
  ('Bon à savoir', array['Événement gratuit, sans réservation','Animation enfants jusqu''à 21h','Chiens tenus en laisse','Replié en salle si orage'], 3)
) as x(titre,lignes,pos)
where e.slug = 'fete-de-la-musique';

insert into public.faq (evenement_id, question, reponse, position)
select id, x.q, x.r, x.pos
from public.evenements e,
lateral (values
  ('Faut-il réserver ?','Non. L''entrée est libre et sans inscription. Seuls les exposants du marché nocturne doivent se déclarer à l''avance.',1),
  ('Et s''il pleut ?','La soirée est maintenue en cas de pluie légère. En cas d''orage annoncé, tout est replié dans la salle des fêtes.',2),
  ('Peut-on venir avec des enfants ?','Oui. Une animation est prévue jusqu''à 21h et la place est fermée à la circulation.',3)
) as x(q,r,pos)
where e.slug = 'fete-de-la-musique';
