import { useContext, useEffect, useRef, useState } from "react";
import Quill from "quill";
import { JobCategories, JobLocations } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const AddJob = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Bangalore");
  const [category, setCategory] = useState("Programming");
  const [level, setLevel] = useState("Beginner level");
  const [salary, setSalary] = useState(0);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const { backendUrl, companyToken } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const description = quillRef.current.root.innerHTML;

      const { data } = await axios.post(
        `${backendUrl}/api/company/post-job`,
        { title, description, location, salary, category, level },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setTitle("");
        setSalary(0);
        quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: false,
        },
      });
    }
  }, []);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="container p-4 flex flex-col w-full items-start gap-4 max-w-4xl mx-auto"
    >
      <div className="w-full">
        <p className="mb-2 font-medium">Job Title</p>
        <input
          type="text"
          placeholder="Type here"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div className="w-full">
        <p className="mb-2 font-medium">Job Description</p>
        <div
          ref={editorRef}
          className="bg-white border border-gray-300 rounded p-2 min-h-[120px]"
        />
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <p className="mb-2 font-medium">Job Category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            {JobCategories.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <p className="mb-2 font-medium">Job Location</p>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            {JobLocations.map((loc, idx) => (
              <option key={idx} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <p className="mb-2 font-medium">Job Level</p>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="Beginner level">Beginner level</option>
            <option value="Intermediate level">Intermediate level</option>
            <option value="Senior level">Senior level</option>
          </select>
        </div>
      </div>

      <div className="mt-2">
        <p className="mb-2 font-medium">Job Salary</p>
        <input
          type="number"
          min={0}
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="2500"
          className="px-3 py-2 border border-gray-300 rounded w-[120px]"
        />
      </div>

      <button
        type="submit"
        className="mt-4 bg-black text-white py-2 px-5 rounded"
      >
        Add
      </button>
    </form>
  );
};

export default AddJob;
