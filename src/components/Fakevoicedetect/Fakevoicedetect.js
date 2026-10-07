import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Spinner,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import Particle from "../Particle";
import "../../style.css";
import homeLogo1 from "../../Assets/Group 1533 (1).png";
import Analysis from "./Analysis";
import { useNavigate } from "react-router-dom";
import Reply from "./Reply";
import Micro from "../../Assets/micro.png";

// Utility function to convert AudioBuffer to WAV
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length minus RIFF identifier length and file description length
  view.setUint32(4, bufferLength - 8, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, format, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * blockAlign, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function About(props) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessing2, setIsProcessing2] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [tmp, setTmp] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  //const [isDetectClicked, setIsDetectedClicked] = useState(false);
  const [reading, setReading] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    props.setReply("");
    
    // Check for required browser features and permissions
    const checkPermissions = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("MediaRecorder API not supported in this browser");
          alert("Audio recording is not supported in this browser. Please use a modern browser like Chrome or Firefox.");
          return;
        }

        // Check microphone permission
        const result = await navigator.permissions.query({ name: 'microphone' });
        console.log("Microphone permission status:", result.state);
        
        if (result.state === 'denied') {
          alert("Microphone access is blocked. Please allow microphone access in your browser settings.");
        }
      } catch (err) {
        console.error("Error checking permissions:", err);
      }
    };

    checkPermissions();
  }, []);

  const synth = window.speechSynthesis;
  const speak = (text) => {
    if (!synth) {
      alert("SpeechSynthesis API is not supported in this browser");
      return;
    }

    if (synth.speaking) {
      synth.cancel();
      return;
    }

    const utterThis = new SpeechSynthesisUtterance(text);

    utterThis.onend = function (e) {
      console.log("Has finished speaking.");
    };
    utterThis.onerror = function (e) {
      console.log("Has encountered an error while attempting speaking.");
    };

    synth.speak(utterThis);
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const validExtensions = [".wav", ".mp3", ".flac", ".ogg", ".m4a"];
      const fileNameLower = uploadedFile.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileNameLower.endsWith(ext)) || uploadedFile.type.startsWith("audio/");
      
      if (isValid) {
        setFile(uploadedFile);
        props.setFileName(uploadedFile.name);
        setResult("");
        setUploadSuccess(true);
      } else {
        setUploadSuccess(false);
        setResult("Please upload an audio file (.wav, .mp3, .flac, .ogg, .m4a).");
      }
    }
  };

  const handleDetect = async () => {
    if (!file) {
      alert("Please upload a file before detection.");
      return;
    }

    setIsProcessing(true);
    setResult(""); 

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/detect/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      // Add debug logging
      console.log("Full API response:", data);
      
      if (!response.ok) {
        throw new Error(`API Error: ${data.error}\nTraceback: ${data.traceback}`);
      }

      setTmp(data.speech_to_text || "[No Transcript. Audio unintelligible.]");
      
      if (data.result) {
        setResult(`Detected as: ${data.result}${
          data.confidence ? ` (Confidence: ${data.confidence.toFixed(2)}%)` : ''
        }`);
        setAiAnalysis(data.ai_analysis);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Full error details:", error);
      setResult(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const fileInputRef = React.createRef(); // Reference to the file input

  const handleCustomButtonClick = () => {
    fileInputRef.current.click(); // Trigger the file input click event
  };

  const navigate = useNavigate();
  const handleSaveResults = () => {
    if (!props.isLoggedIn) {
      alert("You have to Log In before Saving Documents");
    } else navigate("/saveresults");
    // navigate("/test");
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Click here if you're hesitant to answer the call
    </Tooltip>
  );
  
  const handleRespond = async () => {
    setIsProcessing2(true);
    props.setReply("Generating Reply..."); // Clear previous results

    try {
      const response = await fetch("http://localhost:8000/api/reply/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: tmp }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const data = await response.json();
      props.setReply(data.reply);
    } catch (error) {
      console.error("Error during reply generation:", error);

      if (error.message.includes("Failed to fetch")) {
        props.setReply(
          "Unable to connect to the server. Please check your network connection."
        );
      } else if (error.message.includes("HTTP error")) {
        props.setReply(`Server error: ${error.message}`);
      } else {
        props.setReply(
          "An unexpected error occurred during response generation."
        );
      }
    } finally {
      setIsProcessing2(false);
    }
  };

  const handleCopyReply = () => {
    if (!navigator.clipboard) {
      alert("Copy is not supported in this browser.");
      return;
    }

    navigator.clipboard
      .writeText(props.reply)
      .then(() => {
        alert("Reply copied to clipboard.");
      })
      .catch((error) => {
        console.error("Clipboard error:", error);
        alert("Unable to copy reply. Please try manually.");
      });
  };

  const handleDownloadReport = () => {
    const reportContent = `VoiceDetect Report\n\nFile: ${props.fileName || "recording.wav"}\n\nTranscript:\n${tmp || "No transcript available."}\n\nDetection Result:\n${result || "No result yet."}\n\nAI Analysis:\n${aiAnalysis || "No AI analysis available."}\n\nSuggested Reply:\n${props.reply || "No reply generated."}\n`;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "voicedetect-report.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleRecording = async () => {
    if (!isRecording) {
      try {
        // Check supported MIME types
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
        
        console.log("Using MIME type:", mimeType);
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            channelCount: 1,
            sampleRate: 44100,
            sampleSize: 16,
            echoCancellation: true,
            noiseSuppression: true
          } 
        });
        
        console.log("Audio stream obtained:", stream);
        
        mediaRecorder.current = new MediaRecorder(stream, {
          mimeType: mimeType
        });
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (event) => {
          console.log("Data chunk received:", event.data.size);  // Debug log
          audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = () => {
          console.log("Recording stopped, chunks:", audioChunks.current.length);  // Debug log
          setShowPopup(true);
        };

        mediaRecorder.current.onerror = (event) => {
          console.error("MediaRecorder error:", event.error);  // Debug log
        };

        mediaRecorder.current.start(1000); // Record in 1-second chunks
        console.log("Recording started");  // Debug log
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Error accessing microphone. Please ensure you have given permission and are using a supported browser.");
      }
    } else {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
        console.log("Recording stopping...");  // Debug log
        
        // Stop all tracks in the stream
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };

  const handleDownload = async () => {
    try {
      console.log("Processing recording...");  // Debug log
      
      // Convert to WAV using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const blob = new Blob(audioChunks.current, { type: 'audio/webm;codecs=opus' });
      console.log("Blob created, size:", blob.size);  // Debug log
      
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create WAV file
      const wavBuffer = audioBufferToWav(audioBuffer);
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      
      // Create a File object from the Blob
      const wavFile = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
      console.log("WAV file created, size:", wavFile.size);  // Debug log
      
      // Set the file for detection
      setFile(wavFile);
      props.setFileName('recording.wav');
      setUploadSuccess(true);
      
      // Download the file
      const audioUrl = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'recording.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(audioUrl);  // Clean up
      setShowPopup(false);
      
      console.log("Download process completed");  // Debug log
    } catch (error) {
      console.error("Error in handleDownload:", error);
      alert("Error processing the recording. Please try again.");
    }
  };

  return (
    <Container fluid className="foicedetect-section" style={{ position: 'relative' }}>
      <Particle style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
      <Container>
        <Row style={{ justifyContent: "center", padding: "10px" }}>
          <Col
            md={7}
            style={{
              justifyContent: "center",
              paddingTop: "30px",
              paddingBottom: "50px",
            }}
          >
            <h1
              style={{
                fontFamily: "Poppins",
                fontSize: "4rem",
                paddingTop: "50px",
              }}
            >
              <strong className="purple">Voice Detection</strong>
            </h1>

            <img
              src={homeLogo1}
              alt="homelogo1"
              className="detect-icon"
              style={{ width: "100%" }}
            />

            <Form>
              <Form.Group
                controlId="fileUpload"
                className="mb-3"
                style={{ position: "relative" }}
              >
                <Form.Label style={{ fontFamily: "Poppins", color: "#B7E9FF" }}>
                  Upload a Recording (e.g., .wav, .mp3, .flac)
                </Form.Label>
                {/* Hidden file input */}
                <Form.Control
                  type="file"
                  accept="audio/*,.wav,.mp3,.flac,.ogg,.m4a"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{
                    display: "none", // Hide the default file input
                    position: "absolute", // Ensure it's positioned correctly
                    zIndex: -1, // Make sure it's below the button
                  }}
                />
                {/* Custom button to trigger file input */}
                <Button
                  variant="secondary"
                  onClick={handleCustomButtonClick}
                  style={{
                    marginLeft: "10px",
                    position: "relative", // Ensure the button is above the file input
                    zIndex: 1, // Bring the button above the hidden input
                  }}
                >
                  Choose File
                </Button>
              </Form.Group>
            </Form>

            {uploadSuccess && !isProcessing && (
              <div className="mt-3">
                <h3 style={{ fontFamily: "Poppins", color: "#B7E9FF" }}>
                  File uploaded successfully!
                </h3>
              </div>
            )}

            <Col style={{ 
              justifyContent: "center", 
              padding: "10px", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: "20px" 
            }}>
              <button 
                onClick={handleRecording}
                style={{
                  backgroundColor: isRecording ? '#CF3038' : '#2f5233',
                  width: "60px",
                  height: "60px",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "none",
                  borderRadius: "50%",
                  transition: "all 0.3s ease",
                  position: "relative",
                  zIndex: 2
                }}
                className="record-button"
                title={isRecording ? "Stop Recording" : "Start Recording"}
              >
                {isRecording ? 'STOP' : <img 
                  src={Micro} 
                  className="micro-button"
                  alt="Record audio" 
                  style={{ 
                    width: "25px",
                    height: "25px",
                    margin: "0",
                    transition: "transform 0.3s ease"
                  }}
                />}
              </button>

              <Button
                className="detect-button"
                variant="primary"
                onClick={handleDetect}
                disabled={isProcessing || !file}
                style={{
                  width: "auto",
                  minWidth: "150px",
                  padding: "8px 20px"
                }}
              >
                {isProcessing ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Detect"
                )}
              </Button>
            </Col>
            

            {result && (
              <div className="mt-3">
                <h2 style={{ fontFamily: "Poppins", color: "#B7E9FF" }}>
                  <strong>{result}</strong>
                </h2>
                <Analysis aiAnalysis={aiAnalysis} />
              </div>
            )}

            {/* <div style = {{ margin: "30px", textAlign: "center"}}> */}
            {/* <OverlayTrigger placement = "top" overlay={renderTooltip}>   */}
            {result && (
              <Button className="response-button" onClick={handleRespond}>
                {isProcessing2 ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    {props.reply
                      ? "Generate Another Response?"
                      : "FAKE VOICE? Here's How To Respond"}
                  </>
                )}
              </Button>
            )}
            {props.reply !== "" && !isProcessing2 && (
              <Button
                style={{ marginLeft: "3em" }}
                className="response-button"
                onClick={(e) => {
                  setReading(reading + 1);
                  speak(props.reply);
                }}
              >
                {reading % 2 === 0 ? "Read Aloud" : "Stop Reading"}
              </Button>
            )}

            {props.reply !== "" && !isProcessing2 && (
              <Button
                className="response-button"
                onClick={handleCopyReply}
                style={{ marginLeft: "1em" }}
              >
                Copy Guidance
              </Button>
            )}

            {props.reply !== "" && !isProcessing2 && (
              <Button
                className="response-button"
                onClick={handleDownloadReport}
                style={{ marginLeft: "1em" }}
              >
                Download Report
              </Button>
            )}

            {props.reply !== "" && !isProcessing2 && (
              <Reply reply={props.reply} />
            )}

            

            {/* </OverlayTrigger> */}
            {/* </div> */}

            {/* Download Popup */}
            {showPopup && (
              <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                color: 'black',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                textAlign: 'center',
                zIndex: 1001
              }}>
                <p style={{fontSize: "17px", fontWeight: "bold"}}>RECORDING COMPLETE!</p>
                <p style={{fontSize: "15px"}}>Click below to save your file.</p>
                <button
                  onClick={handleDownload}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    margin: '5px'
                  }}
                >
                  Download
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    margin: '5px'
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default About;
