// Persoonlijke gegevens — taalonafhankelijk.

export interface Technology {
  name: string;
  // Slug van https://simpleicons.org (staat in de URL van het icoon). Weglaten = generiek server-icoon.
  icon?: string;
}

const technologies: Technology[] = [
  { name: 'PHP', icon: 'php' },
  { name: 'Laravel', icon: 'laravel' },
  { name: 'Symfony', icon: 'symfony' },
  { name: 'C# / .NET', icon: 'dotnet' },
  { name: 'Go', icon: 'go' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Vue', icon: 'vuedotjs' },
  { name: 'React.js', icon: 'react' },
  { name: 'Next.js', icon: 'nextdotjs' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'Docker', icon: 'docker' },
  { name: 'Kubernetes', icon: 'kubernetes' },
  { name: 'Terraform', icon: 'terraform' },
  { name: 'GCP', icon: 'googlecloud' },
  { name: 'VPS' },
];

export const profile = {
  name: 'Quinten Buis',
  email: 'contact@quinnovate.nl',
  githubUrl: 'https://github.com/quintenbuis',
  linkedinUrl: 'https://www.linkedin.com/in/quintenbuis/',
  // Startjaar als developer; de site toont automatisch 'ruim X jaar ervaring' via {years} in about.text.
  careerStartYear: 2020,
  // Handelsnaam van de eenmanszaak (voor de bedrijfsgegevens in de JSON-LD).
  businessName: 'Quinnovate',
  // Leeg laten om het KvK- of btw-nummer niet te tonen.
  kvk: '86084518',
  vatNumber: 'NL004188539B41',
  // Productie-URL zonder base path, bijv. 'https://jouwnaam.nl'.
  siteUrl: 'https://quintenbuis.nl',
  technologies,
};
