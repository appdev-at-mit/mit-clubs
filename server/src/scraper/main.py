import os
import sys
import json

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from dotenv import load_dotenv

load_dotenv()

from club_scraper import ClubScraper


def main():
    scraper = ClubScraper()
    print("Scraping clubs...")
    clubs = scraper.scrape_clubs()
    scraper.save_to_json(clubs)
    print(f"Done! Scraped {len(clubs)} clubs")

    print("Reading from mit_clubs.json...")
    try:
        with open("mit_clubs.json", "r", encoding="utf-8") as f:
            clubs = json.load(f)
        print(f"Loaded {len(clubs)} clubs.")
    except FileNotFoundError:
        print("JSON file not found. Scraping clubs...")
        clubs = scraper.scrape_clubs()
        scraper.save_to_json(clubs)
        print(f"Done! Scraped {len(clubs)} clubs")

    print("Updating database...")
    scraper.update_database(clubs)
    print("Done updating database!")


if __name__ == "__main__":
    main()
