import sys
import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

# Get command-line arguments
email, username, password = sys.argv[1], sys.argv[2], sys.argv[3]

# Webshare Rotating Proxy (IP-based authentication, no username/password)
ROTATING_PROXY_URL = "http://p.webshare.io:9999"

# Function to configure Chrome with rotating proxy
def get_chrome_driver_with_proxy(proxy_url):
    chrome_options = Options()
    chrome_options.add_argument(f"--proxy-server={proxy_url}")
    chrome_options.add_argument('--disable-gpu')  # Optional for compatibility
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# Function to get the public IP address
def get_public_ip():
    try:
        response = requests.get('https://httpbin.org/ip')  # Using httpbin.org to get public IP
        ip_address = response.json().get('origin', 'IP not found')
        return ip_address
    except requests.exceptions.RequestException as e:
        print(f"Error getting IP address: {e}")
        return 'IP not found'

# Initialize WebDriver with the rotating proxy
driver = get_chrome_driver_with_proxy(ROTATING_PROXY_URL)

try:
    # Step 1: Navigate to Twitter Login Page
    driver.get("https://x.com/login")
    time.sleep(5)  # Wait for the page to load

    # Step 2: Enter Email
    email_input = driver.find_element(By.NAME, "text")
    email_input.send_keys(email)
    email_input.send_keys(Keys.RETURN)
    time.sleep(15)  # Wait for the next step

    # Step 3: Handle Username Field (if it appears)
    try:
        username_input = driver.find_element(By.CSS_SELECTOR, "input[data-testid='ocfEnterTextTextInput']")
        username_input.send_keys(username)
        username_input.send_keys(Keys.RETURN)
        time.sleep(15)  # Wait for the password field
    except Exception:
        print("Username field not found, skipping this step.")

    # Step 4: Enter Password
    password_input = driver.find_element(By.NAME, "password")
    password_input.send_keys(password)
    password_input.send_keys(Keys.RETURN)
    time.sleep(10)  # Wait for login to complete

    # # Step 5: Navigate to the Trending Page
    driver.get("https://x.com/explore/tabs/trending")
    time.sleep(10)  # Wait for the page to load

    # Step 6: Extract Trending Topics
    trending_elements = driver.find_elements(By.CSS_SELECTOR, "div[data-testid='trend'] span span")
    
    # Extract the top 5 trending topics
    trending_topics = [element.text for element in trending_elements[:5] if element.text.strip()]

    # If no trending topics found, return an empty list
    if not trending_topics:
        trending_topics = []

    # Step 7: Create a formatted list of topics with numbers
    formatted_trending_topics = {f"{index + 1}": topic for index, topic in enumerate(trending_topics)}

    # Step 8: Get the public IP address
    ip_address = get_public_ip()

    # Step 9: Output formatted JSON with IP address and trending topics
    print(json.dumps({
        "ip_address": ip_address,
        "trending_topics": formatted_trending_topics
    }, indent=4))  # Pretty print with indentation

finally:
    # Close the browser
    driver.quit()
