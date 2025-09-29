import { describe, it, expect } from 'vitest';
import convertToJSON from './convert-to-json.js';

describe('convertToJSON', () => {
  it('parses pipe-delimited CSV with BOM and CRLF', () => {
    const input = '\uFEFFName|Some Header|Ignored|\r\n' + 'Alice|Hello World|drop-me|\r\n';

    const result = convertToJSON(input);
    expect(result).toHaveLength(1);
    // Headers are camelCased
    expect(result[0]).toHaveProperty('name', 'Alice');
    expect(result[0]).toHaveProperty('someHeader', 'Hello World');
    // Trailing empty column is ignored; defined columns are preserved
    expect(result[0]).toHaveProperty('ignored', 'drop-me');
  });

  it('strips unwanted HTML but preserves allowed elements', () => {
    const htmlCell =
      'Text <div class="abName">Ability Name</div>' +
      ' <span class="kwb">KW</span> ' +
      '<a href="#">anchor</a> ' +
      '<i>italic</i> ' +
      '<b>bold</b>' +
      '<br/>' +
      '<ul><li>item</li></ul>';

    const input = 'Col|\r\n' + htmlCell + '|\r\n';
    const result = convertToJSON(input);
    expect(result).toHaveLength(1);
    const value = result[0].col;

    // Removed elements
    expect(value).not.toContain('<div');
    expect(value).not.toContain('<i>');
    expect(value).not.toContain('<a ');

    // Preserved elements
    expect(value).toContain('<span class="kwb">KW</span>');
    expect(value).toContain('<b>bold</b>');
    expect(value).toContain('<br');
    expect(value).toContain('<ul>');
    expect(value).toContain('<li>item</li>');

    // Anchor inner text preserved
    expect(value).toContain('anchor');
  });
});
