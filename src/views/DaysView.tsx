/** @internal */
import React from 'react';
import moment from 'moment';
import ViewNavigation from '../parts/ViewNavigation';

interface DaysViewProps {
	viewDate: moment.Moment;
	selectedDate?: moment.Moment;
	isValidDate: (date: moment.Moment) => boolean;
	renderDay: (props: any, date: moment.Moment, selectedDate?: moment.Moment) => React.ReactNode;
	updateDate: (e: React.MouseEvent) => void;
	navigate: (amount: number, type: moment.unitOfTime.DurationConstructor) => void;
	showView: (view: string) => void;
	moment: () => moment.Moment;
	timeFormat?: string | boolean;
}

export default function DaysView({
	viewDate,
	selectedDate,
	isValidDate = () => true,
	renderDay = (props, date) => <td {...props}>{date.date()}</td>,
	updateDate,
	navigate,
	showView,
	moment: getMoment,
	timeFormat
}: DaysViewProps) {
	const renderNavigation = () => {
		const locale = viewDate.localeData();
		return (
			<ViewNavigation
				onClickPrev={() => navigate(-1, 'months')}
				onClickSwitch={() => showView('months')}
				onClickNext={() => navigate(1, 'months')}
				switchContent={locale.months(viewDate) + ' ' + viewDate.year()}
				switchColSpan={5}
				switchProps={{ 'data-value': viewDate.month() } as any}
			/>
		);
	};

	const renderDayHeaders = () => {
		const locale = viewDate.localeData();
		const dayItems = getDaysOfWeek(locale).map((day, index) => (
			<th key={day + index} className="dow">{day}</th>
		));

		return (
			<tr>
				{dayItems}
			</tr>
		);
	};

	const getDaysOfWeek = (locale: moment.Locale) => {
		const first = locale.firstDayOfWeek();
		const dow: string[] = [];
		let i = 0;

		(locale as any)._weekdaysMin.forEach(function (day: string) {
			dow[(7 + (i++) - first) % 7] = day;
		});

		return dow;
	};

	const renderDays = () => {
		const startOfMonth = viewDate.clone().startOf('month');
		const endOfMonth = viewDate.clone().endOf('month');

		const rows: React.ReactNode[][] = [[], [], [], [], [], []];

		const startDate = viewDate.clone().subtract(1, 'months');
		startDate.date(startDate.daysInMonth()).startOf('week');

		const endDate = startDate.clone().add(42, 'd');
		let i = 0;

		while (startDate.isBefore(endDate)) {
			const rowIndex = Math.floor(i / 7);
			rows[rowIndex].push(renderSingleDay(startDate.clone(), startOfMonth, endOfMonth));
			startDate.add(1, 'd');
			i++;
		}

		return rows.map((r, i) => (
			<tr key={`${endDate.month()}_${i}`}>{r}</tr>
		));
	};

	const renderSingleDay = (date: moment.Moment, startOfMonth: moment.Moment, endOfMonth: moment.Moment) => {
		const key = date.format('M_D');
		const dayProps: any = {
			'data-value': date.date(),
			'data-month': date.month(),
			'data-year': date.year()
		};

		let className = 'rdtDay';
		if (date.isBefore(startOfMonth)) {
			className += ' rdtOld';
		}
		else if (date.isAfter(endOfMonth)) {
			className += ' rdtNew';
		}
		if (selectedDate && date.isSame(selectedDate, 'day')) {
			className += ' rdtActive';
		}
		if (date.isSame(getMoment(), 'day')) {
			className += ' rdtToday';
		}

		if (isValidDate(date)) {
			dayProps.onClick = updateDate;
		}
		else {
			className += ' rdtDisabled';
		}

		dayProps.className = className;

		const element = renderDay(
			dayProps, date.clone(), selectedDate && selectedDate.clone()
		);
		return React.isValidElement(element) ? React.cloneElement(element, { key }) : element;
	};

	const renderFooter = () => {
		if (!timeFormat) return;

		return (
			<tfoot>
				<tr>
					<td onClick={() => showView('time')}
						colSpan={7}
						className="rdtTimeToggle">
						{viewDate.format(timeFormat as string)}
					</td>
				</tr>
			</tfoot>
		);
	};

	return (
		<div className="rdtDays">
			<table>
				<thead>
					{renderNavigation()}
					{renderDayHeaders()}
				</thead>
				<tbody>
					{renderDays()}
				</tbody>
				{renderFooter()}
			</table>
		</div>
	);
}
