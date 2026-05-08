/** @internal */
import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';

const timeConstraints = {
	hours: { min: 0, max: 23, step: 1 },
	minutes: { min: 0, max: 59, step: 1 },
	seconds: { min: 0, max: 59, step: 1 },
	milliseconds: { min: 0, max: 999, step: 1 }
};

interface TimeViewProps {
	viewDate: moment.Moment;
	selectedDate?: moment.Moment;
	timeConstraints?: any;
	setTime: (type: string, value: number) => void;
	showView: (view: string) => void;
	timeFormat: string;
	dateFormat?: string | boolean;
}

function createConstraints(overrideTimeConstraints: any) {
	const constraints: any = {};
	Object.keys(timeConstraints).forEach(type => {
		constraints[type] = { ...(timeConstraints as any)[type], ...(overrideTimeConstraints?.[type] || {}) };
	});
	return constraints;
}

function pad(type: string, value: number | string) {
	const padValues: any = { hours: 1, minutes: 2, seconds: 2, milliseconds: 3 };
	let str = value + '';
	while (str.length < padValues[type]) str = '0' + str;
	return str;
}

export default function TimeView({
	viewDate,
	selectedDate,
	timeConstraints: overrideTimeConstraints,
	setTime,
	showView,
	timeFormat,
	dateFormat
}: TimeViewProps) {
	const constraints = createConstraints(overrideTimeConstraints);
	const getTimeParts = (date: moment.Moment) => {
		const hours = date.hours();
		return {
			hours: pad('hours', hours),
			minutes: pad('minutes', date.minutes()),
			seconds: pad('seconds', date.seconds()),
			milliseconds: pad('milliseconds', date.milliseconds()),
			ampm: hours < 12 ? 'am' : 'pm'
		};
	};

	const [state, setState] = useState(getTimeParts(selectedDate || viewDate));
	const stateRef = useRef(state);
	stateRef.current = state;

	const timerRef = useRef<any>(null);
	const increaseTimerRef = useRef<any>(null);
	const mouseUpListenerRef = useRef<any>(null);

	useEffect(() => {
		setState(getTimeParts(selectedDate || viewDate));
	}, [selectedDate, viewDate]);

	useEffect(() => {
		return () => {
			clearTimeout(timerRef.current);
			clearInterval(increaseTimerRef.current);
			if (mouseUpListenerRef.current) {
				document.body.removeEventListener('mouseup', mouseUpListenerRef.current);
				document.body.removeEventListener('touchend', mouseUpListenerRef.current);
			}
		};
	}, []);

	const isAMPM = () => timeFormat.toLowerCase().indexOf(' a') !== -1;

	const getCounters = () => {
		const counters = [];
		if (timeFormat.toLowerCase().indexOf('h') !== -1) {
			counters.push('hours');
			if (timeFormat.indexOf('m') !== -1) {
				counters.push('minutes');
				if (timeFormat.indexOf('s') !== -1) {
					counters.push('seconds');
					if (timeFormat.indexOf('S') !== -1) {
						counters.push('milliseconds');
					}
				}
			}
		}
		if (isAMPM()) counters.push('ampm');
		return counters;
	};

	const increase = (type: string) => {
		const tc = constraints[type];
		let value = parseInt(stateRef.current[type as keyof typeof state] as string, 10) + tc.step;
		if (value > tc.max) value = tc.min + (value - (tc.max + 1));
		return pad(type, value);
	};

	const decrease = (type: string) => {
		const tc = constraints[type];
		let value = parseInt(stateRef.current[type as keyof typeof state] as string, 10) - tc.step;
		if (value < tc.min) value = tc.max + 1 - (tc.min - value);
		return pad(type, value);
	};

	const toggleDayPart = () => {
		let hours = parseInt(stateRef.current.hours, 10);
		if (hours >= 12) hours -= 12;
		else hours += 12;
		setTime('hours', hours);
	};

	const onStartClicking = (e: React.MouseEvent | React.TouchEvent, action: 'increase' | 'decrease', type: string) => {
		if ((e as React.MouseEvent).button && (e as React.MouseEvent).button !== 0) return;
		if (type === 'ampm') return toggleDayPart();

		const val = action === 'increase' ? increase(type) : decrease(type);
		setState(prev => ({ ...prev, [type]: val }));

		timerRef.current = setTimeout(() => {
			increaseTimerRef.current = setInterval(() => {
				const v = action === 'increase' ? increase(type) : decrease(type);
				setState(prev => ({ ...prev, [type]: v }));
			}, 70);
		}, 500);

		mouseUpListenerRef.current = () => {
			clearTimeout(timerRef.current);
			clearInterval(increaseTimerRef.current);
			setTime(type, parseInt(stateRef.current[type as keyof typeof state] as string, 10));
			document.body.removeEventListener('mouseup', mouseUpListenerRef.current);
			document.body.removeEventListener('touchend', mouseUpListenerRef.current);
			mouseUpListenerRef.current = null;
		};

		document.body.addEventListener('mouseup', mouseUpListenerRef.current);
		document.body.addEventListener('touchend', mouseUpListenerRef.current);
	};

	const renderCounter = (type: string, value: string) => {
		let displayValue: string | number = value;
		if (type === 'hours' && isAMPM()) {
			displayValue = (parseInt(value, 10) - 1) % 12 + 1;
			if (displayValue === 0) displayValue = 12;
		}

		if (type === 'ampm') {
			if (timeFormat.indexOf(' A') !== -1) displayValue = viewDate.format('A');
			else displayValue = viewDate.format('a');
		}

		return (
			<div key={type} className="rdtCounter">
				<span className="rdtBtn" onMouseDown={e => onStartClicking(e, 'increase', type)} onTouchStart={e => onStartClicking(e, 'increase', type)}>▲</span>
				<div className="rdtCount">{displayValue}</div>
				<span className="rdtBtn" onMouseDown={e => onStartClicking(e, 'decrease', type)} onTouchStart={e => onStartClicking(e, 'decrease', type)}>▼</span>
			</div>
		);
	};

	const renderHeader = () => {
		if (!dateFormat) return null;
		const date = selectedDate || viewDate;
		return (
			<thead>
				<tr>
					<td className="rdtSwitch" colSpan={4} onClick={() => showView('days')}>
						{date.format(dateFormat as string)}
					</td>
				</tr>
			</thead>
		);
	};

	const items: React.ReactNode[] = [];
	getCounters().forEach((c, i) => {
		if (i && c !== 'ampm') {
			items.push(<div key={`sep${i}`} className="rdtCounterSeparator">:</div>);
		}
		items.push(renderCounter(c, (state as any)[c]));
	});

	return (
		<div className="rdtTime">
			<table>
				{renderHeader()}
				<tbody>
					<tr>
						<td>
							<div className="rdtCounters">
								{items}
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
