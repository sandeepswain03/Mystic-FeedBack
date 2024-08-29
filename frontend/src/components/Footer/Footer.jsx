function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 border-t-2 border-gray-700">
      <div className="mt-1 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Mystic Feedback. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
