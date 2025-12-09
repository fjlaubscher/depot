import { afterEach, describe, expect, it, vi } from 'vitest';

import { rosterShare } from '@depot/core';
import * as coreRoster from '@depot/core/utils/roster';
import { generateRosterMarkdown, generateRosterShareText } from './roster';
import { createMockRoster } from '@/test/mock-data';

const mockRoster = createMockRoster();

describe('web roster helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('appends the absolute url to markdown exports', () => {
    const spy = vi.spyOn(coreRoster, 'generateRosterMarkdown').mockReturnValue('base-markdown');

    const result = generateRosterMarkdown(mockRoster, 'Test Faction');

    expect(spy).toHaveBeenCalledWith(mockRoster, 'Test Faction', {});
    expect(result).toBe(`base-markdown\n${window.location.origin}/`);
  });

  it('appends the absolute url to share text exports', () => {
    const spy = vi.spyOn(rosterShare, 'generateRosterShareText').mockReturnValue('share-text');

    const result = generateRosterShareText(mockRoster, 'Test Faction', {
      includeWargear: true,
      includeWargearAbilities: false
    });

    expect(spy).toHaveBeenCalledWith(mockRoster, 'Test Faction', {
      includeWargear: true,
      includeWargearAbilities: false
    });
    expect(result).toBe(`share-text\n${window.location.origin}/`);
  });
});
