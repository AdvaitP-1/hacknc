'use client'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Settings, Lock, Mail, MapPin, FileText, MessageSquare, Users } from 'lucide-react';
import Navbar from '../components/navbar';


const forumsData = [
  { id: 1, title: 'General Discussion', description: 'Talk about anything!' },
  { id: 2, title: 'Course Help', description: 'Get help with your courses.' },
  { id: 3, title: 'Events', description: 'Upcoming events and meetups.' },
  // Add more forum objects as needed
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
          className="w-full p-2 border rounded mb-4"
        />
        <div>
          {filteredForums.length > 0 ? (
            filteredForums.map(forum => (
              <div key={forum.id} className="p-4 mb-2 border rounded">
                <h2 className="font-bold">{forum.title}</h2>
                <p>{forum.description}</p>
              </div>
            ))
          ) : (
            <p>No forums found.</p>
          )}
        </div>
      </div>
    </div>
  );
}