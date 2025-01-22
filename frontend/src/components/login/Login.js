// import React, { useState } from 'react';
// import axiosInstance from '../api/axios'; // Make sure this is correctly configured

// const Login = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [selectedRole, setSelectedRole] = useState('');
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axiosInstance.post('login/', {
//         username,
//         password,
//         role: selectedRole,
//       });

//       if (response.status === 200) {
//         const { access, refresh } = response.data; // Access the tokens
//         localStorage.setItem('access_token', access); // Store the access token
//         localStorage.setItem('refresh_token', refresh); // Store the refresh token if needed

//         setMessage('Login successful!');
//         localStorage.setItem('userrole', selectedRole); // Store the user role

//         // Redirect based on role
//         switch (selectedRole) {
//           case 'reviewee':
//             window.location.href = '/reviewee-dashboard';
//             break;
//           case 'reviewer':
//             window.location.href = '/reviewer-dashboard';
//             break;
//           case 'admin':
//             window.location.href = '/admin-dashboard';
//             break;
//           default:
//             break;
//         }
//       }
//     } catch (error) {
//       // Handle errors and set error message
//       setError(error.response?.data?.detail || 'An error occurred. Please try again.');
//       setMessage('');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold text-center text-teal-600">Login</h2>
//         {message && <p className="text-green-500">{message}</p>}
//         {error && <p className="text-red-500">{error}</p>}
//         <form onSubmit={handleLogin}>
//           <div className="mb-4">
//             <label className="block text-gray-700">Username</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full p-2 border rounded"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-2 border rounded"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700">Role</label>
//             <select
//               value={selectedRole}
//               onChange={(e) => setSelectedRole(e.target.value)}
//               className="w-full p-2 border rounded"
//               required
//             >
//               <option value="">Select Role</option>
//               <option value="reviewee">Reviewee</option>
//               <option value="reviewer">Reviewer</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>
//           <button
//             type="submit"
//             className="w-full p-2 bg-teal-600 text-white rounded hover:bg-teal-700"
//           >
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import axios from 'axios'; // Import axios directly for this implementation

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        username,
        password,
        role: selectedRole,
      });

      if (response.status === 200) {
        const { access, refresh } = response.data; // Access the tokens
        localStorage.setItem('access_token', access); // Store the access token
        localStorage.setItem('refresh_token', refresh); // Store the refresh token if needed
        localStorage.setItem('userrole', selectedRole); // Store the user role

        setMessage('Login successful!');

        // Redirect based on role
        switch (selectedRole) {
          case 'reviewee':
            window.location.href = '/reviewee-dashboard';
            break;
          case 'reviewer':
            window.location.href = '/reviewer-dashboard';
            break;
          case 'admin':
            window.location.href = '/admin-dashboard';
            break;
          default:
            break;
        }
      }
    } catch (error) {
      // Handle errors and set error message
      setError(error.response?.data?.detail || 'An error occurred. Please try again.');
      setMessage('');
    }
  };
  const handleChanneliLogin = () => {
    window.location.href = 'http://localhost:8000/oauth/login/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-teal-600">Login</h2>
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Role</option>
              <option value="reviewee">Reviewee</option>
              <option value="reviewer">Reviewer</option>
              {/* <option value="admin">Admin</option> */}
            </select>
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Login
          </button>
        </form>
        <hr className="my-4" />
        <button
          onClick={handleChanneliLogin}
          className="w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Login with Channeli
        </button>
      </div>
    </div>
  );
};

export default Login;
