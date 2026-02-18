import React, { useState } from "react";
import { createCharacter } from "./api";

function CreateCharacterForm({ onCreated, onCancel }) {
  const [name, setName] = useState("");
  const [classLevels, setClassLevels] = useState([
    { className: "", level: 1 }
  ]);
  const [error, setError] = useState("");

  function updateClassLevel(index, field, value) {
    setClassLevels(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addClass() {
    setClassLevels(prev => [...prev, { className: "", level: 1 }]);
  }

  function removeClass(index) {
    setClassLevels(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Convert array → object for API
    const class_levels = {};
    for (const entry of classLevels) {
      if (entry.className.trim() !== "") {
        class_levels[entry.className.toLowerCase()] = Number(entry.level);
      }
    }

    try {
      const newChar = await createCharacter({
        name,
        class_levels
      });

      onCreated(newChar);
    } catch (err) {
      setError("Failed to create character");
    }
  }

  return (
    <div className="create-character">
      <h2>Create Character</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <h3>Class Levels</h3>

        {classLevels.map((entry, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <input
              placeholder="Class (e.g., wizard)"
              value={entry.className}
              onChange={e => updateClassLevel(index, "className", e.target.value)}
            />
            <input
              type="number"
              min="1"
              max="20"
              value={entry.level}
              onChange={e => updateClassLevel(index, "level", e.target.value)}
            />
            {classLevels.length > 1 && (
              <button type="button" onClick={() => removeClass(index)}>
                Remove
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addClass}>
          Add Another Class
        </button>

        <br /><br />

        <button type="submit">Create</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default CreateCharacterForm;
