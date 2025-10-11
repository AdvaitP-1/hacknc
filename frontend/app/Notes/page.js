import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, School, GraduationCap, Settings, Lock, Mail, MapPin } from 'lucide-react';
import Navbar from '../components/navbar';
import majorsData from '../../../webscrape/college_data/all_stem_majors.json';

const CourseSearch = () => {
  const [selectedMajor, setSelectedMajor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get courses to display
  const filteredCourses = majorsData.majors
    .filter(majorObj => !selectedMajor || majorObj.major === selectedMajor)
    .flatMap(majorObj =>
      majorObj.core_courses.filter(course =>
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(course => ({
        ...course,
        major: majorObj.major,
        university: majorObj.university
      }))
    );
  return (
    <div>
      {/* Major Dropdown */}
      <label className="block text-sm font-medium text-zinc-700 mb-2">Major</label>
      <select
        value={selectedMajor}
        onChange={e => setSelectedMajor(e.target.value)}
        className="w-full px-4 py-3 border border-zinc-300 rounded-lg mb-4"
      >
        <option value="">All Majors</option>
        {getMajorsList().map((major, idx) => (
          <option key={idx} value={major}>{major}</option>
        ))}
      </select>

      {/* Search Bar */}
      <label className="block text-sm font-medium text-zinc-700 mb-2">Search Courses</label>
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search for a course..."
        className="w-full px-4 py-3 border border-zinc-300 rounded-lg mb-4"
      />

      {/* Filtered Results */}
      <ul>
        {filteredCourses.length === 0 ? (
          <li className="text-zinc-600">No courses found.</li>
        ) : (
          filteredCourses.map((course, idx) => (
            <li key={idx} className="p-2 border-b">
              <strong>{course.course_code}</strong>: {course.course_name}
              <br />
              <span className="text-xs text-zinc-500">{course.major} - {course.university}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};