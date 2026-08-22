import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Comité des Fêtes de Limetz-Villez',
  description:
    "Brocante, fête de la musique, fête des battages, marché de Noël : les rendez-vous du village de Limetz-Villez, toute l'année.",
  openGraph: {
    title: 'Comité des Fêtes de Limetz-Villez',
    description: 'Quatre rendez-vous par an, montés par les habitants du village.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
