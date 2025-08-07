import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const { token } = useAuth();
  const navigate = useNavigate();

  type FormState = {
    title: string;
    description: string;
    make: string;
    model: string;
    year: string;
    mileage: string;
    price: string;
    location: string;
    imageUrl: string;
  };

  const [form, setForm] = useState<FormState>({
    title: "Test Car",
    description: "A really great car.",
    make: "Honda",
    model: "Civic",
    year: "2012",
    mileage: "80000",
    price: "7500",
    location: "Atlanta, GA",
    imageUrl: "https://example.com/car.jpg",
  });

  const fields: (keyof FormState)[] = [
    "title",
    "make",
    "model",
    "year",
    "mileage",
    "price",
    "location",
    "imageUrl",
  ];

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const postData = {
      ...form,
      year: parseInt(form.year),
      mileage: parseInt(form.mileage),
      price: parseFloat(form.price),
      imageUrls: form.imageUrl ? [form.imageUrl] : [],
    };

    try {
      const res = await axios.post(
        "http://localhost:5277/api/posts",
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newPostId = res.data.id;
      navigate(`/posts/${newPostId}`);
    } catch (err) {
      console.error("❌ Post creation failed:", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : err.response?.data || "Registration failed";
        setError(
          typeof message === "string" ? message : JSON.stringify(message)
        );
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-semibold text-center">
          Create a Car Post
        </h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {fields.map((name) => (
          <input
            key={name}
            type={
              name === "year" || name === "mileage" || name === "price"
                ? "number"
                : "text"
            }
            name={name}
            placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
            value={form[name]}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        ))}

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded p-2"
          rows={4}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700">
          Create Post
        </button>
      </form>
    </div>
  );
}
