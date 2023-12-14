import barba from '@barba/core';
import { Application } from '@splinetool/runtime';
import { gsap } from 'gsap';

let spline = null;
let obj = null;
let isToggled = false;

function setInitialState() {
  console.log('Setting initial state', window.location.pathname, isToggled);
  if (window.location.pathname === '/product') {
    if (!isToggled) {
      console.log('Toggling on');
      isToggled = true;
      spline.emitEvent('mouseDown', obj.name);
    }
  } else {
    if (isToggled) {
      console.log('Toggling off');
      isToggled = false;
      spline.emitEventReverse('mouseDown', obj.name);
    }
  }
}

function initSpline() {
  if (spline) {
    console.log('Spline is already initialized');
    return; // Check if Spline is already initialized
  }

  console.log('Initializing Spline');
  const canvas = document.getElementById('canvas3d');
  spline = new Application(canvas);

  spline.load('https://prod.spline.design/9Q71hsKhXQOshD2z/scene.splinecode').then(() => {
    console.log('Spline loaded');
    obj = spline.findObjectById('a35fc059-f3ce-40a2-828b-2f5a9265de31');
    setInitialState(); // Set initial state based on URL
  });
}

// Handle click events using event delegation
function handleClick(event) {
  const { target } = event;
  console.log('Click event', target);
  if (target.classList.contains('click-text')) {
    isToggled = !isToggled;
    console.log('Toggle state changed', isToggled);
    if (isToggled) {
      if (spline) spline.emitEvent('mouseDown', obj.name);
    } else {
      if (spline) spline.emitEventReverse('mouseDown', obj.name);
    }
  }
}

// Attach event listener to a static parent element for delegation
const staticParent = document.body;
staticParent.addEventListener('click', handleClick);

let isTransitioning = false;

function handleLinkClick(event) {
  if (isTransitioning) {
    console.log('Preventing link click during transition');
    event.preventDefault();
    event.stopPropagation();
  }
}

// Call this function at the start of the transition
function disableNavigation() {
  console.log('Disabling navigation');
  isTransitioning = true;
  document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', handleLinkClick);
  });
}

// Call this function once the transition is complete
function enableNavigation() {
  console.log('Enabling navigation');
  isTransitioning = false;
  document.querySelectorAll('a').forEach((link) => {
    link.removeEventListener('click', handleLinkClick);
  });
}

barba.init({
  transitions: [
    {
      name: 'default-transition',
      preventRunning: true,
      beforeEnter() {
        console.log('Transition beforeEnter');
        disableNavigation(); // Disable navigation at the start of the transition
      },
      leave(data) {
        console.log('Transition leave', data);
        // Fade out the current container
        return gsap.to(data.current.container, {
          opacity: 0,
          duration: 0.5,
        });
      },
      enter(data) {
        console.log('Transition enter', data);
        const nextContainer = data.next.container;
        nextContainer.classList.add('fixed');

        // Initially set next container to invisible to prevent user from seeing a clickable element
        gsap.set(nextContainer, { opacity: 0 });

        // Delay the start of the fade-in for the next container
        return gsap.to(nextContainer, {
          opacity: 1,
          duration: 0.5,
          ease: 'power1.out',
          onComplete: () => {
            nextContainer.classList.remove('fixed');
            enableNavigation(); // Re-enable navigation after the transition
          },
        });
      },
    },
  ],
});

initSpline();
