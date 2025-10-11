'use client'
import Navbar from "./components/navbar";
import Plasma from "./components/homebg";
import Silk from "./components/homebg";
import { RevealBento } from "./components/aboutcomponent";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";


export default function Home() {
  return (
    <>
      <Navbar/>
      
      {/* Hero Section */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Plasma Background - Full Screen - Bottom Layer */}
        <div className="fixed inset-0 w-screen h-screen z-0">
          <Silk
            speed={5}
            scale={1}
            color="#8561a5ff"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>
        
        
        {/* Content Overlay - Centered - Top Layer */}
        <div className="relative z-50 flex flex-col items-center justify-center min-h-screen w-full px-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >

            {/* Main Title with Gradient */}
            <motion.h1 
              className="text-7xl md:text-8xl font-medium mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Study Share
            </motion.h1>

            {/* Subtitle with Typewriter Effect */}
            <motion.p 
              className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-3xl font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              The ultimate platform where students share knowledge, collaborate on notes, and build stronger academic communities together.
            </motion.p>


            {/* CTA Button */}
            <motion.div 
              className="flex justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <motion.button 
                className="group relative px-8 py-4 bg-gradient-to-r from-black to-purple-600 text-white rounded-xl font-medium text-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
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

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
            >
              <motion.div
                className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="w-1 h-3 bg-white/60 rounded-full mt-2"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
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
