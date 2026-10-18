"""Exercise the real parser, including unsupported UI dimensions."""
import pytest
from fastapi import HTTPException
from main import validate_aspect_ratio, _is_creation_allowed_ratio


@pytest.mark.parametrize("value,ratio,size", [
    ("square", "1:1", (1024, 1024)),
    ("landscape", "16:9", (1344, 768)),
    ("story/reel", "9:16", (768, 1344)),
    ("portrait", "3:4", (896, 1152)),
    ("ultrawide", "21:9", (1536, 640)),
    (" 16X9 ", "16:9", (1344, 768)),
    ("9-16", "9:16", (768, 1344)),
])
def test_supported_presets(value, ratio, size):
    assert validate_aspect_ratio(value) == (ratio, size)
    assert _is_creation_allowed_ratio(value)


@pytest.mark.parametrize("value", ["", "4:3", "288:608", "1120x360", "OOH_792x216", "0:1", "16:0", "custom"])
def test_unsupported_presets(value):
    with pytest.raises(HTTPException) as error:
        validate_aspect_ratio(value)
    assert error.value.status_code == 400
    assert not _is_creation_allowed_ratio(value)
