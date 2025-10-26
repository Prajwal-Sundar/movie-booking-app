import React from "react";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 items-center justify-start p-6 max-w-5xl mx-auto text-center">
      {/* Hero Section */}
      <section className="mt-12 mb-12">
        <h1 className="text-5xl font-extrabold text-red-500 mb-4">
          Welcome to MovieBookingApp!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Experience seamless movie bookings with our premium platform. Explore
          shows, book your favorite seats, and enjoy hassle-free entertainment.
        </p>
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac
          malesuada magna. Suspendisse potenti. Curabitur pretium, lorem a
          ultrices volutpat, justo ex tristique magna, at finibus sapien purus
          id mauris.
        </p>
      </section>

      {/* Sample Content */}
      <section className="mb-12 text-left w-full">
        <h2 className="text-3xl font-semibold text-red-500 mb-4">
          Why Choose Us?
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
          <li>Praesent ac malesuada magna, ut ultrices purus.</li>
          <li>Seamless ticket booking with real-time seat availability.</li>
          <li>Premium UI/UX designed for movie lovers.</li>
        </ul>
      </section>

      {/* Another Section */}
      <section className="mb-12 text-left w-full">
        <h2 className="text-3xl font-semibold text-red-500 mb-4">
          How It Works
        </h2>
        <p className="text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          facilisis tincidunt purus, sed vehicula libero imperdiet a. Duis
          rhoncus urna at nulla ultricies, a efficitur nisi imperdiet. Cras nec
          finibus velit.
        </p>
      </section>
    </div>
  );
};

export default Home;
