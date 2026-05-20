import subprocess
import csv
import io

def get_data():
    cmd = ["psql", "-c", "COPY (SELECT * FROM public.devotional_content) TO STDOUT WITH CSV HEADER"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return None
    return result.stdout

def get_fallback_prayer(title):
    prayers = {
        "O problema do pecado": "Senhor, ajuda-me a reconhecer meus erros e a buscar o Teu perdão todos os dias. Amém.",
        "Vivendo a Nova Identidade": "Pai, obrigado por me dar uma nova identidade em Cristo. Que eu viva para a Tua glória. Amém.",
        "Não preciso provar meu valor": "Senhor, descanso no fato de que meu valor vem de Ti e não do que eu faço. Amém.",
        "O que é redenção?": "Obrigado, Jesus, por me resgatar e me dar uma nova vida através do Teu sacrifício. Amém.",
        "Nova criação": "Espírito Santo, continua a obra de transformação em minha vida, fazendo tudo novo. Amém.",
        "Aceitos pela graça": "Pai, agradeço por ser aceito não por meus méritos, mas pela Tua infinita graça. Amém."
    }
    return prayers.get(title, "Senhor, obrigado por este momento de reflexão. Que Tua palavra guie meus passos. Amém.")

def format_value(val, col_name, row, data_type):
    if col_name == "prayer" and (val == "" or val is None or val == "NULL"):
        val = get_fallback_prayer(row["title"])
    
    if val == "" or val is None or val == "NULL":
        return "NULL"
    
    if data_type == "ARRAY":
        if val.startswith('{') and val.endswith('}'):
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
        return "NULL"
        
    if data_type in ["uuid", "timestamp with time zone", "text"]:
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    
    if data_type == "integer":
        return val
        
    return val

def main():
    csv_data = get_data()
    if not csv_data:
        return

    reader = csv.DictReader(io.StringIO(csv_data))
    records = list(reader)
    
    columns = ["id", "activity_id", "bible_text", "bible_reference", "reflection", "prayer", "practice", "questions", "created_at", "updated_at", "lesson_id", "day_number", "title", "worship_song_id", "church_id"]
    
    types = {
        "id": "uuid", "activity_id": "uuid", "bible_text": "text", "bible_reference": "text",
        "reflection": "text", "prayer": "text", "practice": "text", "questions": "ARRAY",
        "created_at": "timestamp with time zone", "updated_at": "timestamp with time zone",
        "lesson_id": "uuid", "day_number": "integer", "title": "text",
        "worship_song_id": "uuid", "church_id": "uuid"
    }

    output_file = "public_data_devotional_content.sql"
    
    with open(output_file, "w") as f:
        f.write("-- Data for public.devotional_content (Fixed prayer column)\n")
        
        for i in range(0, len(records), 200):
            chunk = records[i:i+200]
            f.write(f"\nINSERT INTO public.devotional_content ({', '.join(columns)})\nVALUES\n")
            
            values_list = []
            for row in chunk:
                vals = [format_value(row[col], col, row, types[col]) for col in columns]
                values_list.append(f"({', '.join(vals)})")
            
            f.write(",\n".join(values_list))
            f.write("\nON CONFLICT DO NOTHING;\n")

    print(f"Generated {output_file} with {len(records)} records.")

if __name__ == "__main__":
    main()
