import json
import os
import subprocess

def update_version(package_json_path):
    with open(package_json_path, 'r') as f:
        data = json.load(f)

    version = data['version']
    major, minor, patch = [int(x) for x in version.split('.')]
    
    # Increment the patch version
    patch += 1

    new_version = f"{major}.{minor}.{patch}"
    data['version'] = new_version

    with open(package_json_path, 'w') as f:
        json.dump(data, f, indent=2)

    return new_version

def main():
    package_json_path = "package.json"
    token_path = "C:\\PosetMage\\Package\\_token\\azure_token"

    new_version = update_version(package_json_path)

    # Run git commands
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", f"Update to version {new_version}"])
    subprocess.run(["git", "push"])

    # Package the extension
    subprocess.run(["vsce", "package"])

    # Publish the extension
    with open(token_path, "r") as f:
        token = f.read().strip()

    subprocess.run(["vsce", "publish", "--pat", token])

if __name__ == "__main__":
    main()