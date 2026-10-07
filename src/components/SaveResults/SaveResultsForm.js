import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Particle from "../Particle";
import { ACCESS_TOKEN } from "../../constant";
import { Navigate, useNavigate } from "react-router-dom";
import "./SaveResultsForm.css";

const SaveResultsForm = (props) => {
  const [name, setName] = useState("");
  // const [file, setFile] = useState(null);
  // const [detectionResult, setDetectionResult] = useState("");
  // const [confidence, setConfidence] = useState(0);
  const [details, setDetails] = useState(
    props.detectData.ai_analysis
    // ?.replaceAll(new RegExp("ENDHEADLINE!!!", "g"), "")
    // .replaceAll(new RegExp("ENDPARAGRAPH!!!", "g"), "")
  );
  const [message, setMessage] = useState("");
  console.log(props.reply);

  const [reply, setReply] = useState(props.reply);

  const navigate = useNavigate();

  useEffect(() => {
    if (
      !props.detectData.ai_analysis ||
      !props.detectData.confidence ||
      !props.detectData.result
    ) {
      navigate("/fakevoicedetect");
      alert("No results to save. Please upload a recording first!");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("fileName", props.fileName);
    formData.append("result", props.detectData.result);
    formData.append("confidence", props.detectData.confidence);
    formData.append("details", details);
    formData.append("reply", reply);

    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log(token);

      const csrfToken = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("csrftoken="))
        ?.split("=")[1];

      const response = await fetch(
        "http://127.0.0.1:8000/api/save_detection_document/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFToken": csrfToken,
          },
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      } else {
        const result = await response.json();
        setMessage("File uploaded successfully!");
        console.log("Success:", result);
        navigate("/documents");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("An error occurred during submission.");
    }
  };

  return (
    <div className="SaveSection" style={{width: "100%", minHeight: "100vh"}}>
      <Particle/>
    <div className="SaveSection2">
      <form className="form2" onSubmit={handleSubmit} encType="multipart/form-data" style={{zIndex: "1000"}}>
        <input
          type="text"
          name="name"
          placeholder="Document Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input type="text" name="fileName" value={props.fileName} disabled />
        <input
          type="text"
          name="result"
          value={props.detectData.result}
          disabled
        />
        <input
          type="text"
          name="confidence"
          value={props.detectData.confidence}
          disabled
        />
        <textarea
          name="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        ></textarea>
        <textarea
          name="reply"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        ></textarea>
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
    </div>
  );
};

export default SaveResultsForm;
