# Generated by Django 5.1.6 on 2025-04-20 20:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='agency_address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='agency_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
