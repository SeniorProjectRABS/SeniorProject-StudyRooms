from rest_framework import permissions

class NoUpdateDelete(permissions.BasePermission):
    """
    Custom permission to deny update and delete operations.
    """
    def has_permission(self, request, view):
        # Allow POST (create)
        if request.method == 'POST' or request.method == 'GET':
            return True
        # Deny PUT, PATCH, DELETE
        return False

    def has_object_permission(self, request, view, obj):
         # Deny for object-level permissions too
        return False
