import React, { useState } from "react";
import axios from "axios";

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [uploader, setUploader] = useState("");
  const [response, setResponse] = useState(null);
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploader", uploader || "Anonymous");

    try {
      const res = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check backend logs.");
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/verify/${verifyHash}`);
      setVerifyResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Verification failed.");
    }
  };

  return (
    <div style={{ margin: "2rem auto", width: "60%", textAlign: "center" }}>
      <h2>🔒 Blockchain Document Verifier</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br />
      <input
        type="text"
        placeholder="Uploader name"
        value={uploader}
        onChange={(e) => setUploader(e.target.value)}
        style={{ margin: "10px", padding: "5px" }}
      />
      <br />
      <button onClick={handleUpload}>Upload Document</button>

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>✅ Upload Successful!</h3>
          <p><b>Message:</b> {response.message}</p>
          <p><b>Hash:</b> {response.hash}</p>
          <p><b>Tx:</b> {response.tx}</p>
        </div>
      )}

      <hr />
      <h3>Verify Document</h3>
      <input
        type="text"
        placeholder="Enter document hash"
        value={verifyHash}
        onChange={(e) => setVerifyHash(e.target.value)}
        style={{ margin: "10px", padding: "5px" }}
      />
      <br />
      <button onClick={handleVerify}>Verify</button>

      {verifyResult && (
        <div style={{ marginTop: "20px" }}>
          <h3>🔍 Verification Result:</h3>
          <pre>{JSON.stringify(verifyResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
