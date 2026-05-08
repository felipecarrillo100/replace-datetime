import React from 'react';
import moment from 'moment';

/**
 * @packageDocumentation
 * `replace-datetime` — A lightweight, fully-featured datetime picker for React 18 and 19.
 *
 * Drop-in replacement for the legacy `react-datetime` library, rebuilt with modern
 * functional components, TypeScript, and zero legacy dependencies.
 *
 * @example Basic usage
 * ```tsx
 * import Datetime from 'replace-datetime';
 * import 'replace-datetime/css/react-datetime.css';
 *
 * function App() {
 *   return <Datetime onChange={(value) => console.log(value)} />;
 * }
 * ```
 */

/**
 * The calendar view currently rendered by the picker.
 *
 * - `'years'` — year-selection grid
 * - `'months'` — month-selection grid
 * - `'days'` — day-selection calendar (default for date pickers)
 * - `'time'` — time-spinner (default when `dateFormat={false}`)
 *
 * @public
 */
type ViewMode = 'years' | 'months' | 'days' | 'time';
/**
 * Imperative handle exposed by the {@link Datetime} component when used with a `ref`.
 *
 * Attach a React ref to the component to access these methods programmatically:
 *
 * @example
 * ```tsx
 * const ref = useRef<DatetimeHandle>(null);
 *
 * // Navigate the calendar to a specific date
 * ref.current?.setViewDate(moment('2025-06-01'));
 *
 * // Switch the active view
 * ref.current?.navigate('years');
 *
 * // Read internal state
 * console.log(ref.current?.state.selectedDate);
 *
 * return <Datetime ref={ref} />;
 * ```
 *
 * @public
 */
interface DatetimeHandle {
    /**
     * Navigate the calendar to the given date without changing the selected value.
     * @param date - A `moment` object, native `Date`, or date string.
     */
    setViewDate: (date: moment.Moment | Date | string) => void;
    /**
     * Programmatically switch the active calendar view.
     * @param mode - The {@link ViewMode} to display.
     */
    navigate: (mode: ViewMode) => void;
    /** Read-only snapshot of the component's current internal state. */
    state: {
        /** Whether the calendar overlay is currently open. */
        open: boolean;
        /** The view currently rendered inside the calendar. */
        currentView: ViewMode;
        /** The date the calendar is currently navigated to. */
        viewDate: moment.Moment;
        /** The selected date, or `undefined` if nothing is selected. */
        selectedDate: moment.Moment | undefined;
        /** The current raw string value of the text input. */
        inputValue: string;
    };
}
/**
 * Props accepted by the {@link Datetime} component.
 *
 * Every prop is optional; sensible defaults are applied for all of them.
 *
 * @public
 */
interface DateTimeProps {
    /**
     * The currently selected date/time value (controlled mode).
     * Accepts a `moment` object, a native `Date`, or a date string.
     * When provided the picker becomes a controlled component.
     */
    value?: moment.Moment | Date | string;
    /**
     * Initial value for the picker in uncontrolled mode.
     * Accepts a `moment` object, a native `Date`, or a date string.
     */
    initialValue?: moment.Moment | Date | string;
    /**
     * The date/time that the calendar initially navigates to (i.e. the month
     * shown when the picker first opens). Defaults to `value`, `initialValue`,
     * or today if neither is set.
     */
    initialViewDate?: moment.Moment | Date | string;
    /**
     * Which calendar view to show first.
     * @defaultValue Determined automatically from `dateFormat`.
     */
    initialViewMode?: ViewMode;
    /** Called when the calendar/time-picker overlay is opened. */
    onOpen?: () => void;
    /**
     * Called when the calendar/time-picker overlay is closed.
     * @param value - The currently selected value at close time.
     */
    onClose?: (value: moment.Moment | string) => void;
    /**
     * Called every time the user changes the selected value, whether by
     * clicking a day/month/year, adjusting the time spinner, or typing in
     * the input field.
     *
     * @param value - A valid `moment` object when the input is parseable,
     *   or the raw string when it cannot be parsed.
     *
     * @example
     * ```tsx
     * <Datetime onChange={(v) => {
     *   if (moment.isMoment(v)) console.log(v.toISOString());
     * }} />
     * ```
     */
    onChange?: (value: moment.Moment | string) => void;
    /**
     * Called when the user navigates to a different view (e.g. from days to months).
     * @param view - The new active view mode.
     */
    onNavigate?: (view: ViewMode) => void;
    /**
     * Called before the view changes, allowing the host to veto or redirect navigation.
     * Return `nextView` to allow, or a different `ViewMode` to redirect.
     *
     * @param nextView - The view the user is trying to navigate to.
     * @param currentView - The view currently displayed.
     * @param viewDate - The `moment` date currently in focus.
     * @returns The `ViewMode` that should actually be shown.
     */
    onBeforeNavigate?: (nextView: ViewMode, currentView: ViewMode, viewDate: moment.Moment) => ViewMode;
    /**
     * Called when the user clicks the "previous" navigation arrow.
     * @param amount - Number of units navigated back.
     * @param type - Unit of navigation (e.g. `'months'`, `'years'`).
     */
    onNavigateBack?: (amount: number, type: string) => void;
    /**
     * Called when the user clicks the "next" navigation arrow.
     * @param amount - Number of units navigated forward.
     * @param type - Unit of navigation (e.g. `'months'`, `'years'`).
     */
    onNavigateForward?: (amount: number, type: string) => void;
    /**
     * Which calendar view triggers an `onChange` call.
     * By default, determined from `dateFormat` (e.g. `'days'` for a full date format).
     * Set to `'months'` to only fire `onChange` when a month is picked.
     */
    updateOnView?: ViewMode;
    /**
     * A [moment locale](https://momentjs.com/docs/#/i18n/) identifier string
     * (e.g. `'es'`, `'fr'`, `'de'`). Applied to month/day names and the default
     * date/time format.
     *
     * @example
     * ```tsx
     * <Datetime locale="es" />
     * ```
     */
    locale?: string;
    /**
     * When `true`, all dates/times are interpreted and displayed in UTC.
     * @defaultValue false
     */
    utc?: boolean;
    /**
     * A [moment-timezone](https://momentjs.com/timezone/) zone name
     * (e.g. `'America/New_York'`). Requires `moment-timezone` to be installed.
     */
    displayTimeZone?: string;
    /**
     * When `true`, the picker is displayed inside an `<input>` field that
     * opens a floating calendar. When `false`, the calendar is always visible
     * (static / inline mode).
     *
     * @defaultValue true
     */
    input?: boolean;
    /**
     * Moment.js format string for the date portion (e.g. `'YYYY-MM-DD'`).
     * Pass `false` to hide the date part entirely (time-only picker).
     * Pass `true` to use the locale default.
     *
     * @defaultValue true (locale default)
     *
     * @example Date-only picker
     * ```tsx
     * <Datetime timeFormat={false} />
     * ```
     */
    dateFormat?: string | boolean;
    /**
     * Moment.js format string for the time portion (e.g. `'HH:mm:ss'`).
     * Pass `false` to hide the time part entirely (date-only picker).
     * Pass `true` to use the locale default.
     *
     * @defaultValue true (locale default)
     *
     * @example Date-only picker
     * ```tsx
     * <Datetime timeFormat={false} />
     * ```
     */
    timeFormat?: string | boolean;
    /**
     * Props forwarded directly to the underlying `<input>` element.
     * Any standard `React.InputHTMLAttributes` are accepted in addition to
     * arbitrary data attributes.
     *
     * @example Custom placeholder
     * ```tsx
     * <Datetime inputProps={{ placeholder: 'Pick a date…', id: 'my-date' }} />
     * ```
     */
    inputProps?: React.InputHTMLAttributes<HTMLInputElement> & Record<string, any>;
    /**
     * Fine-grained constraints for the time spinner. Each key corresponds to a
     * time unit; each value may contain `min`, `max`, and `step`.
     *
     * @example Allow minutes only in 15-minute increments
     * ```tsx
     * <Datetime timeConstraints={{ minutes: { min: 0, max: 45, step: 15 } }} />
     * ```
     */
    timeConstraints?: any;
    /**
     * Return `true` for dates that should be selectable, `false` to disable them.
     *
     * @param date - The `moment` date being evaluated.
     * @returns `true` if the date is valid/selectable.
     *
     * @example Disable past dates
     * ```tsx
     * <Datetime isValidDate={(d) => d.isSameOrAfter(moment(), 'day')} />
     * ```
     */
    isValidDate?: (date: moment.Moment) => boolean;
    /**
     * Programmatically control whether the calendar overlay is open.
     * When set, the component becomes fully controlled — use `onOpen`/`onClose`
     * to manage the state externally.
     */
    open?: boolean;
    /**
     * When `true`, only dates that strictly match `dateFormat` are accepted
     * as valid when typing in the input field.
     * @defaultValue true
     */
    strictParsing?: boolean;
    /**
     * When `true`, the calendar closes automatically as soon as the user
     * selects a value from the final view (day for a date picker, etc.).
     * @defaultValue false
     */
    closeOnSelect?: boolean;
    /**
     * When `true`, pressing the **Tab** key closes the calendar.
     * @defaultValue true
     */
    closeOnTab?: boolean;
    /**
     * When `true`, clicking outside the picker closes the calendar.
     * @defaultValue true
     */
    closeOnClickOutside?: boolean;
    /**
     * One or more CSS class names appended to the root `<div>` wrapper.
     *
     * @example
     * ```tsx
     * <Datetime className="my-picker" />
     * <Datetime className={['theme-dark', 'compact']} />
     * ```
     */
    className?: string | string[];
    /**
     * Custom render function that wraps (or replaces) the default calendar view.
     *
     * @param view - The current view mode.
     * @param renderDefault - Call this to render the built-in view.
     * @returns Any React node.
     *
     * @example Add a footer below the built-in calendar
     * ```tsx
     * <Datetime
     *   renderView={(mode, renderDefault) => (
     *     <div>
     *       {renderDefault()}
     *       <p>Select a date above</p>
     *     </div>
     *   )}
     * />
     * ```
     */
    renderView?: (view: ViewMode, renderDefault: () => React.ReactNode) => React.ReactNode;
    /**
     * Custom render function for the text input.
     *
     * @param props - Props to spread on your custom input element.
     * @param openCalendar - Call to open the calendar programmatically.
     * @param closeCalendar - Call to close the calendar programmatically.
     *
     * @example Custom button trigger
     * ```tsx
     * <Datetime
     *   renderInput={(props, open) => (
     *     <button onClick={open}>{props.value || 'Pick a date'}</button>
     *   )}
     * />
     * ```
     */
    renderInput?: (props: any, openCalendar: () => void, closeCalendar: () => void) => React.ReactNode;
    /**
     * Custom render function for each day cell in the calendar grid.
     *
     * @param props - Props to spread on the `<td>` element (includes click handlers).
     * @param date - The `moment` date for this cell.
     * @param selectedDate - The currently selected date, if any.
     *
     * @example Highlight weekends
     * ```tsx
     * <Datetime
     *   renderDay={(props, date) => (
     *     <td {...props} style={{ color: date.day() === 0 ? 'red' : undefined }}>
     *       {date.date()}
     *     </td>
     *   )}
     * />
     * ```
     */
    renderDay?: (props: any, date: moment.Moment, selectedDate?: moment.Moment) => React.ReactNode;
    /**
     * Custom render function for each month cell in the month-selection view.
     *
     * @param props - Props to spread on the `<td>` element.
     * @param month - Zero-based month index (0 = January).
     * @param year - Full four-digit year.
     * @param selectedDate - The currently selected date, if any.
     */
    renderMonth?: (props: any, month: number, year: number, selectedDate?: moment.Moment) => React.ReactNode;
    /**
     * Custom render function for each year cell in the year-selection view.
     *
     * @param props - Props to spread on the `<td>` element.
     * @param year - Full four-digit year.
     * @param selectedDate - The currently selected date, if any.
     */
    renderYear?: (props: any, year: number, selectedDate?: moment.Moment) => React.ReactNode;
}
/**
 * A fully-featured, accessible datetime picker component for React 18 and 19.
 *
 * `Datetime` supports date-only, time-only, and combined date+time modes. It can
 * be used as a floating picker attached to an `<input>` or as an inline (static)
 * calendar embedded directly in your layout.
 *
 * The component is a **controlled-or-uncontrolled** hybrid — pass `value` for
 * controlled mode, or `initialValue` for uncontrolled mode.
 *
 * A `ref` can be attached to access imperative methods:
 * - `ref.current.setViewDate(date)` — navigate the calendar to a specific date
 * - `ref.current.navigate(viewMode)` — switch the active view programmatically
 * - `ref.current.state` — read current internal state
 *
 * @example Date-only picker
 * ```tsx
 * import Datetime from 'replace-datetime';
 * import 'replace-datetime/css/react-datetime.css';
 *
 * function DateOnlyPicker() {
 *   const [date, setDate] = useState<moment.Moment>();
 *   return (
 *     <Datetime
 *       value={date}
 *       timeFormat={false}
 *       onChange={(v) => { if (moment.isMoment(v)) setDate(v); }}
 *     />
 *   );
 * }
 * ```
 *
 * @example Inline / static calendar
 * ```tsx
 * <Datetime input={false} onChange={(v) => console.log(v)} />
 * ```
 *
 * @public
 */
declare const Datetime: React.ForwardRefExoticComponent<DateTimeProps & React.RefAttributes<DatetimeHandle>>;

export { type DateTimeProps, Datetime, type DatetimeHandle, type ViewMode, Datetime as default };
