
document.addEventListener('DOMContentLoaded', function() {
  // Firebase services
  const db = firebase.firestore();
  const storage = firebase.storage();

  // DOM elements
  const profileForm = document.getElementById('profile-form');
  const imagePreview = document.getElementById('image-preview');
  const imageFileInput = document.getElementById('image-file-input');
  const uploadProgress = document.getElementById('upload-progress');
  const uploadProgressFill = document.getElementById('upload-progress-fill');
  const submitBtn = profileForm.querySelector('button[type="submit"]');

  // --- Event Listeners ---
  imageFileInput.addEventListener('change', previewImage);
  profileForm.addEventListener('submit', saveProfile);

  // --- Functions ---
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
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = 'Saving...';

    try {
      const file = imageFileInput.files[0];
      let profileImageUrl = imagePreview.src;

      if (file) {
        profileImageUrl = await uploadProfileImage(file, percent => {
          uploadProgress.style.display = 'block';
          uploadProgressFill.style.width = `${percent}%`;
        });
      }

      const docRef = db.collection('studentProfiles').doc(); // Create a new document with a random ID
      const now = firebase.firestore.FieldValue.serverTimestamp();
      const payload = {
        uid: docRef.id,
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        profileImageUrl: profileImageUrl,
        socialMedia: {
          github: document.getElementById('github').value,
          linkedin: document.getElementById('linkedin').value,
          twitter: document.getElementById('twitter').value,
          instagram: document.getElementById('instagram').value,
        },
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(payload);

      alert('Profile created successfully!');
      window.location.href = 'profiles.html';

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Could not save profile. Please check the console for details.');
      submitBtn.disabled = false;
      submitBtn.innerText = 'Save Profile';
    }
  }

  function uploadProfileImage(file, onProgress) {
    const filePath = `profile_images/${Date.now()}_${file.name}`;
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
});
