-- +goose Up
CREATE TABLE characters (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    class_levels JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE characters_spells (
    spell_id INT REFERENCES spells(id) ON DELETE CASCADE,
    char_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    PRIMARY KEY (spell_id, char_id)
);

CREATE TABLE spell_slots (
    caster_type TEXT NOT NULL,
    caster_level INT NOT NULL,
    PRIMARY KEY (caster_type, caster_level),
    slots JSONB NOT NULL
);

-- +goose Down
DROP TABLE characters_spells;
DROP TABLE characters;
DROP TABLE spell_slots;