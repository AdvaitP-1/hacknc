'use client'
import Navbar from "./components/navbar";
import Silk from "./components/homebg";
import { RevealBento } from "./components/aboutcomponent";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Animation constants
const ANIMATION_DELAYS = {
  TITLE: 0.3,
  SUBTITLE: 0.8,
  BUTTON: 1.2,
  BUTTON_INNER: 1.4,
};

const ANIMATION_DURATIONS = {
  FADE_IN: 1,
  SCALE_IN: 0.8,
  SLIDE_UP: 0.8,
  BUTTON_APPEAR: 0.5,
};

// Background configuration
const BACKGROUND_CONFIG = {
  speed: 5,
  scale: 1,
  color: "#8561a5ff",
  noiseIntensity: 1.5,
  rotation: 0,
};

export default function Home() {
  return (
    <>
      <Navbar/>
      
      {/* Hero Section */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background Animation */}
        <div className="fixed inset-0 w-screen h-screen z-0">
          <Silk {...BACKGROUND_CONFIG} />
        </div>
        
        
        {/* Content Overlay - Centered - Top Layer */}
        <div className="relative z-50 flex flex-col items-center justify-center min-h-screen w-full px-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_DURATIONS.FADE_IN, ease: "easeOut" }}
          >
            <HeroTitle />
            <HeroSubtitle />
            <HeroCTA />
          </motion.div>
        </div>
      </div>
      
      {/* About Section */}
      <div className="relative z-50">
        <RevealBento />
      </div>
    </>
  );
}

// Hero Components
const HeroTitle = () => (
  <motion.h1 
    className="text-7xl md:text-8xl font-medium mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: ANIMATION_DELAYS.TITLE, duration: ANIMATION_DURATIONS.SCALE_IN }}
  >
    Study Share
  </motion.h1>
);

const HeroSubtitle = () => (
  <motion.p 
    className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-3xl font-medium"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: ANIMATION_DELAYS.SUBTITLE, duration: ANIMATION_DURATIONS.SLIDE_UP }}
  >
    The ultimate platform where students share knowledge, collaborate on notes, and build stronger academic communities together.
  </motion.p>
);

const HeroCTA = () => (
  <motion.div 
    className="flex justify-center items-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: ANIMATION_DELAYS.BUTTON, duration: ANIMATION_DURATIONS.SLIDE_UP }}
  >
    <motion.button 
      className="group relative px-8 py-4 bg-gradient-to-r from-black to-purple-600 text-white rounded-xl font-medium text-lg overflow-hidden"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: ANIMATION_DELAYS.BUTTON_INNER, duration: ANIMATION_DURATIONS.BUTTON_APPEAR }}
    >
      <span className="relative z-10 flex items-center gap-2">
        Get Started Free
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-black"
        initial={{ x: "-100%" }}
        whileHover={{ x: "0%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  </motion.div>
);
