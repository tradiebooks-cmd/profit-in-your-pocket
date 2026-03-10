import { useState, useRef, useCallback } from "react";
import Head from "next/head";

const ORANGE = "#EE7124";
const NAVY = "#192A52";
const NAVY_DARK = "#101C38";
const NAVY_MID = "#1E3360";
const NAVY_LIGHT = "#243D72";
const CREAM = "#FFF8F0";
const TEXT = "#E8EEF8";
const MUTED = "#7A90B8";



  if (sections.length === 0) {
    sections.push({ label: "Analysis", content: text.trim() });
  }
  return sections;
}

const HELMET_SVG = (color = ORANGE) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 5C9.5 5 6 9 6 13.5V15h16v-1.5C22 9 18.5 5 14 5z" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M4 15h20v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M12 5v4M14 5v5M16 5v4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export default function App() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError(null);
      setResults(null);
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = () => rej(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, filename: file.name }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResults(data.sections);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setResults(null); setError(null); };

  return (
    <>
      <Head>
        <title>Profit in Your Pocket | Tradie Books Australia</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: ${NAVY_DARK};
          color: ${TEXT};
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
        }
        .app {
          max-width: 820px;
          margin: 0 auto;
          padding: 0 20px 80px;
        }
        .header {
          background: ${NAVY};
          margin: 0 -20px 48px;
          padding: 28px 40px 32px;
          position: relative;
          overflow: hidden;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, ${ORANGE}, #F5A050, ${ORANGE});
        }
        .header::before {
          content: '';
          position: absolute;
          top: -60px; right: -40px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(238,113,36,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .logo-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
        }
        .logo-icon {
          width: 48px; height: 48px;
          background: rgba(238,113,36,0.15);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(238,113,36,0.25);
        }
        .brand-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: ${ORANGE}; line-height: 1;
        }
        .brand-sub {
          font-size: 10px; letter-spacing: 0.18em;
          text-transform: uppercase; color: ${MUTED}; margin-top: 3px;
        }
        .page-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(38px, 6vw, 60px);
          font-weight: 900; line-height: 0.95;
          text-transform: uppercase; color: ${CREAM};
        }
        .page-title .highlight { color: ${ORANGE}; display: block; }
        .page-tagline {
          margin-top: 12px; font-size: 14px;
          color: ${MUTED}; font-weight: 300;
          max-width: 440px; line-height: 1.6;
        }
        .upload-zone {
          border: 2px dashed ${NAVY_LIGHT};
          border-radius: 6px; padding: 52px 32px;
          text-align: center; cursor: pointer;
          transition: all 0.2s; background: ${NAVY};
        }
        .upload-zone:hover, .upload-zone.drag {
          border-color: ${ORANGE};
          background: rgba(238,113,36,0.05);
        }
        .upload-icon-wrap {
          width: 64px; height: 64px;
          background: rgba(238,113,36,0.1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          border: 1.5px solid rgba(238,113,36,0.25);
        }
        .upload-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px; font-weight: 700;
          text-transform: uppercase; color: ${CREAM}; margin-bottom: 8px;
        }
        .upload-hint { font-size: 12px; color: ${MUTED}; }
        .file-selected {
          margin-top: 20px;
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(238,113,36,0.1);
          border: 1px solid rgba(238,113,36,0.3);
          border-radius: 4px; padding: 10px 18px;
          font-size: 13px; color: ${ORANGE}; font-weight: 500;
        }
        .analyze-btn {
          margin-top: 20px; width: 100%; padding: 18px;
          background: ${ORANGE}; color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          border: none; border-radius: 4px; cursor: pointer;
          transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .analyze-btn:hover:not(:disabled) {
          background: #F5861A;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(238,113,36,0.35);
        }
        .analyze-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .loading { text-align: center; padding: 60px 0; }
        .hard-hat-spin {
          font-size: 40px; display: block;
          margin: 0 auto 16px;
          animation: rock 1.2s ease-in-out infinite;
        }
        @keyframes rock {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        .loading-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: ${MUTED};
        }
        .loading-sub { font-size: 12px; color: rgba(122,144,184,0.5); margin-top: 6px; }
        .results { animation: slideUp 0.4s ease; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .results-header {
          background: linear-gradient(135deg, ${NAVY_MID}, ${NAVY});
          border-left: 4px solid ${ORANGE};
          border-radius: 0 6px 6px 0;
          padding: 20px 24px; margin-bottom: 20px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }
        .results-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 22px; font-weight: 800;
          letter-spacing: 0.05em; text-transform: uppercase; color: ${CREAM};
        }
        .results-badge {
          background: rgba(238,113,36,0.15);
          border: 1px solid rgba(238,113,36,0.3);
          color: ${ORANGE}; font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 2px; white-space: nowrap;
        }
        .results-filename { font-size: 11px; color: ${MUTED}; margin-top: 4px; font-weight: 300; }
        .section {
          background: ${NAVY};
          border: 1px solid ${NAVY_LIGHT};
          border-radius: 6px; padding: 22px 24px;
          margin-bottom: 14px; transition: border-color 0.2s;
        }
        .section:hover { border-color: rgba(238,113,36,0.3); }
        .section-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: ${ORANGE}; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(238,113,36,0.15);
        }
        .section-content {
          font-size: 14px; color: #9EB3D0;
          line-height: 1.75; white-space: pre-wrap;
        }
        .reset-btn {
          margin-top: 28px; background: transparent;
          border: 1.5px solid ${NAVY_LIGHT}; color: ${MUTED};
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 12px 24px; border-radius: 4px; cursor: pointer;
          transition: all 0.15s;
        }
        .reset-btn:hover { border-color: ${ORANGE}; color: ${ORANGE}; }
        .error-box {
          margin-top: 16px;
          background: rgba(238,60,60,0.07);
          border: 1px solid rgba(238,60,60,0.2);
          border-radius: 4px; padding: 14px 18px;
          font-size: 13px; color: #FF9090; line-height: 1.6;
        }
        .footer {
          margin-top: 56px; padding-top: 24px;
          border-top: 1px solid ${NAVY_LIGHT};
          display: flex; align-items: center; gap: 10px;
        }
        .footer-text { font-size: 11px; color: rgba(122,144,184,0.4); letter-spacing: 0.08em; }
      `}</style>

      <div className="app">
        <div className="header">
          <div className="logo-row">
            <div className="logo-icon">{HELMET_SVG()}</div>
            <div>
              <div className="brand-name">Tradie Books</div>
              <div className="brand-sub">Australia</div>
            </div>
          </div>
          <div className="page-title">
            Profit in
            <span className="highlight">Your Pocket.</span>
          </div>
          <p className="page-tagline">
            Upload your financial report and get plain-English insights built for tradies — no accountant-speak, just straight answers.
          </p>
        </div>

        {!results && !loading && (
          <>
            <div
              className={`upload-zone ${dragging ? "drag" : ""}`}
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <div className="upload-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 24h16M14 4v14M14 4l-5 5M14 4l5 5" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="upload-label">Drop your report here</div>
              <div className="upload-hint">PDF files only — P&L, BAS, bank statements, job reports</div>
              {file && (
                <div className="file-selected" onClick={(e) => e.stopPropagation()}>
                  📄 {file.name}
                  <span style={{ marginLeft: 8, opacity: 0.6, fontSize: 11 }}>
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {error && <div className="error-box">⚠ {error}</div>}

            <button className="analyze-btn" disabled={!file} onClick={analyze}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7.5" stroke="white" strokeWidth="1.4"/>
                <path d="M6 9l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Analyse My Report
            </button>
          </>
        )}

        {loading && (
          <div className="loading">
            <span className="hard-hat-spin">⛑️</span>
            <div className="loading-text">Crunching the numbers...</div>
            <div className="loading-sub">Reading your report, won't be long</div>
          </div>
        )}

        {results && (
          <div className="results">
            <div className="results-header">
              <div>
                <div className="results-title">Your Report Analysis</div>
                <div className="results-filename">{file?.name}</div>
              </div>
              <div className="results-badge">✓ Complete</div>
            </div>
            {results.map((section, i) => (
              <div className="section" key={i}>
                <div className="section-label">{section.label}</div>
                <div className="section-content">{section.content}</div>
              </div>
            ))}
            <button className="reset-btn" onClick={reset}>← Analyse Another Report</button>
          </div>
        )}

        <div className="footer">
          {HELMET_SVG("rgba(122,144,184,0.3)")}
          <span className="footer-text">Tradie Books Australia · Profit in Your Pocket · Powered by AI</span>
        </div>
      </div>
    </>
  );
}
