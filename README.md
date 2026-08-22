# Billetterie — Comité des Fêtes de Limetz-Villez

Billetterie en ligne (façon festival) pour la vente de billets avec paiement Stripe.

## Stack

- Next.js 14 (App Router) / TypeScript / Tailwind
- Supabase (Postgres + RLS)
- Stripe Checkout (paiement)
- Resend (envoi des billets PDF par email)
- jsPDF + qrcode (génération des billets avec QR code)

## Mise en route

1. `npm install`
2. Créer un projet Supabase, exécuter `supabase/schema.sql` dans le SQL editor
3. Copier `.env.example` en `.env.local` et remplir :
   - Clés Supabase (URL, anon key, service role key)
   - Clé secrète Stripe + clé publiable
   - Clé API Resend + adresse d'expédition
4. Configurer le webhook Stripe (`checkout.session.completed`, `checkout.session.expired`)
   pointant vers `/api/webhooks/stripe`, et copier le secret de signature dans
   `STRIPE_WEBHOOK_SECRET`
5. `npm run dev`

## État actuel du scaffold

**Fait :**
- Schéma de données complet (events, ticket_types, seat_maps, seats, orders, tickets) avec RLS
- Page liste des événements publiés
- Page événement en mode "simple" (quantités par tarif) avec paiement Stripe Checkout
- Webhook Stripe : validation paiement → génération des billets + QR codes → envoi email PDF
- Lock temporaire des places (mode "seated") côté API checkout, avec libération automatique
  si le paiement expire

**À faire ensuite :**
- UI du plan de salle interactif (sélection de sièges) pour le mode "seated"
- Espace admin : création/édition d'événements et de tarifs, tableau de bord des ventes
  (idéalement en Supabase Realtime, sur le modèle du module messagerie WayPilot)
- Auth admin (comité des fêtes) — probablement Supabase Auth + rôle, à brancher sur le
  même modèle de rôles que WayPilot
- Scan des billets le jour J (lecture QR code, mise à jour `tickets.status`)
- Cron / edge function planifiée pour appeler `release_expired_seat_locks()` régulièrement
- Emails de rappel avant l'événement, gestion des remboursements/annulations

## Notes de design

Palette provisoire (cream / ink / clay / moss / gold) posée dans `tailwind.config.ts` —
à ajuster selon l'identité visuelle du comité des fêtes (logo, couleurs de la commune...).
