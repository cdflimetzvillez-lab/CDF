/**
 * Client SumUp — API Checkouts (Hosted Checkout).
 * Toutes ces fonctions sont à appeler EXCLUSIVEMENT côté serveur :
 * la clé API ne doit jamais atteindre le navigateur.
 */

const BASE = 'https://api.sumup.com/v0.1';

function cle() {
  const k = process.env.SUMUP_API_KEY;
  if (!k) throw new Error('SUMUP_API_KEY manquante');
  return k;
}

function marchand() {
  const m = process.env.SUMUP_MERCHANT_CODE;
  if (!m) throw new Error('SUMUP_MERCHANT_CODE manquant');
  return m;
}

async function appel<T>(chemin: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${chemin}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cle()}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const texte = await r.text();
  if (!r.ok) {
    throw new Error(`SumUp ${r.status} sur ${chemin} : ${texte.slice(0, 300)}`);
  }
  return texte ? (JSON.parse(texte) as T) : ({} as T);
}

export interface CheckoutSumUp {
  id: string;
  checkout_reference: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  transaction_code?: string;
  hosted_checkout_url?: string;
  transactions?: { transaction_code: string; status: string }[];
}

/** Crée une session de paiement hébergée et renvoie l'URL de redirection. */
export async function creerCheckout(params: {
  reference: string;
  montantCentimes: number;
  description: string;
  emailClient: string;
  urlRetour: string;
}): Promise<CheckoutSumUp> {
  return appel<CheckoutSumUp>('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      checkout_reference: params.reference,
      amount: params.montantCentimes / 100,
      currency: 'EUR',
      merchant_code: marchand(),
      description: params.description,
      pay_to_email: params.emailClient,
      redirect_url: params.urlRetour,
      hosted_checkout: { enabled: true },
    }),
  });
}

/** Relit l'état d'un checkout — source de vérité avant de valider une réservation. */
export async function lireCheckout(id: string): Promise<CheckoutSumUp> {
  return appel<CheckoutSumUp>(`/checkouts/${id}`);
}

/** Formate des centimes en euros, typographie française. */
export function euros(centimes: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
  }).format(centimes / 100);
}

/** Référence lisible et unique : CDF-A3F9K2-7B1C */
export function genererReference(): string {
  const bloc = () =>
    Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CDF-${bloc()}-${bloc().slice(0, 4)}`;
}
