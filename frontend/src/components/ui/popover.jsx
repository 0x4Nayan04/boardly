import * as React from 'react';
import { cn } from '@/lib/utils';

const Popover = ({ children, trigger, open, onOpenChange }) => {
	const [isOpen, setIsOpen] = React.useState(false);

	const handleToggle = () => {
		const newState = !isOpen;
		setIsOpen(newState);
		if (onOpenChange) onOpenChange(newState);
	};

	React.useEffect(() => {
		if (open !== undefined) {
			setIsOpen(open);
		}
	}, [open]);

	return (
		<div className='relative inline-block'>
			<div onClick={handleToggle}>{trigger}</div>
			{isOpen && (
				<>
					<div
						className='fixed inset-0 z-40'
						onClick={() => {
							setIsOpen(false);
							if (onOpenChange) onOpenChange(false);
						}}
					/>
					<div className='absolute z-50 mt-2 left-0'>{children}</div>
				</>
			)}
		</div>
	);
};

const PopoverContent = React.forwardRef(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
			className
		)}
		{...props}
	/>
));
PopoverContent.displayName = 'PopoverContent';

const PopoverTrigger = React.forwardRef(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={className}
		{...props}
	/>
));
PopoverTrigger.displayName = 'PopoverTrigger';

export { Popover, PopoverContent, PopoverTrigger };
