import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarFront, PlusCircle } from "lucide-react";
import api from "../lib/api";
import axios from "axios";

export default function CreatePost() {
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

  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    location: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toNumber = (v: string) => (v.trim() === "" ? undefined : Number(v));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const postData = {
      title: form.title.trim(),
      description: form.description.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: toNumber(form.year) ?? 0,
      mileage: toNumber(form.mileage) ?? 0,
      price: Number(parseFloat(form.price).toFixed(2)) || 0,
      location: form.location.trim(),
      imageUrls: form.imageUrl ? [form.imageUrl.trim()] : [],
    };

    try {
      const res = await api.post("/posts", postData);
      navigate(`/posts/${res.data.id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : err.response?.data || "Post creation failed";
        setError(
          typeof message === "string" ? message : JSON.stringify(message)
        );
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 rounded-3xl border border-white/50 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
            <CarFront className="h-4 w-4" /> Create Post
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
            Add a new listing
          </h1>
          <p className="mt-1 text-slate-600">
            Good photos and details help buyers swipe right.
          </p>
        </div>

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
                value={form.title}
                onChange={handleChange}
                placeholder="2012 Honda Civic EX"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Atlanta, GA"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">Make</label>
              <input
                name="make"
                value={form.make}
                onChange={handleChange}
                placeholder="Honda"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-600">Model</label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Civic"
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
                value={form.year}
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
                value={form.mileage}
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
                value={form.price}
                onChange={handleChange}
                placeholder="7500"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                required
                min={0}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm text-slate-600">
                Image URL (optional)
              </label>
              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/car.jpg"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                We’ll move to real uploads soon—paste a link for now.
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm text-slate-600">Description</label>
              <textarea
                name="description"
                value={form.description}
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
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50 transition"
              disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 hover:opacity-90 transition disabled:opacity-50"
              disabled={submitting}>
              <PlusCircle className="h-5 w-5" />
              {submitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
