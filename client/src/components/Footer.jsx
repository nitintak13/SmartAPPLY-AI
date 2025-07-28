import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-20">
      <div className="container px-4 2xl:px-20 mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center space-x-2"
        >
          <span className="text-2xl font-semibold text-blue-600">
            SmartApply
          </span>
        </div>

        <div className="flex space-x-4">
          <a href="#" aria-label="Facebook">
            <img width={32} src={assets.facebook_icon} alt="Facebook" />
          </a>
          <a href="#" aria-label="Twitter">
            <img width={32} src={assets.twitter_icon} alt="Twitter" />
          </a>
          <a href="#" aria-label="Instagram">
            <img width={32} src={assets.instagram_icon} alt="Instagram" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
