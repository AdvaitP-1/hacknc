
"""
Flask API endpoints for course and major search functionality.

This module provides RESTful API endpoints that can be imported into your main Flask app.
"""

from flask import Flask, jsonify, request
from course_search import CourseSearchEngine
import os


class CourseSearchAPI:
    """
    Flask API wrapper for CourseSearchEngine
    """
    
    def __init__(self, app: Flask = None):
        self.search_engine = CourseSearchEngine()
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize the API with Flask app"""
        self.app = app
        self._register_routes()
        self._load_initial_data()
    
    def _load_initial_data(self):
        """Load initial data from available files"""
        # Try to load the JSON file
        json_file_path = r"c:\Users\saake\Downloads\computer_science_b_s_major.json"
        if os.path.exists(json_file_path):
            self.search_engine.load_json_data(json_file_path)
        
        # Load CSV files from webscrape directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        courses_csv = os.path.join(current_dir, "courses.csv")
        majors_csv = os.path.join(current_dir, "majors.csv")
        
        self.search_engine.load_csv_data(courses_csv, majors_csv)
    
    def _register_routes(self):
        """Register all API routes"""
        
        @self.app.route('/api/colleges', methods=['GET'])
        def get_colleges():
            """Get all available colleges"""
            try:
                colleges = self.search_engine.get_colleges()
                return jsonify({
                    'status': 'success',
                    'data': colleges,
                    'count': len(colleges)
                })
            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': str(e)
                }), 500
        
        @self.app.route('/api/majors', methods=['GET'])
        def get_majors():
            """Get majors, optionally filtered by college"""
            try:
                college_name = request.args.get('college')
                major_query = request.args.get('query', '')
                limit = int(request.args.get('limit', 50))
                
                if college_name:
                    majors = self.search_engine.get_majors_by_college(college_name)
                    # Convert to dict format for consistency
                    majors_data = [{'major_name': major, 'college': college_name} for major in majors]
                else:
                    majors_data = self.search_engine.search_majors(
                        major_query=major_query, 
                        limit=limit
                    )
                
                return jsonify({
                    'status': 'success',
                    'data': majors_data,
                    'count': len(majors_data)
                })
            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': str(e)
                }), 500
        
        @self.app.route('/api/courses/search', methods=['GET'])
        def search_courses():
            """Search for courses with various filters"""
            try:
                college_name = request.args.get('college')
                major_name = request.args.get('major')
                course_query = request.args.get('query', '')
                course_type = request.args.get('type')
                limit = int(request.args.get('limit', 100))
                
                courses = self.search_engine.search_courses(
                    college_name=college_name,
                    major_name=major_name,
                    course_query=course_query,
                    course_type=course_type,
                    limit=limit
                )
                
                return jsonify({
                    'status': 'success',
                    'data': courses,
                    'count': len(courses),
                    'filters': {
                        'college': college_name,
                        'major': major_name,
                        'query': course_query,
                        'type': course_type
                    }
                })
            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': str(e)
                }), 500
        
        @self.app.route('/api/course-types', methods=['GET'])
        def get_course_types():
            """Get all available course types"""
            try:
                types = self.search_engine.get_course_types()
                return jsonify({
                    'status': 'success',
                    'data': types,
                    'count': len(types)
                })
            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': str(e)
                }), 500
        
        @self.app.route('/api/reload-data', methods=['POST'])
        def reload_data():
            """Reload data from files"""
            try:
                self._load_initial_data()
                return jsonify({
                    'status': 'success',
                    'message': 'Data reloaded successfully'
                })
            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': str(e)
                }), 500


# Example usage function
def create_course_search_app():
    """
    Create a Flask app with course search functionality.
    This is an example of how to use the CourseSearchAPI.
    """
    app = Flask(__name__)
    
    # Initialize the course search API
    course_api = CourseSearchAPI(app)
    
    return app


if __name__ == "__main__":
    # Run as standalone app for testing
    app = create_course_search_app()
    app.run(debug=True, port=5001)