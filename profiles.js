
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init();

  // Firebase services
  const db = firebase.firestore();

  // DOM elements
  const profileDirectory = document.getElementById('profile-directory');
  const searchBar = document.getElementById('search-bar');

  let allProfiles = []; // To store all profiles for searching

  // --- Event Listeners ---
  searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProfiles = allProfiles.filter(profile => 
      profile.name.toLowerCase().includes(searchTerm)
    );
    renderProfileDirectory(filteredProfiles);
  });

  // --- Functions ---
  function listenToProfilesDirectory() {
    const q = db.collection('studentProfiles').orderBy('createdAt', 'desc');
    q.onSnapshot(snapshot => {
      allProfiles = snapshot.docs.map(doc => doc.data());
      renderProfileDirectory(allProfiles);
    }, error => {
      console.error('Error listening to profiles:', error);
      profileDirectory.innerHTML = '<p>Error loading profiles. Please try again later.</p>';
    });
  }

  function renderProfileDirectory(profiles) {
    if (!profileDirectory) return;

    if (!profiles || profiles.length === 0) {
      profileDirectory.innerHTML = '<p>No profiles found.</p>';
      return;
    }

    profileDirectory.innerHTML = profiles.map(profile => `
      <div class="profile-card" data-aos="fade-up">
        <img src="${profile.profileImageUrl || 'images/default-avatar.png'}" alt="${profile.name}" class="profile-avatar">
        <h3>${profile.name || 'Anonymous'}</h3>
        <p>${profile.description || 'No description provided.'}</p>
        <div class="social-links">
          ${profile.socialMedia?.github ? `<a href="${profile.socialMedia.github}" target="_blank" rel="noopener noreferrer"><img src="images/github.svg" alt="GitHub"></a>` : ''}
          ${profile.socialMedia?.linkedin ? `<a href="${profile.socialMedia.linkedin}" target="_blank" rel="noopener noreferrer"><img src="images/linkedin.svg" alt="LinkedIn"></a>` : ''}
          ${profile.socialMedia?.twitter ? `<a href="${profile.socialMedia.twitter}" target="_blank" rel="noopener noreferrer"><img src="images/twitter.svg" alt="Twitter"></a>` : ''}
          ${profile.socialMedia?.instagram ? `<a href="${profile.socialMedia.instagram}" target="_blank" rel="noopener noreferrer"><img src="images/instagram.svg" alt="Instagram"></a>` : ''}
        </div>
      </div>
    `).join('');
    
    // Use a timeout to ensure the DOM is updated before refreshing AOS
    setTimeout(() => AOS.refresh(), 100);
  }

  // --- Initial Load ---
  listenToProfilesDirectory();
});
