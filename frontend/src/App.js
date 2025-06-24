import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Whiteboard from './components/Whiteboard';
import { SocketProvider } from './context/SocketContext';

function App() {
	return (
		<SocketProvider>
			<div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700'>
				<Router>
					<Routes>
						<Route
							path='/'
							element={<Home />}
						/>
						<Route
							path='/whiteboard/:roomId'
							element={<Whiteboard />}
						/>
					</Routes>
				</Router>
			</div>
		</SocketProvider>
	);
}

export default App;
