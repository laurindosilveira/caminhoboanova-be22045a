import os
import json
import subprocess

def run_query(query):
    result = subprocess.run(['psql', '-t', '-A', '-c', query], capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Query failed: {result.stderr}")
    return result.stdout.strip()

def get_data():
    # Use JSON to avoid parsing issues with special characters in responses
    query = """
    SELECT json_agg(t) FROM (
        SELECT lr.id, lr.user_id, lr.lesson_id, lr.question_key, lr.response, lr.created_at, lr.updated_at, lr.awarded_points, lr.override_release_id, lr.church_id
        FROM public.lesson_responses lr
        INNER JOIN public.lessons l ON lr.lesson_id = l.id
        INNER JOIN public.profiles p ON lr.user_id = p.user_id
        ORDER BY lr.created_at
    ) t;
    """
    data_str = run_query(query)
    if not data_str:
        return []
    return json.loads(data_str)

def format_value(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    # Escape single quotes for SQL
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

def main():
    data = get_data()
    if not data:
        print("No data found.")
        return

    output_path = "public_data/public_data_lesson_responses.sql"
    os.makedirs("public_data", exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("-- Migration for public.lesson_responses\n")
        
        batch_size = 100
        for i in range(0, len(data), batch_size):
            batch = data[i:i+batch_size]
            f.write("\nBEGIN;\n\n")
            f.write("INSERT INTO public.lesson_responses (\n")
            f.write("  id, user_id, lesson_id, question_key, response, created_at, updated_at, awarded_points, override_release_id, church_id\n")
            f.write(") VALUES\n")
            
            values_list = []
            for row in batch:
                vals = [
                    format_value(row['id']),
                    format_value(row['user_id']),
                    format_value(row['lesson_id']),
                    format_value(row['question_key']),
                    format_value(row['response']),
                    format_value(row['created_at']),
                    format_value(row['updated_at']),
                    format_value(row['awarded_points']),
                    format_value(row['override_release_id']),
                    format_value(row['church_id'])
                ]
                values_list.append(f"({', '.join(vals)})")
            
            f.write(",\n".join(values_list))
            f.write("\nON CONFLICT DO NOTHING;\n\n")
            f.write("COMMIT;\n")

    print(f"Generated {output_path} with {len(data)} records.")

if __name__ == "__main__":
    main()
