-- name: CreateCharacter :one
INSERT INTO characters (id, name, class_levels, created_at, updated_at, user_id)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    NOW(),
    NOW(),
    $3
)
RETURNING id, name, class_levels;

-- name: UpdateCharacter :one
UPDATE characters
SET name = $1, class_levels = $2, updated_at = NOW()
WHERE id = $3
RETURNING id, name, class_levels;

-- name: DeleteCharacter :exec
DELETE FROM characters
WHERE id = $1 AND user_id = $2;

-- name: GetUserCharacters :many
SELECT id, name, class_levels
FROM characters
WHERE user_id = $1;

-- name: AddCharacterSpell :one
INSERT INTO characters_spells (spell_id, char_id)
VALUES (
    $1,
    $2
)
RETURNING spell_id, char_id;

-- name: RemoveCharacterSpell :exec
DELETE FROM characters_spells
WHERE spell_id = $1 AND char_id = $2;

-- name: GetCasterLevel :one
SELECT 
    FLOOR( 
        COALESCE((class_levels->>'wizard')::numeric, 0) * 1 + 
        COALESCE((class_levels->>'cleric')::numeric, 0) * 1 + 
        COALESCE((class_levels->>'druid')::numeric, 0) * 1 + 
        COALESCE((class_levels->>'bard')::numeric, 0) * 1 + 
        COALESCE((class_levels->>'sorcerer')::numeric, 0) * 1 + 
        COALESCE((class_levels->>'paladin')::numeric, 0) * 0.5 + 
        COALESCE((class_levels->>'ranger')::numeric, 0) * 0.5
    ) AS effective_caster_level 
FROM characters 
WHERE id = $1;

-- name: GetSpellSlotsMax :one 
SELECT slots 
FROM spell_slots 
WHERE caster_type = $1 AND caster_level = $2;

-- name: GetClassLevels :one
SELECT class_levels
FROM characters
WHERE id = $1;

-- name: GetCharacterSpells :many
SELECT s."index", s.name, s.level, s.url
FROM spells as s
JOIN characters_spells AS cs ON cs.spell_id = s.id
JOIN characters AS c ON c.id = cs.char_id
WHERE c.id = $1
ORDER BY s.level, s.name;