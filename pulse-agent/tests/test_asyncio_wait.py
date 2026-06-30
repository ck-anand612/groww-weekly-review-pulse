"""Test asyncio.wait_for in pytest-asyncio."""
import pytest
import asyncio


@pytest.mark.asyncio
async def test_wait_for_timeout():
    """Test that asyncio.wait_for timeout works."""
    async def hang_forever():
        await asyncio.sleep(100)
    
    raised = False
    try:
        await asyncio.wait_for(hang_forever(), timeout=0.1)
    except asyncio.TimeoutError:
        raised = True
    assert raised, "TimeoutError not raised"


@pytest.mark.asyncio
async def test_wait_for_exception():
    """Test that asyncio.wait_for propagates exceptions."""
    async def raise_error():
        raise ValueError("test error")
    
    raised = False
    try:
        await asyncio.wait_for(raise_error(), timeout=1.0)
    except ValueError:
        raised = True
    assert raised, "ValueError not raised"
