
document.addEventListener('DOMContentLoaded', function() {
  AOS.init();

  const db = firebase.firestore();
  const storage = firebase.storage();
  const profileGrid = document.getElementById('profile-grid');
  const searchBar = document.getElementById('search-bar');

  let allProfiles = [];
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  if (isAdmin) {
    document.body.classList.add('admin-mode');
  }

  searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProfiles = allProfiles.filter(profile => 
      profile.fullName.toLowerCase().includes(searchTerm)
    );
    renderProfiles(filteredProfiles);
  });

  function fetchAndRenderProfiles() {
    db.collection('studentProfiles').orderBy('createdAt', 'desc').get()
      .then(snapshot => {
        allProfiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      <div class="card profile-card" data-aos="fade-up" id="profile-${profile.id}">
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
        ${isAdmin ? `<button class="delete-btn" data-id="${profile.id}" data-image-path="${profile.profileImagePath}">Delete</button>` : ''}
      </div>
    `).join('');

    AOS.refresh();
  }

  profileGrid.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const profileId = e.target.dataset.id;
      const imagePath = e.target.dataset.imagePath;

      if (confirm('Are you sure you want to delete this profile?')) {
        try {
          await db.collection('studentProfiles').doc(profileId).delete();
          
          if (imagePath) {
            await storage.ref(imagePath).delete();
          }

          document.getElementById(`profile-${profileId}`).remove();
          alert('Profile deleted successfully.');

        } catch (error) {
          console.error('Error deleting profile:', error);
          alert('Failed to delete profile. Check the console for details.');
        }
      }
    }
  });

  fetchAndRenderProfiles();
});
