'''
Author: Mr.Car
Date: 2025-03-21 14:30:00
'''
import pytest
import os
from dotenv import load_dotenv
from weather_server.server import server, CityNameConverter

load_dotenv()

@pytest.fixture
def weather_server():
    """获取天气服务器实例"""
    return server

@pytest.fixture
def city_converter():
    """创建城市名称转换器实例"""
    return CityNameConverter()

@pytest.fixture(autouse=True)
def check_api_key():
    """确保 API key 存在"""
    api_key = os.getenv("OPENWEATHERMAP_API_KEY")
    if not api_key:
        pytest.skip("Missing OPENWEATHERMAP_API_KEY environment variable") 