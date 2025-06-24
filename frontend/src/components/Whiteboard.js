import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import {
	Users,
	MessageCircle,
	Copy,
	LogOut,
	CheckCircle,
	XCircle,
	Pencil
} from 'lucide-react';

function Whiteboard() {
	const { roomId } = useParams();
	const navigate = useNavigate();
	const {
		socket,
		isConnected,
		currentRoom,
		users,
		joinRoom,
		leaveRoom,
		sendDraw,
		clearCanvas,
		undo,
		redo,
		socketReady
	} = useSocket();

	const [isLoading, setIsLoading] = useState(true);
	const [showSidebar, setShowSidebar] = useState(false);
	const [currentUsername, setCurrentUsername] = useState('');
	const [drawingSettings, setDrawingSettings] = useState({
		tool: 'pen',
		color: '#000000',
		brushSize: 2,
		opacity: 1
	});
	const [pendingPassword, setPendingPassword] = useState(null);
	const [joinTried, setJoinTried] = useState(false);
	const canvasRef = useRef(null);
	const [remoteDrawEvent, setRemoteDrawEvent] = useState(null);
	const [touchStart, setTouchStart] = useState(null);
	const hasJoinedRef = useRef(false);
	const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

	// Listen for join-error to handle password prompt
	useEffect(() => {
		if (!socket) return;
		const handleJoinError = (error) => {
			if (
				error.message === 'Incorrect password' ||
				error.message === 'Password required'
			) {
				let password = '';
				while (!password) {
					password = window.prompt('Enter room password:');
					if (password === null) {
						navigate('/');
						return;
					}
				}
				setPendingPassword(password);
				setJoinTried(false);
				hasJoinedRef.current = false;
			} else {
				alert(error.message);
				navigate('/');
			}
		};
		socket.on('join-error', handleJoinError);
		return () => socket.off('join-error', handleJoinError);
	}, [socket, navigate]);

	useEffect(() => {
		if (
			isConnected &&
			roomId &&
			socketReady &&
			!hasJoinedRef.current &&
			!joinTried
		) {
			let username = localStorage.getItem('username');
			if (!username) {
				username = `User${Math.floor(Math.random() * 1000)}`;
				localStorage.setItem('username', username);
			}
			setCurrentUsername(username);
			const isPrivate = !!pendingPassword;
			joinRoom(roomId, username, isPrivate, pendingPassword || '');
			setIsLoading(false);
			hasJoinedRef.current = true;
			setJoinTried(true);
		}
	}, [isConnected, roomId, joinRoom, socketReady, pendingPassword, joinTried]);

	useEffect(() => {
		if (socket) {
			socket.on('draw', handleRemoteDraw);
			socket.on('stroke', handleRemoteDraw);
			socket.on('clear-canvas', handleRemoteClear);
			socket.on('canvas-data', handleRemoteCanvasData);

			return () => {
				socket.off('draw');
				socket.off('stroke');
				socket.off('clear-canvas');
				socket.off('canvas-data');
			};
		}
	}, [socket]);

	useEffect(() => {
		if (socket && currentRoom?.roomId) {
			socket.emit('request-canvas', { roomId: currentRoom.roomId });
		}
	}, [socket, currentRoom]);

	useEffect(() => {
		if (showSidebar && hasUnreadMessages) {
			setHasUnreadMessages(false);
		}
	}, [showSidebar, hasUnreadMessages]);

	useEffect(() => {
		const handleBeforeUnload = () => {
			leaveRoom();
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [leaveRoom]);

	const handleRemoteDraw = (data) => {
		setRemoteDrawEvent(data);
	};

	const handleRemoteClear = () => {
		if (canvasRef.current) {
			canvasRef.current.clear();
		}
	};

	const handleRemoteCanvasData = ({ canvasData }) => {
		if (
			canvasRef.current &&
			typeof canvasRef.current.loadImageFromDataUrl === 'function'
		) {
			canvasRef.current.loadImageFromDataUrl(canvasData || '');
		}
	};

	const handleDrawEvent = (drawData) => {
		const effectiveRoomId = currentRoom?.roomId || roomId;
		sendDraw({
			...drawData,
			roomId: effectiveRoomId
		});
	};

	const handleClearCanvas = () => {
		const effectiveRoomId = currentRoom?.roomId || roomId;
		clearCanvas(effectiveRoomId);
	};

	const handleUndo = () => {
		const effectiveRoomId = currentRoom?.roomId || roomId;
		undo(effectiveRoomId);
	};

	const handleRedo = () => {
		const effectiveRoomId = currentRoom?.roomId || roomId;
		redo(effectiveRoomId);
	};

	const handleExportImage = async () => {
		if (canvasRef.current) {
			try {
				const dataUrl = canvasRef.current.exportImage();
				const link = document.createElement('a');
				link.download = `whiteboard-${roomId}-${new Date()
					.toISOString()
					.slice(0, 10)}.png`;
				link.href = dataUrl;
				link.click();
			} catch (error) {
				console.error('Error exporting image:', error);
				alert('Failed to export image');
			}
		}
	};

	const handleExportPDF = async () => {
		if (canvasRef.current) {
			try {
				const pdf = await canvasRef.current.exportPDF();
				pdf.save(
					`whiteboard-${roomId}-${new Date().toISOString().slice(0, 10)}.pdf`
				);
			} catch (error) {
				console.error('Error exporting PDF:', error);
				alert('Failed to export PDF');
			}
		}
	};

	const handleLeaveRoom = () => {
		leaveRoom(() => {
			setTimeout(() => navigate('/'), 0);
		});
	};

	const copyRoomLink = () => {
		const link = `${window.location.origin}/whiteboard/${roomId}`;
		navigator.clipboard.writeText(link);
		alert('Room link copied to clipboard!');
	};

	const handleNewSidebarMessage = () => {
		if (!showSidebar) setHasUnreadMessages(true);
	};

	const handleCopyRoomId = () => {
		navigator.clipboard.writeText(roomId);
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<Card className='w-full max-w-md'>
					<CardContent className='flex flex-col items-center p-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4'></div>
						<h3 className='text-lg font-semibold text-gray-900 mb-2'>
							Connecting to room...
						</h3>
						<p className='text-gray-600 text-center'>
							Please wait while we establish your connection.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='h-screen flex flex-col bg-gray-50'>
			{/* Header */}
			<div className='h-16 border-b bg-white flex items-center justify-between px-4 shadow-sm'>
				<div className='flex items-center gap-4'>
					<div className='flex items-center gap-2'>
						<Pencil className='h-6 w-6 text-indigo-600' />
						<h1 className='text-xl font-semibold text-gray-900'>Boardly</h1>
					</div>
					<div className='h-6 w-px bg-gray-200' />
					<div className='flex items-center gap-2'>
						<Badge
							variant='outline'
							className='text-sm'>
							Room: {roomId}
						</Badge>
						<Button
							variant='ghost'
							size='sm'
							onClick={handleCopyRoomId}
							className='text-gray-500 hover:text-gray-700'>
							<Copy className='h-4 w-4' />
						</Button>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<div className='flex -space-x-2'>
						{users.slice(0, 3).map((user) => (
							<div
								key={user.socketId}
								className='h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center'
								title={user.username}>
								<span className='text-xs font-medium text-indigo-600'>
									{user.username.charAt(0).toUpperCase()}
								</span>
							</div>
						))}
						{users.length > 3 && (
							<div className='h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center'>
								<span className='text-xs font-medium text-gray-600'>
									+{users.length - 3}
								</span>
							</div>
						)}
					</div>

					<Button
						variant='ghost'
						size='sm'
						onClick={() => setShowSidebar(!showSidebar)}
						className={hasUnreadMessages ? 'text-indigo-600' : 'text-gray-500'}>
						<MessageCircle className='h-5 w-5' />
					</Button>

					<Button
						variant='ghost'
						size='sm'
						onClick={handleLeaveRoom}
						className='text-gray-500 hover:text-red-600'>
						<LogOut className='h-5 w-5' />
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className='flex-1 flex flex-col'>
				<Toolbar
					settings={drawingSettings}
					onSettingsChange={setDrawingSettings}
					onClear={clearCanvas}
					onUndo={undo}
					onRedo={redo}
				/>
				<div className='flex-1 relative'>
					<Canvas
						ref={canvasRef}
						settings={drawingSettings}
						onDraw={sendDraw}
						remoteDrawEvent={remoteDrawEvent}
					/>
					{showSidebar && (
						<div className='fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 z-50'>
							<Sidebar
								users={users}
								roomId={roomId}
								currentUsername={currentUsername}
								onClose={() => {
									setShowSidebar(false);
									setHasUnreadMessages(false);
								}}
								onNewMessage={() => !showSidebar && setHasUnreadMessages(true)}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Connection Status */}
			{!isConnected && (
				<div className='fixed bottom-4 right-4'>
					<Card className='bg-red-50 border-red-100'>
						<CardContent className='p-3 flex items-center gap-2 text-red-700'>
							<XCircle className='h-5 w-5' />
							<span className='text-sm font-medium'>Disconnected</span>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

export default Whiteboard;
