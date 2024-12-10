const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'thuanpham582002';
const REPO_NAME = 'thuanpham582002';
const HIGHLIGHTS_PATH = 'data/highlights.json';

async function getGithubToken() {
    console.log('Attempting to retrieve GitHub token from storage...');
    const { githubToken, enableGithubSync } = await chrome.storage.sync.get(['githubToken', 'enableGithubSync']);
    
    if (!enableGithubSync) {
        console.log('GitHub sync is disabled');
        return null;
    }
    
    if (!githubToken) {
        console.warn('No GitHub token found in storage');
        return null;
    }

    // Validate token format (basic check)
    if (!githubToken.startsWith('ghp_')) {
        console.error('Invalid GitHub token format');
        return null;
    }

    console.log('GitHub token retrieved successfully');
    return githubToken;
}

async function updateGithubFile(content) {
    console.log('Starting updateGithubFile process...');
    const token = await getGithubToken();
    if (!token) {
        console.warn('No GitHub token available. Aborting updateGithubFile.');
        return;
    }

    try {
        console.log('Fetching current highlights file from GitHub...');
        // First get the current file (if it exists) to get its SHA
        const currentFileResponse = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${HIGHLIGHTS_PATH}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        let sha;
        if (currentFileResponse.ok) {
            const currentFile = await currentFileResponse.json();
            sha = currentFile.sha;
            console.log('Existing highlights file found. SHA:', sha);
        } else {
            console.log('No existing highlights file found. A new file will be created.');
        }

        // Prepare the content
        const contentString = JSON.stringify(content, null, 2);
        const contentBase64 = btoa(unescape(encodeURIComponent(contentString))); // Handle UTF-8 properly
        console.log('Content prepared for upload.');

        // Update or create the file
        console.log('Sending update/create request to GitHub...');
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${HIGHLIGHTS_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update highlights',
                    content: contentBase64,
                    ...(sha && { sha }) // Only include sha if file exists
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('GitHub sync failed with response:', errorData);
            throw new Error(`Failed to sync with GitHub: ${errorData.message}`);
        }

        const result = await response.json();
        console.log('GitHub sync successful:', result);
        return result;
    } catch (error) {
        console.error('GitHub sync failed:', error);
        throw error;
    }
}

// Helper function to test the connection
async function testGithubConnection() {
    console.log('Testing GitHub connection...');
    const token = await getGithubToken();
    if (!token) {
        console.error('No GitHub token found. Cannot test connection.');
        throw new Error('No GitHub token found');
    }

    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            console.error('Failed to connect to GitHub. Response status:', response.status);
            throw new Error('Failed to connect to GitHub');
        }

        console.log('GitHub connection test successful.');
        return true;
    } catch (error) {
        console.error('GitHub connection test failed:', error);
        throw error;
    }
}

async function fetchGithubHighlights() {
    const token = await getGithubToken();
    if (!token) return null;

    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${HIGHLIGHTS_PATH}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch highlights from GitHub');
            return null;
        }

        const data = await response.json();
        const content = atob(data.content);
        return JSON.parse(content);
    } catch (error) {
        console.error('Error fetching highlights from GitHub:', error);
        return null;
    }
}

export { updateGithubFile, testGithubConnection, fetchGithubHighlights };