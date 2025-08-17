// Инициализация при загрузке страницы
let csrfToken = '';

document.addEventListener('DOMContentLoaded', function() {
    // Получаем CSRF-токен при загрузке страницы
    fetch('/get-csrf-token')
        .then(res => res.json())
        .then(data => {
            csrfToken = data.csrf_token;
        })
        .catch(error => console.error('Не удалось получить CSRF-токен:', error));

    // Инициализация всех функций
    initRevealOnScroll();
    initSmoothScroll();
    initContactForm();
    initCursor();
    initHeaderScroll();
    initAnimatedShapes();
    loadProjects();
    initMobileMenu();
    initImageModal();
    initCountersAnimation();
});

// Функция для загрузки и отображения проектов
function loadProjects() {
    fetch('/api/projects')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(projects => {
            const projectsGrid = document.querySelector('.projects-grid');
            if (!projectsGrid) return;

            projectsGrid.innerHTML = ''; // Очищаем контейнер перед добавлением новых проектов

            projects.forEach(project => {
                const projectItem = document.createElement('div');
                projectItem.className = 'project-item reveal';

                projectItem.innerHTML = `
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <a href="${project.link}" class="project-link">Подробнее</a>
                    </div>
                `;
                projectsGrid.appendChild(projectItem);
            });

            // Повторно инициализируем анимацию появления для новых элементов
            initRevealOnScroll();
        })
        .catch(error => {
            console.error('Ошибка при загрузке проектов:', error);
            const projectsGrid = document.querySelector('.projects-grid');
            if (projectsGrid) {
                projectsGrid.innerHTML = '<p>Не удалось загрузить проекты. Пожалуйста, попробуйте позже.</p>';
            }
        });
}

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
            const href = this.getAttribute('href');
            
            // Плавная прокрутка для якорей на текущей странице
            if (href.startsWith('#')) {
                e.preventDefault(); // Предотвращаем стандартное поведение только для якорей
                const targetSection = document.querySelector(href);

                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Активное состояние ссылки
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
            // Для ссылок, ведущих на другие страницы (например, /#projects),
            // e.preventDefault() не вызывается, и браузер выполняет стандартный переход.
        });
    });
    
    // Обновление активного пункта меню при скролле
    // Этот код должен выполняться только на главной странице, где есть секции
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop - 200 && 
                    scrollPosition < sectionTop + sectionHeight - 200) {
                    
                    const currentId = section.getAttribute('id');
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

    // Плавная прокрутка при загрузке страницы с якорем
    // (например, при переходе с другой страницы на /#projects)
    if (window.location.hash) {
        const targetId = window.location.hash;
        // Убедимся, что это не просто пустой хэш
        if (targetId.length > 1) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Небольшая задержка, чтобы страница успела отрисоваться
                // и учесть высоту фиксированного хедера.
                setTimeout(() => {
                    window.scrollTo({ top: targetElement.offsetTop, behavior: 'smooth' });
                }, 150);
            }
        }
    }
}

// Обработка формы контактов
function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Отправка...';
            submitButton.disabled = true;

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value,
            };

            fetch('/submit_contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    submitButton.textContent = 'Отправлено!';
                    showNotification(data.message || 'Сообщение успешно отправлено!', 'success');
                    form.reset();
                } else {
                    submitButton.textContent = originalText;
                    showNotification(data.error || 'Произошла ошибка.', 'error');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                submitButton.textContent = originalText;
                showNotification('Ошибка сети. Попробуйте еще раз.', 'error');
            })
            .finally(() => {
                 setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }, 3000);
            });
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

// Функция для анимации счетчиков при появлении на экране
function initCountersAnimation() {
    const counters = document.querySelectorAll('.counter');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                
                const originalText = counter.textContent;
                const targetMatch = originalText.match(/(\d+)/);

                // Если в тексте нет числа, не анимируем
                if (!targetMatch) {
                    observer.unobserve(counter);
                    return;
                }

                const target = parseInt(targetMatch[0], 10);
                const prefix = originalText.substring(0, targetMatch.index);
                const suffix = originalText.substring(targetMatch.index + targetMatch[0].length);
                
                const duration = 2000; // Длительность анимации в мс
                let startTime = null;

                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = timestamp - startTime;
                    const percentage = Math.min(progress / duration, 1);
                    
                    const currentValue = Math.floor(target * percentage);
                    counter.textContent = prefix + currentValue + suffix;

                    if (progress < duration) {
                        requestAnimationFrame(animate);
                    } else {
                        counter.textContent = originalText; // Устанавливаем точное конечное значение
                    }
                };

                requestAnimationFrame(animate);
                observer.unobserve(counter); // Анимируем только один раз
            }
        });
    }, { threshold: 0.5 }); // Начинаем анимацию, когда 50% элемента видно

    counters.forEach(counter => {
        observer.observe(counter);
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

// Функция для модального окна с изображениями на страницах проектов
function initImageModal() {
    const modal = document.getElementById("imageModal");
    if (!modal) return; // Выполнять только если модальное окно есть на странице

    const modalImg = document.getElementById("modalImage");
    const galleryImages = document.querySelectorAll(".screenshot-gallery img, .exoplanet-gallery img");
    const closeButton = modal.querySelector(".close-button");

    galleryImages.forEach(img => {
        img.onclick = function(){
            modal.style.display = "block";
            modalImg.src = this.src;
            modalImg.alt = this.alt;
        }
    });

    if (closeButton) {
        closeButton.onclick = function() {
            modal.style.display = "none";
        }
    }

    // Закрытие модального окна по клику вне изображения
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}

// Функция для мобильного меню
function initMobileMenu() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const closeButton = document.querySelector('.mobile-menu-close');
    const navLinks = document.querySelector('.nav-links');
    const links = navLinks.querySelectorAll('a');

    if (toggleButton && navLinks) {
        toggleButton.addEventListener('click', () => {
            navLinks.classList.add('active');
            document.body.style.overflow = 'hidden'; // Запрещаем прокрутку фона
        });
    }

    if (closeButton && navLinks) {
        closeButton.addEventListener('click', () => {
            navLinks.classList.remove('active');
            document.body.style.overflow = ''; // Восстанавливаем прокрутку
        });
    }

    // Закрываем меню при клике на ссылку
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}
