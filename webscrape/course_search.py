"""
Course and Major Search Module

This module provides functionality to search for courses and majors based on college data.
It supports loading data from JSON files and CSV files, and provides flexible search capabilities.
"""

import json
import csv
import re
from typing import List, Dict, Optional, Union
import os


class CourseSearch:
    """
    A search engine for courses and majors across different colleges.
    Supports loading data from JSON files and CSV files.
    """
    
    def __init__(self):
        self.colleges_data = {}
        self.courses_data = []
        self.majors_data = []
    
    def load_json_data(self, json_file_path: str) -> None:
        """
        Load college data from a JSON file and populate courses and majors.

        Args:
            json_file_path: Path to the JSON file
        """
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            # Extract college name
            college_name = data.get('university', 'Unknown College')

            # Store the data
            self.colleges_data[college_name] = data

            # Extract courses and majors
            self._extract_courses_from_json(data, college_name)
            self._extract_majors_from_json(data, college_name)

        except FileNotFoundError:
            print(f"File not found: {json_file_path}")
        except json.JSONDecodeError:
            print(f"Invalid JSON format in file: {json_file_path}")

    def load_csv_data(self, courses_csv_path: str = None, majors_csv_path: str = None) -> None:
        """
        Load courses and majors data from CSV files.
        
        Args:
            courses_csv_path: Path to courses CSV file
            majors_csv_path: Path to majors CSV file
        """
        if courses_csv_path and os.path.exists(courses_csv_path):
            try:
                with open(courses_csv_path, 'r', encoding='utf-8') as file:
                    reader = csv.DictReader(file)
                    self.courses_data = list(reader)
            except Exception as e:
                print(f"Error loading courses CSV: {e}")
        
        if majors_csv_path and os.path.exists(majors_csv_path):
            try:
                with open(majors_csv_path, 'r', encoding='utf-8') as file:
                    reader = csv.DictReader(file)
                    self.majors_data = list(reader)
            except Exception as e:
                print(f"Error loading majors CSV: {e}")
    
    def _extract_majors_from_json(self, data: Dict, college_name: str) -> None:
        """
        Extract majors from JSON data structure and add to majors list.

        Args:
            data: The college data dictionary
            college_name: Name of the college
        """
        major_name = data.get('major', 'Unknown Major')
        degree_type = data.get('degree_type', '')
        total_credit_hours = data.get('total_credit_hours', 0)
        concentrations = [c.get('concentration_name') for c in data.get('concentrations', [])]

        # Add major information
        self.majors_data.append({
            'college': college_name,
            'major_name': major_name,
            'degree_type': degree_type,
            'total_credit_hours': total_credit_hours,
            'concentrations': concentrations
        })

    def _extract_courses_from_json(self, data: Dict, college_name: str) -> None:
        """
        Extract all courses from JSON data structure and add to courses list.

        Args:
            data: The college data dictionary
            college_name: Name of the college
        """
        major_name = data.get('major', 'Unknown Major')
        
        # Extract core courses
        for course in data.get('core_courses', []):
            self.courses_data.append({
                'college': college_name,
                'major_name': major_name,
                'course_code': course.get('course_code', ''),
                'course_title': course.get('course_name', ''),
                'course_type': 'Core',
                'description': ''
            })
        
        # Extract math/science requirements
        for course in data.get('math_science_requirements', []):
            self.courses_data.append({
                'college': college_name,
                'major_name': major_name,
                'course_code': course.get('course_code', ''),
                'course_title': course.get('course_name', ''),
                'course_type': 'Math/Science Requirement',
                'description': ''
            })
    
    def search_courses(self, 
                      college_name: str = None, 
                      major_name: str = None, 
                      course_query: str = None,
                      course_type: str = None,
                      limit: int = 100) -> List[Dict]:
        """
        Search for courses based on various criteria.
        
        Args:
            college_name: Filter by college name (partial match)
            major_name: Filter by major name (partial match)
            course_query: Search in course code or title (partial match)
            course_type: Filter by course type (Core, Elective, etc.)
            limit: Maximum number of results to return
            
        Returns:
            List of matching courses
        """
        results = []
        
        for course in self.courses_data:
            # College filter
            if college_name and not self._partial_match(college_name, course.get('college', '')):
                continue
            
            # Major filter
            if major_name and not self._partial_match(major_name, course.get('major_name', '')):
                continue
            
            # Course query filter (search in code and title)
            if course_query:
                course_text = f"{course.get('course_code', '')} {course.get('course_title', '')}"
                if not self._partial_match(course_query, course_text):
                    continue
            
            # Course type filter
            if course_type and not self._partial_match(course_type, course.get('course_type', '')):
                continue
            
            results.append(course)
            
            if len(results) >= limit:
                break
        
        return results
    
    def search_majors(self, 
                     college_name: str = None, 
                     major_query: str = None,
                     limit: int = 50) -> List[Dict]:
        """
        Search for majors based on college and major name.
        
        Args:
            college_name: Filter by college name (partial match)
            major_query: Search in major name (partial match)
            limit: Maximum number of results to return
            
        Returns:
            List of matching majors
        """
        results = []
        
        # Search in CSV data first
        for major in self.majors_data:
            if college_name and not self._partial_match(college_name, major.get('college', '')):
                continue
            
            if major_query and not self._partial_match(major_query, major.get('major_name', '')):
                continue
            
            results.append(major)
        
        # Search in JSON data
        for college, data in self.colleges_data.items():
            if college_name and not self._partial_match(college_name, college):
                continue
            
            major_name = data.get('major', '')
            if major_query and not self._partial_match(major_query, major_name):
                continue
            
            # Check if this major is already in results (avoid duplicates)
            if not any(r.get('major_name') == major_name and r.get('college') == college for r in results):
                major_info = {
                    'college': college,
                    'major_name': major_name,
                    'degree_type': data.get('degree_type', ''),
                    'total_credit_hours': data.get('total_credit_hours', 0),
                    'concentrations': [c.get('concentration_name') for c in data.get('concentrations', [])]
                }
                results.append(major_info)
        
        return results[:limit]
    
    def get_colleges(self) -> List[str]:
        """
        Get a list of all available colleges.
        
        Returns:
            List of college names
        """
        colleges = set()
        
        # From CSV data
        for course in self.courses_data:
            if course.get('college'):
                colleges.add(course['college'])
        
        for major in self.majors_data:
            if major.get('college'):
                colleges.add(major['college'])
        
        # From JSON data
        colleges.update(self.colleges_data.keys())
        
        return sorted(list(colleges))
    
    def get_majors_by_college(self, college_name: str) -> List[str]:
        """
        Get all majors available at a specific college.
        
        Args:
            college_name: Name of the college
            
        Returns:
            List of major names
        """
        majors = set()
        
        # From CSV data
        for major in self.majors_data:
            if self._partial_match(college_name, major.get('college', '')):
                majors.add(major.get('major_name', ''))
        
        # From courses data
        for course in self.courses_data:
            if self._partial_match(college_name, course.get('college', '')):
                majors.add(course.get('major_name', ''))
        
        # From JSON data
        for college, data in self.colleges_data.items():
            if self._partial_match(college_name, college):
                majors.add(data.get('major', ''))
        
        return sorted(list(majors))
    
    def get_course_types(self) -> List[str]:
        """
        Get all available course types.
        
        Returns:
            List of course types
        """
        types = set()
        for course in self.courses_data:
            if course.get('course_type'):
                types.add(course['course_type'])
        return sorted(list(types))
    
    def _partial_match(self, query: str, text: str) -> bool:
        """
        Check if query partially matches text (case-insensitive).
        
        Args:
            query: Search query
            text: Text to search in
            
        Returns:
            True if match found, False otherwise
        """
        if not query or not text:
            return True
        
        return query.lower() in text.lower()


def main():
    """
    Example usage of the CourseSearchEngine
    """
    # Initialize the search engine
    search_engine = CourseSearch()
    
    # Load JSON data (example with the provided file)
    json_file_path = r"webscrape/college_data/all_stem_majors.json"
    if os.path.exists(json_file_path):
        search_engine.load_json_data(json_file_path)
    
    # Load CSV data if available
    courses_csv = "courses.csv"
    majors_csv = "majors.csv"
    search_engine.load_csv_data(courses_csv, majors_csv)
    
    # Example searches
    print("=== Available Colleges ===")
    colleges = search_engine.get_colleges()
    for college in colleges:
        print(f"- {college}")
    
    print("\n=== Search for Computer Science courses ===")
    cs_courses = search_engine.search_courses(course_query="computer", limit=5)
    for course in cs_courses:
        print(f"- {course['course_code']}: {course['course_title']} ({course['course_type']})")
    
    print("\n=== Search for majors containing 'Computer' ===")
    cs_majors = search_engine.search_majors(major_query="computer")
    for major in cs_majors:
        print(f"- {major['major_name']} at {major['college']}")
    
    print("\n=== Majors at NC State ===")
    if colleges:
        nc_state_majors = search_engine.get_majors_by_college("North Carolina State University")
        for major in nc_state_majors:
            print(f"- {major}")


if __name__ == "__main__":
    main()
