import React, { useState } from 'react';
import DashboardLayout from '@/Layout/DashboardLayout';
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { apiEndpoints } from '@/utils/apiEndpoints';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FILE_LIMIT = 5;

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const addFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    if (fileArray.length === 0) return;

    setSelectedFiles((prevFiles) => {
      const combined = [...prevFiles];
      let limitExceeded = false;

      fileArray.forEach((file) => {
        if (combined.length >= MAX_FILE_LIMIT) {
          limitExceeded = true;
          return;
        }
        const exists = combined.some((f) => f.name === file.name && f.size === file.size);
        if (!exists) {
          combined.push(file);
        }
      });

      if (limitExceeded || prevFiles.length + fileArray.length > MAX_FILE_LIMIT) {
        toast.error(`Maximum limit is ${MAX_FILE_LIMIT} files at a time.`);
      }

      return combined;
    });
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const token = await getToken();
      const response = await axios.post(apiEndpoints.UPLOAD_FILE, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          selectedFiles.length === 1 
            ? 'File uploaded successfully!' 
            : `${selectedFiles.length} files uploaded successfully!`
        );
        window.dispatchEvent(new Event('creditsUpdated'));
        setSelectedFiles([]);
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
        toast.error(`Error uploading files: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-4 select-none">
        
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-slate-800">Upload Files</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload up to {MAX_FILE_LIMIT} documents, images, or videos to store and share securely.
          </p>
        </motion.div>

        {/* Animated Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
        >
          {/* Drag & Drop Box */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
              isDragOver
                ? 'border-violet-500 bg-violet-50/50 shadow-md'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Drag & drop your files here
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              or click to browse from your device (Max {MAX_FILE_LIMIT} files)
            </p>

            <motion.label
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
            >
              <span>Choose Files</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading || selectedFiles.length >= MAX_FILE_LIMIT}
              />
            </motion.label>
          </motion.div>

          {/* Selected Files List with AnimatePresence */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Selected Files ({selectedFiles.length}/{MAX_FILE_LIMIT})
                  </h4>
                  <button
                    onClick={() => setSelectedFiles([])}
                    disabled={isUploading}
                    className="text-xs text-rose-500 hover:underline font-medium"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={`${file.name}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white rounded-lg border border-slate-100 text-violet-600 shadow-2xs">
                          <File className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <div className="mt-8 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
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
                  <span>
                    Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` : 'Files'}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
