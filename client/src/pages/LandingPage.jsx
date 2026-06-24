import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGuestJoin = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    navigate(`/guest/${randomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/background.png"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 bg-gray-800/60 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <img src="/logo3.png" alt="Apna Video Call" className="h-8 w-8" />
          <h2 className="text-xl font-bold text-white">Apna Video Call</h2>
        </div>
        <div className="flex items-center gap-6">
          <p
            onClick={handleGuestJoin}
            className="text-gray-300 hover:text-white cursor-pointer text-sm font-medium transition-colors"
          >
            Join as Guest
          </p>
          <p
            onClick={() => navigate('/register')}
            className="text-gray-300 hover:text-white cursor-pointer text-sm font-medium transition-colors"
          >
            Register
          </p>
          <div
            onClick={() => navigate('/login')}
            role="button"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <p>Login</p>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Connect with your{' '}
              <span className="text-[#FF9839]">loved Ones</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              Cover a distance by Apna Video Call
            </p>
            <div role="button">
              <Link
                to="/register"
                className="inline-block px-8 py-4 bg-[#FF9839] hover:bg-[#e8842a] text-white font-semibold rounded-xl text-lg transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="/mobile.png"
              alt="Video call illustration"
              className="max-w-full h-auto max-h-[500px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo3.png" alt="Apna Video Call" className="h-5 w-5" />
            <span className="text-gray-500 text-sm">Apna Video Call</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>&copy; 2026 Apna Video Call</span>
            <span>Secure</span>
            <span>Free</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
