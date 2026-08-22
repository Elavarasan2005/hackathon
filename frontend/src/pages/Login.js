import React, { useState } from "react";

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase";

import {
  useNavigate
} from "react-router-dom";


function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!email || !password) {

      alert(
        "Please enter email and password."
      );

      return;
    }


    try {

      setLoading(true);


      // Firebase Authentication
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );


      const user =
        userCredential.user;


      // Get user profile
      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const userSnap =
        await getDoc(userRef);


      if (!userSnap.exists()) {

        alert(
          "User account exists, but profile data was not found."
        );

        return;
      }


      const userData =
        userSnap.data();


      // =====================================
      // SAVE LOGIN INFORMATION
      // =====================================

      const loggedInUser = {

        uid: user.uid,

        email: user.email,

        ...userData

      };


      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );


      // =====================================
      // ROLE BASED REDIRECT
      // =====================================

      if (
        userData.role === "HR"
      ) {

        navigate(
          "/hr-dashboard",
          {
            replace: true
          }
        );

      } else {

        navigate(
          "/dashboard",
          {
            replace: true
          }
        );
      }


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      let message =
        "Login failed.";


      if (
        error.code ===
          "auth/invalid-credential" ||
        error.code ===
          "auth/wrong-password"
      ) {

        message =
          "Invalid email or password.";

      } else if (
        error.code ===
        "auth/user-not-found"
      ) {

        message =
          "No account found with this email.";

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {

        message =
          "Please enter a valid email.";

      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {

        message =
          "Too many login attempts. Please try again later.";
      }


      alert(message);

    } finally {

      setLoading(false);

    }
  };


  // =========================================
  // REGISTER
  // =========================================

  const goToRegister = () => {

    navigate("/register");

  };


  return (

    <div className="auth-page">

      {/* ===================================
          LEFT SIDE
      =================================== */}

      <div className="auth-left">

        <div className="brand">

          <div className="brand-icon">
            D
          </div>

          <span>
            Dayflow
          </span>

        </div>


        <div className="hero-content">

          <h1>

            Manage your workforce.

            <br />

            <span>
              Flow better.
            </span>

          </h1>


          <p>

            A simple and powerful HR
            management platform for
            modern teams.

          </p>


          <div className="hero-features">

            <div>
              <span>✓</span>
              Employee Management
            </div>

            <div>
              <span>✓</span>
              Attendance Tracking
            </div>

            <div>
              <span>✓</span>
              Leave & Payroll Management
            </div>

          </div>

        </div>


        <div className="left-footer">

          © 2026 Dayflow HRMS

        </div>

      </div>


      {/* ===================================
          RIGHT SIDE
      =================================== */}

      <div className="auth-right">

        <div className="auth-card">

          <div className="mobile-logo">

            <div className="brand-icon">
              D
            </div>

            <span>
              Dayflow
            </span>

          </div>


          <div className="form-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to your Dayflow account
            </p>

          </div>


          <form
            onSubmit={handleLogin}
          >

            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />


                <button
                  type="button"
                  className="eye-button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >

                  {showPassword
                    ? "◉"
                    : "○"}

                </button>

              </div>

            </div>


            {/* LOGIN */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && (
                <span>
                  →
                </span>
              )}

            </button>

          </form>


          {/* REGISTER */}

          <div className="register-section">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={
                goToRegister
              }
            >
              Create an account
            </button>

          </div>

        </div>

      </div>


      {/* ===================================
          CSS
      =================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .auth-page {
          min-height: 100vh;
          display: flex;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background: #f8fafc;
        }

        .auth-left {
          width: 50%;
          min-height: 100vh;
          background:
            linear-gradient(
              135deg,
              #0f4cbd 0%,
              #2563eb 55%,
              #3b82f6 100%
            );
          color: white;
          padding: 42px 60px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .auth-left::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background:
            rgba(255,255,255,0.06);
          right: -150px;
          top: -120px;
        }

        .auth-left::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background:
            rgba(255,255,255,0.05);
          left: -150px;
          bottom: -100px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 25px;
          font-weight: 700;
          position: relative;
          z-index: 2;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: white;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 22px;
          box-shadow:
            0 6px 20px
            rgba(0,0,0,0.12);
        }

        .hero-content {
          margin: auto 0;
          max-width: 560px;
          position: relative;
          z-index: 2;
        }

        .hero-content h1 {
          font-size: 52px;
          line-height: 1.12;
          letter-spacing: -1.5px;
          margin: 0 0 24px;
        }

        .hero-content h1 span {
          color: #bfdbfe;
        }

        .hero-content p {
          font-size: 18px;
          line-height: 1.7;
          color: #dbeafe;
          max-width: 480px;
          margin-bottom: 35px;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .hero-features div {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: #eff6ff;
        }

        .hero-features span {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background:
            rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .left-footer {
          position: relative;
          z-index: 2;
          color: #bfdbfe;
          font-size: 13px;
        }

        .auth-right {
          width: 50%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
        }

        .mobile-logo {
          display: none;
        }

        .form-header {
          margin-bottom: 32px;
        }

        .form-header h2 {
          font-size: 34px;
          color: #111827;
          margin: 0 0 9px;
          letter-spacing: -0.8px;
        }

        .form-header p {
          color: #6b7280;
          font-size: 15px;
          margin: 0;
        }

        .form-group {
          margin-bottom: 21px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper input {
          width: 100%;
          height: 50px;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          padding: 0 45px;
          outline: none;
          font-size: 15px;
          color: #111827;
          background: white;
          transition: 0.2s;
        }

        .input-wrapper input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37,99,235,0.1);
        }

        .input-icon {
          position: absolute;
          left: 15px;
          color: #9ca3af;
          z-index: 1;
          font-size: 16px;
        }

        .eye-button {
          position: absolute;
          right: 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #6b7280;
          font-size: 17px;
        }

        .login-button {
          width: 100%;
          height: 51px;
          margin-top: 8px;
          border: none;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: 0.2s;
        }

        .login-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow:
            0 7px 18px
            rgba(37,99,235,0.22);
        }

        .login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .register-section {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 28px;
          font-size: 14px;
          color: #6b7280;
        }

        .register-section button {
          border: none;
          background: none;
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .register-section button:hover {
          text-decoration: underline;
        }

        @media (max-width: 850px) {

          .auth-left {
            display: none;
          }

          .auth-right {
            width: 100%;
            padding: 25px;
          }

          .auth-card {
            max-width: 450px;
          }

          .mobile-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #111827;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 45px;
          }

          .mobile-logo .brand-icon {
            background: #2563eb;
            color: white;
          }

        }

      `}</style>

    </div>
  );
}

export default Login;