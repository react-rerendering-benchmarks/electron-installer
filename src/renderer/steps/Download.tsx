import { useRef } from "react";
import { memo } from "react";
import { useEffect, useState } from "react";
import "./Download.css";
import "../App.css";
import { useNavigate } from "react-router-dom";
export const Download = memo(function Download() {
  const navigate = useNavigate();
  const {
    ipcRenderer
  } = window.electron;
  const startTime = useRef(0);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"loading" | "downloading" | "done" | "error">("loading");
  useEffect(() => {
    startTime.current = Date.now();
    void ipcRenderer.invoke("DOWNLOAD");
  }, []);
  useEffect(() => {
    const listeners: Array<() => void> = [];
    listeners.push(ipcRenderer.on("DOWNLOAD_PROGRESS", progress => {
      setStep("downloading");
      setProgress((progress as number));
    }));
    listeners.push(ipcRenderer.on("DOWNLOAD_DONE", () => {
      const waitTime = 1000 - (Date.now() - startTime.current);
      if (waitTime > 0) {
        const timeout = setTimeout(() => navigate("/action"), waitTime);
        listeners.push(() => clearTimeout(timeout));
      } else {
        navigate("/action");
      }
    }));
    listeners.push(ipcRenderer.on("DOWNLOAD_ERROR", () => setStep("error")));
    return () => {
      listeners.forEach(listener => listener());
    };
  });
  return <div className="page download-page">
      <div className="download-progress">
        <div className="download-progress-bar" style={{
        width: `${progress * 100}%`
      }} />
      </div>
      <div className="download-step">
        {step === "loading" && "Loading..."}
        {step === "downloading" && `Downloading... ${Math.floor(progress * 100)}%`}
        {step === "done" && "Done!"}
        {step === "error" && "Error!"}
      </div>
    </div>;
});