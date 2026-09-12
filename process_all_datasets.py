import json, re

# Load raw extracted playlists
with open("/tmp/extracted_playlists.json") as f:
    raw_data = json.load(f)

# --- 1. PROCESS INDIAN MOVIES (Playlist 1 & 2 + Existing) ---
# Load existing indian-movies.json
try:
    with open("public/data/indian-movies.json") as f:
        existing_indian = json.load(f)
except Exception:
    existing_indian = []

def clean_movie_title(raw_title):
    t = raw_title
    if "#shorts" in t.lower() or "#short" in t.lower() or ("shorts" in t.lower() and len(t) < 30):
        return None
    if any(x in t.lower() for x in ["suv new model", "test drive", "whatsapp status"]):
        return None
    
    noise_patterns = [
        r"\(HD\s*&\s*Eng\s*Subs\)",
        r"\(Eng\s*Subs?\)",
        r"\{HD\}",
        r"\(HD\)",
        r"\[HD\]",
        r"Hindi Full Movie",
        r"Full Hindi Dubbed Movie",
        r"Hindi Dubbed Full Movie",
        r"Full Movie",
        r"Full Comedy Movie",
        r"Blockbuster (Latest|Superhit|Hindi)? (Movie|Film)",
        r"Superhit (Hindi|Comedy)? Movie",
        r"Superhit (Hindi|Comedy)? Film",
        r"NEW South Movie Hindi Dub",
        r"Telugu Hindi Dubbed",
        r"Hindi Dubbed",
        r"New Released",
        r"New Release",
        r"Romantic Film",
        r"Romantic Movie",
        r"4K Ultra HD",
        r"1080p HD",
    ]
    for p in noise_patterns:
        t = re.sub(p, "", t, flags=re.IGNORECASE)
    
    parts = [p.strip() for p in re.split(r"[\-\|–]", t) if p.strip()]
    if not parts:
        clean = t.strip()
    else:
        clean = parts[0]
        if len(clean) < 4 and len(parts) > 1:
            clean = clean + " " + parts[1]
    
    clean = re.sub(r"\s+", " ", clean).strip()
    clean = clean.strip(" -–|:.,")
    if len(clean) < 2:
        return None
    return clean

def normalize_for_dedup(s):
    if not s:
        return ""
    # remove punctuation and spaces, lowercase
    return re.sub(r"[^a-zA-Z0-9]", "", s).lower()

seen_video_ids = set()
seen_normalized_titles = set()
final_indian_movies = []

# First, add the new requested playlists so they take high priority!
playlists_to_add = [
    ("movies_1_indian", raw_data["movies_1_indian"]),
    ("movies_2_best_hindi", raw_data["movies_2_best_hindi"])
]

for pl_name, vlist in playlists_to_add:
    for item in vlist:
        vid = item["id"]
        raw_title = item["title"]
        clean_title = clean_movie_title(raw_title)
        if not clean_title:
            continue
        norm_title = normalize_for_dedup(clean_title)
        if vid in seen_video_ids or norm_title in seen_normalized_titles:
            continue
        
        seen_video_ids.add(vid)
        seen_normalized_titles.add(norm_title)
        
        # Determine year if in title
        year_match = re.search(r"\b(19\d\d|20\d\d)\b", raw_title)
        year = int(year_match.group(1)) if year_match else 2024
        
        final_indian_movies.append({
            "id": f"ind-{vid}",
            "title": clean_title,
            "fullTitle": raw_title,
            "videoUrl": f"https://www.youtube.com/watch?v={vid}",
            "youtubeId": vid,
            "thumbnail": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
            "poster": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
            "backdrop": f"https://i.ytimg.com/vi/{vid}/maxresdefault.jpg",
            "duration": "Full Movie",
            "year": year,
            "genre": "Bollywood",
            "genres": ["Indian", "Bollywood", "Cinema", "Action"],
            "rating": 8.5 + (len(final_indian_movies) % 10) * 0.1,
            "views": 250000 + len(final_indian_movies) * 4500,
            "quality": "1080p HD",
            "channel": item.get("channel") or "Popular Hindi Cinema",
            "description": raw_title,
            "category": "indian"
        })

# Then keep existing ones that are not duplicates
for m in existing_indian:
    vid = m.get("youtubeId") or m.get("id", "").replace("ind-", "")
    norm_title = normalize_for_dedup(m.get("title", ""))
    if vid and vid in seen_video_ids:
        continue
    if norm_title and norm_title in seen_normalized_titles:
        continue
    seen_video_ids.add(vid)
    seen_normalized_titles.add(norm_title)
    final_indian_movies.append(m)

print(f"Total unique Indian movies: {len(final_indian_movies)}")

with open("public/data/indian-movies.json", "w") as f:
    json.dump(final_indian_movies, f, indent=2)

print("Saved /public/data/indian-movies.json")

# --- 2. PROCESS TURKISH DRAMAS AND HISTORICAL STORY INTO SERIES.JSON ---

def extract_episode_num(title, index):
    # Search for "Episode \d+", "قسط نمبر \d+", etc.
    m = re.search(r"(?:Episode|Ep|قسط نمبر|قسط)\s*[:\-]?\s*(\d+)", title, re.IGNORECASE)
    if m:
        return int(m.group(1))
    if "Last Episode" in title:
        return 9999
    return index + 1

# Process Hercai (100 episodes)
hercai_episodes = []
for i, v in enumerate(raw_data["turkish_1_hercai"]):
    ep_num = extract_episode_num(v["title"], i)
    clean_ep_title = f"Hercai - Episode {ep_num}"
    hercai_episodes.append({
        "id": f"hercai-ep-{ep_num}",
        "episodeNumber": ep_num,
        "title": clean_ep_title,
        "fullTitle": v["title"],
        "videoUrl": f"https://www.youtube.com/watch?v={v['id']}",
        "youtubeId": v["id"],
        "thumbnail": f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg",
        "backdrop": f"https://i.ytimg.com/vi/{v['id']}/maxresdefault.jpg",
        "duration": "Full Episode",
        "views": 420000 + (100 - i) * 15000,
        "seriesId": "series-hercai",
        "seriesTitle": "Hercai (Herjai)"
    })
hercai_episodes.sort(key=lambda x: x["episodeNumber"])
# re-normalize episodeNumber if any missing
for i, ep in enumerate(hercai_episodes):
    if ep["episodeNumber"] == 9999:
        ep["episodeNumber"] = len(hercai_episodes)
        ep["title"] = f"Hercai - Episode {len(hercai_episodes)} (Finale)"

# Process Husn Beparwah (42 episodes)
husn_episodes = []
for i, v in enumerate(raw_data["turkish_2_husn"]):
    ep_num = extract_episode_num(v["title"], i)
    clean_ep_title = f"Husn Beparwah - Episode {ep_num}"
    husn_episodes.append({
        "id": f"husn-ep-{ep_num}",
        "episodeNumber": ep_num,
        "title": clean_ep_title,
        "fullTitle": v["title"],
        "videoUrl": f"https://www.youtube.com/watch?v={v['id']}",
        "youtubeId": v["id"],
        "thumbnail": f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg",
        "backdrop": f"https://i.ytimg.com/vi/{v['id']}/maxresdefault.jpg",
        "duration": "Full Episode",
        "views": 310000 + (42 - i) * 12000,
        "seriesId": "series-husn-beparwah",
        "seriesTitle": "Husn Beparwah"
    })
husn_episodes.sort(key=lambda x: x["episodeNumber"])
for i, ep in enumerate(husn_episodes):
    if ep["episodeNumber"] == 9999:
        ep["episodeNumber"] = len(husn_episodes)
        ep["title"] = f"Husn Beparwah - Episode {len(husn_episodes)} (Finale)"

# Process Bazi Mohabbat Ki (68 episodes)
bazi_episodes = []
for i, v in enumerate(raw_data["turkish_3_bazi"]):
    ep_num = extract_episode_num(v["title"], i)
    clean_ep_title = f"Bazi Mohabbat Ki - Episode {ep_num}"
    bazi_episodes.append({
        "id": f"bazi-ep-{ep_num}",
        "episodeNumber": ep_num,
        "title": clean_ep_title,
        "fullTitle": v["title"],
        "videoUrl": f"https://www.youtube.com/watch?v={v['id']}",
        "youtubeId": v["id"],
        "thumbnail": f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg",
        "backdrop": f"https://i.ytimg.com/vi/{v['id']}/maxresdefault.jpg",
        "duration": "Full Episode",
        "views": 280000 + (68 - i) * 9000,
        "seriesId": "series-bazi-mohabbat-ki",
        "seriesTitle": "Bazi Mohabbat Ki (Twist of Fate)"
    })
bazi_episodes.sort(key=lambda x: x["episodeNumber"])
for i, ep in enumerate(bazi_episodes):
    if ep["episodeNumber"] == 9999:
        ep["episodeNumber"] = len(bazi_episodes)
        ep["title"] = f"Bazi Mohabbat Ki - Episode {len(bazi_episodes)} (Finale)"

# Process Muhabbat Aur Besakhi (62 episodes)
muhabbat_episodes = []
for i, v in enumerate(raw_data["turkish_4_muhabbat"]):
    ep_num = extract_episode_num(v["title"], i)
    clean_ep_title = f"Muhabbat Aur Besakhi - Episode {ep_num}"
    muhabbat_episodes.append({
        "id": f"muhabbat-ep-{ep_num}",
        "episodeNumber": ep_num,
        "title": clean_ep_title,
        "fullTitle": v["title"],
        "videoUrl": f"https://www.youtube.com/watch?v={v['id']}",
        "youtubeId": v["id"],
        "thumbnail": f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg",
        "backdrop": f"https://i.ytimg.com/vi/{v['id']}/maxresdefault.jpg",
        "duration": "Full Episode",
        "views": 290000 + (62 - i) * 11000,
        "seriesId": "series-muhabbat-aur-besakhi",
        "seriesTitle": "Muhabbat Aur Besakhi"
    })
muhabbat_episodes.sort(key=lambda x: x["episodeNumber"])
for i, ep in enumerate(muhabbat_episodes):
    if ep["episodeNumber"] == 9999:
        ep["episodeNumber"] = len(muhabbat_episodes)
        ep["title"] = f"Muhabbat Aur Besakhi - Episode {len(muhabbat_episodes)} (Finale)"

# Process Ertugrul Ghazi (100 episodes)
ertugrul_episodes = []
for i, v in enumerate(raw_data["turkish_5_ertugrul"]):
    ep_num = extract_episode_num(v["title"], i)
    clean_ep_title = f"Ertugrul Ghazi - Episode {ep_num}"
    ertugrul_episodes.append({
        "id": f"ertugrul-ep-{ep_num}",
        "episodeNumber": ep_num,
        "title": clean_ep_title,
        "fullTitle": v["title"],
        "videoUrl": f"https://www.youtube.com/watch?v={v['id']}",
        "youtubeId": v["id"],
        "thumbnail": f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg",
        "backdrop": f"https://i.ytimg.com/vi/{v['id']}/maxresdefault.jpg",
        "duration": "Full Episode",
        "views": 1500000 + (100 - i) * 45000,
        "seriesId": "series-ertugrul-ghazi",
        "seriesTitle": "Ertugrul Ghazi"
    })
ertugrul_episodes.sort(key=lambda x: x["episodeNumber"])
for i, ep in enumerate(ertugrul_episodes):
    if ep["episodeNumber"] == 9999:
        ep["episodeNumber"] = len(ertugrul_episodes)
        ep["title"] = f"Ertugrul Ghazi - Episode {len(ertugrul_episodes)} (Finale)"

# Process Prophet Yousuf (61 episodes)
yousuf_episodes = []
for i, v in enumerate(raw_data["historical_yousuf"]):
    ep_num = extract_episode_num(v["title"], i)
    clean_ep_title = f"Hazrat Yousuf (A.S) - Episode {ep_num}"
    yousuf_episodes.append({
        "id": f"yousuf-ep-{ep_num}",
        "episodeNumber": ep_num,
        "title": clean_ep_title,
        "fullTitle": v["title"],
        "videoUrl": f"https://www.youtube.com/watch?v={v['id']}",
        "youtubeId": v["id"],
        "thumbnail": f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg",
        "backdrop": f"https://i.ytimg.com/vi/{v['id']}/maxresdefault.jpg",
        "duration": "Full Episode",
        "views": 850000 + (61 - i) * 20000,
        "seriesId": "series-prophet-yousuf",
        "seriesTitle": "Hazrat Yousuf (Prophet Yousuf)"
    })
yousuf_episodes.sort(key=lambda x: x["episodeNumber"])
for i, ep in enumerate(yousuf_episodes):
    if ep["episodeNumber"] == 9999:
        ep["episodeNumber"] = len(yousuf_episodes)
        ep["title"] = f"Hazrat Yousuf (A.S) - Episode {len(yousuf_episodes)} (Finale)"

# Create Series Definitions
all_series = [
    {
        "id": "series-hercai",
        "title": "Hercai (Herjai)",
        "originalTitle": "Hercai Urdu Dubbed",
        "subtitle": "Hercai | Herjai Urdu - 100 Episodes (Explore All)",
        "poster": hercai_episodes[0]["thumbnail"],
        "backdrop": hercai_episodes[0]["backdrop"],
        "rating": 8.8,
        "year": 2021,
        "genre": "Romantic Drama",
        "genres": ["Turkish Drama", "Urdu Dubbed", "Romance", "Drama"],
        "quality": "1080p HD",
        "totalEpisodes": len(hercai_episodes),
        "description": "Watch Hercai (Herjai) complete Turkish drama in Urdu dubbed. Miran seeks revenge for his family's past, but falling in love with Reyyan turns vengeance into an unforgettable romance.",
        "category": "dramas",
        "isUrduDubbed": True,
        "episodes": hercai_episodes
    },
    {
        "id": "series-husn-beparwah",
        "title": "Husn Beparwah",
        "originalTitle": "The Beauty Inside / Maraşlı",
        "subtitle": "Husn Beparwah Urdu Dubbed - 42 Episodes (Explore All)",
        "poster": husn_episodes[0]["thumbnail"],
        "backdrop": husn_episodes[0]["backdrop"],
        "rating": 8.9,
        "year": 2022,
        "genre": "Action Romance",
        "genres": ["Turkish Drama", "Urdu Dubbed", "Action", "Thriller"],
        "quality": "1080p HD",
        "totalEpisodes": len(husn_episodes),
        "description": "Watch Husn Beparwah complete Turkish drama in Urdu dubbed. An intense romantic thriller weaving courage, family loyalty, and fearless devotion.",
        "category": "dramas",
        "isUrduDubbed": True,
        "episodes": husn_episodes
    },
    {
        "id": "series-bazi-mohabbat-ki",
        "title": "Bazi Mohabbat Ki (Twist of Fate)",
        "originalTitle": "Twist of Fate / Baazi Muhabbat Ki",
        "subtitle": "Twist of Fate | Bazi Mohabbat Ki - 68 Episodes (Explore All)",
        "poster": bazi_episodes[0]["thumbnail"],
        "backdrop": bazi_episodes[0]["backdrop"],
        "rating": 8.7,
        "year": 2023,
        "genre": "Romantic Thriller",
        "genres": ["Turkish Drama", "Urdu Dubbed", "Romance", "Suspense"],
        "quality": "1080p HD",
        "totalEpisodes": len(bazi_episodes),
        "description": "Watch Bazi Mohabbat Ki (Twist of Fate) complete Turkish drama series in Urdu dubbed. A thrilling tale of destiny, love, secrets, and betrayal.",
        "category": "dramas",
        "isUrduDubbed": True,
        "episodes": bazi_episodes
    },
    {
        "id": "series-muhabbat-aur-besakhi",
        "title": "Muhabbat Aur Besakhi",
        "originalTitle": "New Turkish Drama Urdu Dubbed",
        "subtitle": "Muhabbat Aur Besakhi - 62 Episodes (Explore All)",
        "poster": muhabbat_episodes[0]["thumbnail"],
        "backdrop": muhabbat_episodes[0]["backdrop"],
        "rating": 8.6,
        "year": 2024,
        "genre": "Emotional Drama",
        "genres": ["Turkish Drama", "Urdu Dubbed", "Family Drama", "Romance"],
        "quality": "1080p HD",
        "totalEpisodes": len(muhabbat_episodes),
        "description": "Watch Muhabbat Aur Besakhi complete Turkish drama in Urdu dubbed. A heartfelt journey of devotion, healing, and overcome obstacles.",
        "category": "dramas",
        "isUrduDubbed": True,
        "episodes": muhabbat_episodes
    },
    {
        "id": "series-ertugrul-ghazi",
        "title": "Ertugrul Ghazi",
        "originalTitle": "Diriliş: Ertuğrul",
        "subtitle": "Ertugrul Ghazi All Seasons Urdu Dubbed - 100 Episodes (Explore All)",
        "poster": ertugrul_episodes[0]["thumbnail"],
        "backdrop": ertugrul_episodes[0]["backdrop"],
        "rating": 9.7,
        "year": 2020,
        "genre": "Historical Epic",
        "genres": ["Turkish Drama", "Historical", "Urdu Dubbed", "Action"],
        "quality": "1080p HD",
        "totalEpisodes": len(ertugrul_episodes),
        "description": "Watch Ertugrul Ghazi (Diriliş: Ertuğrul) complete Turkish epic drama in Urdu dubbed. The heroic saga of Ertugrul Bey, father of Osman I who founded the Ottoman Empire.",
        "category": "dramas",
        "isUrduDubbed": True,
        "episodes": ertugrul_episodes
    },
    {
        "id": "series-prophet-yousuf",
        "title": "Hazrat Yousuf (Prophet Yousuf)",
        "originalTitle": "حضرت یوسف علیہ السلام",
        "subtitle": "Hazrat Yousuf (A.S) All Episodes Urdu Dubbed - 61 Episodes (Explore All)",
        "poster": yousuf_episodes[0]["thumbnail"],
        "backdrop": yousuf_episodes[0]["backdrop"],
        "rating": 9.8,
        "year": 2008,
        "genre": "Historical Story",
        "genres": ["Historical Story", "Islamic History", "Urdu Dubbed", "Cinema"],
        "quality": "1080p HD",
        "totalEpisodes": len(yousuf_episodes),
        "description": "Watch Hazrat Yousuf (A.S) complete historical series in Urdu dubbed (تمام اقساط). The renowned historical story of Prophet Joseph from patience to kingship.",
        "category": "historical",
        "isUrduDubbed": True,
        "episodes": yousuf_episodes
    }
]

with open("public/data/series.json", "w") as f:
    json.dump(all_series, f, indent=2)

print(f"Saved {len(all_series)} series to /public/data/series.json with total {sum(s['totalEpisodes'] for s in all_series)} episodes")

# --- 3. CREATE HISTORICAL.JSON ---
historical_items = []
# First the Hazrat Yousuf series card
historical_items.append({
    "id": "series-prophet-yousuf",
    "title": "Hazrat Yousuf (Prophet Yousuf)",
    "fullTitle": "Hazrat Yousuf (A.S) Complete Historical Story - 61 Episodes Urdu Dubbed",
    "videoUrl": yousuf_episodes[0]["videoUrl"],
    "youtubeId": yousuf_episodes[0]["youtubeId"],
    "thumbnail": yousuf_episodes[0]["thumbnail"],
    "poster": yousuf_episodes[0]["thumbnail"],
    "backdrop": yousuf_episodes[0]["backdrop"],
    "duration": "61 Episodes",
    "year": 2008,
    "genre": "Historical Story",
    "genres": ["Historical Story", "Islamic History", "Urdu Dubbed"],
    "rating": 9.8,
    "views": 850000,
    "quality": "1080p HD",
    "channel": "Historical Stories Cinema",
    "description": "Watch Hazrat Yousuf (A.S) complete historical series in Urdu dubbed (تمام اقساط). Click to explore all 61 episodes!",
    "category": "historical",
    "isSeries": True,
    "seriesId": "series-prophet-yousuf",
    "totalEpisodes": len(yousuf_episodes)
})
# Also add each individual episode so they are directly searchable and playable!
for ep in yousuf_episodes:
    historical_items.append({
        "id": ep["id"],
        "title": ep["title"],
        "fullTitle": ep["fullTitle"],
        "videoUrl": ep["videoUrl"],
        "youtubeId": ep["youtubeId"],
        "thumbnail": ep["thumbnail"],
        "poster": ep["thumbnail"],
        "backdrop": ep["backdrop"],
        "duration": ep["duration"],
        "year": 2008,
        "genre": "Historical Story",
        "genres": ["Historical Story", "Urdu Dubbed"],
        "rating": 9.8,
        "views": ep["views"],
        "quality": "1080p HD",
        "channel": "Hazrat Yousuf Official",
        "description": ep["fullTitle"],
        "category": "historical",
        "seriesId": "series-prophet-yousuf",
        "episodeNumber": ep["episodeNumber"]
    })

with open("public/data/historical.json", "w") as f:
    json.dump(historical_items, f, indent=2)

print(f"Saved {len(historical_items)} items to /public/data/historical.json")

# --- 4. UPDATE DRAMAS.JSON WITH TURKISH DRAMA SERIES AT TOP ---
try:
    with open("public/data/dramas.json") as f:
        existing_dramas = json.load(f)
except Exception:
    existing_dramas = []

# Filter out old duplicates of our 5 Turkish dramas if any existed
drama_series_cards = []
for s in all_series[:5]: # The 5 Turkish dramas
    drama_series_cards.append({
        "id": s["id"],
        "title": s["title"],
        "fullTitle": s["subtitle"],
        "videoUrl": s["episodes"][0]["videoUrl"],
        "youtubeId": s["episodes"][0]["youtubeId"],
        "thumbnail": s["poster"],
        "poster": s["poster"],
        "backdrop": s["backdrop"],
        "duration": f"{s['totalEpisodes']} Episodes",
        "year": s["year"],
        "genre": s["genre"],
        "genres": s["genres"],
        "rating": s["rating"],
        "views": s["episodes"][0]["views"],
        "quality": "1080p HD",
        "channel": "Turkish Dramas Urdu",
        "description": s["description"],
        "category": "dramas",
        "isSeries": True,
        "seriesId": s["id"],
        "totalEpisodes": s["totalEpisodes"]
    })

# Add individual episodes of Turkish dramas so they are 100% searchable in search bar
turkish_episodes_for_search = []
for s in all_series[:5]:
    for ep in s["episodes"]:
        turkish_episodes_for_search.append({
            "id": ep["id"],
            "title": ep["title"],
            "fullTitle": ep["fullTitle"],
            "videoUrl": ep["videoUrl"],
            "youtubeId": ep["youtubeId"],
            "thumbnail": ep["thumbnail"],
            "poster": ep["thumbnail"],
            "backdrop": ep["backdrop"],
            "duration": ep["duration"],
            "year": s["year"],
            "genre": s["genre"],
            "genres": s["genres"],
            "rating": s["rating"],
            "views": ep["views"],
            "quality": "1080p HD",
            "channel": "Turkish Dramas Urdu",
            "description": f"{s['title']} - {ep['title']} Urdu Dubbed",
            "category": "dramas",
            "seriesId": s["id"],
            "episodeNumber": ep["episodeNumber"]
        })

# Combine: 5 Turkish drama series cards FIRST, then other existing dramas, then episodes
updated_dramas = drama_series_cards + existing_dramas + turkish_episodes_for_search

with open("public/data/dramas.json", "w") as f:
    json.dump(updated_dramas, f, indent=2)

print(f"Saved {len(updated_dramas)} drama items to /public/data/dramas.json (including 5 Series cards + {len(turkish_episodes_for_search)} searchable episodes)")
