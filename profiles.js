
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init();

  const db = firebase.firestore();
  const profileGrid = document.getElementById('profile-grid');
  const searchBar = document.getElementById('search-bar');

  let allProfiles = [];

  // Event Listeners
  searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProfiles = allProfiles.filter(profile => 
      profile.fullName.toLowerCase().includes(searchTerm)
    );
    renderProfiles(filteredProfiles);
  });

  // Functions
  function fetchAndRenderProfiles() {
    db.collection('studentProfiles').orderBy('createdAt', 'desc').get()
      .then(snapshot => {
        allProfiles = snapshot.docs.map(doc => doc.data());
        renderProfiles(allProfiles);
      })
      .catch(error => {
        console.error('Error fetching profiles:', error);
        profileGrid.innerHTML = '<p>Error loading profiles. Please try again later.</p>';
      });
  }

  function renderProfiles(profiles) {
    if (!profileGrid) return;

    if (profiles.length === 0) {
      profileGrid.innerHTML = '<p>No student profiles match your search or have been submitted yet.</p>';
      return;
    }

    profileGrid.innerHTML = profiles.map(profile => `
      <div class="card profile-card" data-aos="fade-up">
        <div class="card-header">
          <img src="${profile.profileImageUrl || 'images/default-avatar.png'}" alt="${profile.fullName}" class="profile-avatar">
          <div class="profile-identity">
            <h3>${profile.fullName}</h3>
            <p>${profile.schoolLevel} ${profile.branch ? ` - ${profile.branch}` : ''}</p>
          </div>
        </div>
        <div class="card-footer">
          ${profile.socialMedia?.instagram ? `<a href="${profile.socialMedia.instagram}" target="_blank"><img src="images/instagram.svg" alt="Instagram"></a>` : ''}
          ${profile.socialMedia?.discord ? `<a href="${profile.socialMedia.discord}" target="_blank"><img src="images/discord.svg" alt="Discord"></a>` : ''}
        </div>
      </div>
    `).join('');

    // Refresh AOS to apply animations to new elements
    AOS.refresh();
  }

  // Initial Load
  fetchAndRenderProfiles();
});
