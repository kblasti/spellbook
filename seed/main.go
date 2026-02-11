package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"context"
	"strings"

	"github.com/kblasti/spellbook/internal/database"
	_ "github.com/lib/pq"
	"github.com/sqlc-dev/pqtype"
	"github.com/joho/godotenv"
)

type Config struct {
	DB *database.Queries
}

type Spell struct {
	Name          string   `json:"name"`
	Index         string   `json:"index"`
	Desc          []string `json:"desc"`
	HigherLevel   []string `json:"higher_level"`
	Range         string   `json:"range"`
	Components    []string `json:"components"`
	Material      string   `json:"material"`
	Ritual        bool     `json:"ritual"`
	Duration      string   `json:"duration"`
	Concentration bool     `json:"concentration"`
	CastingTime   string   `json:"casting_time"`
	Level         int      `json:"level"`
	AttackType    string   `json:"attack_type"`
	Damage        json.RawMessage `json:"damage"`
	School 		  json.RawMessage `json:"school"`
	Classes []struct {
		Name string `json:"name"`
	} `json:"classes"`
	Subclasses []struct {
		Name string `json:"name"`
	}  `json:"subclasses"`
	URL        string `json:"url"`
	UpdatedAt  any    `json:"updated_at"`
}

func main() {
	godotenv.Load("../.env")
	dbURL := os.Getenv("POSTGRES_DBURL")
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	dbQueries := database.New(db)
	cfg := &Config{ 
		DB:		dbQueries,
	}
	spellsJson, err := os.ReadFile("spells.json")
	if err != nil {
		log.Fatal(err)
	}

	var spells []Spell

	err = json.Unmarshal(spellsJson, &spells)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Decoded %v spells\n", len(spells))

	cachedClasses := make(map[string]interface{})
	cachedSubclasses := make(map[string]interface{})
	entries := 0

	for _, item := range spells {
		spellEntry, err := cfg.DB.CreateSpell(context.Background(), database.CreateSpellParams{
			Index:			item.Index,
			Name:			item.Name,
			Range:			sql.NullString{String: item.Range, Valid: true},
			Material:		sql.NullString{String: item.Material, Valid: true},
			Ritual:			sql.NullBool{Bool: item.Ritual, Valid: true},
			Duration:		sql.NullString{String: item.Duration, Valid: true},
			Concentration:	sql.NullBool{Bool: item.Concentration, Valid: true},
			CastingTime:	sql.NullString{String: item.CastingTime, Valid: true},
			Level:			sql.NullInt32{Int32: int32(item.Level), Valid: true},
			AttackType:		sql.NullString{String: item.AttackType, Valid: true},
			School:			pqtype.NullRawMessage{RawMessage: item.School, Valid: true},
			Desc:			item.Desc,
			HigherLevel:	item.HigherLevel,
			Components:		item.Components,
			Damage:			pqtype.NullRawMessage{RawMessage: item.Damage, Valid: true},
			Url:			item.URL,
		})
		if err != nil {
			log.Fatal(err)
		}

		for _, class := range item.Classes {
			if _, ok := cachedClasses[class.Name]; !ok {
				index := strings.ToLower(class.Name)
				classEntry, err := cfg.DB.AddClass(context.Background(), database.AddClassParams{
					Index:		index,
					Name:		class.Name,
					Url:		sql.NullString{String: "api/classes/" + index, Valid: true},
				})
				if err != nil {
					log.Fatal(err)
				}
				cachedClasses[class.Name] = classEntry.ID
			}
			classID := cachedClasses[class.Name]
			cint32ID := classID.(int32)
			_, err := cfg.DB.AddSpellClass(context.Background(), database.AddSpellClassParams{
				SpellID:		spellEntry.ID,
				ClassID:		cint32ID,
			})
			if err != nil {
				log.Fatal(err)
			}
		}

		if len(item.Subclasses) > 0 {
			for _, subclass := range item.Subclasses {
				if _, ok := cachedSubclasses[subclass.Name]; !ok {
					index := strings.ToLower(subclass.Name)
					subclassEntry, err := cfg.DB.AddSubclass(context.Background(), database.AddSubclassParams{
						Index:		index,
						Name:		subclass.Name,
						Url:		sql.NullString{String: "api/subclasses/" + index, Valid: true},
					})
					if err != nil {
						log.Fatal(err)
					}
					cachedSubclasses[subclass.Name] = subclassEntry.ID
				}
				subclassID := cachedSubclasses[subclass.Name]
				scint32ID := subclassID.(int32)
				_, err := cfg.DB.AddSpellSubclass(context.Background(), database.AddSpellSubclassParams{
					SpellID:		spellEntry.ID,
					SubclassID:		scint32ID,
				})
				if err != nil {
					log.Fatal(err)
				}
			}
		}

		entries += 1

	}

	output := fmt.Sprintf("Added %v entries to database\n", entries)
	fmt.Println(output)
}