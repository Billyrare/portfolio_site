from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import smtplib
from email.mime.text import MIMEText
import json
import re
from dotenv import load_dotenv
from flask_wtf.csrf import CSRFProtect, generate_csrf
import bleach

# Загружаем переменные окружения из .env файла
load_dotenv()

app = Flask(__name__, static_folder="../", static_url_path="")

# Настройка CSRF-защиты
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'временный-секретный-ключ-для-разработки')
csrf = CSRFProtect(app)

# Конфигурация для отправки писем
EMAIL_CONFIG = {
    "smtp_server": os.environ.get("SMTP_SERVER", "smtp.gmail.com"),
    "smtp_port": int(os.environ.get("SMTP_PORT", 587)),
    "email": os.environ.get("EMAIL_USER", "your-email@gmail.com"),
    "password": os.environ.get("EMAIL_PASSWORD", "your-app-password")
}

@app.route('/')
def index():
    return send_from_directory('../', 'index.html')

@app.route('/styles.css')
def styles():
    return send_from_directory('../', 'styles.css')

@app.route('/script.js')
def script():
    return send_from_directory('../', 'script.js')

@app.route('/get-csrf-token', methods=['GET'])
def get_csrf_token():
    """Получение CSRF-токена для использования в AJAX-запросах"""
    token = generate_csrf()
    return jsonify({'csrf_token': token})

@app.route('/submit_contact', methods=['POST'])
def submit_contact():
    try:
        data = request.json
        name = bleach.clean(data.get('name', ''))
        email = bleach.clean(data.get('email', ''))
        message = bleach.clean(data.get('message', ''))
        
        # Базовая валидация входных данных
        if not all([name, email, message]):
            return jsonify({'success': False, 'error': 'Пожалуйста, заполните все поля'}), 400
        
        # Проверка формата email
        if not is_valid_email(email):
            return jsonify({'success': False, 'error': 'Пожалуйста, введите корректный email'}), 400
        
        # Проверка на спам и защита от инъекций
        if contains_suspicious_content(message):
            return jsonify({'success': False, 'error': 'Сообщение содержит подозрительный контент'}), 400
        
        # Ограничение длины
        if len(message) > 3000:
            return jsonify({'success': False, 'error': 'Сообщение слишком длинное'}), 400
        
        # Формирование сообщения
        msg_content = f"От: {name}\nEmail: {email}\n\nСообщение:\n{message}"
        
        # Сохраняем сообщения в файл (только для разработки, не для продакшна)
        if app.config.get('DEBUG', False):
            save_message_to_file(name, email, message)
        
        # Раскомментируйте эту часть, когда будете готовы отправлять почту
        # send_email(f"Сообщение с портфолио от {name}", msg_content)
        
        # Логирование успешного отправления
        app.logger.info(f"Получено сообщение от {email}")
        
        return jsonify({'success': True, 'message': 'Сообщение отправлено успешно!'})
    
    except Exception as e:
        app.logger.error(f"Ошибка при отправке сообщения: {str(e)}")
        return jsonify({'success': False, 'error': 'Произошла ошибка при отправке сообщения'}), 500

def is_valid_email(email):
    """Проверяет, что email соответствует стандартному формату"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def contains_suspicious_content(text):
    """Проверяет сообщение на наличие подозрительного содержимого"""
    # Простая проверка на спам-ссылки или скрипты
    suspicious_patterns = [
        r'<script', r'javascript:', r'eval\(', r'document\.cookie',
        r'viagra', r'buy now', r'\$\$\$', r'casino', r'lottery'
    ]
    for pattern in suspicious_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def send_email(subject, message_content):
    """Отправляет email с использованием SMTP"""
    try:
        # Создаем текстовое сообщение
        msg = MIMEText(message_content)
        msg['Subject'] = subject
        msg['From'] = EMAIL_CONFIG["email"]
        msg['To'] = EMAIL_CONFIG["email"]  # Отправляем себе же
        
        # Подключаемся к SMTP серверу и отправляем письмо
        with smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"]) as server:
            server.starttls()
            server.login(EMAIL_CONFIG["email"], EMAIL_CONFIG["password"])
            server.send_message(msg)
        
        return True
    except Exception as e:
        app.logger.error(f"Ошибка при отправке email: {e}")
        return False

def save_message_to_file(name, email, message):
    """Сохраняет сообщение в JSON файл (для разработки)"""
    if not app.config.get('DEBUG', False):
        return  # В production режиме не сохраняем сообщения в файл
        
    messages_dir = "messages"
    os.makedirs(messages_dir, exist_ok=True)
    
    contact = {
        "name": name,
        "email": email,
        "message": message,
        "timestamp": import_time().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    try:
        messages_file = os.path.join(messages_dir, "messages.json")
        messages = []
        
        if os.path.exists(messages_file):
            with open(messages_file, 'r', encoding='utf-8') as f:
                messages = json.load(f)
        
        messages.append(contact)
        
        with open(messages_file, 'w', encoding='utf-8') as f:
            json.dump(messages, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        app.logger.error(f"Ошибка при сохранении сообщения: {e}")

def import_time():
    """Импортирует модуль datetime только когда нужно"""
    from datetime import datetime
    return datetime

if __name__ == '__main__':
    # Настройка журналирования
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler()]
    )

    # В продакшене рекомендуется выключить режим debug
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    app.run(debug=debug_mode, host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 