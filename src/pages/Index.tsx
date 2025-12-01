import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Menu, X, Heart, Users, Home, Award, Phone, Mail, MapPin, MessageCircle, Calendar, Clock, MapPinIcon, Star, Shield, CheckCircle, ArrowRight, Play, BookOpen } from 'lucide-react';
// FIX: Duplicate React import removed
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getEvents, getPrograms, getSiteSettings, type EventForDisplay, type ProgramForDisplay, type SiteSettings } from '@/lib/supabase-secure';
import { safeInitAnimations, initSmoothScroll, initLoadingAnimation, initMobileOptimizations, refreshScrollTrigger, cleanupAnimations } from '@/utils/animations-simple';
import { getImagePath, getBackgroundImagePath, imagePaths, preloadCriticalImages, preloadNearbyImages, preloadHeroImage, optimizeImageLoading, fallbackImageDataUrl } from '@/utils/imagePaths';
import { fixImageUrl } from '@/utils/imageUrlFixer';
import { throttle } from '@/utils/performance';
import { createSafeImageProps } from '@/utils/robust-image-handler';
import { SafeImage } from '@/components/SafeImage';
import ContactForm from '@/components/ContactForm';
import NewsletterSignup from '@/components/NewsletterSignup';
import EventRegistrationModal from '@/components/EventRegistrationModal';
import BackToTopButton from '@/components/BackToTopButton';
import { enhanceAriaAttributes, announceToScreenReader } from '@/utils/accessibility';
import LoadingSpinner from '@/components/LoadingSpinner';

const ICON_MAP = {
  Heart, Users, BookOpen, Home, Award, Shield, MessageCircle, Calendar, Phone, Mail, MapPin
} as const;

// Fallback programs with working image paths
const FALLBACK_PROGRAMS = [
  {
    icon: 'Heart',
    title: 'Elderly Care Therapy Kit',
    description: 'Comprehensive therapy tools designed for holistic elderly care and cognitive wellness.',
    image_url: 'images/Brain Kit/kit.jpg',
    impact_text: 'Elderly Support'
  },
  {
    icon: 'Users', 
    title: 'Caregiver Training Program',
    description: 'Professional training for family and professional caregivers in comprehensive elderly care.',
    image_url: 'images/Caregivers/training.jpg',
    impact_text: 'Professional Skills'
  }
];

const Index = () => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [databaseEvents, setDatabaseEvents] = useState<EventForDisplay[]>([]);
  const [databasePrograms, setDatabasePrograms] = useState<ProgramForDisplay[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [isProgramsLoading, setIsProgramsLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsEventsLoading(true);
        setIsProgramsLoading(true);
        const [events, programs] = await Promise.all([getEvents(), getPrograms()]);
        if (isMounted) {
          setDatabaseEvents(events);
          setDatabasePrograms(programs);
        }
      } catch (error) {
        if (isMounted) console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setIsEventsLoading(false);
          setIsProgramsLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Fetch site settings for dynamic social links
  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        setIsSettingsLoading(true);
        const settings = await getSiteSettings();
        if (active) setSiteSettings(settings);
      } catch (e) {
        console.warn('Failed to load site settings; using fallback social links', e);
      } finally {
        if (active) setIsSettingsLoading(false);
      }
    };
    loadSettings();
    return () => { active = false; };
  }, []);

  const getIconComponent = useCallback((iconName: string) => {
    return ICON_MAP[iconName as keyof typeof ICON_MAP] || Heart;
  }, []);

  const programs = useMemo(() => {
    const programsToUse = databasePrograms && databasePrograms.length > 0 ? databasePrograms : FALLBACK_PROGRAMS;
    return programsToUse.map(program => {
      const imagePath = program.image_url ? getImagePath(program.image_url) : getImagePath('images/fallback.svg');
      return {
        icon: getIconComponent(program.icon),
        title: program.title,
        description: program.description,
        image: imagePath,
        impact: program.impact_text
      };
    });
  }, [databasePrograms, getIconComponent]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 80;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initializePage = () => {
      if (!isMounted) return;
      try {
        safeInitAnimations();
        initSmoothScroll();
        preloadCriticalImages();
      } catch (error) {
        console.error('Failed to initialize animations:', error);
      }
    };
    const timer = setTimeout(initializePage, 100);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      cleanupAnimations();
    };
  }, []);

  // Legacy image error handler - replaced with robust-image-handler
  // const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, imageSrc: string) => {
  //   if (!e.currentTarget.src.startsWith('data:image/svg+xml')) {
  //     console.warn(`Failed to load image: ${imageSrc}`);
  //     e.currentTarget.src = fallbackImageDataUrl;
  //     e.currentTarget.onerror = null;
  //   }
  // };

  const impactStats = [{ number: "7", label: "Cities Reached", description: "Expanding across India" }, { number: "3,600+", label: "Care Sessions", description: "Elderly care support delivered" }, { number: "1,500+", label: "Caregivers Trained", description: "Professional certification provided" }, { number: "800+", label: "Families Supported", description: "Through our programs" }, { number: "120+", label: "Elderly Served", description: "With dignified care" }];
  const trustIndicators = [{ icon: Shield, text: "80G Tax Benefits", subtext: "Government Approved" }, { icon: CheckCircle, text: "100% Secure Payments", subtext: "SSL Encrypted" }, { icon: Award, text: "Transparent Reporting", subtext: "Annual Impact Reports" }];
  
  const getEventType = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('workshop')) return 'Workshop';
    if (titleLower.includes('support')) return 'Support Group';
    return 'Event';
  };

  // Helper function to get the correct image URL (handles both local paths and Supabase URLs)
  const getImageUrl = useCallback((imageUrl: string | null | undefined): string => {
    if (!imageUrl) return '';
    
    // If it's already a full URL (Supabase Storage), return it as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a local path, use fixImageUrl for backward compatibility
    return fixImageUrl(imageUrl);
  }, []);
  
  const eventImages = useMemo(() => ({ 
    'Workshop': imagePaths.caregivers.training, 
    'Support Group': imagePaths.caregivers.sessions, 
    'Therapy': imagePaths.users.care, 
    'Fundraiser': imagePaths.users.eha1, 
    'Event': imagePaths.caregivers.sessions 
  }), []);

  const allUpcomingEvents = useMemo(() => {
    if (!databaseEvents) return [];
    return databaseEvents.map(event => {
      const eventType = getEventType(event.title);
      // Fix any problematic image URLs from the database, fallback to type-based images
      const finalImage = event.image_url 
        ? getImageUrl(event.image_url)
        : eventImages[eventType as keyof typeof eventImages] || eventImages['Event'];
      return { id: event.id, title: event.title, date: event.date, time: event.time, location: event.location, type: eventType, description: event.description, image: finalImage, spots: event.spots };
    });
  }, [databaseEvents, eventImages, getImageUrl]);
  
  const upcomingEvents = allUpcomingEvents.slice(0, 4);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  const getEventTypeColor = (type: string) => {
    const colorMap: Record<string, string> = { 'Workshop': 'bg-warm-teal text-white', 'Support Group': 'bg-sage-600 text-white', 'Therapy': 'bg-blue-600 text-white', 'Fundraiser': 'bg-sunrise-orange text-white' };
    return colorMap[type] || 'bg-gray-600 text-white';
  };

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
      
      <main id="main-content">
        <section id="home" className="relative overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: getBackgroundImagePath('images/Users/care.jpg') }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-dark-charcoal/70 to-dark-charcoal/50 z-10"></div>
          <div className="relative z-20 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 font-poppins">
                  Because Every Elder <span className="block text-warm-teal-200">Deserves Dignity</span>
                </h1>
                <p className="text-xl lg:text-2xl text-white mb-12 max-w-4xl mx-auto leading-relaxed">
                  Empowering caregivers, supporting elderly individuals, and building comprehensive elderly care solutions across India with compassion and dignity.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button size="lg" className="btn-cta text-lg px-12 py-4" onClick={() => scrollToSection('events')}>
                    <Heart className="mr-2 h-5 w-5" /> Join Our Next Events
                  </Button>
                  <Button size="lg" className="border-2 border-white text-white bg-white/10 hover:bg-white hover:text-dark-charcoal font-semibold px-12 py-4 rounded-full text-lg transition-all duration-300 backdrop-blur-sm" onClick={() => scrollToSection('contact')}>
                    <ArrowRight className="mr-2 h-5 w-5" /> Connect With Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="mission" className="section-padding bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-dark-charcoal mb-6 font-poppins">Our Foundation</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-warm-teal to-sunrise-orange mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Building a compassionate ecosystem where every elderly person receives dignified care and every caregiver is empowered with professional skills.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-warm-teal-50 to-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-warm-teal rounded-full flex items-center justify-center mx-auto mb-6"><Heart className="h-8 w-8 text-white" /></div>
                  <h3 className="text-xl font-semibold text-dark-charcoal mb-4 font-poppins">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">A society where aging with dignity is a reality for every Indian elder.</p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-sunrise-orange-50 to-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-sunrise-orange rounded-full flex items-center justify-center mx-auto mb-6"><Users className="h-8 w-8 text-white" /></div>
                  <h3 className="text-xl font-semibold text-dark-charcoal mb-4 font-poppins">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">Empowering caregivers and creating comprehensive elderly care solutions that promote dignity and well-being.</p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-sage-50 to-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-sage-600 rounded-full flex items-center justify-center mx-auto mb-6"><Award className="h-8 w-8 text-white" /></div>
                  <h3 className="text-xl font-semibold text-dark-charcoal mb-4 font-poppins">Our Values</h3>
                  <p className="text-gray-600 leading-relaxed">Compassion, dignity, transparency, and community-driven impact.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="events" className="section-padding bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-dark-charcoal mb-6 font-poppins">Join Our Next Events</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-warm-teal to-sunrise-orange mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Elderly care workshops, caregiver support groups, and community events designed to empower and connect
              </p>
            </div>
            {isEventsLoading ? (
              <div className="flex flex-col items-center justify-center py-12"><LoadingSpinner /> <p className="text-gray-600 mt-4">Loading events...</p></div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="event-card bg-white hover:shadow-2xl transition-all duration-500 border-0 shadow-lg group overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <SafeImage 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-charcoal/60 to-transparent"></div>
                      <div className="absolute top-4 left-4"><span className={`px-4 py-2 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}>{event.type}</span></div>
                    </div>
                    <CardContent className="p-8">
                      <h3 className="text-xl font-bold text-dark-charcoal mb-4 font-poppins group-hover:text-warm-teal transition-colors">{event.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{event.description}</p>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-700"><Calendar className="h-5 w-5 text-warm-teal mr-3" /> <span className="font-medium">{formatDate(event.date)}</span></div>
                        <div className="flex items-center text-gray-700"><Clock className="h-5 w-5 text-sunrise-orange mr-3" /> <span>{event.time}</span></div>
                        <div className="flex items-center text-gray-700"><MapPinIcon className="h-5 w-5 text-sage-600 mr-3" /> <span>{event.location}</span></div>
                      </div>
                      <EventRegistrationModal eventId={event.id} eventTitle={event.title} eventDate={event.date} eventTime={event.time} eventLocation={event.location} spotsLeft={event.spots}>
                        <Button className="btn-cta w-full">Reserve Your Seat <ArrowRight className="ml-2 h-4 w-4" /></Button>
                      </EventRegistrationModal>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12"><p>No upcoming events.</p></div>
            )}
            <div className="text-center">
              <Link to="/events"><Button variant="secondary">View All Events</Button></Link>
            </div>
          </div>
        </section>

        <section id="programs" className="section-padding bg-gradient-to-b from-light-gray to-off-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-dark-charcoal mb-6 font-poppins">Our Programs</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-warm-teal to-sunrise-orange mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive elderly care solutions designed to enhance quality of life, support cognitive health, and empower caregivers across all stages of aging
              </p>
            </div>
            {isProgramsLoading ? (
              <div className="flex flex-col items-center justify-center py-12"><LoadingSpinner /> <p className="text-gray-600 mt-4">Loading programs...</p></div>
            ) : programs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {programs.map((program, index) => (
                  <Card key={index} className="program-card bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-lg group overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <SafeImage 
                        src={program.image} 
                        alt={program.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-charcoal/60 to-transparent"></div>
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3"><program.icon className="h-6 w-6 text-warm-teal" /></div>
                      <div className="absolute bottom-4 left-4 text-white"><div className="text-sm font-medium bg-warm-teal/80 px-3 py-1 rounded-full">{program.impact}</div></div>
                    </div>
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold text-dark-charcoal mb-4 font-poppins group-hover:text-warm-teal transition-colors">{program.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                      <Button className="btn-cta" onClick={() => scrollToSection('contact')}>Connect Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12"><p>No programs available at the moment.</p></div>
            )}
          </div>
        </section>
        
        <section id="impact" className="section-padding bg-gradient-to-r from-warm-teal to-warm-teal-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-dark-charcoal/10"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-poppins text-white">Our Impact Since 2018</h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                Transforming lives through compassionate care and professional training across India
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 mb-20">
              {impactStats.map((stat, index) => (
                <Card key={index} className="bg-white/15 backdrop-blur-sm border-0 hover:bg-white/20 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-white mb-2 font-poppins group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                    <div className="text-sm font-medium text-warm-teal-100 mb-1">{stat.label}</div>
                    <div className="text-xs text-white/70">{stat.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

  {/* Donation / Transform section temporarily hidden. To restore: import TransformSection and render it here. */}
  {false && <div />}

        <section id="founder" className="section-padding bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="relative inline-block">
                  <SafeImage 
                    src={imagePaths.team.amrita} 
                    alt="Amrita Patil, Founder" 
                    className="w-64 h-64 lg:w-72 lg:h-72 rounded-2xl object-cover shadow-xl" 
                    loading="lazy"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-warm-teal to-sunrise-orange p-3 rounded-xl shadow-lg"><Award className="h-6 w-6 text-white" /></div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-dark-charcoal mb-4 font-poppins">Meet Our Founder</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-warm-teal to-sunrise-orange mb-6"></div>
                </div>
                <blockquote className="text-lg lg:text-xl font-medium text-dark-charcoal italic">"Building an ecosystem that empowers caregivers and supports the elderly with dignity and compassion."</blockquote>
                <div>
                  <p className="text-lg text-warm-teal font-semibold">Amrita Patil</p>
                  <p className="text-gray-600 font-medium mb-4">Founder & Director</p>
                </div>
                <div className="bg-gradient-to-br from-warm-teal-50 to-white p-5 rounded-xl border border-warm-teal-100">
                  <p className="text-gray-700 mb-4">Recognized by The Better India for her dedication to elderly care, Amrita has pioneered sustainable solutions for India's aging population.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-sunrise-orange text-white px-3 py-1 rounded-full text-sm font-medium">Social Impact Leader</span>
                    <span className="bg-warm-teal text-white px-3 py-1 rounded-full text-sm font-medium">Healthcare Innovation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
  <section id="contact" aria-label="Connect With Us"><ContactForm /></section>
        <NewsletterSignup />
      </main>

      <footer className="bg-gradient-to-br from-dark-charcoal to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <SafeImage 
                  src={imagePaths.team.logo} 
                  alt="Shatam Care Foundation Logo" 
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">Shatam Care</h3>
                  <p className="text-sm text-warm-teal-300">Foundation</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex items-center"><Phone className="h-4 w-4 mr-2 text-warm-teal" /> {siteSettings?.contactPhone || '+91 9158566665'}</p>
                <p className="flex items-center"><Mail className="h-4 w-4 mr-2 text-warm-teal" /> {siteSettings?.contactEmail || 'shatamcare@gmail.com'}</p>
                <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-warm-teal" /> {siteSettings?.address || 'Mumbai, India'}</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#events" className="text-gray-300 hover:text-warm-teal transition-colors">Events</a></li>
                <li><a href="#programs" className="text-gray-300 hover:text-warm-teal transition-colors">Our Programs</a></li>
                <li><a href="#impact" className="text-gray-300 hover:text-warm-teal transition-colors">Our Impact</a></li>
                {/* Donate link removed while donate section hidden */}
                <li><a href="#contact" className="text-gray-300 hover:text-warm-teal transition-colors">Connect With Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
              <div className="flex space-x-4 mb-4">
                {(() => {
                  const facebook = siteSettings?.socialLinks.facebook?.trim() || 'https://www.facebook.com/shatamcare';
                  const instagram = siteSettings?.socialLinks.instagram?.trim() || 'https://www.instagram.com/shatamcare';
                  const linkedin = siteSettings?.socialLinks.linkedin?.trim() || 'https://www.linkedin.com/company/shatam-care-foundation';
                  const links = [
                    { name: 'Facebook', url: facebook, svg: (<svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>) },
                    { name: 'Instagram', url: instagram, svg: (<svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.061-1.26.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.261-2.148-.558-2.913-.306-.789-.717-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.61-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>) },
                    { name: 'LinkedIn', url: linkedin, svg: (<svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>) },
                  ].filter(l => l.url);
                  return links.map(link => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/10 hover:bg-warm-teal rounded-lg transition-colors"
                      aria-label={link.name}
                    >{link.svg}</a>
                  ));
                })()}
                {isSettingsLoading && <span className="text-xs text-gray-400 animate-pulse">Loading...</span>}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 Shatam Care Foundation. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="hover:text-warm-teal transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-warm-teal transition-colors">Terms of Service</Link>
              <Link to="/cookie-policy" className="hover:text-warm-teal transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      <BackToTopButton />
    </div>
  );
};

export default React.memo(Index);