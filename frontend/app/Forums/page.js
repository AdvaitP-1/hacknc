'use client'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Settings, Lock, Mail, MapPin, FileText, MessageSquare, Users } from 'lucide-react';
import Navbar from '../components/navbar';


const forumsData = [
    // Store all forums
];

export default function ForumsPage() {
  const [search, setSearch] = useState('');
  const filteredForums = forumsData.filter(forum =>
    forum.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="p-4">
        <input
          type="text"
          placeholder="Search forums..."
          value={search}
          onChange={e => setSearch(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black placeholder-black"
        />
        <div>
          {filteredForums.length > 0 ? (
            filteredForums.map(forum => (
                <div key={forum.id} className="p-4 mb-2 border rounded text-black">
                  <h2 className="font-bold text-black">{forum.title}</h2>
                  <p className="text-black">{forum.description}</p>
              </div>
            ))
          ) : (
              <p className="text-black">No forums found.</p>
          )}
        </div>
      </div>
    </div>
  );
}