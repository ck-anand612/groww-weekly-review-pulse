"""Test lock with fixed path."""
import pytest
import tempfile
import os
from pathlib import Path

from pulse.audit.lock import RunLock, LockError


@pytest.mark.asyncio
async def test_lock_fixed_path():
    """Test with fixed temp path."""
    tmp = Path(tempfile.mkdtemp())
    run_dir = tmp / "groww" / "2026-W23"
    run_dir.mkdir(parents=True, exist_ok=True)
    
    lock = RunLock(run_dir)
    lock.acquire()
    print(f"Lock acquired, PID={os.getpid()}")
    
    raised = False
    try:
        lock2 = RunLock(run_dir)
        print("About to call lock2.acquire()...")
        lock2.acquire()
    except LockError as e:
        print(f"Got LockError: {e}")
        raised = True
    finally:
        lock.release()
    
    assert raised
    print("Test passed")
