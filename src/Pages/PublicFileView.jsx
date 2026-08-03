import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { apiEndpoints } from '@/utils/apiEndpoints';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Download, 
  ShieldAlert, 
  Copy, 
  Check, 
  Info, 
  FileCode, 
  Archive 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function ShareLogo({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.7699 21.8258L7.42207 20.485C5 19.9996 5 20 6.6277 17.875L9.77497 13.9892C10.4003 13.2172 11.3407 12.7687 12.3342 12.7687L19.2668 13.0726M11.7699 21.8258C11.7699 21.8258 12.8773 24.5436 14.1667 25.833C15.4561 27.1223 18.1738 28.2296 18.1738 28.2296M18.1738 28.2296L19.0938 32.0266C19.5 34.5 19.5 34.5 21.6117 33.0063L25.7725 30.2146C26.684 29.603 27.2308 28.5775 27.2308 27.4798L26.927 20.733M26.927 20.733C31.5822 16.4657 34.5802 12.4926 34.9962 6.59335C35.1164 4.8888 35.1377 4.88137 33.4062 5.00345C27.507 5.41937 23.534 8.4174 19.2668 13.0726M11.7699 31.6146C11.7699 33.4841 10.2544 34.9996 8.38495 34.9996H5V31.6146C5 29.7453 6.5155 28.2298 8.38495 28.2298C10.2544 28.2298 11.7699 29.7453 11.7699 31.6146Z"
        fill="currentColor"
      />
      <path
        d="M12.5 22.9996L11 20.4996C11 20.0996 16 12.9996 20 12.9996C22.1667 14.8329 26.1172 16.4682 27 19.9996C27.5 21.9996 21.5 26.1663 18.5 28.4996L12.5 22.9996Z"
        fill="currentColor"
      />
    </svg>
  );
}

const PublicFileView = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPublicFile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiEndpoints.PUBLIC_FILE(id));
        if (response.status === 200 && response.data) {
          setFile(response.data);
        } else {
          setError('File not found or private');
        }
      } catch (err) {
        console.error('Error fetching public file:', err);
        setError(err.response?.data?.message || 'This file is private or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPublicFile();
    }
  }, [id]);

  const getFileIcon = (fileObj) => {
    const typeStr = (fileObj?.type || fileObj?.fileType || fileObj?.contentType || '').toLowerCase();
    const nameStr = fileObj?.name || fileObj?.fileName || '';
    const ext = nameStr.split('.').pop()?.toLowerCase() || '';

    if (typeStr.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-8 h-8 text-blue-600" />;
    }
    if (typeStr.includes('video') || ['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
      return <Film className="w-8 h-8 text-blue-600" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className="w-8 h-8 text-blue-600" />;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java'].includes(ext)) {
      return <FileCode className="w-8 h-8 text-blue-600" />;
    }
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    if (bytes < k) return `${bytes} B`;
    if (bytes < k * k) return `${(bytes / k).toFixed(2)} KB`;
    return `${(bytes / (k * k)).toFixed(2)} MB`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Public link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!file) return;
    const fileName = file.name || file.fileName || 'download';
    setDownloading(true);

    try {
      const response = await axios.get(apiEndpoints.DOWNLOAD_FILE(id), {
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Downloaded ${fileName}`);
    } catch (err) {
      console.error('Download error:', err);
      const fallbackUrl = file.url || file.fileUrl || file.downloadUrl;
      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank');
      } else {
        toast.error('Unable to download file');
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-4">
        <Toaster />
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">File Unavailable</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error || 'This file is private or no longer exists.'}
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const fileName = file.name || file.fileName || 'Untitled File';
  const fileSize = formatFileSize(file.size || file.fileSize || 0);
  const fileTypeStr = (file.type || file.fileType || file.contentType || 'file').toUpperCase();
  const sharedDate = file.createdAt || file.uploadDate || file.date 
    ? new Date(file.createdAt || file.uploadDate || file.date).toLocaleDateString('en-GB') 
    : new Date().toLocaleDateString('en-GB');

  return (
    <div className="h-screen bg-slate-50/50 flex flex-col justify-between p-4 sm:p-5 overflow-hidden select-none">
      <Toaster />

      {/* Top Bar with Logo & Share Link */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-1 border-b border-slate-200/60 pb-3">
        <Link to="/" className="flex items-center gap-2">
          <ShareLogo className="h-7 w-7 text-blue-600" />
          <span className="text-lg font-bold tracking-tight text-slate-800">
            CloudShare
          </span>
        </Link>

        {/* Share Link Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-medium px-3.5 py-1.5 rounded-xl text-xs transition-all border border-blue-200/60 shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Share Link'}</span>
        </motion.button>
      </header>

      {/* Center Section: Main Card + Alert Banner */}
      <main className="w-full max-w-xl mx-auto flex flex-col gap-3 my-auto">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-slate-200/70 shadow-lg p-5 sm:p-6 text-center"
        >
          {/* File Icon Circle */}
          <div className="w-14 h-14 bg-blue-50/80 rounded-full border border-blue-100/80 flex items-center justify-center mx-auto mb-3 shadow-sm">
            {getFileIcon(file)}
          </div>

          {/* File Title */}
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mb-1 truncate px-2">
            {fileName}
          </h1>

          {/* Subtitle Info */}
          <p className="text-[11px] text-slate-400 mb-2.5 font-medium">
            {fileSize} &bull; Shared on {sharedDate}
          </p>

          {/* File Type Pill Badge */}
          <div className="mb-4">
            <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
              {fileTypeStr}
            </span>
          </div>

          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto px-7 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 mx-auto"
          >
            {downloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="border-t border-slate-100 my-4" />

          {/* File Information Section */}
          <div className="text-left space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800">File Information</h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">File Name:</span>
                <span className="font-semibold text-slate-800 max-w-[260px] truncate text-right">
                  {fileName}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">File Type:</span>
                <span className="font-mono text-slate-700 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {fileTypeStr.toLowerCase()}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">File Size:</span>
                <span className="font-semibold text-slate-800">{fileSize}</span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400 font-medium">Shared:</span>
                <span className="font-semibold text-slate-800">{sharedDate}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Public Info Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-blue-50/80 border border-blue-200/70 rounded-xl p-3 flex items-center gap-2 text-xs text-blue-800 shadow-sm"
        >
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>This file has been shared publicly. Anyone with this link can view and download it.</span>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400 py-1">
        © {new Date().getFullYear()} CloudShare
      </footer>
    </div>
  );
};

export default PublicFileView;
