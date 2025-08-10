import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Car,
  Compass,
  PlusCircle,
  Heart,
  MessageSquare,
  Menu,
} from "lucide-react";
import { useAuth } from "../context/useAuth.ts";
import api from "../lib/api";

type IconType = React.ElementType;

export default function Navbar() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [hasLikedPosts, setHasLikedPosts] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchLiked = async () => {
      try {
        const res = await api.get("/api/posts/liked");
        if (!cancelled) setHasLikedPosts((res.data?.length ?? 0) > 0);
      } catch {
        if (!cancelled) setHasLikedPosts(false);
      }
    };
    if (token) fetchLiked();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const linkBase =
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition";
  const linkInactive = "text-white/90 hover:bg-white/10";
  const linkActive = "bg-white/15 text-white shadow-sm";

  const NavItem = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string;
    icon: IconType;
    label: string;
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [linkBase, isActive ? linkActive : linkInactive].join(" ")
      }
      onClick={() => setOpen(false)}>
      <Icon className="h-4 w-4" />
      {label}
      {label === "Liked by Others" && hasLikedPosts && (
        <span className="ml-1 rounded-full bg-red-500 text-[10px] px-1.5 py-[1px]">
          NEW
        </span>
      )}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 font-bold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                <Car className="h-5 w-5" />
              </span>
              <span className="text-lg">CarSwipe</span>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <NavItem to="/swipe" icon={Compass} label="Browse" />
              <NavItem
                to="/create-post"
                icon={PlusCircle}
                label="Create Post"
              />
              <NavItem to="/liked-posts" icon={Heart} label="Liked by Others" />
              <NavItem to="/chats" icon={MessageSquare} label="Chats" />
            </div>

            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-white/10"
              aria-label="Toggle menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/10 bg-white/10 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-2">
              <NavItem to="/dashboard" icon={Car} label="Dashboard" />
              <NavItem to="/swipe" icon={Compass} label="Browse" />
              <NavItem
                to="/create-post"
                icon={PlusCircle}
                label="Create Post"
              />
              <NavItem to="/liked-posts" icon={Heart} label="Liked by Others" />
              <NavItem to="/chats" icon={MessageSquare} label="Chats" />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
