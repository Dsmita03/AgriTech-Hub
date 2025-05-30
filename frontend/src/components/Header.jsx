import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Use 'react-router-dom' instead of 'react-router'
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Import Firebase auth
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CgProfile } from "react-icons/cg";

const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log("User signed out successfully");
            navigate("/"); // Redirect to home page after logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="bg-green-600 text-white shadow-md">
            <nav className="container mx-auto flex justify-between items-center px-10 py-4">
                {/* Logo */}
                <Link to="/" className="text-3xl font-extrabold tracking-wide hover:text-green-900 transition duration-300">
                    AgriTech Hub
                </Link>

                {/* Navigation Links */}
                <ul className="flex space-x-12 text-lg font-semibold"> 
                    <li className="flex items-center">
                        <Link to="/about" className="hover:text-green-900 transition duration-300">
                            About
                        </Link>
                    </li>
                    <li className="flex items-center">
                        <Link to="/contact" className="hover:text-green-900 transition duration-300">
                            Contact
                        </Link>
                    </li>

                    {/* Profile Dropdown */}
                    <li className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <div className="p-2 rounded-full hover:bg-green-800 transition duration-300 cursor-pointer">
                                    <CgProfile size={30} />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-green-700 text-white rounded-md shadow-lg w-40">
                                <DropdownMenuItem 
                                    onClick={handleSignOut} 
                                    className="hover:bg-slate-500 px-4 py-2 rounded-md transition duration-300 cursor-pointer"
                                >
                                    Log Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
