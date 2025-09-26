import React, { useEffect, useState } from 'react';
import { FileText, Clock, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateAssignments, isStudent, canGradeSubmissions, isAdmin, isTeacher } from '@/utils/rbac';
import { apiService } from '@/services/api';

export const Assignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: '',
    semester: '',
    maxPoints: '',
    dueDate: '',
    instructions: '',
    attachments: [] as string[],
  });
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [submissionText, setSubmissionText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [gradingSuccess, setGradingSuccess] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching assignments and submissions...');
        
        // Fetch assignments from Spring Boot API (now returns mock data)
        const assignmentsData = await apiService.getAllAssignments();
        console.log('Assignments from API:', assignmentsData);
        
        // Fetch courses to filter assignments by semester
        const coursesData = await apiService.getAllCourses();
        console.log('Courses from API:', coursesData);
        setCourses(coursesData || []);
        
        // Filter assignments based on user role and semester
        let filteredAssignments = assignmentsData || [];
        
        if (isStudent(user) && user?.currentSemester) {
          // Students see only assignments for courses in their semester
          const studentCourses = coursesData?.filter(course => course.semester === user.currentSemester) || [];
          const studentCourseIds = studentCourses.map(course => course.id);
          filteredAssignments = assignmentsData?.filter(assignment => 
            studentCourseIds.includes(assignment.courseId)
          ) || [];
        }
        
        setAssignments(filteredAssignments);
        
        // Create mock enrollments for students
        if (user && user.roles?.includes('STUDENT')) {
          const mockEnrollments = coursesData?.filter(course => 
            course.semester === user.currentSemester
          ).map(course => ({
            id: course.id,
            courseId: course.id,
            studentId: user.uid,
            status: 'ACTIVE'
          })) || [];
          setEnrollments(mockEnrollments);
        } else {
          setEnrollments([]);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]);
        setCourses([]);
        setEnrollments([]);
      }

      try {
        // Mock submissions for now since API is not working
        const mockSubmissions = [
          { id: 1, assignmentId: 1, studentId: user?.uid, content: 'My submission', submittedAt: new Date().toISOString(), grade: null },
          { id: 2, assignmentId: 3, studentId: user?.uid, content: 'Another submission', submittedAt: new Date().toISOString(), grade: 85 }
        ];
        setSubmissions(mockSubmissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  // Debug effect to log submissions changes
  useEffect(() => {
    console.log('Submissions state changed:', submissions);
  }, [submissions]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateAssignments(user)) return;
    
    // Validate that a course is selected
    if (!form.courseId) {
      alert('Please select a course for this assignment');
      return;
    }
    
    setSaving(true);
    try {
      // Get the semester from the selected course
      const selectedCourse = courses.find(c => c.id === parseInt(form.courseId));
      const courseSemester = selectedCourse ? selectedCourse.semester : 1;
      
      const newAssignment = {
        title: form.title.trim(),
        description: form.description.trim(),
        courseId: parseInt(form.courseId),
        semester: courseSemester,
        maxPoints: parseInt(form.maxPoints) || 100,
        dueDate: form.dueDate,
        instructions: form.instructions.trim(),
        attachments: form.attachments,
        status: 'ACTIVE',
      };
      
      console.log('Creating new assignment:', newAssignment);
      const createdAssignment = await apiService.createAssignment(newAssignment);
      console.log('Assignment created successfully:', createdAssignment);
      
      setAssignments([createdAssignment, ...assignments]);
      setShowForm(false);
      setForm({ title: '', description: '', courseId: '', semester: '', maxPoints: '', dueDate: '', instructions: '', attachments: [] });
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowDetails(true);
    setSubmissionText('');
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !user || !submissionText.trim()) return;
    
    // Prevent duplicate submissions
    if (hasUserSubmitted(selectedAssignment.id)) {
      console.error('User has already submitted this assignment');
      return;
    }
    
    setSubmitting(true);
    try {
      const submission = {
        assignmentId: selectedAssignment.id,
        submissionText: submissionText.trim(),
        status: 'SUBMITTED',
      };
      
      const createdSubmission = await apiService.createSubmission(submission);
      setSubmissions([createdSubmission, ...submissions]);
      
      console.log('New submission created:', createdSubmission);
      
      setShowDetails(false);
      setSelectedAssignment(null);
      setSubmissionText('');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    if (!user) return;
    try {
      await apiService.gradeSubmission(parseInt(submissionId), score, feedback);
      
      // Update local state
      setSubmissions(submissions.map(s => 
        s.id === submissionId 
          ? { ...s, score, feedback, status: 'GRADED' }
          : s
      ));
      
      console.log('Submission graded successfully:', { submissionId, score, feedback });
      setGradingSuccess(`Submission graded successfully! Score: ${score}/${selectedAssignment?.maxPoints}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setGradingSuccess(null), 3000);
    } catch (error) {
      console.error('Error grading submission:', error);
      setGradingSuccess('Error grading submission. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => setGradingSuccess(null), 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Calculate submission count for an assignment dynamically
  const getSubmissionCount = (assignmentId: string) => {
    return submissions.filter(sub => sub.assignmentId === assignmentId).length;
  };

  // Check if current user has already submitted this assignment
  const hasUserSubmitted = (assignmentId: string) => {
    if (!user) return false;
    const hasSubmitted = submissions.some(sub => 
      sub.assignmentId === assignmentId && sub.studentId === user.uid
    );
    console.log(`hasUserSubmitted for assignment ${assignmentId}:`, hasSubmitted, 'User:', user.uid, 'Submissions:', submissions.filter(sub => sub.assignmentId === assignmentId));
    return hasSubmitted;
  };

  // Get current user's submission for a specific assignment
  const getUserSubmission = (assignmentId: string) => {
    if (!user) return null;
    const userSubmission = submissions.find(sub => 
      sub.assignmentId === assignmentId && sub.studentId === user.uid
    );
    console.log(`getUserSubmission for assignment ${assignmentId}:`, userSubmission, 'User:', user.uid);
    return userSubmission;
  };

  // Check if user is enrolled in a specific semester
  const isUserEnrolledInSemester = (semester: string) => {
    if (!user) {
      console.log('❌ No user found');
      return false;
    }
    
    // Use user's currentSemester (same logic as Courses.tsx)
    const userSemester = user.currentSemester?.toString();
    console.log(`\n🔍 Checking semester access: ${semester}`);
    console.log(`👤 User's currentSemester: ${userSemester}`);
    
    if (!userSemester) {
      console.log('❌ User has no currentSemester set');
      return false;
    }
    
         const semesterMatch = userSemester === semester || userSemester === semester.toString() || userSemester.toString() === semester;
     console.log(`🎯 Semester match (${userSemester} === ${semester}): ${semesterMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
     console.log(`🔍 Type check: userSemester type: ${typeof userSemester}, semester type: ${typeof semester}`);
     
     return semesterMatch;
  };

  // Get assignments that the current user should see
  const getVisibleAssignments = () => {
    if (!user) return [];
    
    if (isAdmin(user) || isTeacher(user)) {
      // Admins and teachers see all assignments
      console.log('Admin/Teacher - showing all assignments:', assignments.length);
      return assignments;
    }
    
         if (isStudent(user)) {
       // Students see assignments for their semester (same logic as Courses.tsx)
       console.log('Student - checking assignments for their semester');
       console.log('Total assignments:', assignments.length);
       console.log('User currentSemester:', user.currentSemester);
      
             console.log('=== ASSIGNMENT FILTERING DEBUG ===');
       console.log('Total assignments to check:', assignments.length);
       
               const visibleAssignments = assignments.filter(assignment => {
          console.log(`\n--- Checking Assignment: ${assignment.title} ---`);
          console.log('Assignment semester:', assignment.semester);
          
          if (!assignment.semester) {
            console.log('❌ SKIPPING: Assignment has no semester');
            return false;
          }
          
          const isEnrolled = isUserEnrolledInSemester(assignment.semester);
          console.log(`Enrollment check for semester ${assignment.semester}: ${isEnrolled ? '✅ ENROLLED' : '❌ NOT ENROLLED'}`);
          
          if (isEnrolled) {
            console.log(`✅ INCLUDING: ${assignment.title} (enrolled in semester)`);
          } else {
            console.log(`❌ EXCLUDING: ${assignment.title} (not enrolled in semester)`);
          }
          
          return isEnrolled;
        });
       
       console.log('\n=== FILTERING RESULTS ===');
       console.log(`Total assignments: ${assignments.length}`);
       console.log(`Assignments with courseId: ${assignments.filter(a => a.courseId).length}`);
       console.log(`Assignments without courseId: ${assignments.filter(a => !a.courseId).length}`);
       console.log(`Student enrollments: ${enrollments.length}`);
       console.log(`Visible assignments for student: ${visibleAssignments.length}`);
       console.log('Visible assignments:', visibleAssignments.map(a => ({ title: a.title, courseId: a.courseId })));
       
       return visibleAssignments;
    }
    
    return [];
  };


  return (
    <div>
             <div className="mb-8 flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
           <p className="mt-2 text-gray-600">
             View and manage course assignments
           </p>
                       {/* Debug info */}
           
            
            {/* Extended Debug Info for Students */}
            
            
                         {/* Course Assignment Mapping Info */}
             
         </div>
        {canCreateAssignments(user) && (
          <button 
            onClick={() => setShowForm(true)} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </button>
        )}
      </div>

             {/* Assignment List */}
       <div className="bg-white shadow rounded-lg">
                   <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {isStudent(user) ? 'Your Course Assignments' : 'All Assignments'} ({getVisibleAssignments().length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
                       {getVisibleAssignments() && getVisibleAssignments().length > 0 ? getVisibleAssignments().map((assignment) => (
             <div key={assignment.id} className="px-6 py-4 hover:bg-gray-50">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                     <FileText className="h-6 w-6 text-primary-600" />
                   </div>
                   <div>
                     <h3 className="text-lg font-medium text-gray-900">
                       {assignment.title}
                     </h3>
                                           <p className="text-sm text-gray-500">
                        {assignment.semester ? `Semester ${assignment.semester}` : 'No Semester'}
                      </p>
                   </div>
                 </div>
                 
                 <div className="flex items-center space-x-4">
                   <div className="text-right">
                     <p className="text-sm text-gray-500">Due Date</p>
                     <p className="text-sm font-medium text-gray-900">
                       {assignment.dueDate}
                     </p>
                   </div>
                   
                   <div className="text-right">
                     <p className="text-sm text-gray-500">Points</p>
                     <p className="text-sm font-medium text-gray-900">
                       {assignment.maxPoints}
                     </p>
                   </div>
                   
                                       <div className="text-right">
                      <p className="text-sm text-gray-500">Submissions</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getSubmissionCount(assignment.id)}
                      </p>
                    </div>
                    
                    {isStudent(user) && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Your Status</p>
                        <div className="text-sm font-medium">
                          {hasUserSubmitted(assignment.id) ? (
                            <span className="text-green-600">Submitted</span>
                          ) : (
                            <span className="text-gray-500">Not Submitted</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(assignment.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </div>
                   
                                        <div className="flex items-center space-x-2">
                       {isStudent(user) && hasUserSubmitted(assignment.id) && (
                         <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                           <CheckCircle className="h-3 w-3" />
                           <span>Submitted</span>
                         </div>
                       )}
                       <button 
                         onClick={() => handleViewDetails(assignment)}
                         className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                       >
                         View Details
                       </button>
                     </div>
                 </div>
               </div>
             </div>
           )) : (
             <div className="px-6 py-8 text-center">
               <p className="text-gray-500">
                 {isStudent(user) 
                   ? 'No assignments available for your enrolled courses.' 
                   : 'No assignments available.'
                 }
               </p>
             </div>
           )}
        </div>
             </div>

       {/* Student Course Enrollments Info */}
       {isStudent(user) && enrollments.length > 0 && (
         <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
           <h3 className="text-lg font-medium text-blue-900 mb-2">Your Enrolled Courses</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
             {enrollments.map((enrollment) => {
               const course = courses.find(c => c.id === enrollment.courseId);
               return course ? (
                 <div key={enrollment.courseId} className="bg-white p-3 rounded border">
                   <div className="font-medium text-blue-800">{course.code}</div>
                   <div className="text-sm text-blue-600">{course.title}</div>
                   <div className="text-xs text-blue-500 mt-1">
                     Status: <span className="font-medium">{enrollment.status}</span>
                   </div>
                 </div>
               ) : null;
             })}
           </div>
         </div>
       )}

       {/* Create Assignment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  required 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  rows={3} 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                />
              </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Course</label>
                                                              <select 
                        required 
                        value={form.courseId} 
                        onChange={(e) => {
                          const selectedCourse = courses.find(c => c.id === e.target.value);
                          setForm({ 
                            ...form, 
                            courseId: e.target.value,
                            semester: selectedCourse ? selectedCourse.semester.toString() : ''
                          });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="">Select a course</option>
                        {courses.length > 0 ? (
                          courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.code} - {course.title} (Semester {course.semester})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No courses available</option>
                        )}
                      </select>
                     {courses.length === 0 && (
                       <p className="mt-1 text-xs text-red-500">No courses found. Please create courses first.</p>
                     )}
                                           <div className="mt-1 text-xs text-gray-500">
                        Available courses: {courses.length}
                      </div>
                      
                      {/* Show selected semester */}
                      {form.semester && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <div className="font-medium text-green-800">Selected Semester: {form.semester}</div>
                          <div className="text-green-600">Students enrolled in Semester {form.semester} will see this assignment</div>
                        </div>
                      )}
                     
                     {/* Show which students will see this assignment */}
                     {form.courseId && (
                       <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                         <div className="font-medium text-blue-800">Students who will see this assignment:</div>
                         {(() => {
                           const course = courses.find(c => c.id === form.courseId);
                           if (!course) return <span className="text-blue-600">Course not found</span>;
                           
                           // This would need to be implemented to show actual enrolled students
                           return (
                             <span className="text-blue-600">
                               All students enrolled in {course.code} - {course.title}
                             </span>
                           );
                         })()}
                       </div>
                     )}
                 </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Points</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="1000" 
                    value={form.maxPoints} 
                    onChange={(e) => setForm({ ...form, maxPoints: e.target.value })} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={form.dueDate} 
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instructions</label>
                <textarea 
                  rows={4} 
                  value={form.instructions} 
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })} 
                  placeholder="Detailed instructions for students"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={saving} 
                  type="submit" 
                  className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Details Modal */}
      {showDetails && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                         <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-gray-900">Assignment Details</h3>
               <button 
                 onClick={() => setShowDetails(false)} 
                 className="text-gray-400 hover:text-gray-600"
               >
                 <span className="sr-only">Close</span>
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             {/* Success/Error Messages */}
             {gradingSuccess && (
               <div className={`mb-4 p-3 rounded-md ${
                 gradingSuccess.includes('Error') 
                   ? 'bg-red-50 border border-red-200 text-red-800' 
                   : 'bg-green-50 border border-green-200 text-green-800'
               }`}>
                 {gradingSuccess}
               </div>
             )}

            {/* Assignment Information */}
            <div className="mb-6">
              <h4 className="text-xl font-medium text-gray-900 mb-2">{selectedAssignment.title}</h4>
              <p className="text-gray-600 mb-4">{selectedAssignment.description}</p>
              
                             <div className="grid grid-cols-2 gap-4 mb-4">
                 <div>
                   <span className="text-sm font-medium text-gray-500">Semester:</span>
                   <p className="text-sm text-gray-900">
                     {selectedAssignment.semester ? selectedAssignment.semester : 'No Semester'}
                   </p>
                 </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Max Points:</span>
                  <p className="text-sm text-gray-900">{selectedAssignment.maxPoints}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Due Date:</span>
                  <p className="text-sm text-gray-900">{selectedAssignment.dueDate}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <p className="text-sm text-gray-900">{selectedAssignment.status}</p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Instructions:</span>
                <p className="text-sm text-gray-900 mt-1">{selectedAssignment.instructions}</p>
              </div>
            </div>

                         {/* Student Submission Section */}
             {isStudent(user) && (
               <div className="mb-6">
                 {!hasUserSubmitted(selectedAssignment.id) ? (
                   // Show submission form if not submitted yet
                   <>
                     <h5 className="text-lg font-medium text-gray-900 mb-3">Submit Your Assignment</h5>
                     <textarea
                       rows={6}
                       value={submissionText}
                       onChange={(e) => setSubmissionText(e.target.value)}
                       placeholder="Type your assignment submission here..."
                       className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                     />
                     <div className="mt-3 flex justify-end">
                       <button
                         onClick={handleSubmitAssignment}
                         disabled={submitting || !submissionText.trim()}
                         className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                       >
                         {submitting ? 'Submitting...' : 'Submit Assignment'}
                       </button>
                     </div>
                   </>
                 ) : (
                   // Show submission status if already submitted
                   <>
                     <h5 className="text-lg font-medium text-gray-900 mb-3">Your Submission</h5>
                     {(() => {
                       const userSubmission = getUserSubmission(selectedAssignment.id);
                       if (!userSubmission) return null;
                       
                       return (
                         <div className="border rounded-lg p-4 bg-gray-50">
                           <div className="mb-3">
                             <p className="text-sm text-gray-700 font-medium">Your Submission:</p>
                             <p className="text-sm text-gray-600 mt-1">{userSubmission.submissionText}</p>
                           </div>
                           
                           <div className="text-sm text-gray-500">
                             Submitted: {new Date(userSubmission.submittedAt).toLocaleDateString()}
                           </div>
                           
                           {userSubmission.status === 'graded' ? (
                             <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                               <div className="flex items-center justify-between">
                                 <span className="text-sm font-medium text-green-800">
                                   Score: {userSubmission.score}/{selectedAssignment.maxPoints}
                                 </span>
                                 <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                   Graded
                                 </span>
                               </div>
                               {userSubmission.feedback && (
                                 <p className="text-sm text-green-700 mt-2">
                                   <span className="font-medium">Feedback:</span> {userSubmission.feedback}
                                 </p>
                               )}
                             </div>
                           ) : (
                             <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                               <div className="flex items-center space-x-2">
                                 <Clock className="h-4 w-4 text-yellow-600" />
                                 <span className="text-sm font-medium text-yellow-800">
                                   Waiting for result...
                                 </span>
                               </div>
                               <p className="text-xs text-yellow-600 mt-1">
                                 Your submission has been received and is waiting to be graded by your teacher.
                               </p>
                             </div>
                           )}
                         </div>
                       );
                     })()}
                   </>
                 )}
               </div>
             )}

            {/* Teacher/Admin Submissions View */}
            {canGradeSubmissions(user) && (
              <div>
                <h5 className="text-lg font-medium text-gray-900 mb-3">Student Submissions</h5>
                {submissions.filter(s => s.assignmentId === selectedAssignment.id).length === 0 ? (
                  <p className="text-gray-500">No submissions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {submissions
                      .filter(s => s.assignmentId === selectedAssignment.id)
                      .map((submission) => (
                        <div key={submission.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{submission.studentName}</span>
                            <span className="text-sm text-gray-500">
                              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-gray-700">{submission.submissionText}</p>
                          </div>
                          
                          {submission.status === 'graded' ? (
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  Score: {submission.score}/{selectedAssignment.maxPoints}
                                </span>
                                <span className="text-sm text-gray-500">Graded</span>
                              </div>
                              {submission.feedback && (
                                <p className="text-sm text-gray-600 mt-1">Feedback: {submission.feedback}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3">
                              <input
                                type="number"
                                min="0"
                                max={selectedAssignment.maxPoints}
                                placeholder="Score"
                                className="w-20 rounded border-gray-300 text-sm"
                                id={`score-${submission.id}`}
                              />
                              <input
                                type="text"
                                placeholder="Feedback (optional)"
                                className="flex-1 rounded border-gray-300 text-sm"
                                id={`feedback-${submission.id}`}
                              />
                                                              <button
                                  onClick={async () => {
                                    const scoreInput = document.getElementById(`score-${submission.id}`) as HTMLInputElement;
                                    const feedbackInput = document.getElementById(`feedback-${submission.id}`) as HTMLInputElement;
                                    const score = parseInt(scoreInput.value);
                                    const feedback = feedbackInput.value;
                                    if (!isNaN(score)) {
                                      await handleGradeSubmission(submission.id, score, feedback);
                                      // Clear the form inputs after successful grading
                                      scoreInput.value = '';
                                      feedbackInput.value = '';
                                    }
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                  Grade
                                </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading / Empty State */}
      {loading && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Loading assignments...</p>
        </div>
      )}

      {!loading && assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new assignment.
          </p>
          {canCreateAssignments(user) && (
            <div className="mt-6">
              <button 
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
