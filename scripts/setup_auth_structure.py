#!/usr/bin/env python
"""
Auth Structure Setup Script

This script creates the recommended folder structure for the authentication system
and moves the existing files to their appropriate locations.

Location: scripts/setup_auth_structure.py
"""

import os
import shutil
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("setup_auth_structure")

# Define the root directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Define the target directory structure
DIRECTORY_STRUCTURE = {
    "backend": {
        "auth": {},
        "api": {
            "v1": {}
        },
        "scripts": {},
        "tests": {}
    }
}

# Define file mappings (source -> destination)
FILE_MAPPINGS = {
    # Auth adapter and related files
    "backendv1/adapters/auth_adapter.py": "backend/auth/auth_adapter.py",
    "backendv1/auth/token_utils.py": "backend/auth/token_utils.py",
    "backendv1/auth/role_guard.py": "backend/auth/role_guard.py",
    "backendv1/utils/user_profile_manager.py": "backend/auth/user_profile_manager.py",
    
    # API endpoints
    "backendv1/endpoints/auth.py": "backend/api/auth_endpoints.py",
    "backendv1/endpoints/v1/health.py": "backend/api/v1/health.py",
    
    # Scripts
    "scripts/create_test_profile.py": "backend/scripts/create_test_profile.py",
    "scripts/token_issuer.py": "backend/scripts/token_issuer.py",
    "backendv1/utils/jwt_debug.py": "backend/scripts/jwt_debug.py",
    
    # Tests
    "test_jwt_validation.py": "backend/tests/test_jwt_validation.py",
    "test_direct_auth.py": "backend/tests/test_direct_auth.py",
    "test_authenticated_profile.py": "backend/tests/test_authenticated_profile.py",
    
    # Documentation
    "backendv1/README_AUTH.md": "backend/auth/README.md",
    "AUTH_SOLUTION.md": "backend/README.md"
}


def create_directory_structure(base_dir, structure, current_path=""):
    """Create directory structure recursively"""
    for name, sub_structure in structure.items():
        path = os.path.join(current_path, name)
        full_path = os.path.join(base_dir, path)
        
        if not os.path.exists(full_path):
            os.makedirs(full_path)
            logger.info(f"Created directory: {full_path}")
            
        if sub_structure:
            create_directory_structure(base_dir, sub_structure, path)


def copy_files(base_dir, mappings):
    """Copy files according to mappings"""
    for source, destination in mappings.items():
        source_path = os.path.join(base_dir, source)
        dest_path = os.path.join(base_dir, destination)
        
        # Skip if source doesn't exist
        if not os.path.exists(source_path):
            logger.warning(f"Source file not found: {source_path}")
            continue
            
        # Create destination directory if it doesn't exist
        dest_dir = os.path.dirname(dest_path)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
            
        # Copy the file
        try:
            shutil.copy2(source_path, dest_path)
            logger.info(f"Copied: {source} -> {destination}")
        except Exception as e:
            logger.error(f"Error copying {source}: {e}")


def main():
    """Main function"""
    logger.info("Starting auth structure setup")
    
    # Create directory structure
    create_directory_structure(ROOT_DIR, DIRECTORY_STRUCTURE)
    
    # Copy files
    copy_files(ROOT_DIR, FILE_MAPPINGS)
    
    logger.info("Auth structure setup completed")
    
    # Print summary
    print("\n===== AUTH STRUCTURE SETUP COMPLETED =====")
    print(f"The recommended folder structure has been created at: {os.path.join(ROOT_DIR, 'backend')}")
    print("\nKey components:")
    print("- Auth adapter: backend/auth/auth_adapter.py")
    print("- Token utilities: backend/auth/token_utils.py")
    print("- Role guard: backend/auth/role_guard.py")
    print("- User profile manager: backend/auth/user_profile_manager.py")
    print("- Auth endpoints: backend/api/auth_endpoints.py")
    print("\nUtility scripts:")
    print("- Create test profile: backend/scripts/create_test_profile.py")
    print("- Token issuer: backend/scripts/token_issuer.py")
    print("- JWT debug: backend/scripts/jwt_debug.py")
    print("\nTests:")
    print("- JWT validation: backend/tests/test_jwt_validation.py")
    print("- Direct auth: backend/tests/test_direct_auth.py")
    print("- Authenticated profile: backend/tests/test_authenticated_profile.py")
    print("\nDocumentation:")
    print("- Auth README: backend/auth/README.md")
    print("- Solution summary: backend/README.md")
    print("===========================================\n")


if __name__ == "__main__":
    main() 