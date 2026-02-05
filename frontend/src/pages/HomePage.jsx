import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { auth, googleProvider } from "../firebase";
import { useUser } from "../context/UserContext";

function HomePage() {
  const { user, setUser, loading } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const googleLogin = async () => {
    if (loginLoading) return;

    setLoginLoading(true);
    const toastId = toast.loading("Signing in with Google...");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);

      const response = await fetch(
        "https://summarai-3.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Backend login failed");
      }

      await response.json();

      // Save user info in context
      setUser({
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
      });

      toast.success(`Welcome ${result.user.displayName}! 🎉`, {
        id: toastId,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed", { id: toastId });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await signOut(auth);
      setUser(null);
      setShowDropdown(false);
      toast.success("Logged out successfully 👋", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Logout failed", { id: toastId });
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

        {!user ? (
          <button
            onClick={googleLogin}
            disabled={loginLoading}
            className={`px-4 py-2 rounded-lg shadow transition text-white ${
              loginLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loginLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        ) : (
          <div className="relative flex items-center space-x-2">
            <span className="text-gray-700 font-medium">
              Hi, {user.name}
            </span>

            <img
              src={user.avatar}
              alt={user.name}
              title={user.name}
              className="w-10 h-10 rounded-full border-2 border-indigo-600 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            />

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
