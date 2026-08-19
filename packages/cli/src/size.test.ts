import { describe, expect, it } from 'vitest';
import { isTooLarge, MAX_ROW_BYTES, rowBytes } from './commands';

describe('row size guard', () => {
	it('counts markdown and rendered HTML together, since both share one D1 row', () => {
		expect(rowBytes('abc', 'defg')).toBe(7);
	});

	it('counts bytes rather than characters, so multi-byte content is not underestimated', () => {
		expect(rowBytes('é', '')).toBe(2);
	});

	it('allows content at the limit', () => {
		expect(isTooLarge('x'.repeat(MAX_ROW_BYTES), '')).toBe(false);
	});

	it('rejects content one byte over the limit', () => {
		expect(isTooLarge('x'.repeat(MAX_ROW_BYTES + 1), '')).toBe(true);
	});

	it('stays below D1 hard cap of 2,000,000 bytes per row', () => {
		expect(MAX_ROW_BYTES).toBeLessThan(2_000_000);
	});

	it('accepts a note that measured 1.0MB rendered in production', () => {
		expect(isTooLarge('x'.repeat(42_667), 'y'.repeat(1_012_233))).toBe(false);
	});

	it('rejects a note that measured ~3.2MB rendered in production', () => {
		expect(isTooLarge('x'.repeat(130_068), 'y'.repeat(3_100_000))).toBe(true);
	});
});
