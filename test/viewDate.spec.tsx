import { it, describe, expect } from 'vitest';
import dayjs from 'dayjs';
import utils from './testUtils';

describe('with initialViewDate', () => {
	it('date value', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			strDate = dayjs(date).format('MMMM YYYY'),
			component = utils.createDatetime({initialViewDate: date});
		expect(utils.getViewDateValue(component)).toEqual(strDate);
	});

	it('dayjs value', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			mDate = dayjs(date),
			strDate = mDate.format('MMMM YYYY'),
			component = utils.createDatetime({initialViewDate: mDate});
		expect(utils.getViewDateValue(component)).toEqual(strDate);
	});

	it('string value', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			mDate = dayjs(date),
			strDate = mDate.format('L') + ' ' + mDate.format('LT'),
			expectedStrDate = mDate.format('MMMM YYYY'),
			component = utils.createDatetime({initialViewDate: strDate});
		expect(utils.getViewDateValue(component)).toEqual(expectedStrDate);
	});

	it('UTC value from UTC string', () => {
		const date = new Date(2000, 0, 15, 2, 2, 2, 2),
			momentDateUTC = dayjs.utc(date),
			strDateUTC = momentDateUTC.format('L') + ' ' + momentDateUTC.format('LT'),
			expectedStrDate = momentDateUTC.format('MMMM YYYY'),
			component = utils.createDatetime({initialViewDate: strDateUTC, utc: true});
		expect(utils.getViewDateValue(component)).toEqual(expectedStrDate);
	});

	it('invalid string value', () => {
		const strDate = 'invalid string',
			expectedStrDate = dayjs().format('MMMM YYYY'),
			component = utils.createDatetime({initialViewDate: strDate});
		expect(utils.getViewDateValue(component)).toEqual(expectedStrDate);
	});

	it('invalid dayjs object', () => {
		const mDate = dayjs(null),
			expectedStrDate = dayjs().format('MMMM YYYY'),
			component = utils.createDatetime({initialViewDate: mDate});
		expect(utils.getViewDateValue(component)).toEqual(expectedStrDate);
	});
});

