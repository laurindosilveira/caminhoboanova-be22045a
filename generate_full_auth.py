import json
import sqlite3
import os

# We will simulate the data structure from the tool output string
# Since we have only 41 users, we can handle it if we get the full text.
# The tool output was truncated, so I'll fetch in 2 batches of 25.

