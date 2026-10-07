import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { ACCESS_TOKEN } from "../../constant";
import "./DocumentPage.css";
import Particle from "../Particle";
import { Button } from "react-bootstrap";

const DocumentPage = (props) => {
  const { id } = useParams();
  const [doc, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // console.log(props.documentsLen);

  useEffect(() => {
    const fetchDocument = async () => {
      const csrfToken = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("csrftoken="))
        ?.split("=")[1];
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const response = await fetch(
          `http://127.0.0.1:8000/api/detection_documents/${id}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRFToken": csrfToken,
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch the document.");
        }
        const data = await response.json();
        setDocument(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="single-document-card-wrapper">
      <Particle />
      <Button
        className="response-button single-document-btn"
        onClick={() => {
          navigate("/documents");
        }}
      >
        Back To Storage
      </Button>
      <div
        key={doc.id}
        className={`${
          props.curId % 2 == 0
            ? "single-document-card-alt"
            : "single-document-card"
        }`}
      >
        <div className="single-document-header">
          <h2 className="single-document-name">{doc.name}</h2>
          <span className="single-document-id">#{props.curId}</span>
        </div>
        <div className="single-document-details">
          <p>
            <span className="label">Confidence:</span>{" "}
            <div>{doc.confidence_score}</div>
          </p>
          <p>
            <span className="label">File Name:</span>{" "}
            <div>{doc.recording_name}</div>
          </p>
          <p>
            <span className="label">AI Analysis: </span>
            {doc.ai_analysis ? (
              <>
                <div
                  style={{
                    boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.55)",
                    maxHeight: "15rem",
                  }}
                >
                  {doc.ai_analysis}
                </div>
              </>
            ) : (
              <div>No analysis generated.</div>
            )}
          </p>
          <p>
            <span className="label">Reply:</span>
            {doc.reply ? (
              <div
                style={{
                  boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.55)",
                  maxHeight: "15rem",
                }}
              >
                {doc.reply}
              </div>
            ) : (
              <div>No reply generated.</div>
            )}
          </p>
          <p>
            <span className="label">Created At:</span>{" "}
            <div>{new Date(doc.created_at).toLocaleString()}</div>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;
