import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Swipe from "./pages/Swipe";
import Dashboard from "./pages/Dashboard";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import MyPosts from "./pages/MyPosts";
import LikedPosts from "./pages/LikedPosts";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />{" "}
        <Route
          path="/swipe"
          element={
            <PrivateRoute>
              <Layout>
                <Swipe />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <PrivateRoute>
              <Layout>
                <CreatePost />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/posts/:id"
          element={
            <PrivateRoute>
              <Layout>
                <PostDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-posts"
          element={
            <PrivateRoute>
              <Layout>
                <MyPosts />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/liked-posts"
          element={
            <PrivateRoute>
              <Layout>
                <LikedPosts />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
