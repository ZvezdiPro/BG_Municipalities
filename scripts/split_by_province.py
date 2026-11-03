import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def slugify(text: str) -> str:
    translit = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ж": "zh", "з": "z",
        "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p",
        "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "ts", "ч": "ch",
        "ш": "sh", "щ": "sht", "ъ": "a", "ь": "y", "ю": "yu", "я": "ya",
    }
    out = []
    for ch in text.lower():
        if ch in translit:
            out.append(translit[ch])
        elif ch.isalnum():
            out.append(ch)
        else:
            out.append("_")
    return re.sub(r"_+", "_", "".join(out)).strip("_")

def normalize_name(name):
    if not name:
        return ""
    name = name.lower().strip()
    name = name.replace("община", "").strip()
    return name

def load_provinces():
    data_js = (ROOT / "data.js").read_text(encoding="utf-8")
    start = data_js.find("const BULGARIAN_PROVINCES = {")
    if start == -1:
        raise ValueError("Could not find BULGARIAN_PROVINCES in data.js")
    end = data_js.find("};", start)
    body = data_js[start:end]
    
    provinces = {}
    current_prov = None
    
    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith("//"):
            continue
            
        if ":" in line and "[" in line:
            parts = line.split(":", 1)
            prov_name = parts[0].strip()
            if prov_name.startswith('"') and prov_name.endswith('"'):
                prov_name = prov_name[1:-1]
            current_prov = prov_name
            provinces[current_prov] = []
            
            rest = parts[1]
            strings = re.findall(r'"([^"]+)"', rest)
            provinces[current_prov].extend(strings)
        elif current_prov:
            strings = re.findall(r'"([^"]+)"', line)
            provinces[current_prov].extend(strings)
            
    return provinces

def main():
    print("Loading provinces mapping from data.js...")
    provinces = load_provinces()
    
    expected_muni = set()
    muni_to_province = {}
    for prov, munis in provinces.items():
        for m in munis:
            norm = normalize_name(m)
            expected_muni.add(norm)
            muni_to_province[norm] = prov

    print(f"Loaded {len(provinces)} provinces with {len(expected_muni)} unique municipalities.")

    print("Loading municipalities.geojson (this may take a moment)...")
    with open(ROOT / "assets" / "municipalities.geojson", "r", encoding="utf-8") as f:
        data = json.load(f)
        
    features = data.get("features", [])
    print(f"Loaded {len(features)} features from municipalities.geojson.")

    province_features = {prov: [] for prov in provinces.keys()}
    
    matched_count = 0
    unmatched_features = []
    matched_expected = set()

    for feature in features:
        props = feature.get("properties", {})
        # Features might have cyrillic in "name", "name:bg", "alt_name"
        names_to_try = [
            props.get("name", ""),
            props.get("name:bg", ""),
            props.get("alt_name", ""),
            props.get("int_name", "")
        ]
        
        matched_prov = None
        best_norm_name = ""
        
        for name_val in names_to_try:
            if not name_val:
                continue
            norm_name = normalize_name(name_val)
            best_norm_name = norm_name if not best_norm_name else best_norm_name
            
            if norm_name == "бяла":
                # Disambiguate "Бяла" which exists in both Varna and Ruse
                ekatte = props.get("ekatte", "")
                if ekatte.startswith("VAR"):
                    matched_prov = "Варна"
                    matched_expected.add(norm_name)
                    break
                elif ekatte.startswith("RSE"):
                    matched_prov = "Русе"
                    matched_expected.add(norm_name)
                    break

            if norm_name in muni_to_province:
                # If there is a list of provinces (e.g. from duplicates), just pick first if not disambiguated
                if isinstance(muni_to_province[norm_name], list):
                    matched_prov = muni_to_province[norm_name][0]
                else:
                    matched_prov = muni_to_province[norm_name]
                matched_expected.add(norm_name)
                break
        
        if not matched_prov and best_norm_name:
            for exp in expected_muni:
                if exp in best_norm_name or best_norm_name in exp:
                    matched_prov = muni_to_province[exp]
                    matched_expected.add(exp)
                    break
                    
        if matched_prov:
            province_features[matched_prov].append(feature)
            matched_count += 1
        else:
            unmatched_features.append(props.get("name") or "Unknown")

    out_dir = ROOT / "assets" / "geo"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    for prov, feats in province_features.items():
        slug = slugify(prov)
        outfile = out_dir / f"{slug}.geojson"
        fc = {
            "type": "FeatureCollection",
            "features": feats
        }
        outfile.write_text(json.dumps(fc, ensure_ascii=False), encoding="utf-8")

    country_features = [
        feature for feature in features
        if feature.get("properties", {}).get("border_type") == "municipality"
    ]
    if len(country_features) != 265:
        raise ValueError(f"Expected 265 municipality boundaries, found {len(country_features)}")
    country_file = out_dir / "bulgaria.geojson"
    country_file.write_text(
        json.dumps({"type": "FeatureCollection", "features": country_features}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {country_file.name} with {len(country_features)} municipalities.")
        
    print("\n--- Summary ---")
    print(f"Total features processed: {len(features)}")
    print(f"Features successfully matched: {matched_count}")
    
    missing_expected = expected_muni - matched_expected
    
    if unmatched_features:
        print("\nWarnings: The following features from geojson were not matched:")
        for name in unmatched_features:
            print(f"  - {name}")
            
    if missing_expected:
        print("\nWarnings: The following municipalities from data.js were NOT found in geojson:")
        for name in missing_expected:
            print(f"  - {name}")

    print("\nDistribution per province:")
    for prov, feats in province_features.items():
        print(f"  {prov}: {len(feats)} municipalities")

if __name__ == "__main__":
    main()
