import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useUser } from "../context/UserContext";

function HomePage() {
  const { user, setUser, loading } = useUser(); // Added loading from context
  const [showDropdown, setShowDropdown] = useState(false);

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);

      // Optional: send token to backend
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Login failed on backend");
      }

      const data = await response.json();
      console.log("Backend response:", data);

      // Save user info in context
      setUser({
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
      });

      alert(`✅ Login successful! Welcome ${result.user.displayName}`);
    } catch (err) {
      console.error(err);
      alert(`❌ Login failed: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Reset context
      setShowDropdown(false);
      alert("👋 Logged out successfully!");
    } catch (err) {
      console.error(err);
      alert(`❌ Logout failed: ${err.message}`);
    }
  };

  // ✅ Prevent UI flash while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md relative">
        <h1 className="text-2xl font-bold text-indigo-600">AI ChatBot</h1>

        {/* Login Button or Avatar */}
        {!user ? (
          <button
            onClick={googleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Sign in with Google
          </button>
        ) : (
          <div className="relative flex items-center space-x-2">
            <span className="text-gray-700 font-medium">Hi, {user.name}</span>

            <img
              src={user.avatar}
              alt={user.name}
              title={user.name}
              className="w-10 h-10 rounded-full border-2 border-indigo-600 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            />

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-12 w-32 bg-white shadow-lg rounded-lg border border-gray-200 z-10">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="text-center mt-20 px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Upload Videos, Audios, and PDFs
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-10">
          Our AI Chatbot transcribes your files, summarizes them, and gives you
          instant insights. Get started by logging in with Google!
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition">
            Upload Video
          </button>
          <button className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition">
            Upload Audio
          </button>
          <button className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition">
            Upload PDF
          </button>
        </div>
      </header>
    </div>
  );
}

export default HomePage;
