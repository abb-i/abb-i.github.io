#!/usr/bin/env python3
"""
Refresh the three Anti Letter pieces on antiletter.html from the Substack feed.

Run this yourself after publishing:

    python3 scripts/update-antiletter.py

Nothing about this is live. It runs on your machine (or a CI runner), reads
your own public RSS feed once, and rewrites a block of plain HTML in
antiletter.html. Your readers never fetch anything from Substack — the
published page stays static, with zero third-party requests. Commit the
result like any other edit.

    --dry-run   show what would change without writing
    --count N   keep N pieces instead of 3
"""

import argparse
import html
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

FEED = "https://abbidogan.substack.com/feed"
PAGE = Path(__file__).resolve().parent.parent / "antiletter.html"
START, END = "<!-- SELECTED:START", "<!-- SELECTED:END -->"

# Podcast episodes come through the same feed. Flip to True to list essays only.
SKIP_PODCASTS = False

MONTHS = ("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec").split()


def clean(raw: str, limit: int = 130) -> str:
    """Strip tags and entities from a feed field, then trim on a word boundary."""
    text = re.sub(r"<[^>]+>", "", html.unescape(raw or "")).strip()
    text = re.sub(r"\s+", " ", text)
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0].rstrip(".,;:—-") + "…"


def is_podcast(item: ET.Element) -> bool:
    enc = item.find("enclosure")
    return enc is not None and "audio" in (enc.get("type") or "")


# Substack sits behind Cloudflare, which will 403 a bare urllib request from a
# datacenter IP (a GitHub runner) while letting a normal reader through. These
# are the headers a feed reader actually sends.
HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"),
    "Accept": "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
    "Accept-Language": "en-GB,en;q=0.9,de;q=0.8",
    "Cache-Control": "no-cache",
}


class Blocked(Exception):
    """The feed refused us — almost always Cloudflare, not a bug."""


def fetch(url: str, tries: int = 3) -> ET.Element:
    last = None
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as r:
                return ET.fromstring(r.read())
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code in (403, 429):
                if attempt == tries - 1:
                    raise Blocked(f"HTTP {exc.code}") from exc
                time.sleep(4 * (attempt + 1))
            else:
                raise
        except Exception as exc:
            last = exc
            if attempt == tries - 1:
                raise
            time.sleep(2 * (attempt + 1))
    raise last  # unreachable, but keeps the type checker honest


def entry_html(index: int, item: ET.Element) -> str:
    title = html.escape(clean(item.findtext("title") or "", 200))
    link = html.escape((item.findtext("link") or "").split("?")[0])
    blurb = html.escape(clean(item.findtext("description") or ""))

    # e.g. "Wed, 01 Jul 2026 16:01:39 GMT" -> "Jul 2026"
    parts = (item.findtext("pubDate") or "").split()
    date = f"{parts[2]} {parts[3]}" if len(parts) > 3 else ""

    return f"""
        <a class="al-entry" href="{link}"
           target="_blank" rel="noopener noreferrer">
          <div class="al-entry-grid">
            <span class="al-num">&#8470; {index:02d}</span>
            <div>
              <h3>{title}</h3>
              <p>{blurb}</p>
            </div>
            <span class="al-entry-meta">
              {date}
              <span class="go">Read &rarr;</span>
            </span>
          </div>
        </a>
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--count", type=int, default=3)
    args = ap.parse_args()

    try:
        root = fetch(FEED)
    except Blocked as exc:
        # Cloudflare turned us away. The page keeps the pieces it already has,
        # which are still correct — just not newly checked. Not worth failing
        # the build over, so say so loudly and exit clean.
        print(f"feed refused the request ({exc}) — leaving antiletter.html as it is.\n"
              f"If this keeps happening, run this script locally instead; a home\n"
              f"connection is not blocked the way a datacenter one is.", file=sys.stderr)
        return 0
    except Exception as exc:                      # offline, feed moved, etc.
        print(f"could not read {FEED}: {exc}", file=sys.stderr)
        return 1

    items = root.findall(".//item")
    if SKIP_PODCASTS:
        items = [i for i in items if not is_podcast(i)]
    items = items[: args.count]
    if not items:
        print("feed returned no usable items — leaving the page alone", file=sys.stderr)
        return 1

    block = "".join(entry_html(n, it) for n, it in enumerate(items, 1))

    page = PAGE.read_text()
    start = page.find(START)
    end = page.find(END)
    if start == -1 or end == -1:
        print(f"markers not found in {PAGE.name}", file=sys.stderr)
        return 1
    head = page[: page.index("-->", start) + 3]
    rebuilt = head + block + "        " + page[end:]

    for n, it in enumerate(items, 1):
        print(f"  {n:02d}  {clean(it.findtext('title') or '', 70)}")

    if args.dry_run:
        print("\n--dry-run: nothing written")
    elif rebuilt == page:
        print("\nalready up to date")
    else:
        PAGE.write_text(rebuilt)
        print(f"\n{PAGE.name} updated — commit it when you're happy")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
