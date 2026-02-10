import React, { useState, useRef, useEffect } from "react";
import { api } from "../../services/api";
import { Pagination } from "../Pagination";

/**
 * DashboardArticles Component
 *
 * Displays articles management interface with search, table view, and actions.
 * Handles article CRUD operations and pagination.
 */
interface DashboardArticlesProps {
  articles: any[];
  setArticles: React.Dispatch<React.SetStateAction<any[]>>;
  categories: any[];
  onView: (article: any) => void;
}

const DashboardArticles: React.FC<DashboardArticlesProps> = ({
  articles,
  setArticles,
  categories,
  onView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [defaultArticleStatus, setDefaultArticleStatus] = useState("Draft");
  const [requireFeaturedImage, setRequireFeaturedImage] = useState(false);



  useEffect(() => 
    {
      const fetchArticleSettings = async () => { 
        const res = await api.settings.getArticleSettings();
        setDefaultArticleStatus(res.data.default_status || "Draft");
        setRequireFeaturedImage(res.data.require_featured_image || false);
      }

      fetchArticleSettings();

     } , [defaultArticleStatus, requireFeaturedImage]);


  const savedUser = JSON.parse(
    localStorage.getItem("user") ||
      '{"id":"1","name":"Admin","email":"admin@gmail.com","role":"Admin", "image":"https://i.pravatar.cc/150?u=admin"}',
  );


  const initialFormState = {
    title: "",
    slug: "",
    excerpt: "",
    category: "Latest News",
    categories: ["Latest News"],
    tags: "",
    author: savedUser.name || "Admin",
    image: "",
    readTime: "5 min read",
    isPrime: false,
    isHeadline: false,
    content: "",
    status: defaultArticleStatus || "Draft",
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleOpenModal = (article?: any) => {

    if (article) {
      setEditingId(article.id);
      setFormData({
        title: article.title,
        slug: article.slug || "",
        excerpt: article.excerpt || "",
        category: article.category || "Latest News",
        categories:
          article.categories ||
          (article.category ? [article.category] : ["Latest News"]),
        tags: article.tags
          ? Array.isArray(article.tags)
            ? article.tags.join(", ")
            : article.tags
          : "",
        author: article.author || "Admin",
        image: article.image || "",
        readTime: article.readTime || article.read_time || "5 min read",
        isPrime: !!(article.isPrime || article.is_prime),
        isHeadline: !!(article.isHeadline || article.is_headline),
        content: article.content || "",
        status: article.status || "Draft",
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        slug: generateSlug(formData.slug || formData.title),
        tags:
          typeof formData.tags === "string"
            ? formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : formData.tags,
        is_prime: Boolean(formData.isPrime),
        is_headline: Boolean(formData.isHeadline),
        read_time: formData.readTime,
        categories: formData.categories,
        category:
          formData.categories.length > 0
            ? formData.categories[0]
            : formData.category || "Latest News",
        image: formData.image,
      };

      if (editingId) {
        const res = await api.articles.update(editingId, payload);
        setArticles(
          articles.map((a) =>
            a.id === editingId ? res.data || { ...a, ...payload } : a,
          ),
        );
      } else {
        const res = await api.articles.create(payload);
        setArticles([res.data, ...articles]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save article", error);
      const message =
        error.response?.data?.message ||
        "Failed to save article. Please try again.";
      const errors = error.response?.data?.errors;
      if (errors) {
        const errorDetails = Object.values(errors).flat().join("\n");
        alert(`${message}\n\n${errorDetails}`);
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !editingId ? generateSlug(title) : prev.slug,
    }));
  };

  const insertMarkdown = (format: string) => {
    if (!contentRef.current) return;
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = text;

    switch (format) {
      case "bold":
        newText = `${before}**${selection || "bold text"}**${after}`;
        break;
      case "italic":
        newText = `${before}_${selection || "italic text"}_${after}`;
        break;
      case "h2":
        newText = `${before}\n## ${selection || "Heading 2"}\n${after}`;
        break;
      case "h3":
        newText = `${before}\n### ${selection || "Heading 3"}\n${after}`;
        break;
      case "link":
        newText = `${before}${selection || "Link text"}${after}`;
        break;
      case "image":
        newText = `${before}!${selection || "Alt text"}${after}`;
        break;
      case "quote":
        newText = `${before}\n> ${selection || "Quote"}\n${after}`;
        break;
      case "read-also":
        newText = `${before}\n**Read Also:** ${selection || "Article Title"}\n${after}`;
        break;
      case "ul":
        newText = `${before}\n- ${selection || "List item"}\n${after}`;
        break;
      case "ol":
        newText = `${before}\n1. ${selection || "List item"}\n${after}`;
        break;
    }

    setFormData({ ...formData, content: newText });
    setTimeout(() => textarea.focus(), 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;
    try {
      await api.articles.delete(id);
      setArticles(articles.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Failed to delete article", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-sm focus:outline-none focus:border-[#001733] text-sm transition-colors"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#e5002b] text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-[#001733] transition-all shadow-lg w-full sm:w-auto"
        >
          + New Article
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Article Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedArticles.length > 0 ? (
                paginatedArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-100">
                          {article.blur_image ? (
                            <img
                              src={ article.blur_image}
                              className="w-full h-full object-cover"
                              alt={article.title}
                            />
                          ) :   article.image ? ( <img
                              src={ article.image}
                              className="w-full h-full object-cover"
                              alt={article.title}
                            />) :  (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#001733] line-clamp-1 text-sm group-hover:text-[#e5002b] transition-colors">
                            {article.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                            <span>By {article.author}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{article.date || "Just now"}</span>
                            {article.status && (
                              <span
                                className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider ${
                                  article.status === "Published"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {article.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#001733]">
                          <svg
                            className="w-3.5 h-3.5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {(article.views || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                          <svg
                            className="w-3.5 h-3.5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                            />
                          </svg>
                          {(article.clicks || 0).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onView(article)}
                          className="p-2 text-gray-400 hover:text-[#001733] hover:bg-gray-100 rounded-sm transition-all"
                          title="Preview"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenModal(article)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all"
                          title="Edit"
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
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                          title="Delete"
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-400 text-sm"
                  >
                    No articles found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={filteredArticles.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#001733]">
                {editingId ? "Edit Article" : "New Article"}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm font-bold text-[#001733]"
                      placeholder="Article Title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Slug (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        onBlur={() =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: generateSlug(prev.slug || prev.title),
                          }))
                        }
                        className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm bg-gray-50 font-mono text-gray-600"
                        placeholder="article-title-slug"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: generateSlug(prev.title),
                          }))
                        }
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-sm transition-colors"
                        title="Regenerate from Title"
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm"
                      rows={3}
                      placeholder="Short summary..."
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500">
                        Content
                      </label>
                      <div className="flex gap-1 bg-gray-100 p-1 rounded-sm">
                        <button
                          type="button"
                          onClick={() => insertMarkdown("bold")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600"
                          title="Bold"
                        >
                          <strong className="font-serif font-bold">B</strong>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("italic")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600"
                          title="Italic"
                        >
                          <em className="font-serif italic">I</em>
                        </button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("h2")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600 text-xs font-bold"
                          title="Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("h3")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600 text-xs font-bold"
                          title="Heading 3"
                        >
                          H3
                        </button>
                        <div className="w-px bg-gray-300 mx-1"></div>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("link")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600"
                          title="Link"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("ul")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600"
                          title="Bullet List"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 12h16M4 18h16"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("ol")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600"
                          title="Numbered List"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h12M7 12h12M7 17h12M3 7h.01M3 12h.01M3 17h.01"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("image")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600"
                          title="Image"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("quote")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600"
                          title="Quote"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("read-also")}
                          className="p-1.5 hover:bg-white rounded-sm text-gray-600 text-[10px] font-bold uppercase"
                          title="Read Also"
                        >
                          Read Also
                        </button>
                      </div>
                    </div>
                    <textarea
                      ref={contentRef}
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm font-mono"
                      rows={16}
                      placeholder="Write your article content here..."
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm bg-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Categories
                    </label>
                    <div className="w-full border border-gray-200 p-3 text-sm rounded-sm bg-white max-h-40 overflow-y-auto">
                      <label className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(
                            "Headline News",
                          )}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...formData.categories, "Headline News"]
                              : formData.categories.filter(
                                  (c) => c !== "Headline News",
                                );
                            setFormData({
                              ...formData,
                              categories: newCategories,
                              isHeadline: e.target.checked,
                            });
                          }}
                          className="rounded-sm text-[#001733] focus:ring-0"
                        />
                        <span className="font-medium">Headline News</span>
                      </label>
                      {categories.map((cat: any) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(cat.name)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...formData.categories, cat.name]
                                : formData.categories.filter(
                                    (c) => c !== cat.name,
                                  );
                              setFormData({
                                ...formData,
                                categories: newCategories,
                              });
                            }}
                            className="rounded-sm text-[#001733] focus:ring-0"
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Selected: {formData.categories.join(", ") || "None"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm"
                      placeholder="politics, kenya, economy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Featured Image
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        required={requireFeaturedImage}
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full border border-gray-200 p-2 text-sm focus:border-[#001733] outline-none rounded-sm bg-white"
                      />
                      <div className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                        - OR -
                      </div>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm"
                        placeholder="Enter image URL..."
                      />
                    </div>
                    {formData.image && (
                      <div className="mt-2 aspect-video bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Read Time
                    </label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) =>
                        setFormData({ ...formData, readTime: e.target.value })
                      }
                      className="w-full border border-gray-200 p-3 text-sm focus:border-[#001733] outline-none rounded-sm"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPrime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPrime: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-[#001733] rounded-sm focus:ring-0"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Prime Content
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isHeadline}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          let newCategories = [...formData.categories];
                          if (
                            isChecked &&
                            !newCategories.includes("Headline News")
                          ) {
                            newCategories.push("Headline News");
                          } else if (
                            !isChecked &&
                            newCategories.includes("Headline News")
                          ) {
                            newCategories = newCategories.filter(
                              (c) => c !== "Headline News",
                            );
                          }
                          setFormData({
                            ...formData,
                            isHeadline: isChecked,
                            categories: newCategories,
                          });
                        }}
                        className="w-4 h-4 text-[#001733] rounded-sm focus:ring-0"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Headline News
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#001733] text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#e5002b] transition-colors disabled:opacity-50 rounded-sm shadow-lg"
                >
                  {loading ? "Saving..." : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardArticles;
