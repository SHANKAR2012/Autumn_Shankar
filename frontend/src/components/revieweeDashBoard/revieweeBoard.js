import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios'; // Adjust the path accordingly
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';


const token = localStorage.getItem('access_token');

const RevieweeDashboard = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubmission, setNewSubmission] = useState({
    assignmentId: '',
    reviewee_comment: '',
    attachment: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userProfileRes = await axiosInstance.get('/current-user');
          setUserProfile(userProfileRes.data);
        // Fetch assignments specifically assigned to the current reviewee
        const assignmentsRes = await axiosInstance.get('/assignments/my-assignments'); // Adjusted endpoint for reviewee-specific assignments
        const formattedAssignments = assignmentsRes.data.map(formatAssignmentData);
        setAssignments(formattedAssignments);
        console.log("Formatted Assignments:", formattedAssignments);
  
        // Fetch submissions made by the current reviewee
        const submissionsRes = await axiosInstance.get('/submissions/my-submissions'); // Adjusted endpoint for reviewee-specific submissions
        const formattedSubmissions = submissionsRes.data.map(formatSubmissionData);
        setSubmissions(formattedSubmissions);
        console.log("Formatted Submissions:", formattedSubmissions);
  
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  const handleCreateSubmission = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('assignment', newSubmission.assignmentId);
      formData.append('reviewee_comment', newSubmission.reviewee_comment);
      if (newSubmission.attachment) {
        formData.append('attachment', newSubmission.attachment);
      }

      const response = await axiosInstance.post('/submissions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      Swal.fire({
        title: 'Submission Successful!',
        text: 'Your submission has been created successfully!',
        icon: 'success',
        confirmButtonText: 'Cool',
      });
  


      const formattedNewSubmission = formatSubmissionData(response.data);
      setSubmissions([...submissions, formattedNewSubmission]);

      // Reset form state
      setNewSubmission({
        assignmentId: '',
        reviewee_comment: '',
        attachment: null,
      });
    } catch (error) {
      console.error("Error creating submission:", error);
    }
  };

  const handleFileChange = (e) => {
    setNewSubmission({ ...newSubmission, attachment: e.target.files[0] });
  };
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleAssignmentChange = (e) => {
    setNewSubmission({ ...newSubmission, assignmentId: e.target.value });
  };
  const requestReview = async (submissionId) => {
    try {
        // Send a POST request to the new 'create notification' endpoint
        const response = await axiosInstance.post(`/create_notification/`, {
            assignment_id: submissionId,  // We assume assignment ID is related to submission
            message: 'A review has been requested for your assigned submission.',
        });

        // Notify the user about the success of the review request
        alert('Review requested successfully, and notifications have been sent to the reviewers!');

    } catch (error) {
        console.error('Error requesting review', error);
        alert('Failed to request review. Please try again.');
    }
};

  
const handleDelete = async (submissionId) => {
  // Use SweetAlert for confirmation dialog
  const confirmed = await Swal.fire({
    title: 'Are you sure?',
    text: 'You won’t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (confirmed.isConfirmed) {
    try {
      // Use axiosInstance for the DELETE request
      const response = await axiosInstance.delete(`/delete_submission/${submissionId}/`);

      if (response.status === 200) {
        // Update the UI to remove the deleted submission from the list
        setSubmissions(submissions.filter(submission => submission.id !== submissionId));
        
        // Success alert with SweetAlert
        Swal.fire(
          'Deleted!',
          'The submission has been deleted.',
          'success'
        );
      } else {
        // Failure alert with SweetAlert
        Swal.fire(
          'Failed!',
          'Failed to delete the submission.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error:', error);

      // Error alert with SweetAlert
      Swal.fire(
        'Error!',
        'An error occurred while deleting the submission.',
        'error'
      );
    }
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Reviewee Dashboard</h1>
          <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded">
            {assignments.length} Assignments
          </span>
          <span className="bg-green-100 text-green-800 py-1 px-2 rounded">
            {submissions.length} Submissions
          </span>
          <button 
      onClick={toggleProfile}
      className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
    >
      Profile
    </button>
        </div>
        {showProfile && userProfile && (
            <div className="bg-white p-4 rounded shadow-md mt-4">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p><strong>Username:</strong> {userProfile.username}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>Branch:</strong> {userProfile.branch}</p>
              <p><strong>Enrollment Number:</strong> {userProfile.enrollment_no}</p>
            </div>
          )}


        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
                  <h3 className="flex justify-between items-center">
                    <span>{assignment.title}</span>
                    <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded">{assignment.status}</span>
                  </h3>
                  <p className="text-gray-600">{assignment.description}</p>
                  <div className="flex justify-between items-center">
                    <span>Deadline: {assignment.deadline}</span>
                    <button className="border rounded px-2 py-1">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
      <h2 className="text-xl font-semibold">Submissions</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-4 px-6">Assignment ID</th>
              <th className="text-left py-4 px-6">Assignment</th>
              <th className="text-left py-4 px-6">Status</th>
              <th className="text-left py-4 px-6">Submitted On</th>
              <th className="text-left py-4 px-6">Attachment</th>
              <th className="text-left py-4 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">{submission.assignmentId}</td>
                <td className="py-4 px-6">{submission.assignmentTitle}</td>
                <td className="py-4 px-6">
                  <span 
                    className={submission.status === 'reviewed' 
                      ? 'bg-green-100 text-green-800 py-1 px-2 rounded'
                      : 'bg-yellow-100 text-yellow-800 py-1 px-2 rounded'
                    }
                  >
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6">{submission.submittedAt}</td>
                <td className="py-4 px-6">
                  {submission.attachment ? (
                    <a href={submission.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600">View</a>
                  ) : 'N/A'}
                </td>
                <td className="py-4 px-6">
                  {submission.status !== 'reviewed' && (
                    <button 
                      onClick={() => requestReview(submission.id)} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Request Review
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(submission.id)} 
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-semibold">Create New Submission</h2>
            <form onSubmit={handleCreateSubmission}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700">Select Assignment</label>
                  <select 
                    value={newSubmission.assignmentId}
                    onChange={handleAssignmentChange}
                    className="border border-gray-300 rounded w-full p-2"
                    required
                  >
                    <option value="">Select an assignment</option>
                    {assignments.map(assignment => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.title} (ID: {assignment.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700">(Add your github link)Comment</label>
                  <textarea
                    value={newSubmission.reviewee_comment}
                    onChange={(e) => setNewSubmission({ ...newSubmission, reviewee_comment: e.target.value })}
                    className="border border-gray-300 rounded w-full p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Attachment</label>
                  <input
                    type="file"
                    accept="application/pdf, image/*, .docx"
                    onChange={handleFileChange}
                    className="border border-gray-300 rounded w-full p-2"
                  />
                </div>
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Submit Assignment</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatAssignmentData = (assignment) => ({
  id: assignment.id,
  title: assignment.title,
  description: assignment.description,
  deadline: assignment.deadline || 'Not set',
  status: assignment.status || 'Active',
});

const formatSubmissionData = (submission) => ({
  id: submission.submission_id,
  assignmentId: submission.assignment,
  assignmentTitle: submission.assignment_title || 'Unknown Assignment',
  submittedAt: new Date(submission.created_at).toLocaleString(),
  status: submission.status,
  attachment: submission.attachment,
});

export default RevieweeDashboard;
