#!/usr/bin/env python3
"""
Chat Endpoints Cleanup Script - Climate Economy Assistant

This script analyzes and consolidates duplicate chat endpoints,
removing legacy implementations while preserving functionality.

Usage:
    python scripts/cleanup_chat_endpoints.py
"""

import os
import shutil
from datetime import datetime

def log_action(message):
    """Log cleanup actions with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def backup_file(file_path):
    """Create backup of file before deletion"""
    if os.path.exists(file_path):
        backup_path = f"{file_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        if os.path.isdir(file_path):
            shutil.copytree(file_path, backup_path)
        else:
            shutil.copy2(file_path, backup_path)
        log_action(f"   📋 Backed up to: {backup_path}")
        return backup_path
    return None

def analyze_chat_endpoints():
    """Analyze all chat-related endpoints"""
    log_action("🔍 Analyzing Chat Endpoints")
    
    chat_endpoints = {
        "legacy": {
            "app/api/chat/route.ts": {
                "purpose": "Legacy proxy to v1/interactive-chat",
                "status": "redundant",
                "action": "remove"
            },
            "app/api/chat/climate-advisory/": {
                "purpose": "Old climate advisory chat",
                "status": "legacy",
                "action": "remove"
            }
        },
        "testing": {
            "app/api/v1/test-chat/route.ts": {
                "purpose": "Testing endpoint without auth",
                "status": "useful_for_dev",
                "action": "keep_but_document"
            }
        },
        "production": {
            "app/api/v1/interactive-chat/route.ts": {
                "purpose": "Main authenticated chat endpoint",
                "status": "primary",
                "action": "keep"
            },
            "app/api/v1/supervisor-chat/route.ts": {
                "purpose": "LangGraph supervisor workflow",
                "status": "specialized",
                "action": "keep"
            }
        }
    }
    
    # Print analysis
    for category, endpoints in chat_endpoints.items():
        log_action(f"📂 {category.upper()} Endpoints:")
        for endpoint, info in endpoints.items():
            exists = "✅" if os.path.exists(endpoint) else "❌"
            log_action(f"   {exists} {endpoint}")
            log_action(f"      Purpose: {info['purpose']}")
            log_action(f"      Action: {info['action']}")
    
    return chat_endpoints

def remove_legacy_endpoints():
    """Remove legacy chat endpoints"""
    log_action("🧹 Removing Legacy Endpoints")
    
    legacy_endpoints = [
        "app/api/chat/route.ts",
        "app/api/chat/climate-advisory/"
    ]
    
    removed_files = []
    
    for endpoint in legacy_endpoints:
        if os.path.exists(endpoint):
            log_action(f"🗑️ Removing: {endpoint}")
            backup_path = backup_file(endpoint)
            
            if os.path.isdir(endpoint):
                shutil.rmtree(endpoint)
            else:
                os.remove(endpoint)
            
            removed_files.append({
                "path": endpoint,
                "backup": backup_path,
                "type": "directory" if endpoint.endswith('/') else "file"
            })
            log_action(f"   ✅ Removed successfully")
        else:
            log_action(f"   ⚠️ Not found: {endpoint}")
    
    return removed_files

def update_documentation():
    """Create documentation for the cleaned up endpoints"""
    log_action("📝 Creating Endpoint Documentation")
    
    docs_content = """# Chat Endpoints Documentation - Climate Economy Assistant

## Current Active Endpoints

### 🎯 Primary Chat Endpoint
**`/api/v1/interactive-chat`**
- **Purpose**: Main authenticated chat interface
- **Authentication**: Required (Supabase JWT)
- **Features**: Full climate career assistance, resume analysis, job search
- **Status**: Production ready

### 🧠 Supervisor Chat Endpoint  
**`/api/v1/supervisor-chat`**
- **Purpose**: LangGraph 2025 supervisor workflow with user steering
- **Authentication**: Required (Supabase JWT)
- **Features**: Multi-specialist routing, streaming responses, workflow management
- **Status**: Production ready
- **Special**: Advanced LangGraph integration with user steering

### 🧪 Test Chat Endpoint
**`/api/v1/test-chat`**
- **Purpose**: Testing backend integration without authentication
- **Authentication**: None (testing only)
- **Features**: Basic chat functionality for development testing
- **Status**: Development only - DO NOT USE IN PRODUCTION

## Removed Legacy Endpoints

### ❌ Removed in Cleanup
- **`/api/chat`**: Legacy proxy to v1/interactive-chat (redundant)
- **`/api/chat/climate-advisory/`**: Old climate advisory implementation

## Environment Variables Used

These endpoints use the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side)
- `PYTHON_BACKEND_URL`: Python backend URL (default: http://localhost:8000)

## Usage Examples

### Interactive Chat (Primary)
```javascript
const response = await fetch('/api/v1/interactive-chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "I'm interested in renewable energy careers",
    conversation_id: "unique-conversation-id"
  })
});
```

### Supervisor Chat (Advanced)
```javascript
const response = await fetch('/api/v1/supervisor-chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "Help me plan my climate career path",
    conversation_id: "unique-conversation-id",
    stream: true,
    user_journey_stage: "discovery"
  })
});
```

## Migration Notes

If you were using the legacy `/api/chat` endpoint:
1. Replace calls with `/api/v1/interactive-chat`
2. Update request format to match new schema
3. Ensure proper authentication headers are included

## Testing

Use the `/api/v1/test-chat` endpoint for development testing:
- No authentication required
- Returns test responses
- Helps verify backend connectivity

---
*Last updated: """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "*"
    
    docs_path = "CHAT_ENDPOINTS.md"
    with open(docs_path, 'w') as f:
        f.write(docs_content)
    
    log_action(f"📄 Documentation created: {docs_path}")
    return docs_path

def cleanup_empty_directories():
    """Remove empty directories left after cleanup"""
    log_action("🧹 Cleaning Up Empty Directories")
    
    potential_empty_dirs = [
        "app/api/chat"
    ]
    
    removed_dirs = []
    for dir_path in potential_empty_dirs:
        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            try:
                # Check if directory is empty
                if not os.listdir(dir_path):
                    os.rmdir(dir_path)
                    removed_dirs.append(dir_path)
                    log_action(f"   🗑️ Removed empty directory: {dir_path}")
                else:
                    log_action(f"   ⚠️ Directory not empty: {dir_path}")
            except OSError as e:
                log_action(f"   ❌ Failed to remove {dir_path}: {e}")
    
    return removed_dirs

def main():
    """Main cleanup function"""
    log_action("🚀 Starting Chat Endpoints Cleanup")
    print("=" * 60)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Analyze current state
    endpoints_analysis = analyze_chat_endpoints()
    
    print("\n" + "=" * 60)
    
    # Remove legacy endpoints
    removed_files = remove_legacy_endpoints()
    
    print("\n" + "=" * 60)
    
    # Clean up empty directories
    removed_dirs = cleanup_empty_directories()
    
    print("\n" + "=" * 60)
    
    # Create documentation
    docs_path = update_documentation()
    
    # Summary
    print(f"\n📊 CLEANUP SUMMARY")
    print("=" * 60)
    print(f"🗑️ Files Removed: {len(removed_files)}")
    for file_info in removed_files:
        print(f"   • {file_info['path']} ({file_info['type']})")
    
    print(f"📁 Directories Removed: {len(removed_dirs)}")
    for dir_path in removed_dirs:
        print(f"   • {dir_path}")
    
    print(f"📄 Documentation: {docs_path}")
    
    print(f"\n✅ Chat endpoints cleanup completed!")
    print(f"\n🎯 Active Endpoints:")
    print(f"   • /api/v1/interactive-chat (primary)")
    print(f"   • /api/v1/supervisor-chat (advanced)")
    print(f"   • /api/v1/test-chat (testing only)")
    
    print(f"\n⚠️ Backup files created for safety:")
    for file_info in removed_files:
        if file_info['backup']:
            print(f"   • {file_info['backup']}")

if __name__ == "__main__":
    main() 