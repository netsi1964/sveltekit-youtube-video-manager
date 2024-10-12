<script>
  // ... existing imports and code ...
  
  async function uploadToGitHub() {
    const token = prompt("Enter your GitHub personal access token:");
    const repo = prompt("Enter your GitHub repository (format: username/repo):");
    
    if (!token || !repo) {
      alert("Token and repository are required.");
      return;
    }
    
    const response = await fetch('/api/github-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, repo }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert("Project successfully uploaded to GitHub!");
    } else {
      alert("Failed to upload project: " + result.error);
    }
  }
</script>

<!-- Add this button somewhere in your existing HTML -->
<button on:click={uploadToGitHub} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
  Upload to GitHub
</button>