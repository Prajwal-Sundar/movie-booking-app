import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-900 py-6">
      <div
        className="max-w-7xl mx-auto text-center text-xs text-gray-400 italic 
                   transition-colors duration-300 hover:text-gray-200 cursor-pointer"
      >
        © {new Date().getFullYear()}{" "}
        <span
          className="relative font-semibold text-red-500 inline-block
                         after:block after:absolute after:bottom-0 after:left-0 after:h-[1px] 
                         after:w-0 after:bg-red-500 after:transition-all after:duration-300 
                         hover:after:w-full"
        >
          MovieBookingApp
        </span>{" "}
        — Bringing the magic of cinema to your fingertips!
      </div>
    </footer>
  );
};

export default Footer;
