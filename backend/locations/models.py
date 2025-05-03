from django.db import models
from users.models import CustomUser

class AnnonceLocation(models.Model):
    marque = models.CharField(max_length=100)
    modele = models.CharField(max_length=100)
    matricule = models.CharField(max_length=50, unique=True)
    moteur = models.CharField(max_length=50)
    puissance = models.CharField(max_length=20)
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    zone = models.CharField(max_length=100)
    image = models.ImageField(upload_to='annonces/')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)  # Nouveau champ
    is_rejected = models.BooleanField(default=False)  # Nouveau champ

    def __str__(self):
        return f"{self.marque} {self.modele} - {self.matricule}"

    class Meta:
        ordering = ['-created_at']
class Reservation(models.Model):
    vehicle = models.ForeignKey(AnnonceLocation, on_delete=models.CASCADE)
    client = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date_debut = models.DateField()
    date_fin = models.DateField()
    telephone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    is_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return f"Reservation #{self.id} - {self.vehicle.marque} {self.vehicle.modele}"    