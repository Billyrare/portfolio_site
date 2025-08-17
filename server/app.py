from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import requests
import json
import re
from dotenv import load_dotenv
from flask_wtf.csrf import CSRFProtect, generate_csrf
import bleach
from flask_cors import CORS 
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address   
# Загружаем переменные окружения из .env файла
load_dotenv()

app = Flask(__name__)
CORS(app)

# Настройка CSRF-защиты
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'временный-секретный-ключ-для-разработки')
csrf = CSRFProtect(app)

# Конфигурация для Telegram
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

parent_dir = os.path.abspath(os.path.join(app.root_path, '..'))

@app.route('/')
def index():
    return send_from_directory(parent_dir, 'index.html')

@app.route('/styles.css')
def styles():
    return send_from_directory(parent_dir, 'styles.css')

@app.route('/script.js')
def script():
    return send_from_directory(parent_dir, 'script.js')

@app.route('/exoplanet.html')
def exoplanet_page():
    return send_from_directory(parent_dir, 'exoplanet.html')

@app.route('/neural-compression.html')
def neural_compression_page():
    return send_from_directory(parent_dir, 'neural-compression.html')

@app.route('/hamming-network.html')
def hamming_network_page():
    return send_from_directory(parent_dir, 'hamming-network.html')

@app.route('/recurrent-network.html')
def recurrent_network_page():
    return send_from_directory(parent_dir, 'recurrent-network.html')

@app.route('/images/<path:filename>')
def serve_image(filename):
    """Отдает статические файлы из папки images"""
    return send_from_directory(os.path.join(parent_dir, 'images'), filename)

@app.route('/get-csrf-token', methods=['GET'])
def get_csrf_token():
    """Получение CSRF-токена для использования в AJAX-запросах"""
    token = generate_csrf()
    return jsonify({'csrf_token': token})

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Отдает список проектов из JSON-файла"""
    try:
        # Путь к файлу projects.json в корневой директории
        projects_file_path = os.path.join(app.root_path, '..', 'projects.json')
        
        with open(projects_file_path, 'r', encoding='utf-8') as f:
            projects = json.load(f)
            
        return jsonify(projects)
    except FileNotFoundError:
        return jsonify({"error": "Файл с проектами не найден"}), 404
    except Exception as e:
        app.logger.error(f"Ошибка при чтении файла с проектами: {e}")
        return jsonify({"error": "Не удалось загрузить проекты"}), 500

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
        
        # Отправляем сообщение в Telegram
        message_sent_successfully = send_telegram_message(msg_content)
        
        if not message_sent_successfully:
            return jsonify({'success': False, 'error': 'Ошибка на стороне сервера: не удалось отправить сообщение в Telegram.'}), 500
            
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

def send_telegram_message(text):
    """Отправляет сообщение в Telegram"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        app.logger.error("Telegram Bot Token или Chat ID не настроены в переменных окружения.")
        return False
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': text,
        'parse_mode': 'Markdown'
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()  # Вызовет исключение для плохих ответов (4xx или 5xx)
        app.logger.info(f"Сообщение успешно отправлено в Telegram. Status: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Ошибка при отправке сообщения в Telegram: {e}")
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
        "timestamp": import_time().now().strftime("%Y-%m-%d %H:%M:%S")
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
