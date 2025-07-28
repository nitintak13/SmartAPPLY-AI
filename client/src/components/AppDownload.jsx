import React from "react";

const AppDownload = () => {
  return (
    <div className="max-w-2xl mx-auto my-16 px-4 py-8 bg-white border rounded-md shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        Get the SmartApply App
      </h2>
      <p className="text-gray-600 mb-6 leading-relaxed">
        Apply to jobs in one tap, receive real-time updates, and track your
        applications easily. SmartApply helps you stay ahead in your job search
        — anytime, anywhere.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Download for Android
        </button>
        <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition">
          Download for iOS
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        No ads. Free forever. Loved by 10,000+ job seekers.
      </div>
    </div>
  );
};

export default AppDownload;
