import React, { useState } from "react";
import axios from "axios";

function StudentForm1({ onSubmitSuccess }) {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !branch || !contact) {
      alert("All fields are required");
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        alert("Please Login");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/student",
        {
          name,
          branch,
          contact: Number(contact),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      alert(response.data.message);

      onSubmitSuccess();

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
    }
  };

  return (
    <div className="student-card">

      <div className="student-header">
        <h1>Student Details</h1>
        <p>Enter your details below</p>
      </div>

      <form onSubmit={handleSubmit}>

        <label>Name</label>

        <input
          type="text"
          placeholder="Enter student name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="input-field"
        />

        <label>Branch</label>

        <input
          type="text"
          placeholder="Enter branch"
          value={branch}
          onChange={(e) =>
            setBranch(e.target.value)
          }
          className="input-field"
        />

        <label>Contact</label>

        <input
          type="number"
          placeholder="Enter contact number"
          value={contact}
          onChange={(e) =>
            setContact(e.target.value)
          }
          className="input-field"
        />

        <button
          type="submit"
          className="primary-btn"
        >
          Submit Details
        </button>

      </form>

    </div>
  );
}

export default StudentForm1;