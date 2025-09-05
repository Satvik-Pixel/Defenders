    // Mobile Navigation Toggle
        const mobileToggle = document.getElementById('mobileToggle');
        const navLinks = document.getElementById('navLinks');

        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                // Close mobile menu if open
                navLinks.classList.remove('active');
                mobileToggle.querySelector('i').classList.add('fa-bars');
                mobileToggle.querySelector('i').classList.remove('fa-times');
            });
        });

        // Navbar Scroll Effects
        const navbar = document.getElementById('navbar');
        const scrollIndicator = document.getElementById('scrollIndicator');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrolled / maxScroll) * 100;
            
            // Update scroll indicator
            scrollIndicator.style.width = scrollPercent + '%';
            
            // Update navbar appearance
            if (scrolled > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Active Navigation Link Highlighting
        const sections = document.querySelectorAll('.section, .hero');
        const navLinksArray = document.querySelectorAll('.nav-link');

        function updateActiveLink() {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinksArray.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', updateActiveLink);

        // Fade-in Animation on Scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all sections and fade-in elements
        document.querySelectorAll('.section, .fade-in').forEach(el => {
            observer.observe(el);
        });

        // Animated Counters
        function animateCounters() {
            const counters = document.querySelectorAll('.stat-number');
            
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.count);
                const increment = target / 100;
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        if (target >= 1000) {
                            counter.textContent = Math.ceil(current).toLocaleString() + '+';
                        } else {
                            counter.textContent = Math.ceil(current) + '%';
                        }
                        requestAnimationFrame(updateCounter);
                    } else {
                        if (target >= 1000) {
                            counter.textContent = target.toLocaleString() + '+';
                        } else {
                            counter.textContent = target + '%';
                        }
                    }
                };
                
                updateCounter();
            });
        }

        // Trigger counter animation when stats section is visible
        const statsSection = document.getElementById('stats');
        let statsAnimated = false;

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !statsAnimated) {
                    animateCounters();
                    statsAnimated = true;
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(statsSection);

        // Contact Form Handling
        const contactForm = document.getElementById('contactForm');
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert(`Thank you, ${name}! Your message has been received. We'll get back to you at ${email} within 24 hours.`);
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });

        // Parallax Effect for Hero Section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            const rate = scrolled * -0.5;
            
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        });

        // Image Lazy Loading Enhancement
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Add loading animation for images
        const style = document.createElement('style');
        style.textContent = `
            img {
                transition: opacity 0.3s ease;
            }
            img:not(.loaded) {
                opacity: 0.7;
            }
            img.loaded {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        // Smooth hover effects for cards
        document.querySelectorAll('.feature-card, .team-card, .stat-card, .context-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Add subtle floating animation to hero content
        const heroContent = document.querySelector('.hero-content');
        let floatDirection = 1;
        
        setInterval(() => {
            if (heroContent) {
                const currentTransform = heroContent.style.transform || 'translateY(0px)';
                const currentY = parseFloat(currentTransform.match(/translateY\(([^)]+)\)/) || [0, 0])[1];
                const newY = currentY + (floatDirection * 2);
                
                if (Math.abs(newY) > 10) {
                    floatDirection *= -1;
                }
                
                heroContent.style.transform = `translateY(${newY}px)`;
            }
        }, 100);

        // Enhanced scroll indicator with color change
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrolled / maxScroll) * 100;
            
            scrollIndicator.style.width = scrollPercent + '%';
            
            // Change color based on scroll progress
            if (scrollPercent < 25) {
                scrollIndicator.style.background = 'linear-gradient(to right, #32CD32, #228B22)';
            } else if (scrollPercent < 50) {
                scrollIndicator.style.background = 'linear-gradient(to right, #228B22, #006400)';
            } else if (scrollPercent < 75) {
                scrollIndicator.style.background = 'linear-gradient(to right, #006400, #2F4F2F)';
            } else {
                scrollIndicator.style.background = 'linear-gradient(to right, #2F4F2F, #1a1a1a)';
            }
        });

        // Add typing effect to hero subtitle
        const heroSubtitle = document.querySelector('.hero-content p');
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        setTimeout(typeWriter, 1000);

        // Preload critical images
        const criticalImages = [
            'https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
            'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
