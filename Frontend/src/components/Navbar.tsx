import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import UserSearchModal from './UserSearchModal';

export default function Navbar() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [isSearchUserOpen, setIsSearchUserOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await authService.getProfile();

        if (user) {
          setUserName(user.user.name);
          setUserRole(user.role);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 mb-8 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-600 tracking-tight"
        >
          CritiPlay
        </Link>

        <div className="flex items-center gap-4">

          {/* Admin */}
          {userRole === 'admin' && (
            <>
              <Link
                to="/admin"
                className="text-purple-600 hover:text-purple-800 font-bold text-sm transition-colors hidden sm:inline-block"
              >
                Admin Panel
              </Link>

              <span className="text-slate-300 hidden sm:inline-block">
                |
              </span>
            </>
          )}

          {/* Library */}
          <Link
            to="/library"
            className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors hidden sm:inline-block"
          >
            Library
          </Link>

          <span className="text-slate-300 hidden sm:inline-block">
            |
          </span>

          {/* Profile */}
          <Link
            to="/profile"
            className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors hidden sm:inline-block"
          >
            Profil
          </Link>

          <span className="text-slate-300 hidden sm:inline-block">
            |
          </span>

          {/* Greeting */}
          <span className="text-slate-600 font-medium hidden sm:inline-block">
            Halo,{' '}
            <strong className="text-slate-800">
              {userName || 'Gamer'}
            </strong>
            !
          </span>

          {/* Add Friend */}
<button
  type="button"
  onClick={() => setIsSearchUserOpen(true)}
  title="Add Friend"
  aria-label="Add Friend"
  className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 hover:border-blue-200 transition-all shadow-sm"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19a4 4 0 0 0-8 0
         M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8
         M19 8v6
         M22 11h-6"
    />
  </svg>
</button>
          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 hover:border-red-200 transition-all shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={isSearchUserOpen}
        onClose={() => setIsSearchUserOpen(false)}
      />
    </nav>
  );
}