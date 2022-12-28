import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cryptr from "cryptr";
import { auth } from "../Firebase";
import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
} from "firebase/auth";
import "./login.css";
import Lottie from "lottie-react";
import animationData from "../assets/two-factor-authentication.json";
import { useHistory } from "react-router-dom";

const Otpscreen = () => {
  const [otp, setotp] = useState("");

  const cryptr = new Cryptr("myTotallySecretKey");
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };
  const [verification, setverification] = useState("");
  const history = useHistory();
  useEffect(() => {
    //get the user data from localStorage
    const getdata = JSON.parse(window.localStorage.getItem("user"));
    //if the data is null than redirect back to registerd page
    if (getdata === null) {
      history.push("/register");
    }
    sentotp(getdata);
    //set user in state
  }, []);

  const sentotp = async (getdata) => {
    /* A listener that triggers whenever the authentication state changes. */
    auth.onAuthStateChanged(async (user) => {
      /* Decrypting the phone number that was encrypted in the previous step. */
      const decryptedphone = cryptr.decrypt(getdata.phone);
      /* Creating a new recaptcha verifier. */
      const recaptchaVerifier = new RecaptchaVerifier(
        "2fa-captcha",
        { size: "invisible" },
        auth
      );
      recaptchaVerifier.render();
      await multiFactor(user)
        .getSession()
        .then(function (multiFactorSession) {
          // Specify the phone number and pass the MFA session.
          const phoneInfoOptions = {
            phoneNumber: decryptedphone,
            session: multiFactorSession,
          };

          const phoneAuthProvider = new PhoneAuthProvider(auth);

          // Send SMS verification code.
          return phoneAuthProvider.verifyPhoneNumber(
            phoneInfoOptions,
            recaptchaVerifier
          );
        })
        .then(function (verificationId) {
          setverification(verificationId);
        });
    });
  };
  const verifyotp = async (e) => {
    e.preventDefault();
    try {
      //get the OTP from user nad pass in PhoneAuthProvider
      const cred = PhoneAuthProvider.credential(verification, otp);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      const user = auth.currentUser;
      /* Enrolling the user in the multi-factor authentication. */
      await user.multiFactor
        .enroll(multiFactorAssertion, "phone number")
        .then((enrollment) => {
          history.push("/home");
        });
      /* Removing the user from localStorage. */
      localStorage.removeItem("user");
    } catch (err) {
        toast.error("Invalid OTP");
      console.log(err);
    }
  };
  return (
    <>
      <div
        className="otpscreen"
        style={{ display: "flex", flexWrap: "nowrap" }}
      >
        <Lottie
          animationData={animationData}
          loop={true}
          autoPlay={true}
          className="lottie"
          style={{ maxWidth: "20%", margin: "0 auto" }}
        />
        <div className="profile-authentication-area">
          <div className="d-table">
            <div className="d-table-cell">
              <div className="container">
                <div className="signin-form">
                  <h2 style={{ fontWeight: "bold" }}>Enter OTP</h2>
                  <form>
                    <div className="form-group">
                      <input
                        type={passwordShown ? "text" : "password"}
                        className="form-control"
                        placeholder="OTP"
                        value={otp}
                        onChange={(e) => setotp(e.target.value)}
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

                    <div className="row align-items-center"></div>
                    <button onClick={verifyotp} type="submit">
                      Verify
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div
            id="2fa-captcha"
            style={{ display: "flex", justifyContent: "center" }}
          ></div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Otpscreen;
