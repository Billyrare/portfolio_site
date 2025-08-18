// Система анимированных частиц с хаотичным движением
let particlesCanvas, particlesCtx;
let particles = [];
let animationId;
let isDarkTheme = false;

// Плавное появление контента при загрузке
function initSmoothAppearance() {
    // Скрываем весь контент изначально
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        header.style.transition = 'opacity 1s ease, transform 1s ease';
    }
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });
    
    // Показываем header
    setTimeout(() => {
        if (header) {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }
    }, 100);
    
    // Показываем секции по очереди
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 300 + index * 200); // Начинаем с 300ms, каждая секция +200ms
    });
}

// Класс частицы с хаотичным движением
class Particle {
    constructor(x, y, isDark) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.2; // Скорость по X (быстрее для хаоса)
        this.vy = (Math.random() - 0.5) * 1.2; // Скорость по Y (быстрее для хаоса)
        this.radius = Math.random() * 3 + 2; // Размер частицы (больше: 2-5px)
        this.life = 1.0; // Жизненный цикл
        this.decay = Math.random() * 0.001 + 0.0005; // Скорость затухания
        this.isDark = isDark;
        
        // Цвета в зависимости от темы
        this.colors = isDark ? 
            ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'] : // Тёмная тема (добавлен светлый)
            ['#8b5a2b', '#a0522d', '#cd853f', '#d2691e']; // Светлая тема (коричневые тона)
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    
    // Обновление физики частицы
    update(width, height) {
        // Лёгкая гравитация
        this.vy += 0.0003;
        
        // Обновление позиции
        this.x += this.vx;
        this.y += this.vy;
        
        // Затухание скорости (сопротивление воздуха)
        this.vx *= 0.999;
        this.vy *= 0.999;
        
        // Отскок от границ с изменением направления
        if (this.x <= this.radius || this.x >= width - this.radius) {
            this.vx *= -0.8;
            this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
            // Добавляем случайность при отскоке
            this.vy += (Math.random() - 0.5) * 0.5;
        }
        if (this.y <= this.radius || this.y >= height - this.radius) {
            this.vy *= -0.8;
            this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
            // Добавляем случайность при отскоке
            this.vx += (Math.random() - 0.5) * 0.5;
        }
        
        // Периодически добавляем случайное движение для хаоса
        if (Math.random() < 0.01) { // 1% шанс каждый кадр
            this.vx += (Math.random() - 0.5) * 0.3;
            this.vy += (Math.random() - 0.5) * 0.3;
        }
        
        // Уменьшение жизненного цикла
        this.life -= this.decay;
        
        // Если частица "умерла", создаём новую
        if (this.life <= 0) {
            this.respawn(width, height);
        }
    }
    
    // Возрождение частицы
    respawn(width, height) {
        // Случайная позиция на краях экрана для более естественного появления
        const side = Math.floor(Math.random() * 4); // 0: верх, 1: право, 2: низ, 3: лево
        
        switch (side) {
            case 0: // Верх
                this.x = Math.random() * width;
                this.y = -this.radius;
                this.vx = (Math.random() - 0.5) * 1.2;
                this.vy = Math.random() * 1.2; // Движение вниз
                break;
            case 1: // Право
                this.x = width + this.radius;
                this.y = Math.random() * height;
                this.vx = -Math.random() * 1.2; // Движение влево
                this.vy = (Math.random() - 0.5) * 1.2;
                break;
            case 2: // Низ
                this.x = Math.random() * width;
                this.y = height + this.radius;
                this.vx = (Math.random() - 0.5) * 1.2;
                this.vy = -Math.random() * 1.2; // Движение вверх
                break;
            case 3: // Лево
                this.x = -this.radius;
                this.y = Math.random() * height;
                this.vx = Math.random() * 1.2; // Движение вправо
                this.vy = (Math.random() - 0.5) * 1.2;
                break;
        }
        
        this.life = 1.0;
        this.radius = Math.random() * 3 + 2; // Больше размер при возрождении
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    
    // Отрисовка частицы
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        // Добавляем свечение для большей заметности
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 3;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавляем внутренний круг для объёма
        ctx.fillStyle = this.isDark ? '#ffffff' : '#ffffff';
        ctx.globalAlpha = this.life * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Инициализация canvas с частицами
function initParticlesCanvas() {
    particlesCanvas = document.getElementById('particles-canvas');
    if (!particlesCanvas) return;
    
    particlesCtx = particlesCanvas.getContext('2d');
    
    // Определяем текущую тему
    isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Настройка canvas
    function resizeCanvas() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Создаём больше частиц
    const particleCount = Math.min(65, Math.floor((window.innerWidth * window.innerHeight) / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight,
            isDarkTheme
        ));
    }
    
    // Запускаем анимацию
    animateParticles();
}

// Анимация частиц
function animateParticles() {
    particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    
    // Обновляем и рисуем все частицы
    particles.forEach(particle => {
        particle.update(particlesCanvas.width, particlesCanvas.height);
        particle.draw(particlesCtx);
    });
    
    // Рисуем случайные соединения между близкими частицами
    drawRandomConnections();
    
    animationId = requestAnimationFrame(animateParticles);
}

// Рисование случайных соединений между частицами
function drawRandomConnections() {
    const maxDistance = 80; // Увеличиваем расстояние для большего количества соединений
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                // Увеличиваем прозрачность для лучшей видимости
                const opacity = (1 - distance / maxDistance) * 0.4;
                
                // Разные цвета для соединений в зависимости от темы
                const connectionColor = isDarkTheme ? '#9ca3af' : '#8b5a2b';
                
                particlesCtx.strokeStyle = connectionColor;
                particlesCtx.globalAlpha = opacity;
                particlesCtx.lineWidth = 0.8; // Толще линии
                particlesCtx.lineCap = 'round'; // Скруглённые концы
                
                // Добавляем свечение для соединений
                particlesCtx.shadowColor = connectionColor;
                particlesCtx.shadowBlur = 2;
                
                particlesCtx.beginPath();
                particlesCtx.moveTo(particles[i].x, particles[i].y);
                particlesCtx.lineTo(particles[j].x, particles[j].y);
                particlesCtx.stroke();
            }
        }
    }
    particlesCtx.globalAlpha = 1;
    particlesCtx.shadowBlur = 0;
}

// Обновление темы для частиц
function updateParticlesTheme(isDark) {
    isDarkTheme = isDark;
    
    // Обновляем цвета всех частиц
    particles.forEach(particle => {
        particle.isDark = isDark;
        particle.colors = isDark ? 
            ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'] : // Тёмная тема
            ['#8b5a2b', '#a0522d', '#cd853f', '#d2691e']; // Светлая тема (коричневые тона)
        particle.color = particle.colors[Math.floor(Math.random() * particle.colors.length)];
    });
}

// Очистка анимации
function cleanupParticles() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Инициализация при загрузке страницы
let csrfToken = '';

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => (this.resolve = resolve));
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Убираем якорь из URL при загрузке, чтобы страница всегда открывалась наверху.
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }

    // Получаем CSRF-токен при загрузке страницы
    fetch('/get-csrf-token')
        .then(res => res.json())
        .then(data => {
            csrfToken = data.csrf_token;
        })
        .catch(error => console.error('Не удалось получить CSRF-токен:', error));

    // Инициализируем canvas с частицами
    initParticlesCanvas();
    
    // Плавное появление контента
    initSmoothAppearance();
    
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
    initCodeRain();
    initTextScramble();
    initThemeToggle();
    initParticleCanvas();
    initResumeDownload();
});

// Обновляем тему частиц при смене темы
document.addEventListener('themeChanged', function(e) {
    updateParticlesTheme(e.detail.isDark);
});

// Функция для скачивания резюме
function initResumeDownload() {
    const resumeButton = document.getElementById('resume-download');
    if (!resumeButton) {
        console.error('Кнопка скачивания резюме не найдена!');
        return;
    }
    
    console.log('Кнопка скачивания резюме инициализирована');
    
    resumeButton.addEventListener('click', function() {
        console.log('Попытка скачать резюме...');
        
        try {
            // Способ 1: Создание ссылки для скачивания
            const link = document.createElement('a');
            link.href = 'resume.pdf';
            link.download = 'Resume_IsamiddinovBB.pdf';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Резюме отправлено на скачивание');
            
            // Способ 2: Альтернативный способ через window.open
            setTimeout(() => {
                try {
                    window.open('resume.pdf', '_blank');
                } catch (e) {
                    console.error('Альтернативный способ скачивания не сработал:', e);
                }
            }, 100);
            
        } catch (error) {
            console.error('Ошибка при скачивании резюме:', error);
            
            // Способ 3: Прямое открытие в новой вкладке
            try {
                window.open('resume.pdf', '_blank');
            } catch (e) {
                console.error('Все способы скачивания не сработали:', e);
                alert('Не удалось скачать резюме. Попробуйте открыть файл в новой вкладке.');
            }
        }
    });
}

// Функция для загрузки и отображения проектов
function loadProjects() {
    // Для GitHub Pages мы загружаем статический JSON-файл напрямую,
    // а не обращаемся к API, которого там нет.
    fetch('projects.json')
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
    if (!themeToggleBtn || !transitionOverlay) return;

    const htmlElement = document.documentElement;
    
    const updateIcon = (theme) => {
        const moonIcon = themeToggleBtn.querySelector('.fa-moon');
        const sunIcon = themeToggleBtn.querySelector('.fa-sun');
        if (!moonIcon || !sunIcon) return;

        if (theme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'inline-block';
        } else {
            moonIcon.style.display = 'inline-block';
            sunIcon.style.display = 'none';
        }
    };

    // Устанавливаем правильную иконку при загрузке, основываясь на атрибуте,
    // который уже установлен инлайн-скриптом в <head>.
    const initialTheme = htmlElement.getAttribute('data-theme') || 'dark';
    updateIcon(initialTheme);
    
    themeToggleBtn.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // 1. Активируем оверлей, чтобы он плавно появился
        transitionOverlay.classList.add('active');
        
        // 2. Ждем, пока оверлей полностью покроет экран (время = transition-duration в CSS)
        setTimeout(() => {
            // 3. Меняем тему, пока экран скрыт
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
            
            // Отправляем событие для обновления Vanta.js темы
            const isDark = newTheme === 'dark';
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark } }));
            
            // 4. С помощью requestAnimationFrame убираем оверлей, чтобы он плавно исчез
            requestAnimationFrame(() => transitionOverlay.classList.remove('active'));
        }, 800); // Это время должно совпадать с transition в .theme-transition-overlay
    });
}

// Функция для анимации текста (глитч на десктопе, простой fade на мобильных)
function initTextScramble() {
    const skillsText = document.getElementById('skills-text');
    if (!skillsText) return;

    const skills = [
        "Python", "C++", "Machine Learning", "Scikit-learn", "TensorFlow",
        "PyTorch", "Pandas & NumPy", "Natural Language Processing", "SQL",
        "PostgreSQL", "RESTful API", "Qt Framework", "Neo4j (Cypher)",
    ];

    // Оптимизация для мобильных: простой fade-эффект вместо глитча
    if (window.innerWidth <= 768) {
        let counter = 0;
        skillsText.style.transition = 'opacity 0.4s ease-in-out';
        
        // Устанавливаем начальный текст
        skillsText.textContent = skills[counter];

        setInterval(() => {
            skillsText.style.opacity = 0; // Fade out
            setTimeout(() => {
                counter = (counter + 1) % skills.length;
                skillsText.textContent = skills[counter];
                skillsText.style.opacity = 1; // Fade in
            }, 400); // Должно совпадать с длительностью transition
        }, 2500); // Меняем текст каждые 2.5 секунды
    } else {
        // Для десктопа используем глитч-эффект
        const fx = new TextScramble(skillsText);
        let counter = 0;
        const next = () => {
            fx.setText(skills[counter]).then(() => {
                setTimeout(next, 1000); // Интервал между сменой текста
            });
            counter = (counter + 1) % skills.length;
        };
        next();
    }
}

// Анимация появления элементов при прокрутке с помощью IntersectionObserver
function initRevealOnScroll() {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length === 0) return;

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Когда элемент входит в область видимости
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Прекращаем наблюдение за элементом после того, как он появился,
                // чтобы не тратить ресурсы.
                observer.unobserve(entry.target);
            }
        });
    }, {
        // Начинаем анимацию, когда элемент находится в 100px от нижней границы экрана
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.01 // Сработает как только хотя бы 1% элемента станет виден
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
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
                    // Компенсация фиксированного header
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const sectionTop = targetSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: sectionTop,
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

// Функция для создания фона с анимированными частицами
function initParticleCanvas() {
    // Отключаем на мобильных для производительности
    if (window.innerWidth <= 768) return;
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray;

    // Устанавливаем размер холста
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Класс для частиц
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        // Метод для отрисовки частицы
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Метод для обновления положения частицы
        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    // Создаем массив частиц
    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 12000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 1.5) + 0.5;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * .4) - .2;
            let directionY = (Math.random() * .4) - .2;
            let color = 'rgba(217, 191, 159, 0.6)';

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Анимационный цикл
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
    }

    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        init();
    });

    init();
    animate();
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
                
                const duration = 1000; // Длительность анимации в мс
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

// Функция для создания фоновой анимации "дождя из кода"
function initCodeRain() {
    // Отключаем на мобильных для производительности
    if (window.innerWidth <= 768) return;
    const container = document.getElementById('code-rain-container');
    if (!container) return;

    // Набор символов для анимации
    const chars = '0123456789ABCDEF{}[]()<>/?|*&^%$#@!';
    // Определяем количество колонок в зависимости от ширины экрана
    const numberOfColumns = Math.floor(window.innerWidth / 25);

    // Определяем, какая тема активна, для настройки прозрачности
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    const opacityRange = isDarkTheme ? { min: 0.05, range: 0.1 } : { min: 0.15, range: 0.2 };

    // Очищаем контейнер на случай повторной инициализации (например, при ресайзе)
    container.innerHTML = '';

    for (let i = 0; i < numberOfColumns; i++) {
        const column = document.createElement('div');
        column.className = 'code-column';

        // Генерируем случайный текст для колонки
        let columnText = '';
        const columnHeight = Math.floor(Math.random() * 30) + 20; // Случайная длина от 20 до 50 символов
        for (let j = 0; j < columnHeight; j++) {
            columnText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        column.textContent = columnText;

        // Задаем случайные параметры для каждой колонки
        column.style.left = `${Math.random() * 100}vw`;
        const duration = Math.random() * 20 + 15; // Длительность падения от 15 до 35 секунд
        const delay = Math.random() * 15; // Задержка старта от 0 до 15 секунд
        column.style.animationDuration = `${duration}s`;
        column.style.animationDelay = `${delay}s`;
        column.style.opacity = (Math.random() * opacityRange.range + opacityRange.min).toFixed(2);

        container.appendChild(column);
    }
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
    // Отключаем на мобильных для производительности
    if (window.innerWidth <= 768) return;
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