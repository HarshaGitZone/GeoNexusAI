# Production-ready fixes for Render deployment
import os
import sys
import gc
import logging

# Configure logging for production
logging.basicConfig(level=logging.WARNING)  # Reduce logging in production
logger = logging.getLogger(__name__)

# Check if we're in production (Render) vs local development
IS_PRODUCTION = (
    os.getenv("RENDER", "false").lower() == "true" or  # Render deployment
    os.getenv("PYTHONPATH", "").find("/app") != -1 or   # Render Python path
    os.getcwd().startswith("/app") or                   # Render working directory
    os.getenv("ENV") == "production" or                 # Generic production flag
    False
)

# Memory optimization for PyTorch (LOCAL ONLY)
def optimize_pytorch_memory():
    """Optimize PyTorch for production environment (LOCAL ONLY)"""
    if IS_PRODUCTION:
        logger.info("Skipping PyTorch optimization in production")
        return
        
    try:
        import torch
        # Disable gradient computation for inference
        torch.set_grad_enabled(False)
        # Enable memory efficient attention if available
        if hasattr(torch, 'cuda') and torch.cuda.is_available():
            torch.cuda.empty_cache()
        logger.info("PyTorch memory optimization applied")
    except ImportError:
        logger.warning("PyTorch not available for optimization")

# Add retry logic for external API calls
def with_retry(func, max_retries=3, backoff_factor=1.0):
    """Decorator to add retry logic to functions"""
    def wrapper(*args, **kwargs):
        import time
        last_exception = None
        
        for attempt in range(max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                if attempt < max_retries - 1:
                    wait_time = backoff_factor * (2 ** attempt)
                    logger.warning(f"Attempt {attempt + 1} failed, retrying in {wait_time}s: {e}")
                    time.sleep(wait_time)
                else:
                    logger.error(f"All {max_retries} attempts failed: {e}")
        
        raise last_exception
    
    return wrapper

# Global error handler for production
def handle_production_error(e, context="Unknown"):
    """Centralized error handling for production"""
    error_msg = f"Error in {context}: {str(e)}"
    logger.error(error_msg)
    
    # Check for common production issues
    if "timeout" in str(e).lower():
        return {"error": "Request timeout", "details": "External services are slow, please try again"}
    elif "memory" in str(e).lower():
        return {"error": "Memory limit exceeded", "details": "Server resources temporarily unavailable"}
    elif "connection" in str(e).lower():
        return {"error": "Connection failed", "details": "External services unavailable"}
    else:
        return {
            "error": "Internal server error",
            "details": "An unexpected error occurred",
            "context": context,
            "type": e.__class__.__name__
        }

# Apply optimizations on import (LOCAL ONLY for PyTorch)
if not IS_PRODUCTION:
    optimize_pytorch_memory()
gc.collect()  # Force garbage collection
