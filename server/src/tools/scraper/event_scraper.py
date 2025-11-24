import os
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pymongo import MongoClient

def main():
    driver = webdriver.Chrome()
    mongo_uri = os.getenv("MONGO_SRV")
    client = MongoClient(mongo_uri)
    db = client["Cluster0"]  # Use your DB name
    events_collection = db["events"]  # Use your collection name

    """
    export interface Event{
    title: string;
    organization: string;
    sender_email: string;
    time: Date;
    loc: string;
    description?: string;}
"""
    try: 
        driver.get("https://dormsoup.mit.edu/")
        print("Please complete login + MFA in opened browser. Script will continue in 60 seconds...")
        time.sleep(60)

        html = driver.page_source
        soup = BeautifulSoup(html, "html.parser")

        days = soup.find_all("div", class_="flex w-full flex-col")

        for day in days:
            date = day.find("div", class_="mb-1 flex-none border-b-2 border-logo-red text-lg font-bold")
            date_str = date.text.strip() if date else "N/A"
            event_container = soup.find("div", class_="flex-rows gap-4")
            events = event_container.find_all("div", class_="relative flex cursor-pointer select-none items-center overflow-hidden rounded-md border-2 border-gray-300 bg-white shadow-lg transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-gray-600 hover:shadow-2xl")

            for event in events:
                title = event.find("div", class_="line-clamp-1 w-full overflow-hidden pt-0.5 text-lg font-semibold") if title else None
                title_str = title.text.strip() if title_str else "N/A"
                org_title = title_str.split("] ")
                org = org_title[0][1:]
                title = org_title[1]

                time = event.find("div",class_="truncate whitespace-nowrap pb-0.5 text-xs").find("span",class_="font-medium") if time else None
                time_str = time.text.strip() if time else "N/A"

                loc = event.find("span",class_="truncate font-medium inline line-clamp-1 overflow-hidden") if loc else None
                loc_str = loc.text.strip() if loc else "N/A"

                event_doc = {
                    "title": title,
                    "organization": org,
                    "time": time_str,
                    "loc": loc_str,
                }
                events_collection.insert_one(event_doc)
                #tile = driver.find(By.CSS_SELECTOR, "div.relative.flex.cursor-pointer.select-none.items-center.overflow-hidden.rounded-md.border-2.border-gray-300.bg-white.shadow-lg.transition-all.duration-150.hover:-translate-x-0.5.hover:-translate-y-0.5.hover:border-gray-600.hover:shadow-2xl")
            """try:
                tile.click()
                WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.CSS_SELECTOR, "div.fixed.z-50"))
                )
                popup = driver.find_element(By.CSS_SELECTOR, "div.fixed.z-50")
                popup_html = popup.get_attribute("outerHTML")
                popup_soup = BeautifulSoup(popup_html, "html.parser")
                outside=popup_soup.find("div", class_="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 transition duration-150 ease-in-out pointer-events-auto")

                try:
                    close_btn = popup.find_element(By.CSS_SELECTOR, "a.block.h-6.w-6.flex-none.rounded-full.text-center.hover\:cursor-pointer.hover\:bg-logo-red.hover\:text-white")
                    close_btn.click()
                except Exception as e:
                    print(f"Could not close popup: {e}")
            except Exception as e:
                print(f"Error scraping popup: {e}")
        """
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        driver.quit()


"""
class EventScraper:
    def __init__(self, base_url="https://dormsoup.mit.edu"):
        self.base_url = base_url
        #self.clubs_url = f"{base_url}/club_signup?view=all&"
        self.mongo_uri = os.getenv("MONGO_SRV", "")
        self.db_name = "Cluster0"

    def fetch_page(self):
"""