import os
import json
from pymongo import MongoClient
from typing import List, Dict, Any
from openai import OpenAI


class ClubAutotagger:

    def __init__(self):
        self.mongo_uri = os.getenv("MONGO_SRV")
        self.db_name = "Cluster0"
        self.collection_name = "clubs"
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        self.available_tags = {
            "Academic": [
                "Academic and Pre-Professional",
                "Education",
                "Research",
                "Technology",
                "Entrepreneurship",
                "Engineering",
                "Computer Science",
                "Math",
                "Business and Economics",
                "Science",
                "Medicine and Health",
                "Finance and Consulting",
                "Media and Journalism",
                "Design",
            ],
            "Creative": [
                "Arts",
                "Performance",
                "Music",
                "Visual Arts",
                "Literary Arts",
                "Publication",
            ],
            "Identity": [
                "Cultural",
                "International Student",
                "Religious and Spiritual",
                "Gender-Based",
                "Gender and Sexuality",
            ],
            "Service": [
                "Community Service",
                "Activism",
                "Political",
                "Fundraising and Philanthropy",
            ],
            "Athletics": ["Athletics and Outdoors", "Intramural Sports"],
            "Hobbies": [
                "Hobbies and Special Interests",
                "Games and Puzzles",
                "Gaming",
                "Food and Cooking",
            ],
            "Social": ["Greek Life"],
            "Other": ["Departmental Program", "Resources and Support"],
        }

        self.all_tags = []
        for tags in self.available_tags.values():
            self.all_tags.extend(tags)

    def update_database(self):
        client = MongoClient(self.mongo_uri)
        return client[self.db_name][self.collection_name]

    def get_clubs_from_database(self) -> List[Dict[str, Any]]:
        collection = self.update_database()
        clubs = list(collection.find({}))
        print(f"Fetched {len(clubs)} clubs from database")
        return clubs

    def analyze_club_with_llm(
        self, club_name: str, club_description: str, existing_tags: List[str]
    ) -> List[str]:
        available = ", ".join(self.all_tags)
        existing = ", ".join(existing_tags) if existing_tags else "None"

        prompt = f"""Suggest relevant tags for this MIT club.

Club: {club_name}
Description: {club_description}
Existing Tags: {existing}

Available Tags: {available}

Rules:
- Only suggest from available tags list
- Don't repeat existing tags
- Max 5 tags
- Return JSON array: ["Tag1", "Tag2"]"""

        response = self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Tag MIT clubs with relevant categories.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=200,
        )

        content = response.choices[0].message.content.strip()

        if content.startswith("```"):
            lines = content.split("\n")[1:-1]
            content = "\n".join(lines)

        tags = json.loads(content)
        return [
            tag for tag in tags if tag in self.all_tags and tag not in existing_tags
        ]

    def save_to_json(
        self, results: List[Dict[str, Any]], filename: str = "club_tags.json"
    ):
        with open(filename, "w") as f:
            json.dump(results, f, indent=2)
        print(f"Saved to {filename}")

    def update_club_tags(self, club_id: str, new_tags: List[str]):
        collection = self.update_database()
        result = collection.update_one(
            {"club_id": club_id}, {"$addToSet": {"tags": {"$each": new_tags}}}
        )
        return result.modified_count > 0

    def process_club(
        self, club: Dict[str, Any], save_to_db: bool = False
    ) -> Dict[str, Any]:
        club_id = club.get("club_id", "")
        name = club.get("name", "")
        description = club.get("description", "")
        existing_tags = club.get("tags", [])

        print(f"Processing: {name}")

        suggested_tags = self.analyze_club_with_llm(name, description, existing_tags)

        if suggested_tags:
            print(f"  Tags: {suggested_tags}")
            if save_to_db:
                self.update_club_tags(club_id, suggested_tags)
                print(f"  Added to database")
            else:
                print(f"  Test (not adding to db)")
        else:
            print(f"  No suggestions")

        return {
            "club_id": club_id,
            "club_name": name,
            "existing_tags": existing_tags,
            "suggested_tags": suggested_tags,
        }

    def process_all_clubs(self, save_to_db: bool = False):
        clubs = self.get_clubs_from_database()

        results = []
        for club in clubs:
            result = self.process_club(club, save_to_db)
            results.append(result)

        self.save_to_json(results, "club_tags.json")
        print(f"\nDone: {len(clubs)} clubs")
