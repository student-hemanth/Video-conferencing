import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Room from './pages/Room.jsx';
import GuestRoom from './pages/GuestRoom.jsx';

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/guest/:roomId" element={<GuestRoom />} />
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
    </ErrorBoundary>
  );
}
