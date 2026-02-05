import React, { useState } from "react";
import { api } from "../../services/api";
import useAuth from "../../hooks/useAuth";
/**
 * DashboardCategories Component
 *
 * Displays categories management interface with grid layout and actions.
 * Handles category CRUD operations and displays article counts.
 */
interface DashboardCategoriesProps {
  categories: any[];
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
}

const DashboardCategories: React.FC<DashboardCategoriesProps> = ({
  categories,
  setCategories,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    color: "#001733",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const { hasRole } = useAuth();
  //  Editor, Admin access only

  if (!hasRole(["Admin", "Editor"])) {
    return (
      <div className="bg-white border border-gray-100 shadow-sm rounded-sm p-6 text-center">
        <h3 className="text-lg font-bold text-[#001733]">Access Denied</h3>
        <p className="text-sm text-gray-500 mt-2">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  const handleOpenModal = (category?: any) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        slug: category.slug,
        color: category.color || "#001733",
        description: category.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        slug: "",
        color: "#001733",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await api.categories.update(editingId, formData);
        setCategories(
          categories.map((c) => (c.id === editingId ? res.data : c)),
        );
      } else {
        const res = await api.categories.create(formData);
        setCategories([...categories, res.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save category", error);
      alert("Failed to save category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await api.categories.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingId && !formData.slug) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, name, slug }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-sm border border-gray-200 shadow-sm">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total Categories
            </span>
            <span className="text-xl font-black text-[#001733]">
              {categories.length}
            </span>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#e5002b] text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#001733] transition-colors shadow-lg"
        >
          + New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: cat.color }}
            ></div>
            <div className="flex justify-between items-start mb-4 pl-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name.charAt(0)}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(cat)}
                  className="text-gray-400 hover:text-[#001733] p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="pl-2">
              <h3 className="text-xl font-bold text-[#001733] mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400 font-mono mb-4">
                /{cat.slug}
              </p>

              <div className="flex justify-between items-center text-xs font-bold text-gray-500 border-t border-gray-50 pt-4">
                <span>{cat.articleCount || 0} Articles</span>
                <span className="text-[#001733]">{cat.views || 0} Views</span>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleOpenModal()}
          className="border-2 border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center p-6 text-gray-400 hover:border-[#001733] hover:text-[#001733] transition-colors min-h-[200px] bg-gray-50/50"
        >
          <svg
            className="w-8 h-8 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest">
            Add Category
          </span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#001733]">
                {editingId ? "Edit Category" : "New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm"
                  placeholder="e.g. Politics"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm bg-gray-50"
                  placeholder="e.g. politics"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                  Color Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-12 h-10 border border-gray-200 rounded-sm cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1 border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm uppercase"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm"
                  rows={3}
                  placeholder="Brief description for SEO..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#001733] text-white px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#e5002b] transition-colors disabled:opacity-50 rounded-sm"
                >
                  {loading ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCategories;
