-- Active: 1783091445409@@127.0.0.1@5432@lumina
CREATE TABLE series (
    series_id SERIAL PRIMARY KEY,
    tmdb_id INT UNIQUE NOT NULL,
    series_name VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255),
    status VARCHAR(20),
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seasons (
    season_id SERIAL PRIMARY KEY,
    series_id INT NOT NULL REFERENCES series (series_id) ON DELETE CASCADE,
    tmdb_season_id INT UNIQUE NOT NULL,
    season_no INT NOT NULL
);

CREATE TABLE episodes (
    episode_id SERIAL PRIMARY KEY,
    season_id INT NOT NULL REFERENCES seasons (season_id) ON DELETE CASCADE,
    tmdb_episode_id INT UNIQUE NOT NULL,
    episode_no INT NOT NULL,
    episode_name VARCHAR(255) NOT NULL,
    air_date DATE
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_series (
    user_id INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    series_id INT NOT NULL REFERENCES series (series_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'watching',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, series_id)
);

CREATE TABLE user_episodes (
    watch_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    episode_id INT NOT NULL REFERENCES episodes (episode_id) ON DELETE CASCADE,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, episode_id)
);