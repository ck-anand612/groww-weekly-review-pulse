"""Minimal reproduction for concurrent lock hang."""
import pytest
from pathlib import Path

from pulse.audit.lock import RunLock, LockError


@pytest.mark.asyncio
async def test_lock_direct(tmp_path: Path):
    """Direct lock acquire collision — no run_pipeline."""
    run_dir = tmp_path / "groww" / "2026-W23"
    run_dir.mkdir(parents=True)
    lock = RunLock(run_dir)
    lock.acquire()
    try:
        lock2 = RunLock(run_dir)
        with pytest.raises(LockError):
            lock2.acquire()
    finally:
        lock.release()
