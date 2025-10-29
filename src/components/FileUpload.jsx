import React, { useCallback } from 'react';

const FileUpload = ({ onFileLoad }) => {
  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      onFileLoad(text);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  }, [onFileLoad]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      onFileLoad(text);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    }
  }, [onFileLoad]);

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="glass-effect border-2 border-dashed border-blue-500/30 rounded-2xl p-16 text-center hover:border-blue-500/60 hover:glow-blue transition-all duration-300 cursor-pointer group"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
          <svg
            className="mx-auto h-16 w-16 text-blue-400 group-hover:text-blue-300 transition-colors relative z-10"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="mt-6">
          <label htmlFor="file-input" className="cursor-pointer">
            <span className="mt-2 block text-lg font-semibold text-slate-200 group-hover:text-gradient transition-all">
              Drop your NDJSON file here or click to browse
            </span>
            <p className="mt-2 text-sm text-slate-400">
              GitHub Copilot metrics export file (.ndjson)
            </p>
          </label>
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".ndjson,.json"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
