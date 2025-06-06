from rest_framework import serializers
from .models import AnnonceLocation, Reservation, Vehicule
from django.core.validators import FileExtensionValidator
from rest_framework.serializers import SerializerMethodField

class AnnonceLocationSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])],
        required=True
    )
    image_url = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()  # Correction ici
    
    class Meta:
        model = AnnonceLocation
        fields = ['id', 'marque', 'modele', 'matricule', 'moteur', 
                 'puissance', 'prix', 'zone', 'image', 'image_url', 
                 'user_email', 'created_at','is_approved', 'is_rejected']  # Ajout de 'user_email' ici
  
        read_only_fields = ['user', 'created_at', 'image_url', 'user_email','is_approved', 'is_rejected']
        
    def validate_image(self, value):
        if value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError("La taille de l'image ne doit pas dépasser 5MB")
        return value
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return 'assets/default-car.jpg'
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

class ReservationSerializer(serializers.ModelSerializer):
    client_first_name = serializers.CharField(source='client.first_name', read_only=True)
    client_last_name = serializers.CharField(source='client.last_name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    vehicle_marque = serializers.CharField(source='vehicle.marque', read_only=True)
    vehicle_modele = serializers.CharField(source='vehicle.modele', read_only=True)
    vehicle_prix = serializers.DecimalField(source='vehicle.prix', max_digits=10, decimal_places=2, read_only=True)
    vehicle_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = ['id', 'vehicle', 'client', 'date_debut', 'date_fin', 'telephone', 
                 'is_confirmed', 'created_at', 'client_first_name', 'client_last_name',
                 'client_email', 'vehicle_marque', 'vehicle_modele', 'vehicle_prix',
                 'vehicle_image_url']
        read_only_fields = ['client', 'is_confirmed', 'created_at']

    def get_vehicle_image_url(self, obj):
        if obj.vehicle.image:
            return self.context['request'].build_absolute_uri(obj.vehicle.image.url)
        return None

class VehiculeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicule
        fields = ['id', 'nom', 'marque', 'modele', 'matricule', 'moteur', 'puissance', 'prix', 'zone', 'image']