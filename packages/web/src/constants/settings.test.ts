import { describe, expect, it } from 'vitest';
import { mergeSettingsWithDefaults } from './settings';

describe('mergeSettingsWithDefaults', () => {
  it.each([undefined, null, {}])(
    'defaults missing preferences to automatic language (%s)',
    (stored) => {
      expect(mergeSettingsWithDefaults(stored)).toMatchObject({
        language: 'auto',
        theme: 'system'
      });
    }
  );

  it('adds automatic language to old settings without losing their values', () => {
    expect(
      mergeSettingsWithDefaults({ showLegends: true, showFluff: false, theme: 'dark' })
    ).toMatchObject({
      language: 'auto',
      showLegends: true,
      showFluff: false,
      theme: 'dark'
    });
  });

  it.each(['auto', 'fr', 'en'] as const)(
    'preserves explicit language %s and other preferences',
    (language) => {
      expect(mergeSettingsWithDefaults({ language, useNativeShare: false })).toMatchObject({
        language,
        useNativeShare: false
      });
    }
  );
});
