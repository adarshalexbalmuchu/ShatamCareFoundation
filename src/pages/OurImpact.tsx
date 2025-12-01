
import { useEffect, useState, useMemo, useRef } from "react";
import { Heart, Users, MapPin, Award, Star, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const OurImpact = () => {
  const metricsRef = useRef<HTMLDivElement>(null);
  const [counters, setCounters] = useState({
    caregivers: 0,
    families: 0,
    sessions: 0,
    locations: 0
  });
  const [animationStarted, setAnimationStarted] = useState(false);

  const metrics = useMemo(() => [
    { key: 'caregivers', target: 1500, label: 'Trained Caregivers', icon: Users },
    { key: 'families', target: 800, label: 'Families Supported', icon: Heart },
    { key: 'sessions', target: 3000, label: 'Training Sessions', icon: Award },
    { key: 'locations', target: 7, label: 'Cities Reached', icon: MapPin }
  ], []);

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Family Caregiver",
      content: "The training transformed how I care for my mother. I now feel confident and equipped to handle challenging situations with patience and understanding.",
      rating: 5
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Healthcare Professional",
      content: "Shatam Care's certification program elevated our staff's expertise. The practical approach and ongoing support have been invaluable for our facility.",
      rating: 5
    },
    {
      name: "Meera Patel",
      role: "Support Group Member",
      content: "Finding this community saved me from isolation. Connecting with other caregivers who understand the journey has been life-changing.",
      rating: 5
    }
  ];

  const partners = [
    { name: "AIIMS Delhi", logo: "🏥" },
    { name: "Manipal Hospitals", logo: "🏥" },
    { name: "Care India", logo: "🤝" },
    { name: "WHO India", logo: "🌍" },
    { name: "Ministry of Health", logo: "🏛️" },
    { name: "Alzheimer's Association", logo: "🧠" }
  ];

  // Use Intersection Observer to start animation only when metrics are visible
  useEffect(() => {
    if (animationStarted || !metricsRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animationStarted) {
          setAnimationStarted(true);
          
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setCounters(prev => {
              const newCounters = { ...prev };
              
              // Use eased progress for smoother animation
              const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
              
              for (const { key, target } of metrics) {
                newCounters[key] = Math.floor(target * easedProgress);
              }

              return newCounters;
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          const rafId = requestAnimationFrame(animate);
          return () => cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.3, rootMargin: '50px' }
    );

    observer.observe(metricsRef.current);
    return () => observer.disconnect();
  }, [metrics, animationStarted]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-warm-teal text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transforming Lives Since 2018</h1>
          <p className="text-xl text-warm-teal-100 max-w-2xl mx-auto">
            Measuring our impact through the lives we've touched and the communities we've strengthened across India.
          </p>
        </div>
      </section>

      {/* Animated Metrics */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div ref={metricsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map(({ key, target, label, icon: Icon }) => (
              <div key={key} className="text-center">
                <div className="mx-auto mb-4 p-4 bg-warm-teal/10 rounded-full w-fit">
                  <Icon className="h-8 w-8 text-warm-teal" />
                </div>
                <div className="text-4xl font-bold text-warm-teal mb-2">
                  {counters[key].toLocaleString()}+
                </div>
                <div className="text-gray-600 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Accreditation */}
      <section className="py-16 bg-light-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-dark-charcoal mb-4">
            Trusted Partners & Recognition
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Working alongside leading healthcare institutions and recognized by government bodies. 
            All donations are eligible for 80G tax benefits.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-300">
                  {partner.logo}
                </div>
                <div className="text-sm text-gray-600 group-hover:text-warm-teal transition-colors">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-sunrise-orange/10 px-4 py-2 rounded-full">
              <Award className="h-5 w-5 text-sunrise-orange" />
              <span className="text-sunrise-orange font-medium">80G Tax Benefits Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-dark-charcoal mb-12">
            Stories of Impact
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <Carousel className="w-full" role="region" aria-label="Testimonials from our community">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index}>
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-8 text-center">
                        <div className="flex justify-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-sunrise-orange fill-current" />
                          ))}
                        </div>
                        <blockquote className="text-lg text-gray-700 mb-6 italic">
                          "{testimonial.content}"
                        </blockquote>
                        <div className="font-semibold text-dark-charcoal">{testimonial.name}</div>
                        <div className="text-gray-500">{testimonial.role}</div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Location Expansion Map */}
      <section className="py-16 bg-light-gray">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dark-charcoal mb-4">
            Expanding Across India
          </h2>
          <p className="text-gray-600 mb-8">
            From Delhi to Bangalore, our programs are reaching more communities every year.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-4xl mx-auto">
            {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'].map((city, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <MapPin className="h-6 w-6 text-warm-teal mx-auto mb-2" />
                <div className="text-sm font-medium text-dark-charcoal">{city}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual-CTA Banner */}
      <section className="py-20 bg-warm-teal text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join 1,500+ Trained Caregivers
          </h2>
          <p className="text-xl text-warm-teal-100 mb-8 max-w-2xl mx-auto">
            Be part of the movement transforming dementia care across India. Every contribution makes a difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-sunrise-orange hover:bg-sunrise-orange/90 text-white px-8 py-3">
              Enroll in Training
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-warm-teal px-8 py-3"
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname !== '/') {
                  window.location.href = '/#contact';
                } else {
                  const el = document.getElementById('contact');
                  if (el) {
                    const headerOffset = 80;
                    const elementPosition = el.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                  }
                }
              }}
            >
              Connect With Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurImpact;
