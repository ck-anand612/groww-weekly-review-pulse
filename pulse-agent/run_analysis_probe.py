"""Probe import times and specific test functions."""
import subprocess, sys

python = r"c:\Users\Chitra's PC\Desktop\NEXT LEAP PM\AI PROJECTS\AI AGENT\.venv\Scripts\python.exe"
workdir = r"c:\Users\Chitra's PC\Desktop\NEXT LEAP PM\AI PROJECTS\AI AGENT\pulse-agent"

tests = [
    # Individual tests from hanging classes
    "tests/test_analysis.py::TestStratifiedSample::test_no_sampling_when_under_limit",
    "tests/test_analysis.py::TestReduceDimensions::test_output_shape",
    "tests/test_analysis.py::TestClusterReviews::test_produces_labels",
    # Smallest tests to check import time
    "tests/test_analysis.py::TestBuildTexts::test_empty_reviews",
]

for test in tests:
    print(f"\n{'='*60}")
    print(f"Running: {test}")
    print('='*60)
    try:
        result = subprocess.run(
            [python, "-m", "pytest", test, "-v", "--tb=short", "-s"],
            cwd=workdir,
            capture_output=True,
            text=True,
            timeout=60,
        )
        lines = result.stdout.strip().split('\n')
        for line in lines[-8:]:
            print(line)
        if result.returncode != 0:
            print(f"  ** FAILED (RC={result.returncode})")
    except subprocess.TimeoutExpired:
        print(f"  ** HUNG: timed out after 60s")
