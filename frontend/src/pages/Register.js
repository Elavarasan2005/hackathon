import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        employeeId: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "Employee"
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const register = async (e) => {

        e.preventDefault();

        if (form.password !== form.confirmPassword) {

            alert("Passwords do not match.");
            return;

        }

        if (form.password.length < 6) {

            alert("Password must contain at least 6 characters.");
            return;

        }

        try {

            setLoading(true);

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    form.email,
                    form.password
                );

            const user = userCredential.user;

            await setDoc(
                doc(db, "users", user.uid),
                {
                    employeeId: form.employeeId,
                    name: form.name,
                    email: form.email,
                    role: form.role,
                    phone: "",
                    address: "",
                    jobTitle: "",
                    salary: 0,
                    profilePicture: "",
                    createdAt: new Date()
                }
            );

            alert("Account created successfully!");

            navigate("/");

        } catch (error) {

            console.error(error);

            let message = "Registration failed.";

            if (error.code === "auth/email-already-in-use") {
                message =
                    "An account already exists with this email.";
            } else if (error.code === "auth/invalid-email") {
                message =
                    "Please enter a valid email address.";
            } else if (error.code === "auth/weak-password") {
                message =
                    "Password is too weak.";
            }

            alert(message);

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="register-page">

            {/* LEFT SIDE */}

            <div className="register-left">

                <div className="register-brand">

                    <div className="register-logo">
                        D
                    </div>

                    <span>
                        Dayflow
                    </span>

                </div>


                <div className="register-message">

                    <div className="small-label">
                        GET STARTED
                    </div>

                    <h1>
                        Build a better
                        <br />
                        <span>workplace.</span>
                    </h1>

                    <p>
                        Join Dayflow and simplify employee
                        management, attendance, leave and payroll.
                    </p>

                </div>

            </div>


            {/* RIGHT */}

            <div className="register-right">

                <div className="register-card">

                    <div className="register-header">

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Enter your details to get started
                        </p>

                    </div>


                    <form onSubmit={register}>

                        {/* EMPLOYEE ID */}

                        <div className="register-group">

                            <label>
                                Employee ID
                            </label>

                            <input
                                type="text"
                                name="employeeId"
                                placeholder="e.g. EMP001"
                                value={form.employeeId}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* NAME */}

                        <div className="register-group">

                            <label>
                                Full name
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="register-group">

                            <label>
                                Email address
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        {/* ROLE */}

                        <div className="register-group">

                            <label>
                                Account type
                            </label>

                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >

                                <option value="Employee">
                                    Employee
                                </option>

                                <option value="HR">
                                    HR
                                </option>

                            </select>

                        </div>


                        {/* PASSWORD */}

                        <div className="register-group">

                            <label>
                                Password
                            </label>

                            <div className="register-password">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword ? "◉" : "○"}
                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="register-group">

                            <label>
                                Confirm password
                            </label>

                            <div className="register-password">

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={
                                        form.confirmPassword
                                    }
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? "◉"
                                        : "○"}
                                </button>

                            </div>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating account..."
                                : "Create account"
                            }

                            {!loading && (
                                <span>
                                    →
                                </span>
                            )}

                        </button>

                    </form>


                    {/* LOGIN */}

                    <div className="login-link">

                        <span>
                            Already have an account?
                        </span>

                        <button
                            onClick={() => navigate("/")}
                        >
                            Sign in
                        </button>

                    </div>

                </div>

            </div>


            <style>{`

                * {
                    box-sizing: border-box;
                }

                .register-page {
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

                /* LEFT */

                .register-left {
                    width: 43%;
                    min-height: 100vh;
                    background:
                        linear-gradient(
                            145deg,
                            #0f4cbd,
                            #2563eb,
                            #60a5fa
                        );
                    padding: 42px 60px;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .register-left::before {
                    content: "";
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.06);
                    right: -250px;
                    bottom: -180px;
                }

                .register-left::after {
                    content: "";
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    left: -160px;
                    top: 35%;
                }

                .register-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 25px;
                    font-weight: 700;
                    position: relative;
                    z-index: 2;
                }

                .register-logo {
                    width: 42px;
                    height: 42px;
                    border-radius: 11px;
                    background: white;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    font-weight: 800;
                }

                .register-message {
                    margin: auto 0;
                    position: relative;
                    z-index: 2;
                }

                .small-label {
                    font-size: 12px;
                    letter-spacing: 2px;
                    font-weight: 700;
                    color: #bfdbfe;
                    margin-bottom: 20px;
                }

                .register-message h1 {
                    font-size: 50px;
                    line-height: 1.1;
                    letter-spacing: -1.5px;
                    margin: 0 0 25px;
                }

                .register-message h1 span {
                    color: #bfdbfe;
                }

                .register-message p {
                    max-width: 440px;
                    color: #dbeafe;
                    font-size: 17px;
                    line-height: 1.7;
                }

                /* RIGHT */

                .register-right {
                    width: 57%;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 35px;
                }

                .register-card {
                    width: 100%;
                    max-width: 510px;
                }

                .register-header {
                    margin-bottom: 27px;
                }

                .register-header h2 {
                    margin: 0 0 8px;
                    font-size: 31px;
                    color: #111827;
                    letter-spacing: -0.7px;
                }

                .register-header p {
                    margin: 0;
                    color: #6b7280;
                    font-size: 14px;
                }

                .register-group {
                    margin-bottom: 15px;
                }

                .register-group label {
                    display: block;
                    margin-bottom: 7px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }

                .register-group input,
                .register-group select {
                    width: 100%;
                    height: 46px;
                    padding: 0 13px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    outline: none;
                    font-size: 14px;
                    background: white;
                    color: #111827;
                    transition: 0.2s;
                }

                .register-group input:focus,
                .register-group select:focus {
                    border-color: #2563eb;
                    box-shadow:
                        0 0 0 3px rgba(37,99,235,0.1);
                }

                .register-password {
                    position: relative;
                }

                .register-password input {
                    padding-right: 45px;
                }

                .register-password button {
                    position: absolute;
                    right: 11px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: none;
                    background: transparent;
                    color: #6b7280;
                    cursor: pointer;
                    font-size: 16px;
                }

                .register-submit {
                    width: 100%;
                    height: 49px;
                    margin-top: 7px;
                    border: none;
                    border-radius: 8px;
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

                .register-submit:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow:
                        0 7px 18px rgba(37,99,235,0.22);
                }

                .register-submit:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                    transform: none;
                }

                .login-link {
                    display: flex;
                    justify-content: center;
                    gap: 5px;
                    margin-top: 21px;
                    font-size: 14px;
                    color: #6b7280;
                }

                .login-link button {
                    border: none;
                    background: transparent;
                    color: #2563eb;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                }

                .login-link button:hover {
                    text-decoration: underline;
                }

                @media (max-width: 850px) {

                    .register-left {
                        display: none;
                    }

                    .register-right {
                        width: 100%;
                        padding: 25px;
                    }

                    .register-card {
                        max-width: 480px;
                    }

                }

            `}</style>

        </div>
    );
}

export default Register;