function Footer() {
    return (
        <footer className="bg-[#262622] text-[#afa18f] py-6 border-t border-[#393937]">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold text-[#ec4e39]">
                            Mystic Feedback
                        </h3>
                    </div>
                    <div className="flex space-x-4">
                        <a
                            href="#"
                            className="hover:text-[#ec4e39] transition-colors duration-300"
                        >
                            About
                        </a>
                        <a
                            href="#"
                            className="hover:text-[#ec4e39] transition-colors duration-300"
                        >
                            Contact
                        </a>
                        <a
                            href="#"
                            className="hover:text-[#ec4e39] transition-colors duration-300"
                        >
                            Privacy Policy
                        </a>
                    </div>
                </div>
                <div className="mt-6 text-center text-sm">
                    © {new Date().getFullYear()} Mystic Feedback. All rights
                    reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
