import logging
from logging.handlers import RotatingFileHandler
import os

LOG_DIR = os.path.dirname(os.path.abspath(__file__))

def setup_logging():
    log_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # General app log
    app_log_file = os.path.join(LOG_DIR, 'app.log')
    app_handler = RotatingFileHandler(app_log_file, maxBytes=10*1024*1024, backupCount=5)
    app_handler.setFormatter(log_format)
    app_handler.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_format)
    console_handler.setLevel(logging.INFO)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(app_handler)
    root_logger.addHandler(console_handler)

setup_logging()
