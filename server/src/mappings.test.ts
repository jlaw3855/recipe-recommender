import { describe, expect, it } from 'vitest';
import {
  deriveComplexity,
  getCountryOfOrigin,
  stripAndTruncateSummary,
} from './mappings.js';

describe('deriveComplexity', () => {
  it('returns easy for small quick recipes', () => {
    expect(deriveComplexity(4, 3, 20)).toBe('easy');
  });

  it('returns medium for moderate recipes', () => {
    expect(deriveComplexity(8, 7, 45)).toBe('medium');
  });

  it('returns hard for large complex recipes', () => {
    expect(deriveComplexity(15, 12, 90)).toBe('hard');
  });
});

describe('stripAndTruncateSummary', () => {
  it('strips HTML and truncates to max sentences', () => {
    const html =
      '<p>First sentence.</p><p>Second sentence!</p><p>Third?</p><p>Fourth.</p>';
    expect(stripAndTruncateSummary(html, 2)).toMatch(/First sentence\.\s+Second sentence!/);
  });
});

describe('getCountryOfOrigin', () => {
  it('maps known cuisines to display countries', () => {
    expect(getCountryOfOrigin(['italian'])).toBe('Italy');
  });

  it('returns Unknown when cuisines are empty', () => {
    expect(getCountryOfOrigin([])).toBe('Unknown');
  });

  it('capitalizes unknown cuisine names', () => {
    expect(getCountryOfOrigin(['some regional cuisine'])).toBe('Some Regional Cuisine');
  });
});
