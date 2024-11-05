
import React from "react";
// import {useEffect,useState} from React
import {BrowserRouter as Router , Route , Routes} from 'react-router-dom'
// import Register from "../components/register/Register";
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import revieweeBoard from "./components/revieweeDashBoard/revieweeBoard";
import ProtectedRoute from "./components/privateRoute";
// import ReviewerDashboard from "../components/reviewerDashBoard/reviewerboard";
import ReviewerDashboard from "./components/reviewerDashBoard/reviewerboard";


function App() {
  
  return (
    
      <Router>
        <Routes>
          <Route path='/'  element={<Register />}></Route>
          {/* <Route path='/register'  element={<Register />}></Route> */}
          <Route path='/login' element={ <Login/>}>  </Route>  
          


  {/* Only reviewees can access this route */}
  <Route
    path="/reviewee-dashboard"
    element={<ProtectedRoute component={revieweeBoard}  />}
  />

  {/* Only reviewers can access this route */}
  <Route
    path="/reviewer-dashboard"
    element={<ProtectedRoute component={ReviewerDashboard}  />}
  />
</Routes>

        {/* <Route path="/admin-dashboard" element={<ProtectedRoute component={AdminDashboard} />} /> */}
        
      </Router>
   
    
  
  );
}

export default App;
