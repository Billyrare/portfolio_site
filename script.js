// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех эффектов
    initCharacterStaggerButtons();
    initDirectionalButtons();
    initOsmoButtons();
    initMagneticElements();
    initProjectLinks();
    initContactForm();
    initScrollEffects();
    updateCurrentYear();
    
    // Инициализация новых эффектов для оптимизации
    optimizeImagesLoad();
    initSkillCategories();
});

// Character Stagger Button Эффект (Osmo style)
function initCharacterStaggerButtons() {
    const buttons = document.querySelectorAll('.character-stagger-button');
    
    buttons.forEach(button => {
        const text = button.textContent.trim();
        button.innerHTML = '';
        
        // Создаем span для каждой буквы с данными для CSS
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.setAttribute('data-char', text[i]);
            span.style.setProperty('--index', i);
            
            // Исправляем позиционирование для правильной анимации
            span.style.position = 'relative';
            span.style.display = 'inline-block';
            span.style.overflow = 'hidden';
            
            button.appendChild(span);
        }
    });
}

// Directional Button Эффект
function initDirectionalButtons() {
    const buttons = document.querySelectorAll('.directional-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // x позиция внутри элемента
            
            // Определяем направление анимации на основе положения курсора
            if (x < rect.width / 2) {
                this.querySelector('::before')?.style.setProperty('transform-origin', 'left');
            } else {
                this.querySelector('::before')?.style.setProperty('transform-origin', 'right');
            }
        });
    });
}

// Стандартные кнопки Osmo
function initOsmoButtons() {
    const buttons = document.querySelectorAll('.button, .button-primary, .submit-button');
    
    buttons.forEach(button => {
        // Добавляем эффект волны при клике
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Создаем элемент для эффекта волны
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.position = 'absolute';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.transform = 'translate(-50%, -50%) scale(0)';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            ripple.style.borderRadius = '50%';
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.opacity = '1';
            ripple.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            ripple.style.zIndex = '-1';
            
            this.appendChild(ripple);
            
            // Анимируем волну
            requestAnimationFrame(() => {
                const size = Math.max(this.offsetWidth, this.offsetHeight) * 2;
                ripple.style.width = `${size}px`;
                ripple.style.height = `${size}px`;
                ripple.style.transform = 'translate(-50%, -50%) scale(1)';
                ripple.style.opacity = '0';
                
                // Удаляем элемент волны после завершения анимации
                setTimeout(() => {
                    if (ripple && ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        });
    });
}

// Magnetic Hover Эффект
function initMagneticElements() {
    const magnetics = document.querySelectorAll('.magnetic');
    
    magnetics.forEach(magnetic => {
        magnetic.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Рассчитываем смещение (ограничиваем интенсивность)
            const offsetX = x * 0.2;
            const offsetY = y * 0.2;
            
            // Применяем трансформацию
            this.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
        
        magnetic.addEventListener('mouseleave', function() {
            // Возвращаем в исходное положение с анимацией
            this.style.transition = 'transform 0.3s ease';
            this.style.transform = 'translate(0px, 0px)';
            
            // Сбрасываем transition после завершения анимации
            setTimeout(() => {
                this.style.transition = '';
            }, 300);
        });
    });
}

// Эффект для ссылок в проектах
function initProjectLinks() {
    const links = document.querySelectorAll('.project-link');
    
    links.forEach(link => {
        // Обработка ссылок происходит через CSS с использованием .arrow span
        // Но для совместимости со старой версией добавляем обработку
        link.addEventListener('mouseenter', function() {
            // Проверяем, есть ли стрелка в ссылке
            if(!this.querySelector('.arrow')) {
                this.style.transform = 'translateX(5px)';
            }
        });
        
        link.addEventListener('mouseleave', function() {
            if(!this.querySelector('.arrow')) {
                this.style.transform = 'translateX(0)';
            }
        });
    });
}

// Обработка отправки формы
function initContactForm() {
    const form = document.querySelector('.contact-form form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const button = this.querySelector('.submit-button');
            const originalText = button.textContent;
            
            // Имитация отправки формы
            button.textContent = 'Отправка...';
            button.disabled = true;
            
            // Имитируем задержку отправки
            setTimeout(() => {
                button.textContent = 'Отправлено!';
                
                // Сбрасываем форму после успешной отправки
                form.reset();
                
                // Возвращаем исходный текст кнопки
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
            }, 1500);
        });
    }
}

// Плавный скролл и эффекты появления
function initScrollEffects() {
    // Плавный скролл для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Получаем высоту хедера для корректного скрола
                const headerHeight = document.querySelector('.header').offsetHeight;
                
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight - 20, // Учитываем высоту хедера и небольшой отступ
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Добавляем условие, чтобы избежать скрытия хедера при небольшом скролле
        if (currentScrollY > 100) {
            if (lastScrollY < currentScrollY && currentScrollY > 100) {
                // Скроллим вниз - скрываем хедер
                header.style.transform = 'translateY(-100%)';
            } else {
                // Скроллим вверх - показываем хедер
                header.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Добавляем эффект появления элементов при скролле
    const elementsToAnimate = document.querySelectorAll('.section-header, .project-item, .card');
    
    // Используем Intersection Observer для анимации
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Подготавливаем элементы для анимации
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Вспомогательная функция для рандомного числа в диапазоне
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Добавление текущего года
function updateCurrentYear() {
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('[data-current-year]');
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// Оптимизация загрузки изображений и тяжелых элементов
function optimizeImagesLoad() {
    // Добавляем класс для показа страницы после полной загрузки
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
    
    // Если страница загружается долго, все равно показываем контент через 2 секунды
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 2000);
}

// Анимация для категорий навыков
function initSkillCategories() {
    const skillCategories = document.querySelectorAll('.skill-category');
    
    skillCategories.forEach((category, index) => {
        category.style.transitionDelay = `${index * 0.1}s`;
        
        // Анимация при наведении
        category.addEventListener('mouseenter', function() {
            const skillItems = this.querySelectorAll('.skill-list li');
            skillItems.forEach((item, i) => {
                item.style.transform = 'translateX(10px)';
                item.style.transitionDelay = `${i * 0.05}s`;
            });
        });
        
        category.addEventListener('mouseleave', function() {
            const skillItems = this.querySelectorAll('.skill-list li');
            skillItems.forEach((item) => {
                item.style.transform = 'translateX(0)';
                item.style.transitionDelay = '0s';
            });
        });
    });
}
