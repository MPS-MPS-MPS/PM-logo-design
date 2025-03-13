function initializeSlider(sliderClass, itemClass, nextId, prevId) {
    let items = document.querySelectorAll(`.${sliderClass} .${itemClass}`);
    let active = 3;
  
    function loadShow() {
      items.forEach((item, index) => {
        item.style.transform = `none`;
        item.style.zIndex = -Math.abs(index - active);
        item.style.filter = 'blur(5px)';
        item.style.opacity = 0.6;
      });
  
      items[active].style.transform = `none`;
      items[active].style.zIndex = 1;
      items[active].style.filter = 'none';
      items[active].style.opacity = 1;
  
      let stt = 0;
      for (let i = active + 1; i < items.length; i++) {
        stt++;
        items[i].style.transform = `translateX(${120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(-1deg)`;
        items[i].style.zIndex = -stt;
        items[i].style.filter = 'blur(5px)';
        items[i].style.opacity = stt > 2 ? 0 : 0.6;
      }
  
      stt = 0;
      for (let i = active - 1; i >= 0; i--) {
        stt++;
        items[i].style.transform = `translateX(${-120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(1deg)`;
        items[i].style.zIndex = -stt;
        items[i].style.filter = 'blur(5px)';
        items[i].style.opacity = stt > 2 ? 0 : 0.6;
      }
    }
  
    loadShow();
  
    let next = document.getElementById(nextId);
    let prev = document.getElementById(prevId);
  
    next.onclick = function () {
      active = active + 1 < items.length ? active + 1 : active;
      loadShow();
    };
  
    prev.onclick = function () {
      active = active - 1 >= 0 ? active - 1 : active;
      loadShow();
    };
  }
  
  initializeSlider('slider1', 'item1', 'next1', 'prev1');
  initializeSlider('slider2', 'item2', 'next2', 'prev2');

  // REVIEW SLIDER
  document.getElementById('review-next').onclick = function(){
    const widthItem = document.querySelector('.review-item').offsetWidth;
    document.getElementById('review-formList').scrollLeft += widthItem;
  }
  document.getElementById('review-prev').onclick = function(){
    const widthItem = document.querySelector('.review-item').offsetWidth;
    document.getElementById('review-formList').scrollLeft -= widthItem;
  }
  
  // Auth related functions
  function showLoginModal() {
    document.getElementById('login-modal').style.display = 'block';
  }
  function showRegisterModal() {}

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle successful login
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('profile-info').style.display = 'flex';
        document.getElementById('login-modal').style.display = 'none';
      } else {
        // handle login error
        alert('Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An erro occurred during login.');
    }
  });

  // Initialize auth manager when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  const authManager = new AuthManager();
  
  // Update onclick handlers for auth buttons
  document.querySelector('.login-btn').onclick = () => authManager.showAuthModal('login');
  document.querySelector('.register-btn').onclick = () => authManager.showAuthModal('register');

  // Slider 1
  const slider1 = document.querySelector('.slider1');
  const next1 = document.getElementById('next1');
  const prev1 = document.getElementById('prev1');
  
  if (slider1 && next1 && prev1) {
    next1.addEventListener('click', () => {
      slider1.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    });
    
    prev1.addEventListener('click', () => {
      slider1.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    });
  }

  // Slider 2
  const slider2 = document.querySelector('.slider2');
  const next2 = document.getElementById('next2');
  const prev2 = document.getElementById('prev2');
  
  if (slider2 && next2 && prev2) {
    next2.addEventListener('click', () => {
      slider2.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    });
    
    prev2.addEventListener('click', () => {
      slider2.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    });
  }

  // Review carousel
  const reviewList = document.getElementById('review-list');
  const reviewNext = document.getElementById('review-next');
  const reviewPrev = document.getElementById('review-prev');
  
  if (reviewList && reviewNext && reviewPrev) {
    reviewNext.addEventListener('click', () => {
      reviewList.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    });
    
    reviewPrev.addEventListener('click', () => {
      reviewList.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    });
  }
});