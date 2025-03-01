from django.apps import AppConfig
from django.core import management
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def run_clear_daily_reservations():
    logger.info("Running clear_daily_reservations command...")
    management.call_command('clear_daily_reservations')
    logger.info("clear_daily_reservations command finished.")

def run_seed_timeslots():
    logger.info("Running seed_timeslots command...")
    management.call_command('seed_timeslots')
    logger.info("seed_timeslots command finished.")

def run_seed_rooms():
    logger.info("Running seed_rooms command...")
    management.call_command('seed_rooms')
    logger.info("seed_rooms command finished.")

def run_seed_students():
    logger.info("Running seed_students command...")
    management.call_command('seed_students')
    logger.info("seed_students command finished")

class ApiConfig(AppConfig): # Adjust class name if needed
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        super().ready() # Make sure to call super().ready()

        scheduler = BackgroundScheduler()
        try:
            scheduler.add_job(run_seed_timeslots, 'date', run_date=datetime.now())
        except Exception as e:
            logger.error(f"Error adding seed_timeslots job: {e}") # Added error logging
        try:
            scheduler.add_job(run_seed_rooms, 'date', run_date=datetime.now())
        except Exception as e:
            logger.error(f"Error adding seed_rooms job: {e}")  # Added error logging
        try:
            scheduler.add_job(run_seed_students, 'date', run_date=datetime.now())
        except Exception as e:
            logger.error(f"Error adding seed_students job: {e}")  # Added error logging

        try:
            scheduler.add_job(run_clear_daily_reservations, 'cron', hour='21', minute='00')
        except Exception as e:
            logger.error(f"Error adding clear_daily_reservations job: {e}") # Added error logging


        scheduler.start()
        atexit.register(lambda: scheduler.shutdown())
        logger.info("APScheduler started and jobs scheduled.")