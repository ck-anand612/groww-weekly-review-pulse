"""Run test files one by one."""
import subprocess, sys

python = r"c:\Users\Chitra's PC\Desktop\NEXT LEAP PM\AI PROJECTS\AI AGENT\.venv\Scripts\python.exe"
workdir = r"c:\Users\Chitra's PC\Desktop\NEXT LEAP PM\AI PROJECTS\AI AGENT\pulse-agent"

test_files = [
    "tests/test_analysis.py",
    "tests/test_analysis_integration.py",
    "tests/test_config.py",
    "tests/test_delivery.py",
    "tests/test_delivery_integration.py",
    "tests/test_ingest.py",
    "tests/test_ledger.py",
    "tests/test_orchestrator.py",
    "tests/test_render.py",
    "tests/test_summarize.py",
    "tests/test_summarize_integration.py",
]

for test_file in test_files:
    print(f"\n{'='*60}")
    print(f"Running: {test_file}")
    print('='*60)
    try:
        result = subprocess.run(
            [python, "-m", "pytest", test_file, "-v", "--tb=short"],
            cwd=workdir,
            capture_output=True,
            text=True,
            timeout=30,
        )
        # Print last 10 lines of output
        lines = result.stdout.strip().split('\n')
        for line in lines[-10:]:
            print(line)
        if result.returncode != 0:
            print(f"FAILED (RC={result.returncode})")
    except subprocess.TimeoutExpired:
        print(f"HUNG: {test_file} timed out after 30s")
