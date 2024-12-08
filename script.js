document.querySelectorAll('.action-btn').forEach(button => {
    if (button.textContent === 'Complete') {
        button.addEventListener('click', () => {
            button.textContent = 'Completed';
            button.classList.add('completed');
            button.disabled = true;
        });
    }
});