from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Assignment  # Import your custom User model and Assignment model

# Extend the UserAdmin class to include custom fields
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('branch', 'enrollment_no', 'rolenames')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('branch', 'enrollment_no', 'rolenames')}),
    )

    # Display these fields in the list view
    list_display = ['username', 'email', 'branch', 'enrollment_no', 'is_staff', 'display_rolenames']
    list_filter = ['is_staff', 'is_active']  # Add filters for staff and active status
    search_fields = ['username', 'email', 'branch', 'enrollment_no']  # Add search functionality for multiple fields

    # Custom method to display 'rolenames' as a comma-separated string
    def display_rolenames(self, obj):
        return ", ".join(obj.rolenames)

    display_rolenames.short_description = 'Roles'


# Register the custom User model
admin.site.register(User, CustomUserAdmin)


# Register the Assignment model with custom admin options
@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'deadline', 'created_at', 'formatted_reviewees']
    search_fields = ['title', 'creator__username']  # Add search functionality for title and creator
    list_filter = ['creator', 'deadline']  # Add filters for creator and deadline
    ordering = ['deadline']  # Order assignments by deadline

    # Custom method to display reviewees as usernames in a comma-separated string
    def formatted_reviewees(self, obj):
        return ", ".join([reviewee.username for reviewee in obj.reviewees.all()])

    formatted_reviewees.short_description = 'Reviewees'  # Set a custom column name


# Optional: Display assignments inline in the User admin panel
class AssignmentInline(admin.TabularInline):
    model = Assignment.reviewees.through  # Use the through model for many-to-many inline
    extra = 1  # Number of empty assignment fields to show


# CustomUserAdminWithAssignments to include Assignment inline
class CustomUserAdminWithAssignments(CustomUserAdmin):
    inlines = [AssignmentInline]  # Add inline assignments to user view


# Re-register the custom User model with inline assignments
admin.site.unregister(User)  # Unregister the previous UserAdmin
admin.site.register(User, CustomUserAdminWithAssignments)  # Register the new UserAdmin with inline assignments
