# md2pdf + Assignment compiler for C++

Original md2pdf project by: https://github.com/realdennis/md2pdf/


## Automatic C/C++ Homework Documentation


This tool is perfect for creating beautiful PDFs of your programming homework! Here's a helpful script that automatically:

1. Compiles all your C/C++ files
2. Runs each executable (with user input when needed)
3. Creates a markdown file with code and output for each question
4. Ready to paste into md2pdf for a proper PDF!

### How to use the script:

1. Make sure your homework files follow this naming convention:
	- Single file questions: `q1.cpp`, `q2.cpp`, etc.
	- Multi-file questions:
```
	 ├── q1.cpp
	 ├── q2.cpp
	 ├── q3.cpp
	 ├── q4.cpp
	 ├── q5
	 │   ├── HelperFile.cpp
	 │   ├── HelperFile.h
	 │   └── q5.cpp
```

2. Copy the script below to a file named `script.py` in the root folder of your homework
3. Make sure to change the `DOCUMENTATION_TITLE`, `CONSOLE_PREFIX` and `DOCUMENTATION_FILENAME` variables
3. Run it: `python3 script.py`
4. Copy the content of the generated markdown file
5. Paste it into this site and generate your PDF!

### Requirements:
- g++ must be installed
- Python3 must be installed
- Script works on Linux/Unix-based operating systems (not yet tested on Windows)
- If you find issues on Windows, please make a pull request!



### Example Output: (The script is below this)
![](https://github.com/Draco1js/assignment-to-pdf/blob/main/Example.png?raw=true)


### The Script:
```python
#!/usr/bin/env python3
"""
Homework Helper Script

This script compiles all C/C++ files (named q*.c or q*.cpp) in the current directory,
runs them, and generates a Markdown documentation file with the source code and outputs.

Usage:
  python3 script.py [OPTIONS]

Options:
  -NUM STRING      Provide stdin input for a specific question. 
                   Example: -5 "6" (Feeds '6' into Question 5's standard input)
                   Example: -1 "Hello World\nMulti-line" 
  --aNUM STRING    Provide command-line arguments for a specific question.
                   Example: --a7 "add 5 3 multiply 6 7" (Runs ./q7_exec add 5 3 multiply 6 7)
"""

import os
import subprocess
import re
import glob
import sys
import shlex

# Global configuration variables
DOCUMENTATION_TITLE = "Lab Tasks"
CONSOLE_PREFIX = "~/Desktop/Lab/"
DOCUMENTATION_FILENAME = "Lab_Tasks.md"

## Markdown settings
SEPARATOR_LENGTH = 40
SEPARATOR_CHAR = "-"


def parse_arguments():
    """Parse command line arguments for predefined inputs and args."""
    inputs = {}
    cli_args = {}
    
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        
        # Match -NUM for stdin (e.g., -5 "6\n")
        match_in = re.match(r'^-(\d+)$', arg)
        if match_in:
            q_num = int(match_in.group(1))
            if i + 1 < len(sys.argv):
                # Ensure input ends with newline so scanf/cin doesn't hang
                val = sys.argv[i+1]
                if not val.endswith('\n'):
                    val += '\n'
                inputs[q_num] = val
                i += 2
                continue
                
        # Match --aNUM for args (e.g., --a7 "add 5 3")
        match_args = re.match(r'^--a(\d+)$', arg)
        if match_args:
            q_num = int(match_args.group(1))
            if i + 1 < len(sys.argv):
                cli_args[q_num] = shlex.split(sys.argv[i+1])
                i += 2
                continue
                
        # Help text
        if arg in ('-h', '--help'):
            print(__doc__)
            sys.exit(0)
            
        i += 1
        
    return inputs, cli_args

def extract_question_number(filename):
    """Extract question number from filename."""
    match = re.search(r'q(\d+)', os.path.basename(filename))
    if match:
        return int(match.group(1))
    return 0

def read_file_content(file_path):
    """Read and return the content of a file."""
    try:
        with open(file_path, 'r') as file:
            return file.read()
    except Exception as e:
        return f"Error reading file: {e}"

def run_executable(executable, q_num, predefined_input=None, custom_args=None):
    """Run executable and capture output."""
    print(f"\nRunning {executable}:")
    print(SEPARATOR_CHAR * SEPARATOR_LENGTH)
    
    args = custom_args if custom_args else []
    cmd = [f"./{executable}"] + args
    if os.name == 'nt':
        cmd = [executable] + args
        
    all_output = []
    cmd_str = " ".join(cmd)
    all_output.append(f"{CONSOLE_PREFIX} {cmd_str}")
    
    try:
        if predefined_input is not None:
            # Auto-feed predefined input
            all_output.append(f"[Auto-fed input]: {predefined_input.strip()}")
            process = subprocess.run(
                cmd,
                input=predefined_input,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                timeout=30
            )
            if process.stdout:
                print(process.stdout.strip())
                all_output.append(process.stdout.strip())
        else:
            # Interactive mode (inherits stdin, captures stdout line by line)
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
            
            for line in iter(process.stdout.readline, ''):
                print(line, end='', flush=True)
                all_output.append(line.rstrip('\n'))
                
            process.wait(timeout=30)
            
        print(SEPARATOR_CHAR * SEPARATOR_LENGTH)
        return '\n'.join(all_output)
        
    except subprocess.TimeoutExpired as e:
        error_msg = f"Timeout expired after {e.timeout}s"
        print(error_msg)
        all_output.append(error_msg)
        return '\n'.join(all_output)
    except Exception as e:
        error_msg = f"Error running {executable}: {e}"
        print(error_msg)
        all_output.append(error_msg)
        return '\n'.join(all_output)

def compile_and_run(inputs, cli_args):
    """Compile and run all C/C++ files, return results dictionary."""
    results = {}
    
    # Find all C/C++ files
    cpp_files = glob.glob("q*.cpp") + glob.glob("*/q*.cpp")
    c_files = glob.glob("q*.c") + glob.glob("*/q*.c")
    all_files = cpp_files + c_files
    
    # Sort files by question number
    all_files.sort(key=extract_question_number)
    
    for file_path in all_files:
        q_num = extract_question_number(file_path)
        if q_num == 0:
            continue
            
        print(f"\nProcessing Question {q_num}...")
        
        # Determine if it's a directory-based question
        is_dir_question = '/' in file_path
        dir_name = os.path.dirname(file_path) if is_dir_question else None
        
        # Get all related files for this question
        related_files = {}
        if is_dir_question and dir_name:
            for related_file in glob.glob(f"{dir_name}/*"):
                if os.path.isfile(related_file) and not related_file.endswith(('.o', '.exe')):
                    related_files[os.path.basename(related_file)] = read_file_content(related_file)
        else:
            related_files[os.path.basename(file_path)] = read_file_content(file_path)
        
        # Compile the code
        executable = f"q{q_num}_exec"
        compile_cmd = []
        
        if is_dir_question:
            source_files = glob.glob(f"{dir_name}/*.cpp") + glob.glob(f"{dir_name}/*.c")
            if file_path.endswith('.cpp'):
                compile_cmd = ["g++"] + source_files + ["-o", executable]
            else:
                compile_cmd = ["gcc"] + source_files + ["-o", executable]
        else:
            if file_path.endswith('.cpp'):
                compile_cmd = ["g++", file_path, "-o", executable]
            else:
                compile_cmd = ["gcc", file_path, "-o", executable]
        
        compile_output = ""
        try:
            print(f"Compiling with command: {' '.join(compile_cmd)}")
            compile_output = subprocess.check_output(compile_cmd, stderr=subprocess.STDOUT, universal_newlines=True)
        except subprocess.CalledProcessError as e:
            compile_output = e.output
            print(f"Compilation error for Question {q_num}: {compile_output}")
            results[q_num] = {
                'files': related_files,
                'compile_output': compile_output,
                'run_output': "Compilation failed, no execution output."
            }
            continue
        
        # Run the executable with dynamic inputs/args
        q_in = inputs.get(q_num)
        q_args = cli_args.get(q_num)
        run_output = run_executable(executable, q_num, predefined_input=q_in, custom_args=q_args)
        
        # Store results
        results[q_num] = {
            'files': related_files,
            'compile_output': compile_output,
            'run_output': run_output
        }
        
        # Clean up executable
        try:
            os.remove(executable)
        except:
            pass
    
    return results

def generate_documentation(results):
    """Generate documentation file with code and output."""
    with open(DOCUMENTATION_FILENAME, 'w') as doc_file:
        doc_file.write(f"# {DOCUMENTATION_TITLE}\n\n")
        
        for q_num in sorted(results.keys()):
            doc_file.write(f"## Question {q_num}\n\n")
            
            # Write code for each file
            doc_file.write("### Code\n\n")
            for filename, content in results[q_num]['files'].items():
                doc_file.write(f"**File: {filename}**\n\n")
                lang = "cpp" if filename.endswith(".cpp") else "c"
                doc_file.write(f"```{lang}\n")
                doc_file.write(content.strip())
                doc_file.write("\n```\n\n")
            
            # Write compilation output if there was any
            if results[q_num]['compile_output'].strip():
                doc_file.write("### Compilation Output\n\n")
                doc_file.write("```bash\n")
                doc_file.write(results[q_num]['compile_output'].strip())
                doc_file.write("\n```\n\n")
            
            # Write execution output
            doc_file.write("### Execution Output\n\n")
            doc_file.write("```bash\n")
            doc_file.write(results[q_num]['run_output'].strip())
            doc_file.write("\n```\n\n")
            
            doc_file.write("---\n\n")
    
    print(f"\nDocumentation generated: {DOCUMENTATION_FILENAME}")
    print(f"To convert to PDF: Copy the contents of {DOCUMENTATION_FILENAME} and paste at \n\nhttps://assignment-to-pdf.dracodev.me/\n\n")

def main():
    inputs, cli_args = parse_arguments()
    print("Starting Homework Helper...")
    results = compile_and_run(inputs, cli_args)
    generate_documentation(results)
    print("Done!")

if __name__ == "__main__":
    main()
```

LICENSE ISC © 2025 Draco1js
