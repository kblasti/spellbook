package main

import (
  "net/http"
  "os"
  "github.com/joho/godotenv"
  "github.com/kblasti/spellbook/internal/database"
  "github.com/kblasti/spellbook/internal/api"
  "database/sql"
  "log"
)

func main() {
  godotenv.Load()
  dbURL := os.Getenv("POSTGRES_DBURL")
  db, err := sql.Open("postgres", dbURL)
  if err != nil {
      log.Fatal(err)
  }
  dbQueries := database.New(db)
  cfg := &api.APIConfig{
    DB:     dbQueries,
  }
  port := "8880"
  filepathRoot:= "/api/"
  mux := http.NewServeMux()
  mux.Handle(filepathRoot, http.StripPrefix("/api", http.FileServer(http.Dir("."))))

  mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "text/plain; charset=utf-8")
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK\n"))
    })
  mux.HandleFunc("GET /spells/{index}", cfg.HandlerGetSpell)
  mux.HandleFunc("GET /classes/{class}", cfg.HandlerGetSpellsClass)
  mux.HandleFunc("GET /subclasses/{subclass}", cfg.HandlerGetSpellsSubclass)
  mux.HandleFunc("GET /spells/levels/{level}", cfg.HandlerGetSpellsLevel)
  mux.HandleFunc("GET /spells/concentration", cfg.HandlerGetSpellsConcentration)

  srv := &http.Server{
        Addr:    ":" + port,
        Handler: mux,
    }  

  log.Printf("Serving files from %s on port: %s\n", filepathRoot, port)
  log.Fatal(srv.ListenAndServe())
}