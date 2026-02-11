-- +goose Up
CREATE TABLE subclasses (
    id SERIAL PRIMARY KEY,
    index TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    url TEXT
);

CREATE TABLE spell_subclasses (
    spell_id INT REFERENCES spells(id),
    subclass_id INT REFERENCES subclasses(id),
    PRIMARY KEY (spell_id, subclass_id)
);

-- +goose Down
DROP TABLE subclasses;
DROP TABLE spell_subclasses;