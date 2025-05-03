from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('Agence', 'Agence'),
        ('Client', 'Client'),
        ('Admin', 'Admin'),  # Ajoutez ce choix
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    email = models.EmailField(unique=True)
    agency_name = models.CharField(max_length=100, blank=True, null=True)
    agency_address = models.CharField(max_length=255, blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'user_type']
    
    def __str__(self):
        return self.email

# Déplacez cette fonction en dehors de la classe
@receiver(post_migrate)
def create_admin_user(sender, **kwargs):
    if sender.name == 'users':
        User = get_user_model()
        admin_email = 'admin@admin.com'  # Utilisez le même email partout
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                email=admin_email,
                username='admin',
                password='admin123',  # Changez ce mot de passe en production!
                first_name='Admin',
                last_name='System',
                user_type='Admin'  # Correspond à USER_TYPE_CHOICES
            )