import pytest
from fastapi import UploadFile
import io
from typing import Dict

pytestmark = pytest.mark.asyncio


async def test_resume_upload_pdf(
    test_client, mock_user, mock_auth_headers, test_db, redis_test
):
    """Test PDF resume upload and processing"""
    # Create mock PDF content
    pdf_content = b"%PDF-1.4\nMock PDF with climate experience"
    pdf_file = io.BytesIO(pdf_content)

    # Create form data with file
    files = {"file": ("test_resume.pdf", pdf_file, "application/pdf")}

    # Upload resume
    response = test_client.post(
        "/api/v1/resumes/upload", files=files, headers=mock_auth_headers
    )

    assert response.status_code == 201
    data = response.json()

    # Verify response structure
    assert "resume_id" in data
    assert "status" in data
    assert data["status"] == "processed"

    # Verify analysis results
    assert "analysis" in data
    analysis = data["analysis"]
    assert "climate_score" in analysis
    assert "skills" in analysis
    assert isinstance(analysis["skills"], list)

    # Verify database entry
    result = (
        await test_db.table("test_resumes")
        .select("*")
        .eq("id", data["resume_id"])
        .execute()
    )
    assert len(result.data) == 1
    resume = result.data[0]

    assert resume["user_id"] == mock_user["id"]
    assert resume["file_name"] == "test_resume.pdf"
    assert resume["processing_status"] == "completed"
    assert resume["climate_relevance_score"] is not None


async def test_resume_upload_docx(
    test_client, mock_user, mock_auth_headers, test_db, redis_test
):
    """Test DOCX resume upload and processing"""
    # Create mock DOCX content
    docx_content = b"Mock DOCX with sustainability skills"
    docx_file = io.BytesIO(docx_content)

    # Create form data with file
    files = {
        "file": (
            "test_resume.docx",
            docx_file,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    }

    # Upload resume
    response = test_client.post(
        "/api/v1/resumes/upload", files=files, headers=mock_auth_headers
    )

    assert response.status_code == 201
    data = response.json()

    # Verify response structure
    assert "resume_id" in data
    assert "status" in data
    assert data["status"] == "processed"

    # Verify database entry
    result = (
        await test_db.table("test_resumes")
        .select("*")
        .eq("id", data["resume_id"])
        .execute()
    )
    assert len(result.data) == 1
    resume = result.data[0]

    assert resume["user_id"] == mock_user["id"]
    assert resume["file_name"] == "test_resume.docx"
    assert resume["processing_status"] == "completed"


async def test_resume_upload_invalid_file(test_client, mock_auth_headers):
    """Test upload with invalid file type"""
    # Create invalid file
    invalid_content = b"Invalid file content"
    invalid_file = io.BytesIO(invalid_content)

    # Create form data with file
    files = {"file": ("test.txt", invalid_file, "text/plain")}

    # Upload resume
    response = test_client.post(
        "/api/v1/resumes/upload", files=files, headers=mock_auth_headers
    )

    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Only PDF and DOCX files are supported" in data["detail"]


async def test_resume_upload_no_auth(test_client):
    """Test upload without authentication"""
    # Create mock file
    content = b"Test content"
    file = io.BytesIO(content)

    # Create form data with file
    files = {"file": ("test.pdf", file, "application/pdf")}

    # Upload resume without auth headers
    response = test_client.post("/api/v1/resumes/upload", files=files)

    assert response.status_code == 401


async def test_resume_processing_failure(
    test_client, mock_auth_headers, test_db, monkeypatch
):
    """Test handling of processing failures"""

    # Mock processing to fail
    async def mock_process(*args, **kwargs):
        raise Exception("Processing failed")

    monkeypatch.setattr(
        "backend.tools.resume.process_resume.ResumeProcessor.execute", mock_process
    )

    # Create mock file
    content = b"Test content"
    file = io.BytesIO(content)

    # Create form data with file
    files = {"file": ("test.pdf", file, "application/pdf")}

    # Upload resume
    response = test_client.post(
        "/api/v1/resumes/upload", files=files, headers=mock_auth_headers
    )

    assert response.status_code == 500
    data = response.json()
    assert "error" in data
    assert data["status"] == "failed"
