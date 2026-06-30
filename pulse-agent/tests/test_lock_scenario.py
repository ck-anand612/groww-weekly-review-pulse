"""Test the exact lock scenario."""
import pytest
import asyncio
import os
from pathlib import Path

from pulse.audit.lock import RunLock, LockError


@pytest.mark.asyncio
async def test_lock_scenario(tmp_path: Path):
    """Test the exact scenario from the concurrent test."""
    run_dir = tmp_path / "groww" / "2026-W23"
    run_dir.mkdir(parents=True, exist_ok=True)
    
    # Acquire lock
    lock = RunLock(run_dir)
    lock.acquire()
    print(f"Lock acquired, PID={os.getpid()}")
    
    # Try to acquire again (simulating run_pipeline)
    raised = False
    try:
        lock2 = RunLock(run_dir)
        print("About to call lock2.acquire()...")
        lock2.acquire()
        print("ERROR: should have raised")
    except LockError as e:
        print(f"Got LockError: {e}")
        raised = True
    finally:
        lock.release()
    
    assert raised, "LockError not raised"
    print("Test passed")


@pytest.mark.asyncio
async def test_lock_with_wait_for(tmp_path: Path):
    """Test with asyncio.wait_for."""
    run_dir = tmp_path / "groww" / "2026-W23"
    run_dir.mkdir(parents=True, exist_ok=True)
    
    lock = RunLock(run_dir)
    lock.acquire()
    
    async def try_acquire():
        lock2 = RunLock(run_dir)
        lock2.acquire()  # Should raise LockError
    
    raised = False
    try:
        await asyncio.wait_for(try_acquire(), timeout=2.0)
    except LockError:
        raised = True
    except asyncio.TimeoutError:
        pytest.fail("Hung!")
    finally:
        lock.release()
    
    assert raised, "LockError not raised"
