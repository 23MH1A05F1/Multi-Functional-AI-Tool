// Sidebar search bar submit logic and keyboard accessibility
const sidebarForm = document.getElementById('sidebar-chat-form');
const sidebarInput = document.getElementById('sidebar-chat-input');
const sidebarSearchBtn = document.getElementById('sidebar-search-btn');
if (sidebarForm && sidebarInput && sidebarSearchBtn) {
    sidebarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = sidebarInput.value.trim();
        if (query) {
            // Search inbuilt questions
            const match = inbuiltQA.find(item => item.q.toLowerCase() === query.toLowerCase());
            const chatContainer = document.getElementById('chat-container');
            if (chatContainer) {
                // Display user query
                const userMsgDiv = document.createElement('div');
                userMsgDiv.className = 'flex justify-end mb-4';
                userMsgDiv.innerHTML = `<div class="bg-blue-600 text-white rounded-xl px-4 py-2 max-w-lg break-words">${query}</div>`;
                chatContainer.querySelector('.max-w-4xl').appendChild(userMsgDiv);
                // Display answer or not found
                const aiMsgDiv = document.createElement('div');
                aiMsgDiv.className = 'flex justify-start mb-4';
                if (match) {
                    aiMsgDiv.innerHTML = `<div class='bg-white text-black rounded-xl px-4 py-2 max-w-lg break-words'>${match.a}</div>`;
                } else {
                    aiMsgDiv.innerHTML = `<div class='bg-red-600 text-white rounded-xl px-4 py-2 max-w-lg break-words'>No inbuilt answer found.</div>`;
                }
                chatContainer.querySelector('.max-w-4xl').appendChild(aiMsgDiv);
            }
            sidebarInput.value = '';
        }
    });
    sidebarInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sidebarForm.requestSubmit();
        }
    });
    sidebarSearchBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            sidebarForm.requestSubmit();
        }
    });
}

// Main chat input logic: display user message in chat area
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatContainer = document.getElementById('chat-container');
if (chatForm && chatInput && chatContainer) {
// Inbuilt questions and answers
const inbuiltQA = [
    { q: "What is AI?", a: "AI stands for Artificial Intelligence, which is the simulation of human intelligence in machines." },
    { q: "Who created Python?", a: "Python was created by Guido van Rossum and first released in 1991." },
    { q: "What is the capital of France?", a: "The capital of France is Paris." },
    { q: "What is 2 + 2?", a: "2 + 2 equals 4." },
    { q: "What is the use of Flask?", a: "Flask is a lightweight Python web framework for building web applications and APIs." }
];

// Render inbuilt questions as clickable buttons below chat input
document.addEventListener('DOMContentLoaded', function() {
    const chatInputBox = document.getElementById('chat-input');
    const chatFormBox = document.getElementById('chat-form');
    if (chatFormBox && chatInputBox) {
        const qaContainer = document.createElement('div');
        qaContainer.className = 'flex flex-wrap gap-2 my-4';
        inbuiltQA.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition';
            btn.textContent = item.q;
            btn.title = item.q;
            btn.onclick = function() {
                // Display user question
                const userMsgDiv = document.createElement('div');
                userMsgDiv.className = 'flex justify-end mb-4';
                userMsgDiv.innerHTML = `<div class="bg-blue-600 text-white rounded-xl px-4 py-2 max-w-lg break-words">${item.q}</div>`;
                chatContainer.querySelector('.max-w-4xl').appendChild(userMsgDiv);
                // Display answer instantly
                const aiMsgDiv = document.createElement('div');
                aiMsgDiv.className = 'flex justify-start mb-4';
                aiMsgDiv.innerHTML = `<div class='bg-white text-black rounded-xl px-4 py-2 max-w-lg break-words'>${item.a}</div>`;
                chatContainer.querySelector('.max-w-4xl').appendChild(aiMsgDiv);
            };
            qaContainer.appendChild(btn);
        });
        chatFormBox.parentNode.insertBefore(qaContainer, chatFormBox.nextSibling);
    }
});
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (userText) {
            // Remove welcome message if present
            const welcomeMsg = document.getElementById('welcome-message');
            if (welcomeMsg) welcomeMsg.style.display = 'none';
            // Display user message
            const userMsgDiv = document.createElement('div');
            userMsgDiv.className = 'flex justify-end mb-4';
            userMsgDiv.innerHTML = `<div class="bg-blue-600 text-white rounded-xl px-4 py-2 max-w-lg break-words">${userText}</div>`;
            chatContainer.querySelector('.max-w-4xl').appendChild(userMsgDiv);
            chatInput.value = '';
            chatInput.focus();

            // Show loading indicator for AI response
            const aiMsgDiv = document.createElement('div');
            aiMsgDiv.className = 'flex justify-start mb-4';
            aiMsgDiv.innerHTML = `<div class='bg-gray-700 text-white rounded-xl px-4 py-2 max-w-lg break-words animate-pulse'>Thinking...</div>`;
            chatContainer.querySelector('.max-w-4xl').appendChild(aiMsgDiv);

            // Send user question to backend
            try {
                const response = await fetch('http://127.0.0.1:5000/api/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: userText })
                });
                const data = await response.json();
                // Display AI response
                aiMsgDiv.innerHTML = `<div class='bg-white text-black rounded-xl px-4 py-2 max-w-lg break-words'>${data.reply}</div>`;
            } catch (err) {
                aiMsgDiv.innerHTML = `<div class='bg-red-600 text-white rounded-xl px-4 py-2 max-w-lg break-words'>Error: Could not get response from AI.</div>`;
            }
        }
    });
}
