import React, { useEffect, useState, useContext } from 'react';
import DashboardLayout from '@/Layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Files, 
  Upload, 
  Zap, 
  TrendingUp, 
  Globe, 
  Plus, 
  Sparkles, 
  Lock, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Archive, 
  ArrowUpRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useAuth, useUser } from '@clerk/react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiEndpoints } from '@/utils/apiEndpoints';
import { UserCreditsContext } from '@/context/UserCreditsContext';

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { credits } = useContext(UserCreditsContext);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [stats, setStats] = useState({
    totalFiles: 0,
    publicFiles: 0,
    totalStorageBytes: 0
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(apiEndpoints.FETCH_FILES, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        let fileList = [];
        if (Array.isArray(response.data)) {
          fileList = response.data;
        } else if (response.data && Array.isArray(response.data.files)) {
          fileList = response.data.files;
        }

        setFiles(fileList);

        const publicCount = fileList.filter(f => f.isPublic || f.public).length;
        const totalSize = fileList.reduce((acc, f) => acc + (f.size || f.fileSize || 0), 0);

        setStats({
          totalFiles: fileList.length,
          publicFiles: publicCount,
          totalStorageBytes: totalSize
        });
      }
    } catch (err) {
      console.log('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatStorage = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
    return `${(bytes / (k * k)).toFixed(2)} MB`;
  };

  const getFileTypeDetails = (fileObj) => {
    const nameStr = fileObj?.name || fileObj?.fileName || '';
    const ext = nameStr.split('.').pop()?.toLowerCase() || '';

    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
      return {
        icon: <ImageIcon className="w-4 h-4 text-purple-600" />
      };
    }
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
      return {
        icon: <Film className="w-4 h-4 text-indigo-600" />
      };
    }
    if (['pdf'].includes(ext)) {
      return {
        icon: <FileText className="w-4 h-4 text-amber-600" />
      };
    }
    if (['zip', 'rar', '7z'].includes(ext)) {
      return {
        icon: <Archive className="w-4 h-4 text-emerald-600" />
      };
    }
    return {
      icon: <FileText className="w-4 h-4 text-blue-600" />
    };
  };

  const copyPublicLink = (fileObj, id) => {
    const fileId = fileObj.id || fileObj._id;
    const shareUrl = `${window.location.origin}/file/${fileId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    toast.success('Public share link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 py-2 px-1 sm:px-3 select-none">

        {/* 1. Sleek Compact Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-violet-500/30"
        >
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute right-16 top-0 w-24 h-24 bg-purple-400/20 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>Dashboard Overview</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                Welcome back, {user?.firstName || user?.username || 'User'}! 👋
              </h1>
              <p className="text-violet-100/90 text-xs max-w-lg leading-snug">
                Manage your shared files, track credit usage, and generate secure download links.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/upload')}
                className="px-3.5 py-1.5 bg-white text-violet-700 font-bold rounded-xl text-xs shadow-sm hover:bg-violet-50 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Upload Files</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/subscriptions')}
                className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl text-xs border border-white/30 backdrop-blur-md transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Get Credits</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 2. Compact KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Total Uploaded */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Uploaded</p>
              <h3 className="text-base sm:text-xl font-extrabold text-slate-800 mt-0.5">{stats.totalFiles} Files</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Stored securely</p>
            </div>
            <div className="p-2 sm:p-2.5 bg-violet-50 text-violet-600 rounded-xl border border-violet-100/80 flex-shrink-0">
              <Files className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </motion.div>

          {/* Credits Left */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Credits Left</p>
              <h3 className="text-base sm:text-xl font-extrabold text-violet-600 mt-0.5">{credits} Credits</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Available for uploads</p>
            </div>
            <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/80 flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
            </div>
          </motion.div>

          {/* Storage Used */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Storage Used</p>
              <h3 className="text-base sm:text-xl font-extrabold text-slate-800 mt-0.5">{formatStorage(stats.totalStorageBytes)}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">High-speed CDN</p>
            </div>
            <div className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/80 flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </motion.div>

          {/* Public Shared */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Public Shared</p>
              <h3 className="text-base sm:text-xl font-extrabold text-slate-800 mt-0.5">{stats.publicFiles} Active</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Accessible via link</p>
            </div>
            <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/80 flex-shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </motion.div>
        </div>

        {/* 3. Full-Width Recent Files Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Recent Files</h2>
              <p className="text-xs text-slate-400">Your latest uploaded documents and media</p>
            </div>
            <Link
              to="/my-files"
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
            >
              <span>View All Files</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-7 h-7 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Loading recent files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-100">
                <Files className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No files uploaded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload your first document or image to generate secure public/private shareable links.
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-colors inline-block shadow-sm"
              >
                Upload Your First File
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">NAME</th>
                    <th className="py-3 px-3">SIZE</th>
                    <th className="py-3 px-3">UPLOADED BY</th>
                    <th className="py-3 px-3">MODIFIED</th>
                    <th className="py-3 px-3">SHARING</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {files.slice(0, 5).map((file, idx) => {
                    const fileName = file.name || file.fileName || 'Untitled File';
                    const fileSize = formatStorage(file.size || file.fileSize || 0);
                    const isPublic = file.isPublic || file.public;
                    const dateStr = file.createdAt || file.uploadDate || file.date
                      ? new Date(file.createdAt || file.uploadDate || file.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Recent';

                    const fileTypeInfo = getFileTypeDetails(file);
                    const fileId = file.id || file._id;

                    return (
                      <motion.tr
                        key={fileId || idx}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="hover:bg-violet-50/60 transition-all duration-200 group"
                      >
                        {/* Name */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-3 max-w-[220px] sm:max-w-[340px] truncate">
                            <div className="p-1.5 rounded-lg border flex-shrink-0 bg-slate-50 border-slate-100 shadow-2xs">
                              {fileTypeInfo.icon}
                            </div>
                            <span className="truncate text-xs font-semibold text-slate-800" title={fileName}>
                              {fileName}
                            </span>
                          </div>
                        </td>

                        {/* Size */}
                        <td className="py-3.5 px-3 text-slate-500 font-medium text-[11px]">
                          {fileSize}
                        </td>

                        {/* Uploaded By */}
                        <td className="py-3.5 px-3 text-slate-600 font-medium text-xs">
                          You
                        </td>

                        {/* Modified Date */}
                        <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                          {dateStr}
                        </td>

                        {/* Sharing Badge */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isPublic
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isPublic ? <Globe className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                            {isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPublic && (
                              <button
                                onClick={() => copyPublicLink(file, fileId)}
                                className="p-1.5 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-white transition-colors"
                                title="Copy Share Link"
                              >
                                {copiedId === fileId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            <Link
                              to="/my-files"
                              className="p-1.5 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-white transition-colors"
                              title="Manage in My Files"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;