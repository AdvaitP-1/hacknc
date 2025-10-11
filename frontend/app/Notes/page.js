const getMajorsList = () => {
  return majorsData.majors.map(majorObj => majorObj.major);
};

const isLoggedIn = () => {
  // Example: check localStorage or context
  return typeof window !== 'undefined' && localStorage.getItem('userToken') !== null;
};

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

const ForumsSection = () => {
  const [forums, setForums] = useState([]);
  const [newForumText, setNewForumText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [selectedForum, setSelectedForum] = useState(null);

  useEffect(() => {
    // Fetch forums from backend API
    setForums([
      { id: 1, text: 'How do I register for classes?', replies: [] },
      { id: 2, text: 'Best places to eat on campus?', replies: [] },
    ]);
  }, []);

  if (!isLoggedIn()) {
    return <div className="mt-8 text-red-600">You do not have permission to view forums. Please log in.</div>;
  }

  const handleCreateForum = () => {
    if (newForumText.trim() === '') return;
    setForums([
      ...forums,
      { id: Date.now(), text: newForumText, replies: [] },
    ]);
    setNewForumText('');
  };

  const handleReply = (forumId) => {
    if (replyText.trim() === '') return;
    setForums(forums.map(forum =>
      forum.id === forumId
        ? { ...forum, replies: [...forum.replies, replyText] }
        : forum
    ));
    setReplyText('');
    setSelectedForum(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Forums</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          {forums.map(forum => (
            <div key={forum.id} className="border rounded p-4 mb-4">
              <div onClick={() => setSelectedForum(forum.id)} style={{ cursor: 'pointer' }}>
                <strong>{forum.text}</strong>
              </div>
              {forum.replies.map((reply, idx) => (
                <div key={idx} className="ml-4 text-gray-600">
                  Reply: {reply}
                </div>
              ))}
              {selectedForum === forum.id && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply"
                    className="border rounded px-2 py-1 mr-2"
                  />
                  <button onClick={() => handleReply(forum.id)} className="bg-blue-500 text-white px-3 py-1 rounded">Reply</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginLeft: '20px' }}>
          <h3 className="font-semibold mb-2">Create Forum</h3>
          <input
            type="text"
            value={newForumText}
            onChange={e => setNewForumText(e.target.value)}
            placeholder="Ask a question or post text"
            className="border rounded px-2 py-1 mr-2"
          />
          <button onClick={handleCreateForum} className="bg-green-500 text-white px-3 py-1 rounded">Create</button>
        </div>
      </div>
    </div>
  );
};

const NotesPage = () => {
  return (
    <div>
      <CourseSearch />
      <ForumsSection />
    </div>
  );
};

export default NotesPage;