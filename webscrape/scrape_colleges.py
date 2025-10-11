import json, csv, time, re, sys
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup


# --------- Polite settings ---------
DEFAULT_HEADERS = {
    "User-Agent": "StudyShareScraper/1.0 (+https://example.com; contact: you@example.com)"
}
REQUEST_TIMEOUT = 20
SLEEP_BETWEEN_REQUESTS = 1.0  # seconds


def get(url: str, session: requests.Session) -> Optional[str]:
    for attempt in range(3):
        try:
            r = session.get(url, headers=DEFAULT_HEADERS, timeout=REQUEST_TIMEOUT)
            if r.status_code == 200:
                return r.text
            elif r.status_code in (403, 404):
                return None
        except requests.RequestException:
            if attempt == 2:
                return None
        time.sleep(0.8 * (attempt + 1))
    return None


@dataclass
class Course:
    code: str = ""
    title: str = ""
    units: str = ""
    description: str = ""


@dataclass
class Major:
    name: str
    url: str
    courses: List[Course]


@dataclass
class CollegeResult:
    college_name: str
    majors: List[Major]


def clean_text(x: str) -> str:
    return re.sub(r"\s+", " ", x).strip()


def extract_text(el, selector: Optional[str] = None) -> str:
    if el is None:
        return ""
    target = el.select_one(selector) if selector else el
    return clean_text(target.get_text(" ")) if target else ""


def parse_courses(soup: BeautifulSoup, cfg: Dict[str, Any]) -> List[Course]:
    courses = []
    for row in soup.select(cfg["course_row_selector"]):
        courses.append(Course(
            code = extract_text(row, cfg.get("course_code_selector")),
            title = extract_text(row, cfg.get("course_title_selector")),
            units = extract_text(row, cfg.get("course_units_selector")),
            description = extract_text(row, cfg.get("course_desc_selector"))
        ))
    # Optional de-dup
    uniq = []
    seen = set()
    for c in courses:
        key = (c.code, c.title)
        if key not in seen:
            uniq.append(c); seen.add(key)
    return uniq


def get_majors_list(col_cfg: Dict[str, Any]) -> List[Dict[str, str]]:
    base = col_cfg["majors_url"]
    session = requests.Session()
    html = get(base, session)
    if not html:
        print(f"[warn] Can't load majors_url: {base}", file=sys.stderr)
        return []
    soup = BeautifulSoup(html, "html.parser")
    majors = []
    for a in soup.select(col_cfg["major_link_selector"]):
        href = a.get("href") or ""
        if not href:
            continue
        url = urljoin(base, href)
        name = clean_text(a.get_text(" "))
        if col_cfg.get("major_name_selector"):
            name_el = a.select_one(col_cfg["major_name_selector"])
            if name_el:
                name = clean_text(name_el.get_text(" "))
        allow = True
        ignore_keywords = col_cfg.get("ignore_major_keywords", [])
        for kw in ignore_keywords:
            if kw.lower() in name.lower():
                allow = False; break
        if allow:
            majors.append({"name": name, "url": url})
    return majors

def scrape_college(col_cfg: Dict[str, Any]) -> CollegeResult:
    base = col_cfg["majors_url"]
    session = requests.Session()
    html = get(base, session)
    if not html:
        print(f"[warn] Can't load majors_url: {base}", file=sys.stderr)
        return CollegeResult(college_name=col_cfg["college_name"], majors=[])

    soup = BeautifulSoup(html, "html.parser")
    majors = []

    # Collect major links
    links = []
    for a in soup.select(col_cfg["major_link_selector"]):
        href = a.get("href") or ""
        if not href:
            continue
        url = urljoin(base, href)
        name = clean_text(a.get_text(" "))
        if col_cfg.get("major_name_selector"):
            name_el = a.select_one(col_cfg["major_name_selector"])
            if name_el:
                name = clean_text(name_el.get_text(" "))
        allow = True
        ignore_keywords = col_cfg.get("ignore_major_keywords", [])
        for kw in ignore_keywords:
            if kw.lower() in name.lower():
                allow = False; break
        if allow:
            links.append((name, url))

    # Visit each major page and parse courses
    for name, url in links:
        time.sleep(SLEEP_BETWEEN_REQUESTS)
        page = get(url, session)
        if not page:
            print(f"[warn] Can't load major page: {url}", file=sys.stderr)
            continue
        psoup = BeautifulSoup(page, "html.parser")
        courses = parse_courses(psoup, col_cfg)
        majors.append(Major(name=name, url=url, courses=courses))

    return CollegeResult(college_name=col_cfg["college_name"], majors=majors)


def to_json(results: List[CollegeResult], out_path: str):
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump([{
            "college": r.college_name,
            "majors": [{
                "name": m.name,
                "url": m.url,
                "courses": [asdict(c) for c in m.courses]
            } for m in r.majors]
        } for r in results], f, ensure_ascii=False, indent=2)
    print(f"Wrote JSON -> {out_path}")


def to_csv(results: List[CollegeResult], majors_out: str, courses_out: str):
    # majors.csv
    with open(majors_out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["college", "major_name", "major_url", "num_courses"])
        for r in results:
            for m in r.majors:
                w.writerow([r.college_name, m.name, m.url, len(m.courses)])
    print(f"Wrote majors CSV -> {majors_out}")


    # courses.csv
    with open(courses_out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["college", "major_name", "course_code", "course_title", "units", "description"])
        for r in results:
            for m in r.majors:
                for c in m.courses:
                    w.writerow([r.college_name, m.name, c.code, c.title, c.units, c.description])
    print(f"Wrote courses CSV -> {courses_out}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scrape_colleges.py config.json [--json out.json] [--csv majors.csv courses.csv] [--majors]")
        print("See config.example.json for the schema.")
        sys.exit(1)

    config_path = sys.argv[1]
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    if "--majors" in sys.argv:
        for col_cfg in cfg["colleges"]:
            print(f"Majors for {col_cfg['college_name']}:")
            majors = get_majors_list(col_cfg)
            for m in majors:
                print(f"{m['name']}: {m['url']}")
        sys.exit(0)

    results: List[CollegeResult] = []
    for col_cfg in cfg["colleges"]:
        print(f"Scraping: {col_cfg['college_name']}")
        results.append(scrape_college(col_cfg))

    # Outputs
    if "--json" in sys.argv:
        idx = sys.argv.index("--json")
        out = sys.argv[idx+1] if idx+1 < len(sys.argv) else "out.json"
        to_json(results, out)
    if "--csv" in sys.argv:
        idx = sys.argv.index("--csv")
        majors_out = sys.argv[idx+1] if idx+1 < len(sys.argv) else "majors.csv"
        courses_out = sys.argv[idx+2] if idx+2 < len(sys.argv) else "courses.csv"
        to_csv(results, majors_out, courses_out)


if __name__ == "__main__":
    main()
