import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CgProfile } from "react-icons/cg";

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false); // mobile menu toggle

  const handleSignOut = async () => {
    try {
      if (!auth.currentUser) {
        console.warn("No user currently signed in.");
        return;
      }
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className="bg-emerald-700 text-white shadow-md sticky top-0 z-50"
      role="banner"
    >
      <nav
        className="container mx-auto flex items-center justify-between px-4 md:px-8 py-3"
        aria-label="Primary"
      >
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl md:text-3xl font-extrabold tracking-tight hover:text-emerald-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
          aria-label="Go to home"
        >
          AgriTech Hub
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Open menu</span>
          {/* Simple burger icon */}
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-white" />
            <span className="block h-0.5 w-6 bg-white" />
            <span className="block h-0.5 w-6 bg-white" />
          </div>
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-10 text-base font-semibold">
          <li>
            <Link
              to="/dashboard"
              className="hover:text-emerald-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
            >
             Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="hover:text-emerald-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="hover:text-emerald-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
            >
              Contact
            </Link>
          </li>
          {/* Profile Dropdown */}
          <li className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full hover:bg-emerald-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label="Open profile menu"
                >
                  <CgProfile size={28} aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-emerald-800 text-white rounded-md shadow-lg w-44 border border-emerald-600">
                {/* Add more items as you grow (Profile, Settings, etc.) */}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="hover:bg-emerald-700 px-4 py-2 cursor-pointer focus:bg-emerald-700 focus:text-white"
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-emerald-600 bg-emerald-700">
          <ul className="container mx-auto px-4 py-3 space-y-2 text-base font-semibold">
            <li>
              <Link
                to="/"
                className="block px-2 py-2 rounded hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block px-2 py-2 rounded hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                onClick={() => setOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="block px-2 py-2 rounded hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  setOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-2 py-2 rounded hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
