import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import { Redirect, Link } from "react-router-dom";
import "./SignInUp.css";
import { connect } from "react-redux";
import { signup } from "../redux/actions/accounts/signup";
import { login } from "../redux/actions/accounts/login";
import { auth_status } from "../redux/actions/accounts/auth_status";
import PropTypes from "prop-types";
import { create_profile } from "../redux/actions/accounts/create_profile";
import { set_myprofile } from "../redux/actions/accounts/set_myprofile";
import ProfileLoader from "../components/Utils/ProfileLoader";
import microsoft_icon from "./microsoft_icon.jpg";
import { toast } from "react-toastify";

const SignInUp = ({
  isAuthenticated,
  isloginForm,
  signup,
  login,
  create_profile,
  auth_status,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        auth_status(user, true);
      } else {
        auth_status(null, false);
      }
    });
  }, [isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    if (!isloginForm && username && password && password2) {
      if (password !== password2) {
        toast.error(
          `😞😥 Failed!!! Passwords are not matching. Please check the passwords and try again!!!!`
        );
        setIsProcessing(false);
        return;
      }
      let isprocessed = signup(username, password);
      auth.onAuthStateChanged(function (user) {
        if (user) {
          create_profile(
            user.uid,
            user?.displayName ? user?.displayName : user?.email,
            "One day you'll just be a memory to some people, so do your best to be the good one...",
            user?.photoURL
              ? user?.photoURL
              : "https://toppng.com/uploads/preview/black-and-white-stockportable-network-account-icon-11553436383dwuayhjyvo.png"
          );
          set_myprofile(user?.uid);
        }
      });
      if (isprocessed) {
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }
    } else if (isloginForm && username && password) {
      let isprocessed = login(username, password);
      if (isprocessed) {
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    auth
      .signInWithPopup(googleProvider)
      .then((res) => {
        const profile = res.user;
        auth_status(profile, true);
        create_profile(
          profile?.uid,
          profile?.displayName ? profile.displayName : profile.email,
          "One day you'll just be a memory to some people, so do your best to be the good one...",
          profile?.photoURL
            ? profile.photoURL
            : "https://toppng.com/uploads/preview/black-and-white-stockportable-network-account-icon-11553436383dwuayhjyvo.png"
        );
        set_myprofile(profile?.uid);
      })
      .catch((err) => auth_status(null, false));
  };

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }
  return (
    <div className="signinup__main">
      <div className="signinup__body">
        <div className="signinup__header">
          <img className="company__icon" src={microsoft_icon} alt="icon" />

          <h2 className="text-center text-muted">
            {isloginForm ? "User Login" : "User Registration"}
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              required
              className="form-control"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            <div className="form-text">Please enter a valid email address.</div>
          </div>
          <div className="form-group">
            <input
              required
              type="password"
              className="form-control"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <div className="form-text">
              Please enter a super strong password.
            </div>
          </div>

          {!isloginForm ? (
            <div className="form-group">
              <input
                required
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                onChange={(e) => setPassword2(e.target.value)}
                value={password2}
              />
              <div className="form-text">
                Please enter the same password as above to confirm it.
              </div>
            </div>
          ) : (
            ""
          )}
          <center>{isProcessing && <ProfileLoader />}</center>
          <button className="submit__btn" type="submit">
            {isloginForm ? "Login" : "SignUp"}
          </button>

          {isloginForm ? (
            <Link className="alternatives" to="/accounts/signup">
              Not Registered???
            </Link>
          ) : (
            <Link className="alternatives" to="/accounts/login">
              Already have an account??
            </Link>
          )}
        </form>
        <br />
        <center className="Or">OR</center>
        <button className="login__withGoogle" onClick={handleGoogleLogin}>
          <img
            src="https://cdn.imgbin.com/24/8/13/imgbin-google-logo-google-search-google-account-redes-AuTzUH1utM625K7WcwV1frrmn.jpg"
            className="google_icon"
            alt="google-icon"
          />
          <p>Login with Google</p>
        </button>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.accounts.isAuthenticated,
});

SignInUp.propTypes = {
  isAuthenticated: PropTypes.bool,
  signup: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  create_profile: PropTypes.func.isRequired,
  auth_status: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, {
  signup,
  login,
  auth_status,
  create_profile,
  set_myprofile,
})(SignInUp);
