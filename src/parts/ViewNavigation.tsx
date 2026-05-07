import React from 'react';

interface ViewNavigationProps {
	onClickPrev: () => void;
	onClickSwitch: () => void;
	onClickNext: () => void;
	switchContent: React.ReactNode;
	switchColSpan: number;
	switchProps?: React.HTMLAttributes<HTMLTableHeaderCellElement> & Record<string, any>;
}

export default function ViewNavigation({
	onClickPrev,
	onClickSwitch,
	onClickNext,
	switchContent,
	switchColSpan,
	switchProps
}: ViewNavigationProps) {
	return (
		<tr>
			<th className="rdtPrev" onClick={onClickPrev}>
				<span>‹</span>
			</th>
			<th
				className="rdtSwitch"
				colSpan={switchColSpan}
				onClick={onClickSwitch}
				{...switchProps}
			>
				{switchContent}
			</th>
			<th className="rdtNext" onClick={onClickNext}>
				<span>›</span>
			</th>
		</tr>
	);
}
