import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Users,
	Palette,
	Lock,
	Unlock,
	Copy,
	Zap,
	CheckCircle,
	XCircle,
	Pencil,
	Share2,
	UserPlus,
	Sparkles
} from 'lucide-react';

function Home() {
	const navigate = useNavigate();
	const { isConnected, joinRoom } = useSocket();
	const [mode, setMode] = useState('join');

	// State for create room
	const [createData, setCreateData] = useState({
		username: '',
		isPrivate: false,
		password: '',
		passwordConfirm: ''
	});
	// State for join room
	const [joinData, setJoinData] = useState({
		username: '',
		roomId: '',
		password: ''
	});

	const handleCreateChange = (e) => {
		const { name, value, type, checked } = e.target;
		setCreateData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleJoinChange = (e) => {
		const { name, value } = e.target;
		setJoinData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCreateSubmit = async (e) => {
		e.preventDefault();
		if (!createData.username.trim()) {
			alert('Please enter a username');
			return;
		}
		if (createData.isPrivate) {
			if (!createData.password.trim()) {
				alert('Please enter a password for private room');
				return;
			}
			if (createData.password !== createData.passwordConfirm) {
				alert('Passwords do not match');
				return;
			}
		}
		try {
			const res = await fetch(
				(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000') +
					'/api/rooms',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: `Boardly Room ${Math.random().toString(36).substring(2, 10)}`,
						isPrivate: createData.isPrivate,
						password: createData.isPrivate ? createData.password : ''
					})
				}
			);
			if (!res.ok) {
				const err = await res.json();
				alert(err.message || 'Failed to create room');
				return;
			}
			const room = await res.json();
			localStorage.setItem('username', createData.username);
			joinRoom(
				room.roomId,
				createData.username,
				createData.isPrivate,
				createData.password
			);
			navigate(`/whiteboard/${room.roomId}`);
		} catch (error) {
			alert('Failed to create room');
		}
	};

	const handleJoinSubmit = (e) => {
		e.preventDefault();
		if (!joinData.username.trim()) {
			alert('Please enter a username');
			return;
		}
		if (!joinData.roomId.trim()) {
			alert('Please enter a Room ID');
			return;
		}
		localStorage.setItem('username', joinData.username);
		joinRoom(
			joinData.roomId.trim(),
			joinData.username,
			!!joinData.password,
			joinData.password
		);
		navigate(`/whiteboard/${joinData.roomId.trim()}`);
	};

	const handleQuickJoin = () => {
		const username = `User${Math.floor(Math.random() * 1000)}`;
		const roomId = Math.random().toString(36).substring(2, 10);
		localStorage.setItem('username', username);
		joinRoom(roomId, username);
		navigate(`/whiteboard/${roomId}`);
	};

	return (
		<div className='min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'>
			<div className='w-full max-w-md space-y-8'>
				{/* Logo and Title */}
				<div className='text-center space-y-4'>
					<div className='inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-xl'>
						<Pencil className='h-12 w-12 text-white' />
					</div>
					<h1 className='text-4xl font-bold tracking-tight text-white'>
						Boardly
					</h1>
					<p className='text-xl text-white/80'>
						Collaborative whiteboard for creative minds
					</p>
				</div>

				{/* Features */}
				<div className='grid grid-cols-2 gap-4 mb-8'>
					<div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white'>
						<Share2 className='h-6 w-6 mb-2' />
						<h3 className='font-semibold'>Real-time</h3>
						<p className='text-sm text-white/70'>Collaborate instantly</p>
					</div>
					<div className='bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white'>
						<UserPlus className='h-6 w-6 mb-2' />
						<h3 className='font-semibold'>Multi-user</h3>
						<p className='text-sm text-white/70'>Work together</p>
					</div>
				</div>

				{/* Main Card */}
				<Card className='bg-white/95 backdrop-blur-sm border-white/20'>
					<CardHeader className='pb-4'>
						<div className='flex space-x-2'>
							<Button
								variant={mode === 'join' ? 'default' : 'outline'}
								className='flex-1'
								onClick={() => setMode('join')}>
								<Users className='h-4 w-4 mr-2' />
								Join Room
							</Button>
							<Button
								variant={mode === 'create' ? 'default' : 'outline'}
								className='flex-1'
								onClick={() => setMode('create')}>
								<Sparkles className='h-4 w-4 mr-2' />
								Create Room
							</Button>
						</div>
					</CardHeader>

					<CardContent className='space-y-6'>
						{mode === 'join' ? (
							<form
								onSubmit={handleJoinSubmit}
								className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='join-username'>Your Name</Label>
									<Input
										id='join-username'
										name='username'
										value={joinData.username}
										onChange={handleJoinChange}
										placeholder='Enter your name'
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='roomId'>Room ID</Label>
									<Input
										id='roomId'
										name='roomId'
										value={joinData.roomId}
										onChange={handleJoinChange}
										placeholder='Enter Room ID'
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='join-password'>
										Room Password (if private)
									</Label>
									<Input
										id='join-password'
										name='password'
										type='password'
										value={joinData.password}
										onChange={handleJoinChange}
										placeholder='Enter room password'
									/>
								</div>
								<Button
									type='submit'
									disabled={!isConnected}
									className='w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'>
									Join Room
								</Button>
							</form>
						) : (
							<form
								onSubmit={handleCreateSubmit}
								className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='create-username'>Your Name</Label>
									<Input
										id='create-username'
										name='username'
										value={createData.username}
										onChange={handleCreateChange}
										placeholder='Enter your name'
										required
									/>
								</div>
								<div className='flex items-center space-x-2'>
									<input
										type='checkbox'
										id='isPrivate'
										name='isPrivate'
										checked={createData.isPrivate}
										onChange={handleCreateChange}
										className='rounded border-gray-300'
									/>
									<Label
										htmlFor='isPrivate'
										className='flex items-center gap-2'>
										{createData.isPrivate ? (
											<Lock className='h-4 w-4' />
										) : (
											<Unlock className='h-4 w-4' />
										)}
										Private Room
									</Label>
								</div>
								{createData.isPrivate && (
									<>
										<div className='space-y-2'>
											<Label htmlFor='create-password'>Room Password</Label>
											<Input
												id='create-password'
												name='password'
												type='password'
												value={createData.password}
												onChange={handleCreateChange}
												placeholder='Enter room password'
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='create-password-confirm'>
												Confirm Password
											</Label>
											<Input
												id='create-password-confirm'
												name='passwordConfirm'
												type='password'
												value={createData.passwordConfirm}
												onChange={handleCreateChange}
												placeholder='Confirm room password'
												required
											/>
										</div>
									</>
								)}
								<Button
									type='submit'
									disabled={!isConnected}
									className='w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'>
									Create Room
								</Button>
							</form>
						)}

						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<Separator className='w-full' />
							</div>
							<div className='relative flex justify-center text-xs uppercase'>
								<span className='bg-white px-2 text-gray-500'>Or</span>
							</div>
						</div>

						<Button
							variant='outline'
							onClick={handleQuickJoin}
							disabled={!isConnected}
							className='w-full'>
							<Zap className='h-4 w-4 mr-2' />
							Quick Start (Random Room)
						</Button>
					</CardContent>

					<CardFooter className='justify-center pt-0'>
						<p className='text-sm text-gray-500'>
							{isConnected ? (
								<span className='flex items-center gap-2'>
									<CheckCircle className='h-4 w-4 text-green-500' />
									Connected to server
								</span>
							) : (
								<span className='flex items-center gap-2'>
									<XCircle className='h-4 w-4 text-red-500' />
									Connecting to server...
								</span>
							)}
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

export default Home;
