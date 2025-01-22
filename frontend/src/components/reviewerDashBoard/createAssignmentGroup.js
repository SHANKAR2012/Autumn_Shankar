import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axios';

const CreateGroupAssignmentButton = ({ token }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [groups, setGroups] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch groups and reviewers when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch groups
        const groupsResponse = await axiosInstance.get('/groups/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(groupsResponse.data);

        // Fetch reviewers
        const usersResponse = await axiosInstance.get('/users/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reviewersList = usersResponse.data
          .filter((user) => user.roles && user.roles.includes('reviewer'))
          .map((reviewer) => ({
            id: reviewer.id,
            username: reviewer.username,
          }));
        setReviewers(reviewersList);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to fetch data. Please try again.');
      }
    };

    fetchData();
  }, [token]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleReviewerChange = (event) => {
    const reviewerId = parseInt(event.target.value, 10);
    setSelectedReviewers((prevSelected) =>
      event.target.checked
        ? [...prevSelected, reviewerId]
        : prevSelected.filter((id) => id !== reviewerId)
    );
  };

  const handleCreateAssignment = async () => {
    setErrorMessage(''); // Clear previous error message

    if (!selectedGroupId || !title || !description || !deadline || selectedReviewers.length === 0) {
        alert('Please fill in all required fields, including selecting reviewers.');
        return;
    }

    // Convert reviewers array to a comma-separated string
    const reviewersString = selectedReviewers.join(',');

    const formData = new FormData();
formData.append('groups', JSON.stringify([selectedGroupId].map(Number)));
formData.append('title', title);
formData.append('description', description);
formData.append('deadline', deadline);

// Make sure reviewers are passed as an array of numbers
formData.append('reviewers', JSON.stringify((reviewers.map((reviewer) => reviewer.id)).map(Number))); // Pass reviewers as a simple list of numbers

if (attachment) formData.append('attachment', attachment);

try {
    const response = await axiosInstance.post('/groups/assignments/create/', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    alert('Assignment created successfully!');
    console.log(response.data);
    toggleModal();
} catch (error) {
    if (error.response && error.response.data) {
        setErrorMessage(
            error.response.data.error ||
            'Failed to create the assignment. Please check the required fields and try again.'
        );
    } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
    }
    console.error('Error creating assignment:', error);
}

};


  return (
    <div>
      {/* Button to trigger modal */}
      <button
        onClick={toggleModal}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring"
      >
        Create Group Assignment
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Group Assignment</h2>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                {errorMessage}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Group:</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring"
              >
                <option value="">-- Select a Group --</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.group_name} {/* Adjust to the actual field name */}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring"
                placeholder="Enter title"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring"
                placeholder="Enter description"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Deadline:</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-bold">Select Reviewers:</label>
              {reviewers.map((reviewer) => (
                <div key={reviewer.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    value={reviewer.id}
                    onChange={handleReviewerChange}
                    className="mr-2"
                    checked={selectedReviewers.includes(reviewer.id)}
                  />
                  <span>{reviewer.username} (ID: {reviewer.id})</span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Attachment (Optional):</label>
              <input
                type="file"
                onChange={(e) => setAttachment(e.target.files[0])}
                className="w-full p-2 border rounded focus:outline-none focus:ring"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={toggleModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400 focus:outline-none focus:ring"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroupAssignmentButton;
