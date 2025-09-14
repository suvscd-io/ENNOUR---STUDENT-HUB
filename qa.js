
document.addEventListener('DOMContentLoaded', () => {
    const qaList = document.getElementById('qa-list');
    const questionForm = document.getElementById('question-form');
    const submitQuestionBtn = document.getElementById('submit-question-btn');
    const loader = document.getElementById('loader');
    const toastContainer = document.getElementById('toast-container');

    const db = firebase.firestore();
    const questionsRef = db.collection('questions');

    let isSubmitting = false;

    // --- UTILITY FUNCTIONS ---

    const showToast = (message, isError = false) => {
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    const toggleSpinner = (button, show) => {
        const btnText = button.querySelector('.btn-text');
        const btnSpinner = button.querySelector('.btn-spinner');
        if (show) {
            button.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'inline-block';
        } else {
            button.disabled = false;
            btnText.style.display = 'inline-block';
            btnSpinner.style.display = 'none';
        }
    };

    // --- CORE FUNCTIONS ---

    const renderQuestion = (doc) => {
        const question = doc.data();
        const questionId = doc.id;

        const qaItem = document.createElement('div');
        qaItem.className = 'qa-item card-style';
        qaItem.id = questionId;

        qaItem.innerHTML = `
            <div class="qa-item-header">
                <p class="question">${question.text}</p>
                <button class="share-btn" title="Copy link to this question">
                    <img src="images/link-icon.svg" alt="Share">
                </button>
            </div>
            <div class="answers">
                <div class="loader-small"></div>
            </div>
            <form class="answer-form" data-question-id="${questionId}">
                <div class="form-group">
                    <textarea rows="3" placeholder="Write an answer..." required></textarea>
                </div>
                <button type="submit" class="btn btn-secondary">
                    <span class="btn-text">Submit Answer</span>
                    <span class="btn-spinner" style="display: none;"></span>
                </button>
            </form>
        `;

        qaList.appendChild(qaItem);

        // Share button functionality
        qaItem.querySelector('.share-btn').addEventListener('click', () => {
            const url = `${window.location.origin}${window.location.pathname}#${questionId}`;
            navigator.clipboard.writeText(url).then(() => {
                showToast('Link copied to clipboard!');
            }).catch(err => {
                showToast('Failed to copy link.', true);
                console.error('Copy failed:', err);
            });
        });

        // Handle answer submission
        const answerForm = qaItem.querySelector('.answer-form');
        const submitAnswerBtn = answerForm.querySelector('button');
        answerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isSubmitting) return;

            const textarea = answerForm.querySelector('textarea');
            const answerText = textarea.value.trim();
            
            if (answerText) {
                isSubmitting = true;
                toggleSpinner(submitAnswerBtn, true);
                try {
                    await questionsRef.doc(questionId).collection('answers').add({
                        text: answerText,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    textarea.value = '';
                    showToast('Answer submitted successfully!');
                } catch (error) {
                    console.error("Error submitting answer: ", error);
                    showToast('Failed to submit answer. Please try again.', true);
                } finally {
                    isSubmitting = false;
                    toggleSpinner(submitAnswerBtn, false);
                }
            }
        });

        // Fetch and render answers
        const answersContainer = qaItem.querySelector('.answers');
        questionsRef.doc(questionId).collection('answers').orderBy('createdAt', 'asc').onSnapshot(snapshot => {
            answersContainer.innerHTML = ''; // Clear previous answers/loader
            if (snapshot.empty) {
                answersContainer.innerHTML = '<p class="no-answers-yet">No answers yet. Be the first to reply!</p>';
            } else {
                snapshot.forEach(answerDoc => {
                    const answer = answerDoc.data();
                    const answerDiv = document.createElement('div');
                    answerDiv.className = 'answer';
                    answerDiv.innerHTML = `<p>${answer.text}</p>`;
                    answersContainer.appendChild(answerDiv);
                });
            }
        }, error => {
            console.error("Error fetching answers: ", error);
            answersContainer.innerHTML = '<p class="no-answers-yet" style="color: red;">Could not load answers.</p>';
        });
    };

    const scrollToQuestion = (questionId) => {
        const element = document.getElementById(questionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight');
            setTimeout(() => element.classList.remove('highlight'), 2000);
        }
    };

    // --- INITIALIZATION ---

    let firstLoad = true;
    questionsRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        if (firstLoad) {
            loader.style.display = 'none';
        }
        qaList.innerHTML = '';
        snapshot.forEach(renderQuestion);

        if (firstLoad && window.location.hash) {
            const questionId = window.location.hash.substring(1);
            // Use a short delay to ensure the element is in the DOM
            setTimeout(() => scrollToQuestion(questionId), 100);
        }
        firstLoad = false;
        
    }, error => {
        console.error("Error fetching questions: ", error);
        loader.style.display = 'none';
        qaList.innerHTML = '<p style="text-align: center; color: red;">Failed to load questions. Please check your connection and refresh the page.</p>';
    });

    questionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const questionText = document.getElementById('question-text').value.trim();
        if (questionText) {
            isSubmitting = true;
            toggleSpinner(submitQuestionBtn, true);
            try {
                await questionsRef.add({
                    text: questionText,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                questionForm.reset();
                showToast('Question submitted successfully!');
            } catch (error) {
                console.error("Error adding question: ", error);
                showToast('Failed to submit question. Please try again.', true);
            } finally {
                isSubmitting = false;
                toggleSpinner(submitQuestionBtn, false);
            }
        }
    });
});

