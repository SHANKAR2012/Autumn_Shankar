  import React, { useEffect, useState } from 'react';
  import axiosInstance from '../api/axios'; // Adjust the path accordingly
  import { Loader2 } from 'lucide-react';
  import { ChevronDown, ChevronUp, Paperclip } from 'lucide-react';

  import Linkify from 'react-linkify';
  import CreateGroupAssignmentButton from './createAssignmentGroup';
  import Swal from 'sweetalert2';
  const token = localStorage.getItem('access_token');
  console.log(token);
  
  

  const ReviewerDashboard = () => {
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupReviewees, setSelectedGroupReviewees] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  const toggleGroupModal = () => setIsGroupModalOpen(!isGroupModalOpen);
    

const [comment, setComment] = useState("");

    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
    
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
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
  const handleSelectAll = () => {
    setSelectedGroupReviewees(
      selectedGroupReviewees.length === reviewees.length
        ? []
        : reviewees.map((r) => r.id)
    );
  };

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
    const handleReviewClick = (submissionId) => {
      setCurrentSubmissionId(submissionId);
      setShowModal(true);
    };
  
    const handleSubmitComment = () => {
      if (!currentSubmissionId) return;
    
      axiosInstance
        .post(`/submit-comment/${currentSubmissionId}/`, {
          comment_text: comment.trim(),
          status: "checked",
           // Update the status to 'checked'
        })
        .then((response) => {
          console.log("Comment and status updated successfully:", response.data);
    
          // Close modal and reset state
          setShowModal(false);
          setComment("");
    
          // Optionally, update submission status locally
          setSubmissions((prevSubmissions) =>
            prevSubmissions.map((submission) =>
              submission.submission_id === currentSubmissionId
                ? { ...submission, status: "checked", comment: comment.trim() }
                : submission
            )
          );
        })
        .catch((error) => {
          console.error("Error updating comment and status:", error);
        });
    };
    

    const toggleProfile = () => {
      setShowProfile(!showProfile);
    };
    const linkDecorator = (href, text, key) => (
      <a
        href={href}
        key={key}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline hover:text-blue-700"
      >
        {text}
      </a>
    );
    const handleGroupCheckboxChange = (id) => {
      setSelectedGroupReviewees((prev) =>
        prev.includes(id)
          ? prev.filter((revieweeId) => revieweeId !== id)
          : [...prev, id]
      );
    };
    const handleGroupSubmit = async () => {
      const groupData = {
        group_name: newGroupName,
        description: newGroupDescription,
        members: selectedGroupReviewees,
      };
  
      try {
        const response = await axiosInstance.post(
          `/groups/create`,
          groupData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        alert('Group created successfully!');
        console.log(response.data);
        toggleGroupModal();
      } catch (error) {
        console.error('Failed to create group', error);
        alert('Error creating group. Please try again.');
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
  <h1 className="text-3xl font-bold text-gray-900">Reviewer Dashboard</h1>
  <div className="flex items-center space-x-4">
    <button 
      onClick={toggleProfile}
      className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
    >
      Profile
    </button>
    <button 
       // Assuming you will handle the notifications toggle here
      className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
    >
      Notifications
    </button>
    <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded">
      {assignments.length} Assignments
    </span>
    <span className="bg-green-100 text-green-800 py-1 px-2 rounded">
      {submissions.length} Submissions
    </span>
    <span
        onClick={toggleGroupModal}
        className="bg-blue-100 text-blue-800 py-1 px-2 rounded cursor-pointer"
      >
        Create Group
      </span>

      {/* Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/2">
            <h2 className="text-2xl font-bold mb-4">Create New Group</h2>

            {/* Group Name Input */}
            <div className="mb-4">
              <label className="block font-bold mb-1">Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="border rounded w-full p-2"
                placeholder="Enter group name"
              />
            </div>

            {/* Group Description Input */}
            <div className="mb-4">
              <label className="block font-bold mb-1">Description</label>
              <textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="border rounded w-full p-2"
                placeholder="Enter description"
              ></textarea>
            </div>

            {/* Select Reviewees */}
            <div className="mb-4">
              <label className="block font-bold mb-2">Select Reviewees</label>
              {reviewees.map((reviewee) => (
                <div key={reviewee.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    value={reviewee.id}
                    onChange={() => handleGroupCheckboxChange(reviewee.id)}
                    checked={selectedGroupReviewees.includes(reviewee.id)}
                    className="mr-2"
                  />
                  <span>{reviewee.username} (ID: {reviewee.id})</span>
                </div>
              ))}
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                Select All Reviewees
              </label>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={toggleGroupModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleGroupSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Group
              </button>
              
            </div>
          </div>
        </div>
      )}
      <CreateGroupAssignmentButton/>      

  
    
    
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
                        <span><a href={assignment.attachment.url} target="_blank" rel="noopener noreferrer">
  {assignment.attachment.name}
</a>
</span>
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
            <th className="text-left py-4 px-6">Reviewee Comment</th>
            <th className="text-left py-4 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions
            .filter((submission) => submission.assignmentId === assignment.id)
            .map((submission) => (
              <tr
                key={submission.submission_id}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-4 px-6">{submission.assignmentId}</td>
                <td className="py-4 px-6">{submission.assignmentTitle}</td>
                <td className="py-4 px-6">{submission.username}</td>
                <td className="py-4 px-6">
                  <span
                    className={
                      submission.status === "reviewed"
                        ? "bg-green-100 text-green-800 py-1 px-2 rounded"
                        : "bg-yellow-100 text-yellow-800 py-1 px-2 rounded"
                    }
                  >
                    {submission.status.charAt(0).toUpperCase() +
                      submission.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6">{submission.submittedAt}</td>
                <td className="py-4 px-6">
                  {submission.attachment ? (
                    <a
                      href={submission.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600"
                    >
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="py-4 px-6">
                  <Linkify componentDecorator={linkDecorator}>
                    {submission.comment || "No comments"}
                  </Linkify>
                </td>
                <td className="py-4 px-6">
                  <button
                    className="bg-blue-500 text-white py-1 px-2 rounded"
                    onClick={() => handleReviewClick(submission.submission_id)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>

    {/* Modal for Adding Comment */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-semibold mb-4">Add Review Comment</h3>
          <textarea
            className="w-full border p-2 mb-4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment"
          />
          <div className="flex justify-between">
            <button
              className="bg-green-500 text-white py-1 px-2 rounded"
              onClick={handleSubmitComment}
            >
              Submit Comment & Mark as Checked
            </button>
            <button
              className="bg-gray-500 text-white py-1 px-2 rounded"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
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
  const formatSubmissionData = (submission) => {
    console.log(submission);  // Log the submission object
  
    return {
      submission_id: submission.submission_id,
      assignmentId: submission.assignment,
      assignmentTitle: submission.assignment_title || 'Unknown Assignment',
      submittedAt: new Date(submission.created_at).toLocaleString(),
      status: submission.status,
      attachment: submission.attachment,
      username: submission.reviewee_username,
      comment: submission.reviewee_comment,
      
    };
  };
  

  
  export default ReviewerDashboard;

     