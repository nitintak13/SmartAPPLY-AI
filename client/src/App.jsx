// src/App.jsx
import { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ApplyJob from "./pages/ApplyJob";
import Applications from "./pages/Applications";
import RecruiterLogin from "./components/RecruiterLogin";
import { AppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import "quill/dist/quill.snow.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { showRecruiterLogin, companyToken } = useContext(AppContext);

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply-job/:id" element={<ApplyJob />} />
        <Route path="/applications" element={<Applications />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="manage-jobs" replace />} />

          <Route
            path="add-job"
            element={companyToken ? <AddJob /> : <Navigate to="/" replace />}
          />

          <Route
            path="manage-jobs"
            element={
              companyToken ? <ManageJobs /> : <Navigate to="/" replace />
            }
          />

          <Route
            path="view-applications"
            element={
              companyToken ? <ViewApplications /> : <Navigate to="/" replace />
            }
          />
        </Route>

        <Route
          path="*"
          element={<div className="p-8 text-center">404 — Page Not Found</div>}
        />
      </Routes>
    </div>
  );
};

export default App;
