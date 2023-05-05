const fs = require('fs');
const { execSync } = require('child_process');
const standardVersion = require('standard-version');

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

function updateReadme(version, readmePath) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const newReadme = readme.replace(/Version: \d+\.\d+\.\d+/g, `Version: ${version}`);
  fs.writeFileSync(readmePath, newReadme);
}

async function main() {
  const packageJsonPath = 'package.json';
  const tokenPath = 'C:\\PosetMage\\Package\\_token\\azure_token';
  const readmePath = 'README.md';
  const changelogPath = 'CHANGELOG.md';
  const newVersion = updateVersion(packageJsonPath);

  const commitMessagePath = process.argv[3] === '--changelog' ? process.argv[4] : null;
  const commitMessage = commitMessagePath ? fs.readFileSync(commitMessagePath, 'utf8').trim() : 'Update';

  // Add the new version to the first line of the commit message file
  if (commitMessagePath) {
    const updatedCommitMessage = `Version: ${newVersion}\n\n${commitMessage}`;
    fs.writeFileSync(commitMessagePath, updatedCommitMessage);
  }

  // Run git commands
  execSync(`git config --local user.name "PosetMage"`);
  execSync(`git config --local user.email "posetmage@gmail.com"`);
  execSync(`git add .`);
  execSync(`git commit -F ${commitMessagePath || '-'}`, { input: commitMessage });
  execSync(`git push`);

  // Update the version using standard-version
  await standardVersion({
    infile: changelogPath,
    releaseCommitMessageFormat: commitMessage || 'chore(release): {{currentTag}}',
  });

  // Update the README.md file
  updateReadme(newVersion, readmePath);

  // Package the extension
  execSync(`vsce package`);

  // Publish the extension
  const token = fs.readFileSync(tokenPath, 'utf8').trim();
  execSync(`vsce publish --pat ${token}`);
}

main();