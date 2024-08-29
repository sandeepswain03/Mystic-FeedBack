import { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { FaEnvelope, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

function Home() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchedMessages = [
      {
        id: 1,
        title: "Great Job!",
        content: "You've been doing amazing work lately.",
        received: "2 days ago",
      },
      {
        id: 2,
        title: "Room for Improvement",
        content: "Consider focusing more on time management.",
        received: "1 week ago",
      },
      {
        id: 3,
        title: "Team Player",
        content: "Your collaboration skills are outstanding.",
        received: "3 days ago",
      },
    ];
    setMessages(fetchedMessages);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <section className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Dive into Anonymous Feedback
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300">
            Mystic Feedback - Where your identity remains a secret, but your
            voice is heard.
          </p>
        </section>

        <Carousel
          autoPlay
          infiniteLoop
          showStatus={false}
          showIndicators={true}
          showThumbs={false}
          showArrows={false}
          interval={2000}
          className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-gray-800 rounded-lg p-4 sm:p-6 md:p-8 m-2 sm:m-4 shadow-lg transform transition duration-500 hover:scale-105"
            >
              <div className="font-bold text-xl sm:text-2xl mb-2 sm:mb-4 text-blue-400">
                {message.title}
              </div>
              <div className="flex items-start space-x-3 sm:space-x-6">
                <FaEnvelope className="text-3xl sm:text-4xl text-purple-500" />
                <div className="flex-1">
                  <div className="flex items-start">
                    <FaQuoteLeft className="text-gray-500 mr-1" />
                    <p className="text-base sm:text-lg flex-1">
                      {message.content}
                    </p>
                    <FaQuoteRight className="text-gray-500 ml-1 mt-1" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 sm:mt-4 text-right">
                    Received {message.received}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </main>
    </div>
  );
}

export default Home;
