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
  Copy
} from 'lucide-react';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiEndpoints } from '@/utils/apiEndpoints';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [shareModalFile, setShareModalFile] = useState(null);
  const [deleteModalFile, setDeleteModalFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {getToken} = useAuth();

  const handleCopyShareLink = (file) => {
    const fileId = file.id || file._id;
    const shareUrl = file.url || file.fileUrl || `${window.location.origin}/file/${fileId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
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
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(`Error deleting file: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteModalFile(null);
    }
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

  const getFileIcon = (fileObj) => {
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
      return <ImageIcon className="w-5 h-5 text-purple-600 stroke-[2]" />;
    }
    if (isVideo) {
      return <Film className="w-5 h-5 text-purple-600 stroke-[2]" />;
    }
    return <FileText className="w-5 h-5 text-purple-600 stroke-[2]" />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-2">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">
              My Files <span className="text-slate-400 font-normal text-xl">{files.length}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/upload"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New File</span>
            </Link>

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
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
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
        </div>

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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    <th className="py-3.5 px-4 w-2/5">NAME</th>
                    <th className="py-3.5 px-4 w-20">SIZE</th>
                    <th className="py-3.5 px-4 w-28">UPLOADED</th>
                    <th className="py-3.5 px-4 w-44">SHARING</th>
                    <th className="py-3.5 px-4 text-right w-24">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredFiles.map((file) => {
                    const fileId = file.id || file._id;
                    const isPublic = Boolean(file.isPublic || file.public);
                    return (
                      <tr key={fileId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                              {getFileIcon(file)}
                            </div>
                            <span className="font-medium text-slate-800 truncate text-xs" title={file.name || file.fileName}>
                              {file.name || file.fileName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {((file.size || file.fileSize || 0) / 1024).toFixed(1)} KB
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {formatDate(file.uploadedAt || file.updatedAt || file.createdAt || file.uploadDate)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {Boolean(file.isPublic || file.public) ? (
                              <button
                                onClick={() => promptToggleSharing(file)}
                                className="flex items-center gap-1.5 cursor-pointer group text-slate-700 hover:text-violet-600 transition-colors text-xs"
                                title="Click to make private"
                              >
                                <Globe size={15} className="text-emerald-500 hover:scale-110 transition-transform" />
                                <span className="font-medium group-hover:underline">
                                  Public
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => promptToggleSharing(file)}
                                className="flex items-center gap-1.5 cursor-pointer group text-slate-700 hover:text-violet-600 transition-colors text-xs"
                                title="Click to make public"
                              >
                                <Lock size={15} className="text-slate-400 group-hover:text-violet-600 hover:scale-110 transition-transform" />
                                <span className="font-medium group-hover:underline">
                                  Private
                                </span>
                              </button>
                            )}

                            {Boolean(file.isPublic || file.public) && (
                              <button
                                onClick={() => handleCopyShareLink(file)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-xs font-medium cursor-pointer"
                                title="Copy public share link"
                              >
                                <Copy size={14} />
                                <span>Share Link</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleDownload(file)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Download File"
                            >
                              <Download size={16} />
                            </button>
                            <button 
                              onClick={() => promptDeleteFile(file)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                            {Boolean(file.isPublic || file.public) ? (
                              <a 
                                href={file.url || file.fileUrl || `/file/${fileId}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                title="View File"
                              >
                                <Eye size={16} />
                              </a>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const fileId = file.id || file._id;
              const isPublic = Boolean(file.isPublic || file.public);
              return (
                <div 
                  key={fileId} 
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDownload(file)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Download File"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => promptDeleteFile(file)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        {isPublic ? (
                          <a 
                            href={file.url || file.fileUrl || `/file/${fileId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="View File"
                          >
                            <Eye size={16} />
                          </a>
                        ) : (
                          <span className="w-[28px]"></span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold text-slate-800 text-sm truncate mb-1" title={file.name || file.fileName}>
                      {file.name || file.fileName}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      {((file.size || file.fileSize || 0) / 1024).toFixed(1)} KB • {formatDate(file.uploadedAt || file.updatedAt || file.createdAt || file.uploadDate)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      {isPublic ? (
                        <button
                          onClick={() => promptToggleSharing(file)}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-violet-600 cursor-pointer group"
                          title="Click to make private"
                        >
                          <Globe size={14} className="text-emerald-500 hover:scale-110 transition-transform" />
                          <span className="font-medium group-hover:underline">Public</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => promptToggleSharing(file)}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-violet-600 cursor-pointer group"
                          title="Click to make public"
                        >
                          <Lock size={14} className="text-slate-400 group-hover:text-violet-600 hover:scale-110 transition-transform" />
                          <span className="font-medium group-hover:underline">Private</span>
                        </button>
                      )}

                      {isPublic && (
                        <button
                          onClick={() => handleCopyShareLink(file)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-xs font-medium cursor-pointer"
                          title="Copy public share link"
                        >
                          <Copy size={14} />
                          <span>Share Link</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
                    {deleteModalFile.name || deleteModalFile.fileName}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800">{deleteModalFile.name || deleteModalFile.fileName}</span>? This action cannot be undone.
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
      </div>
    </DashboardLayout>
  );
};

export default MyFiles;


