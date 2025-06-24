import * as React from 'react';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef(({ className, ...props }, ref) => (
	<input
		type='range'
		className={cn(
			'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider',
			'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
			'[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
			'[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer',
			'[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full',
			'[&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none',
			className
		)}
		ref={ref}
		{...props}
	/>
));
Slider.displayName = 'Slider';

export { Slider };
