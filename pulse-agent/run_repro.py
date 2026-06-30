"""Run the repro test via subprocess to capture output."""
import subprocess, sys

python = r"c:\Users\Chitra's PC\Desktop\NEXT LEAP PM\AI PROJECTS\AI AGENT\.venv\Scripts\python.exe"
workdir = r"c:\Users\Chitra's PC\Desktop\NEXT LEAP PM\AI PROJECTS\AI AGENT\pulse-agent"

result = subprocess.run(
    [python, "-m", "pytest", "tests/test_repro.py", "-v", "-s"],
    cwd=workdir,
    capture_output=True,
    text=True,
    timeout=15,
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("RC:", result.returncode)
