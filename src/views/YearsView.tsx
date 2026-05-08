/** @internal */
import React from 'react';
import moment from 'moment';
import ViewNavigation from '../parts/ViewNavigation';

interface YearsViewProps {
	viewDate: moment.Moment;
	selectedDate?: moment.Moment;
	isValidDate?: (date: moment.Moment) => boolean;
	renderYear?: (props: any, year: number, selectedDate?: moment.Moment) => React.ReactNode;
	updateDate: (e: React.MouseEvent) => void;
	navigate: (amount: number, type: moment.unitOfTime.DurationConstructor) => void;
	showView: (view: string) => void;
}

export default function YearsView({
	viewDate,
	selectedDate,
	isValidDate,
	renderYear = (props, year) => <td key={year} {...props}>{year}</td>,
	updateDate,
	navigate,
	showView
}: YearsViewProps) {
	const getViewYear = () => {
		return Math.floor(viewDate.year() / 10) * 10;
	};

	const getSelectedYear = () => {
		return selectedDate ? selectedDate.year() : undefined;
	};

	const isDisabledYear = (year: number) => {
		if (!isValidDate) {
			return false;
		}

		const date = viewDate.clone().set({ year });
		let day = date.endOf('year').dayOfYear() + 1;

		while (day-- > 1) {
			if (isValidDate(date.dayOfYear(day))) {
				return false;
			}
		}

		return true;
	};

	const renderSingleYear = (year: number) => {
		const selectedYear = getSelectedYear();
		let className = 'rdtYear';
		let onClick: ((e: React.MouseEvent) => void) | undefined;

		if (isDisabledYear(year)) {
			className += ' rdtDisabled';
		} else {
			onClick = updateDate;
		}

		if (selectedYear === year) {
			className += ' rdtActive';
		}

		const props = { className, 'data-value': year, onClick };

		const element = renderYear(
			props,
			year,
			selectedDate ? selectedDate.clone() : undefined
		);
		return React.isValidElement(element) ? React.cloneElement(element, { key: year }) : element;
	};

	const renderNavigation = () => {
		const viewYear = getViewYear();
		return (
			<ViewNavigation
				onClickPrev={() => navigate(-10, 'years')}
				onClickSwitch={() => showView('years')}
				onClickNext={() => navigate(10, 'years')}
				switchContent={`${viewYear}-${viewYear + 9}`}
				switchColSpan={2}
			/>
		);
	};

	const renderYears = () => {
		const viewYear = getViewYear();
		const rows: React.ReactNode[][] = [[], [], []];

		for (let year = viewYear - 1; year < viewYear + 11; year++) {
			const rowIndex = Math.floor((year - viewYear + 1) / 4);
			// The original logic was:
			// if ( year < 3 ) return rows[0];
			// if ( year < 7 ) return rows[1];
			// return rows[2];
			// But year is year - viewYear.
			// Let's stick to the original getRow logic for exact compatibility.
			const relativeYear = year - viewYear;
			let rowIdx = 0;
			if (relativeYear < 3) rowIdx = 0;
			else if (relativeYear < 7) rowIdx = 1;
			else rowIdx = 2;
			
			rows[rowIdx].push(renderSingleYear(year));
		}

		return rows.map((years, i) => (
			<tr key={i}>{years}</tr>
		));
	};

	return (
		<div className="rdtYears">
			<table>
				<thead>
					{renderNavigation()}
				</thead>
			</table>
			<table>
				<tbody>
					{renderYears()}
				</tbody>
			</table>
		</div>
	);
}
