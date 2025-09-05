import os
import json
from dotenv import load_dotenv
from club_autotagger import ClubAutotagger

load_dotenv()


def main():
    if not os.getenv("OPENAI_API_KEY"):
        print("Please set an OPENAI_API_KEY")
        return

    autotagger = ClubAutotagger()

    # Process specific club
    # club_name = "AppDev@MIT"
    # collection = autotagger.update_database()
    # club = collection.find_one({"club_id": club_name}) or collection.find_one(
    #     {"name": {"$regex": club_name, "$options": "i"}}
    # )
    # if club:
    #     result = autotagger.process_club(club, save_to_db=False)
    #     autotagger.save_to_json([result], "club_tags.json")
    # else:
    #     print(f"Club not found: {club_name}")

    # Process all clubs
    # autotagger.process_all_clubs(save_to_db=False)

    try:
        with open("club_tags.json", "r") as f:
            clubs = json.load(f)
        print(f"Loaded {len(clubs)} club tag suggestions.")
    except FileNotFoundError:
        print("JSON file not found. Run autotagger first.")
        return

    print("Updating database...")
    updated_count = 0
    for club in clubs:
        club_id = club["club_id"]
        club_name = club["club_name"]
        suggested_tags = club["suggested_tags"]

        if suggested_tags:
            if autotagger.update_club_tags(club_id, suggested_tags):
                updated_count += 1
                print(f"Updated {club_name} with {len(suggested_tags)} tags")

    print(f"Done! Updated {updated_count} clubs")


if __name__ == "__main__":
    main()
