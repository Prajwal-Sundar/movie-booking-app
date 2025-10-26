import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-900 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm sm:text-base transition-colors duration-300">
        <p className="italic leading-relaxed">
          © {new Date().getFullYear()}{" "}
          <span
            className="relative font-semibold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent inline-block
              after:block after:absolute after:bottom-0 after:left-0 after:h-[1px] 
              after:w-0 after:bg-gradient-to-r after:from-red-500 after:to-purple-500 
              after:transition-all after:duration-300 hover:after:w-full cursor-pointer"
          >
            MovieBookingApp
          </span>{" "}
          — Bringing the magic of cinema to your fingertips!
        </p>
      </div>
    </footer>
  );
};

export default Footer;
