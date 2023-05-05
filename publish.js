const fs = require('fs');
const { execSync } = require('child_process');
const program = require('commander');
const standardVersion = require('standard-version');

program
  .option('-m, --message <path>', 'Path to commit message file') // Add the option before parse()
  .parse(process.argv);

async function main() {
  const commitMessagePath = program.opts().message;
  const changelogPath = 'CHANGELOG.md';
  const defaultCommitMessage = 'Update';
  const commitMessage = commitMessagePath ? fs.readFileSync(commitMessagePath, 'utf8').trim() : defaultCommitMessage;

  if (!commitMessagePath) {
    console.error('Error: No commit message path provided.');
    return;
  }



  // Set git user name and email
  execSync(`git config --local user.name "PosetMage"`);
  execSync(`git config --local user.email "posetmage@gmail.com"`);

  // Get the current version
  const packageJsonPath = 'package.json';
  const packageData = fs.readFileSync(packageJsonPath, 'utf8');
  const { version: currentVersion } = JSON.parse(packageData);

  // Run git commands
  execSync(`git add .`);
  execSync(`git commit -m "v${currentVersion}: ${commitMessage.replace(/"/g, '\\"')}"`);
  execSync(`git push`);

  // Update the version using standard-version with the custom release commit message format
  await standardVersion({
    infile: changelogPath,
    releaseCommitMessageFormat: `chore(release): v{{currentTag}} - {{#${commitMessage}}}${commitMessage}{{/${commitMessage}}}`,
  });

  // Get the new version
  const updatedPackageData = fs.readFileSync(packageJsonPath, 'utf8');
  const { version: newVersion } = JSON.parse(updatedPackageData);

  // Package the extension
  execSync(`vsce package`);

  // Publish the extension
  const tokenPath = 'C:\\PosetMage\\Package\\_token\\azure_token';
  const token = fs.readFileSync(tokenPath, 'utf8').trim();
  execSync(`vsce publish --pat ${token}`);
}

main();