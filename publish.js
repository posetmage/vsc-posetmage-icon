const fs = require('fs');
const { execSync } = require('child_process');
const standardVersion = require('standard-version');

async function main() {
  const packageJsonPath = 'package.json';
  const tokenPath = 'C:\\PosetMage\\Package\\_token\\azure_token';
  const changelogPath = 'CHANGELOG.md';
  execSync(`git config --local user.name "PosetMage"`);
  execSync(`git config --local user.email "posetmage@gmail.com"`);

  // Get the current version
  const packageData = fs.readFileSync(packageJsonPath, 'utf8');
  const { version: currentVersion } = JSON.parse(packageData);

  const commitMessagePath = process.argv[3] === '--changelog' ? process.argv[4] : null;
  const commitMessage = commitMessagePath ? fs.readFileSync(commitMessagePath, 'utf8').trim() : '';

  // Run git commands
  execSync(`git add .`);
  execSync(`git commit -m "v${currentVersion}: ${commitMessage}"`);
  execSync(`git push`);

  // Update the version using standard-version
  await standardVersion({
    infile: changelogPath,
    releaseCommitMessageFormat: `v{{currentTag}}: ${commitMessage}`,
  });

  // Get the new version
  const updatedPackageData = fs.readFileSync(packageJsonPath, 'utf8');
  const { version: newVersion } = JSON.parse(updatedPackageData);

  // Package the extension
  execSync(`vsce package`);

  // Publish the extension
  const token = fs.readFileSync(tokenPath, 'utf8').trim();
  execSync(`vsce publish --pat ${token}`);
}

main();