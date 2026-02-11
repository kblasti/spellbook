-- +goose Up
CREATE TABLE spells (
    id SERIAL PRIMARY KEY,
    "index" TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    range TEXT,
    material TEXT,
    ritual BOOLEAN,
    duration TEXT,
    concentration BOOLEAN,
    casting_time TEXT,
    "level" INT,
    attack_type TEXT,
    school JSONB,          -- nested object
    "desc" TEXT[],           -- array of strings
    higher_level TEXT[],   -- array of strings
    components TEXT[],     -- array of strings
    damage JSONB,          -- entire damage array
    url TEXT NOT NULL,
    updated_at TIMESTAMP
);

-- +goose Down
DROP TABLE spells;

