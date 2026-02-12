package api

import (
	"net/http"
	"encoding/json"
	"github.com/kblasti/spellbook/internal/database"
)

type APIConfig struct {
  DB        *database.Queries
}

func respondWithError(w http.ResponseWriter, code int, msg string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    payload := map[string]string{
        "error": msg,
    }
    data, err := json.Marshal(payload)
    if err != nil {
        http.Error(w, "Something went wrong", http.StatusInternalServerError)
        return
    }

    w.Write(data)
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    data, err := json.Marshal(payload)
    if err != nil {
        respondWithError(w, 500, "Something went wrong")
        return
    }

    w.Write(data)
}
