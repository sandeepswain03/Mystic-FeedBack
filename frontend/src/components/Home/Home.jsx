import { useState, useEffect } from "react";
import useMousePosition from "../../utils/useMousePostion.js";
import mask from "../../../public/mask.svg";
import { motion } from "framer-motion";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FaEnvelope, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

function Home() {
    const [messages, setMessages] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const { x, y } = useMousePosition();
    const size = isHovered ? 375 : 40;

    useEffect(() => {
        const fetchedMessages = [
            {
                id: 1,
                title: "Great Job!",
                content: "You've been doing amazing work lately.",
                received: "2 days ago"
            },
            {
                id: 2,
                title: "Room for Improvement",
                content: "Consider focusing more on time management.",
                received: "1 week ago"
            },
            {
                id: 3,
                title: "Team Player",
                content: "Your collaboration skills are outstanding.",
                received: "3 days ago"
            }
        ];
        setMessages(fetchedMessages);
    }, []);

    return (
        <div className="h-[91.5vh] overflow-hidden bg-[#2C2B28]">
            <main className="h-screen relative">
                <motion.div
                    className="absolute inset-0 bg-[#ec4e39] hidden md:block"
                    animate={{
                        WebkitMaskPosition: `${x - size / 2}px ${y - size / 2}px`,
                        WebkitMaskSize: `${size}px`
                    }}
                    transition={{
                        type: "tween",
                        ease: "backOut",
                        duration: 0.5
                    }}
                    style={{
                        WebkitMaskImage: `url(${mask})`,
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskSize: `${size}px`
                    }}
                >
                    <div className="h-full flex items-center justify-center">
                        <p
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="text-black text-4xl md:text-5xl lg:text-7xl font-bold max-w-4xl px-4 text-center transform -translate-y-[65%]"
                        >
                            Where your identity
                            <br />
                            remains
                            <br />a secret.
                        </p>
                    </div>
                </motion.div>

                <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-[#afa18f] text-4xl md:text-5xl lg:text-7xl font-bold max-w-3xl px-4 text-center mb-8">
                        Dive into the world of{" "}
                        <span className="text-[#ec4e39]">Anonymous</span>{" "}
                        Feedback
                    </p>

                    <Carousel
                        autoPlay={true}
                        infiniteLoop={true}
                        showStatus={false}
                        showIndicators={false}
                        showThumbs={false}
                        showArrows={false}
                        interval={2000}
                        key={messages.length}
                        className="w-full max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto px-4"
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className="bg-[#393937] rounded-lg p-6 md:p-8 lg:p-10 m-4 shadow-lg transform transition duration-500 hover:scale-105"
                            >
                                <div className="font-bold text-2xl md:text-3xl mb-4 md:mb-6 text-[#ec4e39]">
                                    {message.title}
                                </div>
                                <div className="flex items-start space-x-4 md:space-x-6">
                                    <FaEnvelope className="text-4xl md:text-5xl text-[#ec4e39]" />
                                    <div className="flex-1">
                                        <div className="flex items-start">
                                            <FaQuoteLeft className="text-[#afa18f] mr-2 text-lg" />
                                            <p className="text-lg md:text-xl flex-1 text-[#afa18f]">
                                                {message.content}
                                            </p>
                                            <FaQuoteRight className="text-[#afa18f] ml-2 mt-1 text-lg" />
                                        </div>
                                        <p className="text-sm md:text-base text-[#ec4e39] mt-4 md:mt-6 text-right">
                                            Received {message.received}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            </main>
        </div>
    );
}

export default Home;
