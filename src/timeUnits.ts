/** @internal */

/**
 * A unit of time adjustable by the time-picker counters.
 *
 * These plural names are the component's internal vocabulary for time units:
 * they are the keys of the `timeConstraints` prop and of the time view's
 * counter state.
 */
export type TimeUnit = 'hours' | 'minutes' | 'seconds' | 'milliseconds';

/**
 * Maps a {@link TimeUnit} to the corresponding Day.js setter name.
 *
 * Day.js only defines the singular setters (`hour()`, `minute()`, …), whereas
 * Moment.js accepted both spellings. Translating at this boundary lets the
 * plural names stay the vocabulary of the props and the time view.
 */
export const DAYJS_SETTER: Record<TimeUnit, 'hour' | 'minute' | 'second' | 'millisecond'> = {
	hours: 'hour',
	minutes: 'minute',
	seconds: 'second',
	milliseconds: 'millisecond',
};
