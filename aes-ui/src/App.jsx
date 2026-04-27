import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API = "https://advanced-encryption-standard-aes-0y3n.onrender.com";

  const encryptText = async () => {
    try {
      setLoading(true);
      setStatus("Encrypting...");

      const fd = new FormData();
      fd.append("password", password);
      fd.append("text", text);

      const res = await fetch(`${API}/api/encrypt-text`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data.error) return setStatus("❌ " + data.error);

      setText(data.ciphertext_b64);
      setStatus("Encrypted successfully");
    } catch {
      setStatus("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const decryptText = async () => {
    try {
      setLoading(true);
      setStatus("Decrypting...");

      const fd = new FormData();
      fd.append("password", password);
      fd.append("ciphertext_b64", text.trim());

      const res = await fetch(`${API}/api/decrypt-text`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (data.error) return setStatus("❌ " + data.error);

      setText(data.text);
      setStatus("Decrypted successfully");
    } catch {
      setStatus("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const encryptFile = async () => {
    if (!file) return setStatus("Select file first");

    try {
      setLoading(true);
      setStatus("Encrypting file...");

      const fd = new FormData();
      fd.append("password", password);
      fd.append("file", file);

      const res = await fetch(`${API}/api/encrypt-file`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        setStatus("❌ " + err.detail);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.name + ".enc";
      a.click();

      setStatus("File encrypted");
    } catch {
      setStatus("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const decryptFile = async () => {
    if (!file) return setStatus("Select file first");

    try {
      setLoading(true);
      setStatus("Decrypting file...");

      const fd = new FormData();
      fd.append("password", password);
      fd.append("file", file);

      const res = await fetch(`${API}/api/decrypt-file`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        setStatus("❌ " + err.detail);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "decrypted_file";
      a.click();

      setStatus("File decrypted");
    } catch {
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white p-6">
      
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          SecureVault
        </h1>
        <p className="text-slate-400 mt-2">
          AES-GCM Encryption for Text & Files
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* PASSWORD */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-2xl shadow-xl">
          <label className="text-sm text-slate-300">Password</label>
          <div className="flex gap-2 mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter strong password"
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="bg-slate-700 px-4 rounded-xl hover:bg-slate-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* TEXT SECTION */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-3">Text Encryption</h2>

          <textarea
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 h-32 focus:ring-2 focus:ring-purple-500"
            placeholder="Enter text or Base64..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex gap-3 mt-3">
            <button onClick={encryptText} className="bg-gradient-to-r from-red-500 to-pink-500 px-4 py-2 rounded-xl w-full">
              Encrypt
            </button>
            <button onClick={decryptText} className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-xl w-full">
              Decrypt
            </button>
          </div>
        </div>

        {/* FILE SECTION */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-3">File Encryption</h2>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-3 text-sm"
          />

          <div className="flex gap-3">
            <button onClick={encryptFile} className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 rounded-xl w-full">
              Encrypt File
            </button>
            <button onClick={decryptFile} className="bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 rounded-xl w-full">
              Decrypt File
            </button>
          </div>
        </div>

        {/* STATUS */}
        <div className="text-center text-sm text-slate-300">
          {loading ? "⏳ Processing..." : status}
        </div>

      </div>
    </div>
  );
}