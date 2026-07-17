import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export const getDb = (d1: D1Database) => drizzle(d1, { schema });

export type Db = ReturnType<typeof getDb>;

// Fire-and-forget write (e.g. visit counters) that must never block or fail the response.
export const trackVisit = (platform: App.Platform | undefined, run: () => Promise<unknown>) => {
	const promise = run().catch((e) => console.error('Visit count update failed:', e));
	platform?.ctx?.waitUntil?.(promise);
};
