'use client';

export default function ExportCsv({ reservations }: { reservations: any[] }) {
  function telecharger() {
    const entetes = [
      'Référence', 'Nom', 'Email', 'Téléphone', 'Événement',
      'Places', 'Montant', 'Statut', 'Code billet', 'Pointé', 'Remarque', 'Date',
    ];

    const echappe = (v: any) => {
      const s = String(v ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const lignes = reservations.map((r) => [
      r.reference, r.nom, r.email, r.telephone ?? '',
      r.evenements?.titre ?? '', r.places,
      (r.montant_centimes / 100).toFixed(2).replace('.', ','),
      r.statut, r.code_billet, r.scanne_le ? 'oui' : 'non',
      r.commentaire ?? '',
      new Date(r.created_at).toLocaleDateString('fr-FR'),
    ].map(echappe).join(';'));

    // BOM UTF-8 pour qu'Excel affiche correctement les accents
    const csv = '\uFEFF' + [entetes.map(echappe).join(';'), ...lignes].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      className="btn btn-k btn-sm"
      onClick={telecharger}
      disabled={reservations.length === 0}
    >
      Exporter en CSV ({reservations.length})
    </button>
  );
}
