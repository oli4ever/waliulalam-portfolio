import Footer from "./sections/Footer";
// import Contact from "./sections/Contact";
import TechStack from "./sections/TechStack";
import Experience from "./sections/Experience";
import Hero from "./sections/Hero";
import LogoShowcase from "./sections/LogoShowcase";
import FeatureCards from "./sections/FeatureCards";
import Projects from "./sections/Projects.jsx";
import Navbar from "./components/NavBar";

const App = () => (
  <>
    <Navbar />
    <Hero />
    <Projects />
    <LogoShowcase />
    <FeatureCards />
    <Experience />
    <TechStack />
    {/* <Contact /> */}
    <Footer />
  </>
);

export default App;
