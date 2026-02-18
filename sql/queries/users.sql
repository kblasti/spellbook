-- name: CreateUser :one
INSERT INTO users (id, created_at, updated_at, email, hashed_password, "role")
VALUES (
    gen_random_uuid(),
    NOW(),
    NOW(),
    $1,
    $2,
    $3
)
RETURNING id, created_at, updated_at, email, "role";

-- name: DeleteUsers :exec
DELETE FROM users;

-- name: UserLogin :one
SELECT id, created_at, updated_at, email, hashed_password, "role"
FROM users
WHERE email = $1;

-- name: UpdateUser :one
UPDATE users
SET email = $1, hashed_password = $2, updated_at = NOW(), "role" = $3
WHERE id = $4
RETURNING id, created_at, updated_at, email;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: GetHashedPassword :one
SELECT id, hashed_password
FROM users
WHERE id = $1;