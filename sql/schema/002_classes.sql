-- +goose Up
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    index TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    url TEXT
);

CREATE TABLE spell_classes (
    spell_id INT REFERENCES spells(id),
    class_id INT REFERENCES classes(id),
    PRIMARY KEY (spell_id, class_id)
);

-- +goose Down
DROP TABLE classes;
DROP TABLE spell_classes;