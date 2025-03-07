
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Container from "../ui/Container";
import GlassMorphism from "../ui/GlassMorphism";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/course-generator" },
    { name: "Interview", href: "/mock-interview" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3" : "py-5"
      }`}
    >
      <GlassMorphism
        className={`w-full transition-all duration-300 ${
          isScrolled ? "bg-white/70 dark:bg-black/70" : "bg-white/30 dark:bg-black/30"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold transition-opacity hover:opacity-80"
            >
              <span className="text-gradient">InterviewGenius</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground/80"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full transition-colors"
              >
                My Dashboard
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </Container>
      </GlassMorphism>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <GlassMorphism 
          className="md:hidden fixed inset-x-0 top-[5.5rem] h-screen z-50 p-6 flex flex-col space-y-8"
          intensity="heavy"
        >
          <nav className="flex flex-col space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-lg font-medium transition-all duration-200 ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/80"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col space-y-4 pt-4 border-t border-border">
            <Link
              to="/dashboard"
              className="w-full px-4 py-3 text-center text-white font-medium bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              My Dashboard
            </Link>
          </div>
        </GlassMorphism>
      )}
    </header>
  );
};

export default Navbar;
