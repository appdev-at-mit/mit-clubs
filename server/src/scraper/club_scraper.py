import requests
from bs4 import BeautifulSoup
import json
import re
import os
import sys
import pymongo
from pymongo import MongoClient


class ClubScraper:
    """
    A scraper to extract club information from MIT Engage website.
    """

    def __init__(self, base_url="https://engage.mit.edu"):
        self.base_url = base_url
        self.clubs_url = f"{base_url}/club_signup?view=all&"
        self.mongo_uri = os.getenv("MONGO_SRV", "")
        self.db_name = "Cluster0"

    def fetch_page(self):
        try:
            response = requests.get(self.clubs_url)
            response.raise_for_status()
            return BeautifulSoup(response.content, "html.parser")
        except requests.RequestException:
            return None

    def get_club_id(self, club_item):
        checkbox = club_item.find("input", {"type": "checkbox", "name": "clubs"})
        if checkbox and checkbox.get("value"):
            return checkbox["value"]
        return None

    def get_club_name(self, club_item):
        heading = club_item.find("h2", class_="media-heading")
        if heading:
            link = heading.find("a")
            if link:
                return link.get_text(strip=True)
        return None

    def get_club_logo(self, club_item):
        img = club_item.find("img", class_="media-object")
        if img and img.get("src"):
            src = img["src"]
            return self.base_url + src if src.startswith("/") else src
        return None

    def get_club_categories(self, club_item):
        categories = []
        for element in club_item.find_all("p", class_="h5 media-heading grey-element"):
            text = re.sub(r"\s+", " ", element.get_text(strip=True))
            if " - " in text:
                category_part = text.split(" - ", 1)[1].split(",")
                categories.extend(
                    [category.strip() for category in category_part if category.strip()]
                )
        return categories

    def get_club_website(self, club_item):
        for link in club_item.find_all("a", href=True):
            if link.find("span", class_="mdi mdi-web"):
                return link["href"]

        website_link = club_item.find(
            "a", href=True, string=lambda text: text and "Website" in text
        )
        return website_link["href"] if website_link else None

    def get_club_mission(self, club_item):
        for element in club_item.find_all(
            "p", style=lambda s: s and "display:none" in s
        ):
            text = element.get_text(strip=True)
            if "Mission" in text:
                return re.sub(r"^Mission\s*", "", text, flags=re.IGNORECASE).strip()
        return None

    def get_organization_type(self, club_item):
        for element in club_item.find_all("p", class_="h5 media-heading grey-element"):
            text = re.sub(r"\s+", " ", element.get_text(strip=True))
            if " - " in text:
                return text.split(" - ", 1)[0].strip()
            elif not any(
                word in text.lower() for word in ["academic", "technology", "education"]
            ):
                return text
        return None

    def get_membership_info(self, club_item):
        desc_block = club_item.find("div", class_="desc-block")
        return desc_block.get_text(strip=True) if desc_block else None

    def parse_club_item(self, club_item):
        club_data = {
            "id": self.get_club_id(club_item),
            "name": self.get_club_name(club_item),
            "logo_url": self.get_club_logo(club_item),
            "website_url": self.get_club_website(club_item),
            "categories": self.get_club_categories(club_item),
            "organization_type": self.get_organization_type(club_item),
            "mission": self.get_club_mission(club_item),
            "membership_info": self.get_membership_info(club_item),
        }

        return club_data

    def scrape_clubs(self):
        soup = self.fetch_page()
        if not soup:
            print("Failed to fetch page")
            return []

        club_items = soup.find_all("li", class_="list-group-item")

        clubs = []
        for club_item in club_items:
            try:
                club_data = self.parse_club_item(club_item)
                if club_data.get("name"):
                    clubs.append(club_data)
            except Exception as e:
                print(f"Error parsing club item: {e}")
                continue
        return clubs

    def save_to_json(self, clubs, filename="mit_clubs.json"):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(clubs, f)

    def update_database(self, clubs):
        if not self.mongo_uri:
            print("MongoDB URI not found.")
            return False

        try:
            client = MongoClient(self.mongo_uri)
            db = client[self.db_name]
            clubs_collection = db.clubs

            for club_data in clubs:
                if not club_data.get("id") or not club_data.get("name"):
                    continue

                # Only update the fields we scraped
                update_doc = {
                    "name": club_data["name"],
                    "engage_tags": ", ".join(club_data.get("categories", [])),
                    "website": club_data.get("website_url"),
                    "mission": club_data.get("mission"),
                    "image_url": club_data.get("logo_url"),
                }

                clubs_collection.update_one(
                    {"club_id": club_data["id"]}, {"$set": update_doc}, upsert=True
                )

            client.close()
            return True

        except Exception as e:
            print(f"Error updating database: {e}")
            return False
