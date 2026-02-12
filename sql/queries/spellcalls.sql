-- name: GetSpell :one
SELECT name, range, material, ritual, duration, concentration, casting_time, "level", attack_type, school, "desc", higher_level, components, damage
FROM spells
WHERE "index" = $1;

-- name: GetSpellsLevel :many
SELECT name, url
FROM spells
WHERE "level" = $1;

-- name: GetSpellsClass :many
SELECT s.name, s.url
FROM spells AS s
JOIN spell_classes AS sc ON sc.spell_id = s.id
JOIN classes AS c ON c.id = sc.class_id
WHERE c."index" = $1;

-- name: GetSpellsSubclass :many
SELECT s.name, s.url
FROM spells AS s
JOIN spell_subclasses AS ss ON ss.spell_id = s.id
JOIN subclasses AS sc ON sc.id = ss.subclass_id
WHERE sc."index" = $1;

-- name: GetSpellsConcentration :many
SELECT name, url
FROM spells
WHERE concentration = 't';
