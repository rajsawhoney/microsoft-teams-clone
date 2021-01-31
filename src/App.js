import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import DashBoard from "./components/DashBoard";
import SignInUp from "./pages/SignInUp";
import { connect } from "react-redux";
import { set_myprofile } from "./redux/actions/accounts/set_myprofile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SnackbarProvider } from "notistack";
import { auth } from "./firebase";
import { setup_socket } from "./redux/actions/socket/setup_socket";
import { setup_pc } from "./redux/actions/socket/setup_pc";
import { toast } from "react-toastify";
import io from "socket.io-client";
import CalleeUI from "./components/medias/CalleeUI";
import { db } from "./firebase";

const ENDPOINT = "/";
function App({ my_profile, setup_socket, socket, isCalling }) {
  const [someoneCalling, setSomeoneCalling] = useState(false);
  const [callerId, setcallerId] = useState(null);
  const [callerProfile, setcallerProfile] = useState(null);

  useEffect(() => {
    async function setSocket_PC() {
      const _socket = await io(ENDPOINT);
      _socket && setup_socket(_socket);
    }
    setSocket_PC();
  }, []);

  useEffect(() => {
    auth.onAuthStateChanged(function (user_) {
      console.log("Auth State changed!!!!!");
      if (user_) {
        set_myprofile(user_.uid);
      }
    });
  }, []);

  useEffect(() => {
    if (my_profile && socket) {
      socket.on("connect", () => {
        console.log("CONNECTION ESTB!!!!!");
      });
      socket.emit(
        "register_user",
        JSON.stringify({ type: "register", userId: my_profile?.userId })
      );
    } else {
      console.log(
        "FAILED TO INITIATE REGISTERATION PROCESS DUE TO ",
        my_profile,
        socket
      );
    }
  }, [socket, my_profile]);

  useEffect(() => {
    socket &&
      socket.on("message", (data) => {
        const dt = JSON.parse(data);

        switch (dt.type) {
          case "open_modal":
            console.log("OPen Mdoal triggerd!");
            setcallerId(dt.caller);
            setSomeoneCalling(true);
            document.getElementById("myModal").style.display = "block";
            break;

          default:
            break;
        }
      });
    // Get the modal
    var modal = document.getElementById("myModal");
    // Get the button that opens the modal
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    // When the user clicks the button, open the modal
    if (someoneCalling) {
      modal.style.display = "block";
    } else {
      modal.style.display = "none";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }, [socket, callerId]);

  useEffect(() => {
    if (callerId) {
      db.collection("user_profiles")
        .doc(callerId)
        .get()
        .then((res) => {
          res.exists && setcallerProfile(res.data());
        })
        .catch((err) => {
          console.log("Failed to get caller Profile...!!!!", err.message);
        });
    }
  }, [callerId, callerProfile]);

  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <SnackbarProvider maxSnack={3}>
          <Switch>
            <Route exact path="/" component={DashBoard} />
            <Route
              path="/accounts/signup"
              render={() => <SignInUp isloginForm={false} />}
            />
            <Route
              path="/accounts/login"
              render={() => <SignInUp isloginForm={true} />}
            />
          </Switch>
        </SnackbarProvider>

        {/* <!-- The Modal --> */}
        <div id="myModal" className="modal">
          {/* <!-- Modal content --> */}
          <div className="modal-content">
            <div className="modal-header">
              <span className="close">&times;</span>
              <h2>You are on a Call with {callerProfile?.displayName}</h2>
            </div>
            <div className="modal-body">
              {someoneCalling && callerId && socket && (
                <CalleeUI
                  my_profile={my_profile}
                  callerProfile={callerProfile}
                  socket={socket}
                />
              )}
            </div>
            <div className="modal-footer">
              <button>Receive</button>
              <button>Hang Up</button>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

const mapStateToProps = (state) => ({
  my_profile: state.accounts.my_profile,
  socket: state.socket.socket,
  isCalling: state.socket.isCalling,
});

export default connect(mapStateToProps, { set_myprofile, setup_socket })(App);
