import './App.css';
import 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import Home from "./home.jsx";
import About from "./about.jsx";
import Team from "./team.jsx";
import Board from "./board.jsx";
import Gallery from "./gallery.jsx";
import { useEffect, useState} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
       <ScrollToTop />
      <Routes key={location.pathname} location={location}>
       
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/about"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <About />
            </motion.div>
          }
        />
        <Route
          path="/team"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Team />
            </motion.div>
          }
        />
        <Route
          path="/board"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Board />
            </motion.div>
          }
        />
        <Route
          path="/gallery"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Gallery />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <Heading />
      <AnimatedRoutes />
      <Footer />
    </Router>
  );
}


function Heading() {
  const location = useLocation();
  const [path, setPath] = useState("");
  useEffect(() => {
    const path = location.pathname;
    setPath(path);
  }, [location]);
  return (
     <Navbar expand="lg" className="navbar-container">
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
        <p>Any questions? Contact any <Link to = '/board' className='redlink'>board member </Link>or email us at Cornelluniversityttc [at] gmail.com.</p>
        <p>Cornell University Table Tennis Club 2025.</p>
      </div>
    </footer>
  );
}