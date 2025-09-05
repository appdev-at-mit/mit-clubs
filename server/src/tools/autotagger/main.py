import os
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
    #     result = autotagger.process_club(club, save_to_db=False)  # Set to True to save to database
    #     autotagger.save_to_json([result], "club_tags.json")
    # else:
    #     print(f"Club not found: {club_name}")

    # Process all clubs
    autotagger.process_all_clubs(save_to_db=False)


if __name__ == "__main__":
    main()
