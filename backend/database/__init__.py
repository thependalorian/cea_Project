"""
Database connections and adapters for the Climate Economy Assistant.
"""

from .supabase_client import supabase
from .redis_client import redis_client
from .redis_adapter import RedisAdapter, redis_adapter

__all__ = ["supabase", "redis_client", "RedisAdapter", "redis_adapter"]
