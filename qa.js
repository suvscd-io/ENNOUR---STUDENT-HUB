
document.addEventListener('DOMContentLoaded', () => {
    const qaList = document.getElementById('qa-list');
    const questionForm = document.getElementById('question-form');

    const db = firebase.firestore();
    const questionsRef = db.collection('questions');

    // Function to render questions
    const renderQuestion = (doc) => {
        const question = doc.data();
        const questionId = doc.id;

        const qaItem = document.createElement('div');
        qaItem.classList.add('qa-item');
        qaItem.innerHTML = `
            <div class="question">${question.text}</div>
            <div class="answers"></div>
            <form class="answer-form" data-question-id="${questionId}">
                <textarea rows="3" placeholder="Write an answer..." required></textarea>
                <button type="submit" class="btn btn-secondary">Submit Answer</button>
            </form>
        `;

        // Render existing answers
        const answersContainer = qaItem.querySelector('.answers');
        const answersRef = questionsRef.doc(questionId).collection('answers').orderBy('createdAt', 'asc');

        answersRef.onSnapshot(snapshot => {
            answersContainer.innerHTML = '';
            snapshot.forEach(answerDoc => {
                const answer = answerDoc.data();
                const answerDiv = document.createElement('div');
                answerDiv.classList.add('answer');
                answerDiv.innerHTML = `<p>${answer.text}</p>`;
                answersContainer.appendChild(answerDiv);
            });
        });

        qaList.appendChild(qaItem);

        // Handle answer submission
        const answerForm = qaItem.querySelector('.answer-form');
        answerForm.addEventListener('submit', e => {
            e.preventDefault();
            const answerText = answerForm.querySelector('textarea').value.trim();
            if (answerText) {
                questionsRef.doc(questionId).collection('answers').add({
                    text: answerText,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    answerForm.reset();
                });
            }
        });
    };

    // Fetch and render all questions
    questionsRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        qaList.innerHTML = '';
        snapshot.forEach(renderQuestion);
    });

    // Handle question submission
    questionForm.addEventListener('submit', e => {
        e.preventDefault();
        const questionText = document.getElementById('question-text').value.trim();
        if (questionText) {
            questionsRef.add({
                text: questionText,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                questionForm.reset();
            });
        }
    });
});
