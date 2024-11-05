  import React, { useEffect, useState } from 'react';
  import axiosInstance from '../api/axios'; // Adjust the path accordingly
  import { Loader2 } from 'lucide-react';
  import { ChevronDown, ChevronUp, Paperclip } from 'lucide-react';



  import Swal from 'sweetalert2';
  const token = localStorage.getItem('access_token');
  console.log(token);
  
  

  const ReviewerDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [reviewees, setReviewees] = useState([]);
    const [reviewers, setReviewers] = useState([]); // Initialize reviewers array
    const [showProfile, setShowProfile] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [newAssignment, setNewAssignment] = useState({
      title: '',
      description: '',
      deadline: '',
      reviewees: [],
      reviewers:[],
      attachment: null, 
      group:null// State for selected attachment
    });
    

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const assignmentsRes = await axiosInstance.get('/assignments/');
          console.log(assignmentsRes.data);
          const formattedAssignments = assignmentsRes.data.map(formatAssignmentData);
          setAssignments(formattedAssignments);

          const submissionsRes = await axiosInstance.get('/submissions/');
          const formattedSubmissions = submissionsRes.data.map(formatSubmissionData);
          setSubmissions(formattedSubmissions);

          const usersRes = await axiosInstance.get('/users/');
          const revieweesList = usersRes.data.filter(user =>
            user.roles && user.roles.includes('reviewee')
          ).map(reviewee => ({
            id: reviewee.id,
             username: reviewee.username,
          }));
          setReviewees(revieweesList);
          console.log(revieweesList)
          const reviewersList = usersRes.data.filter(user =>
            user.roles && user.roles.includes('reviewer')
        ).map(reviewer => ({
            id: reviewer.id,
             username: reviewer.username,
        }));
        
         setReviewers(reviewersList);
         console.log(reviewersList);
        

          const userProfileRes = await axiosInstance.get('/current-user');
          setUserProfile(userProfileRes.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    const toggleDetails = (id) => {
      setExpandedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
          setSelectedAssignmentId(null);
        } else {
          newSet.add(id);
          setSelectedAssignmentId(id);
        }
        return newSet;
      });
    };

    const handleCreateAssignment = async (e) => {
      e.preventDefault();
      try {
        const formData = new FormData();
formData.append('title', newAssignment.title);
formData.append('description', newAssignment.description);
formData.append('deadline', new Date(newAssignment.deadline).toISOString());

// Append each reviewee ID individually to the FormData
newAssignment.reviewees.forEach(revieweeId => {
  formData.set('reviewees', newAssignment.reviewees);
  
});
newAssignment.reviewers.forEach(reviewerId => {
   
  formData.set('reviewers', newAssignment.reviewers);
});
if (newAssignment.attachment) {
    formData.append('attachment', newAssignment.attachment);
}

// Now you can use formData to send it in your fetch or axios request

        const response = await axiosInstance.post('/assignments/', formData, {
          headers: {
            // 'Content-Type': 'formData',
            'Authorization': `Bearer ${token}`,
          },
        });
        if(response){
          console.log()
          Swal.fire({
              title: 'assignment created',
              text: 'assignment created successfully',
              icon: 'success',
              confirmButtonText: 'Cool'
            });
        }

        const formattedNewAssignment = formatAssignmentData(response.data);
        setAssignments([...assignments, formattedNewAssignment]);
        
        // Reset form state
        setNewAssignment({
          title: '',
          description: '',
          deadline: '',
          reviewees: [],
          reviewers:[],
          attachment: null,
        });
      } catch (error) {
        console.error("Error creating assignment:", error);
      }
    };
    const isoDate = "2024-12-01T12:00:00Z";
const date = new Date(isoDate);

console.log(date); 

    // const handleRevieweeChange = (e) => {
    //   const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    //   setNewAssignment({ ...newAssignment, reviewees: selectedOptions });
    //   console.log('Selected reviewees:', selectedOptions); // Debugging line
    // };
    const handleRevieweeChange = (e) => {
      const { value, checked } = e.target; // Get the value and checked status of the checkbox
      setNewAssignment((prevState) => {
          // If checked, add the value to the reviewees array; if unchecked, remove it
          const updatedReviewees = checked 
              ? [...prevState.reviewees, value] // Add the selected reviewee
              : prevState.reviewees.filter((id) => id !== value); // Remove the deselected reviewee

          return { ...prevState, reviewees: updatedReviewees }; // Update the assignment state
      });
  };
  

  const handleReviewerChange = (e) => {
    const { value, checked } = e.target;
    setNewAssignment(prevState => ({
        ...prevState,
        reviewers: checked
            ? [...prevState.reviewers, value]
            : prevState.reviewers.filter(id => id !== value)
    }));
};
  console.log('Selected reviewers:', newAssignment.reviewers);


    const handleSelectAllReviewees = (e) => {
      if (e.target.checked) {
        const allReviewees = reviewees.map(reviewee => reviewee.id);
        setNewAssignment({ ...newAssignment, reviewees: allReviewees });
      } else {
        setNewAssignment({ ...newAssignment, reviewees: [] });
      }
    };

    const handleFileChange = (e) => {
      setNewAssignment({ ...newAssignment, attachment: e.target.files[0] });
    };

    const toggleProfile = () => {
      setShowProfile(!showProfile);
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
            <h1 className="text-3xl font-bold text-gray-900">Reviewer Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleProfile}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Profile
              </button>
              <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded">
                {assignments.length} Assignments
              </span>
              <span className="bg-green-100 text-green-800 py-1 px-2 rounded">
                {submissions.length} Submissions
              </span>
            </div>
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

          {/* <div className="space-y-6">
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
            </div> */}
             <div className="space-y-6 p-6">
      <h2 className="text-2xl font-semibold">Assignments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div 
            key={assignment.id} 
            className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
          >
            {/* Assignment Header */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">{assignment.title}</h3>
              <span className={`py-1 px-3 rounded-full text-sm ${
                assignment.status === 'Submitted' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {assignment.status}
              </span>
            </div>

            {/* Preview - Always visible */}
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={() => toggleDetails(assignment.id)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                View Details
                {expandedIds.has(assignment.id) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Expanded Details */}
            {expandedIds.has(assignment.id) && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div>
                  <h4 className="font-medium mb-2">Description:</h4>
                  <p className="text-gray-600">{assignment.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Deadline:</h4>
                  <p className="text-gray-600">{new Date(assignment.deadline).toLocaleDateString()}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Attachments:</h4>
                  <div className="space-y-2">
                    {assignment.attachments && assignment.attachments.map((attachment, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span>{assignment.attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submissions Section */}
                {selectedAssignmentId === assignment.id && (
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold">Submissions</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left py-4 px-6">Assignment ID</th>
                            <th className="text-left py-4 px-6">Assignment</th>
                            <th className="text-left py-4 px-6">Username</th>
                            <th className="text-left py-4 px-6">Status</th>
                            <th className="text-left py-4 px-6">Submitted On</th>
                            <th className="text-left py-4 px-6">Attachment</th>
                            <th className="text-left py-4 px-6">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions
                            .filter(submission => submission.assignmentId === assignment.id)
                            .map(submission => (
                              <tr key={submission.id} className="border-b hover:bg-gray-50">
                                <td className="py-4 px-6">{submission.assignmentId}</td>
                                <td className="py-4 px-6">{submission.assignmentTitle}</td>
                                <td className="py-4 px-6">{submission.username}</td>
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
                                  <button className="bg-blue-500 text-white py-1 px-2 rounded">Review</button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold">Create New Assignment</h2>
              <form onSubmit={handleCreateAssignment}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      className="border border-gray-300 rounded w-full p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Description</label>
                    <textarea
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      className="border border-gray-300 rounded w-full p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Deadline</label>
                    <input
                      type="date"
                      value={newAssignment.deadline}
                      onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                      className="border border-gray-300 rounded w-full p-2"
                      required
                    />
                  </div>
                  <div>
                  {/* <label className="block text-gray-700">Select Reviewees</label> */}
  {/* <select 
    multiple 
    value={newAssignment.reviewees} 
    onChange={handleRevieweeChange} 
    className="border border-gray-300 rounded w-full p-2"
  >
    {reviewees.map(reviewee => (
      <option key={reviewee.id} value={reviewee.id}>
        {reviewee.username} (ID: {reviewee.id})
      </option>
    ))}
  </select> */}
  <div>
    <label className="block mb-2 font-bold">Select Reviewees:</label>
    {reviewees.map(reviewee => (
        <div key={reviewee.id} className="flex items-center mb-2">
            <input
                type="checkbox"
                value={reviewee.id}
                onChange={handleRevieweeChange}
                className="mr-2"
                checked={newAssignment.reviewees.includes(reviewee.id)} // Check if this reviewee is already selected
            />
            <span>{reviewee.username} (ID: {reviewee.id})</span>
        </div>
    ))}
</div>
{/* <div>
    <label className="block mb-2 font-bold">Select Reviewees:</label>
    {reviewees.map(reviewee => (
        <div key={reviewee.id} className="flex items-center mb-2">
            <input
                type="checkbox"
                value={reviewee.id}
                onChange={handleRevieweeChange}
                className="mr-2"
                checked={newAssignment.reviewees.includes(reviewee.id)} // Check if this reviewee is already selected
            />
            <span>{reviewee.username} (ID: {reviewee.id})</span>
        </div>
    ))}
</div> */}

<div>
    <label className="block mb-2 font-bold">Select Reviewers:</label>
    {reviewers.map(reviewer => (
        <div key={reviewer.id} className="flex items-center mb-2">
            <input
                type="checkbox"
                value={reviewer.id}
                onChange={handleReviewerChange}
                className="mr-2"
                checked={newAssignment.reviewers.includes(reviewer.id)} // Check if this reviewer is already selected
            />
            <span>{reviewer.username} (ID: {reviewer.id})</span>
        </div>
    ))}
</div>



  <label className="inline-flex items-center mt-2">
    <input type="checkbox" onChange={handleSelectAllReviewees} className="mr-2" />
    Select All Reviewees
  </label>

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
                  <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Create Assignment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      
    );
  };

  const formatAssignmentData = (assignment) => ({ id: assignment.id, title: assignment.title, description: assignment.description, deadline: assignment.deadline || 'Not set', status: assignment.status || 'Active', }); 
  const formatSubmissionData = (submission) => ({ id: submission.id, assignmentId: submission.assignment, assignmentTitle: submission.assignment_title || 'Unknown Assignment', username: submission.reviewee_username || 'Anonymous', submittedAt: new Date(submission.created_at).toLocaleDateString(), status: submission.is_reviewed ? 'reviewed' : 'pending', attachment: submission.attachment || '', comment: submission.comment || '', grade: submission.grade || null });
  export default ReviewerDashboard;

     