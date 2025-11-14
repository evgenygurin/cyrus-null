#!/usr/bin/env python3
"""
Markdown Link Checker
Validates all links in markdown files, checking for:
- Broken relative file links
- Broken anchor links to headings
- Invalid references

Usage:
    python3 scripts/check-markdown-links.py
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Set
from urllib.parse import unquote

# Repository root
REPO_ROOT = Path(__file__).parent.parent.absolute()

# Pre-compiled regex patterns for performance
HEADING_PATTERN = re.compile(r'^#+\s+(.+)$', re.MULTILINE)
INLINE_LINK_PATTERN = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
REFERENCE_DEF_PATTERN = re.compile(r'^\[([^\]]+)\]:\s*(.+)$', re.MULTILINE)
REFERENCE_LINK_PATTERN = re.compile(r'\[([^\]]+)\]\[([^\]]+)\]')
TEMPLATE_PATTERNS = [
    re.compile(r'\{\{.*\}\}'),  # {{ variable }}
    re.compile(r'\$\{.*\}'),    # ${variable}
    re.compile(r'^\.\.\.+$'),   # ... (ellipsis placeholder)
]

# Directories to skip
SKIP_DIRS = {
    'node_modules',
    'dist',
    '.git',
    'build',
    'coverage',
    '.next',
    '.turbo'
}

def slugify_heading(heading: str) -> str:
    """Convert a markdown heading to GitHub-style anchor slug."""
    # Remove markdown formatting
    heading = re.sub(r'[*_`]', '', heading)
    # Convert to lowercase
    heading = heading.lower()
    # Replace spaces with hyphens first
    heading = re.sub(r'\s+', '-', heading)
    # Remove special characters except hyphens and unicode letters/numbers
    # This preserves Cyrillic and other unicode characters (re.UNICODE deprecated in Python 3)
    heading = re.sub(r'[^\w-]', '', heading)
    # Remove leading/trailing hyphens
    heading = heading.strip('-')
    return heading

def extract_headings(content: str) -> Set[str]:
    """Extract all headings from markdown content."""
    headings = set()
    for match in HEADING_PATTERN.finditer(content):
        heading_text = match.group(1).strip()
        slug = slugify_heading(heading_text)
        headings.add(slug)
    return headings

def is_template_variable(url: str) -> bool:
    """Check if URL is a template variable or placeholder."""
    return any(pattern.match(url) for pattern in TEMPLATE_PATTERNS)

def is_path_safe(target_path: Path) -> bool:
    """Check if the resolved path is within the repository root."""
    try:
        target_path.relative_to(REPO_ROOT)
        return True
    except ValueError:
        return False

def validate_anchor(anchor: str, content: str, file_path: Path) -> Tuple[bool, str]:
    """Validate an anchor reference against headings in content."""
    try:
        headings = extract_headings(content)
        if anchor not in headings:
            return False, f"Anchor #{anchor} not found in {file_path.relative_to(REPO_ROOT)}"
        return True, ""
    except Exception as e:
        return False, f"Error validating anchor in {file_path.relative_to(REPO_ROOT)}: {str(e)}"

def extract_links(content: str, file_path: Path) -> List[Tuple[str, str, int]]:
    """Extract all markdown links from content.
    
    Returns: List of (link_text, link_url, line_number) tuples
    """
    links = []
    lines = content.split('\n')
    
    # Extract inline links [text](url)
    for line_num, line in enumerate(lines, 1):  # Line numbers start at 1
        for match in INLINE_LINK_PATTERN.finditer(line):
            link_text = match.group(1)
            link_url = match.group(2)
            links.append((link_text, link_url, line_num))
    
    # Extract reference-style links [text][ref]
    references = {}
    for match in REFERENCE_DEF_PATTERN.finditer(content):
        ref_id = match.group(1)
        ref_url = match.group(2).strip()
        references[ref_id] = ref_url
    
    for line_num, line in enumerate(lines, 1):  # Line numbers start at 1
        for match in REFERENCE_LINK_PATTERN.finditer(line):
            link_text = match.group(1)
            ref_id = match.group(2)
            if ref_id in references:
                links.append((link_text, references[ref_id], line_num))
    
    return links

def safe_read_file(file_path: Path) -> Tuple[bool, str]:
    """Safely read a file and return its content.
    
    Returns: (success, content_or_error_message)
    """
    try:
        content = file_path.read_text(encoding='utf-8')
        return True, content
    except (UnicodeDecodeError, IOError, OSError) as e:
        return False, f"Error reading {file_path.relative_to(REPO_ROOT)}: {str(e)}"

def resolve_target_path(file_part: str, source_file: Path) -> Tuple[bool, Path, str]:
    """Resolve and validate target file path.
    
    Returns: (is_valid, resolved_path, error_message)
    """
    try:
        # Resolve relative file path
        if file_part.startswith('/'):
            # Absolute path from repo root
            target_file = REPO_ROOT / file_part.lstrip('/')
        else:
            # Relative path from source file's directory
            target_file = (source_file.parent / file_part).resolve()
        
        # URL decode the path
        target_file = Path(unquote(str(target_file)))
        
        # Security check: ensure path stays within repository
        if not is_path_safe(target_file):
            return False, target_file, f"Path traversal detected: {file_part}"
        
        return True, target_file, ""
    except (ValueError, OSError) as e:
        return False, Path(), f"Invalid path: {file_part} - {str(e)}"

def validate_link(link_url: str, source_file: Path) -> Tuple[bool, str]:
    """Validate a single link.
    
    Returns: (is_valid, error_message)
    """
    # Skip external URLs
    if link_url.startswith(('http://', 'https://', 'mailto:', 'ftp://')):
        return True, ""
    
    # Skip template variables
    if is_template_variable(link_url):
        return True, ""
    
    # Handle anchor-only links (#section)
    if link_url.startswith('#'):
        anchor = link_url[1:]
        success, content = safe_read_file(source_file)
        if not success:
            return False, content  # content contains error message
        return validate_anchor(anchor, content, source_file)
    
    # Handle file links with optional anchors (file.md#section)
    parts = link_url.split('#', 1)
    file_part = parts[0]
    anchor_part = parts[1] if len(parts) > 1 else None
    
    # Skip empty file part with anchor (treated as anchor-only)
    if not file_part and anchor_part:
        success, content = safe_read_file(source_file)
        if not success:
            return False, content  # content contains error message
        return validate_anchor(anchor_part, content, source_file)
    
    # Resolve and validate target path
    is_valid, target_file, error = resolve_target_path(file_part, source_file)
    if not is_valid:
        return False, error
    
    # Check if file exists
    if not target_file.exists():
        try:
            return False, f"File not found: {target_file.relative_to(REPO_ROOT)}"
        except ValueError:
            return False, f"File not found: {target_file}"
    
    # If there's an anchor, validate it
    if anchor_part:
        success, content = safe_read_file(target_file)
        if not success:
            return False, content  # content contains error message
        return validate_anchor(anchor_part, content, target_file)
    
    return True, ""

def find_markdown_files() -> List[Path]:
    """Find all markdown files in the repository."""
    try:
        md_files = []
        for md_file in REPO_ROOT.rglob('*.md'):
            # Skip files in excluded directories
            if any(skip_dir in md_file.parts for skip_dir in SKIP_DIRS):
                continue
            md_files.append(md_file)
        return sorted(md_files)
    except (OSError, IOError) as e:
        print(f"❌ Error scanning directory {REPO_ROOT}: {str(e)}")
        sys.exit(1)

def main():
    """Main function to check all markdown links."""
    print("🔍 Checking markdown links...\n")
    
    md_files = find_markdown_files()
    print(f"Found {len(md_files)} markdown files\n")
    
    total_links = 0
    broken_links = []
    
    for md_file in md_files:
        try:
            success, content = safe_read_file(md_file)
            if not success:
                print(f"❌ {content}")  # content contains error message
                sys.exit(1)
            
            links = extract_links(content, md_file)
            
            for link_text, link_url, line_num in links:
                total_links += 1
                is_valid, error_msg = validate_link(link_url, md_file)
                
                if not is_valid:
                    try:
                        file_path = md_file.relative_to(REPO_ROOT)
                    except ValueError:
                        file_path = md_file
                    
                    broken_links.append({
                        'file': file_path,
                        'line': line_num,
                        'text': link_text,
                        'url': link_url,
                        'error': error_msg
                    })
        
        except Exception as e:
            try:
                file_path = md_file.relative_to(REPO_ROOT)
            except ValueError:
                file_path = md_file
            print(f"❌ Unexpected error processing {file_path}: {str(e)}")
            sys.exit(1)
    
    # Print results
    print(f"✅ Checked {total_links} links in {len(md_files)} files\n")
    
    if broken_links:
        print(f"❌ Found {len(broken_links)} broken links:\n")
        
        current_file = None
        for link in broken_links:
            if link['file'] != current_file:
                current_file = link['file']
                print(f"\n📄 {current_file}")
            
            print(f"  Line {link['line']}: [{link['text']}]({link['url']})")
            print(f"    Error: {link['error']}")
        
        print(f"\n❌ Validation failed: {len(broken_links)} broken links found")
        sys.exit(1)
    
    print("✅ All links are valid!")
    sys.exit(0)

if __name__ == '__main__':
    main()
