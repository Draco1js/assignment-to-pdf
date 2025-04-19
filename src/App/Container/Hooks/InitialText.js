

export const initialText = `# md2pdf + Assignment compiler for C++

Original md2pdf project by: https://github.com/realdennis/md2pdf/


## Automatic C++ Homework Documentation


This tool is perfect for creating beautiful PDFs of your programming homework! Here's a helpful script that automatically:

1. Compiles all your C++ files
2. Runs each executable (with user input when needed)
3. Creates a markdown file with code and output for each question
4. Ready to paste into md2pdf for a proper PDF!

### How to use the script:

1. Make sure your homework files follow this naming convention:
	- Single file questions: \`q1.cpp\`, \`q2.cpp\`, etc.
	- Multi-file questions:
	 \`\`\`
	 ├── q1.cpp
	 ├── q2.cpp
	 ├── q3.cpp
	 ├── q4.cpp
	 ├── q5
	 │   ├── HelperFile.cpp
	 │   ├── HelperFile.h
	 │   └── q5.cpp
	 \`\`\`

2. Copy the script below to a file named \`script.py\` in the root folder of your homework
3. Make sure to change the \`DOCUMENTATION_TITLE\`, \`CONSOLE_PREFIX\` and \`DOCUMENTATION_FILENAME\` variables
3. Run it: \`python3 script.py\`
4. Copy the content of the generated markdown file
5. Paste it into this site and generate your PDF!

### Requirements:
- g++ must be installed
- Python3 must be installed
- Script works on Linux/Unix-based operating systems (not yet tested on Windows)
- If you find issues on Windows, please make a pull request!



### Example Output: (Script is below this)
![](https://github.com/Draco1js/assignment-to-pdf/blob/main/Example.png?raw=true)


### The Script:
\`\`\`python

#!/usr/bin/env python3
"""
Homework Helper Script
- Compiles all C++ files in the current directory
- Runs each executable (with user input if needed)
- Creates a documentation file with code and output for each question
"""

import os
import subprocess
import re
import glob
import sys
import shlex
import time
import fcntl
import msvcrt
import queue
import threading



# Global configuration variables
DOCUMENTATION_TITLE = "24K-2015 Lab 9"
CONSOLE_PREFIX = "aayan@Macbook-Air:"
DOCUMENTATION_FILENAME = "24K-2015_Lab_9_Tasks.md"



# Markdown settings
SEPARATOR_LENGTH = 40
SEPARATOR_CHAR = "-"

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

def run_executable(executable):
	"""Run executable and capture output."""
	print(f"\\nRunning {executable}:")
	print(SEPARATOR_CHAR * SEPARATOR_LENGTH)
	
	# Run the program and capture its output
	try:
		# Buffer for storing all output
		all_output = []
		all_output.append(f"{CONSOLE_PREFIX} ./{executable}")
		
		# Platform-specific executable path
		exec_path = f"./{executable}"
		if os.name == 'nt':  # Windows
			exec_path = executable  # No ./ prefix needed on Windows
		
		# Start the process
		process = subprocess.Popen(
			exec_path,
			shell=True,
			stdout=subprocess.PIPE,
			stderr=subprocess.PIPE,
			stdin=subprocess.PIPE,
			text=True,
			bufsize=1
		)
		
		# Set up platform-specific I/O handling
		if os.name != 'nt':  # Unix/Linux/Mac
			# Set up non-blocking I/O using fcntl
			
			# Set stdout to non-blocking
			flags = fcntl.fcntl(process.stdout, fcntl.F_GETFL)
			fcntl.fcntl(process.stdout, fcntl.F_SETFL, flags | os.O_NONBLOCK)
			
			# Set stderr to non-blocking
			flags = fcntl.fcntl(process.stderr, fcntl.F_GETFL)
			fcntl.fcntl(process.stderr, fcntl.F_SETFL, flags | os.O_NONBLOCK)
			
			# Process interaction loop for Unix systems
			max_idle_time = 1.0  # seconds to wait before prompting for input
			last_output_time = time.time()
			
			while process.poll() is None:  # While process is running
				# Try to read from stdout
				try:
					output = process.stdout.readline()
					if output:
						print(output.strip())
						all_output.append(output.strip())
						last_output_time = time.time()
						continue
				except (IOError, BlockingIOError):
					pass
					
				# Try to read from stderr
				try:
					error = process.stderr.readline()
					if error:
						print(error.strip())
						all_output.append(error.strip())
						last_output_time = time.time()
						continue
				except (IOError, BlockingIOError):
					pass
					
				# If no output for a while, assume waiting for input
				if time.time() - last_output_time > max_idle_time:
					user_input = input("")  # Simple prompt like a terminal
					process.stdin.write(user_input + "\\n")
					process.stdin.flush()
					all_output.append(user_input)
					last_output_time = time.time()
				
				# Small sleep to prevent CPU hogging
				time.sleep(0.1)
		else:
			# Windows-specific interaction loop
			
			# Function to read input in a separate thread
			def input_reader(input_queue):
				while process.poll() is None:
					if msvcrt.kbhit():
						char = msvcrt.getch().decode('utf-8')
						if char == '\\r':  # Enter key
							input_queue.put('\\n')
						else:
							input_queue.put(char)
					time.sleep(0.05)
			
			# Create a queue for input and start the input reader thread
			input_queue = queue.Queue()
			input_thread = threading.Thread(target=input_reader, args=(input_queue,))
			input_thread.daemon = True
			input_thread.start()
			
			# Buffer for collecting user input
			user_input_buffer = ""
			
			# Process interaction loop for Windows
			while process.poll() is None:
				# Check for output
				output = process.stdout.readline()
				if output:
					print(output.strip())
					all_output.append(output.strip())
					continue
				
				error = process.stderr.readline()
				if error:
					print(error.strip())
					all_output.append(error.strip())
					continue
				
				# Check for user input
				try:
					char = input_queue.get_nowait()
					if char == '\\n':  # Enter key pressed
						print()  # New line
						process.stdin.write(user_input_buffer + '\\n')
						process.stdin.flush()
						all_output.append(user_input_buffer)
						user_input_buffer = ""
					else:
						print(char, end='', flush=True)
						user_input_buffer += char
				except queue.Empty:
					pass
				
				# Small sleep to prevent CPU hogging
				time.sleep(0.1)
		
		# Get any remaining output
		remaining_stdout, remaining_stderr = process.communicate()
		if remaining_stdout:
			print(remaining_stdout.strip())
			all_output.append(remaining_stdout.strip())
		if remaining_stderr:
			print(remaining_stderr.strip())
			all_output.append(remaining_stderr.strip())
		
		print(SEPARATOR_CHAR * SEPARATOR_LENGTH)
		
		# Join all output lines into a single string
		full_output = '\\n'.join(all_output)
		return full_output
		
	except Exception as e:
		error_msg = f"Error running {executable}: {e}"
		print(error_msg)
		print(SEPARATOR_CHAR * SEPARATOR_LENGTH)
		return f"Running {executable}:\\n{SEPARATOR_CHAR * SEPARATOR_LENGTH}\\n{error_msg}\\n{SEPARATOR_CHAR * SEPARATOR_LENGTH}"

def compile_and_run():
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
			
		print(f"\\nProcessing Question {q_num}...")
		
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
			# For directory-based questions, compile all .cpp files in the directory
			source_files = glob.glob(f"{dir_name}/*.cpp") + glob.glob(f"{dir_name}/*.c")
			if file_path.endswith('.cpp'):
				compile_cmd = ["g++"] + source_files + ["-o", executable]
			else:
				compile_cmd = ["gcc"] + source_files + ["-o", executable]
		else:
			# For single file questions
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
		
		# Run the executable
		run_output = run_executable(executable)
		
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
		doc_file.write(f"# {DOCUMENTATION_TITLE}\\n\\n")
		
		for q_num in sorted(results.keys()):
			doc_file.write(f"## Question {q_num}\\n\\n")
			
			# Write code for each file
			doc_file.write("### Code\\n\\n")
			for filename, content in results[q_num]['files'].items():
				doc_file.write(f"**File: {filename}**\\n\\n")
				doc_file.write("\`\`\`cpp\\n")
				doc_file.write(content)
				doc_file.write("\\n\`\`\`\\n\\n")
			
			# Write compilation output if there was any
			if results[q_num]['compile_output'].strip():
				doc_file.write("### Compilation Output\\n\\n")
				doc_file.write("\`\`\`bash\\n")
				doc_file.write(results[q_num]['compile_output'])
				doc_file.write("\\n\`\`\`\\n\\n")
			
			# Write execution output
			doc_file.write("### Execution Output\\n\\n")
			doc_file.write("\`\`\`bash\\n")
			doc_file.write(results[q_num]['run_output'])
			doc_file.write("\\n\`\`\`\\n\\n")
			
			doc_file.write("---\\n\\n")
	
	print(f"\\nDocumentation generated: {DOCUMENTATION_FILENAME}")
	print(f"To convert to PDF: Copy the contents of {DOCUMENTATION_FILENAME} and paste at \\n\\nhttps://assignment-to-pdf.dracodev.me/\\n\\n")

def main():
	print("Starting Homework Helper...")
	results = compile_and_run()
	generate_documentation(results)
	print("Done!")

if __name__ == "__main__":
	main()
\`\`\`

LICENSE ISC © 2025 Draco1js
`;