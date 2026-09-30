from abc import ABC, abstractmethod
from typing import Any, Dict, List

class CameraStreamProvider(ABC):
    @abstractmethod
    async def get_frame(self, camera_id: str) -> Any:
        """Fetch latest raw video frame or stream buffer from edge camera node."""
        pass

class MockCameraProvider(CameraStreamProvider):
    """Simulated camera perception ingestion provider."""
    def __init__(self):
        self.active_streams = {}

    async def get_frame(self, camera_id: str) -> Dict[str, Any]:
        return {
            "camera_id": camera_id,
            "status": "ONLINE",
            "fps": 30,
            "timestamp": "2026-09-29T23:30:00Z",
            "is_simulation": True
        }

class RTSPCameraProvider(CameraStreamProvider):
    """Production RTSP / ONVIF IP camera stream ingestor."""
    def __init__(self, rtsp_url: str):
        self.rtsp_url = rtsp_url

    async def get_frame(self, camera_id: str) -> Any:
        # Connect to OpenCV / FFmpeg RTSP stream
        pass

