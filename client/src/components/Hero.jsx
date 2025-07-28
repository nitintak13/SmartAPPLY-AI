import { useContext, useRef } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

export default function Hero() {
  const { setSearchFilter, setIsSearched } = useContext(AppContext);
  const titleRef = useRef(null);
  const locationRef = useRef(null);

  const onSearch = () => {
    setSearchFilter({
      title: titleRef.current.value,
      location: locationRef.current.value,
    });
    setIsSearched(true);
  };

  return (
    <section className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white py-20">
      <div className="container mx-auto px-4 2xl:px-20 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Discover Exciting Career Opportunities
        </h1>
        <p className="max-w-2xl mx-auto mb-8 text-base md:text-lg opacity-90">
          Explore thousands of curated job listings and take the next step in
          your professional journey.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center bg-white rounded-lg p-4 shadow-lg max-w-3xl mx-auto">
          <div className="flex items-center flex-1 px-3 py-2 mb-3 sm:mb-0 sm:mr-2 bg-gray-100 rounded">
            <img
              src={assets.search_icon}
              alt="Search Icon"
              className="h-5 w-5 mr-2 text-gray-400"
            />
            <input
              ref={titleRef}
              type="text"
              placeholder="Job title or keyword"
              className="w-full outline-none text-gray-700 bg-transparent placeholder-gray-500"
            />
          </div>

          <div className="flex items-center flex-1 px-3 py-2 mb-3 sm:mb-0 sm:mr-2 bg-gray-100 rounded">
            <img
              src={assets.location_icon}
              alt="Location Icon"
              className="h-5 w-5 mr-2 text-gray-400"
            />
            <input
              ref={locationRef}
              type="text"
              placeholder="City or country"
              className="w-full outline-none text-gray-700 bg-transparent placeholder-gray-500"
            />
          </div>

          <button
            onClick={onSearch}
            className="bg-indigo-600 hover:bg-indigo-800 transition px-6 py-2 rounded-lg text-white font-semibold"
          >
            Search Jobs
          </button>
        </div>

        <div className="mt-12 pt-6">
          <p className="uppercase text-sm opacity-80 mb-4">Our Partners</p>
          <div className="flex items-center justify-center flex-wrap gap-6">
            {[
              assets.microsoft_logo,

              assets.accenture_logo,
              assets.samsung_logo,
              assets.amazon_logo,
              assets.adobe_logo,
            ].map((logo, idx) => (
              <img
                key={idx}
                src={logo}
                alt="Partner logo"
                className="h-8 opacity-80 hover:opacity-100 transition"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
