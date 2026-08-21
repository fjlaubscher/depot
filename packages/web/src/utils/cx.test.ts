import { expect, it } from 'vitest';

import { cx } from './cx';

it('joins truthy class names', () => {
  expect(cx('a', false, undefined, null, 0, 'b')).toBe('a b');
});
