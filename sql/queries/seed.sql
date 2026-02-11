-- name: CreateSpell :one
INSERT INTO spells (index, name, range, material, ritual, duration, concentration, casting_time, level, attack_type, school, "desc", higher_level, components, damage, url, updated_at)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16,
    NOW()
)
RETURNING *;

-- name: AddClass :one
INSERT INTO classes (index, name, url)
VALUES (
    $1,
    $2,
    $3
)
RETURNING *;

-- name: AddSpellClass :one
INSERT INTO spell_classes (spell_id, class_id)
VALUES (
    $1,
    $2
)
RETURNING *;

-- name: AddSubclass :one
INSERT INTO subclasses (index, name, url)
VALUES (
    $1,
    $2,
    $3
)
RETURNING *;

-- name: AddSpellSubclass :one
INSERT INTO spell_subclasses (spell_id, subclass_id)
VALUES (
    $1,
    $2
)
RETURNING *;