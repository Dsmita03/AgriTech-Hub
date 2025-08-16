/* eslint-disable react/prop-types */
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  ArrowRight,
  BookOpen,
  MapPin,
  Leaf,
  MessageCircle,
  Cloudy,
  Landmark,
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
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={() => navigate(href)}
      onKeyDown={(e) => e.key === "Enter" && navigate(href)}
      className="cursor-pointer group focus:outline-none"
    >
      <Card className="h-full p-5 transition-all duration-300 border border-slate-200/80 bg-white/90 hover:bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 rounded-2xl focus-visible:ring-2 focus-visible:ring-emerald-400">
        <CardHeader className="text-center flex flex-col items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl ring-1 ring-emerald-100 group-hover:ring-emerald-200 transition">
            {icon}
          </div>
          <CardTitle className="text-xl font-semibold text-slate-800">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center text-slate-600 leading-relaxed">
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
    if (!auth.currentUser) {
      console.warn("No user is currently signed in.");
      return;
    }
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 via-white to-white">
      {/* Sticky header with translucent blur */}
      <Header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
        <div className="ml-auto">
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            Logout
          </Button>
        </div>
      </Header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="relative h-[86vh] min-h-[520px] flex items-center"
          aria-label="Welcome section"
        >
          {/* Background image with gradient overlay for readability */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/harvesting1.jpg')" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-emerald-900/70 via-emerald-900/40 to-transparent"
            aria-hidden="true"
          />
          <div className="container mx-auto px-4 relative z-10 text-white">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full bg-white/15 ring-1 ring-white/30 px-3 py-1 text-sm tracking-wide backdrop-blur">
                Sustainable • Data-driven • Farmer-first
              </span>
              <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-tight drop-shadow-sm">
                Empowering Modern Agriculture
                <span className="block text-emerald-200">with AgriTech Hub</span>
              </h1>
              <p className="mt-4 md:mt-6 text-lg md:text-xl text-emerald-50/90 leading-relaxed">
                Real-time insights, crop intelligence, and community support to help make better farm decisions.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  Explore Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => navigate("/crop-recommendation")}
                >
                  Get Recommendations
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-20 bg-gradient-to-b from-white to-emerald-50/40"
        >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Our Features
              </h2>
              <p className="mt-3 text-slate-600">
                Tools and insights tailored for every stage of farming—research, planning, monitoring, and collaboration.
              </p>
            </div>

            {/* Primary feature cards */}
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                href="/articles-videos"
                icon={<BookOpen className="h-8 w-8" />}
                title="Articles & Videos"
                description="Learn science-backed methods and best practices from curated resources."
              />
              <FeatureCard
                href="/crop-recommendation"
                icon={<MapPin className="h-8 w-8" />}
                title="Crop Recommendation"
                description="Get smart suggestions based on local weather and soil heuristics."
              />
              <FeatureCard
                href="/disease-detection"
                icon={<Leaf className="h-8 w-8" />}
                title="Disease Detection"
                description="Identify plant diseases using AI-powered image analysis."
              />
              <FeatureCard
                href="/forum"
                icon={<MessageCircle className="h-8 w-8" />}
                title="Open Forum"
                description="Discuss, troubleshoot, and share experiences with the community."
              />
              <FeatureCard
                href="/weather-updates"
                icon={<Cloudy className="h-8 w-8" />}
                title="Weather Updates"
                description="Track live conditions and stay prepared for changes."
              />
              <FeatureCard
                href="/government-schemes"
                icon={<Landmark className="h-8 w-8" />}
                title="Government Schemes"
                description="Discover relevant programs and benefits from official sources."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gradient-to-b from-emerald-50/40 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
                Testimonials
              </h2>
              <p className="mt-3 text-slate-600">
                Real stories from growers and agri-entrepreneurs using AgriTech Hub.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Testimonial Card 1 */}
              <div className="rounded-2xl border border-emerald-200 bg-white/95 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/Ravi.png"
                    alt="Ravi Kumar"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-100"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">Ravi Kumar</p>
                    <p className="text-xs text-slate-500">Wheat & Pulses, Haryana</p>
                  </div>
                </div>
                <p className="mt-4 text-slate-700 leading-relaxed">
                  “The crop recommendations matched my field conditions closely. My input costs went down and yields improved this season.”
                </p>
              </div>

              {/* Testimonial Card 2 */}
              <div className="rounded-2xl border border-emerald-200 bg-white/95 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/Priya.png"
                    alt="Priya Sen"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-100"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">Priya Sen</p>
                    <p className="text-xs text-slate-500">Horticulture, West Bengal</p>
                  </div>
                </div>
                <p className="mt-4 text-slate-700 leading-relaxed">
                  “I spotted early signs of disease in my tomato crop using the web-app. It saved me from a big loss.”
                </p>
              </div>

              {/* Testimonial Card 3 */}
              <div className="rounded-2xl border border-emerald-200 bg-white/95 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/Arun.png"
                    alt="Arun Pillai"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-100"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">Arun Pillai</p>
                    <p className="text-xs text-slate-500">Dairy & Fodder, Kerala</p>
                  </div>
                </div>
                <p className="mt-4 text-slate-700 leading-relaxed">
                  “Weather updates and the forum helped me plan harvests better and learn from others in my region.”
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingLayout;
