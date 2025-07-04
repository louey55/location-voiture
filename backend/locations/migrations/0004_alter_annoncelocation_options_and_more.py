# Generated by Django 5.1.7 on 2025-05-03 09:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0003_reservation'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='annoncelocation',
            options={'ordering': ['-created_at']},
        ),
        migrations.AddField(
            model_name='annoncelocation',
            name='is_approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='annoncelocation',
            name='is_rejected',
            field=models.BooleanField(default=False),
        ),
    ]
