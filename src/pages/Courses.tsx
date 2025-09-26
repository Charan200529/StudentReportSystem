import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canManageCourses, isStudent } from '@/utils/rbac';
import api from '@/services/api';

export const Courses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form, setForm] = useState({
    title: '',
    code: '',
    description: '',
    teacher: '',
    semester: '' as number | '' ,
    status: 'active',
  });
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getAllCourses();
        // Backend returns Course entities; normalize to UI shape
        const list = (data || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          code: c.code,
          description: c.description,
          semester: c.semester,
          teacher: c.teacher?.displayName || c.teacherId || 'Unknown',
          status: 'active',
          students: 0,
        }));
        
        // Filter courses based on user role and semester
        let filteredCourses = list;
        
        if (isStudent(user) && user?.currentSemester) {
          // Students see only courses for their semester
          filteredCourses = list.filter(course => course.semester === user.currentSemester);
        }
        
        setCourses(filteredCourses);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCourses(user)) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        code: form.code.trim(),
        description: form.description.trim(),
        semester: typeof form.semester === 'number' ? form.semester : 1,
        // Use current user's backend id as teacherId
        teacherId: Number(user?.uid),
      };
      const created = await api.createCourse(payload);
      const createdUI = {
        id: created.id,
        title: created.title,
        code: created.code,
        description: created.description,
        semester: created.semester,
        teacher: created.teacher?.displayName || created.teacherId,
        status: 'active',
        students: 0,
      };
      setCourses([createdUI, ...courses]);
      setShowForm(false);
      setForm({ title: '', code: '', description: '', teacher: '', semester: '', status: 'active' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setForm({
      title: course.title || '',
      code: course.code || '',
      description: course.description || '',
      teacher: course.teacher || '',
      semester: course.semester || '',
      status: course.status || 'active'
    });
    setShowEditForm(true);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !canManageCourses(user)) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        code: form.code.trim(),
        description: form.description.trim(),
        semester: typeof form.semester === 'number' ? form.semester : 1,
        teacherId: Number(user?.uid),
      };
      const updated = await api.updateCourse(Number(editingCourse.id), payload);
      const updatedUI = {
        id: updated.id,
        title: updated.title,
        code: updated.code,
        description: updated.description,
        semester: updated.semester,
        teacher: updated.teacher?.displayName || updated.teacherId,
        status: 'active',
        students: 0,
      };
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...updatedUI } : c));
      setShowEditForm(false);
      setEditingCourse(null);
      setForm({ title: '', code: '', description: '', teacher: '', semester: '', status: 'active' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    if (!canManageCourses(user)) return;
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await api.deleteCourse(Number(courseId));
        setCourses(courses.filter(c => c.id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">
            Manage and view all available courses
          </p>
        </div>
        {canManageCourses(user) && (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <input type="number" min={1} max={12} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value === '' ? '' : Number(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teacher</label>
                <input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
                <button disabled={saving} type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(isStudent(user) ? courses.filter(c => (user?.currentSemester ?? null) == null ? true : c.semester === user?.currentSemester) : courses).map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  course.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {course.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Code:</span>
                  {course.code}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Teacher:</span>
                  {course.teacher}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium mr-2">Semester:</span>
                  {course.semester ?? '-'}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {course.students} students
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View Details
                  </button>
                  {canManageCourses(user) && (
                    <>
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading / Empty State */}
      {loading && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Loading courses...</p>
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new course.
          </p>
          {canManageCourses(user) && (
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditForm && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Course</h3>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <input type="number" min={1} max={12} value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value === '' ? '' : Number(e.target.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teacher</label>
                <input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => { setShowEditForm(false); setEditingCourse(null); setForm({ title: '', code: '', description: '', teacher: '', semester: '', status: 'active' }); }} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
                <button disabled={saving} type="submit" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
