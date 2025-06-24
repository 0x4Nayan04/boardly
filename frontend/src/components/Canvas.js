import React, {
	useRef,
	useEffect,
	useState,
	useImperativeHandle,
	forwardRef,
	useCallback
} from 'react';

const Canvas = forwardRef(({ settings, onDraw, remoteDrawEvent }, ref) => {
	const { tool, color, brushSize, opacity } = settings;
	const canvasRef = useRef(null);
	const ctxRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [startPoint, setStartPoint] = useState(null);
	const [snapshot, setSnapshot] = useState(null);

	// Expose imperative methods for export, clear, etc.
	useImperativeHandle(ref, () => ({
		exportAs: (format = 'png') => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			if (format === 'pdf') {
				// Dynamic import for jspdf
				import('jspdf').then(({ jsPDF }) => {
					const dataUrl = canvas.toDataURL('image/png');
					const pdf = new jsPDF({ orientation: 'landscape' });
					pdf.addImage(dataUrl, 'PNG', 10, 10, 280, 160);
					pdf.save('board.pdf');
				});
			} else {
				const link = document.createElement('a');
				link.download = `board.${format}`;
				link.href = canvas.toDataURL(`image/${format}`);
				link.click();
			}
		},
		loadFromDataUrl: (dataUrl) => {
			if (!ctxRef.current) return;
			const img = new Image();
			img.src = dataUrl;
			img.onload = () => {
				ctxRef.current.clearRect(
					0,
					0,
					canvasRef.current.width,
					canvasRef.current.height
				);
				ctxRef.current.drawImage(img, 0, 0);
			};
		},
		getCanvasData: () => {
			return canvasRef.current?.toDataURL('image/png');
		}
	}));

	// Setup canvas and context
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		ctxRef.current = canvas.getContext('2d');
	}, []);

	// Handle window resizing
	useEffect(() => {
		const canvas = canvasRef.current;
		const parent = canvas.parentElement;
		if (!parent) return;

		const resizeObserver = new ResizeObserver(() => {
			const { width, height } = parent.getBoundingClientRect();
			// Preserve drawing on resize
			const imageData = ctxRef.current.getImageData(
				0,
				0,
				canvas.width,
				canvas.height
			);
			canvas.width = width;
			canvas.height = height;
			ctxRef.current.putImageData(imageData, 0, 0);
		});

		resizeObserver.observe(parent);

		// Initial resize
		const { width, height } = parent.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;

		return () => resizeObserver.disconnect();
	}, []);

	// Update context settings when they change
	useEffect(() => {
		if (!ctxRef.current) return;
		ctxRef.current.strokeStyle = color;
		ctxRef.current.lineWidth = brushSize;
		ctxRef.current.globalAlpha = opacity;
		ctxRef.current.lineCap = 'round';
		ctxRef.current.lineJoin = 'round';
	}, [color, brushSize, opacity]);

	const getPointerPosition = useCallback((e) => {
		if (!canvasRef.current) return;
		const rect = canvasRef.current.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}, []);

	// Drawing logic
	const startDrawing = useCallback(
		(e) => {
			if (!ctxRef.current) return;
			setIsDrawing(true);
			const pos = getPointerPosition(e);
			setStartPoint(pos);
			setSnapshot(
				ctxRef.current.getImageData(
					0,
					0,
					canvasRef.current.width,
					canvasRef.current.height
				)
			);

			ctxRef.current.beginPath();
			ctxRef.current.moveTo(pos.x, pos.y);
		},
		[getPointerPosition]
	);

	const draw = useCallback(
		(e) => {
			if (!isDrawing || !ctxRef.current) return;
			const pos = getPointerPosition(e);

			if (tool === 'pen' || tool === 'eraser') {
				ctxRef.current.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
				ctxRef.current.lineTo(pos.x, pos.y);
				ctxRef.current.stroke();
			} else if (startPoint) {
				// For shapes, restore from snapshot to draw anew
				ctxRef.current.putImageData(snapshot, 0, 0);
				ctxRef.current.strokeStyle = color;

				if (tool === 'rectangle') {
					ctxRef.current.strokeRect(
						startPoint.x,
						startPoint.y,
						pos.x - startPoint.x,
						pos.y - startPoint.y
					);
				} else if (tool === 'circle') {
					const radius = Math.sqrt(
						Math.pow(pos.x - startPoint.x, 2) +
							Math.pow(pos.y - startPoint.y, 2)
					);
					ctxRef.current.beginPath();
					ctxRef.current.arc(
						startPoint.x,
						startPoint.y,
						radius,
						0,
						2 * Math.PI
					);
					ctxRef.current.stroke();
				}
			}

			// For real-time sync
			if (onDraw) {
				onDraw({
					type: 'stroke',
					tool,
					start: startPoint,
					end: pos,
					color,
					brushSize,
					opacity
				});
			}
		},
		[
			isDrawing,
			getPointerPosition,
			tool,
			color,
			startPoint,
			snapshot,
			onDraw,
			brushSize,
			opacity
		]
	);

	const stopDrawing = useCallback(() => {
		if (!isDrawing) return;
		setIsDrawing(false);
		ctxRef.current?.closePath();

		// Emit end event for undo/redo and persistence
		if (onDraw) {
			onDraw({
				type: 'end',
				canvasData: canvasRef.current.toDataURL('image/png')
			});
		}
	}, [isDrawing, onDraw]);

	// Remote drawing handler
	useEffect(() => {
		if (!remoteDrawEvent || !ctxRef.current) return;

		const { type, tool, start, end, color, brushSize, opacity, canvasData } =
			remoteDrawEvent;

		const remoteCtx = ctxRef.current;
		remoteCtx.strokeStyle = color;
		remoteCtx.lineWidth = brushSize;
		remoteCtx.globalAlpha = opacity;

		if (type === 'stroke') {
			if (tool === 'pen' || tool === 'eraser') {
				remoteCtx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
				remoteCtx.beginPath();
				remoteCtx.moveTo(start.x, start.y);
				remoteCtx.lineTo(end.x, end.y);
				remoteCtx.stroke();
				remoteCtx.closePath();
			} else if (start) {
				if (tool === 'rectangle') {
					remoteCtx.strokeRect(
						start.x,
						start.y,
						end.x - start.x,
						end.y - start.y
					);
				} else if (tool === 'circle') {
					const radius = Math.sqrt(
						Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
					);
					remoteCtx.beginPath();
					remoteCtx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
					remoteCtx.stroke();
				}
			}
		} else if (type === 'end' && canvasData) {
			// Sync full state at the end of a stroke
			const img = new Image();
			img.src = canvasData;
			img.onload = () => {
				remoteCtx.clearRect(
					0,
					0,
					canvasRef.current.width,
					canvasRef.current.height
				);
				remoteCtx.drawImage(img, 0, 0);
			};
		}
	}, [remoteDrawEvent]);

	return (
		<canvas
			ref={canvasRef}
			onMouseDown={startDrawing}
			onMouseMove={draw}
			onMouseUp={stopDrawing}
			onMouseLeave={stopDrawing}
			className='absolute top-0 left-0 w-full h-full bg-white rounded-lg shadow-md'
		/>
	);
});

export default Canvas;
