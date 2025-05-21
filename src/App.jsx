import './App.css';
import 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Routes, Route, Link, useLocation} from 'react-router-dom';
import Home from "./home.jsx";
import About from "./about.jsx";
import Team from "./team.jsx";
import Board from "./board.jsx";
import Gallery from "./gallery.jsx";
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
        <Navbar.Brand as = {Link} to = "/">
          <div className="site-title">Cornell University Table Tennis</div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav"> {}
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/"><div className = "red-box">Home</div></Nav.Link>
            <Nav.Link as={Link} to="/about"><div className = "red-box">About Us</div></Nav.Link>
            <Nav.Link as={Link} to="/team"><div className = "red-box">Team</div></Nav.Link>
            <Nav.Link as={Link} to="/board"><div className = "red-box">E-Board</div></Nav.Link>
            <Nav.Link as={Link} to="/gallery"><div className = "red-box">Gallery</div></Nav.Link>
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
        <p>Any questions? Contact any board member or email us at Cornelluniversityttc@gmail.com.</p>
        <p>Cornell University Table Tennis Club 2025.</p>
      </div>
    </footer>
  );
}