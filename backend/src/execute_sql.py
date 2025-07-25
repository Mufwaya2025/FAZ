import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

def execute_sql_from_file(filepath):
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        with open(filepath, 'r') as f:
            sql_commands = f.read()
            # Split by semicolon to execute multiple commands if present
            for command in sql_commands.split(';'):
                if command.strip(): # Ensure command is not empty
                    cursor.execute(command)
        conn.commit()
        print(f"Successfully executed {filepath}")
    except Exception as e:
        print(f"Error executing {filepath}: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    schema_file = "C:/FAZ/faz-scores/database/postgresql_schema.sql"
    ads_table_file = "C:/FAZ/faz-scores/database/create_ads_table.sql"

    execute_sql_from_file(schema_file)
    execute_sql_from_file(ads_table_file)
