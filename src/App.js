import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import Fakevoicedetect from "./components/Fakevoicedetect/Fakevoicedetect";
import Footer from "./components/Footer";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./style.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [load, updateLoad] = useState(true);
  const [detectData, setDetectData] = useState({});
  const [fileName, setFileName] = useState("");
  const [reply, setReply] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      updateLoad(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="App" id={load ? "no-scroll" : "scroll"}>
        <Navbar />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/fakevoicedetect"
            element={
              <Fakevoicedetect
                detectData={detectData}
                setDetectData={setDetectData}
                fileName={fileName}
                setFileName={setFileName}
                reply={reply}
                setReply={setReply}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
