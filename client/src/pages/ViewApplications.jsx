import { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

export default function ViewApplications() {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchCompanyJobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/company/list-jobs`, {
        headers: { token: companyToken },
      });
      if (data.success) {
        setJobs(data.jobsData);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to fetch job list");
    }
  };

  const fetchCompanyJobApplications = async (jobId = "all") => {
    setLoading(true);
    const url =
      jobId === "all"
        ? `${backendUrl}/api/company/all-applicants`
        : `${backendUrl}/api/company/sorted-applicants?jobId=${jobId}`;

    try {
      const { data } = await axios.get(url, {
        headers: { token: companyToken },
      });
      if (data.success) {
        const apps = Array.isArray(data.applicants) ? data.applicants : [];
        setApplications(apps);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const changeJobApplicationStatus = async (id, status) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/company/change-status`,
        { id, status },
        { headers: { token: companyToken } }
      );
      if (data.success) {
        fetchCompanyJobApplications(selectedJobId);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs();
      fetchCompanyJobApplications();
    }
  }, [companyToken]);

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplications(selectedJobId);
    }
  }, [selectedJobId]);

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <label htmlFor="jobFilter" className="mr-2 font-medium">
          Filter by Job:
        </label>
        <select
          id="jobFilter"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="all">All Jobs</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {!applications.length ? (
        <div className="text-center text-gray-600">No applications found.</div>
      ) : (
        <table className="w-full max-w-5xl bg-white border border-gray-200 text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">#</th>
              <th className="py-2 px-4 text-left">Candidate</th>
              <th className="py-2 px-4 text-left max-sm:hidden">Job</th>
              <th className="py-2 px-4 text-left max-sm:hidden">Location</th>
              <th className="py-2 px-4 text-left">Match (%)</th>
              <th className="py-2 px-4 text-left">Resume</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {(selectedJobId === "all"
              ? [...applications].sort(
                  (a, b) => (b.matchScore || 0) - (a.matchScore || 0)
                )
              : applications
            ).map((app, idx) => (
              <tr key={app._id || idx} className="text-gray-700">
                <td className="py-2 px-4 border-b">{idx + 1}</td>
                <td className="py-2 px-4 border-b flex items-center gap-2">
                  <img
                    src={app.userId?.image || assets.default_avatar}
                    alt={app.userId?.name || "User"}
                    className="w-8 h-8 rounded-full max-sm:hidden"
                  />
                  <span>{app.userId?.name || "Unknown"}</span>
                </td>
                <td className="py-2 px-4 border-b max-sm:hidden">
                  {app.jobId?.title || "—"}
                </td>
                <td className="py-2 px-4 border-b max-sm:hidden">
                  {app.jobId?.location || "—"}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {app.matchScore !== undefined ? app.matchScore : "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  <a
                    href={app.userId?.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-50 text-blue-400 px-3 py-1 rounded inline-flex items-center gap-1"
                  >
                    Resume
                    <img
                      src={assets.resume_download_icon}
                      alt="download"
                      className="inline h-4"
                    />
                  </a>
                </td>
                <td className="py-2 px-4 border-b">
                  {app.status === "Pending" ? (
                    <div className="relative inline-block group">
                      <button className="text-gray-500">•••</button>
                      <div className="hidden group-hover:block absolute top-full right-0 mt-1 w-32 bg-white border rounded shadow">
                        <button
                          onClick={() =>
                            changeJobApplicationStatus(app._id, "Accepted")
                          }
                          className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            changeJobApplicationStatus(app._id, "Rejected")
                          }
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded ${
                        app.status === "Accepted"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {app.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
