import React, { useEffect, useState } from "react";
import { getCharacterSlots, getCharacterSpells, addSpellToCharacter, getSpellDetails, getAllSpells, getSpellsByClass, getSpellsBySubclass, updateCharacterLevels } from "./api";

function CharacterView({ character, setCharacter, updateCharacterInList, onRemoveSpell }) {
  const [fullCasterSlots, setFullCasterSlots] = useState({});
  const [warlockSlots, setWarlockSlots] = useState({});
  const [spells, setSpells] = useState([]);
  const [selectedSlotLevel, setSelectedSlotLevel] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const castableSpells = selectedSlotLevel
    ? spells.filter(spell => selectedSlotLevel.level >= spell.level)
    : [];
  const [expandedSpell, setExpandedSpell] = useState(null);
  const [spellDetails, setSpellDetails] = useState({});
  const [allSpells, setAllSpells] = useState([]);
  const [filterLevel, setFilterLevel] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubclass, setFilterSubclass] = useState("");
  const [filterConcentration, setFilterConcentration] = useState("");
  const [filterRitual, setFilterRitual] = useState("");
  const [isEditingLevels, setIsEditingLevels] = useState(false);
  const [editLevels, setEditLevels] = useState({ ...character.class_levels });
  const [newClassName, setNewClassName] = useState("");
  const [newClassLevel, setNewClassLevel] = useState(1);
  const [spellbookMode, setSpellbookMode] = useState("level");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(
    selectedSlotLevel ? "spells" : "placeholder"
  );
  const [storedSlotLevel, setStoredSlotLevel] = useState(selectedSlotLevel);
  const [isSpellbookFadingOut, setIsSpellbookFadingOut] = useState(false);
  const [spellbookContent, setSpellbookContent] = useState(spellbookMode);

  // Saved levels under edit levels button changes on character switch
  useEffect(() => { 
    setEditLevels({ ...character.class_levels }); 
  }, [character.id]);
  
    // Displayed spell slots change on switching characters
    useEffect(() => {
        (async () => {
            const slotData = await getCharacterSlots(character.id);

            const full = {};
            if (slotData.full_caster_slots) {
            Object.entries(slotData.full_caster_slots).forEach(([level, max]) => {
                full[level] = { max, used: 0 };
            });
            }

            const warlock = {};
            if (slotData.warlock_slots) {
            Object.entries(slotData.warlock_slots).forEach(([level, max]) => {
                warlock[level] = { max, used: 0 };
            });
            }

            setFullCasterSlots(full);
            setWarlockSlots(warlock);
        })();
    }, [character.id, JSON.stringify(character.class_levels)]);

    // Known spells swap on character change
    useEffect(() => {
        (async () => {
            const known = await getCharacterSpells(character.id);
            setSpells(known);
        })();
    }, [character.id, character.spells]);

    // Fetch all spells on start
    useEffect(() => {
        (async () => {
            const all = await getAllSpells();
            setAllSpells(all);
            setSearchResults(all);
        })();
    }, []);

    // Filters for spell searching
    useEffect(() => {
        if (allSpells.length === 0) return;

        (async () => {
            await applyFilters();
        })();
    }, [
        search,
        filterLevel,
        filterClass,
        filterSubclass,
        filterConcentration,
        filterRitual,
        allSpells
    ]);

    // Fadeout animation between spell slot levels and placeholder
    useEffect(() => {
        const next = selectedSlotLevel ? "spells" : "placeholder";

        if (next !== currentPanel) {
            setIsFadingOut(true);

            setTimeout(() => {
            setCurrentPanel(next);

            setStoredSlotLevel(selectedSlotLevel);

            setIsFadingOut(false);
            }, 250);
        }
    }, [selectedSlotLevel]);

    // Fade out animation for full spellbook and spells known
    useEffect(() => {
        if (spellbookMode !== spellbookContent) {
            setIsSpellbookFadingOut(true);

            setTimeout(() => {
            setSpellbookContent(spellbookMode);
            setIsSpellbookFadingOut(false);
            }, 250);
        }
    }, [spellbookMode]);

    async function handleSaveLevels() {
        try {
            await updateCharacterLevels(character.id, character.name, editLevels);

            const updated = {
            ...character,
            class_levels: { ...editLevels }
            };

            setCharacter(updated);
            updateCharacterInList(updated);
            setIsEditingLevels(false);

        } catch (err) {
            console.error("Failed to update character levels", err);
        }
    }

    function handleAddClass() {
        if (!newClassName.trim()) return;

        setEditLevels(prev => ({
            ...prev,
            [newClassName]: newClassLevel
        }));

        // Reset inputs
        setNewClassName("");
        setNewClassLevel(1);
    }

    async function applyFilters() {
        if (allSpells.length === 0) return;

        let filtered = [...allSpells];

        // 1. Frontend filters first
        if (search.trim()) {
            const lower = search.trim().toLowerCase();
            filtered = filtered.filter(spell =>
            spell.name.toLowerCase().includes(lower)
            );
        }

        if (filterLevel !== "") {
            filtered = filtered.filter(
            spell => spell.level === Number(filterLevel)
            );
        }

        if (filterConcentration === "yes") {
            filtered = filtered.filter(spell => spell.concentration === true);
        }

        if (filterRitual === "yes") {
            filtered = filtered.filter(spell => spell.ritual === true);
        }

        // 2. Backend filters (class/subclass)
        if (filterClass) {
            const classResults = await getSpellsByClass(filterClass);
            const allowedIndexes = new Set(classResults.map(s => s.index));
            filtered = filtered.filter(spell => allowedIndexes.has(spell.index));
        }

        if (filterSubclass) {
            const subclassResults = await getSpellsBySubclass(filterSubclass);
            const allowedIndexes = new Set(subclassResults.map(s => s.index));
            filtered = filtered.filter(spell => allowedIndexes.has(spell.index));
        }

        setSearchResults(filtered);
    }

    function selectSlot(type, level) {
        setSelectedSlotLevel({ type, level });
    }

    async function toggleSpellDetails(spell) {
        console.log("Fetching details for:", spell.index);
        if (expandedSpell === spell.index) {
            setExpandedSpell(null);
            return;
        }

        if (!spellDetails[spell.index]) {
            const details = await getSpellDetails(spell.index);
            setSpellDetails(prev => ({ ...prev, [spell.index]: details }));
        }

        setExpandedSpell(spell.index);
    }

    function castSpell(spell) {
        const { type, level } = selectedSlotLevel;

        if (level === 0) {
            setSelectedSlotLevel(null);
            return;
        } else if (type === "full") {
            setFullCasterSlots(prev => {
            const s = { ...prev };
            s[level] = { ...s[level], used: s[level].used + 1 };
            return s;
            });
        } else {
            setWarlockSlots(prev => {
            const s = { ...prev };
            s[level] = { ...s[level], used: s[level].used + 1 };
            return s;
            });
        }

        // Clear selection after casting
        setSelectedSlotLevel(null);
    }

    function shortRest() {
    // Full casters: no change
    setFullCasterSlots(prev => ({ ...prev }));

    // Warlocks: reset used to 0
    setWarlockSlots(prev => {
        const s = { ...prev };
        Object.keys(s).forEach(level => {
        s[level] = { ...s[level], used: 0 };
        });
        return s;
    });
    }

    function longRest() {
    setFullCasterSlots(prev => {
        const s = { ...prev };
        Object.keys(s).forEach(level => {
        s[level] = { ...s[level], used: 0 };
        });
        return s;
    });

    setWarlockSlots(prev => {
        const s = { ...prev };
        Object.keys(s).forEach(level => {
        s[level] = { ...s[level], used: 0 };
        });
        return s;
    });
    }

    async function addSpellToCharacterHandler(spell) {
        const index = spell.index;

        console.log("Adding spell:", spell);
        console.log("Using index:", index);

        await addSpellToCharacter(character.id, index);

        const updated = await getCharacterSpells(character.id);
        setSpells(updated);
    }

  return (
    <div className="character-view two-column">
        {/* LEFT SIDE */}
        <div className="left-panel">
            {isEditingLevels ? (
                <div className="edit-levels">

                    {/* Character Name */} 
                    <div className="edit-name"> 
                        <label>Character Name</label> 
                        <input 
                            type="text" 
                            value={character.name} 
                            onChange={e => 
                                setCharacter(prev => ({ ...prev, name: e.target.value })) 
                            } 
                        /> 
                    </div>

                    {/* Existing class level inputs */}
                    {Object.entries(editLevels).map(([cls, lvl]) => (
                    <div key={cls}>
                        <label>{cls}</label>
                        <input
                        type="number"
                        min="1"
                        max="20"
                        value={lvl}
                        onChange={e =>
                            setEditLevels(prev => ({
                            ...prev,
                            [cls]: Number(e.target.value)
                            }))
                        }
                        />
                    </div>
                    ))}

                    {/* Add New Class */}
                    <div className="add-class">
                    <h4>Add New Class</h4>

                    <input
                        type="text"
                        placeholder="Class name (e.g., fighter)"
                        value={newClassName}
                        onChange={e => setNewClassName(e.target.value.toLowerCase())}
                    />

                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={newClassLevel}
                        onChange={e => setNewClassLevel(Number(e.target.value))}
                    />

                    <button onClick={handleAddClass}>Add Class</button>
                    </div>

                    <button onClick={handleSaveLevels}>Save</button>
                    <button onClick={() => setIsEditingLevels(false)}>Cancel</button>
                </div>
            ) : (
                <button onClick={() => setIsEditingLevels(true)}>Edit Levels</button>
        )}
        <div className="slots">
            <h3>Spell Slots</h3>

            <div className="slot-row">
                <button onClick={() => {
                    setSpellbookMode("level");
                    selectSlot("full", 0);
                }}>
                    Cantrips
                </button>

                <button
                    onClick={() =>
                        setSpellbookMode(prev =>
                        prev === "known" ? "level" : "known"
                        )
                    }
                >
                    {spellbookMode === "known" ? "Back to Spellbook" : "Known Spells"}
                </button>
            </div>

            <div className="slot-row">
            {Object.entries(fullCasterSlots).map(([level, info]) => (
                <button
                key={level}
                onClick={() => selectSlot("full", Number(level))}
                >
                Lv {level}: {info.max - info.used}/{info.max}
                </button>
            ))}
            </div>

            {Object.keys(warlockSlots).length > 0 && (
            <>
                <h3>Warlock Slots (Pact Magic)</h3>

                <div className="slot-row">
                {Object.entries(warlockSlots).map(([level, info]) => (
                    <button
                    key={level}
                    onClick={() => selectSlot("warlock", Number(level))}
                    >
                    Lv {level}: {info.max - info.used}/{info.max}
                    </button>
                ))}
                </div>
            </>
            )}

            <button onClick={shortRest}>Short Rest</button>
            <button onClick={longRest}>Long Rest</button>
        </div>
        <p> This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. </p>
        </div>

        <div className="right-panel">

            {/* LEFT SIDE OF RIGHT PANEL — Castable spells */}
            <div className="castable-panel">
                <div className={`fade-panel ${isFadingOut ? "fade-out" : "fade-in"}`}>
                    {currentPanel === "spells" ?  (
                    <div className="spells-for-slot spellbook-frame">
                        <h3>Spells for Slot Level {storedSlotLevel?.level}</h3>

                        <button
                        className="rune-button"
                        onClick={() => setSelectedSlotLevel(null)}
                        >
                        Cancel
                        </button>

                        {castableSpells
                            .filter(spell => 
                                storedSlotLevel?.level === 0
                                ? true 
                                : spell.level > 0
                            ) 
                            .map(spell => (
                        <div key={spell.index} className="spell-block">
                            <div
                            className={`spell-name`}
                            onClick={() => toggleSpellDetails(spell)}
                            >
                            {spell.name} (Lv {spell.level})
                            </div>

                            <button
                                className="arcane-button"
                                onClick={() => castSpell(spell)}
                            >
                                Cast Spell
                            </button>

                            {expandedSpell === spell.index &&
                                spellDetails[spell.index] && (
                                <div
                                    className={`spell-details-wrapper ${
                                        expandedSpell === spell.index ? "open" : ""
                                    }`}
                                    >
                                    <div className="spell-details">
                                        {spellDetails[spell.index] && (
                                        <>
                                            <p><strong>Range:</strong> {spellDetails[spell.index].range}</p>
                                            <p><strong>Casting Time:</strong> {spellDetails[spell.index].casting_time}</p>
                                            <p><strong>Duration:</strong> {spellDetails[spell.index].duration}</p>
                                            <p><strong>Components:</strong> {spellDetails[spell.index].components?.join(", ")}</p>

                                            {spellDetails[spell.index].material && (
                                            <p><strong>Material:</strong> {spellDetails[spell.index].material}</p>
                                            )}

                                            <p><strong>Description:</strong></p>
                                            {spellDetails[spell.index].desc?.map((line, i) => (
                                            <p key={i}>{line}</p>
                                            ))}

                                            {spellDetails[spell.index].higher_level?.length > 0 && (
                                            <>
                                                <p><strong>At Higher Levels:</strong></p>
                                                {spellDetails[spell.index].higher_level.map((line, i) => (
                                                <p key={i}>{line}</p>
                                                ))}
                                            </>
                                            )}
                                        </>
                                        )}
                                    </div>
                                </div>
                                )}
                        </div>
                        ))}
                    </div>
                    ) : (
                        <div className="spellbook-placeholder spellbook-frame"> 
                            <h2>Select a Spell Slot</h2> 
                            <p>Choose a level or view your known spells to begin.</p> 
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE OF RIGHT PANEL — Full spellbook */}
            <div className="spellbook-panel">
                <h3>Spellbook</h3>
                
                <div className="spellbook-filters">
                    {/* Level filter */}
                    <select
                        value={filterLevel}
                        onChange={e => setFilterLevel(e.target.value)}
                    >
                        <option value="">All Levels</option>
                        <option value="0">Cantrips</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                        <option value="5">Level 5</option>
                        <option value="6">Level 6</option>
                        <option value="7">Level 7</option>
                        <option value="8">Level 8</option>
                        <option value="9">Level 9</option>
                    </select>

                    {/* Class Filter */} 
                    <select value={filterClass} onChange={e => setFilterClass(e.target.value)}> 
                        <option value="">All Classes</option> 
                        <option value="bard">Bard</option> 
                        <option value="cleric">Cleric</option> 
                        <option value="druid">Druid</option> 
                        <option value="paladin">Paladin</option> 
                        <option value="ranger">Ranger</option> 
                        <option value="sorcerer">Sorcerer</option> 
                        <option value="warlock">Warlock</option> 
                        <option value="wizard">Wizard</option> 
                    </select> 

                    {/* Subclass Filter */}
                    <select value={filterSubclass} onChange={e => setFilterSubclass(e.target.value)}>
                        <option value="">All Subclasses</option>
                        <option value="land">Land</option>
                        <option value="life">Life</option>
                        <option value="devotion">Devotion</option>
                        <option value="draconic">Draconic</option>
                        <option value="fiend">Fiend</option>
                    </select>

                    {/* Concentration */} 
                    <label> 
                        <input 
                            type="checkbox" 
                            checked={filterConcentration === "yes"} 
                            onChange={e => setFilterConcentration(e.target.checked ? "yes" : "")} 
                        /> 
                        Concentration Only 
                    </label> 
                    
                    {/* Ritual */} 
                    <label> 
                        <input 
                            type="checkbox" 
                            checked={filterRitual === "yes"} 
                            onChange={e => setFilterRitual(e.target.checked ? "yes" : "")} 
                        /> 
                        Ritual Only 
                    </label>

                    {/* Name search */}
                    <input
                        type="text"
                        placeholder="Search spells..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    </div>

                {/* Results will go here */}
                    <div className={`fade-panel ${isSpellbookFadingOut ? "fade-out" : "fade-in"}`}> 
                        {spellbookContent === "known" ? ( 
                            <div className="known-spells spellbook-frame"> 
                                {spells.map(spell => ( 
                                    <div key={spell.index} className="spell-result"> 
                                        <strong>{spell.name}</strong> (Lv {spell.level}) 
                                        <button className="remove-button" onClick={() => onRemoveSpell(character.id, spell.index)}>Remove</button> 
                                    </div> 
                                ))} 
                            </div> 
                        ) : (
                            <div className="full-spellbook spellbook-frame"> 
                                {searchResults.map(spell => ( 
                                    <div key={spell.index} className="spell-result"> 
                                        <strong>{spell.name}</strong> (Lv {spell.level}) 
                                        <button onClick={() => addSpellToCharacterHandler(spell)}>Add</button> 
                                    </div> 
                                ))} 
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CharacterView;
