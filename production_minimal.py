# Minimal production optimizations for Render deployment
import os
import gc
import logging

# Configure logging for production
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# Check if we're in production
IS_PRODUCTION = os.getenv("RENDER", "false").lower() == "true"

def optimize_pytorch_memory():
    """PyTorch optimization - SKIPPED in production"""
    if IS_PRODUCTION:
        logger.info("Skipping PyTorch optimization in production")
        return
    
    try:
        import torch
        torch.set_grad_enabled(False)
        if hasattr(torch, 'cuda') and torch.cuda.is_available():
            torch.cuda.empty_cache()
        logger.info("PyTorch memory optimization applied")
    except ImportError:
        logger.warning("PyTorch not available for optimization")

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

def handle_production_error(e, context="Unknown"):
    """Centralized error handling for production"""
    error_msg = f"Error in {context}: {str(e)}"
    logger.error(error_msg)
    
    if "timeout" in str(e).lower():
        return {"error": "Request timeout", "details": "External services are slow, please try again"}
    elif "memory" in str(e).lower():
        return {"error": "Memory limit exceeded", "details": "Server resources temporarily unavailable"}
    elif "connection" in str(e).lower():
        return {"error": "Connection failed", "details": "External services unavailable"}
    else:
        return {"error": "Internal server error", "details": "An unexpected error occurred"}

# Apply optimizations (only PyTorch is conditional)
if not IS_PRODUCTION:
    optimize_pytorch_memory()
gc.collect()
