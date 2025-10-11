'use client'
import Image from "next/image";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
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
    </main>
  );
}
