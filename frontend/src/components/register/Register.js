  import React, { useState } from 'react';
  import Swal from 'sweetalert2';

  const Register = () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      branch: '',
      enrollment_no: '',
      roles: [] // Change from rolenames to roles
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };

    const handleRoleChange = (e) => {
      const { options } = e.target;
      const selectedRoles = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setFormData({ ...formData, roles: selectedRoles }); // Change rolenames to roles
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:8000/api/users/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData), // This should now have roles instead of rolenames
        });
        
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Registration Successful',
            text: 'User registered successfully!',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'There was an error registering the user.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: 'Failed to connect to the server.',
        });
        console.error("Error:", error);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500">
        <div className="max-w-lg w-full p-8 bg-gradient-to-br from-gray-50 to-teal-100 shadow-xl rounded-2xl mt-12">
          <h2 className="text-3xl font-extrabold mb-6 text-teal-900">Create Your Account</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div>
              <label className="block text-sm font-semibold text-teal-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-teal-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-teal-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-teal-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-700">Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-teal-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-700">Enrollment Number</label>
              <input
                type="text"
                name="enrollment_no"
                value={formData.enrollment_no}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-teal-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-700">Roles</label>
              <select
                name="roles" // Change from rolenames to roles
                multiple
                value={formData.roles} // Ensure this uses roles
                onChange={handleRoleChange}
                className="mt-1 block w-full p-3 border border-teal-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              >
                <option value="reviewer">Reviewer</option>
                <option value="reviewee">Reviewee</option>
                {/* <option value="admin">Admin</option> */}
              </select>
            </div>
            <button
              type="submit"
              className="block w-full bg-teal-600 text-white py-3 rounded-md font-semibold text-lg hover:bg-teal-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Register
            </button>
          </form>

          {/* Login link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-teal-700">
              Already have an account? 
              <a className="text-teal-600 font-semibold hover:underline" href="/login">Login here</a> 
            </p> 
          </div>
        </div>
      </div>
    );
  };

  export default Register;
