import './App.css';
import * as React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Routes, Route, Link, useLocation} from 'react-router-dom';
import Home from "./home.jsx";
import About from "./about.jsx";
import Team from "./team.jsx";
import Board from "./board.jsx";
import Gallery from "./gallery.jsx";
import Contact from "./contact.jsx";
import { useEffect, useState} from 'react';

function App() {
  return (
    <Router>
      <Heading />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/board" element={<Board />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;

function Heading() {
  const location = useLocation();
  const [path, setPath] = useState("");
  useEffect(() => {
    const path = location.pathname;
    setPath(path);
  }, [location]);
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as = {Link} to = "/">Cornell University Table Tennis</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav"> {}
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About Us</Nav.Link>
            <Nav.Link as={Link} to="/team">Team</Nav.Link>
            <Nav.Link as={Link} to="/board">E-Board</Nav.Link>
            <Nav.Link as={Link} to="/gallery">Gallery</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact Us</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function Footer() {
  return (
    <footer>
      <div className = "bottomContainer">
        <p>Cornell University Table Tennis Club 2024.</p>
      </div>
    </footer>
  );
}

function dropdown() {
  return (
    <NavDropdown title="About Us" id="basic-nav-dropdown">
              <NavDropdown.Item href="#about/board">E-Board</NavDropdown.Item>
              <NavDropdown.Item href="#about/team">Club Team</NavDropdown.Item>
            </NavDropdown>
            
  );
}

