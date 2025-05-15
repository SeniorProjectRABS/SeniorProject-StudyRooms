from rest_framework import permissions

class NoUpdateDelete(permissions.BasePermission):
    """
    Custom permission to deny update and delete operations.
    """
    def has_permission(self, request, view):
        # Allow POST (create)
        if request.method in ['GET', 'POST', 'HEAD', 'OPTIONS']:
            return True
        # Deny PUT, PATCH, DELETE
        return False

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS: 
            return True
        return False
