import os
from datetime import datetime

def getFileName():
    now = datetime.now()
    dt_string = now.strftime("%d_%m_%Y_%H_%M_%S")
    filename = f"{dt_string}.dump.sql"
    return filename

command = input("Backup or restore? ")

if command == "backup" or command == "Backup":
    # backup
    cwd = os.getcwd()
    filename = f"{cwd}/dumps/{getFileName()}"
    os.chdir('C:/xampp/mysql/bin')
    os.system(f"mysqldump -u root -p nodejsmessageapp > {filename}")
    print(f"Dumped database to {filename}")

elif command == "restore" or command == "Restore":
    # restore
    inputFileName = input("Filename to restore from:> ")
    os.system(f"mysql -u root -p nodejsmessageapp < dumps/{inputFileName}")
    print(f"Restored from {inputFileName}")