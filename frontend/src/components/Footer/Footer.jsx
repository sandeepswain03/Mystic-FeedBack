function Footer() {
    return (
        <footer className="bg-[#2C2B28] text-[#afa18f] py-6 ">
            <div className="container mx-auto px-4 flex flex-row justify-between items-center">
                <h3 className="text-xl font-bold text-[#ec4e39]">
                    Mystic Feedback
                </h3>
                <div className="text-center text-sm">
                    © {new Date().getFullYear()} Mystic Feedback. All rights
                    reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
