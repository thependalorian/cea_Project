"""
Input Validation and Sanitization Utilities

Following rule #15: Include comprehensive error handling for data validation
Following rule #17: Secure database access with validated inputs

This module provides input validation and data sanitization functions.
Location: backendv1/utils/validation.py
"""

import re
from typing import Any, Dict, List, Optional, Union
from datetime import datetime

from backendv1.logger import setup_logger

logger = setup_logger("validation")


def validate_input(
    data: Any,
    validation_type: str,
    required: bool = True,
    max_length: Optional[int] = None,
    min_length: Optional[int] = None,
) -> bool:
    """
    Validate input data based on type and constraints

    Args:
        data: Data to validate
        validation_type: Type of validation to perform
        required: Whether the field is required
        max_length: Maximum allowed length
        min_length: Minimum required length

    Returns:
        bool: True if valid, False otherwise
    """
    try:
        # Check required fields
        if required and (data is None or data == ""):
            return False

        # Skip validation for optional empty fields
        if not required and (data is None or data == ""):
            return True

        # Type-specific validation
        if validation_type == "email":
            return validate_email(str(data))
        elif validation_type == "user_id":
            return validate_user_id(str(data))
        elif validation_type == "conversation_id":
            return validate_conversation_id(str(data))
        elif validation_type == "message_content":
            return validate_message_content(str(data), max_length, min_length)
        elif validation_type == "phone":
            return validate_phone(str(data))
        elif validation_type == "url":
            return validate_url(str(data))
        elif validation_type == "filename":
            return validate_filename(str(data))
        else:
            logger.warning(f"Unknown validation type: {validation_type}")
            return False

    except Exception as e:
        logger.error(f"Validation error: {e}")
        return False


def validate_email(email: str) -> bool:
    """Validate email address format"""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_user_id(user_id: str) -> bool:
    """Validate user ID format"""
    # Allow alphanumeric, hyphens, underscores
    pattern = r"^[a-zA-Z0-9_-]{1,50}$"
    return bool(re.match(pattern, user_id))


def validate_conversation_id(conversation_id: str) -> bool:
    """Validate conversation ID format"""
    # Similar to user_id but may include more characters
    pattern = r"^[a-zA-Z0-9_-]{1,100}$"
    return bool(re.match(pattern, conversation_id))


def validate_message_content(
    content: str, max_length: Optional[int] = 10000, min_length: Optional[int] = 1
) -> bool:
    """Validate message content"""
    if min_length and len(content) < min_length:
        return False
    if max_length and len(content) > max_length:
        return False
    return True


def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Basic phone validation - can be enhanced
    pattern = r"^[\+]?[1-9][\d]{0,15}$"
    return bool(re.match(pattern, re.sub(r"[^\d+]", "", phone)))


def validate_url(url: str) -> bool:
    """Validate URL format"""
    pattern = r"^https?://[^\s/$.?#].[^\s]*$"
    return bool(re.match(pattern, url))


def validate_filename(filename: str) -> bool:
    """Validate filename for security"""
    # Prevent path traversal and dangerous characters
    dangerous_chars = ["..", "/", "\\", "<", ">", ":", '"', "|", "?", "*"]
    return not any(char in filename for char in dangerous_chars)


def sanitize_data(data: Union[str, Dict, List]) -> Union[str, Dict, List]:
    """
    Sanitize data for safe processing

    Args:
        data: Data to sanitize

    Returns:
        Sanitized data
    """
    try:
        if isinstance(data, str):
            return sanitize_string(data)
        elif isinstance(data, dict):
            return {key: sanitize_data(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [sanitize_data(item) for item in data]
        else:
            return data

    except Exception as e:
        logger.error(f"Sanitization error: {e}")
        return data


def sanitize_string(text: str) -> str:
    """Sanitize string input"""
    if not isinstance(text, str):
        return str(text)

    # Remove potentially dangerous HTML/script tags
    text = re.sub(r"<script.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<.*?>", "", text)

    # Limit length
    if len(text) > 50000:
        text = text[:50000]

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def validate_chat_message(message_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate chat message data structure

    Args:
        message_data: Chat message dictionary

    Returns:
        Dict with validation results
    """
    errors = []

    # Required fields
    required_fields = ["content", "user_id", "conversation_id"]
    for field in required_fields:
        if field not in message_data:
            errors.append(f"Missing required field: {field}")

    # Validate specific fields
    if "content" in message_data:
        if not validate_input(message_data["content"], "message_content"):
            errors.append("Invalid message content")

    if "user_id" in message_data:
        if not validate_input(message_data["user_id"], "user_id"):
            errors.append("Invalid user ID format")

    if "conversation_id" in message_data:
        if not validate_input(message_data["conversation_id"], "conversation_id"):
            errors.append("Invalid conversation ID format")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "sanitized_data": sanitize_data(message_data) if len(errors) == 0 else None,
    }


# Export main functions
__all__ = [
    "validate_input",
    "sanitize_data",
    "validate_email",
    "validate_user_id",
    "validate_conversation_id",
    "validate_message_content",
    "validate_chat_message",
    "sanitize_string",
]
