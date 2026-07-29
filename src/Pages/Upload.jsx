import React, { useState } from 'react';
import DashboardLayout from '@/Layout/DashboardLayout';
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { apiEndpoints } from '@/utils/apiEndpoints';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('files', selectedFile);
    formData.append('file', selectedFile);

    try {
      const token = await getToken();
      const response = await axios.post(apiEndpoints.UPLOAD_FILE, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('File uploaded successfully!');
        window.dispatchEvent(new Event('creditsUpdated'));
        setSelectedFile(null);
        navigate('/my-files');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const isOutofCredits = 
        error.response?.status === 403 || 
        error.response?.data?.message?.toLowerCase().includes('credit') ||
        error.response?.data?.message?.toLowerCase().includes('limit');

      if (isOutofCredits) {
        toast.error('Upload limit reached! You have used all available credits.', { duration: 5000 });
      } else {
        toast.error(`Error uploading file: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Upload File</h1>
          <p className="text-sm text-slate-500 mt-1">Upload your documents, images, or videos to store and share securely.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          {/* Drag & Drop Box */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
              isDragOver
                ? 'border-violet-500 bg-violet-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Drag & drop your file here
            </h3>
            <p className="text-sm text-slate-400 mb-4">or click to browse from your device</p>

            <label className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-sm">
              <span>Choose File</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-violet-600">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload File</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
