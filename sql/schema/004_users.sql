-- +goose Up
CREATE TABLE users (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL DEFAULT 'unset',
    "role" TEXT NOT NULL DEFAULT 'basic_user'
);

-- +goose Down
DROP TABLE users;