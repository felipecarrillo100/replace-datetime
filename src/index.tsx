import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
import moment from 'moment';
import DaysView from './views/DaysView';
import MonthsView from './views/MonthsView';
import YearsView from './views/YearsView';
import TimeView from './views/TimeView';

export type ViewMode = 'years' | 'months' | 'days' | 'time';

const viewModes: Record<string, ViewMode> = {
	YEARS: 'years',
	MONTHS: 'months',
	DAYS: 'days',
	TIME: 'time',
};

export interface DateTimeProps {
	value?: moment.Moment | Date | string;
	initialValue?: moment.Moment | Date | string;
	initialViewDate?: moment.Moment | Date | string;
	initialViewMode?: ViewMode;
	onOpen?: () => void;
	onClose?: (value: moment.Moment | string) => void;
	onChange?: (value: moment.Moment | string) => void;
	onNavigate?: (view: ViewMode) => void;
	onBeforeNavigate?: (nextView: ViewMode, currentView: ViewMode, viewDate: moment.Moment) => ViewMode;
	onNavigateBack?: (amount: number, type: string) => void;
	onNavigateForward?: (amount: number, type: string) => void;
	updateOnView?: ViewMode;
	locale?: string;
	utc?: boolean;
	displayTimeZone?: string;
	input?: boolean;
	dateFormat?: string | boolean;
	timeFormat?: string | boolean;
	inputProps?: React.InputHTMLAttributes<HTMLInputElement> & Record<string, any>;
	timeConstraints?: any;
	isValidDate?: (date: moment.Moment) => boolean;
	open?: boolean;
	strictParsing?: boolean;
	closeOnSelect?: boolean;
	closeOnTab?: boolean;
	closeOnClickOutside?: boolean;
	className?: string | string[];
	renderView?: (view: ViewMode, renderDefault: () => React.ReactNode) => React.ReactNode;
	renderInput?: (props: any, openCalendar: () => void, closeCalendar: () => void) => React.ReactNode;
	renderDay?: (props: any, date: moment.Moment, selectedDate?: moment.Moment) => React.ReactNode;
	renderMonth?: (props: any, month: number, year: number, selectedDate?: moment.Moment) => React.ReactNode;
	renderYear?: (props: any, year: number, selectedDate?: moment.Moment) => React.ReactNode;
}

const nofn = () => {};

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
