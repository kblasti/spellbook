package api

import (
	"net/http"
	"database/sql"
	"encoding/json"
	"strconv"
)

type Spell struct {
	Name			string				`json:"name"`
	Range			string				`json:"range"`
	Material		string				`json:"material"`
	Ritual			bool				`json:"ritual"`
	Duration		string				`json:"duration"`
	Concentration	bool				`json:"concentration"`
	CastingTime		string				`json:"casting_time"`
	Level			int32				`json:"level"`
	AttackType		string				`json:"attack_type"`
	School			json.RawMessage		`json:"school"`
	Desc			[]string			`json:"desc"`
	HigherLevel		[]string			`json:"higher_level"`
	Components		[]string			`json:"components"`
	Damage			json.RawMessage		`json:"damage"`
}

type SpellNameUrl struct{
	Name			string				`json:"name"`
	Url				string				`json:"url"`
}

func (cfg *APIConfig) HandlerGetSpell(w http.ResponseWriter, r *http.Request) {
	index := r.PathValue("index")

	spell, err := cfg.DB.GetSpell(r.Context(), index)
	if err == sql.ErrNoRows {
		respondWithError(w, 404, "Spell not found")
		return
	}
	if err != nil {
		respondWithError(w, 500, err.Error())
		return
	}

	val := Spell{
		Name:			spell.Name,
		Range:			spell.Range.String,
		Material:		spell.Material.String,
		Ritual:			spell.Ritual.Bool,
		Duration:		spell.Duration.String,
		Concentration:	spell.Concentration.Bool,
		CastingTime:	spell.CastingTime.String,
		Level:			spell.Level.Int32,
		AttackType:		spell.AttackType.String,
		School:			spell.School.RawMessage,
		Desc:			spell.Desc,
		HigherLevel:	spell.HigherLevel,
		Components:		spell.Components,
		Damage:			spell.Damage.RawMessage,
	}

	respondWithJSON(w, 200, val)
	return
}

func (cfg *APIConfig) HandlerGetSpellsLevel(w http.ResponseWriter, r *http.Request) {
	level := r.PathValue("level")

	i64, err := strconv.ParseInt(level, 10, 32)
	if err != nil {
		respondWithError(w, 500, err.Error())
		return
	}

	i32 := int32(i64)

	nullLevel := sql.NullInt32{
		Int32:	i32,
		Valid:	true,
	}

	spells, err := cfg.DB.GetSpellsLevel(r.Context(), nullLevel)
	if err == sql.ErrNoRows {
		respondWithError(w, 404, "Spells not found")
		return
	}
	if err != nil {
		respondWithError(w, 500, err.Error())
		return
	}

	returnSlice := []SpellNameUrl{}

	for _, spell := range spells {
		val := SpellNameUrl{
			Name:		spell.Name,
			Url:		spell.Url,
		}
		returnSlice = append(returnSlice, val)
	}

	respondWithJSON(w, 200, returnSlice)
	return
}

func (cfg *APIConfig) HandlerGetSpellsConcentration(w http.ResponseWriter, r *http.Request) {
	spells, err := cfg.DB.GetSpellsConcentration(r.Context())
	if err == sql.ErrNoRows {
		respondWithError(w, 404, "Spells not found")
		return
	}
	if err != nil {
		respondWithError(w, 500, err.Error())
		return
	}

	returnSlice := []SpellNameUrl{}

	for _, spell := range spells {
		val := SpellNameUrl{
			Name:		spell.Name,
			Url:		spell.Url,
		}
		returnSlice = append(returnSlice, val)
	}

	respondWithJSON(w, 200, returnSlice)
	return
}

func (cfg *APIConfig) HandlerGetSpellsClass(w http.ResponseWriter, r *http.Request) {
	class := r.PathValue("class")

	spells, err := cfg.DB.GetSpellsClass(r.Context(), class)
	if err == sql.ErrNoRows {
		respondWithError(w, 404, "Spells not found")
		return
	}
	if err != nil {
		respondWithError(w, 500, err.Error())
		return
	}

	returnSlice := []SpellNameUrl{}

	for _, spell := range spells {
		val := SpellNameUrl{
			Name:		spell.Name,
			Url:		spell.Url,
		}
		returnSlice = append(returnSlice, val)
	}

	respondWithJSON(w, 200, returnSlice)
	return
}

func (cfg *APIConfig) HandlerGetSpellsSubclass(w http.ResponseWriter, r *http.Request) {
	subclass := r.PathValue("subclass")

	spells, err := cfg.DB.GetSpellsSubclass(r.Context(), subclass)
	if err == sql.ErrNoRows {
		respondWithError(w, 404, "Spells not found")
		return
	}
	if err != nil {
		respondWithError(w, 500, err.Error())
		return
	}

	returnSlice := []SpellNameUrl{}

	for _, spell := range spells {
		val := SpellNameUrl{
			Name:		spell.Name,
			Url:		spell.Url,
		}
		returnSlice = append(returnSlice, val)
	}

	respondWithJSON(w, 200, returnSlice)
	return
}