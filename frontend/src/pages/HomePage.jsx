import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import {
  FiSend,
  FiFileText,
  FiVideo,
  FiMusic,
} from "react-icons/fi";

function HomePage() {
  const { user, setUser, loading } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const googleLogin = async () => {
    if (loginLoading) return;

    setLoginLoading(true);
    const toastId = toast.loading("Signing in with Google...");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);

      await fetch("https://summarai-3.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

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
      toast.error("Login failed ❌", { id: toastId });
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
      toast.error("Logout failed ❌", { id: toastId });
    }
  };

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    console.log("User prompt:", prompt);
    setPrompt("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">
          SummarAI
        </h1>

        {!user ? (
          <button
            onClick={googleLogin}
            disabled={loginLoading}
            className={`px-5 py-2 rounded-full shadow text-white transition ${
              loginLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loginLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        ) : (
          <div className="relative flex items-center gap-3">
            <span className="text-gray-700 font-medium">
              Hi, {user.name}
            </span>
            <img
              src={user.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-indigo-600 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            />

            {showDropdown && (
              <div className="absolute right-0 top-12 w-32 bg-white shadow-lg rounded-lg border z-10">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {!user ? (
          /* Instruction when NOT logged in */
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to SummarAI 👋
            </h2>
            <p className="text-gray-600 mb-6">
              To use SummarAI and start chatting with your PDFs, videos, and
              audios, please sign in with Google first.
            </p>
            <p className="text-indigo-600 font-medium">
              🔐 Login is required to continue
            </p>
          </div>
        ) : (
          /* Logged-in welcome */
          <div className="max-w-2xl mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              Ask anything. Upload anything.
            </h2>
            <p className="text-gray-600">
              Upload PDFs, videos, or audios and get instant AI-powered summaries
              and answers.
            </p>
          </div>
        )}
      </main>

      {/* Chat Input Bar (Only when logged in) */}
      {user && (
        <div className="w-full px-4 pb-6">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg flex items-center gap-3 px-4 py-3">
            {/* Upload Icons */}
            <div className="flex items-center gap-3 text-gray-500">
              <button title="Upload PDF" className="hover:text-indigo-600">
                <FiFileText size={20} />
              </button>
              <button title="Upload Video" className="hover:text-indigo-600">
                <FiVideo size={20} />
              </button>
              <button title="Upload Audio" className="hover:text-indigo-600">
                <FiMusic size={20} />
              </button>
            </div>

            {/* Prompt Input */}
            <input
              type="text"
              placeholder="Ask a question or upload a file..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 px-2"
            />

            {/* Send Button */}
            <button
              onClick={handleSendPrompt}
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
