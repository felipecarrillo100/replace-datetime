/** @internal */
import React from 'react';
import dayjs from 'dayjs';
import ViewNavigation from '../parts/ViewNavigation';

interface MonthsViewProps {
	viewDate: dayjs.Dayjs;
	selectedDate?: dayjs.Dayjs;
	isValidDate?: (date: dayjs.Dayjs) => boolean;
	renderMonth?: (props: any, month: number, year: number, selectedDate?: dayjs.Dayjs) => React.ReactNode;
	updateDate: (e: React.MouseEvent) => void;
	navigate: (amount: number, type: any) => void;
	showView: (view: string) => void;
}

export default function MonthsView({
	viewDate,
	selectedDate,
	isValidDate,
	renderMonth,
	updateDate,
	navigate,
	showView
}: MonthsViewProps) {
	const renderNavigation = () => {
		const year = viewDate.year();

		return (
			<ViewNavigation
				onClickPrev={() => navigate(-1, 'years')}
				onClickSwitch={() => showView('years')}
				onClickNext={() => navigate(1, 'years')}
				switchContent={year}
				switchColSpan={2}
			/>
		);
	};

	const isDisabledMonth = (month: number) => {
		if (!isValidDate) {
			return false;
		}

		const date = viewDate.set('month', month);
		let day = date.endOf('month').date() + 1;

		while (day-- > 1) {
			if (isValidDate(date.date(day))) {
				return false;
			}
		}
		return true;
	};

	const getMonthText = (month: number) => {
		const localMoment = viewDate.month(month);
		const monthStr = localMoment.localeData().monthsShort(localMoment) as unknown as string;

		return capitalize(monthStr.substring(0, 3));
	};

	const renderSingleMonth = (month: number) => {
		let className = 'rdtMonth';
		let onClick: ((e: React.MouseEvent) => void) | undefined;

		if (isDisabledMonth(month)) {
			className += ' rdtDisabled';
		} else {
			onClick = updateDate;
		}

		if (selectedDate && selectedDate.year() === viewDate.year() && selectedDate.month() === month) {
			className += ' rdtActive';
		}

		const props = { className, 'data-value': month, onClick };

		if (renderMonth) {
			const element = renderMonth(
				props,
				month,
				viewDate.year(),
				selectedDate
			);
			return React.isValidElement(element) ? React.cloneElement(element, { key: month }) : element;
		}

		return (
			<td key={month} {...props}>
				{getMonthText(month)}
			</td>
		);
	};

	const renderMonths = () => {
		const rows: React.ReactNode[][] = [[], [], []];

		for (let month = 0; month < 12; month++) {
			const rowIndex = Math.floor(month / 4);
			rows[rowIndex]!.push(renderSingleMonth(month));
		}

		return rows.map((months, i) => (
			<tr key={i}>{months}</tr>
		));
	};

	return (
		<div className="rdtMonths">
			<table>
				<thead>
					{renderNavigation()}
				</thead>
			</table>
			<table>
				<tbody>
					{renderMonths()}
				</tbody>
			</table>
		</div>
	);
}

function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

