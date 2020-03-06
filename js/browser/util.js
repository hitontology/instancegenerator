const REPO = "https://github.com/hitontology/instancegenerator";

/** Open a new issue on the GitHub repository.
@param {string} repo GIT repository URL
@param {string} title issue title
@param {string} body issue body text
@param {array} logs optional array of github markdown formatted log strings
*/
export function createGitHubIssue(title,body)
{
  const encodedBody = encodeURIComponent(body);
  window.open(`${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodedBody}`);
}
