import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";

export default function ProjectLoaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/projects/${id}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error || "Load failed");

        // Store payload temporarily so main page can restore it
        localStorage.setItem("geoai_restore_project_payload", JSON.stringify(json.payload));
        localStorage.setItem("geoai_restore_project_name", json.name);

        if (!mounted) return;
        setStatus("Restoring...");
        navigate("/", { replace: true });

      } catch (e) {
        setStatus("Project not found or server error.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{ opacity: 0.85, fontSize: 18 }}>
        {status}
      </div>
    </div>
  );
}
