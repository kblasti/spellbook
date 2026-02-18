import React, { useState, useEffect } from "react";
import { login, getCharacters, createUser, deleteCharacter, updateUser, deleteUser, deleteCharacterSpell } from "./api";
import CharacterView from "./CharacterView";
import CreateCharacterForm from "./CreateCharacterForm";
import Layout from "./Layout";
import "./App.css";

function App() {
  const [userToken, setUserToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [error, setError] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);

      if (data.token) {
        localStorage.setItem("token", data.token);
        setUserToken(data.token);
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError("Login error");
    }
  }


  async function handleCreateAccount(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await createUser(email, password);

      if (data.token) {
        localStorage.setItem("token", data.token);
        setUserToken(data.token);
        return;
      }

      setIsCreatingAccount(false);
    } catch (err) {
      setError("Account creation failed");
    }
  }

  async function handleDeleteUser(passwordConfirmation) {
    try {
      await deleteUser(passwordConfirmation);

      localStorage.removeItem("token");
      setUserToken("");
      setEmail("");
      setPassword("");
      setCharacters([]);
      setSelectedCharacter(null);

      alert("Your account has been deleted");

    } catch (err) {
      console.error(err);
      alert("Failed to delete account");
    }
  }

  async function handleUpdateUser(newEmail, newPassword) {
    try {
      const data = await updateUser(newEmail, newPassword);

      if (data.token) {
        localStorage.setItem("token", data.token);
        setUserToken(data.token);
      }

      setEmail(newEmail);

      alert("Account updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update account");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUserToken("");
    setEmail("");
    setPassword("");
    setCharacters([]);
    setSelectedCharacter(null);
  }

  async function handleDeleteCharacter() {
    if (!selectedCharacter) return;

    try {
      await deleteCharacter(selectedCharacter.id);

      setCharacters(prev => {
        const updated = prev.filter(c => c.id !== selectedCharacter.id);

        // Pick the next character if any exist
        if (updated.length > 0) {
          setSelectedCharacter(updated[0]);
        } else {
          setSelectedCharacter(null);
        }

        return updated;
      });

    } catch (err) {
      console.error("Failed to delete character", err);
    }
  }

  async function handleRemoveSpell(characterId, spellIndex) {
    try {
      await deleteCharacterSpell(characterId, spellIndex);

      setCharacters(prev =>
        prev.map(c =>
          c.id === characterId
            ? { ...c, spells: (c.spells || []).filter(s => s.index !== spellIndex) }
            : c
        )
      );

      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(prev => ({
          ...prev,
          spells: (prev.spells || []).filter(s => s.index !== spellIndex)
        }));
      }

    } catch (err) {
      console.error("Failed to remove spell:", err);
    }
  }

  function normalizeCharacter(c) {
    return {
      id: c.id || c.id,
      name: c.name || c.Name,
      class_levels: { ...(c.class_levels || c.ClassLevels || {}) },
    };
  }

  useEffect(() => {
    if (!userToken) return;

    (async () => {
      try {
        const chars = await getCharacters();
        console.log("RAW CHARACTERS FROM BACKEND:", chars);
        setCharacters(chars.map(normalizeCharacter));

        // Only set selectedCharacter if it's null
        if (!selectedCharacter && chars.length > 0) {
          setSelectedCharacter(chars[0]);
        }

      } catch (err) {
        console.error(err);
      }
    })();
  }, [userToken]);

  if (!userToken) {
    return (
      <Layout 
        user={email}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onLogout={handleLogout}
      >
      <div className="app">
        {!isCreatingAccount ? (
          <>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div>
                <label>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button type="submit">Login</button>
            </form>

            <p>
              Don’t have an account?{" "}
              <button onClick={() => setIsCreatingAccount(true)}>
                Create one
              </button>
            </p>
            <p> This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. </p>
            {error && <p className="error">{error}</p>}
          </>
        ) : (
          <>
            <h2>Create Account</h2>
            <form onSubmit={handleCreateAccount}>
              <div>
                <label>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button type="submit">Create Account</button>
            </form>

            <p>
              Already have an account?{" "}
              <button onClick={() => setIsCreatingAccount(false)}>
                Log in
              </button>
            </p>

            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
      </Layout>
    );
  }


  return (
  <Layout 
    user={email}
    onUpdateUser={handleUpdateUser}
    onDeleteUser={handleDeleteUser}
    onLogout={handleLogout}
  >
  <div className="app">
    {showCreateCharacter ? (
      <CreateCharacterForm
        onCreated={(newChar) => {
          console.log("NEW CHARACTER FROM BACKEND:", newChar);
          const normalized = {
            id: newChar.id,
            name: newChar.name,
            class_levels: { ...newChar.class_levels }
          };

          setCharacters(prev => [...prev, normalized]);
          setSelectedCharacter(normalized);
          setShowCreateCharacter(false);
        }}
        onCancel={() => setShowCreateCharacter(false)}
      />
    ) : (
      <>
        <div>
          {characters.length > 0 && (
            <>
              <label>Character: </label>
              <select
                value={selectedCharacter?.id || ""}
                onChange={e =>
                  setSelectedCharacter(
                    characters.find(c => c.id === e.target.value)
                  )
                }
              >
                {characters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <button onClick={handleDeleteCharacter}>
          Delete Character
        </button>

        <button onClick={() => setShowCreateCharacter(true)}>
          Create New Character
        </button>
        
        {selectedCharacter && (
          <CharacterView
            character={selectedCharacter}
            onRemoveSpell={handleRemoveSpell}
            setCharacter={setSelectedCharacter}
            updateCharacterInList={(updated) => {
              console.log("UPDATED CHARACTER:", updated);
              setCharacters(prev =>
                prev.map(c =>
                  c.id === updated.id ? { ...updated, class_levels: { ...updated.class_levels } } : c
                )
              )
            }}
          />
        )}
      </>
    )}
  </div>
  </Layout>
  );

}

export default App;
