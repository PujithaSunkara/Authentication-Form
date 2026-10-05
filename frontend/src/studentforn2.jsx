import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";

function StudentForm2() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStudents = async () => {
    try {
      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        alert("Please Login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/studentdata",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setStudents(response.data.students);

    } catch (error) {
      console.log(error);

      const message =
        error.response?.data?.message ||
        "Server Error";

      if (
        error.response?.status === 401 &&
        message.toLowerCase().includes("expired")
      ) {
        alert(
          "Access Token Expired. Please Login Again."
        );

        localStorage.removeItem("accessToken");

        window.location.reload();

        return;
      }

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStudents();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        Loading student details...
      </div>
    );
  }

  return (
    <div className="student-card">

      <div className="student-header">
        <h1>Student Details</h1>
        <p>Your submitted information</p>
      </div>

      {students.length === 0 ? (
        <div className="empty-message">
          No student details found.
        </div>
      ) : (
        students.map((student) => (
          <div
            key={student._id}
            className="student-details"
          >

            <div className="detail-row">
              <span>Name</span>
              <strong>{student.name}</strong>
            </div>

            <div className="detail-row">
              <span>Branch</span>
              <strong>{student.branch}</strong>
            </div>

            <div className="detail-row">
              <span>Contact</span>
              <strong>{student.contact}</strong>
            </div>

          </div>
        ))
      )}

    </div>
  );
}

export default StudentForm2;