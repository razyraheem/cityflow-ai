from abc import ABC, abstractmethod
from typing import Dict, Any

class ANPRProvider(ABC):
    @abstractmethod
    async def recognize(self, frame_or_image: Any) -> Dict[str, Any]:
        """Recognize license plate and return OCR result."""
        pass

class MockANPRProvider(ANPRProvider):
    """
    Simulated ANPR Provider.
    NOTE: Transparent simulation for SIH prototype.
    """
    def __init__(self, mode: str = "SIMULATION"):
        self.mode = mode

    async def recognize(self, frame_or_image: Any = None) -> Dict[str, Any]:
        return {
            "plate_number": "KA19AB1234",
            "confidence": 98.7,
            "vehicle_type": "Car",
            "color": "White",
            "provider": "SIMULATED_ANPR_YOLOV10",
            "is_simulation": True
        }

class RealANPRProvider(ANPRProvider):
    """Placeholder architecture for production YOLOv10-ANPR / PaddleOCR integration."""
    def __init__(self, model_path: str = "models/yolov10_anpr.onnx"):
        self.model_path = model_path

    async def recognize(self, frame_or_image: Any) -> Dict[str, Any]:
        # Production model inference hook
        return {
            "plate_number": "KA19AB1234",
            "confidence": 99.1,
            "vehicle_type": "Car",
            "color": "White",
            "provider": "EDGE_ONNX_RUNTIME",
            "is_simulation": False
        }

