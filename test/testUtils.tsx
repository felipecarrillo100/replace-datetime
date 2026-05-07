import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Datetime from '../src/index';

export const createDatetime = (props: any) => {
	const ref = React.createRef<any>();
	const result = render(<Datetime {...props} ref={ref} />);
	return {
		...result,
		// Mock Enzyme's find for easier migration
		find: (selector: string) => result.container.querySelectorAll(selector),
		// Mock Enzyme's setProps
		setProps: (props: any) => result.rerender(<Datetime {...props} ref={ref} />),
		// Mock Enzyme's update (usually not needed in RTL)
		update: () => {},
		// Mock Enzyme's instance
		instance: () => ref.current,
	};
};

export const openDatepicker = (datetime: any) => {
	const input = datetime.container.querySelector('.form-control');
	if (input) fireEvent.focus(input);
};

export const openDatepickerByClick = (datetime: any) => {
	const input = datetime.container.querySelector('.form-control');
	if (input) fireEvent.click(input);
};

export const clickOnElement = (element: Element | NodeList | any) => {
	const target = element instanceof NodeList ? element[0] : element;
	if (target) fireEvent.click(target as Element);
};

export const clickNthDay = (datetime: any, n: number) => {
	const days = datetime.container.querySelectorAll('.rdtDay');
	if (days[n]) fireEvent.click(days[n]);
};

export const clickNthMonth = (datetime: any, n: number) => {
	const months = datetime.container.querySelectorAll('.rdtMonth');
	if (months[n]) fireEvent.click(months[n]);
};

export const clickNthYear = (datetime: any, n: number) => {
	const years = datetime.container.querySelectorAll('.rdtYear');
	if (years[n]) fireEvent.click(years[n]);
};

export const clickClassItem = (datetime: any, cn: string, n: number) => {
	const items = datetime.container.querySelectorAll(cn);
	if (items[n]) fireEvent.click(items[n]);
};

export const isOpen = (datetime: any) => {
	return datetime.container.querySelectorAll('.rdt.rdtOpen').length > 0;
};

export const isDayView = (datetime: any) => {
	return datetime.container.querySelectorAll('.rdtPicker .rdtDays').length > 0;
};

export const isMonthView = (datetime: any) => {
	return datetime.container.querySelectorAll('.rdtPicker .rdtMonths').length > 0;
};

export const isYearView = (datetime: any) => {
	return datetime.container.querySelectorAll('.rdtPicker .rdtYears').length > 0;
};

export const isTimeView = (datetime: any) => {
	return datetime.container.querySelectorAll('.rdtPicker .rdtTime').length > 0;
};

export const increaseHour = (datetime: any) => {
	const btns = datetime.container.querySelectorAll('.rdtCounter .rdtBtn');
	if (btns[0]) fireEvent.mouseDown(btns[0]);
};

export const decreaseHour = (datetime: any) => {
	const btns = datetime.container.querySelectorAll('.rdtCounter .rdtBtn');
	if (btns[1]) fireEvent.mouseDown(btns[1]);
};

export const increaseMinute = (datetime: any) => {
	const btns = datetime.container.querySelectorAll('.rdtCounter .rdtBtn');
	if (btns[2]) fireEvent.mouseDown(btns[2]);
};

export const decreaseMinute = (datetime: any) => {
	const btns = datetime.container.querySelectorAll('.rdtCounter .rdtBtn');
	if (btns[3]) fireEvent.mouseDown(btns[3]);
};

export const increaseSecond = (datetime: any) => {
	const btns = datetime.container.querySelectorAll('.rdtCounter .rdtBtn');
	if (btns[4]) fireEvent.mouseDown(btns[4]);
};

export const decreaseSecond = (datetime: any) => {
	const btns = datetime.container.querySelectorAll('.rdtCounter .rdtBtn');
	if (btns[5]) fireEvent.mouseDown(btns[5]);
};

export const getNthDay = (datetime: any, n: number) => {
	const days = datetime.container.querySelectorAll('.rdtDay');
	const day = days[n];
	if (day) {
		// Mock Enzyme's hasClass
		day.hasClass = (cn: string) => day.classList.contains(cn);
		day.text = () => day.textContent;
	}
	return day;
};

export const getNthMonth = (datetime: any, n: number) => {
	const months = datetime.container.querySelectorAll('.rdtMonth');
	const month = months[n];
	if (month) {
		month.hasClass = (cn: string) => month.classList.contains(cn);
		month.text = () => month.textContent;
	}
	return month;
};

export const getNthYear = (datetime: any, n: number) => {
	const years = datetime.container.querySelectorAll('.rdtYear');
	const year = years[n];
	if (year) {
		year.hasClass = (cn: string) => year.classList.contains(cn);
		year.text = () => year.textContent;
	}
	return year;
};

export const getHours = (datetime: any) => {
	const counts = datetime.container.querySelectorAll('.rdtCount');
	return counts[0]?.textContent;
};

export const getMinutes = (datetime: any) => {
	const counts = datetime.container.querySelectorAll('.rdtCount');
	return counts[1]?.textContent;
};

export const getSeconds = (datetime: any) => {
	const counts = datetime.container.querySelectorAll('.rdtCount');
	return counts[2]?.textContent;
};

export const getInputValue = (datetime: any) => {
	const input = datetime.container.querySelector('.rdt > .form-control');
	return input?.value;
};

export const getViewDateValue = (datetime: any) => {
	const sw = datetime.container.querySelector('.rdtSwitch');
	return sw?.innerHTML;
};

export default {
	createDatetime,
	createDatetimeShallow: createDatetime, // No shallow in RTL
	openDatepicker,
	openDatepickerByClick,
	clickOnElement,
	clickNthDay,
	clickNthMonth,
	clickNthYear,
	clickClassItem,
	isOpen,
	isDayView,
	isMonthView,
	isYearView,
	isTimeView,
	increaseHour,
	decreaseHour,
	increaseMinute,
	decreaseMinute,
	increaseSecond,
	decreaseSecond,
	getNthDay,
	getNthMonth,
	getNthYear,
	getHours,
	getMinutes,
	getSeconds,
	getInputValue,
	getViewDateValue,
};
