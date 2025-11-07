import React, { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:8080/api/stats";

function StatsDashboard() {
    const [playerName, setPlayerName] = useState("");
    const [resolveMode, setResolveMode] = useState("online");
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const loaderTimeout = useRef(null);

    const calculateKDR = () => {
        if (!stats) return "0.00";
        return (stats.kills / (stats.deaths || 1)).toFixed(2);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const name = playerName.trim();
        if (!name) {
            setError("Please, enter the player's name.");
            return;
        }

        if (loaderTimeout.current) clearTimeout(loaderTimeout.current);
        setLoading(true);
        setError(null);
        setStats(null);
        setShowLoader(false);

        loaderTimeout.current = setTimeout(() => {
            if (loaderTimeout.current) setShowLoader(true);
        }, 200);

        try {
            const response = await axios.get(
                `${API_BASE_URL}/name/${name}?mode=${resolveMode}`
            );
            setStats(response.data);
        } catch (err) {
            if (err.response) {
                setError(
                    err.response.status === 404
                        ? `Player '${name}' not found.`
                        : `API Error (${err.response.status}).`
                );
            } else setError("Unable to connect to the API.");
        } finally {
            if (loaderTimeout.current) {
                clearTimeout(loaderTimeout.current);
                loaderTimeout.current = null;
            }
            setLoading(false);
            setShowLoader(false);
        }
    };

    return (
        <main className="stats-hero">
            <section className="hero-content">
                <h1>
                    Player <span className="highlight">Statistics</span>
                </h1>
                <h2>
                    Tracking every <span className="gradient">Kill & Death</span> with precision
                </h2>
                <p>
                    Real-time combat analytics for your Minecraft experience. <br />
                    Measure your skill, improve your strategy, and dominate the arena.
                </p>

                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Enter the player's name..."
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <select
                        value={resolveMode}
                        onChange={(e) => setResolveMode(e.target.value)}
                    >
                        <option value="online">Online (Mojang)</option>
                        <option value="offline">Offline (UUID Local)</option>
                    </select>
                    <button type="submit" disabled={loading}>
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>

                <div className="results">
                    {showLoader && <p className="status loading">Carregando...</p>}
                    {error && <p className="status error">{error}</p>}
                    {stats && (
                        <div className="stats-card">
                            <h2>{playerName}</h2>
                            <div className="stat">
                                <span>UUID:</span>
                                <strong>{stats.uuid}</strong>
                            </div>
                            <div className="stat">
                                <span>Kills:</span>
                                <strong>{stats.kills}</strong>
                            </div>
                            <div className="stat">
                                <span>Deaths:</span>
                                <strong>{stats.deaths}</strong>
                            </div>
                            <div className="stat highlight">
                                <span>KDR:</span>
                                <strong>{calculateKDR()}</strong>
                            </div>
                        </div>
                    )}
                    {!stats && !showLoader && !error && (
                        <p className="status hint">
                            Search for a player to view their statistics.
                        </p>
                    )}
                </div>
            </section>

            <aside className="hero-visual">
                <div className="light-glow">
                </div>
                <img src="/swords.png" alt="Estatísticas do jogador" className="avatar stats-icon" />
            </aside>
        </main>
    );
}

export default StatsDashboard;
