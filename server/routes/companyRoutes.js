import express from "express";
import {
  registerCompany,
  loginCompany,
  getCompanyData,
  postJob,
  getCompanyPostedJobs,
  getCompanyJobApplicants,
  getAllCompanyApplicants,
  ChangeJobApplicationsStatus,
  changeVisiblity,
  getSortedApplicants,
} from "../controllers/companyController.js";
import upload from "../config/multer.js";
import { protectCompany } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("image"), registerCompany);
router.post("/login", loginCompany);
router.get("/company", protectCompany, getCompanyData);
router.post("/post-job", protectCompany, postJob);
router.get("/list-jobs", protectCompany, getCompanyPostedJobs);
router.get("/all-applicants", protectCompany, getAllCompanyApplicants);
router.get("/applicants", protectCompany, getCompanyJobApplicants);
router.get("/sorted-applicants", protectCompany, getSortedApplicants);

router.post("/change-status", protectCompany, ChangeJobApplicationsStatus);
router.post("/change-visiblity", protectCompany, changeVisiblity);

export default router;
