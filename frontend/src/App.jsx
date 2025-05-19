import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import BlogView from "./components/BlogView";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import NewBlog from "./components/NewBlog";
import EditBlog from "./components/EditBlog";
import BlogList from "./components/BlogList";
import { useAuth } from "./Context/AuthContext";

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar userName={user?.name} />
        <main className="flex-grow">
          {!loading && (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blogs" element={<BlogList />} />
              <Route path="/blog/:id" element={<BlogView />} />
              <Route 
                path="/login" 
                element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/signup" 
                element={!isAuthenticated() ? <Signup /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/dashboard" 
                element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/new-blog" 
                element={isAuthenticated() ? <NewBlog /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/edit-blog/:id" 
                element={isAuthenticated() ? <EditBlog /> : <Navigate to="/login" />} 
              />
            </Routes>
          )}
        </main>
        <Footer />
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </>
  );
}

export default App;