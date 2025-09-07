"use client";
import { useState } from "react";

const candidates = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

export default function Home() {
  const [selected, setSelected] = useState<number|null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, number>|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleVote = async () => {
    if (selected !== null) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: selected })
        });
        if (!res.ok) throw new Error("Failed to submit vote");
        setSubmitted(true);
        // Fetch results after voting
        const resultsRes = await fetch("/api/vote");
        const data = await resultsRes.json();
        setResults(data.votes);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f7f7fa" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Vote for Your Favorite Candidate</h1>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      {!submitted ? (
        <>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            {candidates.map(candidate => (
              <button
                key={candidate.id}
                onClick={() => setSelected(candidate.id)}
                style={{
                  padding: "1rem 2rem",
                  borderRadius: "8px",
                  border: selected === candidate.id ? "2px solid #0070f3" : "1px solid #ccc",
                  background: selected === candidate.id ? "#e6f0ff" : "#fff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1rem"
                }}
              >
                {candidate.name}
              </button>
            ))}
          </div>
          <button
            onClick={handleVote}
            disabled={selected === null || loading}
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "8px",
              background: selected === null ? "#ccc" : "#0070f3",
              color: "#fff",
              border: "none",
              cursor: selected === null ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "1rem"
            }}
          >
            {loading ? "Submitting..." : "Submit Vote"}
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#0070f3" }}>Thank you for voting!</h2>
          <p style={{ fontSize: "1.2rem" }}>
            You voted for <strong>{candidates.find(c => c.id === selected)?.name}</strong>.
          </p>
          {results && (
            <div style={{ marginTop: "2rem" }}>
              <h3>Current Results:</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {candidates.map(candidate => (
                  <li key={candidate.id} style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>
                    {candidate.name}: <strong>{results[String(candidate.id)] || 0}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}