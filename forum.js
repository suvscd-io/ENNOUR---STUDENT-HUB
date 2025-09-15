
document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const mainNav = document.getElementById('main-nav');

  auth.onAuthStateChanged(user => {
    if (user) {
      mainNav.innerHTML = `
        <a href="index.html">Home</a>
        <a href="resources.html">Resources</a>
        <a href="forum.html">Forum</a>
        <a href="contact.html">Contact</a>
        <button id="logout-button" class="btn btn-secondary">Logout</button>
      `;
    } else {
      mainNav.innerHTML = `
        <a href="index.html">Home</a>
        <a href="resources.html">Resources</a>
        <a href="forum.html">Forum</a>
        <a href="contact.html">Contact</a>
        <a href="login.html" class="btn btn-primary">Login</a>
      `;
    }
  });

  // Forum Page
  if (window.location.pathname.includes('forum.html')) {
    const postsContainer = document.getElementById('posts-container');
    db.collection('posts').orderBy('createdAt', 'desc').get().then(snapshot => {
      postsContainer.innerHTML = snapshot.docs.map(doc => {
        const post = doc.data();
        return `
          <div class="post-item">
            <h3><a href="post.html?id=${doc.id}">${post.title}</a></h3>
            <p>Posted by ${post.authorEmail} on ${new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</p>
          </div>
        `;
      }).join('');
    });
  }

  // Create Post Page
  if (window.location.pathname.includes('create-post.html')) {
    const createPostForm = document.getElementById('create-post-form');
    createPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) {
        window.location.href = 'login.html';
        return;
      }
      const title = document.getElementById('post-title').value;
      const content = document.getElementById('post-content').value;
      const statusDiv = document.getElementById('form-status');
      try {
        await db.collection('posts').add({
          title,
          content,
          authorId: user.uid,
          authorEmail: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        statusDiv.textContent = 'Post created successfully! Redirecting...';
        statusDiv.style.color = 'green';
        setTimeout(() => window.location.href = 'forum.html', 2000);
      } catch (error) {
        statusDiv.textContent = error.message;
        statusDiv.style.color = 'red';
      }
    });
  }

  // Post Page
  if (window.location.pathname.includes('post.html')) {
    const postId = new URLSearchParams(window.location.search).get('id');
    const postContainer = document.getElementById('post-container');
    const answersContainer = document.getElementById('answers-container');
    const answerFormContainer = document.getElementById('answer-form-container');

    db.collection('posts').doc(postId).get().then(doc => {
      const post = doc.data();
      postContainer.innerHTML = `
        <h1>${post.title}</h1>
        <p>${post.content}</p>
        <p>Posted by ${post.authorEmail} on ${new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</p>
      `;
    });

    db.collection('posts').doc(postId).collection('answers').orderBy('createdAt', 'desc').get().then(snapshot => {
      answersContainer.innerHTML = '<h2>Answers</h2>' + snapshot.docs.map(doc => {
        const answer = doc.data();
        return `
          <div class="answer-item">
            <p>${answer.content}</p>
            <p>Answered by ${answer.authorEmail} on ${new Date(answer.createdAt.seconds * 1000).toLocaleDateString()}</p>
          </div>
        `;
      }).join('');
    });

    auth.onAuthStateChanged(user => {
      if (user) {
        answerFormContainer.innerHTML = `
          <h2>Your Answer</h2>
          <form id="answer-form">
            <div class="form-group">
              <textarea id="answer-content" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Post Answer</button>
          </form>
        `;
        const answerForm = document.getElementById('answer-form');
        answerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const content = document.getElementById('answer-content').value;
          try {
            await db.collection('posts').doc(postId).collection('answers').add({
              content,
              authorId: user.uid,
              authorEmail: user.email,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            window.location.reload();
          } catch (error) {
            alert(error.message);
          }
        });
      } else {
        answerFormContainer.innerHTML = '<p><a href="login.html">Log in</a> to post an answer.</p>';
      }
    });
  }
});
