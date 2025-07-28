import { useContext } from "react";
import { assets } from "../assets/assets";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function Navbar() {
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const { setShowRecruiterLogin } = useContext(AppContext);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-md py-3">
      <div className="container mx-auto flex items-center justify-between px-4 2xl:px-20">
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center space-x-2"
        >
          <span className="text-2xl font-semibold text-blue-600">
            SmartApply
          </span>
        </div>

        {user ? (
          <div className="flex items-center space-x-6">
            <Link
              to="/applications"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Applied Jobs
            </Link>

            <span className="hidden sm:inline text-gray-600">
              Hi, <strong>{`${user.firstName} ${user.lastName}`}</strong>
            </span>

            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        ) : (
          <div className="flex items-center space-x-4 text-sm sm:text-base">
            <button
              onClick={() => setShowRecruiterLogin(true)}
              className="px-4 py-2 rounded text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition"
            >
              Recruiter Login
            </button>

            <button
              onClick={() => openSignIn()}
              className="px-6 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
