(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() { inThrottle = false; }, limit);
            }
        };
    }

    function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePhone(phone) {
        var re = /^[\d\s\+\(\)\-]{10,20}$/;
        return re.test(phone);
    }

    function validateName(name) {
        var re = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
        return re.test(name);
    }

    function validateMessage(message) {
        return message.length >= 10;
    }

    function sanitizeInput(input) {
        var div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function createErrorElement(message) {
        var error = document.createElement('div');
        error.className = 'c-form__error invalid-feedback';
        error.style.display = 'block';
        error.textContent = message;
        return error;
    }

    function removeError(input) {
        input.classList.remove('has-error', 'is-invalid');
        var parent = input.parentElement;
        if (!parent) return;
        var existingError = parent.querySelector('.c-form__error, .invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    function showError(input, message) {
        removeError(input);
        input.classList.add('has-error', 'is-invalid');
        var error = createErrorElement(message);
        var parent = input.parentElement;
        if (parent) {
            parent.appendChild(error);
        }
    }

    function initBurgerMenu() {
        if (window.__app.burgerInit) return;
        window.__app.burgerInit = true;

        var toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
        var navCollapse = document.querySelector('.navbar-collapse, #navbarNav');
        var body = document.body;

        if (!toggle || !navCollapse) return;

        var menuHeight = 'calc(100vh - var(--header-h))';

        navCollapse.style.maxHeight = '0';
        navCollapse.style.transition = 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

        function openMenu() {
            navCollapse.classList.add('show');
            navCollapse.style.maxHeight = menuHeight;
            toggle.setAttribute('aria-expanded', 'true');
            body.classList.add('u-no-scroll');
        }

        function closeMenu() {
            navCollapse.classList.remove('show');
            navCollapse.style.maxHeight = '0';
            toggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('u-no-scroll');
        }

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (navCollapse.classList.contains('show')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navCollapse.classList.contains('show')) {
                closeMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (navCollapse.classList.contains('show') && 
                !navCollapse.contains(e.target) && 
                !toggle.contains(e.target)) {
                closeMenu();
            }
        });

        var navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                closeMenu();
            });
        }

        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth >= 768) {
                closeMenu();
            }
        }, 250));
    }

    function initScrollEffects() {
        if (window.__app.scrollInit) return;
        window.__app.scrollInit = true;

        var sections = document.querySelectorAll('.l-section, section');
        var navLinks = document.querySelectorAll('.c-nav__link, .nav-link');

        var observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        var sectionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    if (!id) return;

                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                    });

                    var activeLink = document.querySelector('.c-nav__link[href*="#' + id + '"], .nav-link[href*="#' + id + '"]');
                    if (activeLink) {
                        activeLink.classList.add('active');
                        activeLink.setAttribute('aria-current', 'page');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(function(section) {
            if (section.id) {
                sectionObserver.observe(section);
            }
        });
    }

    function initSmoothScroll() {
        if (window.__app.smoothScrollInit) return;
        window.__app.smoothScrollInit = true;

        document.addEventListener('click', function(e) {
            var target = e.target;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }

            if (!target) return;

            var href = target.getAttribute('href');
            if (!href || href === '#' || href === '#!') return;

            var hashIndex = href.indexOf('#');
            if (hashIndex === -1) return;

            var hash = href.substring(hashIndex + 1);
            if (!hash) return;

            var element = document.getElementById(hash);
            if (!element) return;

            e.preventDefault();

            var header = document.querySelector('.l-header, header');
            var offset = header ? header.offsetHeight : 80;
            var targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            var navCollapse = document.querySelector('.navbar-collapse.show');
            if (navCollapse) {
                navCollapse.classList.remove('show');
                navCollapse.style.maxHeight = '0';
            }
        });
    }

    function initImageAnimations() {
        if (window.__app.imageAnimInit) return;
        window.__app.imageAnimInit = true;

        var images = document.querySelectorAll('img');

        images.forEach(function(img) {
            if (!img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
                img.setAttribute('loading', 'lazy');
            }

            img.style.opacity = '0';
            img.style.transform = 'translateY(20px)';
            img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        });

        var imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    img.style.opacity = '1';
                    img.style.transform = 'translateY(0)';
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        images.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    function initButtonAnimations() {
        if (window.__app.buttonAnimInit) return;
        window.__app.buttonAnimInit = true;

        var buttons = document.querySelectorAll('.c-button, .btn, a.c-button, a.btn');

        buttons.forEach(function(button) {
            button.addEventListener('mouseenter', function(e) {
                var btn = e.currentTarget;
                btn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });

            button.addEventListener('click', function(e) {
                var btn = e.currentTarget;
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                var ripple = document.createElement('span');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.width = '20px';
                ripple.style.height = '20px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.transform = 'translate(-50%, -50%) scale(0)';
                ripple.style.animation = 'ripple 0.6s ease-out';
                ripple.style.pointerEvents = 'none';

                var btnPosition = window.getComputedStyle(btn).position;
                if (btnPosition === 'static') {
                    btn.style.position = 'relative';
                }

                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);

                setTimeout(function() {
                    ripple.remove();
                }, 600);
            });
        });

        var style = document.createElement('style');
        style.textContent = '@keyframes ripple { to { transform: translate(-50%, -50%) scale(4); opacity: 0; } }';
        document.head.appendChild(style);
    }

    function initCardAnimations() {
        if (window.__app.cardAnimInit) return;
        window.__app.cardAnimInit = true;

        var cards = document.querySelectorAll('.c-card, .card');

        var cardObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var card = entry.target;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        cards.forEach(function(card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out, box-shadow 0.3s ease';
            cardObserver.observe(card);
        });
    }

    function initFormValidation() {
        if (window.__app.formValidInit) return;
        window.__app.formValidInit = true;

        var forms = document.querySelectorAll('form.c-form, form');

        forms.forEach(function(form) {
            var submitButton = form.querySelector('button[type="submit"]');
            var originalButtonText = submitButton ? submitButton.innerHTML : '';

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();

                var isValid = true;
                var firstInvalidField = null;

                var nameInput = form.querySelector('#name, input[name="name"]');
                if (nameInput && nameInput.hasAttribute('required')) {
                    var nameValue = nameInput.value.trim();
                    if (!nameValue) {
                        showError(nameInput, 'Bitte geben Sie Ihren Namen ein');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = nameInput;
                    } else if (!validateName(nameValue)) {
                        showError(nameInput, 'Name muss 2-50 Zeichen lang sein und darf nur Buchstaben, Leerzeichen, Bindestriche und Apostrophe enthalten');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = nameInput;
                    } else {
                        removeError(nameInput);
                    }
                }

                var emailInput = form.querySelector('#email, input[name="email"]');
                if (emailInput && emailInput.hasAttribute('required')) {
                    var emailValue = emailInput.value.trim();
                    if (!emailValue) {
                        showError(emailInput, 'Bitte geben Sie Ihre E-Mail-Adresse ein');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = emailInput;
                    } else if (!validateEmail(emailValue)) {
                        showError(emailInput, 'Bitte geben Sie eine gültige E-Mail-Adresse ein (z.B. name@beispiel.de)');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = emailInput;
                    } else {
                        removeError(emailInput);
                    }
                }

                var phoneInput = form.querySelector('#phone, input[name="phone"]');
                if (phoneInput && phoneInput.hasAttribute('required')) {
                    var phoneValue = phoneInput.value.trim();
                    if (!phoneValue) {
                        showError(phoneInput, 'Bitte geben Sie Ihre Telefonnummer ein');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = phoneInput;
                    } else if (!validatePhone(phoneValue)) {
                        showError(phoneInput, 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen)');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = phoneInput;
                    } else {
                        removeError(phoneInput);
                    }
                }

                var messageInput = form.querySelector('#message, textarea[name="message"]');
                if (messageInput && messageInput.hasAttribute('required')) {
                    var messageValue = messageInput.value.trim();
                    if (!messageValue) {
                        showError(messageInput, 'Bitte geben Sie eine Nachricht ein');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = messageInput;
                    } else if (!validateMessage(messageValue)) {
                        showError(messageInput, 'Die Nachricht muss mindestens 10 Zeichen lang sein');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = messageInput;
                    } else {
                        removeError(messageInput);
                    }
                }

                var privacyCheckbox = form.querySelector('#privacy, input[name="privacy"]');
                if (privacyCheckbox && privacyCheckbox.hasAttribute('required')) {
                    if (!privacyCheckbox.checked) {
                        showError(privacyCheckbox, 'Bitte akzeptieren Sie die Datenschutzerklärung');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = privacyCheckbox;
                    } else {
                        removeError(privacyCheckbox);
                    }
                }

                if (!isValid) {
                    if (firstInvalidField) {
                        firstInvalidField.focus();
                    }
                    return;
                }

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
                }

                setTimeout(function() {
                    var formData = new FormData(form);
                    var data = {};
                    for (var pair of formData.entries()) {
                        data[pair[0]] = sanitizeInput(pair[1]);
                    }

                    window.location.href = 'thank_you.html';
                }, 800);
            });

            var inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                input.addEventListener('blur', function() {
                    var inputType = input.id || input.name;

                    if (inputType === 'name' && input.value.trim()) {
                        if (!validateName(input.value.trim())) {
                            showError(input, 'Name muss 2-50 Zeichen lang sein');
                        } else {
                            removeError(input);
                        }
                    }

                    if (inputType === 'email' && input.value.trim()) {
                        if (!validateEmail(input.value.trim())) {
                            showError(input, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
                        } else {
                            removeError(input);
                        }
                    }

                    if (inputType === 'phone' && input.value.trim()) {
                        if (!validatePhone(input.value.trim())) {
                            showError(input, 'Bitte geben Sie eine gültige Telefonnummer ein');
                        } else {
                            removeError(input);
                        }
                    }

                    if (inputType === 'message' && input.value.trim()) {
                        if (!validateMessage(input.value.trim())) {
                            showError(input, 'Die Nachricht muss mindestens 10 Zeichen lang sein');
                        } else {
                            removeError(input);
                        }
                    }
                });
            });
        });
    }

    function initCountUp() {
        if (window.__app.countUpInit) return;
        window.__app.countUpInit = true;

        var counters = document.querySelectorAll('[data-count]');

        counters.forEach(function(counter) {
            var targetValue = parseInt(counter.getAttribute('data-count'), 10);
            var duration = 2000;
            var hasAnimated = false;

            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting && !hasAnimated) {
                        hasAnimated = true;
                        animateCount(counter, 0, targetValue, duration);
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });

        function animateCount(element, start, end, duration) {
            var startTime = null;

            function step(currentTime) {
                if (!startTime) startTime = currentTime;
                var progress = Math.min((currentTime - startTime) / duration, 1);
                var currentCount = Math.floor(progress * (end - start) + start);
                element.textContent = currentCount;

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    element.textContent = end;
                }
            }

            window.requestAnimationFrame(step);
        }
    }

    function initScrollToTop() {
        if (window.__app.scrollTopInit) return;
        window.__app.scrollTopInit = true;

        var scrollButton = document.createElement('button');
        scrollButton.innerHTML = '↑';
        scrollButton.className = 'scroll-to-top';
        scrollButton.setAttribute('aria-label', 'Nach oben scrollen');
        scrollButton.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px; border-radius: 50%; background: var(--color-primary); color: white; border: none; cursor: pointer; opacity: 0; transition: opacity 0.3s, transform 0.3s; z-index: 1000; font-size: 24px; box-shadow: var(--shadow-lg);';

        document.body.appendChild(scrollButton);

        window.addEventListener('scroll', throttle(function() {
            if (window.pageYOffset > 300) {
                scrollButton.style.opacity = '1';
                scrollButton.style.transform = 'translateY(0)';
            } else {
                scrollButton.style.opacity = '0';
                scrollButton.style.transform = 'translateY(20px)';
            }
        }, 100));

        scrollButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        scrollButton.addEventListener('mouseenter', function() {
            scrollButton.style.transform = 'translateY(-5px) scale(1.1)';
            scrollButton.style.boxShadow = '0 12px 40px rgba(8, 145, 178, 0.4)';
        });

        scrollButton.addEventListener('mouseleave', function() {
            scrollButton.style.transform = 'translateY(0) scale(1)';
            scrollButton.style.boxShadow = 'var(--shadow-lg)';
        });
    }

    function initActiveMenu() {
        if (window.__app.activeMenuInit) return;
        window.__app.activeMenuInit = true;

        var currentPath = window.location.pathname;
        var navLinks = document.querySelectorAll('.c-nav__link, .nav-link');

        navLinks.forEach(function(link) {
            var href = link.getAttribute('href');

            link.removeAttribute('aria-current');
            link.classList.remove('active');

            if (href === currentPath ||
                (currentPath === '/' && href === '/index.html') ||
                (currentPath === '/index.html' && href === '/')) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            }
        });
    }

    function initAccordions() {
        if (window.__app.accordionInit) return;
        window.__app.accordionInit = true;

        var accordionButtons = document.querySelectorAll('.accordion-button');

        accordionButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var target = button.getAttribute('data-bs-target');
                if (!target) return;

                var collapse = document.querySelector(target);
                if (!collapse) return;

                var isExpanded = button.getAttribute('aria-expanded') === 'true';

                if (isExpanded) {
                    button.setAttribute('aria-expanded', 'false');
                    button.classList.add('collapsed');
                    collapse.classList.remove('show');
                } else {
                    button.setAttribute('aria-expanded', 'true');
                    button.classList.remove('collapsed');
                    collapse.classList.add('show');
                }
            });
        });
    }

    function initPrivacyModal() {
        if (window.__app.privacyModalInit) return;
        window.__app.privacyModalInit = true;

        var privacyLinks = document.querySelectorAll('a[href="privacy.html"], a[href="/privacy.html"]');

        privacyLinks.forEach(function(link) {
            var parent = link.closest('.form-check-label, .c-form__checkbox-label');
            if (parent) {
                link.addEventListener('click', function(e) {
                    if (e.ctrlKey || e.metaKey) return;

                    e.preventDefault();

                    var modal = document.createElement('div');
                    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.3s;';

                    var modalContent = document.createElement('div');
                    modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 12px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); transform: scale(0.9); transition: transform 0.3s;';
                    modalContent.innerHTML = '<h3 style="margin-top: 0;">Datenschutzerklärung</h3><p>Hier steht ein Auszug Ihrer Datenschutzerklärung. Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.</p><button class="c-button c-button--primary" style="margin-top: 20px;">Schließen</button>';

                    modal.appendChild(modalContent);
                    document.body.appendChild(modal);

                    setTimeout(function() {
                        modal.style.opacity = '1';
                        modalContent.style.transform = 'scale(1)';
                    }, 10);

                    function closeModal() {
                        modal.style.opacity = '0';
                        modalContent.style.transform = 'scale(0.9)';
                        setTimeout(function() {
                            modal.remove();
                        }, 300);
                    }

                    modal.addEventListener('click', function(e) {
                        if (e.target === modal) closeModal();
                    });

                    var closeButton = modalContent.querySelector('button');
                    closeButton.addEventListener('click', closeModal);

                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'Escape') closeModal();
                    });
                });
            }
        });
    }

    function initHeaderScroll() {
        if (window.__app.headerScrollInit) return;
        window.__app.headerScrollInit = true;

        var header = document.querySelector('.l-header, header');
        if (!header) return;

        window.addEventListener('scroll', throttle(function() {
            if (window.pageYOffset > 50) {
                header.style.boxShadow = 'var(--shadow-md)';
            } else {
                header.style.boxShadow = 'none';
            }
        }, 100));
    }

    window.__app.init = function() {
        if (window.__app.initialized) return;
        window.__app.initialized = true;

        initBurgerMenu();
        initScrollEffects();
        initSmoothScroll();
        initImageAnimations();
        initButtonAnimations();
        initCardAnimations();
        initFormValidation();
        initCountUp();
        initScrollToTop();
        initActiveMenu();
        initAccordions();
        initPrivacyModal();
        initHeaderScroll();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.__app.init);
    } else {
        window.__app.init();
    }

})();