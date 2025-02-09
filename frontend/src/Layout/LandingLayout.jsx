import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";  // Import signOut from Firebase
import { auth } from "@/lib/firebase";  // Import Firebase auth
import {
    ArrowRight,
    BookOpen,
    MapPin,
    Leaf,
    FlaskRoundIcon as Flask,
    MessageCircle,
    Cloudy,
    Landmark,
    MessageSquare,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FeatureCard = ({ href, icon, title, description }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(href)} className="cursor-pointer ">
            <Card className="h-full p-4 transition-transform hover:scale-105 shadow-lg border border-gray-200 bg-white">
                <CardHeader className="text-center flex flex-col items-center">
                    <div className="bg-green-100 p-3 rounded-full">{icon}</div>
                    <CardTitle className="text-xl font-semibold mt-2">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-center text-gray-600">
                        {description}
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
};

const LandingLayout = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate("/");  // Redirect to sign-in page after logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header with Logout Button */}
            <Header>
                <Button onClick={handleSignOut} className="bg-red-500 hover:bg-red-600 text-white">
                    Logout
                </Button>
            </Header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section
                    className="relative bg-cover bg-center h-[91vh] flex items-center filter brightness-110 contrast-100 saturate-125"
                    style={{
                        background: "url('/harvesting1.jpg')",
                        backgroundSize: "cover", backgroundPosition: "center" 
                    }}
                >
                    <div className="container mx-auto px-4 text-center relative z-10 text-white">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                            Welcome to AgriTech Hub
                        </h1>
                        <p className="text-lg md:text-xl mb-8 drop-shadow-md">
                            Your one-stop solution for modern agriculture
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                        >
                            <Link onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>
                                Explore Features{" "}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-gray-100">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800 py-3">
                            Our Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                href="/articles-videos"
                                icon={<BookOpen className="h-10 w-10 text-green-600" />}
                                title="Articles & Videos"
                                description="Learn about scientific farming methods"
                            />
                            <FeatureCard
                                href="/crop-recommendation"
                                icon={<MapPin className="h-10 w-10 text-green-600" />}
                                title="Crop Recommendation"
                                description="Get crop suggestions based on your location"
                            />
                            <FeatureCard
                                href="/disease-detection"
                                icon={<Leaf className="h-10 w-10 text-green-600" />}
                                title="Disease Detection"
                                description="Identify plant diseases and get cures"
                            />
                             <FeatureCard
                                href="/forum"
                                icon={
                                    <MessageCircle className="h-10 w-10 text-green-600" />
                                }
                                title="Open Forum"
                                description="Open discussion forum for farmers"
                            />
                             <FeatureCard
                                href="/weather-updates"
                                icon={
                                    <Cloudy className="h-10 w-10 text-green-600" />
                                }
                                title="Weather Updates"
                                description="Get weather updates for your location"
                            />
                            <FeatureCard
                                href="/government-schemes"
                                icon={
                                    <Landmark className="h-10 w-10 text-green-600" />
                                }
                                title="Government Schemes"
                                description="Get information about government schemes"
                            />
                           
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LandingLayout;
