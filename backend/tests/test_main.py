import pytest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('GROQ_API_KEY', 'test_key')
os.environ.setdefault('DATABASE_URL', 'sqlite+aiosqlite:///./test_shadowcounsel.db')
os.environ.setdefault('CORS_ORIGINS', 'http://localhost:3000')

from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_health_check():
    """Test the health check endpoint returns healthy status."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/health')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'ShadowCounsel'
    assert data['version'] == '0.1.0'


@pytest.mark.asyncio
async def test_upload_invalid_file_type():
    """Test that unsupported file types are rejected."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        files = {'file': ('test.exe', b'malicious content', 'application/octet-stream')}
        response = await client.post('/api/upload', files=files)
    assert response.status_code == 400
    assert 'Unsupported file type' in response.json()['detail']


@pytest.mark.asyncio
async def test_upload_missing_file():
    """Test that missing file returns validation error."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        response = await client.post('/api/upload')
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_session_not_found():
    """Test that requesting non-existent session returns 404."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/session/nonexistent-session-id')
    assert response.status_code == 404
    assert 'not found' in response.json()['detail'].lower()


@pytest.mark.asyncio
async def test_whatif_missing_params():
    """Test that whatif endpoint requires session_id and scenario."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        response = await client.post('/api/whatif', json={})
    assert response.status_code == 400
    assert 'required' in response.json()['detail'].lower()


@pytest.mark.asyncio
async def test_disclaimer_endpoint():
    """Test that the disclaimer endpoint returns correct legal disclaimer."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/disclaimer')
    assert response.status_code == 200
    data = response.json()
    assert data['is_legal_advice'] == False
    assert 'dlsa_link' in data
    assert 'text' in data


@pytest.mark.asyncio
async def test_upload_valid_pdf():
    """Test that a valid PDF file is accepted."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        pdf_content = b'%PDF-1.4 1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj xref 0 4 trailer<</Size 4/Root 1 0 R>>startxref 0 %%EOF'
        files = {'file': ('test_contract.pdf', pdf_content, 'application/pdf')}
        response = await client.post('/api/upload', files=files)
    assert response.status_code == 200
    data = response.json()
    assert 'session_id' in data
    assert data['status'] == 'uploaded'


@pytest.mark.asyncio
async def test_negotiation_not_found():
    """Test that negotiation pack for unknown session returns 404."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        response = await client.get('/api/negotiation/fake-session-id')
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_upload_file_size_limit():
    """Test that files larger than 10MB are rejected."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        large_content = b'%PDF-1.4 ' + b'A' * (11 * 1024 * 1024)
        files = {'file': ('large.pdf', large_content, 'application/pdf')}
        response = await client.post('/api/upload', files=files)
    assert response.status_code == 413


@pytest.mark.asyncio
async def test_whatif_scenario_too_long():
    """Test that overly long whatif scenarios are rejected."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as client:
        response = await client.post('/api/whatif', json={
            'session_id': 'test-session',
            'scenario': 'A' * 2001
        })
    assert response.status_code == 400
