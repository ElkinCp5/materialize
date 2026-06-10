import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('CSS utilities build output', () => {
  const cssPath = resolve(process.cwd(), 'dist/css/materialize.css');
  const css = readFileSync(cssPath, 'utf8');

  it('contains base utility selectors', () => {
    const selectors = [
      '.m0',
      '.p5',
      '.bg-primary',
      '.opacity-100',
      '.animate-fade-in',
      '.transition-all',
      '.flex-row',
      '.text-center',
    ];

    selectors.forEach((selector) => {
      expect(css).toContain(`${selector} {`);
    });
  });

  it('contains responsive spacing, text and flex utilities', () => {
    const selectors = [
      '.m-sm-3',
      '.p-md-4',
      '.mx-lg-auto',
      '.text-sm-center',
      '.text-md-end',
      '.fs-lg-xl',
      '.flex-sm-row',
      '.justify-content-md-between',
      '.align-items-lg-center',
    ];

    selectors.forEach((selector) => {
      expect(css).toContain(`${selector} {`);
    });
  });
});
