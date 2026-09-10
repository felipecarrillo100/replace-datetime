import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import dayjs from 'dayjs';
import Datetime from '../src/index';
import utils from './testUtils';

dayjs.locale('en');

describe('Datetime', () => {
	it('create component', () => {
		const component = utils.createDatetime({});

		expect(component).toBeDefined();
		expect(component.find('.rdt > .form-control').length).toEqual(1);
		expect(component.find('.rdt > .rdtPicker').length).toEqual(1);
	});

	it('initialViewMode=days: renders days, week days, month, year', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2);
		const component = utils.createDatetime({ initialViewMode: 'days', initialValue: date });
		utils.openDatepicker(component);

		// Month and year
		const switchBtn = component.container.querySelector('.rdtSwitch');
		expect(switchBtn?.textContent).toEqual('January 2000');

		// Week days
		const expectedWeekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
		const actualWeekdays = Array.from(component.container.querySelectorAll('.rdtDays .dow')).map((element) =>
			element.textContent
		);
		expect(actualWeekdays).toEqual(expectedWeekDays);

		// Dates
		// "Old" dates belonging to prev month
		const oldDatesIndexes = [0, 1, 2, 3, 4, 5];
		oldDatesIndexes.forEach((index) => {
			expect(utils.getNthDay(component, index).hasClass('rdtOld')).toBeTruthy();
		});

		// Dates belonging to current month
		for (let i = 6; i < 37; i++) {
			expect(utils.getNthDay(component, i).hasClass('rdtDay')).toBeTruthy();
			expect(utils.getNthDay(component, i).hasClass('rdtOld')).toBeFalsy();
			expect(utils.getNthDay(component, i).hasClass('rdtNew')).toBeFalsy();
		}

		// "New" dates belonging to next month
		const nextDatesIndexes = [37, 38, 39, 40, 41];
		nextDatesIndexes.forEach((index) => {
			expect(utils.getNthDay(component, index).hasClass('rdtNew')).toBeTruthy();
		});
	});

	it('switch from day view to time view and back', () => {
		const component = utils.createDatetime({});

		expect(utils.isDayView(component)).toBeTruthy();
		utils.clickOnElement(component.container.querySelector('.rdtTimeToggle'));
		expect(utils.isTimeView(component)).toBeTruthy();
		utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
		expect(utils.isDayView(component)).toBeTruthy();
	});

	it('persistent valid months going monthView->yearView->monthView', () => {
		const oldNow = Date.now;
		Date.now = vi.fn(() => new Date('2018-06-01T00:00:00').getTime());
		
		const dateBefore = '2018-06-01';
		const component = utils.createDatetime({
			initialViewMode: 'months',
			value: new Date(2018, 10, 10),
			isValidDate: (current: any) => current.isBefore(dayjs(dateBefore, 'YYYY-MM-DD'))
		});

		expect(utils.isMonthView(component)).toBeTruthy();
		expect(utils.getNthMonth(component, 4).hasClass('rdtDisabled')).toEqual(false);
		expect(utils.getNthMonth(component, 5).hasClass('rdtDisabled')).toEqual(true);

		// Go to year view
		utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
		expect(utils.isYearView(component)).toBeTruthy();

		expect(utils.getNthYear(component, 0).hasClass('rdtDisabled')).toEqual(false);
		expect(utils.getNthYear(component, 10).hasClass('rdtDisabled')).toEqual(true);

		utils.clickNthYear(component, 9);
		expect(utils.getNthMonth(component, 4).hasClass('rdtDisabled')).toEqual(false);
		expect(utils.getNthMonth(component, 5).hasClass('rdtDisabled')).toEqual(true);

		Date.now = oldNow;
	});

	it('step through views', () => {
		const component = utils.createDatetime({ initialViewMode: 'time' });

		expect(utils.isTimeView(component)).toBeTruthy();
		utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
		expect(utils.isDayView(component)).toBeTruthy();
		utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
		expect(utils.isMonthView(component)).toBeTruthy();
		utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
		expect(utils.isYearView(component)).toBeTruthy();
	});

	it('toggles calendar when open prop changes', () => {
		const component = utils.createDatetime({ open: false });
		expect(utils.isOpen(component)).toBeFalsy();
		component.setProps({ open: true });
		expect(utils.isOpen(component)).toBeTruthy();
		component.setProps({ open: false });
		expect(utils.isOpen(component)).toBeFalsy();
	});

	it('selectYear', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			component = utils.createDatetime({ initialViewMode: 'years', initialValue: date });
		expect(utils.isYearView(component)).toBeTruthy();
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2000-2009');

		// Click first year (1999)
		utils.clickOnElement(component.container.querySelectorAll('.rdtYear')[0]);
		expect(utils.isMonthView(component)).toBeTruthy();
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('1999');
	});

	it('increase decade', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			component = utils.createDatetime({ initialViewMode: 'years', initialValue: date });

		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2000-2009');
		utils.clickOnElement(component.container.querySelectorAll('.rdtNext span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2010-2019');
		utils.clickOnElement(component.container.querySelectorAll('.rdtNext span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2020-2029');
	});

	it('decrease decade', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			component = utils.createDatetime({ initialViewMode: 'years', initialValue: date });

		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2000-2009');
		utils.clickOnElement(component.container.querySelectorAll('.rdtPrev span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('1990-1999');
		utils.clickOnElement(component.container.querySelectorAll('.rdtPrev span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('1980-1989');
	});

	it('select month', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			component = utils.createDatetime({ initialViewMode: 'months', initialValue: date });

		expect(utils.isMonthView(component)).toBeTruthy();
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2000');
		// Click any month to enter day view
		utils.clickNthMonth(component, 1);
		expect(utils.isDayView(component)).toBeTruthy();
		expect(component.container.querySelector('.rdtSwitch')?.getAttribute('data-value')).toEqual('1');
	});

	it('increase year', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			component = utils.createDatetime({ initialViewMode: 'months', initialValue: date });

		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2000');
		utils.clickOnElement(component.container.querySelectorAll('.rdtNext span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2001');
		utils.clickOnElement(component.container.querySelectorAll('.rdtNext span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2002');
	});

	it('decrease year', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			component = utils.createDatetime({ initialViewMode: 'months', initialValue: date });

		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('2000');
		utils.clickOnElement(component.container.querySelectorAll('.rdtPrev span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('1999');
		utils.clickOnElement(component.container.querySelectorAll('.rdtPrev span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('1998');
	});

	it('increase month', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			component = utils.createDatetime({ initialValue: date });

		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('January 2000');
		expect(component.container.querySelector('.rdtSwitch')?.getAttribute('data-value')).toEqual('0');
		utils.clickOnElement(component.container.querySelectorAll('.rdtNext span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('February 2000');
		expect(component.container.querySelector('.rdtSwitch')?.getAttribute('data-value')).toEqual('1');
		utils.clickOnElement(component.container.querySelectorAll('.rdtNext span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('March 2000');
		expect(component.container.querySelector('.rdtSwitch')?.getAttribute('data-value')).toEqual('2');
	});

	it('decrease month', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			component = utils.createDatetime({ initialValue: date });

		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('January 2000');
		expect(component.container.querySelector('.rdtSwitch')?.getAttribute('data-value')).toEqual('0');
		utils.clickOnElement(component.container.querySelectorAll('.rdtPrev span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('December 1999');
		expect(component.container.querySelector('.rdtSwitch')?.getAttribute('data-value')).toEqual('11');
		utils.clickOnElement(component.container.querySelectorAll('.rdtPrev span')[0]);
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('November 1999');
		expect(component.container.querySelector('.rdtSwitch')?.getAttribute('data-value')).toEqual('10');
	});

	it('open picker', () => {
		const component = utils.createDatetime({});
		expect(utils.isOpen(component)).toBeFalsy();
		utils.openDatepicker(component);
		expect(utils.isOpen(component)).toBeTruthy();
	});

	it('click on day of the next month', () => {
		const component = utils.createDatetime({
			initialViewMode: 'days',
			initialValue: new Date(2019, 0, 1)
		});

		utils.openDatepicker(component);
		utils.clickClassItem(component, '.rdtNew', 1);

		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('February 2019');
	});

	it('click on day of the prev month', () => {
		const component = utils.createDatetime({
			initialViewMode: 'days',
			initialValue: new Date(2019, 0, 1)
		});

		utils.openDatepicker(component);
		utils.clickClassItem(component, '.rdtOld', 1);
		
		expect(component.container.querySelector('.rdtSwitch')?.textContent).toEqual('December 2018');
	});

	it('sets CSS class on selected item (day)', () => {
		const component = utils.createDatetime({ initialViewMode: 'days' });
		utils.openDatepicker(component);
		utils.clickNthDay(component, 13);
		expect(utils.getNthDay(component, 13).hasClass('rdtActive')).toBeTruthy();
	});

	it('sets CSS class on selected item (month)', () => {
		const component = utils.createDatetime({ initialViewMode: 'months', dateFormat: 'YYYY-MM' });
		utils.openDatepicker(component);
		utils.clickNthMonth(component, 4);
		expect(utils.getNthMonth(component, 4).hasClass('rdtActive')).toBeTruthy();
	});

	it('sets CSS class on selected item (year)', () => {
		const component = utils.createDatetime({ initialViewMode: 'years', dateFormat: 'YYYY' });
		utils.openDatepicker(component);
		utils.clickNthYear(component, 3);
		expect(utils.getNthYear(component, 3).hasClass('rdtActive')).toBeTruthy();
	});

	it('sets CSS class on days outside of month', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			prevMonthDaysIndexes = [0, 1, 2, 3, 4, 5],
			nextMonthDaysIndexes = [37, 38, 39, 40, 41],
			component = utils.createDatetime({ initialViewMode: 'days', initialValue: date });

		utils.openDatepicker(component);

		prevMonthDaysIndexes.forEach((index) => {
			expect(utils.getNthDay(component, index).hasClass('rdtOld')).toBeTruthy();
		});
		nextMonthDaysIndexes.forEach((index) => {
			expect(utils.getNthDay(component, index).hasClass('rdtNew')).toBeTruthy();
		});
	});

	it('selected day persists (in UI) when navigating to prev month', () => {
		const date = new Date(2000, 0, 3, 2, 2, 2, 2),
			component = utils.createDatetime({ initialViewMode: 'days', initialValue: date });

		utils.openDatepicker(component);
		expect(utils.getNthDay(component, 8).hasClass('rdtActive')).toBeTruthy();
		// Go to previous month
		utils.clickOnElement(component.container.querySelector('.rdtDays .rdtPrev span'));
		expect(utils.getNthDay(component, 36).hasClass('rdtActive')).toBeTruthy();
	});

	it('sets CSS class on today date', () => {
		const specificDate = dayjs(),
			day = specificDate.date(),
			component = utils.createDatetime({ initialValue: specificDate })
		;

		utils.openDatepicker(component);
		expect(component.container.querySelector('.rdtToday')?.textContent).toEqual( day+'' );
	});

	describe('with custom props', () => {
		it('input=false', () => {
			const component = utils.createDatetime({ input: false });
			expect(component.container.querySelectorAll('.rdt > .form-control').length).toEqual(0);
			expect(component.container.querySelectorAll('.rdt > .rdtPicker').length).toEqual(1);
		});

		it('dateFormat', () => {
			const date = new Date(2000, 0, 15, 2, 2, 2, 2),
				mDate = dayjs(date),
				component = utils.createDatetime({ value: date, dateFormat: 'M&D' });
			expect(utils.getInputValue(component)).toEqual(mDate.format('M&D LT'));
		});

		it('dateFormat=false', () => {
			const date = new Date(2000, 0, 15, 2, 2, 2, 2),
				mDate = dayjs(date),
				component = utils.createDatetime({ value: date, dateFormat: false });
			expect(utils.getInputValue(component)).toEqual(mDate.format('LT'));
			// Make sure time view is active
			expect(utils.isTimeView(component)).toBeTruthy();
			// Make sure the date toggle is not rendered
			expect(component.container.querySelectorAll('thead').length).toEqual(0);
		});

		it('timeFormat', () => {
			const date = new Date(2000, 0, 15, 2, 2, 2, 2),
				mDate = dayjs(date),
				format = 'HH:mm:ss:SSS',
				component = utils.createDatetime({ value: date, timeFormat: format });
			expect(utils.getInputValue(component)).toEqual(mDate.format('L ' + format));
		});

		it('timeFormat=false', () => {
			const date = new Date(2000, 0, 15, 2, 2, 2, 2),
				mDate = dayjs(date),
				component = utils.createDatetime({ value: date, timeFormat: false });
			expect(utils.getInputValue(component)).toEqual(mDate.format('L'));
			// Make sure day view is active
			expect(utils.isDayView(component)).toBeTruthy();
			// Make sure the time toggle is not rendered
			expect(component.container.querySelectorAll('.timeToggle').length).toEqual(0);
		});

		it('timeFormat with lowercase \'am\'', () => {
			const date = new Date(2000, 0, 15, 2, 2, 2, 2),
				format = 'HH:mm:ss:SSS a',
				component = utils.createDatetime({ value: date, timeFormat: format });
			expect(utils.getInputValue(component)).toEqual(expect.stringMatching(/.*am$/));
		});

		it('timeFormat with uppercase \'AM\'', () => {
			const date = new Date(2000, 0, 15, 2, 2, 2, 2),
				format = 'HH:mm:ss:SSS A',
				component = utils.createDatetime({ value: date, timeFormat: format });
			expect(utils.getInputValue(component)).toEqual(expect.stringMatching(/.*AM$/));
		});

		it('initialViewMode=years', () => {
			const component = utils.createDatetime({ initialViewMode: 'years' });
			expect(utils.isYearView(component)).toBeTruthy();
		});

		it('initialViewMode=months', () => {
			const component = utils.createDatetime({ initialViewMode: 'months' });
			expect(utils.isMonthView(component)).toBeTruthy();
		});

		it('initialViewMode=time', () => {
			const component = utils.createDatetime({ initialViewMode: 'time' });
			expect(utils.isTimeView(component)).toBeTruthy();
		});

		it('className -> type string', () => {
			const component = utils.createDatetime({ className: 'custom-class' });
			expect(component.container.querySelectorAll('.custom-class').length).toEqual(1);
		});

		it('className -> type string array', () => {
			const component = utils.createDatetime({ className: ['custom-class1', 'custom-class2'] });
			expect(component.container.querySelectorAll('.custom-class1').length).toEqual(1);
			expect(component.container.querySelectorAll('.custom-class2').length).toEqual(1);
		});

		it('inputProps', () => {
			const component = utils.createDatetime({
				inputProps: { className: 'custom-class', type: 'email', placeholder: 'custom-placeholder' }
			});
			expect(component.container.querySelectorAll('input.custom-class').length).toEqual(1);
			const input = component.container.querySelector('input') as HTMLInputElement;
			expect(input.type).toEqual('email');
			expect(input.placeholder).toEqual('custom-placeholder');
		});

		it('closeOnSelect=true', () => {
            vi.useFakeTimers();
			const component = utils.createDatetime({ closeOnSelect: true });

            vi.advanceTimersByTime(10);
            expect(utils.isOpen(component)).toBeFalsy();
            utils.openDatepicker(component);
            expect(utils.isOpen(component)).toBeTruthy();
            utils.clickNthDay(component, 2);
            expect(utils.isOpen(component)).toBeFalsy();
            vi.useRealTimers();
		});

		describe('initialValue of type', () => {
			it('date', () => {
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					momentDate = dayjs(date),
					strDate = momentDate.format('L') + ' ' + momentDate.format('LT'),
					component = utils.createDatetime({ initialValue: date });
				expect(utils.getInputValue(component)).toEqual(strDate);
			});

			it('dayjs', () => {
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					momentDate = dayjs(date),
					strDate = momentDate.format('L') + ' ' + momentDate.format('LT'),
					component = utils.createDatetime({ initialValue: momentDate });
				expect(utils.getInputValue(component)).toEqual(strDate);
			});

			it('string', () => {
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					momentDate = dayjs(date),
					strDate = momentDate.format('L') + ' ' + momentDate.format('LT'),
					component = utils.createDatetime({ initialValue: strDate });
				expect(utils.getInputValue(component)).toEqual(strDate);
			});
		});

		describe('timeFormat with', () => {
			it('milliseconds', () => {
				const component = utils.createDatetime({ initialViewMode: 'time', timeFormat: 'HH:mm:ss:SSS' });
				expect(component.container.querySelectorAll('.rdtCounter').length).toEqual(4);
			});

			it('seconds', () => {
				const component = utils.createDatetime({ initialViewMode: 'time', timeFormat: 'HH:mm:ss' });
				expect(component.container.querySelectorAll('.rdtCounter').length).toEqual(3);
			});

			it('minutes', () => {
				const component = utils.createDatetime({ initialViewMode: 'time', timeFormat: 'HH:mm' });
				expect(component.container.querySelectorAll('.rdtCounter').length).toEqual(2);
			});

			it('hours', () => {
				const component = utils.createDatetime({ initialViewMode: 'time', timeFormat: 'HH' });
				expect(component.container.querySelectorAll('.rdtCounter').length).toEqual(1);
			});
		});

		describe('being updated and should trigger update', () => {
			it('dateFormat -> value should change format', () => {
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					component = utils.createDatetime({
						dateFormat: 'YYYY-MM-DD', timeFormat: false, initialValue: date
					});

				const valueBefore = utils.getInputValue(component);
				component.setProps({ dateFormat: 'DD.MM.YYYY' });
				const valueAfter = utils.getInputValue(component);

				expect(valueBefore).not.toEqual(valueAfter);
			});

			it('UTC -> value should change format (true->false)', () => {
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					momentDate = dayjs(date),
					component = utils.createDatetime({ value: momentDate, utc: true });

				const valueBefore = utils.getInputValue(component);
				component.setProps({ utc: false });
				const valueAfter = utils.getInputValue(component);

				expect(valueBefore).not.toEqual(valueAfter);
			});

			it('UTC -> value should change format (false->true)', () => {
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					momentDate = dayjs(date),
					component = utils.createDatetime({ value: momentDate, utc: false });

				const valueBefore = utils.getInputValue(component);
				component.setProps({ utc: true });
				const valueAfter = utils.getInputValue(component);

				expect(valueBefore).not.toEqual(valueAfter);
			});

			it('locale -> picker should change language (initialViewMode=days)', () => {
				const component = utils.createDatetime({ initialViewMode: 'days', locale: 'en' });
				const weekdaysBefore = Array.from(component.container.querySelectorAll('.rdtDays .dow')).map( element =>
					element.textContent
				);

				component.setProps({ locale: 'nl' });

				const weekdaysAfter = Array.from(component.container.querySelectorAll('.rdtDays .dow')).map((element) =>
					element.textContent
				);

				expect(weekdaysBefore).not.toEqual(weekdaysAfter);
			});

			it('locale -> picker should change language (initialViewMode=months)', () => {
				const component = utils.createDatetime({ initialViewMode: 'months', locale: 'nl' }),
					monthsBefore = [utils.getNthMonth(component, 2).textContent, utils.getNthMonth(component, 4).textContent];

				component.setProps({ locale: 'sv' });
				const monthsAfter = [utils.getNthMonth(component, 2).textContent, utils.getNthMonth(component, 4).textContent];

				expect(monthsBefore).not.toEqual(monthsAfter);
			});
		});
	});

	describe('event listeners', () => {
		describe('onClose', () => {
			it('when selecting a date', () => {
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					onCloseFn = vi.fn(),
					component = utils.createDatetime({ value: date, onClose: onCloseFn, closeOnSelect: true });

				utils.openDatepicker(component);
				utils.clickNthDay(component, 2);
				expect(onCloseFn).toHaveBeenCalledTimes(1);
			});

			it('when selecting date (value=null and closeOnSelect=true)', () => {
				const onCloseFn = vi.fn(),
					component = utils.createDatetime({ value: null, onClose: onCloseFn, closeOnSelect: true });

				utils.openDatepicker(component);
				utils.clickNthDay(component, 2);
				expect(onCloseFn).toHaveBeenCalledTimes(1);
			});

			it('when selecting date (value=null and closeOnSelect=false)', () => {
				const onCloseFn = vi.fn(),
					component = utils.createDatetime({ value: null, onClose: onCloseFn, closeOnSelect: false });

				utils.openDatepicker(component);
				utils.clickNthDay(component, 2);
				expect(onCloseFn).not.toHaveBeenCalled();
			});
		});

		it('onOpen when opening datepicker', () => {
			const date = new Date(2000, 0, 15, 2, 2, 2, 2),
				onOpenFn = vi.fn(),
				component = utils.createDatetime({ value: date, onOpen: onOpenFn });

			utils.openDatepicker(component);
			expect(onOpenFn).toHaveBeenCalledTimes(1);
		});

		describe('onNavigate', () => {
			it('when switch from days to time view mode', () => {
				const onNavigate = vi.fn();
				const component = utils.createDatetime({ onNavigate });
				expect(utils.isDayView(component)).toBeTruthy();
				utils.clickOnElement(component.container.querySelector('.rdtTimeToggle'));
				expect(utils.isTimeView(component)).toBeTruthy();
				expect(onNavigate).toHaveBeenCalledWith('time');
			});

			it('when switch from time to days view mode', () => {
				const onNavigate = vi.fn();
				const component = utils.createDatetime({ initialViewMode: 'time', onNavigate });
				expect(utils.isTimeView(component)).toBeTruthy();
				utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
				expect(utils.isDayView(component)).toBeTruthy();
				expect(onNavigate).toHaveBeenCalledWith('days');
			});

			it('when switch from days to months view mode', () => {
				const onNavigate = vi.fn();
				const component = utils.createDatetime({ onNavigate });
				expect(utils.isDayView(component)).toBeTruthy();
				utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
				expect(utils.isMonthView(component)).toBeTruthy();
				expect(onNavigate).toHaveBeenCalledWith('months');
			});

			it('when switch from months to years view mode', () => {
				const onNavigate = vi.fn();
				const component = utils.createDatetime({ initialViewMode: 'months', onNavigate });
				expect(utils.isMonthView(component)).toBeTruthy();
				utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
				expect(utils.isYearView(component)).toBeTruthy();
				expect(onNavigate).toHaveBeenCalledWith('years');
			});

			it('only when switch from years to months view mode', () => {
				const onNavigate = vi.fn();
				const component = utils.createDatetime({ initialViewMode: 'years', onNavigate });
				expect(utils.isYearView(component)).toBeTruthy();
				utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
				expect(utils.isYearView(component)).toBeTruthy();
				utils.clickNthYear(component, 2);
				expect(utils.isMonthView(component)).toBeTruthy();
				expect(onNavigate).toHaveBeenCalledWith('months');
			});

			it('when switch from months to days view mode', () => {
				const onNavigate = vi.fn();
				const component = utils.createDatetime({ initialViewMode: 'months', onNavigate });
				expect(utils.isMonthView(component)).toBeTruthy();
				utils.clickNthMonth(component, 2);
				expect(utils.isDayView(component)).toBeTruthy();
				expect(onNavigate).toHaveBeenCalledWith('days');
			});

			it('when onBeforeNavigate is defined', () => {
				const date = dayjs( new Date(2000, 0, 15, 2, 2, 2, 2) );
				const onNavigate = vi.fn();
				const onBeforeNavigate = vi.fn((next) => next);
				const component = utils.createDatetime(
					{ value: date, initialViewMode: 'months', onNavigate, onBeforeNavigate }
				);

				expect(utils.isMonthView(component)).toBeTruthy();
				utils.clickNthMonth(component, 2);
				expect(utils.isDayView(component)).toBeTruthy();
				expect(onBeforeNavigate).toHaveBeenCalled();
				expect(onNavigate).toHaveBeenCalledWith('days');
			});
			
			it('prevent navigation using onBeforeNavigate', () => {
				const date = dayjs( new Date(2000, 0, 15, 2, 2, 2, 2) );
				const onNavigate = vi.fn();
				const onBeforeNavigate = vi.fn(() => false as any);

				const component = utils.createDatetime(
					{ value: date, initialViewMode: 'months', onNavigate, onBeforeNavigate }
				);

				expect(utils.isMonthView(component)).toBeTruthy();
				utils.clickOnElement(component.container.querySelector('.rdtSwitch'));
				expect(utils.isMonthView(component)).toBeTruthy();
				expect(utils.isYearView(component)).toBeFalsy();
				expect(onNavigate).not.toHaveBeenCalled();
			});

			it('go to a different screen when navigating using onBeforeNavigate', () => {
				const onNavigate = vi.fn();
				const onBeforeNavigate = vi.fn(() => 'years');
				const component = utils.createDatetime(
					{ initialViewMode: 'months', onNavigate, onBeforeNavigate }
				);

				expect(utils.isMonthView(component)).toBeTruthy();
				utils.clickNthMonth(component, 2);
				expect(utils.isYearView(component)).toBeTruthy();
				expect(onNavigate).toHaveBeenCalledWith('years');
			});
		});

		describe('time counters commit on pointer release', () => {
			// Regression: setTime() used to index the Day.js object with the plural
			// unit names the time view passes ('hours', 'minutes', …). Day.js only
			// defines the singular setters, so every counter threw
			// "date[type] is not a function" and the time was never applied.
			it('increasing the hour applies the new time', () => {
				const onChange = vi.fn();
				const component = utils.createDatetime({
					initialValue: new Date(2000, 0, 15, 10, 30, 45),
					initialViewMode: 'time',
					timeFormat: 'HH:mm:ss',
					onChange
				});

				utils.increaseHour(component);
				utils.releaseCounter();

				expect(onChange).toHaveBeenCalledTimes(1);
				expect(onChange.mock.calls[0]![0].hour()).toEqual(11);
				expect(utils.getHours(component)).toEqual('11');
			});

			it('increasing the minute applies the new time', () => {
				const onChange = vi.fn();
				const component = utils.createDatetime({
					initialValue: new Date(2000, 0, 15, 10, 30, 45),
					initialViewMode: 'time',
					timeFormat: 'HH:mm:ss',
					onChange
				});

				utils.increaseMinute(component);
				utils.releaseCounter();

				expect(onChange.mock.calls[0]![0].minute()).toEqual(31);
			});

			it('decreasing the second applies the new time', () => {
				const onChange = vi.fn();
				const component = utils.createDatetime({
					initialValue: new Date(2000, 0, 15, 10, 30, 45),
					initialViewMode: 'time',
					timeFormat: 'HH:mm:ss',
					onChange
				});

				utils.decreaseSecond(component);
				utils.releaseCounter();

				expect(onChange.mock.calls[0]![0].second()).toEqual(44);
			});

			it('the AM/PM toggle applies the new time', () => {
				const onChange = vi.fn();
				const component = utils.createDatetime({
					initialValue: new Date(2000, 0, 15, 10, 30),
					initialViewMode: 'time',
					timeFormat: 'h:mm A',
					onChange
				});

				// The AM/PM cell commits immediately via toggleDayPart, no release needed.
				const btns = component.container.querySelectorAll('.rdtCounter .rdtBtn');
				fireEvent.pointerDown(btns[btns.length - 2]!);

				expect(onChange).toHaveBeenCalledTimes(1);
				expect(onChange.mock.calls[0]![0].hour()).toEqual(22);
			});
		});

		describe('controlled mode (props.value)', () => {
			// Regression: the only effect watching props.value used to sync viewDate
			// alone, leaving selectedDate and inputValue stale. A parent that changed
			// `value` saw old text in the input and an old .rdtActive highlight.
			it('a new value from the parent updates the input', () => {
				const component = utils.createDatetime({
					value: dayjs('2025-06-15'),
					dateFormat: 'YYYY-MM-DD',
					timeFormat: false
				});
				expect(utils.getInputValue(component)).toEqual('2025-06-15');

				component.setProps({
					value: dayjs('2030-01-02'),
					dateFormat: 'YYYY-MM-DD',
					timeFormat: false
				});
				expect(utils.getInputValue(component)).toEqual('2030-01-02');
			});

			it('a new value from the parent moves the selected day', () => {
				const props = { dateFormat: 'YYYY-MM-DD', timeFormat: false, input: false };
				const component = utils.createDatetime({ ...props, value: dayjs('2025-06-15') });

				expect(component.find('.rdtDay.rdtActive').length).toEqual(1);
				expect(component.find('.rdtDay.rdtActive')[0]!.getAttribute('data-value')).toEqual('15');

				component.setProps({ ...props, value: dayjs('2025-06-20') });
				expect(component.find('.rdtDay.rdtActive')[0]!.getAttribute('data-value')).toEqual('20');
			});

			// The sync must compare by value, not identity. `value={dayjs(x)}` is a
			// brand-new object on every parent render, so an identity-keyed effect
			// would fire on unrelated re-renders and discard what the user typed.
			it('an equal-but-new value object does not clobber typing in progress', () => {
				const props = { dateFormat: 'YYYY-MM-DD', timeFormat: false };
				const component = utils.createDatetime({ ...props, value: dayjs('2025-06-15') });

				const input = component.container.querySelector('.form-control')!;
				fireEvent.change(input, { target: { value: '2025-06-1' } });
				expect(utils.getInputValue(component)).toEqual('2025-06-1');

				// Parent re-renders for an unrelated reason, rebuilding an equal value.
				component.setProps({ ...props, value: dayjs('2025-06-15') });
				expect(utils.getInputValue(component)).toEqual('2025-06-1');
			});

			it('value="" clears the input and the selection', () => {
				const props = { dateFormat: 'YYYY-MM-DD', timeFormat: false, input: false };
				const component = utils.createDatetime({ ...props, value: dayjs('2025-06-15') });
				expect(component.find('.rdtDay.rdtActive').length).toEqual(1);

				component.setProps({ ...props, value: '' });
				expect(component.find('.rdtDay.rdtActive').length).toEqual(0);
			});

			it('an unparseable string value is shown as typed', () => {
				const props = { dateFormat: 'YYYY-MM-DD', timeFormat: false };
				const component = utils.createDatetime({ ...props, value: dayjs('2025-06-15') });

				component.setProps({ ...props, value: 'not a date' });
				expect(utils.getInputValue(component)).toEqual('not a date');
				expect(component.instance().state.selectedDate).toBeUndefined();
			});

			// value={null} means "uncontrolled" (the two onClose tests below rely on
			// it), whereas value="" is a controlled *empty* value. The predicate is
			// what gates setTime's internal writes, so probe it through a counter:
			// updateDate is unguarded by design, so day clicks cannot tell them apart.
			const pressHour = (component: any) => {
				fireEvent.pointerDown(component.container.querySelectorAll('.rdtCounter .rdtBtn')[0]!);
				fireEvent.pointerUp(document.body);
			};

			it('value={null} leaves the picker uncontrolled', () => {
				const component = utils.createDatetime({
					value: null,
					input: false,
					initialViewMode: 'time',
					timeFormat: 'HH:mm',
					initialValue: new Date(2000, 0, 15, 10, 30)
				});

				pressHour(component);
				expect(component.instance().state.selectedDate.hour()).toEqual(11);
			});

			it('value="" leaves the picker controlled', () => {
				const onChange = vi.fn();
				const component = utils.createDatetime({
					value: '',
					input: false,
					initialViewMode: 'time',
					timeFormat: 'HH:mm',
					initialViewDate: new Date(2000, 0, 15, 10, 30),
					onChange
				});

				pressHour(component);

				// onChange still reports the intent, but no internal state is written:
				// a controlled picker waits for the host to send a new value back.
				expect(onChange).toHaveBeenCalledTimes(1);
				expect(onChange.mock.calls[0]![0].hour()).toEqual(11);
				expect(component.instance().state.selectedDate).toBeUndefined();
			});
		});

		describe('time counters in controlled mode', () => {
			// The two defects compound: with the setter fixed but props.value not
			// synced, TimeView reads `selectedDate || viewDate` and the stale
			// selectedDate wins — so a controlled counter advanced one step and then
			// wedged, re-applying the same value forever.
			const ControlledDatetime = (props: any) => {
				const [value, setValue] = React.useState<any>(props.initial);
				return (
					<Datetime
						{...props}
						value={value}
						onChange={(v: any) => {
							setValue(v);
							props.onChange?.(v);
						}}
					/>
				);
			};

			it('the hour counter advances on every press, not just the first', () => {
				const component = render(
					<ControlledDatetime
						initial={dayjs('2000-01-15T10:30:00')}
						input={false}
						initialViewMode="time"
						timeFormat="HH:mm"
					/>
				);

				const hourUp = () => {
					fireEvent.pointerDown(component.container.querySelectorAll('.rdtCounter .rdtBtn')[0]!);
					fireEvent.pointerUp(document.body);
				};
				const hours = () => component.container.querySelector('.rdtCounter .rdtCount')!.textContent;

				hourUp();
				expect(hours()).toEqual('11');

				hourUp();
				expect(hours()).toEqual('12');
			});

			it('the AM/PM toggle round-trips', () => {
				const onChange = vi.fn();
				const component = render(
					<ControlledDatetime
						initial={dayjs('2000-01-15T10:30:00')}
						input={false}
						initialViewMode="time"
						timeFormat="h:mm A"
						onChange={onChange}
					/>
				);

				const toggle = () => {
					const btns = component.container.querySelectorAll('.rdtCounter .rdtBtn');
					fireEvent.pointerDown(btns[btns.length - 2]!);
				};

				toggle();
				expect(onChange.mock.calls[0]![0].hour()).toEqual(22);

				toggle();
				expect(onChange.mock.calls[1]![0].hour()).toEqual(10);
			});
		});

		describe('isValidDate', () => {
			// MonthsView and YearsView skip their per-day scan entirely when
			// isValidDate is absent. The picker used to substitute `() => true`,
			// which kept the guard from ever firing and made every month/year cell
			// build throwaway Day.js objects to reach a foregone conclusion.
			const countDayOfYearCalls = (props: any) => {
				const proto: any = Object.getPrototypeOf(dayjs());
				const original = proto.dayOfYear;
				let calls = 0;
				proto.dayOfYear = function (...args: any[]) {
					calls++;
					return original.apply(this, args);
				};
				try {
					utils.createDatetime({ input: false, initialViewMode: 'years', ...props });
				} finally {
					proto.dayOfYear = original;
				}
				return calls;
			};

			it('is not scanned for when the prop is absent', () => {
				expect(countDayOfYearCalls({})).toEqual(0);
			});

			it('is scanned for when the prop is supplied', () => {
				expect(countDayOfYearCalls({ isValidDate: () => true })).toBeGreaterThan(0);
			});

			it('still disables years and months when supplied', () => {
				const component = utils.createDatetime({
					input: false,
					initialViewMode: 'years',
					initialValue: new Date(2000, 0, 15),
					isValidDate: (d: any) => d.year() !== 2003
				});

				// The decade grid runs 1999..2010, so 2003 sits at index 4.
				expect(utils.getNthYear(component, 4).hasClass('rdtDisabled')).toEqual(true);
				expect(utils.getNthYear(component, 5).hasClass('rdtDisabled')).toEqual(false);
			});
		});

		describe('timeConstraints', () => {
			const pressMinuteUp = (component: any) => {
				fireEvent.pointerDown(component.container.querySelectorAll('.rdtCounter .rdtBtn')[2]!);
				fireEvent.pointerUp(document.body);
			};

			it('applies a custom step', () => {
				const onChange = vi.fn();
				const component = utils.createDatetime({
					input: false,
					initialViewMode: 'time',
					timeFormat: 'HH:mm',
					initialValue: new Date(2000, 0, 15, 10, 30),
					timeConstraints: { minutes: { step: 15 } },
					onChange
				});

				pressMinuteUp(component);
				expect(onChange.mock.calls[0]![0].minute()).toEqual(45);
			});

			it('leaves unspecified units and fields on their defaults', () => {
				const onChange = vi.fn();
				const component = utils.createDatetime({
					input: false,
					initialViewMode: 'time',
					timeFormat: 'HH:mm',
					initialValue: new Date(2000, 0, 15, 10, 30),
					// Only minutes.step is set: hours keeps step 1, minutes keeps max 59.
					timeConstraints: { minutes: { step: 15 } },
					onChange
				});

				fireEvent.pointerDown(component.container.querySelectorAll('.rdtCounter .rdtBtn')[0]!);
				fireEvent.pointerUp(document.body);
				expect(onChange.mock.calls[0]![0].hour()).toEqual(11);
			});
		});

		describe('onChange', () => {
			it('trigger only when last selection type is selected', () => {
				const onChange = vi.fn();
				const component = utils.createDatetime({ initialViewMode: 'years', onChange });

				utils.openDatepicker(component);

				utils.clickNthYear(component, 2);
				expect(onChange).not.toHaveBeenCalled();

				utils.clickNthMonth(component, 2);
				expect(onChange).not.toHaveBeenCalled();

				utils.clickNthDay(component, 2);
				expect(onChange).toHaveBeenCalled();
			});

			it('when selecting date', () => {
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					mDate = dayjs(date);
                let captured: any = null;
				const component = utils.createDatetime({ initialValue: date, onChange: (selected: any) => {
					captured = selected;
				}});

				utils.clickNthDay(component, 7);
                expect(captured.date()).toEqual(2);
                expect(captured.month()).toEqual(mDate.month());
                expect(captured.year()).toEqual(mDate.year());
			});

			it('when selecting multiple date in a row', () => {
				let i = 0;
				const date = new Date(2000, 0, 15, 2, 2, 2, 2),
					mDate = dayjs(date);
                let captured: any = null;
				const component = utils.createDatetime({ initialValue: date, onChange: (selected: any) => {
					i++;
                    captured = selected;
				}});

				utils.clickNthDay(component, 7);
				utils.clickNthDay(component, 8);
				utils.clickNthDay(component, 9);
                expect(i).toBe(3);
                expect(captured.date()).toEqual(4);
                expect(captured.month()).toEqual(mDate.month());
                expect(captured.year()).toEqual(mDate.year());
			});
		});
    });
});
