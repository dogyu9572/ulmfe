let lastFocusedElement;

document.querySelectorAll('.btn_popup').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const targetPopup = document.getElementById(targetId);
        
        if (targetPopup) {
            lastFocusedElement = this;
            targetPopup.classList.add('open'); 
            const closeBtn = targetPopup.querySelector('.btn_close');
            if (closeBtn) closeBtn.focus();
        }
    });
});

document.querySelectorAll('.btn_close, .popup .dm, .popup .btn_clo').forEach(element => {
    element.addEventListener('click', function() {
        const popup = this.closest('.popup');
        
        if (popup) {
            popup.classList.remove('open');
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        }
    });
});