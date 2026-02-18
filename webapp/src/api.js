const API_BASE = "http://localhost:8880";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res = await fetch(API_BASE + path, { ...options, headers });

  // If token expired, try refresh
  if (res.status === 401) {
    try {
      const refreshRes = await fetch(API_BASE + "/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const data = await refreshRes.json();

      // Save new token
      localStorage.setItem("token", data.token);

      // Retry original request with new token
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${data.token}`
      };

      res = await fetch(API_BASE + path, { ...options, headers: retryHeaders });

    } catch (err) {
      // Refresh failed → force logout
      localStorage.removeItem("token");
      throw new Error("Session expired");
    }
  }

  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}


export function login(email, password) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCharacters() {
  return request("/api/characters");
}

export function getCharacterSlots(id) {
  return request("/api/characters/slots", {
    method: "POST",
    body: JSON.stringify({ id })
  });
}

export function getCharacterSpells(id) {
  return request("/api/characters/spells/list", {
    method: "POST",
    body: JSON.stringify({ id })
  });
}

export function createUser(email, password) {
  return request("/api/users", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function createCharacter(character) {
  return request("/api/characters", {
    method: "POST",
    body: JSON.stringify(character),
  });
}

export async function deleteCharacter(id) {
  return request("/api/characters/delete", {
    method: "POST",
    body: JSON.stringify({ id })
  });
}

export function addSpellToCharacter(id, spellIndex) {
  return request("/api/characters/spells", {
    method: "POST",
    body: JSON.stringify({
      id,
      index: spellIndex
    })
  });
}

export async function getSpellDetails(index) {
  console.log("GET", `/api/spells/${index}`);
  return request(`/api/spells/${index}`);
}

export async function getAllSpells() {
  const res = await fetch("/api/spells");
  return res.json();
}

export function getSpellsByClass(className) {
  return request(`/api/classes/${className}`);
}

export function getSpellsBySubclass(subclassName) {
  return request(`/api/subclasses/${subclassName}`);
}

function stringifyKeys(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[String(k)] = v;
  }
  return out;
}

export async function updateCharacterLevels(id, name, classLevels) {
  return request("/api/characters", {
    method: "PUT",
    body: JSON.stringify({
      id,
      name,
      class_levels: stringifyKeys(classLevels)
    })
  });
}

export async function updateUser(email, password) {
  return request("/api/users", {
    method: "PUT",
    body: JSON.stringify({ email, password })
  });
}

export async function deleteUser(password) {
  return request("/api/users/delete", {
    method: "POST",
    body: JSON.stringify({ password })
  });
}

export async function refreshToken() {
  return request("/api/refresh", {
    method: "POST"
  });
}

export async function deleteCharacterSpell(characterId, spellIndex) {
  return request("/api/characters/spells/delete", {
    method: "POST",
    body: JSON.stringify({
      id: characterId,
      index: spellIndex
    })
  });
}
