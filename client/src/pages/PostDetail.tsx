import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";

interface Post {
  id: number;
  title: string;
  description: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  imageUrls: string[];
  createdAt: string;
}

export default function PostDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5277/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(res.data);
      } catch (err) {
        setError("Failed to fetch post.");
        console.error("❌ Post fetch error:", err);
      }
    };

    fetchPost();
  }, [id, token]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 mt-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-4">{post.description}</p>
      <ul className="mb-4 space-y-1 text-gray-700">
        <li>
          <strong>Make:</strong> {post.make}
        </li>
        <li>
          <strong>Model:</strong> {post.model}
        </li>
        <li>
          <strong>Year:</strong> {post.year}
        </li>
        <li>
          <strong>Mileage:</strong> {post.mileage} miles
        </li>
        <li>
          <strong>Price:</strong> ${post.price}
        </li>
        <li>
          <strong>Location:</strong> {post.location}
        </li>
      </ul>

      {post.imageUrls.length > 0 && (
        <img
          src={post.imageUrls[0]}
          alt="Car"
          className="rounded w-full max-h-80 object-cover"
        />
      )}
    </div>
  );
}
