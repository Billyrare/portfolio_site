// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех функций
    initRevealOnScroll();
    initSmoothScroll();
    initContactForm();
    initCursor();
    initHeaderScroll();
    initAnimatedShapes();
    initThemeToggle();
});

// Функция переключения темы
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const transitionOverlay = document.getElementById('transition-overlay');
    const htmlElement = document.documentElement;
    
    // Проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    }
    
    // Обработчик нажатия на кнопку переключения темы
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            // Получаем текущую тему
            const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Активируем анимацию перехода
            transitionOverlay.classList.add('active');
            
            // После небольшой задержки меняем тему
            setTimeout(() => {
                // Устанавливаем новую тему
                htmlElement.setAttribute('data-theme', newTheme);
                
                // Сохраняем выбор пользователя
                localStorage.setItem('theme', newTheme);
                
                // Добавляем специальные эффекты для темной темы
                if (newTheme === 'dark') {
                    applyDarkThemeEffects();
                } else {
                    applyLightThemeEffects();
                }
                
                // Завершаем анимацию перехода
                setTimeout(() => {
                    transitionOverlay.classList.remove('active');
                }, 300);
            }, 200);
        });
    }
    
    // Применяем эффекты для темной темы, если она активна
    if (htmlElement.getAttribute('data-theme') === 'dark') {
        applyDarkThemeEffects();
    }
}

// Функция для добавления специальных эффектов темной темы
function applyDarkThemeEffects() {
    // Усиливаем свечение неоновых линий
    const neonLines = document.querySelectorAll('.neon-line');
    neonLines.forEach(line => {
        line.style.opacity = '0.3';
    });
    
    // Изменяем интенсивность и цвет теней
    const animatedShapes = document.querySelectorAll('.animated-shape');
    animatedShapes.forEach(shape => {
        shape.style.filter = 'blur(1.5px)';
        shape.style.opacity = '0.25';
    });
    
    // Настраиваем специальные эффекты для темных тем
    const techCircles = document.querySelectorAll('.tech-circle');
    techCircles.forEach(circle => {
        circle.style.borderWidth = '2px';
        circle.style.opacity = '0.2';
    });
}

// Функция для добавления специальных эффектов светлой темы
function applyLightThemeEffects() {
    // Возвращаем стандартные значения
    const neonLines = document.querySelectorAll('.neon-line');
    neonLines.forEach(line => {
        line.style.opacity = '0.2';
    });
    
    const animatedShapes = document.querySelectorAll('.animated-shape');
    animatedShapes.forEach(shape => {
        shape.style.filter = 'blur(1px)';
        shape.style.opacity = '0.2';
    });
    
    const techCircles = document.querySelectorAll('.tech-circle');
    techCircles.forEach(circle => {
        circle.style.borderWidth = '1px';
        circle.style.opacity = '0.15';
    });
}

// Анимация появления элементов при прокрутке
function initRevealOnScroll() {
    const revealElements = document.querySelectorAll('.reveal');
    
    function checkReveal() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 150) {
                element.classList.add('revealed');
            }
        });
    }
    
    // Проверяем при загрузке
    checkReveal();
    
    // Проверяем при скролле
    window.addEventListener('scroll', checkReveal);
}

// Плавная прокрутка к якорям
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Получаем целевую секцию
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Плавная прокрутка
                window.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'smooth'
                });
                
                // Активное состояние ссылки
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Обновление активного пункта меню при скролле
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        // Находим текущую видимую секцию
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop - 200 && 
                scrollPosition < sectionTop + sectionHeight - 200) {
                
                const currentId = section.getAttribute('id');
                
                // Обновляем активную ссылку
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// Обработка формы контактов
function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Добавляем состояние загрузки
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Отправка...';
            submitButton.disabled = true;
            
            // Имитация отправки (можно заменить на реальный API запрос)
            setTimeout(() => {
                // Успешная отправка
                submitButton.textContent = 'Отправлено!';
                
                // Показываем уведомление
                showNotification('Сообщение успешно отправлено!');
                
                // Сбрасываем форму
                form.reset();
                
                // Восстанавливаем кнопку через некоторое время
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }, 3000);
            }, 1500);
        });
    }
}

// Функция показа уведомлений
function showNotification(message, type = 'success') {
    // Удаляем существующие уведомления
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Отображаем уведомление
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Скрываем и удаляем через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Кастомный курсор
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    
    if (!cursor || !cursorDot || window.innerWidth <= 992) return;
    
    // Создаем переменные для хранения позиции курсора
    let mouseX = 0;
    let mouseY = 0;
    
    // Текущие позиции элементов курсора (для плавного движения)
    let cursorX = 0;
    let cursorY = 0;
    let cursorDotX = 0;
    let cursorDotY = 0;
    
    // Скорость следования (меньше = плавнее, но с большей задержкой)
    const cursorSpeed = 0.2;
    const dotSpeed = 0.5;
    
    // Обработчик движения мыши (только фиксирует координаты)
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Функция анимации, которая будет вызываться через requestAnimationFrame
    function animateCursor() {
        // Плавное движение курсора к позиции мыши
        cursorX += (mouseX - cursorX) * cursorSpeed;
        cursorY += (mouseY - cursorY) * cursorSpeed;
        
        // Плавное движение точки (следует более быстро)
        cursorDotX += (mouseX - cursorDotX) * dotSpeed;
        cursorDotY += (mouseY - cursorDotY) * dotSpeed;
        
        // Установка позиций (без использования translate(-50%, -50%), так как он уже есть в CSS)
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        cursorDot.style.left = `${cursorDotX}px`;
        cursorDot.style.top = `${cursorDotY}px`;
        
        // Продолжаем анимацию
        requestAnimationFrame(animateCursor);
    }
    
    // Запускаем анимацию
    requestAnimationFrame(animateCursor);
    
    // Изменение стиля при наведении на интерактивные элементы
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorDot.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorDot.classList.remove('hover');
        });
    });
}

// Функция для управления состоянием хедера при прокрутке
function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Анимация для фоновых элементов при скролле
function initAnimatedShapes() {
    const shapes = document.querySelectorAll('.animated-shape');
    if (!shapes.length) return;
    
    // Функция для создания плавного параллакс-эффекта при скролле
    function parallaxShapes() {
        const scrollTop = window.pageYOffset;
        
        shapes.forEach((shape, index) => {
            // Разная скорость перемещения для каждой фигуры
            const speed = 0.05 + (index * 0.01);
            const yPos = -(scrollTop * speed);
            
            // Применяем трансформацию с учетом текущей анимации
            const currentTransform = window.getComputedStyle(shape).getPropertyValue('transform');
            
            // Если трансформация уже есть, добавляем к ней параллакс
            if (currentTransform && currentTransform !== 'none') {
                shape.style.transform = `translateY(${yPos}px) ${getCurrentRotation(currentTransform)}`;
            } else {
                shape.style.transform = `translateY(${yPos}px)`;
            }
        });
    }
    
    // Вспомогательная функция для сохранения текущего вращения
    function getCurrentRotation(transformMatrix) {
        // Если это вращение, вернем его
        if (transformMatrix.includes('rotate')) {
            return transformMatrix.match(/rotate\([^)]+\)/)[0];
        }
        return '';
    }
    
    // Оптимизированный обработчик скролла с использованием requestAnimationFrame
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                parallaxShapes();
                ticking = false;
            });
            
            ticking = true;
        }
    }, { passive: true });
    
    // Инициализация при загрузке
    parallaxShapes();
} 