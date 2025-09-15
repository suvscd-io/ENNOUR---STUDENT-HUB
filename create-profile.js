
document.addEventListener('DOMContentLoaded', function() {
  const db = firebase.firestore();
  const storage = firebase.storage();

  const profileForm = document.getElementById('create-profile-form');
  const imageFileInput = document.getElementById('profile-image');
  const submitBtn = profileForm.querySelector('button[type="submit"]');
  const formStatus = document.getElementById('form-status');

  profileForm.addEventListener('submit', saveProfile);

  async function saveProfile(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    formStatus.textContent = '';

    try {
      const file = imageFileInput.files[0];
      if (!file) {
        throw new Error('Profile image is required.');
      }

      const filePath = `profile_images/${Date.now()}_${file.name}`;
      const profileImageUrl = await uploadProfileImage(file, filePath);

      const docRef = db.collection('studentProfiles').doc();
      const now = firebase.firestore.FieldValue.serverTimestamp();
      const payload = {
        uid: docRef.id,
        fullName: document.getElementById('full-name').value,
        schoolLevel: document.getElementById('school-level').value,
        branch: document.getElementById('branch').value,
        profileImageUrl: profileImageUrl,
        profileImagePath: filePath, // Store the image path for deletion
        socialMedia: {
          instagram: document.getElementById('social-instagram').value,
          discord: document.getElementById('social-discord').value,
        },
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(payload);

      formStatus.textContent = 'Profile created successfully!';
      formStatus.style.color = 'green';
      setTimeout(() => {
        window.location.href = 'profiles.html';
      }, 2000);

    } catch (error) {
      console.error('Error saving profile:', error);
      formStatus.textContent = `Error: ${error.message}`;
      formStatus.style.color = 'red';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Profile';
    }
  }

  function uploadProfileImage(file, filePath) {
    const fileRef = storage.ref(filePath);
    const uploadTask = fileRef.put(file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        null, 
        error => {
          console.error('Upload Error:', error);
          reject(new Error('Failed to upload image.'));
        },
        async () => {
          try {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            resolve(url);
          } catch (e) {
            reject(new Error('Could not get image URL.'));
          }
        }
      );
    });
  }
});
