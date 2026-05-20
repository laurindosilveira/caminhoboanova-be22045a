import json
import subprocess

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, (list, dict)):
        val = json.dumps(val, ensure_ascii=False)
    
    # Escape single quotes by doubling them
    return f"'{str(val).replace(\"'\", \"''\")}'"

def main():
    # Fetch data
    cmd = ["psql", "-Atc", "SELECT json_build_object('id', id, 'lesson_id', lesson_id, 'day_number', day_number, 'title', title, 'bible_text', bible_text, 'bible_reference', bible_reference, 'reflection', reflection, 'practice', practice, 'prayer', prayer, 'questions', questions, 'created_at', created_at, 'updated_at', updated_at, 'church_id', church_id) FROM public.devotional_content ORDER BY day_number, created_at;"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"Error fetching data: {result.stderr}")
        return

    rows = [json.loads(line) for line in result.stdout.strip().split('\n') if line.strip()]
    
    default_prayer = "Senhor, guia-me pela tua Palavra e ajuda-me a viver este ensinamento hoje. Amém."
    
    file_path = "public_data/public_data_devotional_content.sql"
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("-- Fix: Replacing NULL prayer with default text\n\n")
        
        chunk_size = 50 # Small chunks as requested
        for i in range(0, len(rows), chunk_size):
            chunk = rows[i:i + chunk_size]
            f.write("BEGIN;\n\n")
            f.write("INSERT INTO public.devotional_content (\n")
            f.write("  id, lesson_id, day_number, title, bible_text, bible_reference, reflection, practice, prayer, questions, created_at, updated_at, church_id\n")
            f.write(") VALUES\n")
            
            values_list = []
            for row in chunk:
                prayer = row['prayer']
                if prayer is None or not str(prayer).strip():
                    prayer = default_prayer
                
                vals = [
                    escape_sql(row['id']),
                    escape_sql(row['lesson_id']),
                    str(row['day_number']),
                    escape_sql(row['title']),
                    escape_sql(row['bible_text']),
                    escape_sql(row['bible_reference']),
                    escape_sql(row['reflection']),
                    escape_sql(row['practice']),
                    escape_sql(prayer),
                    escape_sql(row['questions']),
                    escape_sql(row['created_at']),
                    escape_sql(row['updated_at']),
                    escape_sql(row['church_id'])
                ]
                values_list.append(f"({', '.join(vals)})")
            
            f.write(",\n".join(values_list))
            f.write("\nON CONFLICT (id) DO NOTHING;\n\n")
            f.write("COMMIT;\n\n")

    print(f"Successfully generated {file_path}")

if __name__ == \"__main__\":
    main()
