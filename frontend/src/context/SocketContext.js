import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback
} from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [currentRoom, setCurrentRoom] = useState(null);
	const [users, setUsers] = useState([]);
	const [socketReady, setSocketReady] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const SOCKET_URL =
			process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
		const newSocket = io(SOCKET_URL, {
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000
		});

		setSocketReady(false);

		newSocket.on('connect', () => {
			setIsConnected(true);
			setError(null);
			console.log('Connected to server');
		});

		newSocket.on('disconnect', () => {
			setIsConnected(false);
			console.log('Disconnected from server');
		});

		newSocket.on('connect_error', (error) => {
			console.error('Connection error:', error);
			setError('Failed to connect to server');
		});

		newSocket.on('room-joined', (data) => {
			setCurrentRoom(data.room);
			setUsers(data.users);
			setError(null);
			console.log('[SocketContext] Joined room:', data.room);
		});

		newSocket.on('user-list', (users) => {
			setUsers(users);
		});

		newSocket.on('join-error', (error) => {
			console.error('Join error:', error);
			setError(error.message);
		});

		setSocket(newSocket);
		setSocketReady(true);

		return () => {
			newSocket.close();
			setSocketReady(false);
		};
	}, []);

	const joinRoom = useCallback(
		(roomId, username, isPrivate = false, password = '') => {
			if (!socket) {
				setError('Socket not initialized');
				return;
			}

			if (!roomId || !username) {
				setError('Room ID and username are required');
				return;
			}

			setError(null);
			socket.emit('join-room', { roomId, username, isPrivate, password });
		},
		[socket]
	);

	const leaveRoom = useCallback(
		(cb) => {
			if (socket && currentRoom) {
				socket.emit('leave-room', { roomId: currentRoom.roomId }, () => {
					setCurrentRoom(null);
					setUsers([]);
					if (cb) cb();
				});
			} else if (cb) {
				cb();
			}
		},
		[socket, currentRoom]
	);

	const sendDraw = useCallback(
		(drawData) => {
			if (socket && drawData.roomId) {
				if (drawData.type === 'stroke') {
					socket.emit('stroke', drawData);
				} else {
					socket.emit('draw', drawData);
				}
			}
		},
		[socket]
	);

	const clearCanvas = useCallback(
		(roomId) => {
			const effectiveRoomId = (currentRoom && currentRoom.roomId) || roomId;
			if (socket && effectiveRoomId) {
				console.log(
					'[SocketContext] Emitting clear-canvas for room:',
					effectiveRoomId
				);
				socket.emit('clear-canvas', { roomId: effectiveRoomId });
			}
		},
		[socket, currentRoom]
	);

	const undo = useCallback(
		(roomId) => {
			const effectiveRoomId = (currentRoom && currentRoom.roomId) || roomId;
			if (socket && effectiveRoomId) {
				socket.emit('undo', { roomId: effectiveRoomId });
			}
		},
		[socket, currentRoom]
	);

	const redo = useCallback(
		(roomId) => {
			const effectiveRoomId = (currentRoom && currentRoom.roomId) || roomId;
			if (socket && effectiveRoomId) {
				socket.emit('redo', { roomId: effectiveRoomId });
			}
		},
		[socket, currentRoom]
	);

	const sendMessage = useCallback(
		(message, username, roomId) => {
			const effectiveRoomId = (currentRoom && currentRoom.roomId) || roomId;
			if (socket && effectiveRoomId && message.trim()) {
				socket.emit('send-message', {
					roomId: effectiveRoomId,
					username:
						username || (currentRoom && currentRoom.username) || 'Anonymous',
					message: message.trim()
				});
			}
		},
		[socket, currentRoom]
	);

	const value = {
		socket,
		isConnected,
		currentRoom,
		users,
		error,
		joinRoom,
		leaveRoom,
		sendDraw,
		clearCanvas,
		undo,
		redo,
		sendMessage,
		socketReady
	};

	return (
		<SocketContext.Provider value={value}>{children}</SocketContext.Provider>
	);
};
