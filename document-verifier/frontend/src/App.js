import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  
  const [uploadResult, setUploadResult] = useState(null);

  const resetState = () => {
    setFile(null);
    setFileName('');
    setMessage('');
    setUploadResult(null);
    setIsLoading(false);
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      resetState();
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      resetState();
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  }, []);

  // --- File Upload Handler ---
  const onFileUpload = async () => {
    if (!file) {
      setMessageType('danger');
      setMessage('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsLoading(false);
      setMessageType('success');
      setMessage('File processed successfully!');
      setUploadResult(response.data);
    } catch (error) {
      setIsLoading(false);
      setMessageType('danger');
      setMessage(error.response?.data?.error || 'Error: Could not connect to server.');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="App">
      {/* --- Navigation Bar --- */}
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <span className="navbar-brand">
            <i className="bi bi-shield-lock-fill me-2"></i>
            Document Verification Engine
          </span>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="container main-content">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-9">
            
            {/* --- Header --- */}
            <header className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">Verify Your Document</h1>
              <p className="lead text-light-emphasis">
                Upload a document to extract its content via AI-OCR and prepare it
                for immutable blockchain verification.
              </p>
            </header>

            {/* --- Uploader Card --- */}
            <div 
              className={`uploader-card ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                id="file-upload" 
                onChange={onFileChange} 
                accept="image/png, image/jpeg, application/pdf" 
                hidden 
              />
              <label htmlFor="file-upload" className="uploader-label">
                <i className="bi bi-cloud-arrow-up-fill uploader-icon"></i>
                <h3 className="fw-semibold">
                  {fileName || 'Drag & Drop your file here'}
                </h3>
                <p className="text-light-emphasis">
                  {fileName ? 'Click to choose a different file' : 'or click to browse'}
                </p>
                <span className="file-types">Supports: PNG, JPG, PDF</span>
              </label>
            </div>

            {/* --- Upload Button --- */}
            <div className="d-grid mt-4">
              <button 
                className="btn btn-primary-custom btn-lg" 
                onClick={onFileUpload} 
                disabled={isLoading || !file}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    VERIFYING...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cpu-fill me-2"></i>
                    PROCESS & VERIFY
                  </>
                )}
              </button>
            </div>

            {/* --- Alert Message --- */}
            {message && (
              <div className={`alert alert-${messageType} mt-4 shadow-sm animation-fade-in`} role="alert">
                {message}
              </div>
            )}

            {/* --- Results Card --- */}
            {uploadResult && (
              <div className="card results-card mt-5 shadow-lg animation-fade-in">
                <div className="card-header">
                  <h4 className="mb-0">
                    <i className="bi bi-clipboard-data-fill me-2"></i>
                    Processing Results
                  </h4>
                </div>
                <div className="card-body">
                  <h5 className="text-light-emphasis">Document Metadata</h5>
                  <ul className="list-group list-group-flush mb-4">
                    <li className="list-group-item d-flex justify-content-between">
                      <strong>Document ID:</strong>
                      <span>{uploadResult.document_id}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <strong>Filename:</strong>
                      <span>{uploadResult.filename}</span>
                    </li>
                  </ul>
                  
                  <h5 className="text-light-emphasis">Extracted Text (OCR)</h5>
                  <pre className="extracted-text-box border rounded p-3">
                    {uploadResult.extracted_text || "No text extracted."}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="text-center p-4 mt-auto">
        &copy; {new Date().getFullYear()} AI Document Verifier. All rights reserved.
      </footer>
    </div>
  );
}

export default App;