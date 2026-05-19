import { it, describe, expect, vi } from 'vitest';
import Datetime from '../src/index';
import { render } from '@testing-library/react';

// Mock date to get rid of time as a factor to make tests deterministic
// 2016-12-21T23:36:07.071Z
const mockNow = 1482363367071;
vi.useFakeTimers();
vi.setSystemTime(mockNow);

it('everything default: renders correctly', () => {
	const { asFragment } = render(<Datetime />);
	expect(asFragment()).toMatchSnapshot();
});

it('value: set to arbitrary value', () => {
	const { asFragment } = render(<Datetime initialValue={new Date(mockNow)} />);
	expect(asFragment()).toMatchSnapshot();
});

it('defaultValue: set to arbitrary value', () => {
	const { asFragment } = render(<Datetime initialValue={new Date(mockNow)} />);
	expect(asFragment()).toMatchSnapshot();
});

describe('dateFormat', () => {
	it('set to true', () => {
		const { asFragment } = render(<Datetime dateFormat={true} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('set to false', () => {
		const { asFragment } = render(<Datetime dateFormat={false} />);
		expect(asFragment()).toMatchSnapshot();
	});
});

describe('timeFormat', () => {
	it('set to true', () => {
		const { asFragment } = render(<Datetime timeFormat={true} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('set to false', () => {
		const { asFragment } = render(<Datetime timeFormat={false} />);
		expect(asFragment()).toMatchSnapshot();
	});
});

describe('input', () => {
	it('input: set to true', () => {
		const { asFragment } = render(<Datetime input={true} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('input: set to false', () => {
		const { asFragment } = render(<Datetime input={false} />);
		expect(asFragment()).toMatchSnapshot();
	});
});

describe('open', () => {
	it('set to true', () => {
		const { asFragment } = render(<Datetime open={true} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('set to false', () => {
		const { asFragment } = render(<Datetime open={false} />);
		expect(asFragment()).toMatchSnapshot();
	});
});

describe('viewMode', () => {
	it('set to days', () => {
		const { asFragment } = render(<Datetime initialViewMode={'days'} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('set to months', () => {
		const { asFragment } = render(<Datetime initialViewMode={'months'} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('set to years', () => {
		const { asFragment } = render(<Datetime initialViewMode={'years'} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('set to time', () => {
		const { asFragment } = render(<Datetime initialViewMode={'time'} />);
		expect(asFragment()).toMatchSnapshot();
	});
});

it('className: set to arbitraty value', () => {
	const { asFragment } = render(<Datetime className={'arbitrary-value'} />);
	expect(asFragment()).toMatchSnapshot();
});

describe('inputProps', () => {
	it('with placeholder specified', () => {
		const { asFragment } = render(<Datetime inputProps={{ placeholder: 'arbitrary-placeholder' } as any} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('with disabled specified', () => {
		const { asFragment } = render(<Datetime inputProps={{ disabled: true } as any} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('with required specified', () => {
		const { asFragment } = render(<Datetime inputProps={{ required: true } as any} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('with name specified', () => {
		const { asFragment } = render(<Datetime inputProps={{ name: 'arbitrary-name' } as any} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('with className specified', () => {
		const { asFragment } = render(<Datetime inputProps={{ className: 'arbitrary-className' } as any} />);
		expect(asFragment()).toMatchSnapshot();
	});
});

it('isValidDate: only valid if after yesterday', () => {
	const yesterday = (Datetime as any).dayjs().subtract(1, 'day');
	const valid = (current: any) => current.isAfter(yesterday);
	const { asFragment } = render(<Datetime isValidDate={ valid } />);
	expect(asFragment()).toMatchSnapshot();
});

it('renderDay: specified', () => {
	const renderDay = (props: any, currentDate: any) => <td {...props}>{ '0' + currentDate.date() }</td>;
	const { asFragment } = render(<Datetime renderDay={renderDay} />);
	expect(asFragment()).toMatchSnapshot();
});

it('renderMonth: specified', () => {
	const renderMonth = (props: any, month: number) => <td {...props}>{ '0' + month }</td>;
	const { asFragment } = render(<Datetime renderMonth={renderMonth} />);
	expect(asFragment()).toMatchSnapshot();
});

it('renderYear: specified', () => {
	const renderYear = (props: any, year: number) => <td {...props}>{ '0' + year }</td>;
	const { asFragment } = render(<Datetime renderYear={renderYear} />);
	expect(asFragment()).toMatchSnapshot();
});
