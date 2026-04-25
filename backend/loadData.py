import json
import pandas as pd
import os

DATA_DIR = os.path.join(os.path.dirname(__file__),'data')

def load_all_datasets():
    datasets = {}
    
    json_files = [
        "careers.json",
        "graduatestats.json",
        "marketanalysis.json",
        "ondemandjobs.json",
        "skillmapping.json",
        "workforce.json"
    ]
    
    csv_files = [
        "courseinfo.csv",
        "job.csv" 
    ]

    for file_name in json_files:
        file_path = os.path.join(DATA_DIR, file_name)
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    datasets[file_name] = json.load(f)
                print(f"Loaded {file_name}")
            except Exception as e:
                print(f"Error loading {file_name}: {e}")
        else:
            print(f"{file_name} not found in {DATA_DIR}")

    for file_name in csv_files:
        file_path = os.path.join(DATA_DIR, file_name)
        if os.path.exists(file_path):
            try:
                df = pd.read_csv(file_path)
                
                df = df.fillna("") 
                
                datasets[file_name] = df.to_dict(orient="records")
                print(f"Loaded {file_name}")
            except Exception as e:
                print(f"Error loading {file_name}: {e}")
        else:
            print(f"{file_name} not found in {DATA_DIR}")
            
    return datasets

DATASETS = load_all_datasets()


