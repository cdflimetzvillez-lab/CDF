'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/supabase/server';
import { creerCheckout, lireCheckout, genererReference } from '@/lib/sumup';

export type EtatResa = { erreur?: string } | null;

/* =========================================================
   PUBLIC — créer une réservation et partir en paiement
   ========================================================= */
export async function reserver(_prev: EtatResa, fd: FormData): Promise<EtatResa> {
  const evenementId = String(fd.get('evenement_id') ?? '');
  const nom         = String(fd.get('nom') ?? '').trim();
  const email       = String(fd.get('email') ?? '').trim().toLowerCase();
  const telephone   = String(fd.get('telephone') ?? '').trim();
  const commentaire = String(fd.get('commentaire') ?? '').trim();
  const places      = Number(fd.get('places') ?? 1);

  if (!nom || nom.length < 2) return { erreur: 'Merci d\u2019indiquer votre nom.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erreur: 'Adresse email invalide.' };
  if (!Number.isInteger(places) || places < 1) return { erreur: 'Nombre de places invalide.' };

  const db = createAdminClient();

  const { data: evt } = await db
    .from('evenements')
    .select('id, titre, slug, prix_centimes, places_max, places_par_reservation, billetterie_active, cloture_reservations')
    .eq('id', evenementId)
    .maybeSingle();

  if (!evt || !evt.billetterie_active) return { erreur: 'La billetterie est fermée pour cet événement.' };
  if (places > evt.places_par_reservation)
    return { erreur: `Maximum ${evt.places_par_reservation} places par réservation.` };

  if (evt.cloture_reservations && new Date(evt.cloture_reservations) < new Date())
    return { erreur: 'Les réservations sont closes pour cet événement.' };

  // Jauge
  if (evt.places_max !== null) {
    const { data: restantes } = await db.rpc('places_restantes', { evt_id: evt.id });
    if (typeof restantes === 'number' && restantes < places) {
      return {
        erreur: restantes === 0
          ? 'Complet — il ne reste plus de place.'
          : `Il ne reste que ${restantes} place${restantes > 1 ? 's' : ''}.`,
      };
    }
  }

  const montant = evt.prix_centimes * places;
  const reference = genererReference();

  // 1. Réservation en attente
  const { data: resa, error: errResa } = await db
    .from('reservations')
    .insert({
      evenement_id: evt.id,
      nom, email,
      telephone: telephone || null,
      commentaire: commentaire || null,
      places,
      montant_centimes: montant,
      reference,
      statut: 'en_attente',
    })
    .select('id')
    .single();

  if (errResa || !resa) {
    console.error('[reserver] insert', errResa);
    return { erreur: 'Impossible de créer la réservation. Réessayez dans un instant.' };
  }

  // 2. Checkout SumUp
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  let urlPaiement: string | undefined;

  try {
    const checkout = await creerCheckout({
      reference,
      montantCentimes: montant,
      description: `${evt.titre} — ${places} place${places > 1 ? 's' : ''}`,
      emailClient: email,
      urlRetour: `${base}/evenements/${evt.slug}/reservation?ref=${reference}`,
    });

    await db.from('reservations')
      .update({ checkout_id: checkout.id })
      .eq('id', resa.id);

    urlPaiement = checkout.hosted_checkout_url;
  } catch (e) {
    console.error('[reserver] SumUp', e);
    await db.from('reservations')
      .update({ statut: 'echouee' })
      .eq('id', resa.id);
    return { erreur: 'Le service de paiement est indisponible. Réessayez plus tard.' };
  }

  if (!urlPaiement) return { erreur: 'Le paiement n\u2019a pas pu être initialisé.' };

  redirect(urlPaiement);
}

/* =========================================================
   Vérification au retour de paiement
   ========================================================= */
export async function verifierPaiement(reference: string) {
  const db = createAdminClient();

  const { data: resa } = await db
    .from('reservations')
    .select('*, evenements(titre, slug, date_debut, lieu, heure_debut)')
    .eq('reference', reference)
    .maybeSingle();

  if (!resa) return null;
  if (resa.statut === 'payee' || !resa.checkout_id) return resa;

  try {
    const checkout = await lireCheckout(resa.checkout_id);

    const correspondance: Record<string, string> = {
      PAID: 'payee', FAILED: 'echouee', EXPIRED: 'expiree', PENDING: 'en_attente',
    };
    const nouveau = correspondance[checkout.status] ?? 'en_attente';

    if (nouveau !== resa.statut) {
      const { data: maj } = await db
        .from('reservations')
        .update({
          statut: nouveau,
          transaction_code: checkout.transaction_code
            ?? checkout.transactions?.[0]?.transaction_code
            ?? null,
          paye_le: nouveau === 'payee' ? new Date().toISOString() : null,
        })
        .eq('id', resa.id)
        .select('*, evenements(titre, slug, date_debut, lieu, heure_debut)')
        .single();

      if (nouveau === 'payee') await envoyerBillet(maj);
      return maj ?? resa;
    }
  } catch (e) {
    console.error('[verifierPaiement]', e);
  }

  return resa;
}

/* =========================================================
   Email de confirmation (optionnel — nécessite RESEND_API_KEY)
   ========================================================= */
export async function envoyerBillet(resa: any) {
  if (!process.env.RESEND_API_KEY || !resa) return;

  const evt = resa.evenements;
  const from = process.env.RESEND_FROM_EMAIL
    ?? 'Comité des Fêtes <noreply@comitedesfetes-limetzvillez.fr>';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [resa.email],
        bcc: process.env.CONTACT_EMAIL ? [process.env.CONTACT_EMAIL] : undefined,
        subject: `Votre réservation — ${evt?.titre ?? 'Comité des Fêtes'}`,
        text:
`Bonjour ${resa.nom},

Votre réservation est confirmée.

  Événement : ${evt?.titre}
  Places    : ${resa.places}
  Montant   : ${(resa.montant_centimes / 100).toFixed(2)} €
  Code billet : ${resa.code_billet}

Présentez ce code à l'entrée.

Référence de paiement : ${resa.reference}

À bientôt,
Le Comité des Fêtes de Limetz-Villez`,
      }),
    });
  } catch (e) {
    console.error('[envoyerBillet]', e);
  }
}

/* =========================================================
   ADMIN
   ========================================================= */
export async function marquerScanne(id: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  await supabase.from('reservations')
    .update({ scanne_le: new Date().toISOString() })
    .eq('id', id);
  revalidatePath('/admin/reservations');
}

export async function changerStatutResa(id: string, statut: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  await supabase.from('reservations').update({ statut }).eq('id', id);
  revalidatePath('/admin/reservations');
}

export async function supprimerReservation(id: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return;
  await supabase.from('reservations').delete().eq('id', id);
  revalidatePath('/admin/reservations');
}
