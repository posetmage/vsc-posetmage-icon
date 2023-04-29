const fs = require('fs');
const { execSync } = require('child_process');

function updateVersion(packageJsonPath) {
  const data = fs.readFileSync(packageJsonPath, 'utf8');
  const { version } = JSON.parse(data);
  const [major, minor, patch] = version.split('.').map(Number);
  
  // Increment the patch version
  const newPatch = patch + 1;

  const newVersion = `${major}.${minor}.${newPatch}`;
  const newData = { ...JSON.parse(data), version: newVersion };
  fs.writeFileSync(packageJsonPath, JSON.stringify(newData, null, 2));

  return newVersion;
}

function main() {
  const packageJsonPath = 'package.json';
  const tokenPath = 'C:\\PosetMage\\Package\\_token\\azure_token';

  const newVersion = updateVersion(packageJsonPath);

  // Run git commands
  execSync(`git add .`);
  execSync(`git commit -m "Update to version ${newVersion}"`);
  execSync(`git push`);

  // Package the extension
  execSync(`vsce package`);

  // Publish the extension
  const token = fs.readFileSync(tokenPath, 'utf8').trim();
  execSync(`vsce publish --pat ${token}`);
}

main();