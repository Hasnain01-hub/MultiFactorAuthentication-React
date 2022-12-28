import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";
import { Link } from "react-router-dom";
import Cryptr from "cryptr";
import { auth } from "../Firebase";
const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const cryptr = new Cryptr("myTotallySecretKey");

  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };
  const registerWithEmailAndPassword = async (e) => {
    e.preventDefault();
    try {
      //Form fields validation
      if (email !== "" && password !== "" && phone !== "") {
        if (phone.length < 10)
          return toast.error("Please enter a valid phone number");
        // Creating a new user with the email and password
        const res = await auth.createUserWithEmailAndPassword(email, password);
        const user = res.user;
        //encrypt the user data
        const encryptedphone = cryptr.encrypt(`+91${phone}`);
        const encryptedpassword = cryptr.encrypt(password);

        const userdata = {
          email: email,
          password: encryptedpassword,
          phone: encryptedphone,
          user: user,
        };
        //Sending an verification link to user's email id
        await user
          .sendEmailVerification({ url: "http://localhost:3000/otp" })
          .then(async () => {
            //Store the users details in localStorage
            window.localStorage.setItem("user", JSON.stringify(userdata));
            setEmail("");
            setPassword("");
            setPhone("");
            toast.success("Email sent");
          });
      } else {
        toast.error("Please fill all the fields");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="profile-authentication-area">
      <div className="d-table">
        <div className="d-table-cell">
          <div className="container">
            <div className="signin-form">
              <h2 style={{ fontWeight: "bold" }}>Register</h2>
              <form>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type={passwordShown ? "text" : "password"}
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordShown ? (
                    <i
                      style={{
                        position: "absolute",
                        marginTop: "7px",
                        marginLeft: "-20px",
                      }}
                      onClick={togglePasswordVisiblity}
                      className="ri-eye-line"
                    >
                      {" "}
                    </i>
                  ) : (
                    <i
                      style={{
                        position: "absolute",
                        marginTop: "7px",
                        marginLeft: "-20px",
                      }}
                      onClick={togglePasswordVisiblity}
                      className="ri-eye-off-line"
                    ></i>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Phone"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="row align-items-center"></div>
                <button onClick={registerWithEmailAndPassword} type="submit">
                  Register
                </button>
                <span className="dont-account">
                  Already have an account? <Link to="/">Sign In Now!</Link>
                </span>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
