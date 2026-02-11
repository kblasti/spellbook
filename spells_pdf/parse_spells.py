import re
import json
import os
import unicodedata

# ------------------------------------------------------------
# 1. Helpers
# ------------------------------------------------------------

def is_page_number(line):
    stripped = line.strip()
    # Only remove if it's a standalone number AND > 50 (page numbers)
    return stripped.isdigit() and int(stripped) > 50

def is_footer(line):
    return "System Reference Document" in line

def is_header_line(line):
    return line.strip() == "Spell Descriptions"

def clean_lines(lines):
    cleaned = []
    for line in lines:
        if is_page_number(line):
            continue
        if is_footer(line):
            continue
        if is_header_line(line):
            continue
        cleaned.append(line.rstrip())
    return cleaned

def looks_like_level_line(s):
    return s.startswith("Level ") or "Cantrip (" in s

def is_spell_name(lines, i):
    line = lines[i].strip()

    # Must be non-empty and start with a capital letter
    if not line or not line[0].isupper():
        return False

    # Look ahead for the level/cantrip line
    j = i + 1
    while j < len(lines) and lines[j].strip() == "":
        j += 1  # skip blank lines

    if j >= len(lines):
        return False

    next_line = lines[j].strip()

    # Must match one of the valid level formats
    if looks_like_level_line(next_line):
        return True

    return False

def parse_damage_from_text(desc_lines):
    """
    Extracts base damage dice from the description.
    Handles hyphenation, line breaks, and 'damage' suffix.
    """
    # Join lines and remove hyphenation
    text = " ".join(desc_lines)
    text = text.replace("- ", "")  # fix "dam- age"

    # Match patterns like:
    # 4d4 Acid
    # 4d4 acid damage
    # 4d4 Fire damage
    pattern = r"(\d+d\d+)\s+([A-Za-z]+)(?:\s+damage)?"
    return re.findall(pattern, text)


def parse_scaling(higher_level_lines):
    """
    Extracts the per-slot increase dice and base level.
    Handles line breaks and hyphenation.
    """
    text = " ".join(higher_level_lines)
    text = text.replace("- ", "")

    m = re.search(
        r"increases by (\d+d\d+) for each spell slot level above (\d+)",
        text,
        re.IGNORECASE
    )
    if m:
        return m.group(1), int(m.group(2))

    return None, None


def compute_scaled_damage(base_dice, scale_die, base_level):
    """
    base_dice: list of ('4d4', 'Acid'), ('2d4', 'Acid')
    scale_die: '1d4'
    base_level: 2
    Returns a dict: level -> list of dice strings
    """
    results = {}

    # Parse scale die
    s_num, s_size = map(int, scale_die.lower().split("d"))

    for level in range(base_level, 10):
        dice_list = []
        for dice, dtype in base_dice:
            num, size = map(int, dice.lower().split("d"))

            # Add scaling for levels above base
            extra = (level - base_level) * s_num
            total_num = num + extra

            dice_list.append(f"{total_num}d{size} {dtype}")

        results[level] = dice_list

    return results


# ------------------------------------------------------------
# 2. Main parser
# ------------------------------------------------------------

def parse_spells(path):
    print("Reading file:", os.path.abspath(path))
    with open(path) as f:
        raw = [l.rstrip("\n") for l in f]

    lines = clean_lines(raw)
    for idx, line in enumerate(lines): 
        if "Acid Arrow" in line: 
            print("\n=== DEBUG: RAW AROUND ACID ARROW ===") 
            for j in range(idx - 5, idx + 25): 
                if 0 <= j < len(lines): 
                    print(f"{j:04d}: {repr(lines[j])}") 
            break

    spells = []
    current = None
    desc = []
    in_higher_block = False

    i = 0
    n = len(lines)

    while i < n:
        raw = lines[i] 
        raw = unicodedata.normalize("NFKD", raw) 
        raw = raw.replace("–", "-").replace("—", "-") 
        line = raw.strip()

        # ----------------------------------------------------
        # Detect spell header
        # ----------------------------------------------------
        if is_spell_name(lines, i):
            # Look ahead up to 3 lines for level/cantrip line
            found_level = False
            skip = 0

            for j in range(1, 6): 
                # allow up to 5 lines, including blanks 
                if i + j >= n: 
                    break 
                
                candidate = lines[i + j].strip() 
                if candidate == "": 
                    continue    # skip blank lines 
                    
                # If this looks like the START of a level/cantrip line... 
                if looks_like_level_line(candidate): 
                    # If it ends with ')', it's a complete line 
                    if candidate.endswith(")"): 
                        level_line = candidate 
                        skip = j 
                        found_level = True 
                        break 
                    
                    # Otherwise, accumulate continuation lines 
                    combined = candidate 
                    k = j 
                    while k + 1 < n: 
                        next_line = lines[i + k + 1].strip() 
                        if next_line == "": 
                            k += 1 
                            continue 
                        combined += " " + next_line 
                        if next_line.endswith(")"): 
                            level_line = combined 
                            skip = k + 1 
                            found_level = True 
                            break 
                        k += 1 
                    
                    if found_level: 
                        break


            if found_level:
                # Finalize previous spell
                if current:
                    current["desc"] = desc
                    current["url"] = f"/api/spells/{current['index']}"
                    spells.append(current)

                # Start new spell
                current = {
                    "name": line,
                    "index": line.lower().replace(" ", "-"),
                    "desc": [],
                    "higher_level": [],
                    "range": "",
                    "components": [],
                    "material": "",
                    "ritual": False,
                    "duration": "",
                    "concentration": False,
                    "casting_time": "",
                    "level": 0,
                    "attack_type": "",
                    "damage": [],
                    "school": {},
                    "classes": [],
                    "subclasses": [],
                    "url": "",
                    "updated_at": None,
                }
                desc = [] 
                in_higher_block = False 
                fields_done = False 
                fields_found = 0

                # Parse level line
                lvl = level_line
                if lvl.startswith("Level "):
                    m = re.match(r"Level (\d+) ([A-Za-z]+) \((.+)\)", lvl)
                    if m:
                        current["level"] = int(m.group(1))
                        current["school"] = {"name": m.group(2)}
                        current["classes"] = [{"name": c.strip()} for c in m.group(3).split(",")]
                else:
                    m = re.match(r"([A-Za-z]+) Cantrip \((.+)\)", lvl)
                    if m:
                        current["level"] = 0
                        current["school"] = {"name": m.group(1)}
                        current["classes"] = [{"name": c.strip()} for c in m.group(2).split(",")]

                desc = []
                i += skip + 1
                continue

        if current:
            # ----------------------------------------------------
            # If we're currently in a higher-level block
            # ----------------------------------------------------
            if in_higher_block:
                if not line.strip():
                    in_higher_block = False
                else:
                    current["higher_level"].append(line.strip())
                i += 1
                continue

            # ----------------------------------------------------
            # FIELD PARSING
            # ----------------------------------------------------
            if line.startswith("Casting Time:"):
                current["casting_time"] = line.split(":", 1)[1].strip()
                fields_found += 1
                i += 1
                continue

            if line.startswith("Range:"):
                current["range"] = line.split(":", 1)[1].strip()
                fields_found += 1
                i += 1
                continue

            if line.startswith("Components:"):
                raw = line.split(":", 1)[1].strip()
                material = ""
                if "(" in raw and ")" in raw:
                    material = raw[raw.index("(")+1 : raw.index(")")]
                comps = raw.split("(")[0].strip()
                current["components"] = [c.strip() for c in comps.split(",")]
                current["material"] = material
                fields_found += 1
                i += 1
                continue

            if line.startswith("Duration:"):
                dur = line.split(":", 1)[1].strip()
                current["duration"] = dur
                current["concentration"] = "Concentration" in dur
                current["ritual"] = "Ritual" in dur
                fields_found += 1
                i += 1
                continue

            # ----------------------------------------------------
            # When all 4 fields are found, description begins
            # ----------------------------------------------------
            if fields_found == 4:
                fields_done = True

            # ----------------------------------------------------
            # HIGHER-LEVEL DETECTION
            # ----------------------------------------------------
            if fields_done and (
                line.strip().lower().startswith("using a higher-level")
                or ("higher-level" in line.lower() and "slot" in line.lower())
            ):
                current["higher_level"].append(line.strip())
                in_higher_block = True
                i += 1
                continue

            if fields_done and line.strip().lower().startswith("cantrip upgrade"):
                current["higher_level"].append(line.strip())
                in_higher_block = True
                i += 1
                continue

            # DESCRIPTION — ONLY if not higher-level
            if fields_done and line.strip() and not (
                line.lower().startswith("using a higher-level")
                or ("higher-level" in line.lower() and "slot" in line.lower())
                or line.lower().startswith("cantrip upgrade")
            ):
                desc.append(line)
                i += 1
                continue

        i += 1


    # Final spell
    if current:
        current["desc"] = desc
        spells.append(current)

    # Post-process damage scaling
    for spell in spells:
        if spell["name"] == "Acid Arrow":
            print("\n=== DEBUG: Acid Arrow Description ===")
            for line in spell["desc"]:
                print(line)

            print("\n=== DEBUG: Acid Arrow Higher Level ===")
            for line in spell["higher_level"]:
                print(line)

            base_dice = parse_damage_from_text(spell["desc"])
            print("\n=== DEBUG: Base Dice Found ===")
            print(base_dice)

            scale_die, base_level = parse_scaling(spell["higher_level"])
            print("\n=== DEBUG: Scaling Found ===")
            print("scale_die:", scale_die, "base_level:", base_level)

        base_dice = parse_damage_from_text(spell["desc"])
        scale_die, base_level = parse_scaling(spell["higher_level"])

        if base_dice and scale_die:
            spell["damage"] = compute_scaled_damage(base_dice, scale_die, base_level)


    return spells

if __name__ == "__main__":
    spells = parse_spells("clean_spells.txt")

    with open("spells.json", "w", encoding="utf-8") as f:
        json.dump(spells, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(spells)} spells to spells.json")
