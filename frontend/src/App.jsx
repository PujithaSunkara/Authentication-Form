import React, { useState } from "react";
import axios from "axios";
import StudentForm1 from "./studentform1";
import StudentForm2 from "./studentforn2";
import "./index.css";

function App() {
  const [page, setPage] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showStudentDetails, setShowStudentDetails] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // SIGNUP
  // =========================

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/signup",
        {
          name,
          email,
          password,
        }
      );

      alert(response.data.message);

      setName("");
      setEmail("");
      setPassword("");

      setPage("login");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Server Error"
      );
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem(
        "accessToken",
        response.data.accessToken
      );

      alert(response.data.message);

      setLoggedIn(true);

      setEmail("");
      setPassword("");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Server Error"
      );
    }
  };

  // =========================
  // STUDENT FORM SUBMIT
  // =========================

  const handleStudentSubmitted = () => {
    setShowStudentDetails(true);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      const token =
        localStorage.getItem("accessToken");

      await axios.post(
        "http://localhost:5000/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.log(error);
    }

    localStorage.removeItem("accessToken");

    setLoggedIn(false);
    setShowStudentDetails(false);
    setPage("login");
  };

  // =========================
  // AFTER LOGIN
  // =========================

  if (loggedIn) {
    return (
      <div className="app-container">

        {!showStudentDetails ? (
          <StudentForm1
            onSubmitSuccess={
              handleStudentSubmitted
            }
          />
        ) : (
          <StudentForm2 />
        )}

        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>

      </div>
    );
  }

  // =========================
  // SIGNUP
  // =========================

  if (page === "signup") {
    return (
      <div className="app-container">

        <div className="auth-card">

          <h1>Create Account</h1>

          <p className="subtitle">
            Sign up to continue
          </p>

          <form onSubmit={handleSignup}>

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="input-field"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="input-field"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="input-field"
            />

            <button
              type="submit"
              className="primary-btn"
            >
              Sign Up
            </button>

          </form>

          <p className="switch-text">
            Already have an account?
          </p>

          <button
            onClick={() => {
              setPage("login");
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="secondary-btn"
          >
            Login
          </button>

        </div>

      </div>
    );
  }

  // =========================
  // LOGIN
  // =========================

  return (
    <div className="app-container">

      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p className="subtitle">
          Login to continue
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="input-field"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="input-field"
          />

          <button
            type="submit"
            className="primary-btn"
          >
            Login
          </button>

        </form>

        <p className="switch-text">
          Don't have an account?
        </p>

        <button
          onClick={() => {
            setPage("signup");
            setEmail("");
            setPassword("");
          }}
          className="secondary-btn"
        >
          Create Account
        </button>

      </div>

    </div>
  );
}

export default App;