 'use client'

import React, { useEffect, useState, useRef } from 'react';
import majorsData from '../../../webscrape/college_data/North Carolina State University.json';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../components/navbar';


const flattenCourses = (majorsJson) => {
  const list = [];
  majorsJson.majors.forEach((majorObj, mIdx) => {
    (majorObj.core_courses || []).forEach((course, cIdx) => {
      list.push({
        id: `${mIdx}-${cIdx}`,
        course_code: course.course_code || `${majorObj.major.split(' ')[0]}-${cIdx + 1}`,
        course_name: course.course_name || 'Unnamed Course',
        major: majorObj.major,
        university: majorObj.university
      });
    });
  });
  return list;
};

const CourseSearch = ({ allCourses, onEnroll }) => {
  const [selectedMajor, setSelectedMajor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const majorsList = Array.from(new Set(allCourses.map(c => c.major)));

  const filteredCourses = allCourses
    .filter(c => (!selectedMajor || c.major === selectedMajor))
    .filter(c => c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.course_code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-2">Major</label>
      <select
        value={selectedMajor}
        onChange={e => setSelectedMajor(e.target.value)}
        className="w-full px-4 py-3 border border-zinc-300 rounded-lg mb-4"
      >
        <option value="">All Majors</option>
        {majorsList.map((major, idx) => (
          <option key={idx} value={major}>{major}</option>
        ))}
      </select>

      <label className="block text-sm font-medium text-zinc-700 mb-2">Search Courses</label>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search for a course..."
          className="flex-1 px-4 py-3 border border-zinc-300 rounded-lg"
        />
      </div>

      <ul className="max-h-72 overflow-auto border rounded p-2">
        {filteredCourses.length === 0 ? (
          <li className="text-zinc-600">No courses found.</li>
        ) : (
          filteredCourses.map((course) => (
            <li key={course.id} className="p-2 border-b flex items-center justify-between">
              <div>
                <strong className="block">{course.course_code}</strong>
                <div className="text-sm">{course.course_name}</div>
                <div className="text-xs text-zinc-500">{course.major} - {course.university}</div>
              </div>
              <div>
                <button
                  onClick={() => onEnroll(course)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Enroll
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

const EnrolledList = ({ enrolled, onRemove }) => {
  return (
    <div>
      <h4 className="font-semibold mb-2">Enrolled Courses</h4>
      {enrolled.length === 0 ? (
        <div className="text-zinc-600">No enrolled courses.</div>
      ) : (
        <ul>
          {enrolled.map(c => (
            <li key={c.id} className="flex items-center justify-between p-2 border rounded mb-2">
              <div>
                <div className="font-semibold">{c.course_code}</div>
                <div className="text-xs text-zinc-500">{c.course_name}</div>
              </div>
              <button onClick={() => onRemove(c.id)} className="text-red-600">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// const NotesSection = ({ enrolledCourses, notes, onUploadClick }) => {
//   const enrolledIds = new Set(enrolledCourses.map(c => c.id));
//   const filtered = notes.filter(n => enrolledIds.has(n.courseId));

//   return (
//     <div className="mt-6">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-lg font-bold">Notes for your enrolled courses</h3>
//         <button onClick={onUploadClick} className="bg-blue-600 text-white px-3 py-1 rounded">Upload notes</button>
//       </div>

//       {enrolledCourses.length === 0 ? (
//         <div className="text-zinc-600">Enroll in courses to see notes here.</div>
//       ) : filtered.length === 0 ? (
//         <div className="text-zinc-600">No notes yet for your enrolled courses.</div>
//       ) : (
//         filtered.map(n => (
//           <div key={n.id} className="border rounded p-3 mb-3">
//             <div className="text-xs text-zinc-500">{n.courseCode} • by {n.author}</div>
//             <div className="font-semibold">{n.title}</div>
//             <div className="text-sm text-zinc-700">{n.noteText || ''}</div>
//             {n.fileUrl && (
//               <div className="mt-2">
//                 <a href={n.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
//                   Open PDF ({n.fileName})
//                 </a>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };
const NotesSection = ({ enrolledCourses, notes, onUploadClick }) => {
  const [activeTab, setActiveTab] = useState('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    course: '',
    author: '',
    dateRange: 'all'
  });

  const enrolledIds = new Set(enrolledCourses.map(c => c.id));
  const enrolledNotes = notes.filter(n => enrolledIds.has(n.courseId));
  
  const searchedNotes = notes.filter(note => {
    const matchesQuery = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.noteText && note.noteText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      note.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = !searchFilters.course || 
      note.courseCode.toLowerCase().includes(searchFilters.course.toLowerCase());
    
    const matchesAuthor = !searchFilters.author || 
      note.author.toLowerCase().includes(searchFilters.author.toLowerCase());
    
    let matchesDate = true;
    if (searchFilters.dateRange !== 'all' && note.uploadedAt) {
      const noteDate = new Date(note.uploadedAt);
      const now = new Date();
      const daysDiff = (now - noteDate) / (1000 * 60 * 60 * 24);
      
      switch (searchFilters.dateRange) {
        case 'week': matchesDate = daysDiff <= 7; break;
        case 'month': matchesDate = daysDiff <= 30; break;
        case 'year': matchesDate = daysDiff <= 365; break;
      }
    }
    
    return matchesQuery && matchesCourse && matchesAuthor && matchesDate;
  });

  const allCourses = [...new Set(notes.map(n => n.courseCode))];
  const allAuthors = [...new Set(notes.map(n => n.author))];

  const renderNotesList = (notesToShow) => (
    notesToShow.length === 0 ? (
      <div className="text-zinc-600">
        {activeTab === 'enrolled' ? 'No notes yet for your enrolled courses.' : 'No notes found matching your search.'}
      </div>
    ) : (
      notesToShow.map(n => (
        <div key={n.id} className="border rounded p-3 mb-3">
          <div className="text-xs text-zinc-500">{n.courseCode} • by {n.author}</div>
          <div className="font-semibold">{n.title}</div>
          <div className="text-sm text-zinc-700">{n.noteText || ''}</div>
          {n.fileUrl && (
            <div className="mt-2">
              <a href={n.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                Open PDF ({n.fileName})
              </a>
            </div>
          )}
          {n.uploadedAt && (
            <div className="text-xs text-zinc-400 mt-2">
              Uploaded: {new Date(n.uploadedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      ))
    )
  );

  return (
    <div className="mt-6">
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'enrolled' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-zinc-600 hover:text-zinc-800'
          }`}
        >
          My Notes ({enrolledNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'search' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-zinc-600 hover:text-zinc-800'
          }`}
        >
          Search All Notes ({notes.length})
        </button>
      </div>

      {/* Enrolled Notes Tab */}
      {activeTab === 'enrolled' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">Notes for your enrolled courses</h3>
            <button onClick={onUploadClick} className="bg-blue-600 text-white px-3 py-1 rounded">
              Upload notes
            </button>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="text-zinc-600">Enroll in courses to see notes here.</div>
          ) : (
            renderNotesList(enrolledNotes)
          )}
        </div>
      )}

      {/* Search All Notes Tab */}
      {activeTab === 'search' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Search All Notes</h3>
            <button onClick={onUploadClick} className="bg-blue-600 text-white px-3 py-1 rounded">
              Upload notes
            </button>
          </div>

          {/* Search Controls */}
          <div className="bg-zinc-50 p-4 rounded-lg mb-4">
            <div className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, content, author, or course code..."
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={searchFilters.course}
                onChange={(e) => setSearchFilters(prev => ({...prev, course: e.target.value}))}
                className="px-3 py-2 border border-zinc-300 rounded"
              >
                <option value="">All Courses</option>
                {allCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <select
                value={searchFilters.author}
                onChange={(e) => setSearchFilters(prev => ({...prev, author: e.target.value}))}
                className="px-3 py-2 border border-zinc-300 rounded"
              >
                <option value="">All Authors</option>
                {allAuthors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>

              <select
                value={searchFilters.dateRange}
                onChange={(e) => setSearchFilters(prev => ({...prev, dateRange: e.target.value}))}
                className="px-3 py-2 border border-zinc-300 rounded"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            {(searchQuery || searchFilters.course || searchFilters.author || searchFilters.dateRange !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchFilters({ course: '', author: '', dateRange: 'all' });
                }}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div>
            <div className="text-sm text-zinc-600 mb-3">
              {searchedNotes.length} notes found
            </div>
            {renderNotesList(searchedNotes)}
          </div>
        </div>
      )}
    </div>
  );
};

const UploadModal = ({ visible, onClose, enrolledCourses, onUpload }) => {
  const fileRef = useRef(null);
  const [title, setTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(enrolledCourses[0]?.id || '');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle('');
      setNoteText('');
      setSelectedCourseId(enrolledCourses[0]?.id || '');
      if (fileRef.current) fileRef.current.value = null;
    }
  }, [visible, enrolledCourses]);

  const handleSubmit = () => {
    const file = fileRef.current?.files?.[0];
    if (!selectedCourseId) {
      alert('Select a course for these notes.');
      return;
    }
    if (!file) {
      alert('Please choose a PDF to upload.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are allowed.');
      return;
    }
    const fileUrl = URL.createObjectURL(file);
    const course = enrolledCourses.find(c => c.id === selectedCourseId);
    const author = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'anonymous') : 'anonymous';
    const note = {
      id: Date.now(),
      courseId: course.id,
      courseCode: course.course_code,
      title: title || `${course.course_code} notes`,
      noteText,
      fileName: file.name,
      fileUrl,
      author,
      uploadedAt: new Date().toISOString()
    };
    onUpload(note);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl p-6 rounded shadow-lg">
        <h4 className="text-lg font-semibold mb-3">Upload Notes (PDF)</h4>

        <label className="block text-sm font-medium text-zinc-700 mb-1">Course</label>
        <select
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3"
        >
          <option value="">-- select course --</option>
          {enrolledCourses.map(c => (
            <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>
          ))}
        </select>

        <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" placeholder="Title for the notes" />

        <label className="block text-sm font-medium text-zinc-700 mb-1">Optional note text / description</label>
        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" rows={3} />

        <label className="block text-sm font-medium text-zinc-700 mb-1">PDF file</label>
        <input ref={fileRef} type="file" accept="application/pdf" className="mb-4" />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={handleSubmit} className="px-3 py-1 rounded bg-blue-600 text-white">Upload</button>
        </div>
      </div>
    </div>
  );
};

const NotesPage = () => {
  const allCourses = flattenCourses(majorsData);
  const { isSignedIn } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    // load enrolled from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enrolledCourses');
      if (saved) setEnrolledCourses(JSON.parse(saved));
      const savedNotes = localStorage.getItem('allNotes');
      if (savedNotes) {
        try { setNotes(JSON.parse(savedNotes)); } catch { /* ignore */ }
      } else {
        // seed with some public notes from other users
        setNotes([
          { id: 1, courseId: '0-0', courseCode: 'Intro-1', title: 'Intro summary', noteText: 'High level summary', fileUrl: null, fileName: null, author: 'alice' },
          { id: 2, courseId: '0-1', courseCode: 'Intro-2', title: 'DS notes', noteText: 'Stacks and queues', fileUrl: null, fileName: null, author: 'bob' },
        ]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    }
  }, [enrolledCourses]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('allNotes', JSON.stringify(notes));
    }
  }, [notes]);

  const handleEnroll = (course) => {
    if (!isSignedIn) {
      alert('You must be logged in to enroll.');
      return;
    }
    if (enrolledCourses.find(c => c.id === course.id)) return;
    setEnrolledCourses(prev => [...prev, course]);
  };

  const handleRemove = (id) => {
    setEnrolledCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleUpload = (note) => {
    setNotes(prev => [note, ...prev]);
  };

  return (
    <div className="pt-32 max-w-6xl mx-auto px-4">
      <Navbar />
      {!isSignedIn && (
        <div className="mb-6 text-red-600">You have to be logged in to use enrollment and upload notes.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CourseSearch allCourses={allCourses} onEnroll={handleEnroll} />
          <NotesSection enrolledCourses={enrolledCourses} notes={notes} onUploadClick={() => setUploadOpen(true)} />
        </div>

        <aside className="bg-white p-4 border rounded">
          <EnrolledList enrolled={enrolledCourses} onRemove={handleRemove} />
        </aside>
      </div>

      <UploadModal
        visible={uploadOpen}
        onClose={() => setUploadOpen(false)}
        enrolledCourses={enrolledCourses}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default NotesPage;
