from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView
)
from users.views import RegisterView, LoginView
from locations.views import (
    AgencyReservationsList,
    AnnonceLocationListCreate, 
    AnnonceLocationDetail,
    ConfirmReservation,
    PublicAnnonceList,
    ReservationListCreate,
    ReservationDetail,
    AdminAnnonceList, 
    AdminApproveAnnonce,
    AdminRejectAnnonce

)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Administration Django
    path('admin/', admin.site.urls),
    
    # Authentification
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/agency/reservations/', AgencyReservationsList.as_view(), name='agency-reservations'),
    # Annonces
    path('api/annonces/public/', PublicAnnonceList.as_view(), name='public-annonce-list'),
    path('api/annonces/', AnnonceLocationListCreate.as_view(), name='annonce-list'),
    path('api/annonces/<int:pk>/', AnnonceLocationDetail.as_view(), name='annonce-detail'),
    # URLs admin
    path('api/admin/annonces/', AdminAnnonceList.as_view(), name='admin-annonce-list'),
    path('api/admin/annonces/<int:pk>/approve/', AdminApproveAnnonce.as_view(), name='admin-approve-annonce'),
    path('api/admin/annonces/<int:pk>/reject/', AdminRejectAnnonce.as_view(), name='admin-reject-annonce'),
    # Réservations (nouvelles URLs)
    path('api/reservations/', ReservationListCreate.as_view(), name='reservation-list'),
    path('api/reservations/<int:pk>/', ReservationDetail.as_view(), name='reservation-detail'),
    path('api/reservations/<int:pk>/confirm/', ConfirmReservation.as_view(), name='confirm-reservation'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)