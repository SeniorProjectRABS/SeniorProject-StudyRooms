# Generated by Django 5.1.4 on 2025-03-01 19:54

import datetime
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('student_id', models.CharField(max_length=20, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='StudyRoom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room_number', models.CharField(max_length=5, unique=True)),
                ('floor', models.CharField(max_length=5)),
            ],
        ),
        migrations.CreateModel(
            name='TimeSlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.TimeField(help_text='Start time of the time slot (e.g., 09:00)')),
                ('end_time', models.TimeField(help_text='End time of the time slot (e.g., 09:30)')),
            ],
        ),
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.TimeField(blank=True, help_text='Start time of the entire reservation block (derived from timeslots)', null=True)),
                ('end_time', models.TimeField(blank=True, help_text='End time of the entire reservation block (derived from timeslots)', null=True)),
                ('date', models.DateField(default=datetime.date.today)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending Confirmation'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='api.student')),
                ('study_room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='api.studyroom')),
                ('timeslots', models.ManyToManyField(related_name='reservations', to='api.timeslot')),
            ],
        ),
    ]
