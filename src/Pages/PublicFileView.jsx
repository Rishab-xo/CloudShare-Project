import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { apiEndpoints } from '@/utils/apiEndpoints';
import { FileText, Image as ImageIcon, Film, Download, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PublicFileView = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      return <ImageIcon className="w-12 h-12 text-violet-600" />;
    }
    if (typeStr.includes('video') || ['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
      return <Film className="w-12 h-12 text-violet-600" />;
    }
    return <FileText className="w-12 h-12 text-violet-600" />;
  };

  const handleDownload = async () => {
    if (!file) return;
    const fileName = file.name || file.fileName || 'download';
    
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-100 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied / Not Found</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error || 'This file is private or no longer available.'}
          </p>
          <Link
            to="/"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
      <Toaster />
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-lg w-full p-8 text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold mb-6 border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Publicly Shared File
        </div>

        {/* Icon Preview */}
        <div className="w-24 h-24 bg-violet-50 rounded-3xl border border-violet-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
          {getFileIcon(file)}
        </div>

        {/* File Metadata */}
        <h1 className="text-xl font-bold text-slate-800 mb-1 break-words">
          {file.name || file.fileName}
        </h1>
        <p className="text-xs text-slate-400 mb-8">
          Size: {((file.size || file.fileSize || 0) / 1024).toFixed(1)} KB
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDownload}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-6 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicFileView;
