

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

Go to (this README)[https://github.com/Draco1js/assignment-to-pdf] and copy the script, run with \`python3 script.py\`, enjoy!

LICENSE ISC © 2025 Draco1js
`;