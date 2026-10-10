import { describe, expect, it } from 'vitest';
import { obfuscateEmail, splitEmail } from '../../src/lib/email';

describe('splitEmail', () => {
  it('splitst een gewoon adres', () => {
    expect(splitEmail('hallo@example.com')).toEqual({ user: 'hallo', domain: 'example.com' });
  });

  it('behoudt plus-adressen en subdomeinen', () => {
    expect(splitEmail('naam+web@mail.domein.nl')).toEqual({ user: 'naam+web', domain: 'mail.domein.nl' });
  });

  it.each(['geen-at', '@example.com', 'naam@'])('weigert ongeldig adres %s', (email) => {
    expect(() => splitEmail(email)).toThrow(/Ongeldig e-mailadres/);
  });
});

describe('obfuscateEmail', () => {
  it('vervangt @ en punten in het domein', () => {
    expect(obfuscateEmail('hallo@mail.example.com')).toBe('hallo [at] mail [dot] example [dot] com');
  });

  it('bevat het letterlijke adres niet', () => {
    expect(obfuscateEmail('hallo@example.com')).not.toContain('hallo@example.com');
  });
});
