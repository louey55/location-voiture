from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('Agence', 'Agence'),
        ('Client', 'Client'),
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