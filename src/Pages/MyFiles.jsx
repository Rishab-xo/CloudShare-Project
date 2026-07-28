import React, { useState } from 'react';
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
  File
} from 'lucide-react';
import { useAuth } from '@clerk/react';
import axios from 'axios';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const {getToken} = useAuth();

  const fetchFiles = async ()=>{
    try{
      const token = await getToken();
      const response = await axios.get('http://localhost:8080/api/v1.0/files/my', {headers: {Authorization: `Bearer ${token}`}});
      if(response.status ===200){
        setFiles(response.data);
    }
  }
  catch(error){
    console.log("Error fetching files from server: ", error);
  }
}

  const handleDeleteFile = (id) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Film className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-2">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">
              My Files <span className="text-slate-400 font-normal text-xl">({files.length})</span>
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
            {['all', 'document', 'image', 'video'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-violet-50 text-violet-600 border border-violet-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Files Content View */}
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <File className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700">No files found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              {searchQuery ? 'Try adjusting your search query or filter.' : 'Upload files to get started managing your cloud files.'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{file.size} • Updated {file.updatedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100">
                    <button 
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <div 
                key={file.id} 
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      {getFileIcon(file.type)}
                    </div>
                    <button 
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-800 truncate mb-1" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-400">{file.size}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{file.updatedAt}</span>
                  <span className="capitalize px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 font-medium">
                    {file.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyFiles;

