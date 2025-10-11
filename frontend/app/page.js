'use client'
import Navbar from "./components/navbar";
import Plasma from "./components/homebg";
import Silk from "./components/homebg";


export default function Home() {
  return (
    <>
      <div className="relative min-h-screen w-full">
        {/* Plasma Background - Full Screen - Bottom Layer */}
        <div className="fixed inset-0 w-screen h-screen -z-50">
          <Silk
            speed={5}
            scale={1}
            color="#854bb8ff"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>
        <Navbar/>
        {/* Content Overlay - Centered - Top Layer */}
        <div className="relative z-50 flex flex-col items-center justify-center min-h-screen w-full px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              Title
            </h1>
            <p className="text-xl text-neutral-400 mb-8 max-w-2xl">
              subtitle
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Register Now
              </button>
              <button className="px-8 py-3 border border-neutral-600 text-white rounded-lg hover:bg-neutral-800 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
