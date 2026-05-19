import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
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
