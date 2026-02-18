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
	spellsJson, err := os.ReadFile("data/spells.json")
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

	var SpellSlotTable = map[int]map[int]int{ 
		1: {1: 2}, 
		2: {1: 3}, 
		3: {1: 4, 2: 2}, 
		4: {1: 4, 2: 3}, 
		5: {1: 4, 2: 3, 3: 2}, 
		6: {1: 4, 2: 3, 3: 3}, 
		7: {1: 4, 2: 3, 3: 3, 4: 1}, 
		8: {1: 4, 2: 3, 3: 3, 4: 2}, 
		9: {1: 4, 2: 3, 3: 3, 4: 3, 5: 1}, 
		10: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2}, 
		11: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1}, 
		12: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1}, 
		13: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1}, 
		14: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1}, 
		15: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1}, 
		16: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1}, 
		17: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1}, 
		18: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1}, 
		19: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1}, 
		20: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1}, 
	}

	var WarlockSpellSlotTable = map[int]map[int]int{ 
		1: {1: 1}, 
		2: {1: 2}, 
		3: {2: 2}, 
		4: {2: 2}, 
		5: {3: 2}, 
		6: {3: 2}, 
		7: {4: 2}, 
		8: {4: 2}, 
		9: {5: 2}, 
		10: {5: 2}, 
		11: {5: 3}, 
		12: {5: 3}, 
		13: {5: 3}, 
		14: {5: 3}, 
		15: {5: 3}, 
		16: {5: 3}, 
		17: {5: 4}, 
		18: {5: 4}, 
		19: {5: 4}, 
		20: {5: 4}, 
	}

	slotsnumber := 0
	warlockslots := 0

	for i := 1; i <= 20; i++ { 
		jsonSlots, err := json.Marshal(SpellSlotTable[i]) 
		if err != nil { 
			log.Fatal(err) 
		} 
		_, err = cfg.DB.AddSpellSlots(context.Background(), database.AddSpellSlotsParams{ 
			CasterType: "full", 
			CasterLevel: int32(i), 
			Slots: jsonSlots, 
		}) 
		if err != nil { 
			log.Fatal(err) 
		}
		slotsnumber += 1
	}

	for i := 1; i <= 20; i++ { 
		jsonSlots, err := json.Marshal(WarlockSpellSlotTable[i]) 
		if err != nil { 
			log.Fatal(err) 
		} 
		_, err = cfg.DB.AddSpellSlots(context.Background(), database.AddSpellSlotsParams{ 
			CasterType: "warlock", 
			CasterLevel: int32(i), 
			Slots: jsonSlots, 
		}) 
		if err != nil { 
			log.Fatal(err) 
		} 
		warlockslots += 1
	}

	output := fmt.Sprintf("Added %v entries to database\nAdded %v slots to table\nAdded %v warlock slots\n", entries, slotsnumber, warlockslots)
	fmt.Println(output)
}