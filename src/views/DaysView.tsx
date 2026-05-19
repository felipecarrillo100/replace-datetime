/** @internal */
import React from 'react';
import dayjs from 'dayjs';
import ViewNavigation from '../parts/ViewNavigation';

interface DaysViewProps {
	viewDate: dayjs.Dayjs;
	selectedDate?: dayjs.Dayjs;
	isValidDate: (date: dayjs.Dayjs) => boolean;
	renderDay: (props: any, date: dayjs.Dayjs, selectedDate?: dayjs.Dayjs) => React.ReactNode;
	updateDate: (e: React.MouseEvent) => void;
	navigate: (amount: number, type: any) => void;
	showView: (view: string) => void;
	moment: () => dayjs.Dayjs;
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

	const getDaysOfWeek = (locale: any) => {
		const first = locale.firstDayOfWeek();
		const weekdaysMin = locale.weekdaysMin();
		const dow: string[] = [];
		let i = 0;

		weekdaysMin.forEach(function (day: string) {
			dow[(7 + (i++) - first) % 7] = day;
		});

		return dow;
	};

	const renderDays = () => {
		const startOfMonth = viewDate.startOf('month');
		const endOfMonth = viewDate.endOf('month');

		const rows: React.ReactNode[][] = [[], [], [], [], [], []];

		let startDate = viewDate.subtract(1, 'months');
		startDate = startDate.date(startDate.daysInMonth()).startOf('week');

		const endDate = startDate.add(42, 'd');
		let i = 0;

		while (startDate.isBefore(endDate)) {
			const rowIndex = Math.floor(i / 7);
			rows[rowIndex]!.push(renderSingleDay(startDate, startOfMonth, endOfMonth));
			startDate = startDate.add(1, 'd');
			i++;
		}

		return rows.map((r, i) => (
			<tr key={`${endDate.month()}_${i}`}>{r}</tr>
		));
	};

	const renderSingleDay = (date: dayjs.Dayjs, startOfMonth: dayjs.Dayjs, endOfMonth: dayjs.Dayjs) => {
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
			dayProps, date, selectedDate
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

