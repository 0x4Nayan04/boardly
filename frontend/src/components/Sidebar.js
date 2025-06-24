import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	MessageCircle,
	Users,
	Send,
	X,
	UserCircle2,
	Clock,
	CheckCircle
} from 'lucide-react';

function Sidebar({ users, roomId, currentUsername, onClose, onNewMessage }) {
	const { socket, sendMessage } = useSocket();
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const [typingUsers, setTypingUsers] = useState(new Set());
	const typingTimeoutRef = useRef(null);
	const messagesEndRef = useRef(null);
	const [showUsers, setShowUsers] = useState(false);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (socket) {
			socket.on('receive-message', (messageData) => {
				setMessages((prev) => {
					const newMessages = [...prev, messageData];
					if (onNewMessage && messageData.username !== currentUsername) {
						onNewMessage();
					}
					return newMessages;
				});
			});

			socket.on('room-joined', (data) => {
				if (data.messages) {
					setMessages(data.messages);
				}
			});

			socket.on('user-typing', (data) => {
				if (data.username !== currentUsername) {
					setTypingUsers((prev) => new Set(prev).add(data.username));
				}
			});

			socket.on('user-stop-typing', (data) => {
				if (data.username !== currentUsername) {
					setTypingUsers((prev) => {
						const newSet = new Set(prev);
						newSet.delete(data.username);
						return newSet;
					});
				}
			});

			return () => {
				socket.off('receive-message');
				socket.off('room-joined');
				socket.off('user-typing');
				socket.off('user-stop-typing');
			};
		}
	}, [socket, currentUsername, onNewMessage]);

	const handleSendMessage = () => {
		if (newMessage.trim() && sendMessage) {
			sendMessage(newMessage.trim(), currentUsername, roomId);
			setNewMessage('');
			setIsTyping(false);

			if (socket) {
				socket.emit('stop-typing', { roomId, username: currentUsername });
			}
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleInputChange = (e) => {
		setNewMessage(e.target.value);

		if (!isTyping) {
			setIsTyping(true);
			if (socket) {
				socket.emit('typing', { roomId, username: currentUsername });
			}
		}

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		typingTimeoutRef.current = setTimeout(() => {
			setIsTyping(false);
			if (socket) {
				socket.emit('stop-typing', { roomId, username: currentUsername });
			}
		}, 1000);
	};

	const formatTime = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	return (
		<div className='fixed right-0 top-0 h-screen w-80 bg-white shadow-lg flex flex-col'>
			{/* Header */}
			<div className='p-4 border-b flex items-center justify-between bg-gray-50'>
				<div className='flex items-center gap-2'>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setShowUsers(!showUsers)}>
						{showUsers ? (
							<MessageCircle className='h-5 w-5' />
						) : (
							<Users className='h-5 w-5' />
						)}
					</Button>
					<h2 className='font-semibold'>
						{showUsers ? 'Participants' : 'Chat'}
					</h2>
				</div>
				<Button
					variant='ghost'
					size='sm'
					onClick={onClose}>
					<X className='h-5 w-5' />
				</Button>
			</div>

			{showUsers ? (
				/* Users List */
				<ScrollArea className='flex-1 p-4'>
					<div className='space-y-2'>
						{users.map((user) => (
							<div
								key={user.socketId}
								className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50'>
								<UserCircle2 className='h-8 w-8 text-gray-400' />
								<div>
									<p className='font-medium'>
										{user.username}
										{user.username === currentUsername && (
											<Badge
												variant='secondary'
												className='ml-2'>
												You
											</Badge>
										)}
									</p>
									<p className='text-sm text-gray-500'>
										Joined {new Date(user.joinedAt).toLocaleTimeString()}
									</p>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			) : (
				/* Chat Messages */
				<>
					<ScrollArea className='flex-1 p-4'>
						<div className='space-y-4'>
							{messages.map((msg, index) => (
								<div
									key={index}
									className={`flex flex-col ${
										msg.username === currentUsername
											? 'items-end'
											: 'items-start'
									}`}>
									<div
										className={`max-w-[80%] rounded-lg p-3 ${
											msg.username === currentUsername
												? 'bg-blue-500 text-white'
												: 'bg-gray-100'
										}`}>
										{msg.username !== currentUsername && (
											<p className='text-xs font-medium mb-1'>{msg.username}</p>
										)}
										<p className='break-words'>{msg.message}</p>
									</div>
									<div className='flex items-center gap-1 mt-1 text-xs text-gray-500'>
										<Clock className='h-3 w-3' />
										{formatTime(msg.timestamp)}
										{msg.username === currentUsername && (
											<CheckCircle className='h-3 w-3 text-blue-500' />
										)}
									</div>
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>

					{/* Typing Indicator */}
					{typingUsers.size > 0 && (
						<div className='px-4 py-2 text-sm text-gray-500'>
							{Array.from(typingUsers).join(', ')}{' '}
							{typingUsers.size === 1 ? 'is' : 'are'} typing...
						</div>
					)}

					{/* Message Input */}
					<div className='p-4 border-t bg-gray-50'>
						<div className='flex gap-2'>
							<Input
								value={newMessage}
								onChange={handleInputChange}
								onKeyPress={handleKeyPress}
								placeholder='Type a message...'
								className='flex-1'
							/>
							<Button
								onClick={handleSendMessage}
								disabled={!newMessage.trim()}>
								<Send className='h-4 w-4' />
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export default Sidebar;
