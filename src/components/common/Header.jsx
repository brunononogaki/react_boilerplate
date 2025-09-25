import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../../utils/auth";
import { useUser } from "../../contexts/UserContext";

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState("User");
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { currentUser, clearUser } = useUser();

  // Get user info from context
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser.username);
    } else {
      // Fallback to token if context not loaded yet
      const userInfo = getUserFromToken();
      if (userInfo) {
        setUser(userInfo.username);
      }
    }
  }, [currentUser]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    clearUser(); // Clear user context
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      {/* Left side - App name */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-red-600">MyApp</h1>
      </div>

      {/* Right side - User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg px-3 py-2 transition-colors"
        >
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium">{user}</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isUserMenuOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
