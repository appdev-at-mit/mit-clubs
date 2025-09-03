from club_scraper import ClubScraper


def main():
    scraper = ClubScraper()
    print("Scraping clubs...")
    clubs = scraper.scrape_clubs()
    scraper.save_to_json(clubs)
    print(f"Done! Scraped {len(clubs)} clubs")


if __name__ == "__main__":
    main()
