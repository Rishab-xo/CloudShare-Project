import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/Layout/DashboardLayout';
import { 
  List, 
  Grid, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Trash2, 
  Download, 
  UploadCloud, 
  MoreVertical, 
  Filter,
  File,
  Lock,
  Globe,
  Eye,
  AlertCircle,
  X,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiEndpoints } from '@/utils/apiEndpoints';
import { motion, AnimatePresence } from 'framer-motion';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [shareModalFile, setShareModalFile] = useState(null);
  const [deleteModalFile, setDeleteModalFile] = useState(null);
  const [copyLinkModalFile, setCopyLinkModalFile] = useState(null);
  const [previewModalFile, setPreviewModalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {getToken} = useAuth();

  const openPreviewModal = async (file) => {
    setPreviewModalFile(file);
    setPreviewError(false);
    setIsLoadingPreview(true);

    const fileId = file.id || file._id;
    const fallbackUrl = file.url || file.fileUrl || file.downloadUrl;

    try {
      const token = await getToken();
      const downloadUrl = apiEndpoints.DOWNLOAD_FILE(fileId);
      const response = await axios.get(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const contentType = file.type || file.fileType || file.contentType || response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      setPreviewUrl(blobUrl);
    } catch (err) {
      console.error("Error fetching preview blob:", err);
      if (fallbackUrl) {
        setPreviewUrl(fallbackUrl);
      } else {
        setPreviewError(true);
      }
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const closePreviewModal = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewModalFile(null);
    setPreviewError(false);
  };

  const openShareLinkModal = (file) => {
    setCopyLinkModalFile(file);
    setIsCopied(false);
  };

  const handleCopyModalUrl = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!copyLinkModalFile) return;
    const fileId = copyLinkModalFile.id || copyLinkModalFile._id;
    const shareUrl = `${window.location.origin}/file/${fileId}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      // Fallback copy mechanism
      try {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setIsCopied(true);
        toast.success('Link copied to clipboard!');
      } catch (fallbackErr) {
        toast.error('Failed to copy link automatically');
      }
    }
  };

  const fetchFiles = async ()=>{
    try{
      const token = await getToken();
      const response = await axios.get(apiEndpoints.FETCH_FILES, {headers: {Authorization: `Bearer ${token}`}});
      if(response.status === 200){
        console.log("Files API response:", response.data);
        const dataList = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.files || response.data?.data || response.data?.fileList || []);
        setFiles(dataList);
      }
    }
    catch(error){
      console.log("Error fetching files from server: ", error);
      toast.error(`Error fetching the files from server: ${error.message}`);
    }
  }

  useEffect(()=>{
    fetchFiles();
  }, [getToken]);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? dateValue : date.toLocaleDateString();
  };

  const handleDownload = async (file) => {
    const fileId = file.id || file._id;
    const fileName = file.name || file.fileName || 'download';
    
    try {
      const token = await getToken();
      // Fetch download URL or file blob from API endpoint
      const downloadUrl = apiEndpoints.DOWNLOAD_FILE(fileId);
      const response = await axios.get(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      // Trigger browser download
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`Downloaded ${fileName}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      // Fallback: If backend returns a direct URL inside file object
      const fallbackUrl = file.url || file.fileUrl || file.downloadUrl;
      if (fallbackUrl) {
        const link = document.createElement('a');
        link.href = fallbackUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Starting download for ${fileName}`);
      } else {
        toast.error(`Error downloading file: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Toggles the public/private status of profile.
  const togglePublic = async (fileToUpdate) => {
    const fileId = fileToUpdate.id || fileToUpdate._id;

    try {
      const token = await getToken();
      const response = await axios.patch(
        apiEndpoints.TOGGLE_FILE(fileId),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setFiles(prev => prev.map(file => {
          if (file.id === fileId || file._id === fileId) {
            const updatedState = !Boolean(file.isPublic || file.public);
            return { ...file, public: updatedState, isPublic: updatedState };
          }
          return file;
        }));
        toast.success('File status updated!');
      }
    } catch (error) {
      console.error('Error toggling file status:', error);
      toast.error(`Error toggling file status: ${error.response?.data?.message || error.message}`);
    }
  };

  const promptToggleSharing = (file) => {
    setShareModalFile(file);
  };

  const confirmToggleSharing = async () => {
    if (!shareModalFile) return;
    
    setIsUpdating(true);
    await togglePublic(shareModalFile);
    setIsUpdating(false);
    setShareModalFile(null);
  };

  const promptDeleteFile = (file) => {
    setDeleteModalFile(file);
  };

  const confirmDeleteFile = async () => {
    if (!deleteModalFile) return;
    const fileId = deleteModalFile.id || deleteModalFile._id;

    setIsDeleting(true);
    try {
      const token = await getToken();
      const response = await axios.delete(apiEndpoints.DELETE_FILE(fileId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 204) {
        setFiles(prevFiles => prevFiles.filter(file => (file.id || file._id) !== fileId));
        toast.success('File deleted successfully!');
        window.dispatchEvent(new Event('creditsUpdated'));
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(`Error deleting file: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteModalFile(null);
    }
  };

  const formatFileName = (rawName, maxLength = 35) => {
    if (!rawName) return '';
    if (rawName.length <= maxLength) return rawName;

    const parts = rawName.split('.');
    if (parts.length > 1) {
      const ext = parts.pop();
      const base = parts.join('.');
      const availableBaseLength = Math.max(10, maxLength - ext.length - 4);
      return `${base.substring(0, availableBaseLength)}...${ext}`;
    }

    return `${rawName.substring(0, maxLength - 3)}...`;
  };

  const getCategory = (fileObj) => {
    const typeStr = (fileObj?.type || fileObj?.fileType || fileObj?.contentType || '').toLowerCase();
    const nameStr = fileObj?.name || fileObj?.fileName || '';
    const ext = nameStr.split('.').pop()?.toLowerCase() || '';

    if (typeStr.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
      return 'image';
    }
    if (typeStr.includes('video') || ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'].includes(ext)) {
      return 'video';
    }
    return 'document';
  };

  const filteredFiles = files.filter(file => {
    const fileName = file.name || file.fileName || '';
    const matchesSearch = fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const fileCategory = getCategory(file);
    const matchesCategory = selectedCategory === 'all' || fileCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileObj, className = "w-5 h-5") => {
    // Handle both object parameter or string type
    const typeStr = typeof fileObj === 'string' ? fileObj : (fileObj?.type || fileObj?.fileType || fileObj?.contentType || '');
    const nameStr = typeof fileObj === 'object' ? (fileObj?.name || fileObj?.fileName || '') : '';
    const ext = nameStr.split('.').pop()?.toLowerCase() || '';

    const isImage = 
      typeStr.toLowerCase().includes('image') || 
      ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'].includes(ext);

    const isVideo = 
      typeStr.toLowerCase().includes('video') || 
      ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'].includes(ext);

    if (isImage) {
      return <ImageIcon className={`${className} text-purple-600 stroke-[2]`} />;
    }
    if (isVideo) {
      return <Film className={`${className} text-purple-600 stroke-[2]`} />;
    }
    return <FileText className={`${className} text-purple-600 stroke-[2]`} />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-2">
        {/* Header & Controls */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">
              My Files <span className="text-slate-400 font-normal text-xl">{files.length}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/upload"
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload New File</span>
              </Link>
            </motion.div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-violet-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-violet-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'document', label: 'Documents' },
              { id: 'image', label: 'Images' },
              { id: 'video', label: 'Videos' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-violet-50 text-violet-600 border border-violet-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Files Content View */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 shadow-sm flex flex-col items-center justify-center text-center my-6 min-h-[380px]">
            {/* File Outline Icon */}
            <div className="mb-4">
              <svg 
                className="w-16 h-16 text-purple-400 stroke-[1.5]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              No files uploaded yet
            </h2>
            
            <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
              Start uploading files to see them listed here. You can upload documents, images, and other files to share and manage them securely.
            </p>

            <Link
              to="/upload"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              Go to Upload
            </Link>
          </div>
        ) : viewMode === 'list' ? (
          /* List View (Table Format) */
          <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    <th className="py-4 px-5 w-2/5">NAME</th>
                    <th className="py-4 px-5 w-24">SIZE</th>
                    <th className="py-4 px-5 w-32">UPLOADED</th>
                    <th className="py-4 px-5 w-48">SHARING</th>
                    <th className="py-4 px-5 text-right w-28">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-sm text-slate-700">
                  {filteredFiles.map((file, idx) => {
                    const fileId = file.id || file._id;
                    const isPublic = Boolean(file.isPublic || file.public);
                    return (
                      <motion.tr 
                        key={fileId} 
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        className="hover:bg-violet-50/60 hover:shadow-2xs transition-all duration-200 group"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100/50 shrink-0 group-hover:bg-white group-hover:shadow-sm group-hover:scale-105 transition-all duration-200">
                              {getFileIcon(file)}
                            </div>
                            <span className="font-semibold text-slate-800 text-xs truncate group-hover:text-violet-700 transition-colors" title={file.name || file.fileName}>
                              {formatFileName(file.name || file.fileName, 35)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap text-xs font-medium">
                          {((file.size || file.fileSize || 0) / 1024).toFixed(1)} KB
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap text-xs font-medium">
                          {formatDate(file.uploadedAt || file.updatedAt || file.createdAt || file.uploadDate)}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isPublic ? (
                              <button
                                onClick={() => promptToggleSharing(file)}
                                className="flex items-center gap-1.5 cursor-pointer group/btn bg-emerald-50/60 border border-emerald-100/80 px-2.5 py-1 rounded-full transition-all"
                                title="Click to make private"
                              >
                                <Globe size={13} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                                <span className="font-semibold text-emerald-700 text-[11px]">Public</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => promptToggleSharing(file)}
                                className="flex items-center gap-1.5 cursor-pointer group/btn bg-slate-100/60 border border-slate-200/60 px-2.5 py-1 rounded-full transition-all"
                                title="Click to make public"
                              >
                                <Lock size={13} className="text-slate-400 group-hover/btn:text-violet-600 group-hover/btn:scale-110 transition-transform" />
                                <span className="font-semibold text-slate-500 text-[11px]">Private</span>
                              </button>
                            )}

                            {isPublic && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openShareLinkModal(file);
                                }}
                                className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition-colors text-xs font-semibold cursor-pointer bg-violet-50/50 hover:bg-violet-100/60 border border-violet-100 px-2.5 py-1 rounded-full shadow-2xs"
                                title="Copy public share link"
                              >
                                <Copy size={13} />
                                <span>Share Link</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => openPreviewModal(file)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                              title="Preview File"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              onClick={() => handleDownload(file)}
                              className="p-1.5 text-slate-400 hover:text-violet-600 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                              title="Download File"
                            >
                              <Download size={15} />
                            </button>
                            <button 
                              onClick={() => promptDeleteFile(file)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-white hover:shadow-sm transition-all"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredFiles.map((file, idx) => {
              const fileId = file.id || file._id;
              const isPublic = Boolean(file.isPublic || file.public);
              return (
                <motion.div 
                  key={fileId}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="bg-white hover:bg-gradient-to-b hover:from-white hover:to-purple-50/30 p-5 rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subtle Top Gradient Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {getFileIcon(file, "w-5 h-5")}
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-100">
                        <button 
                          onClick={() => openPreviewModal(file)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center gap-1"
                          title="Preview File"
                        >
                          <Eye size={17} />
                        </button>
                        <button 
                          onClick={() => handleDownload(file)}
                          className="p-1.5 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                          title="Download File"
                        >
                          <Download size={17} />
                        </button>
                        <button 
                          onClick={() => promptDeleteFile(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm truncate mb-1 group-hover:text-violet-900 transition-colors" title={file.name || file.fileName}>
                      {formatFileName(file.name || file.fileName, 30)}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 font-medium">
                      {((file.size || file.fileSize || 0) / 1024).toFixed(1)} KB • {formatDate(file.uploadedAt || file.updatedAt || file.createdAt || file.uploadDate)}
                    </p>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      {isPublic ? (
                        <button
                          onClick={() => promptToggleSharing(file)}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-violet-600 cursor-pointer group/btn bg-emerald-50/60 border border-emerald-100/80 px-2.5 py-1 rounded-full transition-all"
                          title="Click to make private"
                        >
                          <Globe size={13} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                          <span className="font-semibold text-emerald-700 text-[11px]">Public</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => promptToggleSharing(file)}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-violet-600 cursor-pointer group/btn bg-slate-100/60 border border-slate-200/60 px-2.5 py-1 rounded-full transition-all"
                          title="Click to make public"
                        >
                          <Lock size={13} className="text-slate-400 group-hover/btn:text-violet-600 group-hover/btn:scale-110 transition-transform" />
                          <span className="font-semibold text-slate-500 text-[11px]">Private</span>
                        </button>
                      )}

                      {isPublic && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openShareLinkModal(file);
                          }}
                          className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition-colors text-xs font-semibold cursor-pointer bg-violet-50/50 hover:bg-violet-100/60 border border-violet-100 px-2.5 py-1 rounded-full shadow-2xs"
                          title="Copy public share link"
                        >
                          <Copy size={13} />
                          <span>Share Link</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal for Toggling Sharing */}
        {shareModalFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
              <button
                onClick={() => !isUpdating && setShareModalFile(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                disabled={isUpdating}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className={`p-3 rounded-xl ${
                  Boolean(shareModalFile.isPublic || shareModalFile.public) 
                    ? 'bg-amber-50 text-amber-600' 
                    : 'bg-violet-50 text-violet-600'
                }`}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Change Access Privacy?
                  </h3>
                  <p className="text-xs text-slate-400 truncate max-w-[260px]">
                    {shareModalFile.name || shareModalFile.fileName}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Are you sure you want to make this file{' '}
                <span className="font-semibold text-slate-800">
                  {Boolean(shareModalFile.isPublic || shareModalFile.public) ? 'Private' : 'Public'}
                </span>
                ?{' '}
                {Boolean(shareModalFile.isPublic || shareModalFile.public)
                  ? 'Other users will no longer be able to view or download this file via link.'
                  : 'Anyone with the share link will be able to access and view this file.'}
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShareModalFile(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmToggleSharing}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? 'Updating...' : `Make ${Boolean(shareModalFile.isPublic || shareModalFile.public) ? 'Private' : 'Public'}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
              <button
                onClick={() => !isDeleting && setDeleteModalFile(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="p-3 rounded-xl bg-red-50 text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Delete File?
                  </h3>
                  <p className="text-xs text-slate-400 truncate max-w-[260px]">
                    {formatFileName(deleteModalFile.name || deleteModalFile.fileName, 30)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed break-words">
                Are you sure you want to delete <span className="font-semibold text-slate-800 break-all">{formatFileName(deleteModalFile.name || deleteModalFile.fileName, 35)}</span>? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalFile(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFile}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Delete File'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share File Link Modal */}
        {copyLinkModalFile && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setCopyLinkModalFile(null);
            }}
          >
            <div 
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-lg font-bold text-slate-800">Share File</h3>
                <button
                  type="button"
                  onClick={() => setCopyLinkModalFile(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border-t border-slate-100 -mx-6 mb-5"></div>

              {/* Body */}
              <div className="space-y-3">
                <p className="text-sm text-slate-700 font-medium">
                  Share this link with others to give them access to this file:
                </p>

                {/* Input + Checkmark Box */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-violet-50/30 border-2 border-purple-500 rounded-2xl px-4 py-2.5 flex items-center overflow-hidden">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/file/${copyLinkModalFile.id || copyLinkModalFile._id}`}
                      className="w-full bg-transparent text-sm text-slate-900 font-medium focus:outline-none truncate selection:bg-purple-100"
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isCopied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Status Indicator */}
                {isCopied ? (
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    ✓ Link copied to clipboard!
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Anyone with this link can access this file.
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 -mx-6 mt-6 mb-4"></div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCopyLinkModalFile(null)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopyModalUrl}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-violet-600 hover:bg-violet-700 text-white'
                  }`}
                >
                  {isCopied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Preview Modal */}
        {previewModalFile && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={closePreviewModal}
          >
            <div 
              className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 relative flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="p-2.5 bg-violet-50 rounded-2xl border border-violet-100 text-violet-600 shrink-0">
                    {getFileIcon(previewModalFile, "w-6 h-6")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-800 truncate" title={previewModalFile.name || previewModalFile.fileName}>
                      {previewModalFile.name || previewModalFile.fileName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 font-medium">
                        {((previewModalFile.size || previewModalFile.fileSize || 0) / 1024).toFixed(1)} KB
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        Boolean(previewModalFile.isPublic || previewModalFile.public) 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {Boolean(previewModalFile.isPublic || previewModalFile.public) ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(previewModalFile)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={closePreviewModal}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body / Media Viewer */}
              <div className="py-6 flex-1 flex items-center justify-center min-h-[300px] overflow-auto bg-slate-50/50 rounded-2xl my-4 border border-slate-100/80">
                {isLoadingPreview ? (
                  <div className="flex flex-col items-center justify-center p-8 space-y-3">
                    <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-medium text-slate-500">Loading preview...</p>
                  </div>
                ) : previewError ? (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Preview Unavailable</h4>
                    <p className="text-xs text-slate-500 max-w-sm mb-4">
                      Unable to load inline preview for this file. You can download it directly.
                    </p>
                    <button
                      onClick={() => handleDownload(previewModalFile)}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Download File
                    </button>
                  </div>
                ) : (
                  (() => {
                    const category = getCategory(previewModalFile);
                    if (category === 'image') {
                      return (
                        <img 
                          src={previewUrl} 
                          alt={previewModalFile.name || 'File preview'} 
                          className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md border border-slate-200/50"
                        />
                      );
                    }
                    if (category === 'video') {
                      return (
                        <video 
                          src={previewUrl} 
                          controls 
                          autoPlay 
                          className="max-h-[60vh] max-w-full rounded-2xl shadow-md"
                        />
                      );
                    }
                    if (category === 'audio') {
                      return (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                            <Film className="w-8 h-8 animate-pulse" />
                          </div>
                          <p className="text-sm font-semibold text-slate-800 truncate w-full text-center">
                            {previewModalFile.name || previewModalFile.fileName}
                          </p>
                          <audio src={previewUrl} controls autoPlay className="w-full" />
                        </div>
                      );
                    }
                    if (category === 'pdf') {
                      return (
                        <iframe 
                          src={previewUrl} 
                          title="PDF Preview"
                          className="w-full h-[60vh] rounded-xl border border-slate-200"
                        />
                      );
                    }
                    return (
                      <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                          {getFileIcon(previewModalFile, "w-8 h-8")}
                        </div>
                        <h4 className="text-base font-bold text-slate-800">
                          {previewModalFile.name || previewModalFile.fileName}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm">
                          No direct browser preview available for this file type. Click download to access the full file.
                        </p>
                        <button
                          onClick={() => handleDownload(previewModalFile)}
                          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Download size={14} />
                          <span>Download File</span>
                        </button>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0 text-xs text-slate-400">
                <span>Uploaded: {formatDate(previewModalFile.uploadedAt || previewModalFile.createdAt)}</span>
                <button
                  onClick={closePreviewModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyFiles;


