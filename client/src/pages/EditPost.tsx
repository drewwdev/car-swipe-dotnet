import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CarFront, Save, X } from "lucide-react";
import PostImage from "../components/PostImage";
import api from "../lib/api";

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

  const [formData, setFormData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setFormData(res.data);
      } catch (err) {
        setError("Failed to load post.");
        toast.error("Failed to load post.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

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
      imageUrls: e.target.value
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;
    setSaving(true);
    setError("");

    try {
      await api.put(`/posts/${id}`, {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        mileage: formData.mileage,
        imageUrls: formData.imageUrls,
        location: formData.location,
        year: formData.year,
      });

      toast.success("Post updated!");
      navigate("/my-posts");
    } catch (err) {
      setError("Failed to update post.");
      toast.error("Failed to update post.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const firstImage = useMemo(
    () => formData?.imageUrls?.[0],
    [formData?.imageUrls]
  );

  if (loading) return <p className="p-6">Loading post...</p>;
  if (!formData) return <p className="p-6 text-red-500">Post not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
            <CarFront className="h-4 w-4" /> Edit Post
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
            {formData.title || "Edit Listing"}
          </h1>
          <p className="mt-1 text-slate-600">
            Update details and keep your listing fresh.
          </p>
        </div>

        {firstImage && (
          <div className="mb-5 overflow-hidden rounded-3xl border border-white/50 bg-white/70 backdrop-blur shadow-sm">
            <PostImage
              src={firstImage}
              className="h-[260px] w-full object-cover"
            />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="2012 Honda Civic EX"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Atlanta, GA"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">Year</label>
              <input
                name="year"
                type="number"
                inputMode="numeric"
                value={formData.year}
                onChange={handleChange}
                placeholder="2012"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
                min={1900}
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">Mileage</label>
              <input
                name="mileage"
                type="number"
                inputMode="numeric"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="80000"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
                min={0}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">Price (USD)</label>
              <input
                name="price"
                type="number"
                inputMode="decimal"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="7500"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
                min={0}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm text-slate-600">
                Image URLs (comma separated)
              </label>
              <input
                name="imageUrls"
                value={formData.imageUrls.join(", ")}
                onChange={handleImageUrlsChange}
                placeholder="https://example.com/car1.jpg, https://example.com/car2.jpg"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm text-slate-600">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Condition, maintenance, extras…"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate("/my-posts")}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 transition disabled:opacity-50">
              <X className="h-5 w-5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition disabled:opacity-50">
              <Save className="h-5 w-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
