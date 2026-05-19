import os
import subprocess
import requests

supabase_url = "https://hmmbspebnqkueqwcqinr.supabase.co"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbWJzcGVibnFrdWVxd2NxaW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTE1OTksImV4cCI6MjA4NzAyNzU5OX0.oJHXudyeVCiaUQVB4kyvfcONOwEVbEJb_0cK7j-BByU"

base_dir = "/mnt/documents/storage_files"
os.makedirs(base_dir, exist_ok=True)

with open("storage_files_list.txt", "r") as f:
    files = f.readlines()

for file_path in files:
    file_path = file_path.strip()
    if not file_path: continue
    
    url = f"{supabase_url}/storage/v1/object/public/{file_path}"
    dest = os.path.join(base_dir, file_path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    
    print(f"Downloading {file_path}...")
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(dest, 'wb') as df:
                for chunk in response.iter_content(chunk_size=8192):
                    df.write(chunk)
        else:
            print(f"Failed to download {file_path}: {response.status_code}")
    except Exception as e:
        print(f"Error downloading {file_path}: {e}")

