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
import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
import moment from 'moment';
import DaysView from './views/DaysView';
import MonthsView from './views/MonthsView';
import YearsView from './views/YearsView';
import TimeView from './views/TimeView';

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
export type ViewMode = 'years' | 'months' | 'days' | 'time';

const viewModes: Record<string, ViewMode> = {
	YEARS: 'years',
	MONTHS: 'months',
	DAYS: 'days',
	TIME: 'time',
};

/**
 * Props accepted by the {@link Datetime} component.
 *
 * Every prop is optional; sensible defaults are applied for all of them.
 *
 * @public
 */
export interface DateTimeProps {
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

const nofn = () => {};

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
const Datetime = forwardRef((props: DateTimeProps, ref) => {
	const {
		input = true,
		dateFormat = true,
		timeFormat = true,
		utc = false,
		strictParsing = true,
		closeOnSelect = false,
		closeOnTab = true,
		closeOnClickOutside = true,
		onOpen = nofn,
		onClose = nofn,
		onChange = nofn,
		onNavigate = nofn,
		onBeforeNavigate = (next: ViewMode) => next,
		onNavigateBack = nofn,
		onNavigateForward = nofn,
		renderView = (_: ViewMode, renderFunc: () => React.ReactNode) => renderFunc(),
		className: propClassName = '',
		inputProps = {},
	} = props;

	const localMoment = useCallback((date?: any, format?: string | boolean) => {
		let m: moment.Moment;
		const parseFormat = typeof format === 'string' ? format : undefined;

		if (props.utc || utc) {
			m = moment.utc(date, parseFormat, props.strictParsing ?? strictParsing);
		} else if (props.displayTimeZone) {
			m = (moment as any).tz(date, parseFormat, props.displayTimeZone);
		} else {
			m = moment(date, parseFormat, props.strictParsing ?? strictParsing);
			if (moment.isMoment(date)) m.local();
		}

		if (props.locale) m.locale(props.locale);
		return m;
	}, [props.utc, utc, props.displayTimeZone, props.strictParsing, strictParsing, props.locale]);

	const parseDate = useCallback((date: any, format: string | boolean) => {
		let parsedDate: moment.Moment | null = null;
		if (date && typeof date === 'string')
			parsedDate = localMoment(date, format);
		else if (date)
			parsedDate = localMoment(date);

		if (parsedDate && !parsedDate.isValid())
			parsedDate = null;

		return parsedDate;
	}, [localMoment]);

	const getLocaleData = useCallback(() => {
		return localMoment(props.value || (props as any).defaultValue || new Date()).localeData();
	}, [localMoment, props.value, (props as any).defaultValue]);

	const getDateFormat = useCallback(() => {
		const locale = getLocaleData();
		if (dateFormat === true) return locale.longDateFormat('L');
		if (dateFormat) return dateFormat as string;
		return '';
	}, [getLocaleData, dateFormat]);

	const getTimeFormat = useCallback(() => {
		const locale = getLocaleData();
		if (timeFormat === true) return locale.longDateFormat('LT');
		return (timeFormat as string) || '';
	}, [getLocaleData, timeFormat]);

	const getFormat = useCallback((type: 'date' | 'time' | 'datetime') => {
		if (type === 'date') return getDateFormat();
		if (type === 'time') return getTimeFormat();
		const df = getDateFormat();
		const tf = getTimeFormat();
		return df && tf ? `${df} ${tf}` : (df || tf);
	}, [getDateFormat, getTimeFormat]);

	const getInitialDate = useCallback(() => {
		const m = localMoment();
		m.hour(0).minute(0).second(0).millisecond(0);
		return m;
	}, [localMoment]);

	const getInitialViewDate = useCallback((selectedDate?: moment.Moment | null) => {
		const propDate = props.initialViewDate;
		if (propDate) {
			const viewDate = parseDate(propDate, getFormat('datetime'));
			if (viewDate && viewDate.isValid()) return viewDate;
		} else if (selectedDate && selectedDate.isValid()) {
			return selectedDate.clone();
		}
		return getInitialDate();
	}, [props.initialViewDate, parseDate, getFormat, getInitialDate]);

	const getUpdateOn = useCallback((df: string) => {
		if (props.updateOnView) return props.updateOnView;
		if (df.match(/[lLD]/)) return viewModes.DAYS;
		if (df.indexOf('M') !== -1) return viewModes.MONTHS;
		if (df.indexOf('Y') !== -1) return viewModes.YEARS;
		return viewModes.DAYS;
	}, [props.updateOnView]);

	const getInitialView = useCallback(() => {
		const df = getDateFormat();
		return df ? getUpdateOn(df) : viewModes.TIME;
	}, [getDateFormat, getUpdateOn]);

	const getInitialInputValue = useCallback((selectedDate?: moment.Moment | null) => {
		if (inputProps.value !== undefined) return inputProps.value as string;
		if (selectedDate && selectedDate.isValid()) return selectedDate.format(getFormat('datetime'));
		if (props.value && typeof props.value === 'string') return props.value;
		if (props.initialValue && typeof props.initialValue === 'string') return props.initialValue;
		return '';
	}, [inputProps.value, getFormat, props.value, props.initialValue]);

	// State
	const [open, setOpen] = useState(() => !input);
	const [currentView, setCurrentView] = useState<ViewMode>(() => (props.initialViewMode || getInitialView()) as ViewMode);
	const [selectedDate, setSelectedDate] = useState<moment.Moment | undefined>(() => {
		const date = parseDate(props.value || props.initialValue, getFormat('datetime'));
		return date && date.isValid() ? date : undefined;
	});
	const [viewDate, setViewDateState] = useState<moment.Moment>(() => getInitialViewDate(selectedDate));
	const [inputValue, setInputValue] = useState<string>(() => getInitialInputValue(selectedDate));

	const containerRef = useRef<HTMLDivElement>(null);

	// Imperative Handle
	useImperativeHandle(ref, () => ({
		setViewDate: (date: any) => {
			const vd = parseDate(date, getFormat('datetime'));
			if (vd && vd.isValid()) setViewDateState(vd);
		},
		navigate: (mode: ViewMode) => {
			showView(mode);
		},
		state: {
			open,
			currentView,
			viewDate,
			selectedDate,
			inputValue
		}
	}));

	const isOpen = useCallback(() => {
		return !input || (props.open === undefined ? open : props.open);
	}, [input, props.open, open]);

	const showView = useCallback((view: ViewMode, date?: moment.Moment) => {
		const d = (date || viewDate).clone();
		const nextView = onBeforeNavigate(view, currentView, d);
		if (nextView && currentView !== nextView) {
			onNavigate(nextView);
			setCurrentView(nextView);
		}
	}, [viewDate, onBeforeNavigate, currentView, onNavigate]);

	const openCalendar = useCallback(() => {
		if (isOpen()) return;
		setOpen(true);
		onOpen();
	}, [isOpen, onOpen]);

	const closeCalendar = useCallback(() => {
		if (!isOpen()) return;
		setOpen(false);
		onClose(selectedDate || inputValue);
	}, [isOpen, onClose, selectedDate, inputValue]);

	const updateDate = useCallback((e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		const viewToMethod: any = { days: 'date', months: 'month', years: 'year' };
		const nextViewMap: any = { days: 'time', months: 'days', years: 'months' };
		
		const vd = viewDate.clone();
		vd[viewToMethod[currentView] as 'date' | 'month' | 'year'](
			parseInt(target.getAttribute('data-value')!, 10)
		);

		if (currentView === 'days') {
			vd.month(parseInt(target.getAttribute('data-month')!, 10));
			vd.year(parseInt(target.getAttribute('data-year')!, 10));
		}

		const updateOnView = getUpdateOn(getDateFormat());
		if (currentView === updateOnView) {
			setSelectedDate(vd.clone());
			setInputValue(vd.format(getFormat('datetime')));
			if (props.open === undefined && input && closeOnSelect) {
				closeCalendar();
			}
			onChange(vd.clone());
		} else {
			showView(nextViewMap[currentView], vd);
		}
		setViewDateState(vd);
	}, [viewDate, currentView, getUpdateOn, getDateFormat, getFormat, props.open, input, closeOnSelect, closeCalendar, onChange, showView]);

	const viewNavigate = useCallback((modifier: number, unit: moment.unitOfTime.DurationConstructor) => {
		const vd = viewDate.clone().add(modifier, unit);
		if (modifier > 0) onNavigateForward(modifier, unit);
		else onNavigateBack(-modifier, unit);
		setViewDateState(vd);
	}, [viewDate, onNavigateForward, onNavigateBack]);

	const setTime = useCallback((type: string, value: number) => {
		const date = (selectedDate || viewDate).clone();
		(date as any)[type](value);
		if (!props.value) {
			setSelectedDate(date);
			setViewDateState(date.clone());
			setInputValue(date.format(getFormat('datetime')));
		}
		onChange(date);
	}, [selectedDate, viewDate, props.value, getFormat, onChange]);

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | string) => {
		const value = typeof e === 'string' ? e : e.target.value;
		const m = localMoment(value, getFormat('datetime'));
		setInputValue(value);
		if (m.isValid()) {
			setSelectedDate(m);
			setViewDateState(m.clone().startOf('month'));
		} else {
			setSelectedDate(undefined);
		}
		onChange(m.isValid() ? m : value);
	}, [localMoment, getFormat, onChange]);

	// Effects
	useEffect(() => {
		setViewDateState(prev => {
			const vd = localMoment(prev);
			return vd.isValid() ? vd : prev;
		});
		setSelectedDate(prev => {
			if (!prev) return undefined;
			const sd = localMoment(prev);
			return sd.isValid() ? sd : prev;
		});
	}, [props.locale, props.utc, props.displayTimeZone, localMoment]);

	useEffect(() => {
		if (props.value !== undefined) {
			const vd = parseDate(props.value, getFormat('datetime'));
			if (vd && vd.isValid()) setViewDateState(vd);
		}
	}, [props.value, parseDate, getFormat]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				if (input && isOpen() && props.open === undefined && closeOnClickOutside) {
					closeCalendar();
				}
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [input, isOpen, props.open, closeOnClickOutside, closeCalendar]);

	const getClassName = () => {
		let cn = 'rdt';
		if (Array.isArray(propClassName)) cn += ' ' + propClassName.join(' ');
		else if (propClassName) cn += ' ' + propClassName;
		if (!input) cn += ' rdtStatic';
		if (isOpen()) cn += ' rdtOpen';
		return cn;
	};

	const renderInputInternal = () => {
		if (!input) return null;
		const finalInputProps = {
			type: 'text',
			className: 'form-control',
			value: selectedDate && selectedDate.isValid() ? selectedDate.format(getFormat('datetime')) : inputValue,
			...inputProps,
			onFocus: (e: any) => {
				if (inputProps.onFocus && (inputProps.onFocus as any)(e) === false) return;
				openCalendar();
			},
			onChange: (e: any) => {
				if (inputProps.onChange && (inputProps.onChange as any)(e) === false) return;
				handleInputChange(e);
			},
			onKeyDown: (e: any) => {
				if (inputProps.onKeyDown && (inputProps.onKeyDown as any)(e) === false) return;
				if (e.which === 9 && closeOnTab) closeCalendar();
			},
			onClick: (e: any) => {
				if (inputProps.onClick && (inputProps.onClick as any)(e) === false) return;
				openCalendar();
			}
		};

		if (props.renderInput) {
			return <div>{props.renderInput(finalInputProps, openCalendar, closeCalendar)}</div>;
		}
		return <input {...finalInputProps} />;
	};

	const renderCalendar = () => {
		const viewProps: any = {
			viewDate: viewDate.clone(),
			selectedDate,
			isValidDate: props.isValidDate || (() => true),
			updateDate,
			navigate: viewNavigate,
			moment: localMoment,
			showView
		};

		switch (currentView) {
			case viewModes.YEARS:
				viewProps.renderYear = props.renderYear;
				return <YearsView {...viewProps} />;
			case viewModes.MONTHS:
				viewProps.renderMonth = props.renderMonth;
				return <MonthsView {...viewProps} />;
			case viewModes.DAYS:
				viewProps.renderDay = props.renderDay;
				viewProps.timeFormat = getFormat('time');
				return <DaysView {...viewProps} />;
			default:
				viewProps.dateFormat = getFormat('date');
				viewProps.timeFormat = getFormat('time');
				viewProps.timeConstraints = props.timeConstraints;
				viewProps.setTime = setTime;
				return <TimeView {...viewProps} />;
		}
	};

	return (
		<div className={getClassName()} ref={containerRef}>
			{renderInputInternal()}
			<div className="rdtPicker">
				{renderView(currentView, renderCalendar)}
			</div>
		</div>
	);
});

Datetime.displayName = 'Datetime';
(Datetime as any).moment = moment;

export default Datetime;
