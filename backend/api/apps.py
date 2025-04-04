import sys # Import sys to check command line arguments
import logging
import atexit
from datetime import datetime

from django.apps import AppConfig
from django.core import management
# Only import scheduler if needed
# from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)

# --- Keep your run_* functions as they are ---
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
# --- End of run_* functions ---


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        super().ready()
        is_utility_command = any(
            cmd in sys.argv for cmd in [
                'test', 'makemigrations', 'migrate', 'shell', 'createsuperuser',
                'collectstatic', 'check', 'dbshell', 'diffsettings', 'dumpdata',
                'flush', 'inspectdb', 'loaddata', 'showmigrations', 'sqlflush',
                'sqlmigrate', 'sqlsequencereset', 'squashmigrations', 'startapp',
                'startproject'
                # Add others if necessary
            ]
        )
        # Check if it's specifically the runserver command (or potentially your prod server command)
        is_runserver = 'runserver' in sys.argv

        if is_runserver and not is_utility_command:
            logger.info("Detected runserver command, attempting to start scheduler and initial seeding...")

            # Import scheduler only when needed
            from apscheduler.schedulers.background import BackgroundScheduler

            scheduler = BackgroundScheduler()
            try:
                # Consider if you REALLY want to seed every time runserver starts.
                # Maybe only seed if the tables are empty?
                # Or remove these immediate jobs entirely and rely on manual seeding
                # or seeding during migrations.
                logger.warning("Adding immediate seed jobs - consider if this is desired on every runserver start.")
                scheduler.add_job(run_seed_timeslots, 'date', run_date=datetime.now(), id='seed_timeslots_immediate', replace_existing=True)
                scheduler.add_job(run_seed_rooms, 'date', run_date=datetime.now(), id='seed_rooms_immediate', replace_existing=True)
                scheduler.add_job(run_seed_students, 'date', run_date=datetime.now(), id='seed_students_immediate', replace_existing=True)

                # Add the recurring job
                scheduler.add_job(run_clear_daily_reservations, 'cron', hour='21', minute='00', id='clear_daily_reservations_cron', replace_existing=True)

                scheduler.start()
                atexit.register(lambda: scheduler.shutdown())
                logger.info("APScheduler started and jobs scheduled.")

            except Exception as e:
                logger.error(f"Error during scheduler setup in ready(): {e}", exc_info=True) # Log full traceback

        elif is_utility_command:
            logger.info(f"Skipping scheduler setup due to management command: {' '.join(sys.argv)}")
        else:
             logger.info(f"Skipping scheduler setup for command: {' '.join(sys.argv)}")

        # You might still want to import signals here, outside the conditional block
        # import .signals