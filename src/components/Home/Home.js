import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import homeLogo from "../../Assets/Image (1).png";
import homeLogo1 from "../../Assets/Group 1533 (1).png";
import Particle from "../Particle";
import Type from "./Type";

function Home() {
  return (
    <section style={{ margin: 0, padding: 0 }}>
      <Container fluid className="home-section" id="home" style={{ padding: 0 }}>
        <Particle />
        <Container className="home-content" style={{ padding: 0 }}>
          <Row style={{ margin: 0 }}>
            <Col md={7} className="home-header" style={{ padding: 0 }}>
              <h1 style={{ paddingBottom: 15 }} className="heading">
                "Unmask The Truth in Voices"{" "}
              </h1>

              <h1 className="heading-name">
                Empowered by advanced AI technology, <strong className="main-name"> VOICE DETECT</strong> helps you identify synthetic or altered voices in real time.
              </h1>

              <div style={{ padding: 50, textAlign: "left" }}>
                <Type />
              </div>

              <div className="home-cta-buttons">
                <Link to="/fakevoicedetect">
                  <Button className="primary-cta">Start Detection</Button>
                </Link>
              </div>
            </Col>

            <Col md={5} style={{ paddingBottom: 20, padding: 0 }} className="logo-container">
              <img
                src={homeLogo}
                alt="home pic"
                className="homeLogo"
                style={{ maxHeight: "450px", marginBottom: "-10px" }} // Adjust margin to bring logos closer
              />
              <img
                src={homeLogo1}
                alt="home pic"
                className="homeLogo1"

                style={{ width: "80%", maxHeight: "500px", marginTop: "-20px" }} // Adjust margin to bring logos closer

              />
            </Col>
          </Row>
        </Container>

        <Container className="home-feature-section">
          <h2 className="section-title">Designed for fast, trusted voice analysis</h2>
          <Row className="feature-grid">
            <Col md={4} className="feature-card">
              <div className="feature-card-content">
                <h3>Real-Time Detection</h3>
                <p>Upload or record audio instantly, then get a clean verdict in seconds.</p>
              </div>
            </Col>
            <Col md={4} className="feature-card">
              <div className="feature-card-content">
                <h3>AI Explanation</h3>
                <p>Receive a clear summary of why the system flagged a voice as synthetic or genuine.</p>
              </div>
            </Col>
            <Col md={4} className="feature-card">
              <div className="feature-card-content">
                <h3>100% Offline Ready</h3>
                <p>Complete voice feature extraction and classification with zero cloud dependence.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </Container>
    </section>
  );
}

export default Home;
