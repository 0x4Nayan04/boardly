import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
	Pen,
	Eraser,
	Square,
	Circle,
	Type,
	Undo2,
	Redo2,
	Trash2,
	Download,
	FileText,
	Palette
} from 'lucide-react';

function Toolbar({
	settings,
	onSettingsChange,
	onClear,
	onUndo,
	onRedo,
	onExportImage,
	onExportPDF
}) {
	const [showColorPicker, setShowColorPicker] = useState(false);

	const handleToolChange = (tool) => {
		onSettingsChange({ ...settings, tool });
	};

	const handleColorChange = (color) => {
		onSettingsChange({ ...settings, color: color.hex });
	};

	const handleBrushSizeChange = (e) => {
		onSettingsChange({ ...settings, brushSize: parseInt(e.target.value, 10) });
	};

	const tools = [
		{ id: 'pen', icon: Pen, label: 'Pen' },
		{ id: 'eraser', icon: Eraser, label: 'Eraser (pixel)' },
		{ id: 'rectangle', icon: Square, label: 'Rectangle' },
		{ id: 'circle', icon: Circle, label: 'Circle' },
		{ id: 'text', icon: Type, label: 'Text' }
	];

	return (
		<div className='bg-white border-t border-gray-200 px-4 py-3 shadow-lg'>
			<div className='flex items-center justify-between max-w-7xl mx-auto'>
				{/* Drawing Tools */}
				<div className='flex items-center gap-2'>
					{tools.map((tool) => {
						const Icon = tool.icon;
						return (
							<Button
								key={tool.id}
								variant={settings.tool === tool.id ? 'default' : 'outline'}
								size='sm'
								onClick={() => handleToolChange(tool.id)}
								className='h-9 px-3'>
								<Icon className='h-4 w-4 mr-1.5' />
								<span className='hidden sm:inline'>{tool.label}</span>
							</Button>
						);
					})}
				</div>

				<Separator
					orientation='vertical'
					className='h-8'
				/>

				{/* Color and Brush Controls */}
				<div className='flex items-center gap-4'>
					{/* Color Picker */}
					<Popover
						open={showColorPicker}
						onOpenChange={setShowColorPicker}
						trigger={
							<Button
								variant='outline'
								size='sm'
								className='h-9 px-3'>
								<div
									className='w-4 h-4 rounded border border-gray-300 mr-2'
									style={{ backgroundColor: settings.color }}
								/>
								<Palette className='h-4 w-4' />
							</Button>
						}>
						<PopoverContent className='w-auto p-0'>
							<SketchPicker
								color={settings.color}
								onChange={handleColorChange}
								disableAlpha
							/>
						</PopoverContent>
					</Popover>

					{/* Brush Size */}
					<div className='flex items-center gap-3 min-w-[120px]'>
						<span className='text-sm text-gray-600 hidden sm:inline'>
							Size:
						</span>
						<div className='flex-1'>
							<Slider
								min={1}
								max={30}
								value={settings.brushSize}
								onChange={handleBrushSizeChange}
								className='w-full'
							/>
						</div>
						<Badge
							variant='outline'
							className='min-w-[2rem] text-center'>
							{settings.brushSize}
						</Badge>
					</div>
				</div>

				<Separator
					orientation='vertical'
					className='h-8'
				/>

				{/* Action Tools */}
				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={onUndo}
						className='h-9'>
						<Undo2 className='h-4 w-4 mr-1.5' />
						<span className='hidden sm:inline'>Undo</span>
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={onRedo}
						className='h-9'>
						<Redo2 className='h-4 w-4 mr-1.5' />
						<span className='hidden sm:inline'>Redo</span>
					</Button>
					<Button
						variant='destructive'
						size='sm'
						onClick={onClear}
						className='h-9 ml-2'>
						<Trash2 className='h-4 w-4 mr-1.5' />
						<span className='hidden sm:inline'>Delete All</span>
					</Button>
				</div>

				<Separator
					orientation='vertical'
					className='h-8'
				/>

				{/* Export Tools */}
				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={onExportImage}
						className='h-9'>
						<Download className='h-4 w-4 mr-1.5' />
						<span className='hidden sm:inline'>PNG</span>
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={onExportPDF}
						className='h-9'>
						<FileText className='h-4 w-4 mr-1.5' />
						<span className='hidden sm:inline'>PDF</span>
					</Button>
				</div>
			</div>
		</div>
	);
}

export default Toolbar;
