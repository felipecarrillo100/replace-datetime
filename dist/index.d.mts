import React from 'react';
import moment from 'moment';

type ViewMode = 'years' | 'months' | 'days' | 'time';
interface DateTimeProps {
    value?: moment.Moment | Date | string;
    initialValue?: moment.Moment | Date | string;
    initialViewDate?: moment.Moment | Date | string;
    initialViewMode?: ViewMode;
    onOpen?: () => void;
    onClose?: (value: moment.Moment | string) => void;
    onChange?: (value: moment.Moment | string) => void;
    onNavigate?: (view: ViewMode) => void;
    onBeforeNavigate?: (nextView: ViewMode, currentView: ViewMode, viewDate: moment.Moment) => ViewMode;
    onNavigateBack?: (amount: number, type: string) => void;
    onNavigateForward?: (amount: number, type: string) => void;
    updateOnView?: ViewMode;
    locale?: string;
    utc?: boolean;
    displayTimeZone?: string;
    input?: boolean;
    dateFormat?: string | boolean;
    timeFormat?: string | boolean;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement> & Record<string, any>;
    timeConstraints?: any;
    isValidDate?: (date: moment.Moment) => boolean;
    open?: boolean;
    strictParsing?: boolean;
    closeOnSelect?: boolean;
    closeOnTab?: boolean;
    closeOnClickOutside?: boolean;
    className?: string | string[];
    renderView?: (view: ViewMode, renderDefault: () => React.ReactNode) => React.ReactNode;
    renderInput?: (props: any, openCalendar: () => void, closeCalendar: () => void) => React.ReactNode;
    renderDay?: (props: any, date: moment.Moment, selectedDate?: moment.Moment) => React.ReactNode;
    renderMonth?: (props: any, month: number, year: number, selectedDate?: moment.Moment) => React.ReactNode;
    renderYear?: (props: any, year: number, selectedDate?: moment.Moment) => React.ReactNode;
}
declare const Datetime: React.ForwardRefExoticComponent<DateTimeProps & React.RefAttributes<unknown>>;

export { type DateTimeProps, type ViewMode, Datetime as default };
