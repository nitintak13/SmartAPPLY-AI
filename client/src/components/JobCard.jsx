import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-md p-5 bg-white shadow-sm hover:shadow transition duration-150">
      <div className="flex items-center gap-3 mb-3">
        <img
          className="h-8 w-8 object-cover rounded"
          src={job.companyId?.image || "/default-logo.png"}
          alt={job.companyId?.name || "Company"}
        />
        <div>
          <p className="text-sm text-gray-700 font-semibold">
            {job.companyId?.name || "Unknown Company"}
          </p>
          <p className="text-xs text-gray-500">
            {job.location || "Location N/A"}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h3>

      <div className="flex gap-2 text-xs mb-3">
        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200">
          {job.level || "Level N/A"}
        </span>
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {job.type || "Full-time"}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-3">
        {job.description
          ? job.description.replace(/<[^>]+>/g, "").slice(0, 150) + "..."
          : "No description available."}
      </p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => {
            navigate(`/apply-job/${job._id}`);
            scrollTo(0, 0);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Apply Now
        </button>
        <button
          onClick={() => {
            navigate(`/apply-job/${job._id}`);
            scrollTo(0, 0);
          }}
          className="text-blue-600 hover:text-blue-800 border border-blue-600 px-4 py-2 rounded text-sm"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default JobCard;
