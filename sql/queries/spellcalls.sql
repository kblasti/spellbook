-- name: GetSpell :one
SELECT "index", name, range, material, ritual, duration, concentration, casting_time, "level", attack_type, school, "desc", higher_level, components, damage
FROM spells
WHERE "index" = $1;

-- name: GetSpellID :one
SELECT id
FROM spells
WHERE "index" = $1;

-- name: GetSpellsLevel :many
SELECT "index", name, level, url
FROM spells
WHERE "level" = $1;

-- name: GetSpellsClass :many
SELECT s."index", s.name, s.ritual, s.concentration, s.level, s.url
FROM spells AS s
JOIN spell_classes AS sc ON sc.spell_id = s.id
JOIN classes AS c ON c.id = sc.class_id
WHERE c."index" = $1
ORDER BY s.level, s.name;

-- name: GetSpellsSubclass :many
SELECT s."index", s.name, s.ritual, s.concentration, s.level, s.url
FROM spells AS s
JOIN spell_subclasses AS ss ON ss.spell_id = s.id
JOIN subclasses AS sc ON sc.id = ss.subclass_id
WHERE sc."index" = $1
ORDER BY s.level, s.name;

-- name: GetSpellsConcentration :many
SELECT "index", name, level, url
FROM spells
WHERE concentration = 't'
ORDER BY level, name;

-- name: UpdateSpell :one
UPDATE spells
SET name = $1, range = $2, material = $3, ritual = $4, duration = $5, concentration = $6, casting_time = $7, "level" = $8, attack_type = $9, school = $10, "desc" = $11, higher_level = $12, components = $13, damage = $14, updated_at = NOW()
WHERE "index" =  $15
RETURNING "index", name, range, material, ritual, duration, concentration, casting_time, "level", attack_type, school, "desc", higher_level, components, damage;

-- name: GetSpellsRitual :many
SELECT "index", name, level, url
FROM spells
WHERE ritual = 't'
ORDER BY level, name;

-- name: GetAllSpells :many
SELECT "index", name, ritual, concentration, level, url
FROM spells;