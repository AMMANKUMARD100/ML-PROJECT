import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

function VoiceStorage() {
  return (
    <Container className="mt-5">
      <Col className = "justify-content-center">
       <h1
          style={{
          fontFamily: "Poppins",
          fontSize: "4rem",
          paddingTop: "80px",
          paddingBottom: "80px",
          }}
        >
          <strong className="purple">Your Voice Storage</strong>
        </h1>
      <Row className="justify-content-center">
          {/* Family Voices Storage */}
          <Col md={5} className="mb-4">
            <Card className = "common-card1">
              <Card.Header className="card-des1">
                <h4>Family Voices</h4>
              </Card.Header>
              <Card.Body>
                <ul>
                  <li>Dad_Recording.wav</li>
                  <li>Mom_Laugh.wav</li>
                  <li>Sibling_Song.wav</li>
                </ul>
                <Button className="button-add1">
                  Add Family Voice
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Voices to Be Detected Storage */}
          <Col md={5} className="mb-4">
            <Card className = "common-card2">
              <Card.Header className="card-des2">
                <h4>Voices to Be Detected</h4>
              </Card.Header>
              <Card.Body>
                <ul>
                  <li>Unknown_Voice1.wav</li>
                  <li>Suspicious_Recording.wav</li>
                  <li>Voice_to_Analyze.wav</li>
                </ul>
                <Button variant="danger" className="button-add2">
                  Add Voice to Detect
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>
    </Container>
  );
}

export default VoiceStorage;
