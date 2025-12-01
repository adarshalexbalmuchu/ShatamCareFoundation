import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getImagePath } from '../utils/imagePaths';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Use the proper image path function
  const logoPath = getImagePath('images/Team/SC_LOGO-removebg-preview.png');

  // Check if we are on the homepage
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (isHomePage) {
      // If we are on the homepage, just scroll
      const section = document.getElementById(sectionId);
      if (section) {
        const headerOffset = 80; // Adjust if your header height is different
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    } else {
      // If on another page, navigate to homepage and then scroll to section
      navigate('/');
      // Wait for navigation and then scroll
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          const headerOffset = 80;
          const elementPosition = section.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const navLinks = [
    { label: "Home", sectionId: "home" },
    { label: "Our Mission", sectionId: "mission" },
    { label: "Events", sectionId: "events" },
    { label: "Programs", sectionId: "programs" },
    { label: "Impact", sectionId: "impact" },
    { label: "Our Founder", sectionId: "founder" }
  ];

  // Hidden admin access: detect rapid double (or triple) click on logo for more reliability across devices
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = window.setTimeout(() => {
      clickCountRef.current = 0;
    }, 500); // 500ms window for multi-click

    if (clickCountRef.current >= 2) { // require 2 rapid clicks
      e.preventDefault();
      clickCountRef.current = 0;
      navigate('/admin/login'); // Navigate to login page first, not directly to admin
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm transition-shadow duration-300
      ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        
        {/* Logo */}
        <div className="flex-shrink-0 ml-4" title=" " aria-label="Site logo">
          <Link to="/" onClick={handleLogoClick} aria-label="Shatam Care Foundation">
            <img 
              src={logoPath} 
              alt="Shatam Care Foundation" 
              className="h-14 w-auto object-contain cursor-pointer select-none"
              draggable={false}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={`#${link.sectionId}`}
              onClick={(e) => handleNavClick(e, link.sectionId)}
              className="font-medium text-gray-700 transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            className="ml-2 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <nav className="container mx-auto flex flex-col px-4 py-4">
            {navLinks.map((link) => (
              <a 
                key={link.label}
                href={`#${link.sectionId}`} 
                onClick={(e) => handleNavClick(e, link.sectionId)}
                className="w-full py-2 text-lg"
              >
                {link.label}
              </a>
            ))}
            {/* Admin link removed from mobile menu (hidden access via logo multi-click) */}
            {/* Removed Donate button */}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;