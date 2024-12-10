const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'thuanpham582002';
const REPO_NAME = 'thuanpham582002';
const HIGHLIGHTS_PATH = 'data/highlights.json';

async function getGithubToken() {
    const { githubToken } = await chrome.storage.sync.get('githubToken');
    return githubToken;
}

async function updateGithubFile(content) {
    const token = await getGithubToken();
    if (!token) return;

    try {
        // First get the current file (if it exists) to get its SHA
        const currentFileResponse = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${HIGHLIGHTS_PATH}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        let sha;
        if (currentFileResponse.ok) {
            const currentFile = await currentFileResponse.json();
            sha = currentFile.sha;
        }

        // Update or create the file
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${HIGHLIGHTS_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update highlights',
                    content: btoa(JSON.stringify(content, null, 2)),
                    sha: sha
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to sync with GitHub');
        }
    } catch (error) {
        console.error('GitHub sync failed:', error);
    }
}

export { updateGithubFile };