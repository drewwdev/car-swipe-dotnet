import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import toast from "react-hot-toast";

interface Post {
  id: number;
  title: string;
  description: string;
  price: number;
  mileage: number;
  imageUrls: string[];
  location: string;
  year: number;
}

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5277/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        toast.error("Failed to load post.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "mileage" || name === "year"
          ? Number(value)
          : value,
    });
  };

  const handleImageUrlsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({
      ...formData,
      imageUrls: e.target.value.split(",").map((url) => url.trim()),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      await axios.put(
        `http://localhost:5277/api/posts/${id}`,
        {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          mileage: formData.mileage,
          imageUrls: formData.imageUrls,
          location: formData.location,
          year: formData.year,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Post updated!");
      navigate("/my-posts");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error("Failed to update post.");
      }
    }
  };

  if (loading) return <p className="p-6">Loading post...</p>;
  if (!formData) return <p className="p-6 text-red-500">Post not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border rounded p-2"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border rounded p-2"
        />
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border rounded p-2"
        />
        <input
          name="mileage"
          type="number"
          value={formData.mileage}
          onChange={handleChange}
          placeholder="Mileage"
          className="w-full border rounded p-2"
        />
        <input
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          placeholder="Year"
          className="w-full border rounded p-2"
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full border rounded p-2"
        />
        <input
          name="imageUrls"
          value={formData.imageUrls.join(", ")}
          onChange={handleImageUrlsChange}
          placeholder="Image URLs (comma-separated)"
          className="w-full border rounded p-2"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}
