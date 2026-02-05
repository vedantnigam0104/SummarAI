import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import { FiSend, FiFileText, FiVideo, FiMusic } from "react-icons/fi";

function HomePage() {
  const { user, setUser, loading } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const googleLogin = async () => {
    if (loginLoading) return;

    setLoginLoading(true);
    toast.dismiss(); // clear stale toasts
    toast.loading("Signing in with Google...");

    try {
      // 1️⃣ Firebase auth (SOURCE OF TRUTH)
      const result = await signInWithPopup(auth, googleProvider);

      setUser({
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL,
      });

      toast.success(`Welcome ${result.user.displayName}! 🎉`);

      // 2️⃣ Backend call (BEST EFFORT)
      try {
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
          toast("Logged in, but backend sync pending ⏳", {
            icon: "⚠️",
          });
        }
      } catch (backendErr) {
        console.warn("Backend login failed:", backendErr);
        toast("Logged in, backend temporarily unavailable ⚠️", {
          icon: "⚠️",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Google login failed ❌");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
  try {
    await toast.promise(
      signOut(auth),
      {
        loading: "Logging out...",
        success: "Logged out successfully 👋",
        error: "Logout failed ❌",
      }
    );

    setUser(null);
    setShowDropdown(false);
  } catch (err) {
    console.error(err);
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
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to SummarAI 👋
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in with Google to use SummarAI.
            </p>
            <p className="text-indigo-600 font-medium">
              🔐 Login required
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-3">
              Ask anything. Upload anything.
            </h2>
            <p className="text-gray-600">
              PDFs, videos, audios — summarized instantly.
            </p>
          </div>
        )}
      </main>

      {/* Chat Input */}
      {user && (
        <div className="w-full px-4 pb-6">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg flex items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-3 text-gray-500">
              <FiFileText size={20} />
              <FiVideo size={20} />
              <FiMusic size={20} />
            </div>

            <input
              type="text"
              placeholder="Ask a question or upload a file..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 outline-none px-2"
            />

            <button
              onClick={handleSendPrompt}
              className="bg-indigo-600 text-white p-2 rounded-full"
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
