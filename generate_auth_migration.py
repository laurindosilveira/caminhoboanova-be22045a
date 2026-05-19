import json

def escape(val):
    if val is None or val == 'NULL' or val == '<nil>':
        return 'NULL'
    return f"'{str(val).replace(\"'\", \"''\")}'"

def main():
    # I will process the 41 users here.
    # Since I can't easily pipe the text from previous turns into this script in one go,
    # I will create a command that does it.
    pass

