/**
 * A unit of time adjustable by the time-picker counters.
 *
 * These plural names are the component's vocabulary for time units: they are
 * the keys of {@link TimeConstraints} and of the time view's counter state.
 *
 * @public
 */
export type TimeUnit = 'hours' | 'minutes' | 'seconds' | 'milliseconds';

/**
 * Bounds and increment for a single time unit's counter.
 *
 * Any omitted field falls back to the built-in default for that unit
 * (`hours` 0–23, `minutes` and `seconds` 0–59, `milliseconds` 0–999, all
 * stepping by 1).
 *
 * @public
 */
export interface TimeConstraint {
	/** Lowest value the counter will show. */
	min?: number;
	/** Highest value the counter will show. */
	max?: number;
	/** Amount added or subtracted per click of the ▲/▼ buttons. */
	step?: number;
}

/**
 * Per-unit overrides for the time-picker counters, keyed by {@link TimeUnit}.
 *
 * @example Minutes in quarter-hour increments
 * ```tsx
 * <Datetime timeConstraints={{ minutes: { step: 15 } }} />
 * ```
 *
 * @public
 */
export type TimeConstraints = Partial<Record<TimeUnit, TimeConstraint>>;

/**
 * Maps a {@link TimeUnit} to the corresponding Day.js setter name.
 *
 * Day.js only defines the singular setters (`hour()`, `minute()`, …), whereas
 * Moment.js accepted both spellings. Translating at this boundary lets the
 * plural names stay the vocabulary of the props and the time view.
 *
 * @internal
 */
export const DAYJS_SETTER: Record<TimeUnit, 'hour' | 'minute' | 'second' | 'millisecond'> = {
	hours: 'hour',
	minutes: 'minute',
	seconds: 'second',
	milliseconds: 'millisecond',
};

/**
 * Built-in bounds and step for every counter, before any
 * {@link TimeConstraints} overrides are merged in.
 *
 * @internal
 */
export const DEFAULT_TIME_CONSTRAINTS: Record<TimeUnit, Required<TimeConstraint>> = {
	hours: { min: 0, max: 23, step: 1 },
	minutes: { min: 0, max: 59, step: 1 },
	seconds: { min: 0, max: 59, step: 1 },
	milliseconds: { min: 0, max: 999, step: 1 },
};
