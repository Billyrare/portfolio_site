// Плавная прокрутка к секциям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Анимация появления элементов при прокрутке
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Обработка формы
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    // Получаем CSRF-токен при загрузке страницы
    let csrfToken = '';
    
    fetch('/get-csrf-token')
        .then(response => response.json())
        .then(data => {
            csrfToken = data.csrf_token;
            
            // Добавляем скрытое поле с токеном
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'csrf_token';
            tokenInput.value = csrfToken;
            contactForm.appendChild(tokenInput);
        })
        .catch(error => {
            console.error('Ошибка при получении CSRF-токена:', error);
        });
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Собираем данные из формы
        const formData = {
            name: contactForm.querySelector('input[type="text"]').value,
            email: contactForm.querySelector('input[type="email"]').value,
            message: contactForm.querySelector('textarea').value,
            csrf_token: csrfToken
        };
        
        // Базовая валидация на стороне клиента
        if (!formData.name || !formData.email || !formData.message) {
            alert('Пожалуйста, заполните все поля формы');
            return;
        }
        
        // Простая проверка формата email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            alert('Пожалуйста, введите корректный email');
            return;
        }
        
        // Проверка длины сообщения
        if (formData.message.length > 3000) {
            alert('Сообщение слишком длинное. Максимальная длина: 3000 символов');
            return;
        }
        
        // Отображаем состояние загрузки
        const submitButton = contactForm.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = "ОТПРАВКА...";
        submitButton.disabled = true;
        
        // Отправляем данные на сервер
        fetch('/submit_contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            // Проверяем статус ответа
            if (!response.ok) {
                throw new Error('Ошибка сети или сервера');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Анимация успешной отправки
                submitButton.textContent = "ОТПРАВЛЕНО!";
                submitButton.classList.add('success');
                
                // Глитч-эффект при успехе
                setTimeout(() => {
                    submitButton.classList.add('active-glitch');
                    setTimeout(() => {
                        submitButton.classList.remove('active-glitch');
                    }, 500);
                }, 300);
                
                // Сбрасываем форму и кнопку через 2 секунды
                setTimeout(() => {
                    contactForm.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.classList.remove('success');
                }, 2000);
            } else {
                // Анимация ошибки
                submitButton.textContent = data.error || "ОШИБКА!";
                submitButton.classList.add('error');
                
                // Глитч-эффект при ошибке
                const glitchErrorAnimation = setInterval(() => {
                    submitButton.classList.toggle('active-glitch');
                }, 200);
                
                // Останавливаем глитч-анимацию и восстанавливаем кнопку
                setTimeout(() => {
                    clearInterval(glitchErrorAnimation);
                    submitButton.classList.remove('active-glitch', 'error');
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }, 2000);
                
                console.error('Ошибка отправки формы:', data.error);
            }
        })
        .catch(error => {
            // Обработка ошибок сети
            submitButton.textContent = "ОШИБКА СЕТИ";
            submitButton.classList.add('error');
            console.error('Сетевая ошибка:', error);
            
            // Восстанавливаем кнопку через 2 секунды
            setTimeout(() => {
                submitButton.classList.remove('error');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    });
}

// Анимация навигации при прокрутке
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        // Прокрутка вниз
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        // Прокрутка вверх
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .navbar.scroll-down {
        transform: translateY(-100%);
    }

    .navbar.scroll-up {
        transform: translateY(0);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);

// Функционал для навигационных точек
document.addEventListener('DOMContentLoaded', function() {
    // Навигационные точки
    const dots = document.querySelectorAll('.dot');
    const sections = document.querySelectorAll('section');

    // Функция для определения активной секции
    function setActiveDot() {
        const scrollPosition = window.scrollY + window.innerHeight / 3;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                dots.forEach(dot => dot.classList.remove('active'));
                dots[index].classList.add('active');
            }
        });
    }

    // Обработчик клика по точкам
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            sections[index].scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Обновляем активную точку при скролле
    window.addEventListener('scroll', setActiveDot);
    // Устанавливаем начальную активную точку
    setActiveDot();

    // Глитч-эффект при наведении 
    const glitchElements = document.querySelectorAll('.glitch');
    glitchElements.forEach(element => {
        element.addEventListener('mouseover', () => {
            element.classList.add('active-glitch');
        });
        element.addEventListener('mouseout', () => {
            element.classList.remove('active-glitch');
        });
    });

    // Эффект шума для фона
    function createNoise() {
        const canvas = document.createElement('canvas');
        canvas.classList.add('noise');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const noise = ctx.createImageData(canvas.width, canvas.height);
        
        function generateNoise() {
            const data = noise.data;
            for (let i = 0; i < data.length; i += 4) {
                const value = Math.random() * 255;
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
                data[i + 3] = Math.random() * 10;  // низкая прозрачность для деликатного эффекта
            }
            ctx.putImageData(noise, 0, 0);
            requestAnimationFrame(generateNoise);
        }
        
        generateNoise();
    }
    
    // Создаем шумовой эффект
    createNoise();

    // Эффект для кнопок
    const buttons = document.querySelectorAll('.cta-button, .submit-button, .project-link');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.glitchAmount = '5';
        });
        button.addEventListener('mouseout', () => {
            button.style.glitchAmount = '0';
        });
    });

    // Эффект терминала для текстовых полей
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.classList.add('terminal-active');
        });
        input.addEventListener('blur', () => {
            input.classList.remove('terminal-active');
        });
    });

    // Анимация появления разделов при скролле
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.classList.add('section-hidden');
        observer.observe(section);
    });

    // Добавляем стили для анимации появления
    const style = document.createElement('style');
    style.textContent = `
        .section-hidden {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s;
        }

        .section-hidden.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .noise {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            opacity: 0.05;
            mix-blend-mode: overlay;
        }

        .terminal-active {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3) !important;
        }

        .active-glitch {
            animation: activeGlitch 0.3s infinite;
        }

        @keyframes activeGlitch {
            0% {
                transform: translate(0);
            }
            20% {
                transform: translate(-2px, 2px);
            }
            40% {
                transform: translate(-2px, -2px);
            }
            60% {
                transform: translate(2px, 2px);
            }
            80% {
                transform: translate(2px, -2px);
            }
            100% {
                transform: translate(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Добавляем функционал для параллакс-эффекта
document.addEventListener('DOMContentLoaded', function() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        // Анимация параллакс-элементов
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.1;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        // Анимация параллакс-фона в главной секции
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            const heroOffset = heroSection.offsetTop;
            const heroHeight = heroSection.offsetHeight;
            
            if (scrollY <= heroHeight) {
                const layer1 = document.querySelector('.layer-1');
                const layer2 = document.querySelector('.layer-2');
                const layer3 = document.querySelector('.layer-3');
                
                if (layer1) layer1.style.transform = `translateY(${scrollY * 0.3}px)`;
                if (layer2) layer2.style.transform = `translateY(${scrollY * 0.2}px)`;
                if (layer3) layer3.style.transform = `translateY(${scrollY * 0.1}px)`;
            }
        }
    });
    
    // Добавляем параллакс-эффект при движении мыши для главной секции
    const parallaxContainer = document.querySelector('.parallax-container');
    if (parallaxContainer) {
        document.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            const layers = document.querySelectorAll('.parallax-bg');
            layers.forEach((layer, index) => {
                const depth = (index + 1) * 3;
                const moveX = mouseX * depth;
                const moveY = mouseY * depth;
                layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });
        });
    }
});

// Добавляем случайные глитчи (короткие сбои) для текстовых элементов
function randomGlitch() {
    const glitchTexts = document.querySelectorAll('.text-glitch');
    
    // Выбираем случайный элемент для глитча
    if (glitchTexts.length > 0) {
        const randomIndex = Math.floor(Math.random() * glitchTexts.length);
        const randomElement = glitchTexts[randomIndex];
        
        // Добавляем и убираем класс для создания короткого глитча
        randomElement.classList.add('active-glitch');
        
        setTimeout(() => {
            randomElement.classList.remove('active-glitch');
        }, 200);
    }
}

// Запускаем случайные глитчи каждые 3-8 секунд
setInterval(() => {
    if (Math.random() > 0.6) { // 40% шанс запуска глитча
        randomGlitch();
    }
}, 3000);

// Эффект телевизионного сканирования
function scanlineEffect() {
    const scanline = document.createElement('div');
    scanline.classList.add('scanline');
    document.body.appendChild(scanline);
    
    // Стиль для сканлайна
    const scanlineStyle = document.createElement('style');
    scanlineStyle.textContent = `
        .scanline {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.05);
            z-index: 9999;
            pointer-events: none;
            animation: scanline 5s linear infinite;
        }
        
        @keyframes scanline {
            0% {
                top: -100px;
            }
            80% {
                top: 100%;
            }
            100% {
                top: 100%;
            }
        }
    `;
    document.head.appendChild(scanlineStyle);
}

// Запускаем эффект сканлайна
scanlineEffect();

// Добавляем мерцание экрана иногда
function screenFlicker() {
    const flickerOverlay = document.createElement('div');
    flickerOverlay.classList.add('flicker-overlay');
    document.body.appendChild(flickerOverlay);
    
    // Стиль для оверлея мерцания
    const flickerStyle = document.createElement('style');
    flickerStyle.textContent = `
        .flicker-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.03);
            z-index: 9998;
            pointer-events: none;
            opacity: 0;
        }
        
        .flicker-overlay.active {
            animation: screen-flicker 0.2s ease-in-out;
        }
        
        @keyframes screen-flicker {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(flickerStyle);
    
    // Случайное мерцание каждые 5-15 секунд
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% шанс мерцания
            flickerOverlay.classList.add('active');
            setTimeout(() => {
                flickerOverlay.classList.remove('active');
            }, 200);
        }
    }, 5000 + Math.random() * 10000);
}

// Запускаем эффект мерцания экрана
screenFlicker();

// Функция для клонирования и искажения текста при ховере
function enhancedTextGlitch() {
    const textElements = document.querySelectorAll('.text-glitch');
    textElements.forEach(element => {
        element.addEventListener('mouseover', () => {
            // Создаем клон с небольшим смещением
            const originalText = element.textContent;
            const glitchText = document.createElement('span');
            glitchText.classList.add('glitch-clone');
            glitchText.textContent = originalText;
            glitchText.style.position = 'absolute';
            glitchText.style.top = '0';
            glitchText.style.left = '0';
            glitchText.style.color = 'rgba(255,0,255,0.5)';
            glitchText.style.zIndex = '-1';
            glitchText.style.pointerEvents = 'none';
            
            // Добавляем клон и анимируем его
            element.style.position = 'relative';
            element.appendChild(glitchText);
            
            const animate = () => {
                glitchText.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
                requestAnimationFrame(animate);
            };
            
            animate();
        });
        
        element.addEventListener('mouseout', () => {
            // Удаляем клон
            const clone = element.querySelector('.glitch-clone');
            if (clone) {
                element.removeChild(clone);
            }
        });
    });
}

// Запускаем улучшенный текстовый глитч
enhancedTextGlitch();

// Создание матричного дождя
function createMatrixRain() {
    const container = document.getElementById('matrix-rain');
    const width = window.innerWidth;
    const symbolCount = Math.floor(width / 20); // Примерно один символ на каждые 20px ширины
    
    // Возможные символы для матрицы (цифры, буквы, японские символы)
    const symbols = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    // Создаем линии матрицы
    for (let i = 0; i < symbolCount; i++) {
        const line = document.createElement('div');
        line.className = 'matrix-line';
        
        // Случайные параметры для каждой линии
        const duration = 5 + Math.random() * 10; // от 5 до 15 секунд
        const delay = Math.random() * 15; // случайная задержка
        const left = (i * 20) + Math.random() * 10; // позиция по горизонтали
        
        // Создаем случайную строку символов
        let content = '';
        const length = 10 + Math.floor(Math.random() * 20); // от 10 до 30 символов
        for (let j = 0; j < length; j++) {
            content += symbols.charAt(Math.floor(Math.random() * symbols.length));
        }
        
        // Применяем стили и содержимое
        line.style.left = `${left}px`;
        line.style.animationDuration = `${duration}s`;
        line.style.animationDelay = `${delay}s`;
        line.textContent = content;
        
        // Добавляем линию в контейнер
        container.appendChild(line);
    }
}

// Вызываем функцию создания матрицы при загрузке
document.addEventListener('DOMContentLoaded', function() {
    createMatrixRain();
    
    // При изменении размера окна пересоздаем матрицу
    window.addEventListener('resize', function() {
        const container = document.getElementById('matrix-rain');
        container.innerHTML = ''; // Очищаем контейнер
        createMatrixRain(); // Создаем матрицу заново
    });
    
    // ... existing code ...
});

// Добавляем функционал для улучшенных эффектов кнопок
document.addEventListener('DOMContentLoaded', function() {
    // Обработка эффекта электрического разряда
    const electricButtons = document.querySelectorAll('.electric-effect');
    electricButtons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            // Изменяем угол поворота градиента в зависимости от положения курсора
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
            
            // Используем угол для поворота эффекта
            const before = button.querySelector('::before') || document.createElement('div');
            button.style.setProperty('--electric-angle', `${angle}deg`);
        });
    });
    
    // Улучшенный эффект пиксельного распада
    const pixelButtons = document.querySelectorAll('.pixel-decay');
    pixelButtons.forEach(button => {
        button.addEventListener('mouseover', function() {
            // Создаем пиксельные частицы
            for (let i = 0; i < 15; i++) {
                const pixel = document.createElement('div');
                pixel.classList.add('pixel-particle');
                
                // Случайное положение и размер
                const size = 2 + Math.random() * 4;
                const xPos = Math.random() * 100;
                const yPos = Math.random() * 100;
                const delay = Math.random() * 0.2;
                
                // Случайные значения для анимации
                const xOffset = (Math.random() - 0.5) * 100;
                const yOffset = (Math.random() - 0.5) * 100;
                const rotation = Math.random() * 360;
                
                // Устанавливаем CSS переменные для анимации
                pixel.style.setProperty('--x', `${xOffset}px`);
                pixel.style.setProperty('--y', `${yOffset}px`);
                pixel.style.setProperty('--r', `${rotation}deg`);
                
                pixel.style.width = `${size}px`;
                pixel.style.height = `${size}px`;
                pixel.style.left = `${xPos}%`;
                pixel.style.top = `${yPos}%`;
                pixel.style.backgroundColor = 'white';
                pixel.style.position = 'absolute';
                pixel.style.opacity = '0.6';
                pixel.style.animationDelay = `${delay}s`;
                
                button.appendChild(pixel);
                
                // Удаляем частицу после анимации
                setTimeout(() => {
                    if (pixel && pixel.parentNode === button) {
                        button.removeChild(pixel);
                    }
                }, 500);
            }
        });
    });
    
    // Динамический голографический эффект
    const hologramButtons = document.querySelectorAll('.hologram-effect');
    hologramButtons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Интенсивность эффекта в зависимости от положения курсора
            const intensity = (x / rect.width) * 100;
            button.style.setProperty('--holo-intensity', `${intensity}%`);
            
            // Угол наклона в зависимости от положения курсора по Y
            const skewAngle = ((y / rect.height) * 20) - 10;
            button.style.setProperty('--holo-skew', `${skewAngle}deg`);
        });
    });
    
    // Имитация помех VHS ленты
    const vhsElements = document.querySelectorAll('.vhs-effect');
    vhsElements.forEach(element => {
        element.addEventListener('mouseover', function() {
            // Создаем полосы смещения характерные для VHS
            const glitchInterval = setInterval(() => {
                const shift = Math.random() * 6 - 3;
                element.style.transform = `translateX(${shift}px)`;
                
                // Случайно добавляем хроматическую аберрацию
                if (Math.random() > 0.7) {
                    element.style.textShadow = `
                        ${Math.random() * 3}px 0 rgba(255,0,0,0.5),
                        ${-Math.random() * 3}px 0 rgba(0,255,255,0.5)
                    `;
                } else {
                    element.style.textShadow = '';
                }
            }, 50);
            
            // Очищаем интервал при убирании курсора
            element.addEventListener('mouseout', function() {
                clearInterval(glitchInterval);
                element.style.transform = '';
                element.style.textShadow = '';
            }, { once: true });
        });
    });
    
    // Дополнительные эффекты для искажения сигнала
    const distortElements = document.querySelectorAll('.signal-distortion');
    distortElements.forEach(element => {
        element.addEventListener('mouseover', function() {
            let distortFrame = 0;
            const distortInterval = setInterval(() => {
                // Создаем эффект сбоя сигнала
                if (Math.random() > 0.7 && distortFrame % 5 === 0) {
                    const xShift = Math.random() * 5 - 2.5;
                    const yShift = Math.random() * 3 - 1.5;
                    const scaleX = 0.95 + Math.random() * 0.1;
                    const scaleY = 0.95 + Math.random() * 0.1;
                    
                    element.style.transform = `translate(${xShift}px, ${yShift}px) scale(${scaleX}, ${scaleY})`;
                    
                    // Случайно меняем оттенок
                    const hue = Math.floor(Math.random() * 360);
                    element.style.filter = `hue-rotate(${hue}deg)`;
                } else if (distortFrame % 10 === 0) {
                    element.style.transform = '';
                    element.style.filter = '';
                }
                
                distortFrame++;
            }, 100);
            
            // Очищаем интервал при убирании курсора
            element.addEventListener('mouseout', function() {
                clearInterval(distortInterval);
                element.style.transform = '';
                element.style.filter = '';
            }, { once: true });
        });
    });
});

// Функционал для эффекта цифрового взлома
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем бинарные символы для цифрового взлома
    const hackElements = document.querySelectorAll('.digital-hack');
    hackElements.forEach(element => {
        // Добавляем контейнер для бинарного кода
        const binaryContainer = document.createElement('div');
        binaryContainer.classList.add('binary');
        
        // Генерируем случайный бинарный код
        let binaryText = '';
        for (let i = 0; i < 200; i++) {
            binaryText += Math.round(Math.random()) ? '1' : '0';
            if (i % 8 === 7) binaryText += ' ';
        }
        
        binaryContainer.textContent = binaryText;
        element.appendChild(binaryContainer);
        
        // Добавляем обработчик для анимации бинарного кода
        element.addEventListener('mouseover', () => {
            const intervalId = setInterval(() => {
                let newBinary = '';
                for (let i = 0; i < 200; i++) {
                    newBinary += Math.round(Math.random()) ? '1' : '0';
                    if (i % 8 === 7) newBinary += ' ';
                }
                binaryContainer.textContent = newBinary;
            }, 100);
            
            // Очищаем интервал при убирании курсора
            element.addEventListener('mouseout', () => {
                clearInterval(intervalId);
            }, { once: true });
        });
    });
    
    // Улучшаем эффект разрезов данных
    const dataSlicers = document.querySelectorAll('.data-slicer');
    dataSlicers.forEach(element => {
        // Оборачиваем текст в span для анимации
        const buttonText = element.textContent.trim();
        element.innerHTML = `<span class="button-text">${buttonText}</span>`;
        
        // Добавляем интерактивность
        element.addEventListener('mousemove', function(e) {
            const rect = element.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const progress = mouseX / rect.width;
            
            // Меняем интенсивность эффекта в зависимости от положения курсора
            element.style.setProperty('--slice-progress', progress);
            
            // Добавляем случайные "сбои" при движении
            if (Math.random() > 0.9) {
                const buttonText = element.querySelector('.button-text');
                buttonText.style.transform = `translateX(${(Math.random() * 10) - 5}px)`;
                setTimeout(() => {
                    buttonText.style.transform = 'translateX(0)';
                }, 50);
            }
        });
    });
    
    // Анимация объемного искажения
    const volumeElements = document.querySelectorAll('.volume-distort');
    volumeElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
            const rect = element.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            // Меняем угол поворота в зависимости от положения курсора
            const rotateY = x * 20; // max 10 degrees
            const rotateX = -y * 10; // max 5 degrees
            
            element.style.transform = `perspective(500px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
            
            // Меняем положение псевдоэлементов для создания эффекта глубины
            const zBefore = -20 - (y * 10);
            const zAfter = -5 + (y * 10);
            const xBefore = -10 - (x * 10);
            const xAfter = 10 + (x * 10);
            
            element.style.setProperty('--before-z', `${zBefore}px`);
            element.style.setProperty('--after-z', `${zAfter}px`);
            element.style.setProperty('--before-x', `${xBefore}px`);
            element.style.setProperty('--after-x', `${xAfter}px`);
        });
        
        // Сбрасываем трансформацию при убирании курсора
        element.addEventListener('mouseleave', function() {
            element.style.transform = '';
        });
    });
    
    // Дополнительная анимация для тени-глитч
    const shadowElements = document.querySelectorAll('.shadow-glitch');
    shadowElements.forEach(element => {
        element.addEventListener('mouseover', function() {
            // Создаем хаотичное движение тени
            const glitchInterval = setInterval(() => {
                if (Math.random() > 0.7) {
                    const xOffset = (Math.random() * 10) - 5;
                    const yOffset = (Math.random() * 10) - 5;
                    const blurRadius = Math.random() * 10;
                    
                    element.style.textShadow = `
                        ${xOffset}px ${yOffset}px ${blurRadius}px rgba(255, 0, 255, 0.7),
                        ${-xOffset}px ${-yOffset}px ${blurRadius}px rgba(0, 255, 255, 0.5)
                    `;
                }
            }, 100);
            
            // Очищаем интервал при убирании курсора
            element.addEventListener('mouseout', function() {
                clearInterval(glitchInterval);
                element.style.textShadow = '';
            }, { once: true });
        });
    });
    
    // Улучшаем эффект распада пикселей
    const dissolveElements = document.querySelectorAll('.pixel-dissolve');
    dissolveElements.forEach(element => {
        element.addEventListener('mouseover', function() {
            // Создаем пиксели
            for (let i = 0; i < 20; i++) {
                const pixel = document.createElement('div');
                pixel.classList.add('dissolve-pixel');
                
                // Случайные параметры
                const size = 3 + Math.random() * 5;
                const xPos = Math.random() * 100;
                const yPos = Math.random() * 100;
                const delay = Math.random() * 0.5;
                const duration = 0.3 + Math.random() * 0.7;
                
                pixel.style.width = `${size}px`;
                pixel.style.height = `${size}px`;
                pixel.style.left = `${xPos}%`;
                pixel.style.top = `${yPos}%`;
                pixel.style.opacity = '0';
                pixel.style.position = 'absolute';
                pixel.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                pixel.style.animation = `pixel-appear ${duration}s ease-out ${delay}s forwards`;
                
                element.appendChild(pixel);
                
                // Удаляем пиксель после анимации
                setTimeout(() => {
                    if (pixel && pixel.parentNode === element) {
                        element.removeChild(pixel);
                    }
                }, (delay + duration) * 1000);
            }
        });
    });
    
    // Добавляем стили для анимации пикселей
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pixel-appear {
            0% {
                opacity: 0;
                transform: translate(0, 0) scale(0);
            }
            50% {
                opacity: 0.8;
                transform: translate(var(--x, 10px), var(--y, 10px)) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(var(--x, 20px), var(--y, 20px)) scale(0);
            }
        }
    `;
    document.head.appendChild(style);
}); 