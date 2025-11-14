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

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Set
from urllib.parse import unquote

# Repository root
REPO_ROOT = Path(__file__).parent.parent.absolute()

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
    # This preserves Cyrillic and other unicode characters
    heading = re.sub(r'[^\w-]', '', heading, flags=re.UNICODE)
    # Remove leading/trailing hyphens
    heading = heading.strip('-')
    return heading

def extract_headings(content: str) -> Set[str]:
    """Extract all headings from markdown content."""
    headings = set()
    for match in re.finditer(r'^#+\s+(.+)$', content, re.MULTILINE):
        heading_text = match.group(1).strip()
        slug = slugify_heading(heading_text)
        headings.add(slug)
    return headings

def is_template_variable(url: str) -> bool:
    """Check if URL is a template variable or placeholder."""
    patterns = [
        r'\{\{.*\}\}',  # {{ variable }}
        r'\$\{.*\}',    # ${variable}
        r'^\.\.\.+$',   # ... (ellipsis placeholder)
    ]
    return any(re.match(pattern, url) for pattern in patterns)

def extract_links(content: str, file_path: Path) -> List[Tuple[str, str, int]]:
    """Extract all markdown links from content.
    
    Returns: List of (link_text, link_url, line_number) tuples
    """
    links = []
    lines = content.split('\n')
    
    # Extract inline links [text](url)
    for i, line in enumerate(lines, 1):
        for match in re.finditer(r'\[([^\]]+)\]\(([^)]+)\)', line):
            link_text = match.group(1)
            link_url = match.group(2)
            links.append((link_text, link_url, i))
    
    # Extract reference-style links [text][ref]
    references = {}
    for match in re.finditer(r'^\[([^\]]+)\]:\s*(.+)$', content, re.MULTILINE):
        ref_id = match.group(1)
        ref_url = match.group(2).strip()
        references[ref_id] = ref_url
    
    for i, line in enumerate(lines, 1):
        for match in re.finditer(r'\[([^\]]+)\]\[([^\]]+)\]', line):
            link_text = match.group(1)
            ref_id = match.group(2)
            if ref_id in references:
                links.append((link_text, references[ref_id], i))
    
    return links

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
        content = source_file.read_text(encoding='utf-8')
        headings = extract_headings(content)
        if anchor not in headings:
            return False, f"Anchor #{anchor} not found in {source_file}"
        return True, ""
    
    # Handle file links with optional anchors (file.md#section)
    parts = link_url.split('#', 1)
    file_part = parts[0]
    anchor_part = parts[1] if len(parts) > 1 else None
    
    # Skip empty file part with anchor (treated as anchor-only)
    if not file_part and anchor_part:
        content = source_file.read_text(encoding='utf-8')
        headings = extract_headings(content)
        if anchor_part not in headings:
            return False, f"Anchor #{anchor_part} not found in {source_file}"
        return True, ""
    
    # Resolve relative file path
    if file_part.startswith('/'):
        # Absolute path from repo root
        target_file = REPO_ROOT / file_part.lstrip('/')
    else:
        # Relative path from source file's directory
        target_file = (source_file.parent / file_part).resolve()
    
    # URL decode the path
    target_file = Path(unquote(str(target_file)))
    
    # Check if file exists
    if not target_file.exists():
        return False, f"File not found: {target_file.relative_to(REPO_ROOT)}"
    
    # If there's an anchor, validate it
    if anchor_part:
        try:
            content = target_file.read_text(encoding='utf-8')
            headings = extract_headings(content)
            if anchor_part not in headings:
                return False, f"Anchor #{anchor_part} not found in {target_file.relative_to(REPO_ROOT)}"
        except Exception as e:
            return False, f"Error reading {target_file.relative_to(REPO_ROOT)}: {str(e)}"
    
    return True, ""

def find_markdown_files() -> List[Path]:
    """Find all markdown files in the repository."""
    md_files = []
    
    for root, dirs, files in os.walk(REPO_ROOT):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        
        for file in files:
            if file.endswith('.md'):
                md_files.append(Path(root) / file)
    
    return sorted(md_files)

def main():
    """Main function to check all markdown links."""
    print("🔍 Checking markdown links...\n")
    
    md_files = find_markdown_files()
    print(f"Found {len(md_files)} markdown files\n")
    
    total_links = 0
    broken_links = []
    
    for md_file in md_files:
        try:
            content = md_file.read_text(encoding='utf-8')
            links = extract_links(content, md_file)
            
            for link_text, link_url, line_num in links:
                total_links += 1
                is_valid, error_msg = validate_link(link_url, md_file)
                
                if not is_valid:
                    broken_links.append({
                        'file': md_file.relative_to(REPO_ROOT),
                        'line': line_num,
                        'text': link_text,
                        'url': link_url,
                        'error': error_msg
                    })
        
        except Exception as e:
            print(f"❌ Error processing {md_file.relative_to(REPO_ROOT)}: {str(e)}")
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
