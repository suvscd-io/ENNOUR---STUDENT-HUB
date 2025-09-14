
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS
  AOS.init();
  
  // Firebase services
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

  // DOM elements
  const profilesPage = document.getElementById('profiles-page');
  const siteHeader = document.getElementById('site-header');

  // --- Event Delegation for dynamically added elements ---
  document.body.addEventListener('click', (e) => {
    if (e.target.id === 'google-signin-btn') signInWithGoogle();
    if (e.target.id === 'signout-btn') auth.signOut();
    if (e.target.id === 'my-profile-btn') showProfileEditor(auth.currentUser);
    if (e.target.id === 'close-modal-btn') closeModal();
    if (e.target.closest('.modal-overlay') && e.target.id === 'profile-modal') closeModal();
  });

  // --- Authentication State Observer ---
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('User is signed in:', user);
      renderAuthenticatedView(user);
    } else {
      console.log('User is signed out.');
      renderSignedOutView();
    }
  });

  // --- UI Rendering ---
  function renderAuthenticatedView(user) {
    // Add Sign-out button to header if it doesn't exist
    if (!document.getElementById('signout-btn')) {
      const signOutBtn = document.createElement('button');
      signOutBtn.id = 'signout-btn';
      signOutBtn.className = 'btn btn-secondary';
      signOutBtn.innerText = 'Sign Out';
      siteHeader.querySelector('.nav-row').appendChild(signOutBtn);
    }

    // Main content
    profilesPage.innerHTML = `
      <div class="profiles-header">
        <h2>Student Profiles</h2>
        <button id="my-profile-btn" class="btn btn-primary">My Profile</button>
      </div>
      <div id="profile-directory" class="profile-grid">
        <!-- Profiles will be rendered here -->
      </div>
    `;
    
    // Listen to all profiles for the directory view
    listenToProfilesDirectory(
      profiles => renderProfileDirectory(profiles),
      error => {
        console.error('Error listening to profiles:', error);
        document.getElementById('profile-directory').innerHTML = '<p>Error loading profiles. Please try again later.</p>';
      }
    );
  }

  function renderSignedOutView() {
    // Remove sign-out button
    const signOutBtn = document.getElementById('signout-btn');
    if (signOutBtn) signOutBtn.remove();
    
    // Show sign-in prompt
    profilesPage.innerHTML = `
      <div class="auth-container" style="text-align: center; padding: 50px 0;">
        <h2>Student Profiles</h2>
        <p>Please sign in to view and create profiles.</p>
        <button id="google-signin-btn" class="btn btn-primary">Sign in with Google</button>
      </div>
    `;
  }

  function renderProfileDirectory(profiles) {
    const directory = document.getElementById('profile-directory');
    if (!directory) return;

    if (!profiles || profiles.length === 0) {
      directory.innerHTML = '<p>No profiles created yet. Be the first!</p>';
      return;
    }

    directory.innerHTML = profiles.map(profile => `
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
  
  // --- Profile Editor Modal ---
  function showProfileEditor(user) {
    if(!user) return;
    const uid = user.uid;
    const docRef = db.collection('studentProfiles').doc(uid);

    docRef.get().then(doc => {
      const profile = doc.exists ? doc.data() : {};
      
      const modalHtml = `
        <div id="profile-modal" class="modal-overlay">
          <div class="modal-content">
            <button id="close-modal-btn" class="modal-close">&times;</button>
            <h2>${doc.exists ? 'Edit' : 'Create'} Your Profile</h2>
            
            <form id="profile-form">
              <div class="form-group avatar-upload">
                <img id="image-preview" src="${profile.profileImageUrl || 'images/default-avatar.png'}" alt="Profile image preview">
                <input type="file" id="image-file-input" accept="image/*" style="display: none;">
                <label for="image-file-input" class="btn btn-secondary">Choose Image</label>
                <div id="upload-progress" class="progress-bar" style="display: none;">
                  <div id="upload-progress-fill"></div>
                </div>
              </div>

              <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" value="${profile.name || ''}" required>
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" rows="3">${profile.description || ''}</textarea>
              </div>

              <fieldset>
                <legend>Social Media</legend>
                <div class="form-group">
                  <label for="github">GitHub</label>
                  <input type="url" id="github" placeholder="https://github.com/..." value="${profile.socialMedia?.github || ''}">
                </div>
                <div class="form-group">
                  <label for="linkedin">LinkedIn</label>
                  <input type="url" id="linkedin" placeholder="https://linkedin.com/in/..." value="${profile.socialMedia?.linkedin || ''}">
                </div>
                 <div class="form-group">
                  <label for="twitter">Twitter</label>
                  <input type="url" id="twitter" placeholder="https://twitter.com/..." value="${profile.socialMedia?.twitter || ''}">
                </div>
                 <div class="form-group">
                  <label for="instagram">Instagram</label>
                  <input type="url" id="instagram" placeholder="https://instagram.com/..." value="${profile.socialMedia?.instagram || ''}">
                </div>
              </fieldset>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      // Event Listeners for the modal
      document.getElementById('image-file-input').addEventListener('change', previewImage);
      document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile(user, profile.createdAt);
      });
    }).catch(error => console.error("Error fetching profile:", error));
  }

  function closeModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.remove();
  }

  function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File is too large. Please select an image under 5MB.');
        event.target.value = ''; // Reset file input
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('image-preview').src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Firebase Interactions ---
  
  // Sign-in
  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Error signing in. Please try again.');
    }
  }

  // Save profile (Create/Update)
  async function saveProfile(user, existingCreatedAt) {
    const uid = user.uid;
    const fileInput = document.getElementById('image-file-input');
    const file = fileInput.files[0];
    let profileImageUrl = document.getElementById('image-preview').src;

    const submitBtn = document.querySelector('#profile-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Saving...';

    try {
      // 1. Upload image if a new one is selected
      if (file) {
        profileImageUrl = await uploadProfileImage(uid, file, percent => {
          const progressFill = document.getElementById('upload-progress-fill');
          const progressBar = document.getElementById('upload-progress');
          if(progressBar) progressBar.style.display = 'block';
          if(progressFill) progressFill.style.width = `${percent}%`;
        });
      }

      // 2. Construct profile payload
      const docRef = db.collection('studentProfiles').doc(uid);
      const now = firebase.firestore.FieldValue.serverTimestamp();
      const payload = {
        uid: uid,
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        profileImageUrl: profileImageUrl,
        socialMedia: {
          github: document.getElementById('github').value,
          linkedin: document.getElementById('linkedin').value,
          twitter: document.getElementById('twitter').value,
          instagram: document.getElementById('instagram').value,
        },
        updatedAt: now,
      };

      if (!existingCreatedAt) {
         payload.createdAt = now;
      }

      // 3. Save to Firestore
      await docRef.set(payload, { merge: true });

      closeModal();
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Could not save profile. Please check the console for details.');
      submitBtn.disabled = false;
      submitBtn.innerText = 'Save Profile';
    }
  }

  // Image Upload
  function uploadProfileImage(uid, file, onProgress) {
    const filePath = `profile_images/${uid}/${file.name}`;
    const fileRef = storage.ref(filePath);
    const uploadTask = fileRef.put(file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        snapshot => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(percent);
        },
        error => {
          console.error('Upload Error:', error);
          reject(error);
        },
        async () => {
          try {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }
  
  // Real-time listener for directory
  function listenToProfilesDirectory(onData, onError) {
    const q = db.collection('studentProfiles').orderBy('createdAt', 'desc');
    return q.onSnapshot(snapshot => {
      const profiles = snapshot.docs.map(doc => doc.data());
      onData(profiles);
    }, onError);
  }
});
