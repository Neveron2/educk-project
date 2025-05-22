// Script para funcionalidades interativas da landing page
document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            authButtons.style.display = authButtons.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fechar todos os outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Alternar o estado do item atual
            item.classList.toggle('active');
        });
    });
    
    // Slider de depoimentos
    const testimonialSlider = document.querySelector('.testimonials-slider');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    
    function showSlide(index) {
        if (testimonialSlider) {
            testimonialSlider.style.transform = `translateX(-${index * 100}%)`;
            
            // Atualizar dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            currentSlide = index;
        }
    }
    
    // Adicionar evento de clique aos dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Auto-play do slider
    setInterval(() => {
        if (testimonialCards.length > 0) {
            currentSlide = (currentSlide + 1) % testimonialCards.length;
            showSlide(currentSlide);
        }
    }, 5000);
    
    // Formulário de newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // Simulação de envio para API
                console.log('Enviando email para inscrição:', email);
                
                // Feedback ao usuário
                alert('Obrigado por se inscrever em nossa newsletter!');
                
                // Limpar campo
                emailInput.value = '';
            }
        });
    }
    
    // Formulário de contato
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('#name').value.trim();
            const email = this.querySelector('#email').value.trim();
            const subject = this.querySelector('#subject').value.trim();
            const message = this.querySelector('#message').value.trim();
            
            if (name && email && subject && message) {
                // Simulação de envio para API
                console.log('Enviando mensagem de contato:', {
                    name,
                    email,
                    subject,
                    message
                });
                
                // Feedback ao usuário
                alert('Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.');
                
                // Limpar campos
                this.reset();
            } else {
                alert('Por favor, preencha todos os campos do formulário.');
            }
        });
    }
    
    // Efeito de scroll suave para links de âncora
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Ajuste para o header fixo
                    behavior: 'smooth'
                });
                
                // Fechar menu mobile se estiver aberto
                if (window.innerWidth <= 768) {
                    nav.style.display = 'none';
                    authButtons.style.display = 'none';
                }
            }
        });
    });
    
    // Efeito de header fixo com mudança de estilo ao rolar
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Botões de autenticação - simulação de redirecionamento
    const loginButton = document.querySelector('.auth-buttons .btn-outline');
    const registerButton = document.querySelector('.auth-buttons .btn-primary');
    
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Redirecionando para a página de login...');
            // Em um cenário real, redirecionaria para a página de login
            // window.location.href = '/login';
        });
    }
    
    if (registerButton) {
        registerButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Redirecionando para a página de cadastro...');
            // Em um cenário real, redirecionaria para a página de cadastro
            // window.location.href = '/register';
        });
    }
    
    // Animação de elementos ao entrar na viewport
    const animateElements = document.querySelectorAll('.feature-card, .course-card, .teacher-card, .pricing-card, .step');
    
    function checkIfInView() {
        const windowHeight = window.innerHeight;
        const windowTopPosition = window.scrollY;
        const windowBottomPosition = windowTopPosition + windowHeight;
        
        animateElements.forEach(element => {
            const elementHeight = element.offsetHeight;
            const elementTopPosition = element.offsetTop;
            const elementBottomPosition = elementTopPosition + elementHeight;
            
            // Verificar se o elemento está visível na viewport
            if (
                elementBottomPosition >= windowTopPosition &&
                elementTopPosition <= windowBottomPosition
            ) {
                element.classList.add('animated');
            }
        });
    }
    
    // Verificar elementos ao carregar a página
    checkIfInView();
    
    // Verificar elementos ao rolar a página
    window.addEventListener('scroll', checkIfInView);
});
