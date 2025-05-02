from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8,
        error_messages={
            'min_length': _('Le mot de passe doit contenir au moins 8 caractères.')
        }
    )
    
    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'user_type', 'date_of_birth', 'agency_name', 'agency_address')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'user_type': {'required': True},
            'agency_name': {'required': False},
            'agency_address': {'required': False}
        }
    
    def validate(self, data):
        if data.get('user_type') == 'Agence':
            if not data.get('agency_name'):
                raise serializers.ValidationError({
                    'agency_name': _("Le nom de l'agence est requis pour les comptes Agence")
                })
            if not data.get('agency_address'):
                raise serializers.ValidationError({
                    'agency_address': _("L'adresse de l'agence est requise pour les comptes Agence")
                })
        return data
    
    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                email=validated_data['email'],
                username=validated_data['email'],  # Utilise email comme username
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                user_type=validated_data['user_type'],
                date_of_birth=validated_data.get('date_of_birth'),
                agency_name=validated_data.get('agency_name'),
                agency_address=validated_data.get('agency_address')
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(
            email=email,
            password=password
        )
        
        if not user:
            raise serializers.ValidationError(
                _('Impossible de se connecter avec les identifiants fournis.')
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                _("Ce compte utilisateur est désactivé.")
            )

        refresh = RefreshToken.for_user(user)
        
        return {
            'user_id': user.id,
            'email': user.email,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_type': user.user_type,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'agency_name': user.agency_name,
            'agency_address': user.agency_address
        }