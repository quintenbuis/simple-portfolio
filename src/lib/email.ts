export function splitEmail(email: string): { user: string; domain: string } {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) {
    throw new Error(`Ongeldig e-mailadres in src/config.ts: "${email}"`);
  }
  return { user: email.slice(0, at), domain: email.slice(at + 1) };
}

export function obfuscateEmail(email: string): string {
  const { user, domain } = splitEmail(email);
  return `${user} [at] ${domain.replaceAll('.', ' [dot] ')}`;
}
