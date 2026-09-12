import urllib.request, json, re

def get_html(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        }
    )
    return urllib.request.urlopen(req, timeout=20).read().decode("utf-8", errors="ignore")

def extract_videos_from_playlist(playlist_id):
    url = f"https://www.youtube.com/playlist?list={playlist_id}"
    try:
        html = get_html(url)
    except Exception as e:
        print(f"Error fetching {playlist_id}: {e}")
        return []
    
    # Try parsing ytInitialData
    data = None
    markers = ["ytInitialData = {", "var ytInitialData = {", "window[\"ytInitialData\"] = {"]
    for marker in markers:
        idx = html.find(marker)
        if idx != -1:
            start = idx + len(marker) - 1
            end = html.find(";</script>", start)
            if end == -1:
                end = html.find("</script>", start)
            if end != -1:
                json_str = html[start:end].strip()
                if json_str.endswith(";"):
                    json_str = json_str[:-1].strip()
                try:
                    data = json.loads(json_str)
                    break
                except Exception as e:
                    pass

    videos = []
    seen = set()

    def add_video(vid, title, thumb="", length="", channel=""):
        if not vid or len(vid) != 11 or vid in seen:
            return
        # Clean title
        clean_title = re.sub(r"\s+", " ", title).strip()
        if not clean_title or clean_title == "Private video" or clean_title == "Deleted video":
            return
        seen.add(vid)
        if not thumb:
            thumb = f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
        videos.append({
            "id": vid,
            "title": clean_title,
            "thumb": thumb,
            "length": length,
            "channel": channel
        })

    if data:
        def walk(obj):
            if isinstance(obj, dict):
                if "playlistVideoRenderer" in obj:
                    pvr = obj["playlistVideoRenderer"]
                    vid = pvr.get("videoId")
                    t_obj = pvr.get("title", {})
                    title = t_obj.get("runs", [{}])[0].get("text", "") or t_obj.get("simpleText", "")
                    thumbs = pvr.get("thumbnail", {}).get("thumbnails", [])
                    thumb = thumbs[-1].get("url") if thumbs else ""
                    length = pvr.get("lengthText", {}).get("simpleText", "")
                    channel = pvr.get("shortBylineText", {}).get("runs", [{}])[0].get("text", "")
                    add_video(vid, title, thumb, length, channel)
                elif "lockupViewModel" in obj:
                    lvm = obj["lockupViewModel"]
                    vid = ""
                    try:
                        vid = lvm["rendererContext"]["commandContext"]["onTap"]["innertubeCommand"]["watchEndpoint"]["videoId"]
                    except Exception:
                        pass
                    if not vid:
                        s = json.dumps(lvm)
                        m = re.search(r"\"videoId\":\"([a-zA-Z0-9_-]{11})\"", s)
                        if m:
                            vid = m.group(1)
                    title = ""
                    try:
                        title = lvm["metadata"]["lockupMetadataViewModel"]["title"]["content"]
                    except Exception:
                        pass
                    if not title:
                        try:
                            title = lvm["rendererContext"]["accessibilityContext"]["label"]
                        except Exception:
                            pass
                    thumb = ""
                    try:
                        sources = lvm["contentImage"]["thumbnailViewModel"]["image"]["sources"]
                        if sources:
                            thumb = sources[-1]["url"]
                    except Exception:
                        pass
                    channel = ""
                    try:
                        channel = lvm["metadata"]["lockupMetadataViewModel"]["metadata"]["contentMetadataViewModel"]["metadataRows"][0]["metadataParts"][0]["text"]["content"]
                    except Exception:
                        pass
                    add_video(vid, title, thumb, "", channel)
                else:
                    for v in obj.values():
                        walk(v)
            elif isinstance(obj, list):
                for it in obj:
                    walk(it)

        walk(data)

    # Fallback to regex if count is small
    if len(videos) < 10:
        matches = re.findall(r"\"videoId\":\"([a-zA-Z0-9_-]{11})\".*?\"title\":\{\"runs\":\[\{\"text\":\"(.*?)\"\}\]", html)
        for vid, title in matches:
            add_video(vid, title)
        # also match lockupViewModel title in raw html
        matches2 = re.findall(r"\"videoId\":\"([a-zA-Z0-9_-]{11})\".*?\"content\":\"(.*?)\"", html)
        for vid, title in matches2:
            if len(title) > 3 and not title.startswith("http") and not title.startswith("yt"):
                add_video(vid, title)

    print(f"Playlist {playlist_id}: extracted {len(videos)} videos")
    return videos

pids = {
    "movies_1_indian": "PLXXY7wsgMjkXqfYxB74858M_UbA6ZldXS",
    "movies_2_best_hindi": "PLfT2x_rqm6fwncMTMgnS2Q4sJ13CQ3gdo",
    "turkish_1_hercai": "PLSxvMJ2MT0hpht0ISEE6YxeuBEpEhspEE",
    "turkish_2_husn": "PLraHAiNmFe1PgNVjFcY2T4BaryjHYzTqO",
    "turkish_3_bazi": "PLxdb5yj7DZXW4FFpwgsSIQ-hZdsAk97H1",
    "turkish_4_muhabbat": "PLSHkL2RDCWMxl49WXsMh1PTw_lbRRyv9R",
    "turkish_5_ertugrul": "PLAATS09VpS8_P0OrqT-LopaOgYKeYISm6",
    "historical_yousuf": "PL_0QenrQtTpDTV6zGYxW6kCLG8Wdj3uFv"
}

results = {}
for name, pid in pids.items():
    v = extract_videos_from_playlist(pid)
    results[name] = v

with open("/tmp/extracted_playlists.json", "w") as f:
    json.dump(results, f, indent=2)

print("Saved all to /tmp/extracted_playlists.json")
