 
import { Target, Eye, Flag, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router";
const About = () => {
    const navigate = useNavigate();
    return (
      <div>
        <Header />
        <div className="w-full bg-green-50 text-gray-900 py-12">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-green-700">
                        About Us
                    </h1>
                    <p className="text-lg text-gray-700 mt-2">
                        Empowering Agriculture with Technology & Sustainability
                    </p>
                </div>

                {/* Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                    {/* Vision */}
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="flex items-center gap-4">
                            <Eye className="w-10 h-10 text-green-600" />
                            <h2 className="text-2xl font-semibold text-green-700">
                                Our Vision
                            </h2>
                        </div>
                        <p className="text-gray-700 text-lg">
                            To create a sustainable and technology-driven
                            agriculture ecosystem that enhances productivity
                            while preserving natural resources.
                        </p>
                    </div>
                    <div>
                        <img
                            src="https://assets.weforum.org/article/image/KFlMNl2lJUrmtPgdTmCHdTpLmaPoTWSgI5yTRZY9mXU.jpg" // Replace with an actual vision-related image
                            alt="Vision"
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Mission */}
                    <div>
                        <img
                            src="https://d17ocfn2f5o4rl.cloudfront.net/wp-content/uploads/2023/07/BP-AI-in-Agriculture-The-Future-of-Farming_body-im-3.jpg" // Replace with an actual mission-related image
                            alt="Mission"
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="flex items-center gap-4">
                            <Flag className="w-10 h-10 text-green-600" />
                            <h2 className="text-2xl font-semibold text-green-700">
                                Our Mission
                            </h2>
                        </div>
                        <p className="text-gray-700 text-lg">
                            To empower farmers with innovative tools,
                            AI-driven solutions, and best agricultural
                            practices for a better, greener future.
                        </p>
                    </div>

                    {/* Target */}
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="flex items-center gap-4">
                            <Target className="w-10 h-10 text-green-600" />
                            <h2 className="text-2xl font-semibold text-green-700">
                                Our Target
                            </h2>
                        </div>
                        <p className="text-gray-700 text-lg">
                            Helping farmers, agribusinesses, and researchers by
                            bridging the gap between agriculture and
                            technology, making farming more efficient and
                            sustainable.
                        </p>
                    </div>
                    <div>
                        <img
                            src="https://www.cyient.com/hubfs/Whitepaper-banner%20%282%29.png" // Replace with an actual target-related image
                            alt="Target"
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Values */}
                    <div>
                        <img
                            src="https://media.licdn.com/dms/image/C4D12AQFjNiRe_kmsWQ/article-cover_image-shrink_600_2000/0/1628672246177?e=2147483647&v=beta&t=0_gcrMNpIEHh5LeYdx_UHsQH-t1rD-Vxh1RIfyDbzmE" // Replace with an actual values-related image
                            alt="Values"
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="flex items-center gap-4">
                            <HeartHandshake className="w-10 h-10 text-green-600" />
                            <h2 className="text-2xl font-semibold text-green-700">
                                Our Values
                            </h2>
                        </div>
                        <p className="text-gray-700 text-lg">
                            We believe in sustainability, innovation, and
                            community-driven growth, ensuring a positive
                            impact on farmers and the environment.
                        </p>
                    </div>
                </div>

                {/* Contact Button */}
                <div className="text-center mt-12">
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg rounded-lg shadow-lg" onClick={() => navigate("/contact")}>
                        Get in Touch
                    </Button>
                </div>
            </div>
        </div>
        <Footer/>
      </div>
    );
};

export default About;
